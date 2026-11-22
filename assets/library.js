/* SQL Lab – bibliothèque d'exercices.
 *  - exercices intégrés (exercices/<id>/questions.json + db.sqlite)
 *  - exercices personnels d'un enseignant (zip : exercice.json + db.sqlite ou db.sql),
 *    conservés dans le navigateur (IndexedDB : la base peut peser plusieurs Mo)
 *  - lecture / écriture des zip (fflate)
 */
(function (global) {
  "use strict";

  const FORMAT = "sql-lab-exercice/1";
  const MAX_DB = 100 * 1024 * 1024;  // refus au-delà
  const WARN_DB = 20 * 1024 * 1024;  // avertissement au-delà
  const SQLITE_MAGIC = "SQLite format 3\u0000";

  // ----------------------------------------------------------- IndexedDB
  let dbPromise = null;
  function idb() {
    if (!dbPromise) {
      dbPromise = new Promise((resolve, reject) => {
        if (!global.indexedDB) { reject(new Error("stockage du navigateur indisponible")); return; }
        const req = indexedDB.open("sqllab", 1);
        req.onupgradeneeded = () => req.result.createObjectStore("exercices", { keyPath: "id" });
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
    }
    return dbPromise;
  }
  async function tx(mode, fn) {
    const db = await idb();
    return new Promise((resolve, reject) => {
      const t = db.transaction("exercices", mode);
      const r = fn(t.objectStore("exercices"));
      t.oncomplete = () => resolve(r && "result" in r ? r.result : undefined);
      t.onerror = () => reject(t.error);
    });
  }
  const store = {
    all: () => tx("readonly", (s) => s.getAll()).catch(() => []),
    get: (id) => tx("readonly", (s) => s.get(id)),
    put: (rec) => tx("readwrite", (s) => s.put(rec)),
    del: (id) => tx("readwrite", (s) => s.delete(id)),
  };

  // ----------------------------------------------------------- utilitaires
  function slug(s) {
    return String(s || "exercice").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
      .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "exercice";
  }
  const todayIso = () => new Date().toISOString().slice(0, 10);
  const isZip = (u8) => u8.length > 3 && u8[0] === 0x50 && u8[1] === 0x4b && u8[2] === 0x03 && u8[3] === 0x04;
  const isSqlite = (u8) => u8.length > 100 && new TextDecoder().decode(u8.subarray(0, 16)) === SQLITE_MAGIC;
  const text = (u8) => new TextDecoder().decode(u8).replace(/^﻿/, "");

  /** Métadonnées d'exercice propres (les questions passent par SQLPacks) */
  function normalizeExercise(raw, fallbackTitle) {
    raw = raw && typeof raw === "object" && !Array.isArray(raw) ? raw : {};
    const titre = String(raw.titre || fallbackTitle || "Ma base").slice(0, 120).trim();
    let id = String(raw.id || "").replace(/[^\w-]/g, "").slice(0, 50);
    if (!id.startsWith("perso-")) id = "perso-" + (id ? slug(id) : slug(titre));
    const ex = {
      format: FORMAT,
      id,
      titre,
      contexte: String(raw.contexte || "").slice(0, 5000),
      aujourdhui: /^\d{4}-\d{2}-\d{2}$/.test(raw.aujourdhui || "") ? raw.aujourdhui
        : (global.SQLCompat && SQLCompat.frToIso(raw.aujourdhui || "")) || todayIso(),
    };
    if (raw.source) ex.source = String(raw.source).slice(0, 500);
    if (raw.auteur) ex.auteur = String(raw.auteur).slice(0, 120);
    if (raw.schemaGrid && typeof raw.schemaGrid === "object") {
      ex.schemaGrid = {};
      for (const [t, v] of Object.entries(raw.schemaGrid)) {
        if (Array.isArray(v) && v.length === 2 && v.every((n) => Number.isInteger(n) && n >= 0 && n < 20)) ex.schemaGrid[t] = v;
      }
    }
    const n = global.SQLPacks.normalizePack({ questions: Array.isArray(raw.questions) ? raw.questions : [] });
    ex.questions = n.pack ? n.pack.questions : [];
    return ex;
  }

  /** Contrôles de la base : renvoie { errors, warnings } */
  function analyzeDb(SQL, bytes) {
    const errors = [], warnings = [];
    if (bytes.length > MAX_DB) { errors.push(`Base trop volumineuse (${Math.round(bytes.length / 1048576)} Mo, maximum 100 Mo).`); return { errors, warnings }; }
    if (bytes.length > WARN_DB) warnings.push(`Base volumineuse (${Math.round(bytes.length / 1048576)} Mo) : l'exécution des requêtes sera plus lente.`);
    let db;
    try {
      db = new SQL.Database(bytes);
      const tables = db.exec("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
      const names = tables[0] ? tables[0].values.map((r) => r[0]) : [];
      if (!names.length) { errors.push("La base ne contient aucune table."); return { errors, warnings }; }
      let fk = 0;
      for (const t of names) {
        fk += (db.exec(`PRAGMA foreign_key_list("${t}")`)[0] || { values: [] }).values.length;
        const cols = db.exec(`PRAGMA table_info("${t}")`)[0].values;
        for (const c of cols) {
          if (!/date/i.test(c[1]) && !/DATE/i.test(c[2] || "")) continue;
          const bad = db.exec(`SELECT COUNT(*) FROM "${t}" WHERE "${c[1]}" GLOB '[0-9]*/[0-9]*/[0-9][0-9][0-9][0-9]*'`)[0].values[0][0];
          if (bad) warnings.push(`${t}.${c[1]} : ${bad} date(s) au format jj/mm/aaaa. Stockez les dates en AAAA-MM-JJ pour que YEAR(), BETWEEN et les tris fonctionnent.`);
        }
      }
      if (!fk && names.length > 1) warnings.push("Aucune clé étrangère déclarée (REFERENCES) : le diagramme n'affichera pas de flèches entre les tables.");
    } catch (e) {
      errors.push("Base illisible : " + e.message);
    } finally {
      if (db) db.close();
    }
    return { errors, warnings };
  }

  /** Base SQLite à partir d'un script SQL (CREATE TABLE + INSERT) */
  function sqlToDb(SQL, script) {
    const db = new SQL.Database();
    try {
      db.exec(script);
      return db.export();
    } finally {
      db.close();
    }
  }

  /**
   * Lit un fichier déposé par l'enseignant : .zip (exercice complet), .sqlite/.db ou .sql (base seule).
   * Renvoie { exercise, bytes, errors, warnings }.
   */
  function readExerciseFile(SQL, u8, fileName) {
    const errors = [], warnings = [];
    let meta = null, bytes = null;
    const base = String(fileName || "").replace(/\.[^.]+$/, "");
    try {
      if (isZip(u8)) {
        const files = global.fflate.unzipSync(u8);
        const entries = Object.entries(files).filter(([n]) => !n.endsWith("/") && !/(^|\/)(__MACOSX|\.)/.test(n));
        const find = (re) => entries.find(([n]) => re.test(n.split("/").pop()));
        const j = find(/^(exercice|questions)\.json$/i) || find(/\.json$/i);
        if (j) meta = JSON.parse(text(j[1]));
        else warnings.push("Pas de fichier exercice.json dans le zip : exercice créé sans questions.");
        const dbf = find(/\.(sqlite3?|db)$/i);
        const sqlf = find(/\.sql$/i);
        if (dbf) bytes = dbf[1];
        else if (sqlf) bytes = sqlToDb(SQL, text(sqlf[1]));
        else errors.push("Le zip ne contient ni base .sqlite ni script .sql.");
      } else if (isSqlite(u8)) {
        bytes = u8;
      } else {
        bytes = sqlToDb(SQL, text(u8)); // script SQL
      }
    } catch (e) {
      errors.push("Fichier illisible : " + e.message);
    }
    if (bytes && !isSqlite(bytes)) errors.push("Le fichier de base n'est pas une base SQLite valide.");
    if (errors.length) return { exercise: null, bytes: null, errors, warnings };
    const a = analyzeDb(SQL, bytes);
    errors.push(...a.errors);
    warnings.push(...a.warnings);
    const exercise = normalizeExercise(meta, (meta && meta.titre) || base);
    return { exercise, bytes, errors, warnings };
  }

  /** Zip d'un exercice complet (à redistribuer ou à réimporter) */
  function exerciseZip(exercise, bytes) {
    const ff = global.fflate;
    const ex = { ...exercise, format: FORMAT };
    const lisezmoi = [
      `Exercice SQL Lab : ${ex.titre}`,
      "",
      "Contenu :",
      "- exercice.json : contexte, date du jour simulée et questions (format sql-lab-exercice/1)",
      "- db.sqlite : la base de données",
      "",
      "Pour l'utiliser : dans SQL Lab, menu « Importer un fichier », choisir ce zip.",
    ].join("\n");
    return ff.zipSync({
      "exercice.json": ff.strToU8(JSON.stringify(ex, null, 2)),
      "db.sqlite": [bytes, { level: 6 }],
      "LISEZMOI.txt": ff.strToU8(lisezmoi),
    }, { level: 6 });
  }

  // ----------------------------------------------------------- accès unifié
  /** Liste : exercices intégrés puis personnels */
  async function list(catalogue) {
    const perso = await store.all();
    return [
      ...catalogue.map((e) => ({ id: e.id, titre: e.titre, kind: "integre" })),
      ...perso.map((p) => ({ id: p.id, titre: p.exercise.titre, kind: "perso" })),
    ];
  }

  /** Charge un exercice : { ex, bytes, kind } */
  async function load(id, catalogue) {
    if (catalogue.some((e) => e.id === id)) {
      const base = `exercices/${id}/`;
      const [ex, buf] = await Promise.all([
        fetch(base + "questions.json").then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); }),
        fetch(base + "db.sqlite").then((r) => { if (!r.ok) throw new Error(r.status); return r.arrayBuffer(); }),
      ]);
      return { ex, bytes: new Uint8Array(buf), kind: "integre" };
    }
    const rec = await store.get(id);
    if (!rec) throw new Error("exercice introuvable dans ce navigateur");
    return { ex: JSON.parse(JSON.stringify(rec.exercise)), bytes: rec.db, kind: "perso" };
  }

  async function save(exercise, bytes) {
    await store.put({ id: exercise.id, exercise, db: bytes, savedAt: new Date().toISOString() });
  }

  const api = { FORMAT, store, list, load, save, readExerciseFile, normalizeExercise, analyzeDb, exerciseZip, isZip, slug };
  global.SQLLibrary = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
