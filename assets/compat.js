/* SQL Lab – couche de compatibilité.
 * Permet d'écrire les requêtes « comme au DCG » (syntaxe MySQL / Access)
 * alors que le moteur est SQLite (sql.js).
 *
 *  - Fonctions de dates : YEAR(), MONTH(), DAY(), ANNEE(), MOIS(), JOUR(),
 *    DATEDIFF(fin, debut), NOW(), CURDATE(), GETDATE(), AUJOURDHUI(), DATE_DU_JOUR()
 *  - EXTRACT(YEAR FROM d)  ->  YEAR(d)
 *  - Littéraux 'jj/mm/aaaa', "jj/mm/aaaa" et #jj/mm/aaaa#  ->  'aaaa-mm-jj'
 *  - CURRENT_DATE et 'now'  ->  date du jour simulée de l'exercice
 */
(function (global) {
  "use strict";
  const I18N = global.I18N || { lang: "fr", add() {}, t: (s, v) => (v ? s.replace(/\{(\w+)\}/g, (m, k) => (v[k] !== undefined ? v[k] : m)) : s), n: (c, a, b, v) => (c > 1 ? b : a).replace(/\{(\w+)\}/g, (m, k) => (k === "n" ? c : v && v[k] !== undefined ? v[k] : m)) };
  const t = I18N.t, tn = I18N.n;
  I18N.add({
    "Colonne inconnue : {x}. Vérifiez l'orthographe exacte dans le schéma (majuscules et accents comptent pour les noms de colonnes), et que la table qui la contient est bien dans le FROM.": "Unknown column: {x}. Check the exact spelling in the schema (capitals and accents matter in column names), and that the table containing it is in the FROM clause.",
    "Table inconnue : {x}. Vérifiez le nom de la table dans le schéma.": "Unknown table: {x}. Check the table name in the schema.",
    "Colonne ambiguë : {x} existe dans plusieurs tables du FROM. Préfixez-la avec le nom (ou l'alias) de la table, par exemple CLIENT.{col}.": "Ambiguous column: {x} exists in several tables of the FROM clause. Prefix it with the table name (or alias), for example CLIENT.{col}.",
    "Fonction inconnue : {x}.": "Unknown function: {x}.",
    "Mauvaise utilisation d'une fonction d'agrégat (COUNT, SUM, AVG…) : une condition sur un agrégat se met dans HAVING, pas dans WHERE.": "Misuse of an aggregate function (COUNT, SUM, AVG…): a condition on an aggregate goes in HAVING, not in WHERE.",
    "Refusé par l'intégrité référentielle : cette ligne est référencée par une clé étrangère d'une autre table (ou la valeur de clé étrangère n'existe pas).": "Rejected by referential integrity: this row is referenced by a foreign key in another table (or the foreign key value does not exist).",
    "Clé primaire déjà existante ({x}) : une ligne avec cet identifiant existe déjà.": "Primary key already exists ({x}): a row with this identifier already exists.",
    "La colonne {x} est obligatoire : il faut lui donner une valeur.": "The column {x} is required: you must give it a value.",
    "Valeur refusée par une contrainte de la table (par ex. une valeur non autorisée pour AcceptationClient ou ConformitePJ).": "Value rejected by a table constraint (e.g. a value that is not allowed for AcceptationClient or ConformitePJ).",
    "La table {table} a {a} colonnes mais vous fournissez {b} valeurs. Donnez une valeur par colonne, ou listez les colonnes : INSERT INTO table (col1, col2) VALUES (…).": "The table {table} has {a} columns but you supply {b} values. Give one value per column, or list the columns: INSERT INTO table (col1, col2) VALUES (…).",
    "Erreur de syntaxe près d'une virgule : en SQL le séparateur décimal est le point (4.34 et non 4,34).": "Syntax error near a comma: in SQL the decimal separator is the point (4.34, not 4,34).",
    "Requête incomplète : il manque probablement une parenthèse fermante ou une fin d'instruction.": "Incomplete query: a closing bracket or the end of a statement is probably missing.",
    "Erreur de syntaxe près de « {x} ». Vérifiez l'ordre des clauses (SELECT … FROM … WHERE … GROUP BY … HAVING … ORDER BY …), les virgules et les guillemets.": "Syntax error near “{x}”. Check the order of the clauses (SELECT … FROM … WHERE … GROUP BY … HAVING … ORDER BY …), the commas and the quotes.",
  });

  function pad(n) { return String(n).padStart(2, "0"); }

  /** 'jj/mm/aaaa' (ou j/m/aaaa, séparateurs / - .) -> 'aaaa-mm-jj', sinon null */
  function frToIso(s) {
    const m = /^\s*(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})\s*$/.exec(s);
    if (!m) return null;
    const d = +m[1], mo = +m[2];
    if (d < 1 || d > 31 || mo < 1 || mo > 12) return null;
    return `${m[3]}-${pad(mo)}-${pad(d)}`;
  }

  /** Lit une date stockée (ISO 'aaaa-mm-jj[...]' ou 'jj/mm/aaaa') -> {y,m,d} */
  function parseDate(v) {
    if (v === null || v === undefined) return null;
    const s = String(v);
    let m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
    if (m) return { y: +m[1], m: +m[2], d: +m[3] };
    const iso = frToIso(s);
    if (iso) return parseDate(iso);
    return null;
  }

  function toUtc(p) { return Date.UTC(p.y, p.m - 1, p.d); }

  /**
   * Réécrit la requête de l'étudiant. Ne touche jamais au contenu des
   * commentaires ; dans les chaînes, ne convertit que les dates jj/mm/aaaa.
   */
  function preprocess(sql, today) {
    let out = "";
    let i = 0;
    const n = sql.length;
    let code = ""; // portion hors chaîne en attente de traitement

    const flushCode = () => {
      let c = code;
      // EXTRACT(YEAR FROM x) -> YEAR(x)
      c = c.replace(/\bEXTRACT\s*\(\s*(YEAR|MONTH|DAY)\s+FROM\s+/gi, (_, u) => u.toUpperCase() + "(");
      // #jj/mm/aaaa# (Access)
      c = c.replace(/#\s*(\d{1,2}[\/.-]\d{1,2}[\/.-]\d{4})\s*#/g, (all, d) => {
        const iso = frToIso(d);
        return iso ? `'${iso}'` : all;
      });
      // CURRENT_DATE / CURRENT_TIMESTAMP -> date simulée
      c = c.replace(/\bCURRENT_(DATE|TIMESTAMP)\b/gi, `'${today}'`);
      out += c;
      code = "";
    };

    while (i < n) {
      const ch = sql[i];
      // commentaire ligne
      if (ch === "-" && sql[i + 1] === "-") {
        flushCode();
        const j = sql.indexOf("\n", i);
        const end = j === -1 ? n : j;
        out += sql.slice(i, end);
        i = end;
        continue;
      }
      // commentaire bloc
      if (ch === "/" && sql[i + 1] === "*") {
        flushCode();
        const j = sql.indexOf("*/", i + 2);
        const end = j === -1 ? n : j + 2;
        out += sql.slice(i, end);
        i = end;
        continue;
      }
      // identifiant entre crochets (Access / SQL Server) : [Numéro d'immatriculation]
      if (ch === "[") {
        const j = sql.indexOf("]", i + 1);
        if (j !== -1) {
          flushCode();
          out += sql.slice(i, j + 1);
          i = j + 1;
          continue;
        }
      }
      // chaîne '...' ou "..."
      if (ch === "'" || ch === '"') {
        flushCode();
        let j = i + 1;
        let content = "";
        while (j < n) {
          if (sql[j] === ch && sql[j + 1] === ch) { content += ch + ch; j += 2; continue; }
          if (sql[j] === ch) break;
          content += sql[j];
          j++;
        }
        const iso = frToIso(content);
        if (iso) out += `'${iso}'`;
        else if (ch === "'" && content.toLowerCase() === "now") out += `'${today}'`;
        else out += ch + content + (j < n ? ch : "");
        i = j + 1;
        continue;
      }
      code += ch;
      i++;
    }
    flushCode();
    return out;
  }

  /** Déclare les fonctions « DCG » sur une base sql.js */
  function registerFunctions(db, today) {
    const part = (k) => (v) => { const p = parseDate(v); return p ? p[k] : null; };
    for (const [names, fn] of [
      [["YEAR", "ANNEE"], part("y")],
      [["MONTH", "MOIS"], part("m")],
      [["DAY", "JOUR", "DAYOFMONTH"], part("d")],
    ]) {
      for (const name of names) db.create_function(name, fn);
    }
    for (const name of ["NOW", "CURDATE", "GETDATE", "SYSDATE", "AUJOURDHUI", "DATE_DU_JOUR"]) {
      db.create_function(name, () => today);
    }
    // DATEDIFF(fin, debut) : nombre de jours (comme MySQL)
    db.create_function("DATEDIFF", (a, b) => {
      const pa = parseDate(a), pb = parseDate(b);
      if (!pa || !pb) return null;
      return Math.round((toUtc(pa) - toUtc(pb)) / 86400000);
    });
  }

  /** Traduit les messages d'erreur SQLite en conseils compréhensibles */
  function explainError(msg, sql) {
    const m = String(msg);
    let r;
    if ((r = /no such column: (.+)/i.exec(m)))
      return t("Colonne inconnue : {x}. Vérifiez l'orthographe exacte dans le schéma (majuscules et accents comptent pour les noms de colonnes), et que la table qui la contient est bien dans le FROM.", { x: r[1] });
    if ((r = /no such table: (.+)/i.exec(m)))
      return t("Table inconnue : {x}. Vérifiez le nom de la table dans le schéma.", { x: r[1] });
    if ((r = /ambiguous column name: (.+)/i.exec(m)))
      return t("Colonne ambiguë : {x} existe dans plusieurs tables du FROM. Préfixez-la avec le nom (ou l'alias) de la table, par exemple CLIENT.{col}.", { x: r[1], col: r[1].split(".").pop() });
    if ((r = /no such function: (.+)/i.exec(m)))
      return t("Fonction inconnue : {x}.", { x: r[1] });
    if (/misuse of aggregate/i.test(m))
      return t("Mauvaise utilisation d'une fonction d'agrégat (COUNT, SUM, AVG…) : une condition sur un agrégat se met dans HAVING, pas dans WHERE.");
    if (/FOREIGN KEY constraint failed/i.test(m))
      return t("Refusé par l'intégrité référentielle : cette ligne est référencée par une clé étrangère d'une autre table (ou la valeur de clé étrangère n'existe pas).");
    if ((r = /UNIQUE constraint failed: (.+)/i.exec(m)))
      return t("Clé primaire déjà existante ({x}) : une ligne avec cet identifiant existe déjà.", { x: r[1] });
    if ((r = /NOT NULL constraint failed: (.+)/i.exec(m)))
      return t("La colonne {x} est obligatoire : il faut lui donner une valeur.", { x: r[1] });
    if (/CHECK constraint failed/i.test(m))
      return t("Valeur refusée par une contrainte de la table (par ex. une valeur non autorisée pour AcceptationClient ou ConformitePJ).");
    if ((r = /table (\S+) has (\d+) columns but (\d+) values were supplied/i.exec(m)))
      return t("La table {table} a {a} colonnes mais vous fournissez {b} valeurs. Donnez une valeur par colonne, ou listez les colonnes : INSERT INTO table (col1, col2) VALUES (…).", { table: r[1], a: r[2], b: r[3] });
    if (/syntax error/i.test(m) && /(=|<|>|\*|\/|\+|-|\()\s*-?\d+,\d+/.test(sql))
      return t("Erreur de syntaxe près d'une virgule : en SQL le séparateur décimal est le point (4.34 et non 4,34).");
    if (/incomplete input/i.test(m))
      return t("Requête incomplète : il manque probablement une parenthèse fermante ou une fin d'instruction.");
    if ((r = /near "([^"]+)": syntax error/i.exec(m)))
      return t("Erreur de syntaxe près de « {x} ». Vérifiez l'ordre des clauses (SELECT … FROM … WHERE … GROUP BY … HAVING … ORDER BY …), les virgules et les guillemets.", { x: r[1] });
    return m;
  }

  const api = { preprocess, registerFunctions, explainError, frToIso, parseDate };
  global.SQLCompat = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
