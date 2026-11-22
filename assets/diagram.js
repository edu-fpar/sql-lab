/* SQL Lab – schéma relationnel graphique (notation française).
 * Une boîte par table : nom en en-tête, clé primaire soulignée, clé étrangère
 * en italique précédée de #. Une flèche simple part de la clé étrangère et
 * pointe vers la clé primaire référencée. Les boîtes se déplacent à la souris
 * ou au doigt ; la disposition est mémorisée dans le navigateur.
 */
(function (global) {
  "use strict";

  const NS = "http://www.w3.org/2000/svg";
  const ROW = 21, HEAD = 30, PADX = 14, PADY = 7, MARGIN = 24, GAPX = 96, GAPY = 64;
  const FONT = "13px system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";
  const FONT_HEAD = "700 13px system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";

  const ctx = document.createElement("canvas").getContext("2d");
  function textWidth(s, font) { ctx.font = font; return ctx.measureText(s).width; }

  function el(name, attrs = {}, parent) {
    const e = document.createElementNS(NS, name);
    for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
    if (parent) parent.appendChild(e);
    return e;
  }

  let counter = 0;

  class SchemaDiagram {
    /**
     * @param host élément conteneur
     * @param opts { onOpenTable(name), load(key) -> positions, save(key, positions),
     *               fit: bool (zoom ajusté à la largeur du conteneur), maxFit: number }
     */
    constructor(host, opts = {}) {
      this.host = host;
      this.opts = opts;
      this.uid = "dg" + ++counter; // identifiants des flèches propres à chaque diagramme
      this.zoom = 1;
      this.autoFit = !!opts.fit;
      this.tables = [];
      this.pos = {};
      if (opts.fit && "ResizeObserver" in window) {
        let last = "";
        new ResizeObserver(() => {
          const w = this.host.clientWidth, h = this.host.clientHeight;
          if (!w || !this.svg || `${w}x${h}` === last) return;
          last = `${w}x${h}`;
          // disposition automatique (non retouchée) : on la refait si l'orientation change
          if (!this.custom && this.portrait() !== this.layoutPortrait) {
            this.pos = this.autoLayout();
            this.render();
          } else this.resize();
        }).observe(host);
      }
    }

    /** Relit la disposition mémorisée (après un changement fait dans un autre diagramme) */
    refresh() {
      if (!this.tables.length) return;
      const saved = (this.opts.load && this.opts.load(this.key)) || null;
      this.custom = !!(saved && this.tables.every((t) => saved[t.name]));
      this.pos = this.custom ? saved : this.autoLayout();
      this.render();
    }

    /** schema : [{name, cols:[{name, pk, fk:"TABLE.col"}]}] ; grid : {TABLE:[colonne, ligne]} */
    load(schema, grid, key) {
      this.key = key;
      this.grid = grid || null;
      this.tables = schema.map((t) => {
        const labels = t.cols.map((c) => (c.fk ? "#" : "") + c.name);
        const w = Math.max(
          120,
          textWidth(t.name, FONT_HEAD) + 2 * PADX,
          ...labels.map((l, i) => textWidth(l, t.cols[i].fk ? "italic " + FONT : FONT) + 2 * PADX),
        );
        return { ...t, labels, w: Math.ceil(w), h: HEAD + 2 * PADY + t.cols.length * ROW };
      });
      this.byName = Object.fromEntries(this.tables.map((t) => [t.name, t]));
      this.zoom = 1;
      this.autoFit = !!this.opts.fit;
      const saved = (this.opts.load && this.opts.load(key)) || null;
      const known = saved ? this.tables.filter((t) => saved[t.name]) : [];
      this.custom = !!known.length && (this.opts.editable || known.length === this.tables.length);
      this.pos = this.custom ? this.withMissing(saved) : this.autoLayout();
      this.render();
    }

    /** Garde les positions connues et place les nouvelles tables sous les autres */
    withMissing(saved) {
      const pos = {};
      const boxes = [];
      for (const t of this.tables) {
        if (saved[t.name]) { pos[t.name] = { ...saved[t.name] }; boxes.push({ ...pos[t.name], w: t.w, h: t.h }); }
      }
      // premier emplacement libre, en lisant de gauche à droite puis de haut en bas,
      // dans la largeur visible du cadre
      const maxW = Math.max(520, (this.host.clientWidth || 800) / (this.zoom || 1) - 16);
      const free = (x, y, w, h) => boxes.every((b) => x + w + 30 <= b.x || b.x + b.w + 30 <= x || y + h + 24 <= b.y || b.y + b.h + 24 <= y);
      for (const t of this.tables) {
        if (pos[t.name]) continue;
        let spot = null;
        for (let y = MARGIN; !spot && y < 6000; y += 24) {
          for (let x = MARGIN; x + t.w <= Math.max(maxW, MARGIN + t.w); x += 24) {
            if (free(x, y, t.w, t.h)) { spot = { x, y }; break; }
          }
        }
        pos[t.name] = spot || { x: MARGIN, y: MARGIN };
        boxes.push({ ...pos[t.name], w: t.w, h: t.h });
      }
      return pos;
    }

    /** Disposition initiale : grille fournie par l'exercice, sinon grille automatique */
    /** Conteneur plus haut que large : on dispose les tables en hauteur */
    portrait() {
      return !!this.opts.fit && this.host.clientHeight > this.host.clientWidth * 1.1;
    }

    autoLayout() {
      const n = this.tables.length;
      const portrait = this.portrait();
      this.layoutPortrait = portrait;
      const ncol = Math.max(1, portrait ? Math.round(Math.sqrt(n / 2)) : Math.ceil(Math.sqrt(n)));
      const cell = {};
      this.tables.forEach((t, i) => {
        let c = (this.grid && this.grid[t.name]) || [i % ncol, Math.floor(i / ncol)];
        if (portrait && this.grid && this.grid[t.name]) c = [c[1], c[0]]; // grille transposée
        cell[t.name] = c;
      });
      const GX = this.opts.fit ? 60 : GAPX, GY = this.opts.fit ? 44 : GAPY;
      const colW = [], rowH = [];
      for (const t of this.tables) {
        const [c, r] = cell[t.name];
        colW[c] = Math.max(colW[c] || 0, t.w);
        rowH[r] = Math.max(rowH[r] || 0, t.h);
      }
      const xs = [], ys = [];
      let acc = MARGIN;
      for (let c = 0; c < colW.length; c++) { xs[c] = acc; acc += (colW[c] || 0) + GX; }
      acc = MARGIN;
      for (let r = 0; r < rowH.length; r++) { ys[r] = acc; acc += (rowH[r] || 0) + GY; }
      const pos = {};
      for (const t of this.tables) {
        const [c, r] = cell[t.name];
        pos[t.name] = { x: Math.round(xs[c] + ((colW[c] || 0) - t.w) / 2), y: ys[r] };
      }
      return pos;
    }

    reset() {
      this.custom = false;
      this.pos = this.autoLayout();
      if (this.opts.save) this.opts.save(this.key, null);
      this.autoFit = !!this.opts.fit;
      this.render();
    }

    setZoom(z) {
      this.autoFit = false;
      this.zoom = Math.min(2, Math.max(0.3, z));
      this.resize();
    }

    rowY(t, i) { return this.pos[t.name].y + HEAD + PADY + i * ROW + ROW / 2; }

    links() {
      const out = [];
      for (const t of this.tables) {
        t.cols.forEach((c, i) => {
          if (!c.fk) return;
          const [tt, tc] = c.fk.split(".");
          const target = this.byName[tt];
          if (!target) return;
          let j = target.cols.findIndex((x) => x.name === tc);
          if (j < 0) j = target.cols.findIndex((x) => x.pk);
          out.push({ from: t, row: i, to: target, trow: Math.max(0, j) });
        });
      }
      return out;
    }

    path(l, k) {
      const s = this.pos[l.from.name], t = this.pos[l.to.name];
      const sy = this.rowY(l.from, l.row), ty = this.rowY(l.to, l.trow);
      const shift = ((k % 3) - 1) * 7; // évite que des liaisons parallèles se superposent
      if (l.from === l.to) { // relation réflexive : boucle sur le côté droit
        const x0 = s.x + l.from.w, mx = x0 + 26 + shift;
        return `M${x0} ${sy} H${mx} V${ty} H${x0}`;
      }
      if (s.x + l.from.w + 24 < t.x) { // cible à droite
        const sx = s.x + l.from.w, tx = t.x, mx = (sx + tx) / 2 + shift;
        return `M${sx} ${sy} H${mx} V${ty} H${tx}`;
      }
      if (t.x + l.to.w + 24 < s.x) { // cible à gauche
        const sx = s.x, tx = t.x + l.to.w, mx = (sx + tx) / 2 + shift;
        return `M${sx} ${sy} H${mx} V${ty} H${tx}`;
      }
      // boîtes l'une au-dessus de l'autre : détour par la droite
      const sx = s.x + l.from.w, tx = t.x + l.to.w, mx = Math.max(sx, tx) + 26 + shift;
      return `M${sx} ${sy} H${mx} V${ty} H${tx}`;
    }

    drawLinks() {
      this.gLinks.textContent = "";
      this.links().forEach((l, k) => {
        el("path", {
          d: this.path(l, k), class: "dg-link", "marker-end": `url(#${this.uid}-arrow)`,
          "data-from": l.from.name, "data-to": l.to.name,
        }, this.gLinks);
      });
      if (this.focusState) this.applyLinkFocus();
    }

    resize() {
      let w = 0, h = 0;
      for (const t of this.tables) {
        const p = this.pos[t.name];
        w = Math.max(w, p.x + t.w + 60);
        h = Math.max(h, p.y + t.h + MARGIN);
      }
      this.svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
      if (this.autoFit && this.host.clientWidth) {
        // lisible avant tout : on n'en dessous pas de 55 % (le conteneur défile alors)
        this.zoom = Math.min(this.opts.maxFit || 1, Math.max(0.55, (this.host.clientWidth - 4) / w));
      }
      this.svg.setAttribute("width", Math.round(w * this.zoom));
      this.svg.setAttribute("height", Math.round(h * this.zoom));
    }

    render() {
      this.host.textContent = "";
      const svg = el("svg", { class: "dg", role: "img", "aria-label": "Schéma relationnel" }, this.host);
      this.svg = svg;
      const defs = el("defs", {}, svg);
      const m = el("marker", { id: this.uid + "-arrow", viewBox: "0 0 10 10", refX: "9", refY: "5", markerWidth: "8", markerHeight: "8", orient: "auto-start-reverse" }, defs);
      el("path", { d: "M0 0 L10 5 L0 10 z", class: "dg-arrowhead" }, m);
      const mh = el("marker", { id: this.uid + "-arrow-hl", viewBox: "0 0 10 10", refX: "9", refY: "5", markerWidth: "8", markerHeight: "8", orient: "auto-start-reverse" }, defs);
      el("path", { d: "M0 0 L10 5 L0 10 z", class: "dg-arrowhead hl" }, mh);
      const mc = el("marker", { id: this.uid + "-arrow-cn", viewBox: "0 0 10 10", refX: "9", refY: "5", markerWidth: "8", markerHeight: "8", orient: "auto-start-reverse" }, defs);
      el("path", { d: "M0 0 L10 5 L0 10 z", class: "dg-arrowhead cn" }, mc);
      this.gLinks = el("g", {}, svg);
      const gBoxes = el("g", {}, svg);

      for (const t of this.tables) {
        const g = el("g", { class: "dg-box", "data-table": t.name, tabindex: "0" }, gBoxes);
        el("title", {}, g).textContent = this.opts.editable
          ? "Glisser pour déplacer · cliquer pour modifier · tirer le rond ● d'un attribut vers une table pour créer une clé étrangère"
          : "Glisser pour déplacer · double-clic pour voir le contenu";
        const sel = this.opts.selected && this.opts.selected.table === t.name ? this.opts.selected : null;
        if (sel) g.classList.add("dg-selected");
        el("rect", { x: 0, y: 0, width: t.w, height: t.h, rx: 6, class: "dg-frame" }, g);
        el("path", { d: `M0 ${HEAD} H${t.w}`, class: "dg-sep" }, g);
        const title = el("text", { x: t.w / 2, y: HEAD / 2 + 4.5, class: "dg-title", "text-anchor": "middle" }, g);
        title.textContent = t.name;
        t.cols.forEach((c, i) => {
          if (sel && sel.row === i) el("rect", { x: 1, y: HEAD + PADY + i * ROW, width: t.w - 2, height: ROW, class: "dg-rowsel" }, g);
          if (this.opts.editable) {
            const h = el("circle", { cx: t.w, cy: HEAD + PADY + i * ROW + ROW / 2, r: 5, class: "dg-handle" + (c.fk ? " linked" : ""), "data-row": i }, g);
            el("title", {}, h).textContent = "Tirer vers une table pour faire de cet attribut une clé étrangère";
          }
          const tx = el("text", {
            x: PADX, y: HEAD + PADY + i * ROW + ROW / 2 + 4.5,
            class: "dg-col" + (c.pk ? " dg-pk" : "") + (c.fk ? " dg-fk" : ""),
          }, g);
          tx.textContent = t.labels[i];
          if (c.fk) el("title", {}, tx).textContent = `clé étrangère → ${c.fk}`;
        });
        this.place(t);
        this.bindDrag(g, t);
      }
      this.drawLinks();
      this.resize();
      if (this.focusState) this.applyFocus();
    }

    /**
     * Mise en évidence pour la correction pas à pas.
     * f = { main:[T], inter:[T], sub:[T], cols:{T:{col:"sel"|"filt"|"join"|"grp"|"ord"|"set"}},
     *       aliases:{T:"a"}, links:[[T1,T2]], now:[[T1,T2]] }
     */
    focus(f) {
      this.focusState = f || null;
      if (this.svg) this.applyFocus();
    }

    clearFocus() { this.focus(null); }

    applyFocus() {
      const svg = this.svg, f = this.focusState;
      for (const e of svg.querySelectorAll(".cn-mark, .cn-alias")) e.remove();
      svg.classList.toggle("cn-on", !!f);
      const low = (x) => String(x).toLowerCase();
      const has = (arr, n) => !!arr && arr.some((x) => low(x) === low(n));
      for (const t of this.tables) {
        const g = svg.querySelector(`[data-table="${t.name}"]`);
        if (!g) continue;
        g.classList.remove("cn-main", "cn-inter", "cn-sub");
        if (!f) continue;
        const role = has(f.main, t.name) ? "main" : has(f.inter, t.name) ? "inter" : has(f.sub, t.name) ? "sub" : null;
        if (role) g.classList.add("cn-" + role);
        const key = f.cols && Object.keys(f.cols).find((k) => low(k) === low(t.name));
        if (key) {
          const first = g.querySelector(".dg-col");
          for (const [col, kind] of Object.entries(f.cols[key])) {
            const i = t.cols.findIndex((c) => low(c.name) === low(col));
            if (i < 0) continue;
            const isHot = !!f.hot && f.hot.some(([a, b]) => low(a) === low(t.name) && low(b) === low(col));
            const r = el("rect", { x: 2, y: HEAD + PADY + i * ROW + 1, width: t.w - 4, height: ROW - 2, rx: 3, class: "cn-mark cn-" + kind + (isHot ? " cn-hot" : "") });
            g.insertBefore(r, first);
            if (kind === "del") {
              const y = HEAD + PADY + i * ROW + ROW / 2;
              el("line", { x1: PADX - 3, x2: t.w - PADX + 3, y1: y, y2: y, class: "cn-mark cn-strike" }, g);
            }
          }
        }
        const akey = f.aliases && Object.keys(f.aliases).find((k) => low(k) === low(t.name));
        if (akey) {
          const label = f.aliases[akey];
          const w = Math.max(24, textWidth(label, FONT_HEAD) + 14);
          const b = el("g", { class: "cn-alias", transform: `translate(${t.w - w + 6} -12)` }, g);
          el("rect", { x: 0, y: 0, width: w, height: 20, rx: 10 }, b);
          el("text", { x: w / 2, y: 14, "text-anchor": "middle" }, b).textContent = label;
        }
      }
      this.applyLinkFocus();
    }

    applyLinkFocus() {
      const f = this.focusState;
      const low = (x) => String(x).toLowerCase();
      const match = (list, a, b) => !!list && list.some(([x, y]) =>
        (low(x) === low(a) && low(y) === low(b)) || (low(x) === low(b) && low(y) === low(a)));
      for (const p of this.gLinks.querySelectorAll(".dg-link")) {
        const a = p.dataset.from, b = p.dataset.to;
        const on = !!f && match(f.links, a, b);
        p.classList.toggle("cn-link", on);
        p.classList.toggle("cn-now", on && match(f.now, a, b));
        p.setAttribute("marker-end", `url(#${this.uid}-arrow${on ? "-cn" : ""})`);
        if (on) this.gLinks.appendChild(p);
      }
    }

    place(t) {
      const p = this.pos[t.name];
      this.svg.querySelector(`[data-table="${t.name}"]`).setAttribute("transform", `translate(${p.x} ${p.y})`);
    }

    /** Tracé d'une clé étrangère : de la poignée d'un attribut jusqu'à une table */
    startLink(e, t, row, pt) {
      e.stopPropagation();
      e.preventDefault();
      const p0 = this.pos[t.name];
      const x0 = p0.x + t.w, y0 = p0.y + HEAD + PADY + row * ROW + ROW / 2;
      const line = el("path", { class: "dg-link dg-draft", d: `M${x0} ${y0}`, "marker-end": `url(#${this.uid}-arrow-hl)` }, this.svg);
      const svg = this.svg;
      try { svg.setPointerCapture(e.pointerId); } catch (err) { /* pointeur simulé */ }
      const move = (ev) => {
        const p = pt(ev);
        line.setAttribute("d", `M${x0} ${y0} L${p.x} ${p.y}`);
      };
      const up = (ev) => {
        svg.removeEventListener("pointermove", move);
        svg.removeEventListener("pointerup", up);
        svg.removeEventListener("pointercancel", up);
        line.remove();
        const hit = document.elementFromPoint(ev.clientX, ev.clientY);
        const box = hit && hit.closest && hit.closest(".dg-box");
        if (box && this.opts.onLink) this.opts.onLink(t.name, row, box.dataset.table);
      };
      svg.addEventListener("pointermove", move);
      svg.addEventListener("pointerup", up);
      svg.addEventListener("pointercancel", up);
    }

    highlight(name, on) {
      for (const p of this.gLinks.querySelectorAll(`[data-from="${name}"], [data-to="${name}"]`)) {
        p.classList.toggle("hl", on);
        p.setAttribute("marker-end", `url(#${this.uid}-arrow${on ? "-hl" : ""})`);
        if (on) this.gLinks.appendChild(p); // liaison mise en évidence au premier plan
      }
      if (!on && this.focusState) this.applyLinkFocus();
    }

    bindDrag(g, t) {
      let start = null;
      const pt = (e) => {
        const m = this.svg.getScreenCTM().inverse();
        const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m);
        return { x: p.x, y: p.y };
      };
      g.addEventListener("pointerdown", (e) => {
        if (e.button !== 0) return;
        if (e.target.classList && e.target.classList.contains("dg-handle")) { this.startLink(e, t, +e.target.dataset.row, pt); return; }
        const p = pt(e);
        start = { mx: p.x, my: p.y, x: this.pos[t.name].x, y: this.pos[t.name].y, moved: false };
        try { g.setPointerCapture(e.pointerId); } catch (err) { /* pointeur simulé */ }
        g.classList.add("dragging");
        g.parentNode.appendChild(g); // au premier plan
      });
      g.addEventListener("pointermove", (e) => {
        if (!start) return;
        const p = pt(e);
        const dx = p.x - start.mx, dy = p.y - start.my;
        if (Math.abs(dx) + Math.abs(dy) > 2) start.moved = true;
        this.pos[t.name] = { x: Math.max(8, Math.round(start.x + dx)), y: Math.max(8, Math.round(start.y + dy)) };
        this.place(t);
        this.drawLinks();
        this.highlight(t.name, true);
      });
      const end = () => {
        if (!start) return;
        const moved = start.moved;
        const clickY = start.my;
        start = null;
        g.classList.remove("dragging");
        this.resize();
        if (moved) this.custom = true;
        if (moved && this.opts.save) this.opts.save(this.key, this.pos);
        if (!moved && this.opts.onSelect) {
          const ly = clickY - this.pos[t.name].y;
          const row = ly > HEAD ? Math.floor((ly - HEAD - PADY) / ROW) : null;
          this.opts.onSelect(t.name, row !== null && row >= 0 && row < t.cols.length ? row : null);
        }
      };
      g.addEventListener("pointerup", end);
      g.addEventListener("pointercancel", end);
      g.addEventListener("pointerenter", () => this.highlight(t.name, true));
      g.addEventListener("pointerleave", () => { if (!start) this.highlight(t.name, false); });
      g.addEventListener("dblclick", () => this.opts.onOpenTable && this.opts.onOpenTable(t.name));
      g.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && this.opts.onOpenTable) this.opts.onOpenTable(t.name);
      });
    }
  }

  global.SchemaDiagram = SchemaDiagram;
})(window);
