/* SQL Lab – éditeur de schéma événements-résultats (questions « processus »).
 * Couloirs (acteurs) en colonnes ; événements (bulles), opérations (cases avec actions et
 * règles d'émission), synchronisations (trapèzes avec condition) ; flèches tirées depuis
 * les poignées ● ; panneau de propriétés ; export PNG / SVG.
 */
(function (global) {
  "use strict";

  const NS = "http://www.w3.org/2000/svg";
  const LANE_W = (global.SQLProcessCheck && SQLProcessCheck.LANE_W) || 240;
  const HEAD = 38;
  const OP_W = 200, OP_TITLE = 24, OP_LINE = 17, OP_RULES = 26;
  const SY_TOP = 170, SY_BOT = 110, SY_H = 42;
  const FONT = "12.5px system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";
  const LETTERS = "ABCDEFGHIJKLMNOP";

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const ctx = document.createElement("canvas").getContext("2d");
  const tw = (s) => { ctx.font = FONT; return ctx.measureText(s).width; };
  function el(name, attrs = {}, parent) {
    const e = document.createElementNS(NS, name);
    for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
    if (parent) parent.appendChild(e);
    return e;
  }
  /** Coupe un texte en lignes d'au plus maxW pixels */
  function wrap(text, maxW) {
    const words = String(text || "").split(/\s+/).filter(Boolean);
    const lines = [];
    let cur = "";
    for (const w of words) {
      const t = cur ? cur + " " + w : w;
      if (tw(t) <= maxW || !cur) cur = t; else { lines.push(cur); cur = w; }
    }
    if (cur) lines.push(cur);
    return lines.length ? lines : [""];
  }

  // ------------------------------------------------------------ géométrie
  function geom(n) {
    if (n.kind === "event") {
      const lines = wrap(n.label, 118);
      const rx = 74, ry = Math.max(30, 12 + lines.length * 8.5);
      return { lines, rx, ry, w: rx * 2, h: ry * 2 };
    }
    if (n.kind === "sync") return { w: SY_TOP, h: SY_H };
    const actions = [];
    for (const a of n.actions && n.actions.length ? n.actions : [""]) actions.push(...wrap(a ? "- " + a : "", OP_W - 14));
    const title = wrap(n.label, OP_W - 12);
    const rules = n.rules && n.rules.length ? n.rules : [];
    const h = OP_TITLE + (title.length - 1) * 15 + 6 + actions.length * OP_LINE + 6 + OP_RULES;
    return { w: OP_W, h, title, actions, rules };
  }

  /** Point de sortie d'une flèche */
  function outPoint(n, g, rule) {
    if (n.kind === "event") return { x: n.x, y: n.y + g.ry };
    if (n.kind === "sync") return { x: n.x, y: n.y + g.h / 2 };
    const k = Math.max(1, g.rules.length);
    const left = n.x - g.w / 2;
    return { x: left + (g.w * ((rule || 0) + 0.5)) / k, y: n.y + g.h / 2 };
  }

  /** Point d'arrivée sur le bord de la cible, dans la direction de la source */
  function inPoint(n, g, from) {
    const dx = from.x - n.x, dy = from.y - n.y;
    if (n.kind === "event") {
      const t = 1 / Math.sqrt((dx * dx) / (g.rx * g.rx) + (dy * dy) / (g.ry * g.ry) || 1);
      return { x: n.x + dx * t, y: n.y + dy * t };
    }
    if (n.kind === "sync") return { x: n.x + Math.max(-SY_TOP / 2 + 10, Math.min(SY_TOP / 2 - 10, dx * 0.25)), y: n.y - SY_H / 2 };
    const hw = g.w / 2, hh = g.h / 2;
    const s = Math.min(Math.abs(dx) > 0.01 ? hw / Math.abs(dx) : Infinity, Math.abs(dy) > 0.01 ? hh / Math.abs(dy) : Infinity);
    return { x: n.x + dx * s, y: n.y + dy * s };
  }

  class ProcessEditor {
    /**
     * @param root conteneur
     * @param opts { readonly, onChange(model), onReset(), palette: [{kind,label}], fixedLanes: bool }
     */
    constructor(root, opts = {}) {
      this.root = root;
      this.opts = opts;
      this.model = { lanes: [], nodes: [], arrows: [] };
      this.sel = null; // { type: "node"|"lane"|"arrow", id }
      this.seq = 1;
      root.classList.add("pe");
      root.innerHTML = opts.readonly
        ? `<div class="pe-canvas"></div>`
        : `<div class="pe-toolbar">
             <button type="button" class="btn small" data-add="event">◯ Événement</button>
             <button type="button" class="btn small" data-add="operation">▭ Opération</button>
             <button type="button" class="btn small" data-add="sync">⏢ Synchronisation</button>
             <button type="button" class="btn small ghost" data-add="lane">+ Acteur</button>
             <span class="spacer"></span>
             <button type="button" class="btn small ghost" data-act="png" title="Télécharger le schéma en image">⤓ PNG</button>
             <button type="button" class="btn small ghost" data-act="svg" title="Télécharger le schéma en SVG">⤓ SVG</button>
             <button type="button" class="btn small ghost" data-act="reset" title="Repartir de zéro">↺</button>
           </div>
           <div class="pe-palette" hidden></div>
           <div class="pe-main">
             <div class="pe-canvas diagram-wrap"></div>
             <aside class="pe-inspector"></aside>
           </div>
           <p class="muted small pe-help">Tirez le rond <span class="pe-dot">●</span> d'un événement, d'une synchronisation ou d'une règle d'émission vers l'élément suivant pour créer une flèche. Les flèches qui entrent dans une synchronisation reçoivent une lettre (A, B, C…) à utiliser dans sa condition.</p>`;
      this.canvas = root.querySelector(".pe-canvas");
      this.inspector = root.querySelector(".pe-inspector");
      if (!opts.readonly) this.bindToolbar();
    }

    // ------------------------------------------------------------ état
    setModel(model) {
      this.model = JSON.parse(JSON.stringify(model || { lanes: [], nodes: [], arrows: [] }));
      this.model.lanes = this.model.lanes || [];
      this.model.nodes = this.model.nodes || [];
      this.model.arrows = this.model.arrows || [];
      this.seq = 1 + Math.max(0, ...[...this.model.nodes, ...this.model.arrows].map((x) => parseInt(String(x.id).replace(/\D/g, ""), 10) || 0));
      this.sel = null;
      this.renderPalette();
      this.render();
    }
    getModel() { return JSON.parse(JSON.stringify(this.model)); }
    changed() { this.render(); if (this.opts.onChange) this.opts.onChange(this.getModel()); }
    node(id) { return this.model.nodes.find((n) => n.id === id); }
    newId(p) { return p + this.seq++; }

    // ------------------------------------------------------------ barre d'outils
    bindToolbar() {
      this.root.querySelector(".pe-toolbar").addEventListener("click", (e) => {
        const b = e.target.closest("button");
        if (!b) return;
        if (b.dataset.add === "lane") return this.addLane();
        if (b.dataset.add) return this.addNode(b.dataset.add);
        if (b.dataset.act === "png") return this.exportImage("png");
        if (b.dataset.act === "svg") return this.exportImage("svg");
        if (b.dataset.act === "reset" && confirm("Effacer votre schéma et repartir de zéro ?")) this.opts.onReset && this.opts.onReset();
      });
      this.root.querySelector(".pe-palette").addEventListener("click", (e) => {
        const b = e.target.closest("[data-pal]");
        if (!b) return;
        const p = this.opts.palette[+b.dataset.pal];
        this.addNode(p.kind, p.label);
      });
      this.inspector.addEventListener("change", (e) => this.onInspector(e));
      this.inspector.addEventListener("click", (e) => this.onInspectorClick(e));
      this.inspector.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && e.target.matches("input[type=text]")) { e.preventDefault(); e.target.blur(); }
      });
    }

    renderPalette() {
      const pal = this.root.querySelector(".pe-palette");
      if (!pal) return;
      const items = this.opts.palette || [];
      pal.hidden = !items.length;
      const used = new Set(this.model.nodes.map((n) => n.kind + "|" + n.label));
      pal.innerHTML = `<span class="muted small">Éléments proposés :</span> ` + items.map((p, i) =>
        `<button type="button" class="pe-chip ${p.kind}${used.has(p.kind + "|" + p.label) ? " used" : ""}" data-pal="${i}" title="Ajouter au schéma">${p.kind === "event" ? "◯" : p.kind === "operation" ? "▭" : "⏢"} ${esc(p.label)}</button>`).join("");
    }

    addLane() {
      let name = "Acteur", k = 2;
      while (this.model.lanes.includes(name)) name = "Acteur " + k++;
      this.model.lanes.push(name);
      this.sel = { type: "lane", id: this.model.lanes.length - 1 };
      this.changed();
      const input = this.inspector.querySelector("[data-f=lane-name]");
      if (input) { input.focus(); input.select(); }
    }

    addNode(kind, label) {
      if (!this.model.lanes.length) this.model.lanes.push("Acteur");
      const lane = this.sel && this.sel.type === "lane" ? this.sel.id
        : this.sel && this.sel.type === "node" && this.node(this.sel.id) ? Math.floor(this.node(this.sel.id).x / LANE_W) : 0;
      const inLane = this.model.nodes.filter((n) => Math.floor(n.x / LANE_W) === lane);
      const y = inLane.length ? Math.max(...inLane.map((n) => n.y + geom(n).h / 2)) + 70 : HEAD + 60;
      const n = { id: this.newId("n"), kind, label: label || (kind === "event" ? "Nouvel événement" : kind === "operation" ? "Nouvelle opération" : ""), x: lane * LANE_W + LANE_W / 2, y };
      if (kind === "operation") { n.actions = []; n.rules = ["Toujours"]; }
      if (kind === "sync") n.cond = "";
      this.model.nodes.push(n);
      this.sel = { type: "node", id: n.id };
      this.changed();
      this.renderPalette();
      const input = this.inspector.querySelector("[data-f=label], [data-f=cond]");
      if (input && !label) { input.focus(); input.select(); }
    }

    link(fromId, rule, toId) {
      const from = this.node(fromId), to = this.node(toId);
      if (!from || !to || from === to) return;
      if (this.model.arrows.some((a) => a.from === fromId && a.to === toId && (a.rule ?? null) === (rule ?? null))) return;
      const a = { id: this.newId("a"), from: fromId, rule: from.kind === "operation" ? rule : null, to: toId };
      if (to.kind === "sync") {
        const used = new Set(this.model.arrows.filter((x) => x.to === toId).map((x) => x.letter));
        a.letter = [...LETTERS].find((l) => !used.has(l));
      }
      this.model.arrows.push(a);
      this.sel = { type: "node", id: to.kind === "sync" ? to.id : fromId };
      this.changed();
    }

    deleteNode(id) {
      this.model.nodes = this.model.nodes.filter((n) => n.id !== id);
      this.model.arrows = this.model.arrows.filter((a) => a.from !== id && a.to !== id);
      this.sel = null;
    }

    // ------------------------------------------------------------ panneau de propriétés
    onInspector(e) {
      const t = e.target, f = t.dataset.f;
      if (!f || !this.sel) return;
      if (this.sel.type === "lane") {
        if (f === "lane-name") this.model.lanes[this.sel.id] = t.value.trim() || this.model.lanes[this.sel.id];
        return this.changed();
      }
      const n = this.node(this.sel.id);
      if (!n) return;
      if (f === "label") n.label = t.value.trim();
      else if (f === "actions") n.actions = t.value.split(/\r?\n/).map((x) => x.trim()).filter(Boolean);
      else if (f === "rule") n.rules[+t.dataset.i] = t.value.trim();
      else if (f === "cond") n.cond = t.value.trim();
      else return;
      this.changed();
      this.renderPalette();
    }

    onInspectorClick(e) {
      const b = e.target.closest("[data-act]");
      if (!b || !this.sel) return;
      const n = this.sel.type === "node" ? this.node(this.sel.id) : null;
      switch (b.dataset.act) {
        case "close": this.sel = null; break;
        case "del-node": this.deleteNode(n.id); this.renderPalette(); break;
        case "add-rule": n.rules.push(n.rules.length ? "Cas " + (n.rules.length + 1) : "Toujours"); break;
        case "del-rule": {
          const i = +b.dataset.i;
          n.rules.splice(i, 1);
          this.model.arrows = this.model.arrows.filter((a) => !(a.from === n.id && a.rule === i))
            .map((a) => (a.from === n.id && a.rule > i ? { ...a, rule: a.rule - 1 } : a));
          break;
        }
        case "del-arrow": this.model.arrows = this.model.arrows.filter((a) => a.id !== b.dataset.id); break;
        case "del-lane": {
          const i = this.sel.id;
          if (this.model.nodes.some((x) => Math.floor(x.x / LANE_W) === i)) { alert("Ce couloir contient encore des éléments : déplacez-les ou supprimez-les d'abord."); return; }
          this.model.lanes.splice(i, 1);
          for (const x of this.model.nodes) if (Math.floor(x.x / LANE_W) > i) x.x -= LANE_W;
          this.sel = null;
          break;
        }
        default: return;
      }
      this.changed();
    }

    renderInspector() {
      if (!this.inspector) return;
      const s = this.sel;
      if (!s) {
        this.inspector.innerHTML = `<p class="muted small">Cliquez sur un élément ou sur le nom d'un couloir pour le modifier.<br><br>
          <strong>Opération</strong> : un nom, les actions réalisées, et une règle d'émission par cas (« Toujours », ou « Patient existant » / « Patient non existant »…).<br><br>
          <strong>Synchronisation</strong> : quand une opération attend plusieurs événements ; sa condition combine les lettres des flèches avec « et », « ou » et des parenthèses.</p>`;
        return;
      }
      if (s.type === "lane") {
        this.inspector.innerHTML = `<div class="pe-head"><strong>Acteur (couloir)</strong><button type="button" class="icon-btn small" data-act="close" aria-label="Fermer">✕</button></div>
          <label class="pe-field">Nom <input type="text" data-f="lane-name" value="${esc(this.model.lanes[s.id])}"></label>
          ${this.opts.fixedLanes ? "" : `<button type="button" class="btn small ghost" data-act="del-lane">Supprimer ce couloir</button>`}`;
        return;
      }
      const n = this.node(s.id);
      if (!n) { this.inspector.innerHTML = ""; return; }
      const incoming = this.model.arrows.filter((a) => a.to === n.id);
      const outgoing = this.model.arrows.filter((a) => a.from === n.id);
      const nm = (id) => { const x = this.node(id); return x ? (x.kind === "sync" ? "synchronisation" : x.label) : "?"; };
      const arrowList = (list, dir) => list.map((a) =>
        `<li>${dir === "in" ? (a.letter ? `<b>${a.letter}</b> ← ` : "← ") + esc(nm(a.from)) : "→ " + esc(nm(a.to)) + (a.rule !== null && a.rule !== undefined && n.rules ? ` <span class="muted">(${esc(n.rules[a.rule] || "")})</span>` : "")}
          <button type="button" class="icon-btn small" data-act="del-arrow" data-id="${a.id}" title="Supprimer la flèche" aria-label="Supprimer la flèche">✕</button></li>`).join("");
      let body = "";
      if (n.kind === "event") {
        body = `<label class="pe-field">Nom de l'événement <input type="text" data-f="label" value="${esc(n.label)}"></label>`;
      } else if (n.kind === "operation") {
        body = `<label class="pe-field">Nom de l'opération <input type="text" data-f="label" value="${esc(n.label)}"></label>
          <label class="pe-field">Actions (une par ligne) <textarea data-f="actions" rows="3">${esc((n.actions || []).join("\n"))}</textarea></label>
          <div class="pe-field">Règles d'émission
            <ul class="pe-rules">${(n.rules || []).map((r, i) => `<li><input type="text" data-f="rule" data-i="${i}" value="${esc(r)}" aria-label="Règle ${i + 1}">
              <button type="button" class="icon-btn small" data-act="del-rule" data-i="${i}" title="Supprimer la règle" aria-label="Supprimer la règle">✕</button></li>`).join("")}</ul>
            <button type="button" class="btn small" data-act="add-rule">+ Règle</button>
          </div>`;
      } else {
        const letters = incoming.map((a) => `<b>${a.letter || "?"}</b> = ${esc(nm(a.from))}`).join("<br>") || "<span class='muted'>aucune flèche entrante</span>";
        body = `<label class="pe-field">Condition <input type="text" data-f="cond" value="${esc(n.cond || "")}" placeholder="A et (B ou C)"></label>
          <p class="small">${letters}</p>`;
      }
      this.inspector.innerHTML = `<div class="pe-head"><strong>${n.kind === "event" ? "Événement" : n.kind === "operation" ? "Opération" : "Synchronisation"}</strong>
          <button type="button" class="icon-btn small" data-act="close" aria-label="Fermer">✕</button></div>
        ${body}
        ${incoming.length ? `<div class="pe-field">Flèches entrantes<ul class="pe-arrows">${arrowList(incoming, "in")}</ul></div>` : ""}
        ${outgoing.length ? `<div class="pe-field">Flèches sortantes<ul class="pe-arrows">${arrowList(outgoing, "out")}</ul></div>` : ""}
        <button type="button" class="btn small ghost" data-act="del-node">Supprimer cet élément</button>`;
    }

    // ------------------------------------------------------------ dessin
    size() {
      const w = Math.max(1, this.model.lanes.length) * LANE_W;
      const h = Math.max(560, ...this.model.nodes.map((n) => n.y + geom(n).h / 2 + 90));
      return { w, h };
    }

    render() {
      const { w, h } = this.size();
      this.canvas.textContent = "";
      const svg = el("svg", { class: "pe-svg", width: w, height: h, viewBox: `0 0 ${w} ${h}`, role: "img", "aria-label": "Schéma événements-résultats" }, this.canvas);
      this.svg = svg;
      const defs = el("defs", {}, svg);
      const m = el("marker", { id: "pe-arrow", viewBox: "0 0 10 10", refX: "9", refY: "5", markerWidth: "8", markerHeight: "8", orient: "auto-start-reverse" }, defs);
      el("path", { d: "M0 0 L10 5 L0 10 z", class: "pe-arrowhead" }, m);
      // couloirs
      const gl = el("g", {}, svg);
      this.model.lanes.forEach((name, i) => {
        el("rect", { x: i * LANE_W, y: 0, width: LANE_W, height: h, class: "pe-lane" + (i % 2 ? " alt" : "") }, gl);
        const head = el("g", { class: "pe-lanehead" + (this.sel && this.sel.type === "lane" && this.sel.id === i ? " sel" : ""), "data-lane": i }, gl);
        el("rect", { x: i * LANE_W, y: 0, width: LANE_W, height: HEAD, class: "pe-lanehead-bg" }, head);
        const t = el("text", { x: i * LANE_W + LANE_W / 2, y: HEAD / 2 + 5, "text-anchor": "middle", class: "pe-lanetitle" }, head);
        t.textContent = name;
      });
      // flèches
      this.gArrows = el("g", {}, svg);
      this.arrowEls = new Map();
      for (const a of this.model.arrows) {
        const g = el("g", { class: "pe-arrowg" + (this.sel && this.sel.type === "arrow" && this.sel.id === a.id ? " sel" : ""), "data-arrow": a.id }, this.gArrows);
        const hit = el("path", { class: "pe-hit" }, g);
        const p = el("path", { class: "pe-link", "marker-end": "url(#pe-arrow)" }, g);
        const lbl = a.letter ? el("text", { class: "pe-letter", "text-anchor": "middle" }, g) : null;
        if (lbl) lbl.textContent = a.letter;
        this.arrowEls.set(a.id, { hit, p, lbl });
      }
      // éléments
      this.gNodes = el("g", {}, svg);
      this.nodeEls = new Map();
      for (const n of this.model.nodes) this.drawNode(n);
      this.updateArrows();
      this.renderInspector();
      if (!this.opts.readonly) this.bindCanvas();
    }

    drawNode(n) {
      const g0 = geom(n);
      const sel = this.sel && this.sel.type === "node" && this.sel.id === n.id;
      const g = el("g", { class: `pe-node pe-${n.kind}${sel ? " sel" : ""}`, "data-node": n.id, transform: `translate(${n.x} ${n.y})` }, this.gNodes);
      if (n.kind === "event") {
        el("ellipse", { cx: 0, cy: 0, rx: g0.rx, ry: g0.ry, class: "pe-shape" }, g);
        g0.lines.forEach((l, i) => {
          const t = el("text", { x: 0, y: (i - (g0.lines.length - 1) / 2) * 15 + 4.5, "text-anchor": "middle", class: "pe-text" }, g);
          t.textContent = l;
        });
        if (!this.opts.readonly) el("circle", { cx: 0, cy: g0.ry, r: 5.5, class: "pe-handle", "data-handle": "out" }, g);
      } else if (n.kind === "sync") {
        const a = SY_TOP / 2, b = SY_BOT / 2, hh = SY_H / 2;
        el("path", { d: `M${-a} ${-hh} H${a} L${b} ${hh} H${-b} Z`, class: "pe-shape pe-trap" }, g);
        const t = el("text", { x: 0, y: 4.5, "text-anchor": "middle", class: "pe-text pe-cond" }, g);
        t.textContent = n.cond || "condition ?";
        if (!this.opts.readonly) el("circle", { cx: 0, cy: hh, r: 5.5, class: "pe-handle", "data-handle": "out" }, g);
      } else {
        const w = g0.w, hh = g0.h / 2, top = -hh;
        el("rect", { x: -w / 2, y: top, width: w, height: g0.h, class: "pe-shape" }, g);
        const titleH = OP_TITLE + (g0.title.length - 1) * 15;
        el("rect", { x: -w / 2, y: top, width: w, height: titleH, class: "pe-optitle-bg" }, g);
        g0.title.forEach((l, i) => {
          const t = el("text", { x: -w / 2 + 7, y: top + 16 + i * 15, class: "pe-text pe-optitle" }, g);
          t.textContent = l;
        });
        let y = top + titleH + 6;
        for (const l of g0.actions) {
          const t = el("text", { x: -w / 2 + 7, y: y + 12, class: "pe-text pe-action" }, g);
          t.textContent = l;
          y += OP_LINE;
        }
        const ry = hh - OP_RULES;
        el("path", { d: `M${-w / 2} ${ry} H${w / 2}`, class: "pe-sep" }, g);
        const k = Math.max(1, g0.rules.length);
        g0.rules.forEach((r, i) => {
          const cx = -w / 2 + (w * (i + 0.5)) / k;
          if (i) el("path", { d: `M${-w / 2 + (w * i) / k} ${ry} V${hh}`, class: "pe-sep" }, g);
          const lines = wrap(r, w / k - 8);
          const t = el("text", { x: cx, y: ry + 17, "text-anchor": "middle", class: "pe-text pe-rule" }, g);
          t.textContent = lines[0] + (lines.length > 1 ? "…" : "");
          if (lines.length > 1) el("title", {}, t).textContent = r;
          if (!this.opts.readonly) el("circle", { cx, cy: hh, r: 5.5, class: "pe-handle", "data-handle": "rule", "data-rule": i }, g);
        });
        if (!g0.rules.length) {
          const t = el("text", { x: 0, y: ry + 17, "text-anchor": "middle", class: "pe-text pe-rule muted" }, g);
          t.textContent = "règle ?";
        }
      }
      this.nodeEls.set(n.id, g);
    }

    updateArrows() {
      for (const a of this.model.arrows) {
        const e = this.arrowEls.get(a.id);
        const from = this.node(a.from), to = this.node(a.to);
        if (!e || !from || !to) continue;
        const p1 = outPoint(from, geom(from), a.rule);
        const p2 = inPoint(to, geom(to), p1);
        const d = `M${p1.x} ${p1.y} L${p2.x} ${p2.y}`;
        e.p.setAttribute("d", d);
        e.hit.setAttribute("d", d);
        if (e.lbl) {
          const lx = p1.x + (p2.x - p1.x) * 0.72, ly = p1.y + (p2.y - p1.y) * 0.72;
          e.lbl.setAttribute("x", lx + 10);
          e.lbl.setAttribute("y", ly - 4);
        }
      }
    }

    // ------------------------------------------------------------ interactions
    point(e) {
      const m = this.svg.getScreenCTM().inverse();
      return new DOMPoint(e.clientX, e.clientY).matrixTransform(m);
    }

    bindCanvas() {
      const svg = this.svg;
      svg.addEventListener("pointerdown", (e) => {
        if (e.button !== 0) return;
        const handle = e.target.closest(".pe-handle");
        const nodeEl = e.target.closest("[data-node]");
        if (handle && nodeEl) return this.startLink(e, nodeEl.dataset.node, handle.dataset.rule !== undefined ? +handle.dataset.rule : null);
        if (nodeEl) return this.startDrag(e, nodeEl.dataset.node);
        const lane = e.target.closest("[data-lane]");
        const arrow = e.target.closest("[data-arrow]");
        if (lane) this.sel = { type: "lane", id: +lane.dataset.lane };
        else if (arrow) this.sel = { type: "arrow", id: arrow.dataset.arrow };
        else this.sel = null;
        this.render();
        if (arrow) this.showArrow(arrow.dataset.arrow);
      });
    }

    showArrow(id) {
      const a = this.model.arrows.find((x) => x.id === id);
      if (!a) return;
      const nm = (nid) => { const x = this.node(nid); return x ? (x.kind === "sync" ? "synchronisation" : x.label) : "?"; };
      this.inspector.innerHTML = `<div class="pe-head"><strong>Flèche</strong><button type="button" class="icon-btn small" data-act="close" aria-label="Fermer">✕</button></div>
        <p class="small">${esc(nm(a.from))} → ${esc(nm(a.to))}${a.letter ? ` (lettre <b>${a.letter}</b>)` : ""}</p>
        <button type="button" class="btn small ghost" data-act="del-arrow" data-id="${a.id}">Supprimer la flèche</button>`;
    }

    startDrag(e, id) {
      const n = this.node(id);
      const g = this.nodeEls.get(id);
      const p0 = this.point(e);
      const start = { x: n.x, y: n.y, moved: false };
      try { this.svg.setPointerCapture(e.pointerId); } catch (err) { /* pointeur simulé */ }
      const move = (ev) => {
        const p = this.point(ev);
        const dx = p.x - p0.x, dy = p.y - p0.y;
        if (Math.abs(dx) + Math.abs(dy) > 3) start.moved = true;
        if (!start.moved) return;
        const maxX = Math.max(1, this.model.lanes.length) * LANE_W - 10;
        n.x = Math.max(10, Math.min(maxX, Math.round(start.x + dx)));
        n.y = Math.max(HEAD + 20, Math.round(start.y + dy));
        g.setAttribute("transform", `translate(${n.x} ${n.y})`);
        this.updateArrows();
      };
      const up = () => {
        this.svg.removeEventListener("pointermove", move);
        this.svg.removeEventListener("pointerup", up);
        this.svg.removeEventListener("pointercancel", up);
        this.sel = { type: "node", id };
        if (start.moved) this.changed(); else this.render();
      };
      this.svg.addEventListener("pointermove", move);
      this.svg.addEventListener("pointerup", up);
      this.svg.addEventListener("pointercancel", up);
    }

    startLink(e, fromId, rule) {
      e.preventDefault();
      const from = this.node(fromId);
      const p1 = outPoint(from, geom(from), rule);
      const line = el("path", { class: "pe-link pe-draft", d: `M${p1.x} ${p1.y}`, "marker-end": "url(#pe-arrow)" }, this.svg);
      try { this.svg.setPointerCapture(e.pointerId); } catch (err) { /* pointeur simulé */ }
      const move = (ev) => { const p = this.point(ev); line.setAttribute("d", `M${p1.x} ${p1.y} L${p.x} ${p.y}`); };
      const up = (ev) => {
        this.svg.removeEventListener("pointermove", move);
        this.svg.removeEventListener("pointerup", up);
        this.svg.removeEventListener("pointercancel", up);
        line.remove();
        const hit = document.elementFromPoint(ev.clientX, ev.clientY);
        const target = hit && hit.closest && hit.closest("[data-node]");
        if (target && target.dataset.node !== fromId) this.link(fromId, rule, target.dataset.node);
      };
      this.svg.addEventListener("pointermove", move);
      this.svg.addEventListener("pointerup", up);
      this.svg.addEventListener("pointercancel", up);
    }

    // ------------------------------------------------------------ export
    /** SVG autonome (couleurs figées, fond blanc) */
    standaloneSvg() {
      const clone = this.svg.cloneNode(true);
      const src = this.svg.querySelectorAll("*"), dst = clone.querySelectorAll("*");
      src.forEach((s, i) => {
        const cs = getComputedStyle(s);
        const d = dst[i];
        for (const p of ["fill", "stroke", "stroke-width", "stroke-dasharray", "font-family", "font-size", "font-weight", "font-style", "opacity"]) d.style.setProperty(p, cs.getPropertyValue(p));
      });
      clone.querySelectorAll(".pe-handle, .pe-hit").forEach((x) => x.remove());
      clone.setAttribute("xmlns", NS);
      const bg = document.createElementNS(NS, "rect");
      bg.setAttribute("width", "100%"); bg.setAttribute("height", "100%"); bg.setAttribute("fill", "#ffffff");
      clone.insertBefore(bg, clone.firstChild);
      return new XMLSerializer().serializeToString(clone);
    }

    exportImage(kind) {
      const svgText = this.standaloneSvg();
      const name = (this.opts.fileName || "processus") + "." + kind;
      const save = (blob) => {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = name;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
      };
      if (kind === "svg") return save(new Blob([svgText], { type: "image/svg+xml" }));
      const { w, h } = this.size();
      const img = new Image();
      img.onload = () => {
        const c = document.createElement("canvas");
        c.width = w * 2; c.height = h * 2;
        const cx = c.getContext("2d");
        cx.scale(2, 2);
        cx.drawImage(img, 0, 0);
        c.toBlob((b) => save(b), "image/png");
      };
      img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgText);
    }
  }

  ProcessEditor.LANE_W = LANE_W;
  global.ProcessEditor = ProcessEditor;
})(window);
