/* SQL Lab – questions « processus » : schéma événements-résultats en couloirs.
 *
 * Modèle (étudiant, solution) :
 *   {
 *     lanes: ["Patient", "Standard", …],                 // couloirs (acteurs), de gauche à droite
 *     nodes: [ { id, kind: "event"|"operation"|"sync", label, x, y,
 *                actions: [..] (opération), rules: [..] (opération : règles d'émission),
 *                cond: "A et (B ou C)" (synchronisation) } ],
 *     arrows: [ { id, from, rule (indice de règle si la source est une opération), to, letter } ]
 *   }
 * x, y : centre de l'élément ; le couloir se déduit de x (largeur LANE_W).
 *
 * Vérifications :
 *  1. la grammaire du formalisme (toujours) ;
 *  2. les synchronisations attendues (q.attendus) : la logique de déclenchement de
 *     l'opération est comparée à la condition attendue sur toutes les combinaisons
 *     d'événements (« (B ou C) et A » équivaut à « A et (B ou C) »).
 */
(function (global) {
  "use strict";

  const LANE_W = 240;
  const norm = (s) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
  const laneOf = (n, model) => Math.max(0, Math.min(model.lanes.length - 1, Math.floor(n.x / LANE_W)));

  // ------------------------------------------------------------ expressions logiques
  const OPS = /(\(|\)|&&|\|\||&|\||(?<![\p{L}\d])(?:ET|OU|AND|OR|NON|NOT|SAUF)(?![\p{L}\d]))/giu;

  function tokenize(src) {
    const out = [];
    // un nom entre guillemets reste un nom, même s'il contient « et » ou « ou » : "Lundi ou jeudi"
    for (const chunk of String(src || "").split(/("[^"]*"|«[^»]*»)/)) {
      if (/^(".*"|«.*»)$/s.test(chunk)) {
        const v = chunk.slice(1, -1).trim();
        if (v) out.push({ t: "atom", v });
        continue;
      }
      tokenizePlain(chunk, out);
    }
    return out;
  }

  function tokenizePlain(src, out) {
    for (const part of String(src || "").split(OPS)) {
      if (part === undefined) continue;
      const p = part.trim();
      if (!p) continue;
      const u = p.toUpperCase();
      if (p === "(" || p === ")") out.push({ t: p });
      else if (u === "ET" || u === "AND" || p === "&" || p === "&&") out.push({ t: "and" });
      else if (u === "OU" || u === "OR" || p === "|" || p === "||") out.push({ t: "or" });
      else if (u === "NON" || u === "NOT" || u === "SAUF") out.push({ t: "not" });
      else out.push({ t: "atom", v: p });
    }
    return out;
  }

  /** « A et (B ou C) » -> arbre ; lève une erreur si illisible */
  function parse(src) {
    const toks = tokenize(src);
    let i = 0;
    const peek = () => toks[i];
    function expr() {
      let left = term();
      while (peek() && peek().t === "or") { i++; left = { op: "or", a: left, b: term() }; }
      return left;
    }
    function term() {
      let left = factor();
      while (peek() && peek().t === "and") { i++; left = { op: "and", a: left, b: factor() }; }
      return left;
    }
    function factor() {
      const tk = toks[i++];
      if (!tk) throw new Error("condition incomplète");
      if (tk.t === "not") return { op: "not", a: factor() };
      if (tk.t === "(") {
        const e = expr();
        if (!peek() || peek().t !== ")") throw new Error("parenthèse non fermée");
        i++;
        return e;
      }
      if (tk.t === "atom") return { atom: tk.v };
      throw new Error(`« ${tk.t === ")" ? ")" : tk.t} » inattendu`);
    }
    if (!toks.length) throw new Error("condition vide");
    const tree = expr();
    if (i < toks.length) throw new Error("opérateur manquant (et / ou)");
    return tree;
  }

  function atoms(tree, out = new Set()) {
    if (tree.atom !== undefined) out.add(tree.atom);
    else { atoms(tree.a, out); if (tree.b) atoms(tree.b, out); }
    return out;
  }

  function evaluate(tree, val) {
    if (tree.atom !== undefined) return !!val(tree.atom);
    if (tree.op === "not") return !evaluate(tree.a, val);
    if (tree.op === "and") return evaluate(tree.a, val) && evaluate(tree.b, val);
    return evaluate(tree.a, val) || evaluate(tree.b, val);
  }

  // ------------------------------------------------------------ grammaire
  function grammar(model) {
    const errors = [];
    const byId = new Map(model.nodes.map((n) => [n.id, n]));
    const inc = (n) => model.arrows.filter((a) => a.to === n.id);
    const out = (n) => model.arrows.filter((a) => a.from === n.id);
    const name = (n) => `« ${n.label || (n.kind === "sync" ? "synchronisation" : "sans nom")} »`;
    const kindOf = (id) => (byId.get(id) || {}).kind;

    if (!model.nodes.some((n) => n.kind === "operation")) errors.push("Le schéma ne contient aucune opération.");
    for (const n of model.nodes) {
      const i = inc(n), o = out(n);
      if (n.kind === "event") {
        if (!n.label || !n.label.trim()) errors.push("Un événement n'a pas de nom.");
        if (i.some((a) => kindOf(a.from) !== "operation")) errors.push(`L'événement ${name(n)} ne peut être produit que par une opération (flèche partant d'une règle d'émission).`);
        if (o.some((a) => !["operation", "sync"].includes(kindOf(a.to)))) errors.push(`L'événement ${name(n)} doit déclencher une opération ou entrer dans une synchronisation.`);
        if (!i.length && !o.length) errors.push(`L'événement ${name(n)} n'est relié à rien.`);
      } else if (n.kind === "operation") {
        if (!n.label || !n.label.trim()) errors.push("Une opération n'a pas de nom.");
        if (!i.length) errors.push(`L'opération ${name(n)} n'est déclenchée par aucun événement.`);
        if (i.length > 1) errors.push(`L'opération ${name(n)} reçoit ${i.length} flèches : quand une opération attend plusieurs événements, il faut une synchronisation.`);
        if (i.some((a) => kindOf(a.from) === "operation")) errors.push(`Pas de flèche directe d'une opération vers une autre (${name(n)}) : une opération produit un événement, qui déclenche la suivante.`);
        const rules = n.rules || [];
        if (!rules.length) errors.push(`L'opération ${name(n)} n'a pas de règle d'émission (par exemple « Toujours »).`);
        rules.forEach((r, k) => {
          const ro = o.filter((a) => a.rule === k);
          if (!ro.length) errors.push(`La règle « ${r || "sans nom"} » de l'opération ${name(n)} ne produit aucun événement.`);
        });
        if (o.some((a) => kindOf(a.to) !== "event")) errors.push(`L'opération ${name(n)} doit produire des événements (bulles), pas déclencher directement une autre opération ou une synchronisation.`);
        if (o.some((a) => a.rule === null || a.rule === undefined || a.rule >= rules.length)) errors.push(`Une flèche de l'opération ${name(n)} ne part d'aucune règle d'émission.`);
        if (model.lanes.length && (n.x < 0 || n.x > model.lanes.length * LANE_W)) errors.push(`L'opération ${name(n)} doit être placée dans le couloir de l'acteur qui la réalise.`);
      } else if (n.kind === "sync") {
        if (i.length < 2) errors.push(`Une synchronisation sert à attendre plusieurs événements : celle de ${syncTarget(n)} n'en reçoit ${i.length ? "qu'un" : "aucun"}.`);
        if (i.some((a) => kindOf(a.from) !== "event")) errors.push(`Seuls des événements entrent dans une synchronisation (${syncTarget(n)}).`);
        if (o.length !== 1 || kindOf(o[0].to) !== "operation") errors.push(`Une synchronisation déclenche une seule opération : une flèche sortante vers une opération (${syncTarget(n)}).`);
        if (!n.cond || !n.cond.trim()) errors.push(`La synchronisation de ${syncTarget(n)} n'a pas de condition (par exemple « A et B »).`);
        else {
          try {
            const used = [...atoms(parse(n.cond))].map((x) => x.toUpperCase());
            const letters = i.map((a) => (a.letter || "").toUpperCase()).filter(Boolean);
            const unknown = used.filter((x) => !letters.includes(x));
            const missing = letters.filter((x) => !used.includes(x));
            if (unknown.length) errors.push(`La condition de ${syncTarget(n)} utilise ${unknown.join(", ")}, qui ne correspond à aucune flèche entrante.`);
            if (missing.length) errors.push(`La condition de ${syncTarget(n)} n'utilise pas ${missing.join(", ")} : chaque flèche entrante doit apparaître dans la condition.`);
          } catch (e) {
            errors.push(`Condition illisible pour ${syncTarget(n)} (${e.message}) : utilisez les lettres des flèches, « et », « ou » et des parenthèses.`);
          }
        }
      }
    }
    return errors;

    function syncTarget(s) {
      const o = model.arrows.find((a) => a.from === s.id);
      const t = o && byId.get(o.to);
      return t ? `l'opération « ${t.label} »` : "la synchronisation";
    }
  }

  // ------------------------------------------------------------ synchronisations attendues
  /** Fonction de déclenchement d'une opération : { vars: Set(libellés), fn(val) } ou null */
  function triggerOf(model, op) {
    const byId = new Map(model.nodes.map((n) => [n.id, n]));
    const inc = model.arrows.filter((a) => a.to === op.id);
    if (inc.length !== 1) return null;
    const src = byId.get(inc[0].from);
    if (!src) return null;
    if (src.kind === "event") return { vars: new Set([src.label]), fn: (val) => val(src.label) };
    if (src.kind !== "sync") return null;
    const letters = {};
    for (const a of model.arrows.filter((x) => x.to === src.id)) {
      const e = byId.get(a.from);
      if (e && a.letter) letters[a.letter.toUpperCase()] = e.label;
    }
    let tree;
    try { tree = parse(src.cond); } catch (e) { return null; }
    return { vars: new Set(Object.values(letters)), fn: (val) => evaluate(tree, (atom) => val(letters[atom.toUpperCase()])) };
  }

  const matchName = (label, canonical, eq) => {
    const a = norm(label), b = norm(canonical);
    if (!a || !b) return false;
    if (a === b) return true;
    if ((eq[canonical] || []).some((x) => norm(x) === a)) return true;
    return Math.min(a.length, b.length) >= 6 && (a.includes(b) || b.includes(a));
  };

  /** Opération de l'étudiant correspondant à un attendu : noms exacts d'abord, puis approchants ;
   *  une opération déjà associée à un autre attendu n'est pas reprise */
  function findOperation(model, spec, used = new Set()) {
    const names = [spec.operation, ...(spec.alias || [])];
    const ops = model.nodes.filter((n) => n.kind === "operation" && !used.has(n.id));
    return ops.find((n) => names.some((nm) => norm(nm) === norm(n.label)))
      || ops.find((n) => names.some((nm) => matchName(n.label, nm, {})));
  }

  /** Associe chaque attendu à une opération (les correspondances exactes passent en premier) */
  function matchOperations(model, specs) {
    const used = new Set(), out = new Map();
    for (const exactOnly of [true, false]) {
      for (const spec of specs) {
        if (out.has(spec)) continue;
        // plusieurs attendus pour la même opération (synchronisation, règles) : même opération
        const twin = specs.find((s) => s !== spec && out.has(s) && norm(s.operation) === norm(spec.operation));
        if (twin) { out.set(spec, out.get(twin)); continue; }
        const names = [spec.operation, ...(spec.alias || [])];
        const ops = model.nodes.filter((n) => n.kind === "operation" && !used.has(n.id));
        const op = exactOnly ? ops.find((n) => names.some((nm) => norm(nm) === norm(n.label))) : findOperation(model, spec, used);
        if (op) { out.set(spec, op); used.add(op.id); }
      }
    }
    return out;
  }

  function checkExpected(model, q) {
    const errors = [];
    let passed = 0, total = 0;
    const eq = q.equivalents || {};
    const opMap = matchOperations(model, q.attendus || []);
    for (const spec of q.attendus || []) {
      total++;
      const op = opMap.get(spec);
      if (!op) { errors.push(spec.manque || `Il manque l'opération « ${spec.operation} ».`); continue; }
      let ok = true;
      if (spec.synchronisation) {
        const expTree = parse(spec.synchronisation);
        const expVars = [...atoms(expTree)];
        const trig = triggerOf(model, op);
        if (!trig) { errors.push(`L'opération « ${op.label} » : son déclenchement n'est pas lisible (vérifiez sa synchronisation).`); continue; }
        // correspondance des événements de l'étudiant avec ceux attendus
        // d'abord les noms identiques ou déclarés équivalents, puis les noms qui se contiennent ;
        // chaque événement attendu n'est associé qu'une fois (« Fiche patient » ≠ « Fiche patient créée »)
        const map = {};
        const unknown = [];
        const used = new Set();
        const exact = (v, x) => norm(v) === norm(x) || (eq[x] || []).some((y) => norm(y) === norm(v));
        const pending = [];
        for (const v of trig.vars) {
          const c = expVars.find((x) => !used.has(x) && exact(v, x));
          if (c) { map[v] = c; used.add(c); } else pending.push(v);
        }
        // événements facultatifs tolérés par le corrigé : considérés comme toujours arrivés
        const optional = new Set();
        for (const v of pending) {
          const c = expVars.find((x) => !used.has(x) && matchName(v, x, eq));
          if (c) { map[v] = c; used.add(c); }
          else if ((spec.facultatifs || []).some((f) => matchName(v, f, eq))) optional.add(v);
          else unknown.push(v);
        }
        const missing = expVars.filter((x) => !Object.values(map).includes(x));
        if (missing.length) {
          ok = false;
          errors.push(`L'opération « ${op.label} » doit aussi attendre : ${missing.map((m) => "« " + m + " »").join(", ")}.`);
        }
        if (unknown.length) {
          ok = false;
          errors.push(`L'opération « ${op.label} » attend ${unknown.map((m) => "« " + m + " »").join(", ")}, qui ne fait pas partie de ce qui la déclenche.`);
        }
        if (ok) {
          // table de vérité sur les événements attendus
          const n = expVars.length;
          for (let mask = 0; mask < 1 << n && ok; mask++) {
            const on = new Set(expVars.filter((_, k) => mask & (1 << k)));
            const want = evaluate(expTree, (a) => on.has(a));
            const got = trig.fn((lbl) => optional.has(lbl) || on.has(map[lbl]));
            if (want !== got) {
              ok = false;
              const present = [...on].map((m) => "« " + m + " »").join(" et ") || "aucun événement";
              errors.push(got
                ? `Avec votre condition, « ${op.label} » se déclencherait avec seulement ${present} : ce n'est pas suffisant.`
                : `Avec votre condition, « ${op.label} » ne se déclencherait pas quand ${present} ${on.size > 1 ? "sont arrivés" : "est arrivé"}, alors que cela devrait suffire.`);
            }
          }
        }
      }
      if (spec.regles) {
        const rules = op.rules || [];
        const want = Array.isArray(spec.regles) ? spec.regles : null;
        const nWant = want ? want.length : +spec.regles;
        if (rules.length < nWant) {
          ok = false;
          errors.push(`L'opération « ${op.label} » doit avoir ${nWant} règles d'émission${want ? " (" + want.join(" / ") + ")" : ""} : elle produit des résultats différents selon le cas.`);
        } else if (want) {
          const miss = want.filter((w) => !rules.some((r) => matchName(r, w, eq)));
          if (miss.length) { ok = false; errors.push(`Règles d'émission de « ${op.label} » : il manque le cas ${miss.map((m) => "« " + m + " »").join(", ")}.`); }
        }
      }
      if (ok) passed++;
    }
    return { errors, passed, total };
  }

  /** { ok, level, messages, notes, score } */
  function check(model, q) {
    const g = grammar(model);
    const e = checkExpected(model, q);
    const total = e.total + 1;
    const passed = e.passed + (g.length ? 0 : 1);
    const messages = [...g, ...e.errors];
    const ok = !messages.length;
    return {
      ok,
      level: ok ? "ok" : passed / total >= 0.5 ? "partial" : "ko",
      messages,
      notes: [],
      score: { passed, total, grammar: g.length },
    };
  }

  const api = { LANE_W, parse, atoms, evaluate, grammar, check, laneOf, norm };
  global.SQLProcessCheck = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
