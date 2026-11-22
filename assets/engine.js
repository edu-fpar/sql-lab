/* SQL Lab – moteur d'exécution.
 * Chaque exécution part d'une copie neuve de la base : les modifications
 * (INSERT, UPDATE, DELETE) de l'étudiant sont donc toujours fictives.
 */
(function (global) {
  "use strict";
  const I18N = global.I18N || { lang: "fr", add() {}, t: (s, v) => (v ? s.replace(/\{(\w+)\}/g, (m, k) => (v[k] !== undefined ? v[k] : m)) : s), n: (c, a, b, v) => (c > 1 ? b : a).replace(/\{(\w+)\}/g, (m, k) => (k === "n" ? c : v && v[k] !== undefined ? v[k] : m)) };
  const t = I18N.t, tn = I18N.n;
  I18N.add({
    "La correction de cette question ne fonctionne pas : elle doit être revue par l'enseignant.": "The solution to this question does not work: it needs to be checked by the teacher.",
    "Cette question demande une requête de consultation (SELECT). Votre modification n'a pas été conservée.": "This question asks for a SELECT query. Your change was not kept.",
    "Votre requête ne renvoie aucun tableau de résultat.": "Your query does not return a result table.",
    "Rappel : on ne compare pas à NULL avec = ou <> ; on écrit IS NULL ou IS NOT NULL.": "Reminder: you cannot compare with NULL using = or <>; write IS NULL or IS NOT NULL.",
  });
  const Compat = global.SQLCompat || (typeof require !== "undefined" && require("./compat.js"));
  const Compare = global.SQLCompare || (typeof require !== "undefined" && require("./compare.js"));

  const EMPTY = { columns: [], values: [] };
  const lines = (x) => (Array.isArray(x) ? x.join("\n") : x || "");

  class Engine {
    constructor(SQL, bytes, today) {
      this.SQL = SQL;
      this.bytes = bytes;
      this.today = today;
      this.cache = new Map();
    }

    fresh() {
      const db = new this.SQL.Database(this.bytes);
      Compat.registerFunctions(db, this.today);
      db.run("PRAGMA foreign_keys = ON;");
      return db;
    }

    /** Exécute une ou plusieurs instructions ; renvoie le dernier jeu de résultats */
    exec(db, sql) {
      const pre = Compat.preprocess(sql, this.today);
      // iterateStatements (plutôt que db.exec) pour garder les noms de colonnes
      // même quand le résultat est vide
      let result = null;
      for (const stmt of db.iterateStatements(pre)) {
        try {
          const columns = stmt.getColumnNames();
          const values = [];
          while (stmt.step()) values.push(stmt.get());
          if (columns.length) result = { columns, values };
        } finally {
          stmt.free();
        }
      }
      const changes = db.exec("SELECT total_changes()")[0].values[0][0];
      return { result, changes, pre };
    }

    /** Exécution libre (aperçu d'une table, bac à sable) */
    run(sql) {
      const db = this.fresh();
      try {
        return this.exec(db, sql);
      } finally {
        db.close();
      }
    }

    query(db, sql) {
      return this.exec(db, sql).result || EMPTY;
    }

    expected(q) {
      if (this.cache.has(q.id)) return this.cache.get(q.id);
      const db = this.fresh();
      let out;
      try {
        if (q.type === "write") {
          const before = this.query(db, q.verif);
          this.exec(db, lines(q.correction));
          out = { before, after: this.query(db, q.verif) };
        } else {
          out = { result: this.exec(db, lines(q.correction)).result || EMPTY };
        }
      } finally {
        db.close();
      }
      this.cache.set(q.id, out);
      return out;
    }

    /**
     * Évalue la réponse de l'étudiant.
     * Renvoie { error?, result, changes, cmp, expected }
     */
    evaluate(q, studentSql) {
      let expected;
      try {
        expected = this.expected(q);
      } catch (e) {
        // question importée dont la correction est fausse
        return { error: t("La correction de cette question ne fonctionne pas : elle doit être revue par l'enseignant."), raw: e.message };
      }
      const db = this.fresh();
      try {
        let run;
        try {
          run = this.exec(db, studentSql);
        } catch (e) {
          return { error: Compat.explainError(e.message, studentSql), raw: e.message, expected };
        }
        if (q.type === "write") {
          const after = this.query(db, q.verif);
          const cmp = Compare.compareStates(expected.before, expected.after, after);
          return { result: run.result, changes: run.changes, cmp, expected };
        }
        if (!run.result) {
          const msg = run.changes > 0
            ? t("Cette question demande une requête de consultation (SELECT). Votre modification n'a pas été conservée.")
            : t("Votre requête ne renvoie aucun tableau de résultat.");
          return { result: null, changes: run.changes, cmp: { ok: false, level: "ko", messages: [msg], notes: [] }, expected };
        }
        const cmp = Compare.compareResults(expected.result, run.result, { ordered: q.ordered });
        if (!cmp.ok && /(=|<>|!=)\s*NULL\b/i.test(studentSql)) {
          cmp.messages.push(t("Rappel : on ne compare pas à NULL avec = ou <> ; on écrit IS NULL ou IS NOT NULL."));
        }
        return { result: run.result, changes: run.changes, cmp, expected };
      } finally {
        db.close();
      }
    }
  }

  Engine.lines = lines;
  global.SQLEngine = Engine;
  if (typeof module !== "undefined" && module.exports) module.exports = Engine;
})(typeof window !== "undefined" ? window : globalThis);
