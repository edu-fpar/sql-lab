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

  const I18N = global.I18N || { lang: "fr", add() {}, t: (s, v) => (v ? s.replace(/\{(\w+)\}/g, (m, k) => (v[k] !== undefined ? v[k] : m)) : s), n: (c, a, b, v) => (c > 1 ? b : a).replace(/\{(\w+)\}/g, (m, k) => (k === "n" ? c : v && v[k] !== undefined ? v[k] : m)) };
  const t = I18N.t;
  I18N.add({
    "« {x} »": "“{x}”",
    " et ": " and ",
    "synchronisation": "synchronisation",
    "sans nom": "unnamed",
    "condition incomplète": "incomplete condition",
    "parenthèse non fermée": "unclosed bracket",
    "« {x} » inattendu": "unexpected “{x}”",
    "condition vide": "empty condition",
    "opérateur manquant (et / ou)": "missing operator (and / or)",
    "Le schéma ne contient aucune opération.": "The diagram has no operation.",
    "Un événement n'a pas de nom.": "An event has no name.",
    "L'événement {n} ne peut être produit que par une opération (flèche partant d'une règle d'émission).": "The event {n} can only be produced by an operation (an arrow starting from an output rule).",
    "L'événement {n} doit déclencher une opération ou entrer dans une synchronisation.": "The event {n} must trigger an operation or go into a synchronisation.",
    "L'événement {n} n'est relié à rien.": "The event {n} is not connected to anything.",
    "Une opération n'a pas de nom.": "An operation has no name.",
    "L'opération {n} n'est déclenchée par aucun événement.": "The operation {n} is not triggered by any event.",
    "L'opération {n} reçoit {k} flèches : quand une opération attend plusieurs événements, il faut une synchronisation.": "The operation {n} receives {k} arrows: when an operation waits for several events, you need a synchronisation.",
    "Pas de flèche directe d'une opération vers une autre ({n}) : une opération produit un événement, qui déclenche la suivante.": "No direct arrow from one operation to another ({n}): an operation produces an event, which triggers the next one.",
    "L'opération {n} n'a pas de règle d'émission (par exemple « Toujours »).": "The operation {n} has no output rule (for example “Always”).",
    "La règle « {r} » de l'opération {n} ne produit aucun événement.": "The rule “{r}” of the operation {n} does not produce any event.",
    "L'opération {n} doit produire des événements (bulles), pas déclencher directement une autre opération ou une synchronisation.": "The operation {n} must produce events (bubbles), not directly trigger another operation or a synchronisation.",
    "Une flèche de l'opération {n} ne part d'aucune règle d'émission.": "An arrow from the operation {n} does not start from any output rule.",
    "L'opération {n} doit être placée dans le couloir de l'acteur qui la réalise.": "The operation {n} must be placed in the swimlane of the actor who performs it.",
    "Une synchronisation sert à attendre plusieurs événements : celle de {s} n'en reçoit qu'un.": "A synchronisation is used to wait for several events: the one for {s} receives only one.",
    "Une synchronisation sert à attendre plusieurs événements : celle de {s} n'en reçoit aucun.": "A synchronisation is used to wait for several events: the one for {s} receives none.",
    "Seuls des événements entrent dans une synchronisation ({s}).": "Only events can go into a synchronisation ({s}).",
    "Une synchronisation déclenche une seule opération : une flèche sortante vers une opération ({s}).": "A synchronisation triggers a single operation: one outgoing arrow to an operation ({s}).",
    "La synchronisation de {s} n'a pas de condition (par exemple « A et B »).": "The synchronisation for {s} has no condition (for example “A and B”).",
    "La condition de {s} utilise {x}, qui ne correspond à aucune flèche entrante.": "The condition for {s} uses {x}, which does not match any incoming arrow.",
    "La condition de {s} n'utilise pas {x} : chaque flèche entrante doit apparaître dans la condition.": "The condition for {s} does not use {x}: every incoming arrow must appear in the condition.",
    "Condition illisible pour {s} ({e}) : utilisez les lettres des flèches, « et », « ou » et des parenthèses.": "Unreadable condition for {s} ({e}): use the arrow letters, “and”, “or” and brackets.",
    "l'opération « {x} »": "the operation “{x}”",
    "la synchronisation": "the synchronisation",
    "Il manque l'opération « {x} ».": "The operation “{x}” is missing.",
    "L'opération « {x} » : son déclenchement n'est pas lisible (vérifiez sa synchronisation).": "The operation “{x}”: what triggers it cannot be read (check its synchronisation).",
    "L'opération « {x} » doit aussi attendre : {m}.": "The operation “{x}” must also wait for: {m}.",
    "L'opération « {x} » attend {m}, qui ne fait pas partie de ce qui la déclenche.": "The operation “{x}” waits for {m}, which is not part of what triggers it.",
    "aucun événement": "no event",
    "Avec votre condition, « {x} » se déclencherait avec seulement {p} : ce n'est pas suffisant.": "With your condition, “{x}” would be triggered by {p} alone: that is not enough.",
    "Avec votre condition, « {x} » ne se déclencherait pas quand {p} est arrivé, alors que cela devrait suffire.": "With your condition, “{x}” would not be triggered when {p} has occurred, although that should be enough.",
    "Avec votre condition, « {x} » ne se déclencherait pas quand {p} sont arrivés, alors que cela devrait suffire.": "With your condition, “{x}” would not be triggered when {p} have occurred, although that should be enough.",
    "L'opération « {x} » doit avoir {k} règles d'émission{w} : elle produit des résultats différents selon le cas.": "The operation “{x}” must have {k} output rules{w}: it produces different results depending on the case.",
    "Règles d'émission de « {x} » : il manque le cas {m}.": "Output rules of “{x}”: the case {m} is missing.",
  });
  const quote = (x) => t("« {x} »", { x });

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
      if (!tk) throw new Error(t("condition incomplète"));
      if (tk.t === "not") return { op: "not", a: factor() };
      if (tk.t === "(") {
        const e = expr();
        if (!peek() || peek().t !== ")") throw new Error(t("parenthèse non fermée"));
        i++;
        return e;
      }
      if (tk.t === "atom") return { atom: tk.v };
      throw new Error(t("« {x} » inattendu", { x: tk.t === ")" ? ")" : tk.t }));
    }
    if (!toks.length) throw new Error(t("condition vide"));
    const tree = expr();
    if (i < toks.length) throw new Error(t("opérateur manquant (et / ou)"));
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
    const name = (n) => quote(n.label || (n.kind === "sync" ? t("synchronisation") : t("sans nom")));
    const kindOf = (id) => (byId.get(id) || {}).kind;

    if (!model.nodes.some((n) => n.kind === "operation")) errors.push(t("Le schéma ne contient aucune opération."));
    for (const n of model.nodes) {
      const i = inc(n), o = out(n);
      if (n.kind === "event") {
        if (!n.label || !n.label.trim()) errors.push(t("Un événement n'a pas de nom."));
        if (i.some((a) => kindOf(a.from) !== "operation")) errors.push(t("L'événement {n} ne peut être produit que par une opération (flèche partant d'une règle d'émission).", { n: name(n) }));
        if (o.some((a) => !["operation", "sync"].includes(kindOf(a.to)))) errors.push(t("L'événement {n} doit déclencher une opération ou entrer dans une synchronisation.", { n: name(n) }));
        if (!i.length && !o.length) errors.push(t("L'événement {n} n'est relié à rien.", { n: name(n) }));
      } else if (n.kind === "operation") {
        if (!n.label || !n.label.trim()) errors.push(t("Une opération n'a pas de nom."));
        if (!i.length) errors.push(t("L'opération {n} n'est déclenchée par aucun événement.", { n: name(n) }));
        if (i.length > 1) errors.push(t("L'opération {n} reçoit {k} flèches : quand une opération attend plusieurs événements, il faut une synchronisation.", { n: name(n), k: i.length }));
        if (i.some((a) => kindOf(a.from) === "operation")) errors.push(t("Pas de flèche directe d'une opération vers une autre ({n}) : une opération produit un événement, qui déclenche la suivante.", { n: name(n) }));
        const rules = n.rules || [];
        if (!rules.length) errors.push(t("L'opération {n} n'a pas de règle d'émission (par exemple « Toujours »).", { n: name(n) }));
        rules.forEach((r, k) => {
          const ro = o.filter((a) => a.rule === k);
          if (!ro.length) errors.push(t("La règle « {r} » de l'opération {n} ne produit aucun événement.", { r: r || t("sans nom"), n: name(n) }));
        });
        if (o.some((a) => kindOf(a.to) !== "event")) errors.push(t("L'opération {n} doit produire des événements (bulles), pas déclencher directement une autre opération ou une synchronisation.", { n: name(n) }));
        if (o.some((a) => a.rule === null || a.rule === undefined || a.rule >= rules.length)) errors.push(t("Une flèche de l'opération {n} ne part d'aucune règle d'émission.", { n: name(n) }));
        if (model.lanes.length && (n.x < 0 || n.x > model.lanes.length * LANE_W)) errors.push(t("L'opération {n} doit être placée dans le couloir de l'acteur qui la réalise.", { n: name(n) }));
      } else if (n.kind === "sync") {
        if (i.length < 2) errors.push(i.length
          ? t("Une synchronisation sert à attendre plusieurs événements : celle de {s} n'en reçoit qu'un.", { s: syncTarget(n) })
          : t("Une synchronisation sert à attendre plusieurs événements : celle de {s} n'en reçoit aucun.", { s: syncTarget(n) }));
        if (i.some((a) => kindOf(a.from) !== "event")) errors.push(t("Seuls des événements entrent dans une synchronisation ({s}).", { s: syncTarget(n) }));
        if (o.length !== 1 || kindOf(o[0].to) !== "operation") errors.push(t("Une synchronisation déclenche une seule opération : une flèche sortante vers une opération ({s}).", { s: syncTarget(n) }));
        if (!n.cond || !n.cond.trim()) errors.push(t("La synchronisation de {s} n'a pas de condition (par exemple « A et B »).", { s: syncTarget(n) }));
        else {
          try {
            const used = [...atoms(parse(n.cond))].map((x) => x.toUpperCase());
            const letters = i.map((a) => (a.letter || "").toUpperCase()).filter(Boolean);
            const unknown = used.filter((x) => !letters.includes(x));
            const missing = letters.filter((x) => !used.includes(x));
            if (unknown.length) errors.push(t("La condition de {s} utilise {x}, qui ne correspond à aucune flèche entrante.", { s: syncTarget(n), x: unknown.join(", ") }));
            if (missing.length) errors.push(t("La condition de {s} n'utilise pas {x} : chaque flèche entrante doit apparaître dans la condition.", { s: syncTarget(n), x: missing.join(", ") }));
          } catch (e) {
            errors.push(t("Condition illisible pour {s} ({e}) : utilisez les lettres des flèches, « et », « ou » et des parenthèses.", { s: syncTarget(n), e: e.message }));
          }
        }
      }
    }
    return errors;

    function syncTarget(s) {
      const o = model.arrows.find((a) => a.from === s.id);
      const tg = o && byId.get(o.to);
      return tg ? t("l'opération « {x} »", { x: tg.label }) : t("la synchronisation");
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
      if (!op) { errors.push(spec.manque || t("Il manque l'opération « {x} ».", { x: spec.operation })); continue; }
      let ok = true;
      if (spec.synchronisation) {
        const expTree = parse(spec.synchronisation);
        const expVars = [...atoms(expTree)];
        const trig = triggerOf(model, op);
        if (!trig) { errors.push(t("L'opération « {x} » : son déclenchement n'est pas lisible (vérifiez sa synchronisation).", { x: op.label })); continue; }
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
          errors.push(t("L'opération « {x} » doit aussi attendre : {m}.", { x: op.label, m: missing.map(quote).join(", ") }));
        }
        if (unknown.length) {
          ok = false;
          errors.push(t("L'opération « {x} » attend {m}, qui ne fait pas partie de ce qui la déclenche.", { x: op.label, m: unknown.map(quote).join(", ") }));
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
              const present = [...on].map(quote).join(t(" et ")) || t("aucun événement");
              errors.push(got
                ? t("Avec votre condition, « {x} » se déclencherait avec seulement {p} : ce n'est pas suffisant.", { x: op.label, p: present })
                : on.size > 1
                  ? t("Avec votre condition, « {x} » ne se déclencherait pas quand {p} sont arrivés, alors que cela devrait suffire.", { x: op.label, p: present })
                  : t("Avec votre condition, « {x} » ne se déclencherait pas quand {p} est arrivé, alors que cela devrait suffire.", { x: op.label, p: present }));
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
          errors.push(t("L'opération « {x} » doit avoir {k} règles d'émission{w} : elle produit des résultats différents selon le cas.", { x: op.label, k: nWant, w: want ? " (" + want.join(" / ") + ")" : "" }));
        } else if (want) {
          const miss = want.filter((w) => !rules.some((r) => matchName(r, w, eq)));
          if (miss.length) { ok = false; errors.push(t("Règles d'émission de « {x} » : il manque le cas {m}.", { x: op.label, m: miss.map(quote).join(", ") })); }
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
