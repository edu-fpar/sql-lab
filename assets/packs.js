/* SQL Lab – packs de questions complémentaires (format « sql-lab-questions/1 »).
 *  - normalisation / contrôle de forme d'un pack (fichier, lien, IA…)
 *  - vérification des corrections sur la base de l'exercice
 *  - encodage d'un pack dans un lien (compressé, dans le #, donc jamais envoyé au serveur)
 *  - description textuelle du schéma et des données (pour le prompt IA)
 */
(function (global) {
  "use strict";
  const I18N = global.I18N || { lang: "fr", add() {}, t: (s, v) => (v ? s.replace(/\{(\w+)\}/g, (m, k) => (v[k] !== undefined ? v[k] : m)) : s), n: (c, a, b, v) => (c > 1 ? b : a).replace(/\{(\w+)\}/g, (m, k) => (k === "n" ? c : v && v[k] !== undefined ? v[k] : m)) };
  const tr = I18N.t, trn = I18N.n;
  I18N.add({
    "Question {n} : ce n'est pas un objet.": "Question {n}: this is not an object.",
    "identifiant « {id} » invalide ou en double : renommé": "identifier “{id}” invalid or duplicated: renamed",
    "Questions complémentaires": "Additional questions",
    "énoncé manquant": "question text missing",
    "aucune synchronisation attendue : seule la grammaire du schéma sera vérifiée": "no expected synchronisation: only the diagram grammar will be checked",
    "solution du schéma manquante": "schema solution missing",
    "correction manquante": "solution missing",
    "requête de vérification (verif) manquante": "check query (verif) missing",
    "verif doit être une requête SELECT": "verif must be a SELECT query",
    "Le contenu n'est pas un objet JSON.": "The content is not a JSON object.",
    "Format « {f} » inconnu : lecture tentée comme {g}.": "Unknown format “{f}”: trying to read it as {g}.",
    "Aucune question trouvée (champ « questions »).": "No questions found (“questions” field).",
    "Seules les {n} premières questions sont gardées.": "Only the first {n} questions are kept.",
    "Aucun JSON valide trouvé dans le texte collé.": "No valid JSON found in the pasted text.",
    "La correction ne s'exécute pas : ": "The solution does not run: ",
    "La correction ne modifie aucune ligne de la table vérifiée.": "The solution does not change any row of the checked table.",
    "La correction ne renvoie pas de tableau (ce n'est pas un SELECT ?).": "The solution does not return a table (is it not a SELECT?).",
    "Le résultat attendu est vide : l'étudiant ne pourra pas vérifier grand-chose.": "The expected result is empty: students will not be able to check much.",
    "Résultat très long ({n} lignes) : difficile à comparer pour l'étudiant.": "Very long result ({n} rows): hard for students to compare.",
    "La correction contient ORDER BY mais l'ordre n'est pas vérifié : cochez les colonnes de tri.": "The solution contains ORDER BY but the order is not checked: tick the sort columns.",
    "Un ordre est imposé mais la correction n'a pas d'ORDER BY.": "An order is required but the solution has no ORDER BY.",
    "Colonne de tri hors du résultat.": "Sort column outside the result.",
    "Variante {n} : erreur ({e})": "Variant {n}: error ({e})",
    "Variante {n} : ne donne pas le même résultat que la correction.": "Variant {n}: does not give the same result as the solution.",
    "Lien de questions non reconnu.": "Question link not recognised.",
    "# Base « {titre} » (exercice `{id}`)": "# Database “{titre}” (exercise `{id}`)",
    "Contexte : {x}": "Context: {x}",
    "Date du jour simulée : {d} (valeur de NOW() / CURDATE()). Dates stockées au format AAAA-MM-JJ.": "Simulated current date: {d} (value of NOW() / CURDATE()). Dates are stored in YYYY-MM-DD format.",
    "Notation : clé primaire = [PK], clé étrangère = [FK → TABLE.colonne].": "Notation: primary key = [PK], foreign key = [FK → TABLE.column].",
    "## {t} ({n} lignes)": "## {t} ({n} rows)",
    "toujours vide": "always empty",
    "{n} valeurs : ": "{n} values: ",
    "de {a} à {b}": "from {a} to {b}",
    "ex. : ": "e.g.: ",
    " ; {n} valeur(s) NULL": "; {n} NULL value(s)",
    "## Liens entre tables (clé étrangère → clé primaire)": "## Links between tables (foreign key → primary key)",
  });

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
      return { q: null, errors: [tr("Question {n} : ce n'est pas un objet.", { n: index + 1 })], warnings };
    }
    const q = {};
    let id = str(raw.id, 40).replace(/[^\w-]/g, "");
    if (!id || usedIds.has(id)) {
      if (raw.id) warnings.push(tr("identifiant « {id} » invalide ou en double : renommé", { id: raw.id }));
      let k = index + 1;
      do { id = "q" + String(k++).padStart(2, "0"); } while (usedIds.has(id));
    }
    usedIds.add(id);
    q.id = id;
    q.theme = str(raw.theme, 80) || tr("Questions complémentaires");
    q.enonce = str(raw.enonce, MAX_TEXT);
    if (!q.enonce) errors.push(tr("énoncé manquant"));
    if (raw.type === "processus") {
      q.type = "processus";
      for (const k of ["couloirs", "elements", "attendus", "equivalents", "solution", "autoevaluation", "depart"]) if (raw[k] !== undefined) q[k] = raw[k];
      if (!Array.isArray(raw.attendus) || !raw.attendus.length) warnings.push(tr("aucune synchronisation attendue : seule la grammaire du schéma sera vérifiée"));
      if (raw.indice) q.indice = str(raw.indice, MAX_TEXT);
      if (raw.annale) q.annale = str(raw.annale, 20);
      return { q, errors, warnings };
    }
    if (raw.type === "schema") {
      q.type = "schema";
      if (!raw.solution || !Array.isArray(raw.solution.tables)) errors.push(tr("solution du schéma manquante"));
      q.depart = raw.depart || "base";
      q.solution = raw.solution || { tables: [] };
      if (Array.isArray(raw.variantes)) q.variantes = raw.variantes.filter((v) => v && Array.isArray(v.tables));
      if (raw.indice) q.indice = str(raw.indice, MAX_TEXT);
      if (raw.annale) q.annale = str(raw.annale, 20);
      if (typeof raw.allerPlusLoin === "string" && raw.allerPlusLoin.trim()) q.allerPlusLoin = str(raw.allerPlusLoin, MAX_TEXT);
      if (raw.cinema && typeof raw.cinema === "object" && !Array.isArray(raw.cinema)) {
        q.cinema = {};
        for (const [k, v] of Object.entries(raw.cinema)) if (/^\+?[a-z]+(\.\d+)?$/.test(k) && typeof v === "string") q.cinema[k] = str(v, MAX_TEXT);
      }
      return { q, errors, warnings };
    }
    q.correction = sqlField(raw.correction);
    if (!q.correction) errors.push(tr("correction manquante"));
    if (Array.isArray(raw.variantes)) {
      q.variantes = raw.variantes.map(sqlField).filter(Boolean).slice(0, 10);
      if (!q.variantes.length) delete q.variantes;
    }
    if (raw.indice) q.indice = str(raw.indice, MAX_TEXT);
    if (raw.annale) q.annale = str(raw.annale, 20);
    // commentaires du mode cinéma remplacés par l'enseignant : { phase: "texte" } ou { "phase.n": "texte" }
    if (typeof raw.allerPlusLoin === "string" && raw.allerPlusLoin.trim()) q.allerPlusLoin = str(raw.allerPlusLoin, MAX_TEXT);
    if (raw.cinema && typeof raw.cinema === "object" && !Array.isArray(raw.cinema)) {
      q.cinema = {};
      for (const [k, v] of Object.entries(raw.cinema)) if (/^\+?[a-z]+(\.\d+)?$/.test(k) && typeof v === "string") q.cinema[k] = str(v, MAX_TEXT);
    }

    const target = writeTarget(q.correction);
    const type = raw.type === "write" || (!raw.type && target) ? "write" : "select";
    if (type === "write") {
      q.type = "write";
      q.verif = str(raw.verif, 500) || (target ? `SELECT * FROM ${target}` : "");
      if (!q.verif) errors.push(tr("requête de vérification (verif) manquante"));
      else if (!/^\s*SELECT\b/i.test(q.verif)) errors.push(tr("verif doit être une requête SELECT"));
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
      return { pack: null, errors: [tr("Le contenu n'est pas un objet JSON.")], warnings, issues: [] };
    }
    if (raw.format && raw.format !== FORMAT) warnings.push(tr("Format « {f} » inconnu : lecture tentée comme {g}.", { f: raw.format, g: FORMAT }));
    const pack = {
      format: FORMAT,
      exercice: str(raw.exercice, 40) || defaults.exercice || "",
      titre: str(raw.titre, 120) || defaults.titre || tr("Questions complémentaires"),
    };
    if (raw.auteur) pack.auteur = str(raw.auteur, 120);
    if (raw.description) pack.description = str(raw.description, MAX_TEXT);
    const list = Array.isArray(raw.questions) ? raw.questions : [];
    if (!list.length) errors.push(tr("Aucune question trouvée (champ « questions »)."));
    if (list.length > MAX_QUESTIONS) warnings.push(tr("Seules les {n} premières questions sont gardées.", { n: MAX_QUESTIONS }));
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
    throw new Error(tr("Aucun JSON valide trouvé dans le texte collé."));
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
      errors.push(tr("La correction ne s'exécute pas : ") + (Compat ? Compat.explainError(e.message, lines(q.correction)) : e.message));
      return { ok: false, errors, warnings };
    }
    const sql = lines(q.correction);
    if (q.type === "write") {
      const C = global.SQLCompare;
      const st = C.compareStates(exp.before, exp.before, exp.after);
      if (st.ok) warnings.push(tr("La correction ne modifie aucune ligne de la table vérifiée."));
    } else {
      const n = exp.result.values.length;
      if (!exp.result.columns.length) errors.push(tr("La correction ne renvoie pas de tableau (ce n'est pas un SELECT ?)."));
      else if (n === 0) warnings.push(tr("Le résultat attendu est vide : l'étudiant ne pourra pas vérifier grand-chose."));
      else if (n > 200) warnings.push(tr("Résultat très long ({n} lignes) : difficile à comparer pour l'étudiant.", { n }));
      const hasOrder = /\bORDER\s+BY\b/i.test(sql);
      if (hasOrder && !q.ordered) warnings.push(tr("La correction contient ORDER BY mais l'ordre n'est pas vérifié : cochez les colonnes de tri."));
      if (!hasOrder && q.ordered) warnings.push(tr("Un ordre est imposé mais la correction n'a pas d'ORDER BY."));
      if (Array.isArray(q.ordered) && q.ordered.some((i) => i >= exp.result.columns.length)) errors.push(tr("Colonne de tri hors du résultat."));
    }
    (q.variantes || []).forEach((v, i) => {
      const r = engine.evaluate(q, lines(v));
      if (r.error) warnings.push(tr("Variante {n} : erreur ({e})", { n: i + 1, e: r.error }));
      else if (!r.cmp.ok) warnings.push(tr("Variante {n} : ne donne pas le même résultat que la correction.", { n: i + 1 }));
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
    else if (kind !== "j") throw new Error(tr("Lien de questions non reconnu."));
    return JSON.parse(new TextDecoder().decode(bytes));
  }

  // ----------------------------------------------------------- description du schéma
  function quote(v) { return typeof v === "string" ? `'${v.replace(/'/g, "''")}'` : String(v); }

  /** Description en Markdown des tables, colonnes, liens et données (pour l'IA) */
  function describeSchema(engine, ex) {
    const db = engine.fresh();
    const q = (sql) => { const r = db.exec(sql); return r[0] ? r[0].values : []; };
    const out = [];
    out.push(tr("# Base « {titre} » (exercice `{id}`)", { titre: ex.titre, id: ex.id }));
    out.push("");
    if (ex.contexte) out.push(tr("Contexte : {x}", { x: ex.contexte }), "");
    out.push(tr("Date du jour simulée : {d} (valeur de NOW() / CURDATE()). Dates stockées au format AAAA-MM-JJ.", { d: ex.aujourdhui }), "");
    out.push(tr("Notation : clé primaire = [PK], clé étrangère = [FK → TABLE.colonne]."), "");
    const tables = q("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY rowid").map((r) => r[0]);
    const links = [];
    for (const t of tables) {
      const cols = q(`PRAGMA table_info("${t}")`);
      const fks = new Map(q(`PRAGMA foreign_key_list("${t}")`).map((r) => [r[3], `${r[2]}.${r[4]}`]));
      const count = q(`SELECT COUNT(*) FROM "${t}"`)[0][0];
      out.push(tr("## {t} ({n} lignes)", { t, n: count }));
      for (const c of cols) {
        const name = c[1], type = (c[2] || "").toUpperCase(), pk = c[5] > 0, fk = fks.get(name);
        if (fk) links.push(`${t}.${name} → ${fk}`);
        const tags = [pk ? "PK" : "", fk ? `FK → ${fk}` : ""].filter(Boolean).map((x) => `[${x}]`).join(" ");
        const [nDist, nNull, mn, mx] = q(`SELECT COUNT(DISTINCT "${name}"), SUM("${name}" IS NULL), MIN("${name}"), MAX("${name}") FROM "${t}"`)[0];
        let info;
        if (nDist === 0) info = tr("toujours vide");
        else if (nDist <= 16 && !pk) info = tr("{n} valeurs : ", { n: nDist }) + q(`SELECT DISTINCT "${name}" FROM "${t}" WHERE "${name}" IS NOT NULL ORDER BY 1`).map((r) => quote(r[0])).join(", ");
        else if (/INT|REAL|NUM|DATE/.test(type) || typeof mn === "number") info = tr("de {a} à {b}", { a: quote(mn), b: quote(mx) });
        else info = tr("ex. : ") + q(`SELECT DISTINCT "${name}" FROM "${t}" WHERE "${name}" IS NOT NULL LIMIT 5`).map((r) => quote(r[0])).join(", ");
        const nulls = nNull ? tr(" ; {n} valeur(s) NULL", { n: nNull }) : "";
        out.push(`- ${name} ${type || "TEXT"} ${tags} — ${info}${nulls}`.replace(/ {2,}/g, " "));
      }
      out.push("");
    }
    if (links.length) {
      out.push(tr("## Liens entre tables (clé étrangère → clé primaire)"));
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
