/* SQL Lab – bibliothèque d'exercices.
 *  - exercices intégrés (exercices/<id>/questions.json + db.sqlite)
 *  - exercices personnels d'un enseignant (zip : exercice.json + db.sqlite ou db.sql),
 *    conservés dans le navigateur (IndexedDB : la base peut peser plusieurs Mo)
 *  - lecture / écriture des zip (fflate)
 */
(function (global) {
  "use strict";
  const I18N = global.I18N || { lang: "fr", add() {}, t: (s, v) => (v ? s.replace(/\{(\w+)\}/g, (m, k) => (v[k] !== undefined ? v[k] : m)) : s), n: (c, a, b, v) => (c > 1 ? b : a).replace(/\{(\w+)\}/g, (m, k) => (k === "n" ? c : v && v[k] !== undefined ? v[k] : m)) };
  const tr = I18N.t, trn = I18N.n;
  I18N.add({
    "Inspiré du sujet DCG UE8 session {a}. Données entièrement fictives.": "Inspired by the DCG UE8 exam, {a} session. Entirely fictitious data.",
    "Inspiré du sujet DCG UE8 session {a}, dossier {d}. Données entièrement fictives.": "Inspired by the DCG UE8 exam, {a} session, part {d}. Entirely fictitious data.",
    "Inspiré du sujet DCG UE8 session {a}, dossiers {d}. Données entièrement fictives.": "Inspired by the DCG UE8 exam, {a} session, parts {d}. Entirely fictitious data.",
    "Source : {s}": "Source: {s}",
    "stockage du navigateur indisponible": "browser storage unavailable",
    "Ma base": "My database",
    "Base trop volumineuse ({n} Mo, maximum 100 Mo).": "Database too large ({n} MB, maximum 100 MB).",
    "Base volumineuse ({n} Mo) : l'exécution des requêtes sera plus lente.": "Large database ({n} MB): queries will run more slowly.",
    "La base ne contient aucune table.": "The database contains no tables.",
    "{col} : {n} date(s) au format jj/mm/aaaa. Stockez les dates en AAAA-MM-JJ pour que YEAR(), BETWEEN et les tris fonctionnent.": "{col}: {n} date(s) in dd/mm/yyyy format. Store dates as YYYY-MM-DD so that YEAR(), BETWEEN and sorting work.",
    "Aucune clé étrangère déclarée (REFERENCES) : le diagramme n'affichera pas de flèches entre les tables.": "No foreign keys declared (REFERENCES): the diagram will not show arrows between tables.",
    "Base illisible : ": "Unreadable database: ",
    "Pas de fichier exercice.json dans le zip : exercice créé sans questions.": "No exercice.json file in the zip: exercise created without questions.",
    "Le zip ne contient ni base .sqlite ni script .sql.": "The zip contains neither a .sqlite database nor a .sql script.",
    "Fichier illisible : ": "Unreadable file: ",
    "Le fichier de base n'est pas une base SQLite valide.": "The database file is not a valid SQLite database.",
    "Exercice SQL Lab : {titre}": "SQL Lab exercise: {titre}",
    "Contenu :": "Contents:",
    "- exercice.json : contexte, date du jour simulée et questions (format sql-lab-exercice/1)": "- exercice.json: context, simulated current date and questions (format sql-lab-exercice/1)",
    "- db.sqlite : la base de données": "- db.sqlite: the database",
    "Pour l'utiliser : dans SQL Lab, menu « Importer un fichier », choisir ce zip.": "To use it: in SQL Lab, click “Import a file” and choose this zip.",
    "exercice introuvable dans ce navigateur": "exercise not found in this browser",
  });

  const FORMAT = "sql-lab-exercice/1";
  const MAX_DB = 100 * 1024 * 1024;  // refus au-delà
  const WARN_DB = 20 * 1024 * 1024;  // avertissement au-delà
  const SQLITE_MAGIC = "SQLite format 3\u0000";

  // ----------------------------------------------------------- IndexedDB
  let dbPromise = null;
  function idb() {
    if (!dbPromise) {
      dbPromise = new Promise((resolve, reject) => {
        if (!global.indexedDB) { reject(new Error(tr("stockage du navigateur indisponible"))); return; }
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
    const titre = String(raw.titre || fallbackTitle || tr("Ma base")).slice(0, 120).trim();
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
    if (bytes.length > MAX_DB) { errors.push(tr("Base trop volumineuse ({n} Mo, maximum 100 Mo).", { n: Math.round(bytes.length / 1048576) })); return { errors, warnings }; }
    if (bytes.length > WARN_DB) warnings.push(tr("Base volumineuse ({n} Mo) : l'exécution des requêtes sera plus lente.", { n: Math.round(bytes.length / 1048576) }));
    let db;
    try {
      db = new SQL.Database(bytes);
      const tables = db.exec("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
      const names = tables[0] ? tables[0].values.map((r) => r[0]) : [];
      if (!names.length) { errors.push(tr("La base ne contient aucune table.")); return { errors, warnings }; }
      let fk = 0;
      for (const t of names) {
        fk += (db.exec(`PRAGMA foreign_key_list("${t}")`)[0] || { values: [] }).values.length;
        const cols = db.exec(`PRAGMA table_info("${t}")`)[0].values;
        for (const c of cols) {
          if (!/date/i.test(c[1]) && !/DATE/i.test(c[2] || "")) continue;
          const bad = db.exec(`SELECT COUNT(*) FROM "${t}" WHERE "${c[1]}" GLOB '[0-9]*/[0-9]*/[0-9][0-9][0-9][0-9]*'`)[0].values[0][0];
          if (bad) warnings.push(tr("{col} : {n} date(s) au format jj/mm/aaaa. Stockez les dates en AAAA-MM-JJ pour que YEAR(), BETWEEN et les tris fonctionnent.", { col: `${t}.${c[1]}`, n: bad }));
        }
      }
      if (!fk && names.length > 1) warnings.push(tr("Aucune clé étrangère déclarée (REFERENCES) : le diagramme n'affichera pas de flèches entre les tables."));
    } catch (e) {
      errors.push(tr("Base illisible : ") + e.message);
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
        else warnings.push(tr("Pas de fichier exercice.json dans le zip : exercice créé sans questions."));
        const dbf = find(/\.(sqlite3?|db)$/i);
        const sqlf = find(/\.sql$/i);
        if (dbf) bytes = dbf[1];
        else if (sqlf) bytes = sqlToDb(SQL, text(sqlf[1]));
        else errors.push(tr("Le zip ne contient ni base .sqlite ni script .sql."));
      } else if (isSqlite(u8)) {
        bytes = u8;
      } else {
        bytes = sqlToDb(SQL, text(u8)); // script SQL
      }
    } catch (e) {
      errors.push(tr("Fichier illisible : ") + e.message);
    }
    if (bytes && !isSqlite(bytes)) errors.push(tr("Le fichier de base n'est pas une base SQLite valide."));
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
      tr("Exercice SQL Lab : {titre}", { titre: ex.titre }),
      "",
      tr("Contenu :"),
      tr("- exercice.json : contexte, date du jour simulée et questions (format sql-lab-exercice/1)"),
      tr("- db.sqlite : la base de données"),
      "",
      tr("Pour l'utiliser : dans SQL Lab, menu « Importer un fichier », choisir ce zip."),
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
      ...catalogue.map((e) => ({ id: e.id, titre: e.titre, kind: "integre", langue: e.langue || "fr" })),
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
    if (!rec) throw new Error(tr("exercice introuvable dans ce navigateur"));
    return { ex: JSON.parse(JSON.stringify(rec.exercise)), bytes: rec.db, kind: "perso" };
  }

  async function save(exercise, bytes) {
    await store.put({ id: exercise.id, exercise, db: bytes, savedAt: new Date().toISOString() });
  }

  /**
   * Mention de la source d'un exercice (« Inspiré du sujet DCG UE8 session 2024, dossier 3.
   * Données entièrement fictives. »), traduite selon la langue d'interface quand elle suit ce modèle.
   */
  function sourceText(ex) {
    const s = String((ex && ex.source) || "").trim();
    const m = /^Inspiré du sujet DCG UE8 session (\d{4})(?:, (dossiers?) ([^.]+))?\. Données entièrement fictives\.$/.exec(s);
    if (!m) return s;
    if (!m[2]) return tr("Inspiré du sujet DCG UE8 session {a}. Données entièrement fictives.", { a: m[1] });
    const d = m[3].replace(/ et /g, I18N.lang === "fr" ? " et " : I18N.lang === "es" ? " y " : " and ");
    return m[2] === "dossiers"
      ? tr("Inspiré du sujet DCG UE8 session {a}, dossiers {d}. Données entièrement fictives.", { a: m[1], d })
      : tr("Inspiré du sujet DCG UE8 session {a}, dossier {d}. Données entièrement fictives.", { a: m[1], d });
  }

  const api = { FORMAT, store, list, load, save, readExerciseFile, normalizeExercise, analyzeDb, exerciseZip, isZip, slug, sourceText };
  global.SQLLibrary = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
