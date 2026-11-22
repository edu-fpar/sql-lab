/* SQL Lab – questions « schéma » : construction / évolution d'un schéma relationnel.
 *
 * Schéma (de l'étudiant comme de départ) :
 *   { tables: [ { name, cols: [ { name, pk: bool, fk: "TABLE" | null } ] } ] }
 *
 * Solution (dans questions.json) :
 *   {
 *     "tables": [ { "nom": "EMPRUNTER", "alias": ["EMPRUNT"], "role": "relier …",
 *                   "pk": ["IdCli", "IdDoss"], "fk": { "IdCli": "CLIENT", "IdDoss": "DOSSIER" },
 *                   "attributs": ["Quotite"], "optionnels": [], "interdits": [] } ],
 *     "tablesOptionnelles": ["SERVICE"], "tablesSupprimees": []
 *   }
 * Un nom d'attribut peut proposer des équivalents : "numPersonnelHydro|numPersonnel".
 * Comparaison insensible à la casse, aux accents, aux espaces et aux « _ ».
 * Une question peut avoir des variantes de solution ; une variante marquée
 * "partiel": "message" est reconnue mais n'est pas comptée comme réussie.
 */
(function (global) {
  "use strict";

  const norm = (s) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
  const alts = (spec) => String(spec).split("|").map((x) => x.trim()).filter(Boolean);
  const first = (spec) => alts(spec)[0];
  const matches = (spec, name) => alts(spec).some((a) => norm(a) === norm(name));
  const tableNames = (t) => [t.nom, ...(t.alias || [])];

  /** Schéma de la base (format du diagramme) -> schéma d'édition */
  function fromDiagramSchema(list) {
    return {
      tables: list.map((t) => ({
        name: t.name,
        cols: t.cols.map((c) => ({ name: c.name, pk: !!c.pk, fk: c.fk ? String(c.fk).split(".")[0] : null })),
      })),
    };
  }

  /**
   * Schéma de départ d'une question :
   *  - "base" : toute la base de l'exercice
   *  - ["CLIENT", "DOSSIER"] : ces tables de la base
   *  - [{ "nom": "PERSONNEL", "colonnes": [...] }] : tables décrites ; une colonne s'écrit
   *    "numPersonnel" (simple), "_numPersonnel" (clé primaire), "#codeSalon>SALON" (clé étrangère)
   *    ou "_#numDoss>DOSSIER" (les deux)
   */
  function departSchema(q, base) {
    const d = q.depart || "base";
    if (d === "base") return clone(base);
    const out = { tables: [] };
    for (const item of d) {
      if (typeof item === "string") {
        const t = base.tables.find((x) => norm(x.name) === norm(item));
        if (t) out.tables.push(clone(t));
        continue;
      }
      out.tables.push({
        name: item.nom,
        cols: (item.colonnes || []).map((c) => {
          const m = /^(_?)(#?)([^>]+?)(?:>(.+))?$/.exec(String(c).trim());
          return { name: m[3].trim(), pk: !!m[1], fk: m[4] ? m[4].trim() : m[2] ? "?" : null };
        }),
      });
    }
    // références vers des tables absentes du départ : on les garde telles quelles (flèche sans cible)
    return out;
  }

  function clone(x) { return JSON.parse(JSON.stringify(x)); }

  /** Schéma correspondant à une solution (pour l'afficher en correction et pour l'autotest) */
  function solutionSchema(depart, sol) {
    const s = clone(depart);
    for (const name of sol.tablesSupprimees || []) s.tables = s.tables.filter((t) => norm(t.name) !== norm(name));
    for (const t of sol.tables) {
      let target = s.tables.find((x) => tableNames(t).some((n) => norm(n) === norm(x.name)));
      if (!target) { target = { name: t.nom, cols: [] }; s.tables.push(target); }
      target.cols = target.cols.filter((c) => !(t.interdits || []).some((spec) => matches(spec, c.name)));
      const want = [];
      for (const spec of t.pk || []) want.push({ spec, pk: true });
      for (const spec of Object.keys(t.fk || {})) if (!want.some((w) => matches(w.spec, first(spec)))) want.push({ spec, pk: false });
      for (const spec of t.attributs || []) want.push({ spec, pk: false });
      for (const w of want) {
        let col = target.cols.find((c) => matches(w.spec, c.name));
        if (!col) { col = { name: first(w.spec), pk: false, fk: null }; target.cols.push(col); }
        if (w.pk) col.pk = true;
      }
      for (const c of target.cols) if (!(t.pk || []).some((spec) => matches(spec, c.name)) && (t.pk || []).length) c.pk = false;
      for (const [spec, ref] of Object.entries(t.fk || {})) {
        const col = target.cols.find((c) => matches(spec, c.name));
        if (col) col.fk = ref;
      }
    }
    return s;
  }

  /** Compare le schéma de l'étudiant à une solution : { errors, notes, partielMsg, passed, total } */
  function compareOne(student, depart, sol) {
    const errors = [], notes = [];
    let total = 0, passed = 0;
    const check = (ok, msg) => { total++; if (ok) passed++; else if (msg) errors.push(msg); return ok; };

    const used = new Set();
    const map = new Map(); // table attendue -> table de l'étudiant
    // 1. par le nom
    for (const t of sol.tables) {
      const st = student.tables.find((x) => !used.has(x) && tableNames(t).some((n) => norm(n) === norm(x.name)));
      if (st) { map.set(t, st); used.add(st); }
    }
    // 2. par la clé primaire (nom de table imprévu)
    for (const t of sol.tables) {
      if (map.has(t) || !(t.pk || []).length) continue;
      const st = student.tables.find((x) => {
        if (used.has(x) || depart.tables.some((d) => norm(d.name) === norm(x.name))) return false;
        const pks = x.cols.filter((c) => c.pk);
        return pks.length === t.pk.length && t.pk.every((spec) => pks.some((c) => matches(spec, c.name)));
      });
      if (st) { map.set(t, st); used.add(st); notes.push(`La table « ${st.name} » a été reconnue comme « ${t.nom} ».`); }
    }

    // référence : la table visée par une clé étrangère de l'étudiant correspond-elle à celle attendue ?
    const refOk = (studentRef, expectedName) => {
      if (!studentRef) return false;
      const expectedT = sol.tables.find((t) => tableNames(t).some((n) => norm(n) === norm(expectedName)));
      if (expectedT && map.has(expectedT)) return norm(map.get(expectedT).name) === norm(studentRef);
      return (expectedT ? tableNames(expectedT) : [expectedName]).some((n) => norm(n) === norm(studentRef));
    };

    for (const t of sol.tables) {
      const st = map.get(t);
      const isDepart = depart.tables.some((d) => tableNames(t).some((n) => norm(n) === norm(d.name)));
      if (!check(!!st, isDepart ? `La table ${t.nom} a disparu : elle doit rester dans le schéma.`
        : t.role ? `Il manque une table pour ${t.role}.` : `Il manque une table (${t.nom}).`)) continue;
      const label = st.name;
      const required = [...(t.pk || []), ...Object.keys(t.fk || {}), ...(t.attributs || [])]
        .filter((spec, i, arr) => arr.findIndex((s) => norm(first(s)) === norm(first(spec))) === i);
      for (const spec of required) {
        check(st.cols.some((c) => matches(spec, c.name)), `Dans ${label}, il manque l'attribut ${first(spec)}.`);
      }
      for (const spec of t.interdits || []) {
        const col = st.cols.find((c) => matches(spec, c.name));
        check(!col, col ? `${col.name} ne doit plus figurer dans ${label}.` : "");
      }
      if ((t.pk || []).length) {
        const pks = st.cols.filter((c) => c.pk);
        const ok = pks.length === t.pk.length && t.pk.every((spec) => pks.some((c) => matches(spec, c.name)));
        check(ok, ok ? "" : !pks.length ? `${label} n'a pas de clé primaire.`
          : t.pk.length > 1 ? `La clé primaire de ${label} n'est pas la bonne : pensez à une clé composée de ${t.pk.length} attributs.`
          : `La clé primaire de ${label} n'est pas la bonne.`);
      }
      for (const [spec, ref] of Object.entries(t.fk || {})) {
        const col = st.cols.find((c) => matches(spec, c.name));
        if (!col) { total++; continue; } // déjà signalé comme manquant
        check(refOk(col.fk, ref), !col.fk
          ? `Dans ${label}, ${col.name} doit faire référence à une autre table (clé étrangère) : tirez une flèche vers la table concernée.`
          : `Dans ${label}, la clé étrangère ${col.name} ne pointe pas vers la bonne table.`);
      }
      const known = [...required, ...(t.optionnels || [])];
      const extra = st.cols.filter((c) => !known.some((spec) => matches(spec, c.name)) && !isDepart);
      if (extra.length) notes.push(`Attribut(s) non demandé(s) dans ${label} : ${extra.map((c) => c.name).join(", ")}.`);
    }

    // tables de départ non concernées par la solution : elles doivent rester
    for (const d of depart.tables) {
      if (sol.tables.some((t) => tableNames(t).some((n) => norm(n) === norm(d.name)))) continue;
      if ((sol.tablesSupprimees || []).some((n) => norm(n) === norm(d.name))) {
        check(!student.tables.some((x) => norm(x.name) === norm(d.name)), `La table ${d.name} devrait être supprimée.`);
        continue;
      }
      const st = student.tables.find((x) => norm(x.name) === norm(d.name));
      check(!!st, `La table ${d.name} a disparu : elle doit rester dans le schéma.`);
      if (st) used.add(st);
    }
    // tables en trop
    for (const st of student.tables) {
      if (used.has(st)) continue;
      if ((sol.tablesOptionnelles || []).some((n) => norm(n) === norm(st.name))) continue;
      check(false, `La table ${st.name} ne correspond à aucune table attendue (nom, clé primaire ?).`);
    }
    return { errors, notes, partielMsg: sol.partiel || null, passed, total };
  }

  /**
   * Compare avec la solution et ses variantes ; garde la plus proche.
   * Renvoie { ok, level, messages, notes, score: {passed, total} }
   */
  /** Empreinte d'un schéma (noms, clés, références), pour savoir s'il a été modifié */
  function signature(schema) {
    return schema.tables.map((t) => norm(t.name) + "(" + t.cols.map((c) => (c.pk ? "_" : "") + norm(c.name) + (c.fk ? ">" + norm(c.fk) : "")).sort().join(",") + ")").sort().join(";");
  }

  function compare(student, depart, q) {
    if (signature(student) === signature(depart)) {
      const main = compareOne(student, depart, q.solution);
      return {
        ok: false, level: "ko", notes: [], score: { passed: main.passed, total: main.total },
        messages: ["Le schéma n'a pas encore été modifié : lisez les règles de gestion de l'énoncé, puis ajoutez ou modifiez les tables nécessaires."],
      };
    }
    const sols = [q.solution, ...(q.variantes || []).filter((v) => v && typeof v === "object" && v.tables)];
    let best = null;
    for (const sol of sols) {
      const r = compareOne(student, depart, sol);
      if (!best || r.errors.length < best.errors.length) best = r;
      if (!r.errors.length && !r.partielMsg) break;
    }
    const score = { passed: best.passed, total: best.total };
    if (!best.errors.length && best.partielMsg) {
      // score mesuré par rapport à la solution complète, pas à la variante partielle
      const main = compareOne(student, depart, q.solution);
      return { ok: false, level: "partial", messages: [best.partielMsg], notes: best.notes, score: { passed: main.passed, total: main.total } };
    }
    if (!best.errors.length) return { ok: true, level: "ok", messages: [], notes: best.notes, score };
    return { ok: false, level: best.passed / Math.max(1, best.total) >= 0.6 ? "partial" : "ko", messages: best.errors, notes: best.notes, score };
  }

  /** Notation textuelle DCG ; html=true : clé primaire soulignée, clé étrangère en italique */
  function toText(schema, html) {
    const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
    return schema.tables.map((t) => {
      const cols = t.cols.map((c) => {
        let n = (c.fk ? "#" : "") + c.name;
        if (!html) return c.pk ? `_${n}_` : n;
        n = esc(n);
        if (c.fk) n = `<i title="référence ${esc(c.fk)}">${n}</i>`;
        if (c.pk) n = `<u>${n}</u>`;
        return n;
      }).join(", ");
      return html ? `<strong>${esc(t.name)}</strong> (${cols})` : `${t.name} (${cols})`;
    }).join("\n");
  }

  // ------------------------------------------------------------------ espace de création
  /**
   * Équivalents et rôles saisis par l'enseignant :
   *   « EMPRUNTER = EMPRUNT, EMPRUNTEUR »            noms acceptés pour une table
   *   « SOUSCRIRE.Quotite = Pourcentage, Taux »       noms acceptés pour un attribut
   *   « EMPRUNTER = relier les emprunteurs et … »     rôle d'une table (autre zone de saisie)
   */
  function parseLines(text) {
    const out = [];
    for (const line of String(text || "").split(/\r?\n/)) {
      const m = /^\s*([^=]+?)\s*=\s*(.+?)\s*$/.exec(line);
      if (m) out.push([m[1], m[2]]);
    }
    return out;
  }

  function parseEquivalents(text) {
    const names = {}, attrs = {};
    for (const [k, v] of parseLines(text)) {
      const list = v.split(",").map((x) => x.trim()).filter(Boolean);
      if (k.includes(".")) attrs[norm(k.split(".")[0]) + "." + norm(k.split(".").slice(1).join("."))] = list;
      else names[norm(k)] = list;
    }
    return { names, attrs };
  }

  function parseRoles(text) {
    const roles = {};
    for (const [k, v] of parseLines(text)) roles[norm(k)] = v;
    return roles;
  }

  /**
   * Grille de correction déduite d'un schéma dessiné par l'enseignant :
   * tables nouvelles (clés, références, attributs), tables de départ modifiées
   * (attributs retirés -> « interdits », nouvelles clés ou références), tables supprimées.
   */
  function deriveSolution(depart, drawn, equivText, rolesText, tablesOptionnelles) {
    const eq = parseEquivalents(equivText);
    const roles = parseRoles(rolesText);
    const spec = (table, col) => [col, ...(eq.attrs[norm(table) + "." + norm(col)] || [])].join("|");
    const sol = { tables: [] };
    for (const t of drawn.tables) {
      const d = depart.tables.find((x) => norm(x.name) === norm(t.name));
      const pk = t.cols.filter((c) => c.pk);
      const entry = { nom: t.name };
      const alias = eq.names[norm(t.name)];
      if (alias && alias.length) entry.alias = alias;
      if (!d) {
        if (roles[norm(t.name)]) entry.role = roles[norm(t.name)];
        if (pk.length) entry.pk = pk.map((c) => spec(t.name, c.name));
        const fk = {};
        for (const c of t.cols) if (c.fk) fk[spec(t.name, c.name)] = c.fk;
        if (Object.keys(fk).length) entry.fk = fk;
        const attrs = t.cols.filter((c) => !c.pk && !c.fk).map((c) => spec(t.name, c.name));
        if (attrs.length) entry.attributs = attrs;
        sol.tables.push(entry);
        continue;
      }
      const has = (list, c) => list.some((x) => norm(x.name) === norm(c.name));
      const removed = d.cols.filter((c) => !has(t.cols, c));
      const added = t.cols.filter((c) => !has(d.cols, c));
      const dpk = d.cols.filter((c) => c.pk).map((c) => norm(c.name)).sort().join(",");
      const pkChanged = pk.map((c) => norm(c.name)).sort().join(",") !== dpk;
      const fkChanged = t.cols.filter((c) => {
        const old = d.cols.find((x) => norm(x.name) === norm(c.name));
        return c.fk && (!old || norm(old.fk) !== norm(c.fk));
      });
      if (!removed.length && !added.length && !pkChanged && !fkChanged.length) continue;
      if (removed.length) entry.interdits = removed.map((c) => spec(t.name, c.name));
      if (pkChanged) entry.pk = pk.map((c) => spec(t.name, c.name));
      if (fkChanged.length) {
        entry.fk = {};
        for (const c of fkChanged) entry.fk[spec(t.name, c.name)] = c.fk;
      }
      const attrs = added.filter((c) => !c.fk && !(pkChanged && c.pk)).map((c) => spec(t.name, c.name));
      if (attrs.length) entry.attributs = attrs;
      sol.tables.push(entry);
    }
    const gone = depart.tables.filter((d) => !drawn.tables.some((t) => norm(t.name) === norm(d.name)));
    if (gone.length) sol.tablesSupprimees = gone.map((d) => d.name);
    if (tablesOptionnelles && tablesOptionnelles.length) sol.tablesOptionnelles = tablesOptionnelles;
    return sol;
  }

  /** Équivalents et rôles d'une solution existante, sous forme de texte modifiable */
  function solutionTexts(sol) {
    const eqLines = [], roleLines = [];
    for (const t of (sol && sol.tables) || []) {
      if ((t.alias || []).length) eqLines.push(`${t.nom} = ${t.alias.join(", ")}`);
      if (t.role) roleLines.push(`${t.nom} = ${t.role}`);
      const specs = [...(t.pk || []), ...Object.keys(t.fk || {}), ...(t.attributs || []), ...(t.optionnels || []), ...(t.interdits || [])];
      const seen = new Set();
      for (const s of specs) {
        const a = alts(s);
        if (a.length > 1 && !seen.has(norm(a[0]))) { seen.add(norm(a[0])); eqLines.push(`${t.nom}.${a[0]} = ${a.slice(1).join(", ")}`); }
      }
    }
    return { equivalents: eqLines.join("\n"), roles: roleLines.join("\n") };
  }

  const api = { norm, fromDiagramSchema, departSchema, solutionSchema, compare, toText, deriveSolution, solutionTexts, parseEquivalents };
  global.SQLSchemaCheck = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
