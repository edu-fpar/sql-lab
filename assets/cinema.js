/* SQL Lab – « mode cinéma » : correction pas à pas commentée.
 *
 * La correction d'une question est analysée (SELECT … FROM … WHERE … GROUP BY …
 * HAVING … ORDER BY, ou INSERT / UPDATE / DELETE) puis découpée dans l'ordre où
 * l'on raisonne, qui n'est pas l'ordre d'écriture : tables évidentes, tables de
 * passage, alias, colonnes à afficher, jointures, filtres, regroupement, tri.
 * Chaque étape dit quoi surligner sur le schéma et quelle partie de la requête
 * apparaît. Aucun scénario à écrire : un champ facultatif « cinema » de la
 * question permet seulement de remplacer les commentaires d'une phase.
 *
 * SQLCinema.build(sql, schema, q) -> { kind, phases, steps } (sans DOM, testable)
 * new SQLCinema.Player(els, opts)  -> lecteur dans une boîte de dialogue
 */
(function (global) {
  "use strict";

  // ------------------------------------------------------------ masques
  // Deux masques de même longueur que la requête :
  //  - « split » : chaînes et contenu des parenthèses neutralisés (découpage au niveau 0)
  //  - « ident » : chaînes et sous-requêtes neutralisées (recherche des colonnes)
  const HIDE = "·";

  function masks(sql) {
    let split = "", ident = "";
    let depth = 0, sub = 0; // sub : profondeur à laquelle commence une sous-requête masquée
    for (let i = 0; i < sql.length; i++) {
      const c = sql[i];
      const isQuote = c === "'" || c === '"' || (c === "#" && /\d/.test(sql[i + 1] || ""));
      if (isQuote) {
        let j = i + 1;
        for (; j < sql.length; j++) {
          if (sql[j] === c) { if (c !== "#" && sql[j + 1] === c) { j++; continue; } break; }
        }
        const len = Math.min(j, sql.length - 1) - i + 1;
        const inner = c + HIDE.repeat(Math.max(0, len - 2)) + (len > 1 ? c : "");
        split += depth ? HIDE.repeat(len) : inner;
        ident += sub ? HIDE.repeat(len) : inner;
        i += len - 1;
        continue;
      }
      if (c === "(") {
        depth++;
        if (!sub && /^\(\s*SELECT\b/i.test(sql.slice(i, i + 20))) { sub = depth; ident += "("; }
        else ident += sub ? HIDE : "(";
        split += depth === 1 ? "(" : HIDE;
        continue;
      }
      if (c === ")") {
        split += depth === 1 ? ")" : HIDE;
        if (sub && depth === sub) { sub = 0; ident += ")"; }
        else ident += sub ? HIDE : ")";
        depth = Math.max(0, depth - 1);
        continue;
      }
      split += depth ? HIDE : c;
      ident += sub ? HIDE : c;
    }
    return { split, ident };
  }

  /** Morceau de requête : texte d'origine + masques, mêmes indices */
  function piece(t, s, k, a = 0, b = t.length) {
    let x = a, y = b;
    while (x < y && /\s/.test(t[x])) x++;
    while (y > x && /\s/.test(t[y - 1])) y--;
    return { t: t.slice(x, y), s: s.slice(x, y), k: k.slice(x, y) };
  }
  function mk(t) { const m = masks(t); return piece(t, m.split, m.ident); }
  function sub(p, a, b) { return piece(p.t, p.s, p.k, a, b); }

  function splitBy(p, re) {
    const out = [];
    let start = 0, m;
    const g = new RegExp(re.source, "gi");
    while ((m = g.exec(p.s))) { out.push(sub(p, start, m.index)); start = m.index + m[0].length; }
    out.push(sub(p, start));
    return out.filter((x) => x.t);
  }

  /** Découpe sur AND au niveau 0, sans couper « BETWEEN x AND y » */
  function splitAnd(p) {
    const out = [];
    let start = 0, between = false, m;
    const g = /\b(AND|BETWEEN)\b/gi;
    while ((m = g.exec(p.s))) {
      if (m[1].toUpperCase() === "BETWEEN") { between = true; continue; }
      if (between) { between = false; continue; }
      out.push(sub(p, start, m.index));
      start = m.index + 3;
    }
    out.push(sub(p, start));
    return out.filter((x) => x.t);
  }

  /** Clauses de premier niveau : { SELECT: piece, FROM: piece, … } */
  function clauses(p, names) {
    const re = new RegExp("\\b(" + names.map((n) => n.replace(" ", "\\s+")).join("|") + ")\\b", "gi");
    const hits = [];
    let m;
    while ((m = re.exec(p.s))) hits.push({ name: m[1].toUpperCase().replace(/\s+/g, " "), at: m.index, end: m.index + m[0].length });
    const out = {};
    hits.forEach((h, i) => {
      if (out[h.name]) return;
      out[h.name] = sub(p, h.end, i + 1 < hits.length ? hits[i + 1].at : p.t.length);
    });
    return out;
  }

  /** Sous-requêtes présentes dans un morceau (texte intérieur) */
  function subqueries(p) {
    const out = [];
    for (let i = 0; i < p.k.length; i++) {
      if (p.k[i] !== "(" || !/^\(\s*SELECT\b/i.test(p.t.slice(i, i + 20))) continue;
      let j = i + 1;
      while (j < p.k.length && p.k[j] !== ")") j++;
      out.push(p.t.slice(i + 1, j));
      i = j;
    }
    return out;
  }

  // ------------------------------------------------------------ résolution des noms
  const low = (x) => String(x || "").toLowerCase();
  const unq = (x) => String(x || "").replace(/^[\["`]|[\]"`]$/g, "");

  function tableOf(schema, name) { return schema.find((t) => low(t.name) === low(unq(name))) || null; }
  function colOf(t, name) { return t ? t.cols.find((c) => low(c.name) === low(unq(name))) || null : null; }

  /** Référence de colonne → { e (entrée du FROM), col } */
  function resolve(from, prefix, name) {
    if (prefix) {
      const e = from.find((x) => low(x.alias) === low(prefix)) || from.find((x) => low(x.table) === low(prefix));
      const c = e && colOf(e.t, name);
      return c ? { e, col: c.name } : null;
    }
    for (const e of from) { const c = colOf(e.t, name); if (c) return { e, col: c.name }; }
    return null;
  }

  /** Colonnes citées dans un morceau (hors chaînes et sous-requêtes) */
  function columnsIn(p, from) {
    const out = [];
    const re = /(?:([A-Za-z_À-ÿ][\wÀ-ÿ]*)\s*\.\s*)?([A-Za-z_À-ÿ][\wÀ-ÿ]*)(\s*\()?/g;
    let m;
    while ((m = re.exec(p.k))) {
      if (m[3]) continue; // appel de fonction
      const r = resolve(from, m[1], m[2]);
      if (r && !out.some((x) => x.e === r.e && x.col === r.col)) out.push(r);
    }
    return out;
  }

  // ------------------------------------------------------------ analyse
  const AGG = /\b(COUNT|SUM|AVG|MIN|MAX)\s*\(/i;

  function parseFrom(p, schema) {
    const from = [], joins = [];
    const ref = (x) => {
      const m = /^([\w\[\]"`À-ÿ]+)(?:\s+(?:AS\s+)?([\wÀ-ÿ]+))?$/i.exec(x.t.replace(/\s+/g, " "));
      if (!m) return null;
      const e = { table: unq(m[1]), alias: m[2] || null, text: x.t };
      e.t = tableOf(schema, e.table);
      if (e.t) e.table = e.t.name;
      return e;
    };
    if (/\bJOIN\b/i.test(p.s)) {
      const parts = splitBy(p, /\b(?:(?:INNER|LEFT|RIGHT|FULL)\s+(?:OUTER\s+)?)?JOIN\b/);
      parts.forEach((x, i) => {
        const on = /\bON\b/i.exec(x.s);
        const tp = on ? sub(x, 0, on.index) : x;
        const e = ref(tp);
        if (e) from.push(e);
        if (on && i > 0) joins.push(...splitAnd(sub(x, on.index + 2)).map((c) => ({ p: c, explicit: true })));
      });
      return { from, onConds: joins, explicit: true };
    }
    for (const x of splitBy(p, /,/)) { const e = ref(x); if (e) from.push(e); }
    return { from, onConds: [], explicit: false };
  }

  function classify(c, from) {
    const m = /^\s*((?:[\wÀ-ÿ]+\s*\.\s*)?[\wÀ-ÿ]+)\s*=\s*((?:[\wÀ-ÿ]+\s*\.\s*)?[\wÀ-ÿ]+)\s*$/.exec(c.k);
    if (m) {
      const side = (s) => { const [a, b] = s.includes(".") ? s.split(".").map((x) => x.trim()) : [null, s.trim()]; return resolve(from, a, b); };
      const a = side(m[1]), b = side(m[2]);
      if (a && b && a.e !== b.e) return { kind: "join", a, b };
    }
    return { kind: "filter", cols: columnsIn(c, from) };
  }

  function parseSelect(sql, schema) {
    const p = mk(sql);
    const cl = clauses(p, ["SELECT", "FROM", "WHERE", "GROUP BY", "HAVING", "ORDER BY"]);
    if (!cl.SELECT || !cl.FROM) return null;
    let sel = cl.SELECT, distinct = false;
    const dm = /^DISTINCT\b/i.exec(sel.s);
    if (dm) { distinct = true; sel = sub(sel, dm[0].length); }
    const F = parseFrom(cl.FROM, schema);
    const from = F.from;
    if (!from.length) return null;
    const items = splitBy(sel, /,/).map((x) => {
      const am = /\s+(?:AS\s+)?([\wÀ-ÿ]+|\[[^\]]*\]|"[^"]*")$/i.exec(x.s);
      let expr = x, alias = null;
      // un alias sans AS n'est retenu que si l'expression n'est pas une simple colonne préfixée
      if (am && (/\bAS\s/i.test(am[0]) || /[)\w\]]\s+[\wÀ-ÿ\["]/.test(x.s)) && !/^\s*[\wÀ-ÿ.]+\s*$/.test(x.s)) {
        expr = sub(x, 0, am.index); alias = unq(x.t.slice(am.index).replace(/^\s+(?:AS\s+)?/i, ""));
      }
      return { p: x, expr, alias, cols: columnsIn(expr, from), agg: AGG.test(expr.s) };
    });
    const conds = [];
    for (const c of F.onConds) conds.push({ p: c.p, explicit: true, ...classify(c.p, from) });
    if (cl.WHERE) for (const c of splitAnd(cl.WHERE)) conds.push({ p: c, ...classify(c, from) });
    for (const c of conds) c.subs = subqueries(c.p).map((s) => build(s, schema)).filter(Boolean);
    const group = cl["GROUP BY"] ? splitBy(cl["GROUP BY"], /,/).map((x) => ({ p: x, cols: columnsIn(x, from) })) : [];
    const having = cl.HAVING ? splitAnd(cl.HAVING).map((x) => ({ p: x, cols: columnsIn(x, from), subs: subqueries(x).map((s) => build(s, schema)).filter(Boolean) })) : [];
    const order = cl["ORDER BY"] ? splitBy(cl["ORDER BY"], /,/).map((x) => {
      const desc = /\bDESC\s*$/i.test(x.s);
      const e = sub(x, 0, x.t.replace(/\s+(ASC|DESC)\s*$/i, "").length);
      return { p: x, expr: e, desc, cols: columnsIn(e, from) };
    }) : [];
    return { kind: "select", distinct, items, from, explicit: F.explicit, conds, group, having, order, fromClause: cl.FROM };
  }

  function parseWrite(sql, schema) {
    const p = mk(sql);
    let m;
    if ((m = /^UPDATE\s+([\w\[\]"À-ÿ]+)(?:\s+(?:AS\s+)?([\wÀ-ÿ]+))?\s+SET\b/i.exec(p.s))) {
      const e = { table: unq(m[1]), alias: m[2] || null }; e.t = tableOf(schema, e.table); if (e.t) e.table = e.t.name;
      const rest = sub(p, m[0].length);
      const w = /\bWHERE\b/i.exec(rest.s);
      const set = w ? sub(rest, 0, w.index) : rest;
      const where = w ? sub(rest, w.index + 5) : null;
      const sets = splitBy(set, /,/).map((x) => {
        const eq = x.s.indexOf("=");
        return { p: x, col: x.t.slice(0, eq).trim().replace(/^.*\./, ""), val: sub(x, eq + 1) };
      });
      const conds = where ? splitAnd(where).map((c) => ({ p: c, kind: "filter", cols: columnsIn(c, [e]), subs: subqueries(c).map((s) => build(s, schema)).filter(Boolean) })) : [];
      return { kind: "update", e, sets, conds, sql: p.t };
    }
    if ((m = /^DELETE\s+FROM\s+([\w\[\]"À-ÿ]+)/i.exec(p.s))) {
      const e = { table: unq(m[1]) }; e.t = tableOf(schema, e.table); if (e.t) e.table = e.t.name;
      const rest = sub(p, m[0].length);
      const w = /\bWHERE\b/i.exec(rest.s);
      const conds = w ? splitAnd(sub(rest, w.index + 5)).map((c) => ({ p: c, kind: "filter", cols: columnsIn(c, [e]), subs: subqueries(c).map((s) => build(s, schema)).filter(Boolean) })) : [];
      return { kind: "delete", e, conds, sql: p.t };
    }
    if ((m = /^INSERT\s+INTO\s+([\w\[\]"À-ÿ]+)\s*/i.exec(p.s))) {
      const e = { table: unq(m[1]) }; e.t = tableOf(schema, e.table); if (e.t) e.table = e.t.name;
      let rest = sub(p, m[0].length);
      let cols = null;
      if (rest.s[0] === "(") {
        const j = rest.s.indexOf(")");
        cols = rest.t.slice(1, j).split(",").map((x) => unq(x.trim()));
        rest = sub(rest, j + 1);
      }
      const v = /^VALUES\s*/i.exec(rest.s);
      let rows = [];
      let select = null;
      if (v) {
        const r = sub(rest, v[0].length);
        rows = splitBy(r, /,/).map((x) => {
          const inner = x.t.replace(/^\(|\)$/g, "");
          return splitBy(mk(inner), /,/).map((y) => y.t);
        });
      } else if (/^SELECT\b/i.test(rest.s)) select = build(rest.t, schema);
      if (!cols && e.t) cols = e.t.cols.map((c) => c.name);
      return { kind: "insert", e, cols: cols || [], rows, select, sql: p.t };
    }
    return null;
  }

  function statements(sql) {
    const m = masks(sql);
    const out = [];
    let start = 0;
    for (let i = 0; i < m.split.length; i++) if (m.split[i] === ";") { out.push(sql.slice(start, i)); start = i + 1; }
    out.push(sql.slice(start));
    return out.map((s) => s.replace(/--[^\n]*/g, "").trim()).filter(Boolean);
  }

  function build(sql, schema) {
    const s = statements(sql)[0];
    if (!s) return null;
    return /^SELECT\b/i.test(s) ? parseSelect(s, schema) : parseWrite(s, schema);
  }

  // ------------------------------------------------------------ rédaction
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const code = (s) => `<code>${esc(s)}</code>`;
  const tb = (s) => `<b class="cn-t">${esc(s)}</b>`;
  function listFr(a) {
    if (a.length <= 1) return a.join("");
    return a.slice(0, -1).join(", ") + " et " + a[a.length - 1];
  }
  const plural = (n, one, many) => (n > 1 ? many : one);

  function describeExpr(p) {
    const s = p.s, t = p.t;
    let m;
    if (/^\*$/.test(t.trim())) return "toutes les colonnes";
    if ((m = /^COUNT\s*\(\s*\*\s*\)$/i.exec(t.trim()))) return "compte les lignes";
    if ((m = /^COUNT\s*\(\s*DISTINCT\b/i.exec(t))) return "compte les valeurs <em>différentes</em>";
    if (/^COUNT\s*\(/i.test(s)) return "compte les lignes où la colonne est renseignée";
    if (/^SUM\s*\(/i.test(s)) return "fait la somme";
    if (/^AVG\s*\(/i.test(s)) return "calcule la moyenne";
    if (/^MIN\s*\(/i.test(s)) return "retient la plus petite valeur";
    if (/^MAX\s*\(/i.test(s)) return "retient la plus grande valeur";
    if (/^(YEAR|ANNEE)\s*\(/i.test(s)) return "extrait l'année de la date";
    if (/^(MONTH|MOIS)\s*\(/i.test(s)) return "extrait le mois de la date";
    if (/^DATEDIFF\s*\(/i.test(s)) return "nombre de jours entre deux dates";
    if (AGG.test(s)) return "calcul à partir d'un regroupement";
    if (/[-+*/]/.test(s.replace(/[\wÀ-ÿ]+\.[\wÀ-ÿ]+/g, ""))) return "colonne calculée";
    return "";
  }

  function describeCond(c) {
    const s = c.p.s, k = c.p.k;
    const subT = (c.subs || []).flatMap((q) => (q.from || (q.e ? [q.e] : [])).map((e) => e.table));
    const subTxt = subT.length ? ` sur ${listFr([...new Set(subT)].map(tb))}` : "";
    if (/\bNOT\s+EXISTS\s*\(/i.test(s)) return `<strong>sous-requête</strong>${subTxt} : je garde les lignes pour lesquelles elle ne renvoie <em>rien</em> (NOT EXISTS).`;
    if (/\bEXISTS\s*\(/i.test(s)) return `<strong>sous-requête</strong>${subTxt} : je garde les lignes pour lesquelles elle renvoie au moins une ligne (EXISTS).`;
    if (/\bNOT\s+IN\s*\(/i.test(s) && c.subs && c.subs.length) return `<strong>sous-requête</strong>${subTxt} : elle calcule d'abord une liste, puis je garde les lignes qui n'y figurent <em>pas</em> (NOT IN). C'est la traduction de « n'a jamais… », « aucun… ».`;
    if (/\bIN\s*\(/i.test(s) && c.subs && c.subs.length) return `<strong>sous-requête</strong>${subTxt} : elle calcule d'abord une liste, puis je garde les lignes qui y figurent (IN).`;
    if (c.subs && c.subs.length) return `la valeur de comparaison est calculée par une <strong>sous-requête</strong>${subTxt}, exécutée d'abord.`;
    if (/\bIS\s+NOT\s+NULL\b/i.test(s)) return "valeur <em>renseignée</em> : IS NOT NULL.";
    if (/\bIS\s+NULL\b/i.test(s)) return "valeur <em>vide</em> (non renseignée) : IS NULL — jamais <code>= NULL</code>.";
    if (/\bNOT\s+IN\s*\(/i.test(s)) return "la valeur ne doit être aucune de celles de la liste (NOT IN).";
    if (/\bIN\s*\(/i.test(s)) return "la valeur doit être l'une de celles de la liste (IN).";
    if (/\bBETWEEN\b/i.test(s)) return "BETWEEN … AND … : bornes comprises.";
    if (/\bLIKE\b/i.test(s)) return "LIKE : <code>%</code> remplace n'importe quelle suite de caractères.";
    if (/\b(YEAR|ANNEE)\s*\(/i.test(k) && /\b(MONTH|MOIS)\s*\(/i.test(k)) return "on extrait le mois et l'année de la date.";
    if (/\b(YEAR|ANNEE)\s*\(/i.test(k)) return "YEAR() extrait l'année de la date.";
    if (/\b(MONTH|MOIS)\s*\(/i.test(k)) return "MONTH() extrait le mois de la date.";
    if (/\bOR\b/i.test(s)) return "l'une <em>ou</em> l'autre condition suffit : les parenthèses évitent de mélanger OR et AND.";
    if (/'/.test(s) || /"/.test(s)) return "le texte entre apostrophes doit être écrit exactement comme dans la base.";
    if (/[#]\d|\d{2}\/\d{2}\/\d{4}/.test(c.p.t)) return "comparaison de dates.";
    return "";
  }

  function fkBetween(a, b) {
    // a.col référence-t-elle b ?
    const c = colOf(a.e.t, a.col);
    return !!(c && c.fk && low(c.fk.split(".")[0]) === low(b.e.table));
  }

  // ------------------------------------------------------------ étapes
  const PHASES_SELECT = [
    ["tables", "Tables"], ["passages", "Tables de passage"], ["alias", "Alias"], ["select", "Colonnes"],
    ["jointures", "Jointures"], ["filtres", "Filtres"], ["groupe", "Regroupement"], ["tri", "Tri"], ["resultat", "Résultat"],
  ];
  const PHASES_WRITE = [["table", "Table"], ["valeurs", "Valeurs"], ["ciblage", "Lignes visées"], ["resultat", "Résultat"]];

  function addCols(map, list, kind) {
    for (const r of list) {
      const t = r.e.table;
      map[t] = map[t] || {};
      if (!map[t][r.col] || kind === "join") map[t][r.col] = kind;
    }
    return map;
  }
  const clone = (o) => JSON.parse(JSON.stringify(o));

  function selectSteps(Q) {
    const steps = [];
    const joins = Q.conds.filter((c) => c.kind === "join");
    const filters = Q.conds.filter((c) => c.kind === "filter");
    const name = (e) => e.alias || e.table;
    const usedBy = new Map(Q.from.map((e) => [e, []]));
    const push = (list) => { for (const r of list) { const l = usedBy.get(r.e); if (l && !l.includes(r.col)) l.push(r.col); } };
    for (const it of Q.items) push(it.cols);
    for (const f of filters) push(f.cols);
    for (const g of Q.group) push(g.cols);
    for (const h of Q.having) push(h.cols);
    for (const o of Q.order) push(o.cols);
    const star = Q.items.some((it) => it.expr.t.trim() === "*");
    let main = Q.from.filter((e) => usedBy.get(e).length);
    if (!main.length || star) main = Q.from.slice();
    // COUNT(*) : la table dont on compte les lignes n'apporte aucune colonne, mais elle n'est pas
    // une simple table de passage. C'est celle qui ne porte que des clés étrangères vers les autres.
    const counted = new Set();
    if (Q.items.some((it) => /COUNT\s*\(\s*\*\s*\)/i.test(it.expr.t))) {
      for (const e of Q.from) {
        if (main.includes(e)) continue;
        const js = joins.filter((j) => j.a.e === e || j.b.e === e);
        if (js.length && js.every((j) => { const me = j.a.e === e ? j.a : j.b, other = me === j.a ? j.b : j.a; return fkBetween(me, other); })) counted.add(e);
      }
      if (counted.size === 1) main = Q.from.filter((e) => main.includes(e) || counted.has(e));
      else counted.clear();
    }
    const inter = Q.from.filter((e) => !main.includes(e));
    const tableNames = (list) => [...new Set(list.map((e) => e.table))];
    const subTables = (list) => [...new Set(list.flatMap((c) => (c.subs || []).flatMap((q) => (q.from || (q.e ? [q.e] : [])).map((e) => e.table))))];

    // état cumulatif de la requête affichée
    const shown = { select: false, from: null, where: [], group: false, having: false, order: false };
    const focus = { main: tableNames(main), inter: [], sub: [], cols: {}, aliases: {}, links: [], now: [] };
    const plainFrom = (list) => list.map((e) => e.table).join(", ");
    const hot = (list) => list.map((r) => [r.e.table, r.col]);
    const snap = (phase, title, text, newParts, extra = {}) => {
      steps.push({ phase, title, text, sql: clone(shown), fresh: newParts, focus: clone({ ...focus, ...extra }) });
      focus.now = [];
    };

    // 1. tables évidentes
    const colsTxt = (e) => counted.has(e) ? " (ce sont ses lignes que l'on compte)" : usedBy.get(e).length ? ` (${usedBy.get(e).map(esc).join(", ")})` : "";
    addCols(focus.cols, Q.items.flatMap((it) => it.cols), "sel");
    addCols(focus.cols, filters.flatMap((f) => f.cols), "filt");
    addCols(focus.cols, Q.having.flatMap((h) => h.cols), "filt");
    addCols(focus.cols, Q.group.flatMap((g) => g.cols), "grp");
    addCols(focus.cols, Q.order.flatMap((o) => o.cols), "ord");
    let t1;
    if (Q.from.length === 1) {
      t1 = `Je lis l'énoncé et je cherche où se trouvent les informations demandées : tout est dans la table ${tb(Q.from[0].table)}${colsTxt(Q.from[0])}. Une seule table, donc <strong>pas de jointure</strong>.`;
    } else {
      t1 = `Je lis l'énoncé et je repère les tables qui contiennent les informations demandées (à afficher ou à filtrer) : ` +
        listFr(main.map((e) => tb(e.table) + colsTxt(e))) + ".";
      if (!inter.length) t1 += ` Sur le schéma, elles sont reliées directement par ${plural(main.length - 1, "une flèche", "des flèches")} : pas besoin de table intermédiaire.`;
    }
    shown.from = Q.explicit ? null : (inter.length ? plainFrom(main) : plainFrom(Q.from));
    snap("tables", "Les tables évidentes", t1, ["from"], { hot: main.flatMap((e) => usedBy.get(e).map((col) => [e.table, col])) });

    // 2. tables de passage
    if (inter.length) {
      const why = inter.map((e) => {
        const nb = joins.filter((j) => j.a.e === e || j.b.e === e).map((j) => (j.a.e === e ? j.b.e : j.a.e).table);
        const u = [...new Set(nb)];
        return u.length >= 2 ? `${tb(e.table)} fait le lien entre ${listFr(u.map(tb))}` : `${tb(e.table)} est nécessaire pour atteindre ${listFr(u.map(tb)) || "les autres tables"}`;
      });
      const text = `Ces tables ne sont pas reliées directement : je suis les flèches du schéma. ${why.join(" ; ")}. ` +
        `${plural(inter.length, "Elle n'apporte", "Elles n'apportent")} aucune colonne au résultat, mais ${plural(inter.length, "elle doit", "elles doivent")} figurer dans le FROM pour faire le chemin.`;
      focus.inter = tableNames(inter);
      addCols(focus.cols, joins.flatMap((j) => [j.a, j.b]).filter((r) => inter.includes(r.e)), "join");
      shown.from = Q.explicit ? null : plainFrom(Q.from);
      snap("passages", "Les tables de passage", text, ["from"], { hot: hot(joins.flatMap((j) => [j.a, j.b]).filter((r) => inter.includes(r.e))) });
    }

    // 3. alias
    const aliased = Q.from.filter((e) => e.alias);
    if (aliased.length) {
      const twice = Q.from.filter((e, i) => Q.from.findIndex((x) => low(x.table) === low(e.table)) !== i).map((e) => e.table);
      let text = `Pour éviter de répéter les noms complets, je donne un surnom (alias) à ${plural(aliased.length, "la table", "chaque table")} dans le FROM : ` +
        listFr(aliased.map((e) => `${code(e.alias)} pour ${tb(e.table)}`)) + `. Ensuite j'écris ${code(aliased[0].alias + "." + (aliased[0].t && aliased[0].t.cols[0] ? aliased[0].t.cols[0].name : "colonne"))} au lieu du nom complet.`;
      if (twice.length) text += ` Ici la table ${tb(twice[0])} est utilisée deux fois : les alias sont <strong>obligatoires</strong> pour distinguer ses deux rôles.`;
      for (const e of aliased) focus.aliases[e.table] = focus.aliases[e.table] ? focus.aliases[e.table] + " / " + e.alias : e.alias;
      shown.from = Q.explicit ? null : Q.fromClause.t.replace(/\s+/g, " ");
      snap("alias", "Les alias", text, ["from"]);
    }

    // 4. SELECT
    {
      const lis = Q.items.map((it) => {
        let d = describeExpr(it.expr);
        const c0 = it.cols[0];
        if (!d && c0 && /\./.test(it.expr.t) && Q.from.filter((e) => colOf(e.t, c0.col)).length > 1) {
          const others = Q.from.filter((e) => e !== c0.e && colOf(e.t, c0.col));
          const same = others.filter((e) => e.table === c0.e.table);
          d = same.length
            ? `${tb(c0.e.table)} figure deux fois : l'alias ${code(c0.e.alias || c0.e.table)} dit de quelle copie il s'agit`
            : `${esc(c0.col)} existe aussi dans ${listFr([...new Set(others.map((e) => e.table))].map(tb))} : je précise la table`;
        }
        if (it.alias) d = (d ? d + ", " : "") + `colonne renommée « ${esc(it.alias)} »`;
        return `<li>${code(it.p.t)}${d ? " — " + d : ""}</li>`;
      });
      let text = `Je liste ce que je veux voir apparaître, dans l'ordre de l'énoncé :<ul>${lis.join("")}</ul>`;
      if (Q.distinct) text += `<p>« Sans doublon » : ${code("DISTINCT")} supprime les lignes identiques du résultat.</p>`;
      if (Q.items.some((it) => it.agg) && !Q.group.length) text += `<p>Pas de GROUP BY : le calcul porte sur toutes les lignes retenues, le résultat tient en <strong>une ligne</strong>.</p>`;
      text += `<p class="muted small">Le SELECT s'écrit en premier, mais on le remplit une fois qu'on sait d'où viennent les données.</p>`;
      addCols(focus.cols, Q.items.flatMap((it) => it.cols), "sel");
      shown.select = true;
      if (Q.explicit) shown.from = null;
      snap("select", "Ce que je veux voir", text, ["select"], { hot: hot(Q.items.flatMap((it) => it.cols)) });
    }

    // 5. jointures
    if (Q.explicit) {
      shown.from = Q.fromClause.t.replace(/\s+/g, " ");
      for (const j of joins) { focus.links.push([j.a.e.table, j.b.e.table]); focus.now.push([j.a.e.table, j.b.e.table]); }
      addCols(focus.cols, joins.flatMap((j) => [j.a, j.b]), "join");
      const n = Q.from.length;
      snap("jointures", "Les jointures", `${n} tables, donc ${n - 1} ${plural(n - 1, "jointure", "jointures")}, écrites ici avec ${code("INNER JOIN … ON")} : chaque ON égalise une clé étrangère et la clé primaire qu'elle référence.`, ["from"]);
    } else {
      // une jointure = une paire de tables ; plusieurs égalités si la clé est composée
      const groups = [];
      for (const j of joins) {
        const g = groups.find((x) => (x.a === j.a.e && x.b === j.b.e) || (x.a === j.b.e && x.b === j.a.e));
        if (g) g.list.push(j); else groups.push({ a: j.a.e, b: j.b.e, list: [j] });
      }
      groups.forEach((g, i) => {
        const j = g.list[0];
        const [fk, pk] = fkBetween(j.a, j.b) ? [j.a, j.b] : fkBetween(j.b, j.a) ? [j.b, j.a] : [j.a, j.b];
        const linked = fkBetween(fk, pk);
        let text = i === 0 ? `Avec ${Q.from.length} tables dans le FROM, il faut ${Q.from.length - 1} ${plural(Q.from.length - 1, "jointure", "jointures")} (une de moins que de tables), sinon chaque ligne serait combinée avec toutes les autres (produit cartésien). ` : "";
        if (g.list.length > 1) {
          text += `Je relie ${tb(fk.e.table)} et ${tb(pk.e.table)}. La clé est <strong>composée</strong> de ${g.list.length} colonnes (${listFr(g.list.map((x) => code(x.a.col)))}) : il faut égaliser <em>chacune</em> d'elles, sinon la jointure associe des lignes qui ne vont pas ensemble.`;
        } else {
          text += linked
            ? `Je relie ${tb(fk.e.table)} et ${tb(pk.e.table)} : la clé étrangère <i>#${esc(fk.col)}</i> de ${tb(fk.e.table)} pointe vers la clé primaire <u>${esc(pk.col)}</u> de ${tb(pk.e.table)}.`
            : `Je relie ${tb(j.a.e.table)} et ${tb(j.b.e.table)} par leur colonne commune.`;
          if (low(fk.col) === low(pk.col)) text += ` La colonne porte le même nom dans les deux tables : je la préfixe (${code(name(fk.e) + "." + fk.col)}).`;
        }
        if (g.a.table === g.b.table) text += ` C'est la même table utilisée deux fois (relation réflexive) : les alias distinguent les deux rôles.`;
        focus.links.push([g.a.table, g.b.table]);
        focus.now.push([g.a.table, g.b.table]);
        addCols(focus.cols, g.list.flatMap((x) => [x.a, x.b]), "join");
        for (const x of g.list) shown.where.push(Q.conds.indexOf(x));
        snap("jointures", groups.length > 1 ? `Jointure ${i + 1} / ${groups.length}` : "La jointure", text, g.list.map((x) => "w" + Q.conds.indexOf(x)), { hot: hot(g.list.flatMap((x) => [x.a, x.b])) });
      });
    }

    // 6. filtres
    filters.forEach((f, i) => {
      const d = describeCond(f);
      let text = (i === 0 ? "Je ne garde que les lignes qui répondent à l'énoncé. " : "") + `${code(f.p.t.replace(/\s+/g, " "))}` + (d ? " : " + d : ".");
      if (i > 0) text = `J'ajoute une condition avec AND : ${text}`;
      addCols(focus.cols, f.cols, "filt");
      const st = subTables([f]);
      if (st.length) focus.sub = [...new Set([...focus.sub, ...st])];
      shown.where.push(Q.conds.indexOf(f));
      snap("filtres", filters.length > 1 ? `Filtre ${i + 1} / ${filters.length}` : "Le filtre", text, ["w" + Q.conds.indexOf(f)], { hot: hot(f.cols) });
    });

    // 7. regroupement
    if (Q.group.length) {
      const plain = Q.items.filter((it) => !it.agg && it.expr.t.trim() !== "*").map((it) => code(it.expr.t));
      let text = `Le calcul est demandé « par » ${listFr(Q.group.map((g) => code(g.p.t)))} : je regroupe les lignes avec ${code("GROUP BY")}. Le calcul (${listFr(Q.items.filter((it) => it.agg).map((it) => code(it.expr.t))) || "fonction"}) est alors fait pour chaque groupe.`;
      if (plain.length) text += ` Règle : chaque colonne affichée <em>sans</em> fonction de calcul (${listFr(plain)}) doit figurer dans le GROUP BY.`;
      addCols(focus.cols, Q.group.flatMap((g) => g.cols), "grp");
      shown.group = true;
      snap("groupe", "Le regroupement", text, ["group"], { hot: hot(Q.group.flatMap((g) => g.cols)) });
    }
    if (Q.having.length) {
      const st = [...new Set(Q.having.flatMap((h) => (h.subs || []).flatMap((q) => (q.from || []).map((e) => e.table))))];
      if (st.length) focus.sub = [...new Set([...focus.sub, ...st])];
      const text = `La condition ${listFr(Q.having.map((h) => code(h.p.t)))} porte sur le <em>résultat d'un calcul</em> : elle ne peut pas aller dans le WHERE (qui filtre les lignes avant le regroupement) ; elle se place dans ${code("HAVING")}, après le GROUP BY.` +
        (st.length ? ` La valeur de comparaison vient d'une sous-requête sur ${listFr(st.map(tb))}.` : "");
      shown.having = true;
      snap("groupe", "La condition sur les groupes", text, ["having"], { hot: hot(Q.having.flatMap((h) => h.cols)) });
    }

    // 8. tri
    if (Q.order.length) {
      const text = `L'énoncé demande un tri : ` + listFr(Q.order.map((o) => `${code(o.expr.t)} ${o.desc ? "par ordre <strong>décroissant</strong> (DESC)" : "par ordre croissant (par défaut)"}`)) +
        (Q.order.length > 1 ? ". Le second critère départage les égalités du premier." : ".") + ` ${code("ORDER BY")} se place toujours à la fin.`;
      addCols(focus.cols, Q.order.flatMap((o) => o.cols), "ord");
      shown.order = true;
      snap("tri", "Le tri", text, ["order"], { hot: hot(Q.order.flatMap((o) => o.cols)) });
    }

    snap("resultat", "Le résultat", "J'exécute la requête et je vérifie que le résultat répond bien à l'énoncé (nombre de lignes, colonnes, valeurs).", [], { run: true });
    return { phases: PHASES_SELECT, steps };
  }

  function writeSteps(W) {
    const steps = [];
    const t = W.e.table;
    const focus = { main: [t], inter: [], sub: [], cols: {}, aliases: {}, links: [], now: [] };
    const shown = { parts: [] };
    const snap = (phase, title, text, parts, extra = {}) => {
      shown.parts.push(...parts);
      steps.push({ phase, title, text, sql: clone(shown), fresh: parts, focus: clone({ ...focus, ...extra }) });
    };
    const verb = { update: "modifier des lignes existantes : UPDATE", delete: "supprimer des lignes : DELETE", insert: "ajouter une ligne : INSERT INTO" }[W.kind];
    snap("table", "La table concernée", `Il s'agit de ${verb}. Je repère la table touchée : ${tb(t)}. Une requête de mise à jour ne modifie qu'<strong>une seule table</strong>.`, ["head"]);
    if (W.kind === "update") {
      const lis = W.sets.map((s) => {
        const self = new RegExp("\\b" + s.col + "\\b", "i").test(s.val.k);
        return `<li>${code(s.p.t)}${self ? " — la nouvelle valeur est calculée à partir de l'ancienne" : ""}</li>`;
      });
      focus.cols[t] = Object.fromEntries(W.sets.map((s) => [s.col, "set"]));
      snap("valeurs", "Les nouvelles valeurs", `Après ${code("SET")}, j'indique chaque colonne à changer et sa nouvelle valeur :<ul>${lis.join("")}</ul>`, ["set"]);
    }
    if (W.kind === "insert") {
      const row = W.rows[0] || [];
      const fks = W.e.t ? W.cols.map((c) => colOf(W.e.t, c)).filter((c) => c && c.fk) : [];
      const lis = W.cols.map((c, i) => `<li>${code(c)} ← ${code(row[i] !== undefined ? row[i] : "?")}</li>`);
      let text = W.select
        ? `Les valeurs proviennent d'une requête ${code("SELECT")} : chaque ligne qu'elle renvoie est ajoutée.`
        : `Les valeurs sont données dans le même ordre que les colonnes :<ul>${lis.join("")}</ul>`;
      if (fks.length) {
        text += ` ${listFr(fks.map((c) => code(c.name)))} ${plural(fks.length, "est une clé étrangère", "sont des clés étrangères")} : la valeur doit déjà exister dans ${listFr([...new Set(fks.map((c) => tb(c.fk.split(".")[0])))])}.`;
        focus.links = fks.map((c) => [t, c.fk.split(".")[0]]);
        focus.now = focus.links.slice();
        focus.inter = [...new Set(fks.map((c) => c.fk.split(".")[0]))];
      }
      text += " Les textes et les dates s'écrivent entre apostrophes, pas les nombres.";
      focus.cols[t] = Object.fromEntries(W.cols.map((c) => [c, "set"]));
      snap("valeurs", "Les valeurs à ajouter", text, ["values"]);
    }
    if (W.kind !== "insert") {
      if (W.conds.length) {
        const lis = W.conds.map((c) => { const d = describeCond(c); return `<li>${code(c.p.t.replace(/\s+/g, " "))}${d ? " — " + d : ""}</li>`; });
        focus.sub = [...new Set(W.conds.flatMap((c) => (c.subs || []).flatMap((q) => (q.from || []).map((e) => e.table))))];
        focus.cols[t] = { ...(focus.cols[t] || {}), ...Object.fromEntries(W.conds.flatMap((c) => c.cols).map((r) => [r.col, (focus.cols[t] || {})[r.col] || "filt"])) };
        let text = `Le ${code("WHERE")} cible les lignes concernées :<ul>${lis.join("")}</ul><strong>Sans WHERE, ${W.kind === "delete" ? "toutes les lignes seraient supprimées" : "toutes les lignes seraient modifiées"}.</strong>`;
        if (W.kind === "delete" && global.SQLCinemaSchema) {
          const refs = global.SQLCinemaSchema.filter((x) => x.cols.some((c) => c.fk && low(c.fk.split(".")[0]) === low(t))).map((x) => x.name);
          if (refs.length) {
            text += ` Attention : si des lignes de ${listFr(refs.map(tb))} font référence aux lignes supprimées, l'intégrité référentielle bloque la suppression.`;
            focus.links = refs.map((r) => [r, t]); focus.inter = refs;
          }
        }
        snap("ciblage", "Les lignes visées", text, ["where"]);
      } else {
        snap("ciblage", "Les lignes visées", `Pas de ${code("WHERE")} : <strong>toutes les lignes</strong> de ${tb(t)} sont concernées. C'est voulu ici, mais à vérifier à chaque fois.`, []);
      }
    }
    snap("resultat", "Le résultat", "J'exécute la requête (sur une copie de la base) et je contrôle les lignes touchées.", [], { run: true });
    return { phases: PHASES_WRITE, steps };
  }

  // ------------------------------------------------------------ évolution d'un schéma
  const PHASES_SCHEMA = [
    ["lecture", "Règles de gestion"], ["retraits", "Ce qui ne tient plus"], ["entites", "Nouvelles tables"],
    ["liens", "Clés étrangères (1 → n)"], ["associations", "Tables de liaison (n ↔ n)"], ["bilan", "Schéma final"],
  ];

  /** Commentaires remplacés par l'enseignant : { "jointures": "…", "filtres.2": "…" } (texte brut, échappé) */
  function override(out, q) {
    const over = q && q.cinema;
    if (!over || typeof over !== "object") return;
    for (const st of out.steps) if (typeof over[st.phase] === "string") st.text = esc(over[st.phase]);
    for (const [k, v] of Object.entries(over)) {
      const m = /^(\w+)\.(\d+)$/.exec(k);
      if (!m || typeof v !== "string") continue;
      const list = out.steps.filter((s) => s.phase === m[1]);
      if (list[+m[2] - 1]) list[+m[2] - 1].text = esc(v);
    }
  }

  /**
   * Correction pas à pas d'une question « schéma ».
   * depart : { tables:[{name, cols:[{name, pk, fk:"TABLE"|null}]}] } ; q.solution : format schemacheck
   */
  function schemaPlan(depart, q) {
    const SC = global.SQLSchemaCheck;
    const sol = q && q.solution;
    if (!SC || !sol || !Array.isArray(sol.tables)) return null;
    const norm = (s) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
    const first = (spec) => String(spec).split("|")[0].trim();
    const same = (spec, name) => String(spec).split("|").some((a) => norm(a) === norm(name));
    const findT = (schema, t) => schema.tables.find((x) => [t.nom, ...(t.alias || [])].some((n) => norm(n) === norm(x.name)));
    const steps = [];
    let cur = clone(depart);
    const toDiagram = (s) => s.tables.map((t) => ({ name: t.name, cols: t.cols.map((c) => ({ name: c.name, pk: !!c.pk, fk: c.fk ? c.fk + "." : undefined })) }));
    const snap = (phase, title, text, focus = {}, fresh = []) => steps.push({
      phase, title, text, edit: clone(cur), schema: toDiagram(cur), fresh,
      focus: { main: [], inter: [], sub: [], cols: {}, aliases: {}, links: [], now: [], ...focus },
    });
    const colsMap = (t, list, kind) => ({ [t]: Object.fromEntries(list.map((c) => [c, kind])) });
    const refName = (ref) => { const t = cur.tables.find((x) => norm(x.name) === norm(ref)); return t ? t.name : ref; };

    const info = sol.tables.map((t) => {
      const existing = findT(depart, t);
      const pk = (t.pk || []).map(first);
      const fk = Object.entries(t.fk || {}).map(([k, v]) => [first(k), v]);
      const fkInPk = fk.filter(([k]) => pk.some((p) => norm(p) === norm(k)));
      const kind = existing ? "modif" : pk.length >= 2 && fkInPk.length >= 2 ? "assoc" : "entite";
      return { t, existing, pk, fk, fkInPk, kind, name: existing ? existing.name : t.nom,
        attrs: (t.attributs || []).map(first), interdits: t.interdits || [], role: t.role || "" };
    });

    // 1. lecture
    {
      const n = info.filter((x) => x.kind !== "modif").length;
      snap("lecture", "Je lis les règles de gestion",
        `Je repère, dans le schéma de départ, les tables concernées par les nouvelles règles. Pour chaque règle, je cherche le <strong>type de lien</strong> :` +
        `<ul><li>« un … est lié à <em>un seul</em> … » : relation un à plusieurs, une <strong>clé étrangère</strong> suffit (du côté « plusieurs ») ;</li>` +
        `<li>« un … peut être lié à <em>plusieurs</em> …, et inversement » : relation plusieurs à plusieurs, il faut une <strong>nouvelle table</strong> ;</li>` +
        `<li>un nouvel objet à décrire, avec ses propres informations : une nouvelle table.</li></ul>` +
        (n ? `<p>Ici, ${n} ${plural(n, "nouvelle table", "nouvelles tables")} à créer.</p>` : ""),
        { main: depart.tables.map((t) => t.name) });
    }

    // 2. ce qui ne tient plus
    for (const x of info.filter((i) => i.kind === "modif" && i.interdits.length)) {
      const T = cur.tables.find((t) => t.name === x.name);
      if (!T) continue;
      const gone = T.cols.filter((c) => x.interdits.some((spec) => same(spec, c.name))).map((c) => c.name);
      if (!gone.length) continue;
      const where = info.filter((o) => o !== x && gone.some((g) => o.pk.some((p) => norm(p) === norm(g)) || o.fk.some(([k]) => norm(k) === norm(g)) || o.attrs.some((a) => norm(a) === norm(g))));
      let text = `${listFr(gone.map((g) => code(g)))} ne ${plural(gone.length, "peut", "peuvent")} plus rester dans ${tb(x.name)} : dans une ligne, une colonne ne contient qu'<em>une seule</em> valeur, or la nouvelle règle en demande plusieurs.`;
      if (where.length) text += ` L'information sera reprise dans ${listFr(where.map((o) => tb(o.name)))}.`;
      snap("retraits", "Ce qui ne tient plus", text, { main: [x.name], cols: colsMap(x.name, gone, "del") });
      T.cols = T.cols.filter((c) => !gone.includes(c.name));
    }
    for (const name of sol.tablesSupprimees || []) {
      const T = cur.tables.find((t) => norm(t.name) === norm(name));
      if (!T) continue;
      snap("retraits", "Une table disparaît", `La table ${tb(T.name)} n'a plus lieu d'être avec les nouvelles règles : je la supprime, avec les flèches qui y mènent.`,
        { sub: [T.name], cols: colsMap(T.name, T.cols.map((c) => c.name), "del") });
      cur.tables = cur.tables.filter((t) => t !== T);
      for (const t of cur.tables) for (const c of t.cols) if (c.fk && norm(c.fk) === norm(T.name)) c.fk = null;
    }

    // 3. nouvelles tables (objets à décrire) : d'abord celles qui ne dépendent de rien
    const ents = info.filter((x) => x.kind === "entite").sort((a, b) => a.fk.length - b.fk.length);
    for (const x of ents) {
      cur = SC.solutionSchema(cur, { tables: [x.t] });
      const own = x.fk.filter(([k]) => !x.pk.some((p) => norm(p) === norm(k)));
      const weak = x.fkInPk;
      let text = `${x.role ? "Il faut " + esc(x.role) + " : " : ""}je crée la table ${tb(x.name)}. Sa clé primaire ${listFr(x.pk.map((p) => `<u>${esc(p)}</u>`))} identifie chaque ligne`;
      text += x.attrs.length ? ` ; elle porte ${listFr(x.attrs.map(code))}.` : ".";
      if (weak.length) text += ` Sa clé contient ${listFr(weak.map(([k, r]) => `<i>#${esc(k)}</i> (${tb(refName(r))})`))} : une ligne de ${tb(x.name)} n'existe qu'à l'intérieur de ${plural(weak.length, "cette table", "ces tables")}.`;
      if (own.length) text += ` Chaque ligne est rattachée à un seul ${listFr(own.map(([, r]) => tb(refName(r))))} : relation un à plusieurs, d'où la clé étrangère ${listFr(own.map(([k]) => `<i>#${esc(k)}</i>`))} et la flèche.`;
      const links = x.fk.map(([, r]) => [x.name, refName(r)]);
      snap("entites", "Une nouvelle table", text, {
        main: [x.name], inter: x.fk.map(([, r]) => refName(r)),
        cols: { [x.name]: { ...Object.fromEntries(x.pk.map((p) => [p, "add"])), ...Object.fromEntries(x.attrs.map((a) => [a, "sel"])), ...Object.fromEntries(x.fk.map(([k]) => [k, "join"])) } },
        links, now: links,
      }, [x.name]);
    }

    // 4. tables existantes qui gagnent une clé étrangère ou un attribut
    for (const x of info.filter((i) => i.kind === "modif")) {
      const before = clone(cur.tables.find((t) => t.name === x.name) || { cols: [] });
      const had = (n) => before.cols.some((c) => norm(c.name) === norm(n));
      const hadFk = (n) => before.cols.some((c) => norm(c.name) === norm(n) && c.fk);
      const newFk = x.fk.filter(([k]) => !hadFk(k));
      const newAttrs = x.attrs.filter((a) => !had(a));
      cur = SC.solutionSchema(cur, { tables: [x.t] });
      if (!newFk.length && !newAttrs.length) continue;
      let text = "";
      for (const [k, r] of newFk) {
        text += `<p>Chaque ligne de ${tb(x.name)} est liée à <em>un seul</em> ${tb(refName(r))}, qui peut l'être à plusieurs : relation <strong>un à plusieurs</strong>. ` +
          `J'ajoute la clé étrangère <i>#${esc(k)}</i> dans ${tb(x.name)}, du côté « plusieurs » : la flèche part de ${tb(x.name)} vers ${tb(refName(r))}.</p>`;
      }
      if (newAttrs.length) text += `<p>J'ajoute ${listFr(newAttrs.map(code))} dans ${tb(x.name)} : ${plural(newAttrs.length, "c'est une information", "ce sont des informations")} sur chaque ligne de cette table.</p>`;
      const links = newFk.map(([, r]) => [x.name, refName(r)]);
      snap("liens", newFk.length ? "Une clé étrangère" : "Un nouvel attribut", text, {
        main: [x.name], inter: newFk.map(([, r]) => refName(r)),
        cols: { [x.name]: { ...Object.fromEntries(newFk.map(([k]) => [k, "join"])), ...Object.fromEntries(newAttrs.map((a) => [a, "add"])) } },
        links, now: links,
      });
    }

    // 5. tables de liaison (plusieurs à plusieurs)
    for (const x of info.filter((i) => i.kind === "assoc")) {
      const refs = [...new Set(x.fkInPk.map(([, r]) => refName(r)))];
      cur = SC.solutionSchema(cur, { tables: [{ ...x.t, fk: {}, attributs: [] }] });
      const pkTxt = x.pk.map((p) => `<u>${esc(p)}</u>`).join(" + ");
      let text = x.role ? `Règle : il faut ${esc(x.role)}. ` : "";
      text += refs.length >= 3
        ? `Le lien concerne ${refs.length} tables à la fois (${listFr(refs.map(tb))}). `
        : `Un ${tb(refs[0] || "?")} peut être lié à plusieurs ${tb(refs[1] || refs[0] || "?")}, et inversement : relation <strong>plusieurs à plusieurs</strong>. `;
      text += `Une clé étrangère ne suffit pas (il faudrait plusieurs valeurs dans une case) : je crée la table ${tb(x.name)}. Sa clé primaire <strong>associe</strong> les clés des tables reliées : ${pkTxt}.`;
      snap("associations", "Une table de liaison", text, {
        main: [x.name], inter: refs, cols: { [x.name]: Object.fromEntries(x.pk.map((p) => [p, "add"])) },
      }, [x.name]);
      cur = SC.solutionSchema(cur, { tables: [x.t] });
      const links = x.fk.map(([, r]) => [x.name, refName(r)]);
      let t2 = `Chaque partie de la clé est aussi une <strong>clé étrangère</strong> : ${listFr(x.fk.map(([k, r]) => `<i>#${esc(k)}</i> renvoie à ${tb(refName(r))}`))}. D'où ${plural(links.length, "la flèche", "les flèches")}.`;
      if (x.attrs.length) t2 += ` ${listFr(x.attrs.map(code))} dépend${x.attrs.length > 1 ? "ent" : ""} à la fois de ${listFr(refs.map(tb))} : ${plural(x.attrs.length, "l'attribut se place", "les attributs se placent")} dans ${tb(x.name)}, la table du lien.`;
      snap("associations", "Les clés étrangères de la table de liaison", t2, {
        main: [x.name], inter: refs,
        cols: { [x.name]: { ...Object.fromEntries(x.fk.map(([k]) => [k, "join"])), ...Object.fromEntries(x.attrs.map((a) => [a, "sel"])) } },
        links, now: links,
      });
    }

    // 6. bilan
    cur = SC.solutionSchema(depart, sol);
    const changed = info.map((x) => x.name);
    const allLinks = info.flatMap((x) => x.fk.map(([, r]) => [x.name, refName(r)]));
    let text = `Le schéma final : ${listFr(changed.map(tb))} ${plural(changed.length, "a été créée ou modifiée", "ont été créées ou modifiées")}.` +
      `<p>Pour vérifier : chaque nouvelle règle est-elle traduite ? chaque table a-t-elle une clé primaire ? chaque flèche part-elle d'une clé étrangère vers une clé primaire ?</p>` +
      `<p class="muted small">Les noms peuvent varier : la vérification accepte les noms équivalents et reconnaît une table à sa clé primaire.</p>`;
    if ((q.variantes || []).length) text += `<p class="muted small">Une autre solution est aussi acceptée : voir la correction.</p>`;
    snap("bilan", "Le schéma final", text, { main: changed, links: allLinks });

    const out = { kind: "schema", phases: PHASES_SCHEMA, steps };
    override(out, q);
    return out;
  }

  function renderSchemaText(st) {
    const marks = st.focus.cols || {};
    return st.edit.tables.map((t) => {
      const m = marks[t.name] || {};
      const cols = t.cols.map((c) => {
        let n = esc((c.fk ? "#" : "") + c.name);
        if (c.fk) n = `<i>${n}</i>`;
        if (c.pk) n = `<u>${n}</u>`;
        if (m[c.name] === "del") n = `<s class="cn-del">${n}</s>`;
        else if (m[c.name] && st.phase !== "bilan") n = `<mark class="cn-new">${n}</mark>`;
        return n;
      }).join(", ");
      const line = `<strong>${esc(t.name)}</strong> (${cols})`;
      return st.fresh.includes(t.name) ? `<mark class="cn-new">${line}</mark>` : line;
    }).join("\n");
  }

  /** Point d'entrée sans DOM */
  function plan(sql, schema, q) {
    global.SQLCinemaSchema = schema;
    const list = statements(sql);
    if (!list.length) return null;
    const Q = /^SELECT\b/i.test(list[0]) ? parseSelect(list[0], schema) : parseWrite(list[0], schema);
    if (!Q) return null;
    const out = Q.kind === "select" ? selectSteps(Q) : writeSteps(Q);
    out.kind = Q.kind;
    out.parsed = Q;
    out.sql = list[0];
    out.more = list.length - 1;
    override(out, q);
    return out;
  }

  // ------------------------------------------------------------ affichage de la requête
  function renderSql(P, step) {
    const Q = P.parsed;
    const nw = new Set(step.fresh);
    const mark = (id, html) => (nw.has(id) ? `<mark class="cn-new">${html}</mark>` : html);
    const ph = '<span class="cn-ph">…</span>';
    const one = (s) => esc(s.replace(/\s+/g, " ").trim());
    const L = [];
    if (P.kind === "select") {
      const s = step.sql;
      const items = Q.items.map((it) => one(it.p.t)).join(", ");
      L.push(`<span class="kw">SELECT</span> ${s.select ? mark("select", (Q.distinct ? '<span class="kw">DISTINCT</span> ' : "") + items) : ph}`);
      L.push(`<span class="kw">FROM</span> ${s.from ? mark("from", esc(s.from)) : ph}`);
      const w = s.where.slice().sort((a, b) => a - b);
      w.forEach((i, n) => L.push(`${n ? "  <span class=\"kw\">AND</span>" : '<span class="kw">WHERE</span>'} ${mark("w" + i, one(Q.conds[i].p.t))}`));
      if (s.group) L.push(mark("group", `<span class="kw">GROUP BY</span> ${Q.group.map((g) => one(g.p.t)).join(", ")}`));
      if (s.having) L.push(mark("having", `<span class="kw">HAVING</span> ${Q.having.map((h) => one(h.p.t)).join(" AND ")}`));
      if (s.order) L.push(mark("order", `<span class="kw">ORDER BY</span> ${Q.order.map((o) => one(o.p.t)).join(", ")}`));
      return L.join("\n") + ";";
    }
    // écritures : on découpe le texte d'origine en en-tête / SET-VALUES / WHERE
    const parts = new Set(step.sql.parts);
    const txt = P.sql.replace(/\s+/g, " ").trim();
    const w = /\sWHERE\s/i.exec(masks(txt).split);
    let head = txt, body = "", where = "";
    if (P.kind === "update") {
      const st = /\sSET\s/i.exec(txt);
      head = txt.slice(0, st.index); body = w ? txt.slice(st.index + 1, w.index) : txt.slice(st.index + 1); where = w ? txt.slice(w.index + 1) : "";
    } else if (P.kind === "delete") {
      head = w ? txt.slice(0, w.index) : txt; where = w ? txt.slice(w.index + 1) : "";
    } else {
      const v = /\s(VALUES|SELECT)\b/i.exec(txt);
      head = v ? txt.slice(0, v.index) : txt; body = v ? txt.slice(v.index + 1) : "";
    }
    const kw = (s) => esc(s).replace(/^(UPDATE|DELETE FROM|INSERT INTO|SET|WHERE|VALUES)\b/i, '<span class="kw">$1</span>');
    L.push(parts.has("head") ? mark("head", kw(head)) : ph);
    if (body) L.push(parts.has("set") || parts.has("values") ? mark(P.kind === "update" ? "set" : "values", kw(body)) : ph);
    if (where) L.push(parts.has("where") ? mark("where", kw(where)) : ph);
    return L.join("\n") + ";";
  }

  // ------------------------------------------------------------ lecteur
  class Player {
    /**
     * els : { dialog, title, enonce, strip, diagram, comment, sql, result, count, first, prev, next, play, close }
     * opts : { store (load/save des dispositions), onOpenTable }
     */
    constructor(els, opts = {}) {
      this.els = els;
      this.opts = opts;
      this.i = 0;
      this.timer = null;
      els.first.addEventListener("click", () => this.go(0));
      els.prev.addEventListener("click", () => this.go(this.i - 1));
      els.next.addEventListener("click", () => this.go(this.i + 1));
      els.play.addEventListener("click", () => this.toggle());
      els.close.addEventListener("click", () => els.dialog.close());
      els.dialog.addEventListener("close", () => this.stop());
      els.strip.addEventListener("click", (e) => {
        const li = e.target.closest("[data-phase]");
        if (!li) return;
        const k = this.plan.steps.findIndex((s) => s.phase === li.dataset.phase);
        if (k >= 0) this.go(k);
      });
      els.dialog.addEventListener("keydown", (e) => {
        if (e.target.closest && e.target.closest("button") && (e.key === " " || e.key === "Enter")) return;
        if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); this.go(this.i + 1); }
        if (e.key === "ArrowLeft") { e.preventDefault(); this.go(this.i - 1); }
        if (e.key === "Home") { e.preventDefault(); this.go(0); }
      });
    }

    /** q : question, schema : [{name, cols}], engine : SQLEngine, ex : exercice */
    open({ q, schema, engine, ex, sql }) {
      const P = plan(sql, schema, q);
      if (!P) return false;
      this.engine = engine;
      this.setMode("sql");
      this.show(P, q);
      this.diagram.load(schema, ex && ex.schemaGrid, "layout:" + (ex ? ex.id : "x"));
      this.go(0);
      return true;
    }

    /** Question « schéma » : depart = schéma de départ (format schemacheck) */
    openSchema({ q, depart }) {
      const P = schemaPlan(depart, q);
      if (!P || !P.steps.length) return false;
      this.setMode("schema");
      this.show(P, q);
      // disposition calculée une fois sur le schéma final : les tables ne bougent plus ensuite
      this.layout = null;
      this.diagram.load(P.steps[P.steps.length - 1].schema, null, "cinema-schema");
      this.layout = { ...this.diagram.pos };
      this.go(0);
      return true;
    }

    setMode(mode) {
      this.mode = mode;
      const base = { fit: true, maxFit: 1.2, onOpenTable: mode === "sql" ? this.opts.onOpenTable : null };
      const store = mode === "sql" ? (this.opts.store || {}) : { load: () => this.layout, save: (k, p) => { this.layout = { ...p }; } };
      if (!this.diagram) this.diagram = new SchemaDiagram(this.els.diagram, { ...base, ...store });
      else this.diagram.opts = { ...base, ...store };
    }

    show(P, q) {
      this.plan = P;
      this.q = q;
      const els = this.els;
      els.title.textContent = (P.kind === "schema" ? "Construction du schéma pas à pas" : "Correction pas à pas") + (q.id ? ` – ${q.id}` : "");
      els.enonce.textContent = q.enonce || "";
      els.strip.innerHTML = P.phases.map(([k, label], n) => {
        const used = P.steps.some((s) => s.phase === k);
        return `<li data-phase="${k}" class="${used ? "" : "skip"}" ${used ? "" : 'title="Pas nécessaire ici"'}><span class="n">${n + 1}</span>${esc(label)}</li>`;
      }).join("");
      els.dialog.classList.toggle("cn-schema", P.kind === "schema");
      const legend = els.dialog.querySelector("#cnLegend");
      if (legend) legend.innerHTML = P.kind === "schema"
        ? '<i class="lg add"></i>nouveau <i class="lg join"></i>clé étrangère <i class="lg del"></i>retiré <i class="lg inter"></i>table reliée'
        : '<i class="lg sel"></i>affiché <i class="lg filt"></i>filtre <i class="lg join"></i>jointure <i class="lg inter"></i>table de passage';
      if (!els.dialog.open) els.dialog.showModal();
      els.next.focus();
    }

    go(i) {
      const P = this.plan;
      if (!P) return;
      this.i = Math.max(0, Math.min(P.steps.length - 1, i));
      const st = P.steps[this.i];
      const els = this.els;
      els.comment.innerHTML = `<h3>${esc(st.title)}</h3><div>${st.text}</div>`;
      els.sql.innerHTML = P.kind === "schema" ? renderSchemaText(st) : renderSql(P, st);
      if (st.schema) this.diagram.load(st.schema, null, "cinema-schema");
      els.count.textContent = `${this.i + 1} / ${P.steps.length}`;
      els.prev.disabled = els.first.disabled = this.i === 0;
      els.next.disabled = this.i === P.steps.length - 1;
      const cur = P.phases.findIndex(([k]) => k === st.phase);
      [...els.strip.children].forEach((li, n) => {
        li.classList.toggle("done", n < cur && !li.classList.contains("skip"));
        li.classList.toggle("now", n === cur);
        li.setAttribute("aria-current", n === cur ? "step" : "false");
      });
      this.diagram.focus(st.focus);
      this.frame();
      els.result.innerHTML = st.focus.run ? this.result() : "";
      if (this.i === P.steps.length - 1) this.stop();
    }

    /** Recadre le diagramme sur les tables mises en évidence si elles sortent de la vue */
    frame() {
      const wrap = this.els.diagram;
      const boxes = [...wrap.querySelectorAll(".dg-box.cn-main, .dg-box.cn-inter, .dg-box.cn-sub")];
      if (!boxes.length) return;
      const w = wrap.getBoundingClientRect();
      const r = boxes.map((b) => b.getBoundingClientRect());
      const x0 = Math.min(...r.map((b) => b.left)) - w.left + wrap.scrollLeft, x1 = Math.max(...r.map((b) => b.right)) - w.left + wrap.scrollLeft;
      const y0 = Math.min(...r.map((b) => b.top)) - w.top + wrap.scrollTop, y1 = Math.max(...r.map((b) => b.bottom)) - w.top + wrap.scrollTop;
      const visible = x0 >= wrap.scrollLeft && x1 <= wrap.scrollLeft + wrap.clientWidth && y0 >= wrap.scrollTop && y1 <= wrap.scrollTop + wrap.clientHeight;
      if (visible) return;
      const fitH = y1 - y0 <= wrap.clientHeight, fitW = x1 - x0 <= wrap.clientWidth;
      wrap.scrollTo({
        left: fitW ? (x0 + x1) / 2 - wrap.clientWidth / 2 : x0 - 12,
        top: fitH ? (y0 + y1) / 2 - wrap.clientHeight / 2 : y0 - 12,
        behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      });
    }

    result() {
      const P = this.plan;
      let html = "";
      try {
        const r = this.engine.run(P.sql);
        if (P.kind === "select" && r.result) {
          const { columns, values } = r.result;
          const max = 8;
          html = `<p class="small"><strong>${values.length}</strong> ${plural(values.length, "ligne", "lignes")}${values.length > max ? ` (les ${max} premières)` : ""}</p>` +
            `<div class="table-wrap"><table class="grid"><thead><tr>${columns.map((c) => `<th>${esc(c)}</th>`).join("")}</tr></thead><tbody>` +
            values.slice(0, max).map((row) => `<tr>${row.map((v) => `<td>${v === null ? '<span class="null">NULL</span>' : esc(v)}</td>`).join("")}</tr>`).join("") +
            "</tbody></table></div>";
        } else {
          html = `<p class="small"><strong>${r.changes}</strong> ${plural(r.changes, "ligne touchée", "lignes touchées")} (sur une copie : la base n'est pas modifiée).</p>`;
        }
        if (P.more) html += `<p class="muted small">La correction contient ${P.more + 1} requêtes : seule la première est détaillée ici.</p>`;
      } catch (e) {
        html = `<p class="small">Exécution impossible : ${esc(e.message)}</p>`;
      }
      return html;
    }

    toggle() { if (this.timer) this.stop(); else { if (this.i === this.plan.steps.length - 1) this.go(0); this.start(); } }
    start() {
      this.els.play.textContent = "⏸ Pause";
      this.els.play.setAttribute("aria-pressed", "true");
      const tick = () => {
        const st = this.plan.steps[this.i];
        const len = (st.text.replace(/<[^>]+>/g, "").length || 100);
        this.timer = setTimeout(() => { this.go(this.i + 1); if (this.timer) tick(); }, Math.min(14000, 2500 + len * 45));
      };
      tick();
    }
    stop() {
      clearTimeout(this.timer);
      this.timer = null;
      this.els.play.textContent = "⏵ Lecture auto";
      this.els.play.setAttribute("aria-pressed", "false");
    }
  }

  global.SQLCinema = { plan, schemaPlan, build, masks, statements, renderSql, renderSchemaText, Player };
})(typeof window !== "undefined" ? window : globalThis);
