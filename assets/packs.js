/* SQL Lab – packs de questions complémentaires (format « sql-lab-questions/1 »).
 *  - normalisation / contrôle de forme d'un pack (fichier, lien, IA…)
 *  - vérification des corrections sur la base de l'exercice
 *  - encodage d'un pack dans un lien (compressé, dans le #, donc jamais envoyé au serveur)
 *  - description textuelle du schéma et des données (pour le prompt IA)
 */
(function (global) {
  "use strict";

  const FORMAT = "sql-lab-questions/1";
  const MAX_QUESTIONS = 200;
  const MAX_TEXT = 3000;
  const MAX_SQL = 6000;
  const lines = (x) => (Array.isArray(x) ? x.join("\n") : typeof x === "string" ? x : "");

  function str(v, max) {
    if (v === null || v === undefined) return "";
    return String(v).slice(0, max).trim();
  }

  function sqlField(v) {
    if (Array.isArray(v)) return v.map((l) => String(l)).join("\n").slice(0, MAX_SQL);
    return str(v, MAX_SQL);
  }

  const WRITE_RE = /^\s*(?:--[^\n]*\n\s*)*(INSERT\s+INTO|UPDATE|DELETE\s+FROM)\s+["`[]?([A-Za-z_][\w]*)/i;

  /** Table modifiée par une requête d'écriture (ou null) */
  function writeTarget(sql) {
    const m = WRITE_RE.exec(sql || "");
    return m ? m[2] : null;
  }

  /**
   * Remet une question au propre. Renvoie { q, errors, warnings }.
   * Les champs inconnus sont ignorés ; les textes sont bornés.
   */
  function normalizeQuestion(raw, index, usedIds) {
    const errors = [], warnings = [];
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
      return { q: null, errors: [`Question ${index + 1} : ce n'est pas un objet.`], warnings };
    }
    const q = {};
    let id = str(raw.id, 40).replace(/[^\w-]/g, "");
    if (!id || usedIds.has(id)) {
      if (raw.id) warnings.push(`identifiant « ${raw.id} » invalide ou en double : renommé`);
      let k = index + 1;
      do { id = "q" + String(k++).padStart(2, "0"); } while (usedIds.has(id));
    }
    usedIds.add(id);
    q.id = id;
    q.theme = str(raw.theme, 80) || "Questions complémentaires";
    q.enonce = str(raw.enonce, MAX_TEXT);
    if (!q.enonce) errors.push("énoncé manquant");
    if (raw.type === "processus") {
      q.type = "processus";
      for (const k of ["couloirs", "elements", "attendus", "equivalents", "solution", "autoevaluation", "depart"]) if (raw[k] !== undefined) q[k] = raw[k];
      if (!Array.isArray(raw.attendus) || !raw.attendus.length) warnings.push("aucune synchronisation attendue : seule la grammaire du schéma sera vérifiée");
      if (raw.indice) q.indice = str(raw.indice, MAX_TEXT);
      if (raw.annale) q.annale = str(raw.annale, 20);
      return { q, errors, warnings };
    }
    if (raw.type === "schema") {
      q.type = "schema";
      if (!raw.solution || !Array.isArray(raw.solution.tables)) errors.push("solution du schéma manquante");
      q.depart = raw.depart || "base";
      q.solution = raw.solution || { tables: [] };
      if (Array.isArray(raw.variantes)) q.variantes = raw.variantes.filter((v) => v && Array.isArray(v.tables));
      if (raw.indice) q.indice = str(raw.indice, MAX_TEXT);
      if (raw.annale) q.annale = str(raw.annale, 20);
      return { q, errors, warnings };
    }
    q.correction = sqlField(raw.correction);
    if (!q.correction) errors.push("correction manquante");
    if (Array.isArray(raw.variantes)) {
      q.variantes = raw.variantes.map(sqlField).filter(Boolean).slice(0, 10);
      if (!q.variantes.length) delete q.variantes;
    }
    if (raw.indice) q.indice = str(raw.indice, MAX_TEXT);
    if (raw.annale) q.annale = str(raw.annale, 20);

    const target = writeTarget(q.correction);
    const type = raw.type === "write" || (!raw.type && target) ? "write" : "select";
    if (type === "write") {
      q.type = "write";
      q.verif = str(raw.verif, 500) || (target ? `SELECT * FROM ${target}` : "");
      if (!q.verif) errors.push("requête de vérification (verif) manquante");
      else if (!/^\s*SELECT\b/i.test(q.verif)) errors.push("verif doit être une requête SELECT");
    }
    if (raw.ordered === true) q.ordered = true;
    else if (Array.isArray(raw.ordered)) {
      const o = raw.ordered.map(Number).filter((n) => Number.isInteger(n) && n >= 0 && n < 50);
      if (o.length) q.ordered = o;
    }
    return { q, errors, warnings };
  }

  /**
   * Accepte un pack complet, ou directement un tableau de questions.
   * Renvoie { pack, errors, warnings, issues: [{errors, warnings}] par question }.
   */
  function normalizePack(raw, defaults = {}) {
    const errors = [], warnings = [];
    if (Array.isArray(raw)) raw = { questions: raw };
    if (!raw || typeof raw !== "object") {
      return { pack: null, errors: ["Le contenu n'est pas un objet JSON."], warnings, issues: [] };
    }
    if (raw.format && raw.format !== FORMAT) warnings.push(`Format « ${raw.format} » inconnu : lecture tentée comme ${FORMAT}.`);
    const pack = {
      format: FORMAT,
      exercice: str(raw.exercice, 40) || defaults.exercice || "",
      titre: str(raw.titre, 120) || defaults.titre || "Questions complémentaires",
    };
    if (raw.auteur) pack.auteur = str(raw.auteur, 120);
    if (raw.description) pack.description = str(raw.description, MAX_TEXT);
    const list = Array.isArray(raw.questions) ? raw.questions : [];
    if (!list.length) errors.push("Aucune question trouvée (champ « questions »).");
    if (list.length > MAX_QUESTIONS) warnings.push(`Seules les ${MAX_QUESTIONS} premières questions sont gardées.`);
    const used = new Set();
    const issues = [];
    pack.questions = [];
    list.slice(0, MAX_QUESTIONS).forEach((r, i) => {
      const n = normalizeQuestion(r, i, used);
      issues.push({ errors: n.errors, warnings: n.warnings });
      if (n.q) pack.questions.push(n.q);
    });
    return { pack, errors, warnings, issues };
  }

  /** Extrait le JSON d'une réponse d'IA (bloc ```json, texte autour…) */
  function extractJson(text) {
    const t = String(text || "").trim();
    const fence = /```(?:json)?\s*([\s\S]*?)```/i.exec(t);
    const body = fence ? fence[1] : t;
    try { return JSON.parse(body); } catch (e) { /* on tente plus large */ }
    const a = body.indexOf("{"), b = body.lastIndexOf("}");
    if (a >= 0 && b > a) {
      try { return JSON.parse(body.slice(a, b + 1)); } catch (e) { /* suite */ }
    }
    const c = body.indexOf("["), d = body.lastIndexOf("]");
    if (c >= 0 && d > c) return JSON.parse(body.slice(c, d + 1));
    throw new Error("Aucun JSON valide trouvé dans le texte collé.");
  }

  /**
   * Exécute la correction (et les variantes) d'une question sur la base.
   * Renvoie { ok, errors, warnings, result, before, after }.
   */
  function checkQuestion(engine, q) {
    const errors = [], warnings = [];
    if (q.type === "schema" || q.type === "processus") return { ok: true, errors, warnings, schema: true }; // pas de SQL à exécuter
    engine.cache.delete(q.id);
    let exp;
    try {
      exp = engine.expected(q);
    } catch (e) {
      const Compat = global.SQLCompat;
      errors.push("La correction ne s'exécute pas : " + (Compat ? Compat.explainError(e.message, lines(q.correction)) : e.message));
      return { ok: false, errors, warnings };
    }
    const sql = lines(q.correction);
    if (q.type === "write") {
      const C = global.SQLCompare;
      const st = C.compareStates(exp.before, exp.before, exp.after);
      if (st.ok) warnings.push("La correction ne modifie aucune ligne de la table vérifiée.");
    } else {
      const n = exp.result.values.length;
      if (!exp.result.columns.length) errors.push("La correction ne renvoie pas de tableau (ce n'est pas un SELECT ?).");
      else if (n === 0) warnings.push("Le résultat attendu est vide : l'étudiant ne pourra pas vérifier grand-chose.");
      else if (n > 200) warnings.push(`Résultat très long (${n} lignes) : difficile à comparer pour l'étudiant.`);
      const hasOrder = /\bORDER\s+BY\b/i.test(sql);
      if (hasOrder && !q.ordered) warnings.push("La correction contient ORDER BY mais l'ordre n'est pas vérifié : cochez les colonnes de tri.");
      if (!hasOrder && q.ordered) warnings.push("Un ordre est imposé mais la correction n'a pas d'ORDER BY.");
      if (Array.isArray(q.ordered) && q.ordered.some((i) => i >= exp.result.columns.length)) errors.push("Colonne de tri hors du résultat.");
    }
    (q.variantes || []).forEach((v, i) => {
      const r = engine.evaluate(q, lines(v));
      if (r.error) warnings.push(`Variante ${i + 1} : erreur (${r.error})`);
      else if (!r.cmp.ok) warnings.push(`Variante ${i + 1} : ne donne pas le même résultat que la correction.`);
    });
    return { ok: !errors.length, errors, warnings, result: exp.result, before: exp.before, after: exp.after };
  }

  // ----------------------------------------------------------- lien partagé
  function toB64url(bytes) {
    let s = "";
    for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }
  function fromB64url(s) {
    s = s.replace(/-/g, "+").replace(/_/g, "/");
    while (s.length % 4) s += "=";
    const bin = atob(s);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }
  async function pipe(bytes, stream) {
    const res = new Response(new Blob([bytes]).stream().pipeThrough(stream));
    return new Uint8Array(await res.arrayBuffer());
  }

  /** Pack -> chaîne à placer après « #pack= » (z = compressé, j = brut) */
  async function encodePack(pack) {
    const bytes = new TextEncoder().encode(JSON.stringify(pack));
    if (typeof CompressionStream !== "undefined") {
      return "z" + toB64url(await pipe(bytes, new CompressionStream("deflate-raw")));
    }
    return "j" + toB64url(bytes);
  }

  async function decodePack(s) {
    const kind = s[0], data = fromB64url(s.slice(1));
    let bytes = data;
    if (kind === "z") bytes = await pipe(data, new DecompressionStream("deflate-raw"));
    else if (kind !== "j") throw new Error("Lien de questions non reconnu.");
    return JSON.parse(new TextDecoder().decode(bytes));
  }

  // ----------------------------------------------------------- description du schéma
  function quote(v) { return typeof v === "string" ? `'${v.replace(/'/g, "''")}'` : String(v); }

  /** Description en Markdown des tables, colonnes, liens et données (pour l'IA) */
  function describeSchema(engine, ex) {
    const db = engine.fresh();
    const q = (sql) => { const r = db.exec(sql); return r[0] ? r[0].values : []; };
    const out = [];
    out.push(`# Base « ${ex.titre} » (exercice \`${ex.id}\`)`);
    out.push("");
    if (ex.contexte) out.push(`Contexte : ${ex.contexte}`, "");
    out.push(`Date du jour simulée : ${ex.aujourdhui} (valeur de NOW() / CURDATE()). Dates stockées au format AAAA-MM-JJ.`, "");
    out.push("Notation : clé primaire = [PK], clé étrangère = [FK → TABLE.colonne].", "");
    const tables = q("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY rowid").map((r) => r[0]);
    const links = [];
    for (const t of tables) {
      const cols = q(`PRAGMA table_info("${t}")`);
      const fks = new Map(q(`PRAGMA foreign_key_list("${t}")`).map((r) => [r[3], `${r[2]}.${r[4]}`]));
      const count = q(`SELECT COUNT(*) FROM "${t}"`)[0][0];
      out.push(`## ${t} (${count} lignes)`);
      for (const c of cols) {
        const name = c[1], type = (c[2] || "").toUpperCase(), pk = c[5] > 0, fk = fks.get(name);
        if (fk) links.push(`${t}.${name} → ${fk}`);
        const tags = [pk ? "PK" : "", fk ? `FK → ${fk}` : ""].filter(Boolean).map((x) => `[${x}]`).join(" ");
        const [nDist, nNull, mn, mx] = q(`SELECT COUNT(DISTINCT "${name}"), SUM("${name}" IS NULL), MIN("${name}"), MAX("${name}") FROM "${t}"`)[0];
        let info;
        if (nDist === 0) info = "toujours vide";
        else if (nDist <= 16 && !pk) info = `${nDist} valeurs : ` + q(`SELECT DISTINCT "${name}" FROM "${t}" WHERE "${name}" IS NOT NULL ORDER BY 1`).map((r) => quote(r[0])).join(", ");
        else if (/INT|REAL|NUM|DATE/.test(type) || typeof mn === "number") info = `de ${quote(mn)} à ${quote(mx)}`;
        else info = "ex. : " + q(`SELECT DISTINCT "${name}" FROM "${t}" WHERE "${name}" IS NOT NULL LIMIT 5`).map((r) => quote(r[0])).join(", ");
        const nulls = nNull ? ` ; ${nNull} valeur(s) NULL` : "";
        out.push(`- ${name} ${type || "TEXT"} ${tags} — ${info}${nulls}`.replace(/ {2,}/g, " "));
      }
      out.push("");
    }
    if (links.length) {
      out.push("## Liens entre tables (clé étrangère → clé primaire)");
      for (const l of links) out.push(`- ${l}`);
      out.push("");
    }
    db.close();
    return out.join("\n");
  }

  const api = { FORMAT, normalizePack, normalizeQuestion, extractJson, checkQuestion, encodePack, decodePack, describeSchema, writeTarget, lines };
  global.SQLPacks = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
