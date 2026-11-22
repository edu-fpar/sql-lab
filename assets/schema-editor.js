/* SQL Lab – éditeur de schéma relationnel (questions « schéma »).
 * Le diagramme sert de surface d'édition ; un panneau de propriétés permet de tout faire
 * au clavier (et sur téléphone) ; la notation textuelle DCG se met à jour en direct.
 *
 * État : { tables: [{ name, cols: [{ name, pk, fk }] }], pos: { TABLE: {x, y} } }
 */
(function (global) {
  "use strict";

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const clean = (s) => String(s || "").trim().replace(/\s+/g, "_").replace(/[^\wÀ-ÿ#-]/g, "");

  class SchemaEditor {
    /**
     * @param root élément conteneur
     * @param opts { onChange(state) }
     */
    constructor(root, opts = {}) {
      this.root = root;
      this.opts = opts;
      this.state = { tables: [], pos: {} };
      this.selected = null; // { table, row }
      root.innerHTML = `
        <div class="se-toolbar">
          <button type="button" class="btn small" data-act="add-table">+ Table</button>
          <button type="button" class="btn small ghost" data-act="reset" title="Revenir au schéma de départ">↺ Repartir du départ</button>
          <span class="muted small se-help">Cliquez sur une table pour la modifier · tirez le rond <span class="se-dot">●</span> d'un attribut vers une table pour en faire une clé étrangère.</span>
        </div>
        <div class="se-main">
          <div class="se-canvas diagram-wrap"></div>
          <aside class="se-inspector" aria-label="Propriétés de la table"></aside>
        </div>
        <div class="se-text" aria-live="polite"></div>`;
      this.canvas = root.querySelector(".se-canvas");
      this.inspector = root.querySelector(".se-inspector");
      this.textEl = root.querySelector(".se-text");
      this.diagram = new SchemaDiagram(this.canvas, {
        editable: true,
        fit: true,
        maxFit: 1,
        load: () => this.state.pos,
        save: (_, pos) => { this.state.pos = { ...pos }; this.changed(false); },
        onSelect: (table, row) => this.select(table, row),
        onLink: (table, row, target) => this.link(table, row, target),
      });
      root.querySelector('[data-act="add-table"]').addEventListener("click", () => this.addTable());
      root.querySelector('[data-act="reset"]').addEventListener("click", () => {
        if (confirm("Revenir au schéma de départ ? Vos modifications seront perdues.")) this.opts.onReset && this.opts.onReset();
      });
      this.inspector.addEventListener("change", (e) => this.onInspector(e));
      this.inspector.addEventListener("click", (e) => this.onInspectorClick(e));
      this.inspector.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && e.target.matches("input[type=text]")) { e.preventDefault(); e.target.blur(); }
      });
    }

    /** Charge un état (départ ou brouillon de l'étudiant) */
    setState(state) {
      this.state = JSON.parse(JSON.stringify(state));
      this.state.pos = this.state.pos || {};
      this.selected = null;
      this.render();
    }

    getState() { return JSON.parse(JSON.stringify(this.state)); }

    schema() { return { tables: this.state.tables }; }

    table(name) { return this.state.tables.find((t) => t.name === name); }

    changed(rerender = true) {
      if (rerender) this.render();
      if (this.opts.onChange) this.opts.onChange(this.getState());
    }

    uniqueName(base, list) {
      let n = base, k = 2;
      while (list.some((x) => x.toLowerCase() === n.toLowerCase())) n = base + k++;
      return n;
    }

    // ------------------------------------------------------------ actions
    addTable() {
      const name = this.uniqueName("NOUVELLE_TABLE", this.state.tables.map((t) => t.name));
      this.state.tables.push({ name, cols: [{ name: "id", pk: true, fk: null }] });
      this.selected = { table: name, row: null };
      this.changed();
      const input = this.inspector.querySelector("[data-f=table-name]");
      if (input) { input.focus(); input.select(); }
    }

    select(table, row) {
      this.selected = { table, row };
      this.render();
      if (row !== null) {
        const input = this.inspector.querySelector(`[data-row="${row}"] [data-f=col-name]`);
        if (input) input.focus();
      }
    }

    link(from, row, target) {
      const t = this.table(from);
      if (!t || !t.cols[row]) return;
      t.cols[row].fk = target;
      this.selected = { table: from, row };
      this.changed();
    }

    renameTable(t, name) {
      name = clean(name).toUpperCase();
      if (!name || name === t.name) return;
      name = this.uniqueName(name, this.state.tables.filter((x) => x !== t).map((x) => x.name));
      for (const x of this.state.tables) for (const c of x.cols) if (c.fk === t.name) c.fk = name;
      if (this.state.pos[t.name]) { this.state.pos[name] = this.state.pos[t.name]; delete this.state.pos[t.name]; }
      t.name = name;
      this.selected = { table: name, row: null };
    }

    deleteTable(t) {
      this.state.tables = this.state.tables.filter((x) => x !== t);
      for (const x of this.state.tables) for (const c of x.cols) if (c.fk === t.name) c.fk = null;
      delete this.state.pos[t.name];
      this.selected = null;
    }

    // ------------------------------------------------------------ panneau de propriétés
    onInspector(e) {
      const t = this.selected && this.table(this.selected.table);
      if (!t) return;
      const f = e.target.dataset.f;
      const rowEl = e.target.closest("[data-row]");
      const c = rowEl ? t.cols[+rowEl.dataset.row] : null;
      if (f === "table-name") this.renameTable(t, e.target.value);
      else if (f === "col-name" && c) {
        const n = clean(e.target.value).replace(/^#/, "");
        if (n) c.name = n;
      } else if (f === "col-pk" && c) c.pk = e.target.checked;
      else if (f === "col-fk" && c) c.fk = e.target.value || null;
      else if (f === "col-move" && c && e.target.value) {
        const dest = this.table(e.target.value);
        t.cols.splice(+rowEl.dataset.row, 1);
        dest.cols.push(c);
        this.selected = { table: dest.name, row: dest.cols.length - 1 };
      } else return;
      this.changed();
    }

    onInspectorClick(e) {
      const b = e.target.closest("[data-act]");
      if (!b) return;
      const t = this.selected && this.table(this.selected.table);
      if (!t) return;
      const rowEl = b.closest("[data-row]");
      const i = rowEl ? +rowEl.dataset.row : -1;
      switch (b.dataset.act) {
        case "add-col": {
          t.cols.push({ name: this.uniqueName("attribut", t.cols.map((c) => c.name)), pk: false, fk: null });
          this.selected = { table: t.name, row: t.cols.length - 1 };
          this.changed();
          const input = this.inspector.querySelector(`[data-row="${t.cols.length - 1}"] [data-f=col-name]`);
          if (input) { input.focus(); input.select(); }
          return;
        }
        case "del-col": t.cols.splice(i, 1); this.selected = { table: t.name, row: null }; break;
        case "up": if (i > 0) [t.cols[i - 1], t.cols[i]] = [t.cols[i], t.cols[i - 1]]; break;
        case "down": if (i < t.cols.length - 1) [t.cols[i + 1], t.cols[i]] = [t.cols[i], t.cols[i + 1]]; break;
        case "del-table":
          if (!confirm(`Supprimer la table ${t.name} ?`)) return;
          this.deleteTable(t);
          break;
        case "close": this.selected = null; break;
        default: return;
      }
      this.changed();
    }

    renderInspector() {
      const t = this.selected && this.table(this.selected.table);
      if (!t) {
        this.inspector.innerHTML = `<p class="muted small">Sélectionnez une table dans le schéma pour la renommer, ajouter ou déplacer des attributs, choisir la clé primaire et les clés étrangères. <br><br>Bouton <strong>+ Table</strong> pour créer une table.</p>`;
        return;
      }
      const others = this.state.tables.map((x) => x.name);
      const rows = t.cols.map((c, i) => `
        <li data-row="${i}" class="${this.selected.row === i ? "sel" : ""}">
          <input type="text" data-f="col-name" value="${esc(c.name)}" aria-label="Nom de l'attribut" spellcheck="false">
          <label class="se-pk" title="Fait partie de la clé primaire"><input type="checkbox" data-f="col-pk" ${c.pk ? "checked" : ""}> clé</label>
          <select data-f="col-fk" aria-label="Clé étrangère vers">
            <option value="">— pas de référence</option>
            ${others.map((n) => `<option value="${esc(n)}" ${c.fk === n ? "selected" : ""}>→ ${esc(n)}</option>`).join("")}
            ${c.fk && !others.includes(c.fk) ? `<option value="${esc(c.fk)}" selected>→ ${esc(c.fk)} (absente)</option>` : ""}
          </select>
          <span class="se-rowtools">
            <button type="button" class="icon-btn small" data-act="up" title="Monter" aria-label="Monter">↑</button>
            <button type="button" class="icon-btn small" data-act="down" title="Descendre" aria-label="Descendre">↓</button>
            <select data-f="col-move" class="se-move" title="Déplacer vers une autre table" aria-label="Déplacer vers">
              <option value="">⇄</option>
              ${others.filter((n) => n !== t.name).map((n) => `<option value="${esc(n)}">vers ${esc(n)}</option>`).join("")}
            </select>
            <button type="button" class="icon-btn small" data-act="del-col" title="Supprimer l'attribut" aria-label="Supprimer l'attribut">✕</button>
          </span>
        </li>`).join("");
      this.inspector.innerHTML = `
        <div class="se-head">
          <input type="text" data-f="table-name" value="${esc(t.name)}" aria-label="Nom de la table" spellcheck="false">
          <button type="button" class="icon-btn small" data-act="close" title="Fermer" aria-label="Fermer le panneau">✕</button>
        </div>
        <ul class="se-cols">${rows}</ul>
        <div class="se-foot">
          <button type="button" class="btn small" data-act="add-col">+ Attribut</button>
          <button type="button" class="btn small ghost" data-act="del-table">Supprimer la table</button>
        </div>`;
    }

    render() {
      // le diagramme attend une référence « TABLE.colonne » : on vise la clé primaire de la table
      const diagramSchema = this.state.tables.map((t) => ({
        name: t.name,
        cols: t.cols.map((c) => {
          let fk = null;
          if (c.fk) {
            const target = this.table(c.fk);
            const pk = target && (target.cols.find((x) => x.pk) || target.cols[0]);
            fk = target ? `${c.fk}.${pk ? pk.name : ""}` : `${c.fk}.`; // table hors du schéma : # sans flèche
          }
          return { name: c.name, pk: c.pk, fk };
        }),
      }));
      this.diagram.opts.selected = this.selected;
      const zoom = this.diagram.zoom, autoFit = this.diagram.autoFit, had = !!this.diagram.svg;
      this.diagram.load(diagramSchema, null, "editor");
      if (had) { this.diagram.zoom = zoom; this.diagram.autoFit = autoFit; this.diagram.resize(); }
      this.state.pos = { ...this.diagram.pos };
      this.renderInspector();
      this.textEl.innerHTML = `<p class="muted small">Notation textuelle (clé primaire soulignée, clé étrangère en italique avec #) :</p>` +
        SQLSchemaCheck.toText(this.schema(), true).split("\n").map((l) => `<div>${l}</div>`).join("");
    }
  }

  global.SchemaEditor = SchemaEditor;
})(window);
