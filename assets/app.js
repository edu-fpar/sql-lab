/* SQL Lab – interface. */
(function () {
  "use strict";

  const SQLJS_DIR = "lib/sql.js/";
  const MAX_ROWS = 200;
  // Réglages injectés par un paquet SCORM : { locked, exercice, scorm, seuil }
  const CONFIG = window.SQLLAB_CONFIG || {};
  const $ = (id) => document.getElementById(id);
  const lines = SQLEngine.lines;

  const state = {
    SQL: null,
    catalogue: [],
    ex: null,       // questions.json de l'exercice courant
    engine: null,
    index: 0,
    schema: [],
  };

  // ---------------------------------------------------------------- stockage
  const store = {
    get(key, def) {
      try {
        const v = localStorage.getItem("sqllab:" + key);
        return v === null ? def : JSON.parse(v);
      } catch (e) { return def; }
    },
    set(key, val) {
      try { localStorage.setItem("sqllab:" + key, JSON.stringify(val)); } catch (e) { /* stockage indisponible */ }
    },
  };
  // ---------------------------------------------------------------- éditeur
  // CodeMirror (coloration + complétion) si disponible, sinon simple textarea.
  const editor = {
    cm: null,
    get() { return this.cm ? this.cm.getValue() : $("editor").value; },
    set(v) {
      if (this.cm) { this.cm.setValue(v); this.cm.clearHistory(); }
      else { $("editor").value = v; autoGrow(); }
    },
    focus() { if (this.cm) this.cm.focus(); else $("editor").focus(); },
    /** Tables et colonnes proposées par la complétion */
    setSchema(schema) {
      if (!this.cm) return;
      const tables = {};
      for (const t of schema) tables[t.name] = t.cols.map((c) => c.name);
      this.tables = tables;
      this.cm.setOption("hintOptions", { tables, completeSingle: false, hint: sqlHint });
    },
  };

  /**
   * Complétion : celle de CodeMirror (tables, colonnes après « TABLE. » ou
   * « alias. », mots-clés) + les colonnes tapées sans préfixe. Les colonnes des
   * tables déjà citées dans la requête sont proposées en premier.
   */
  function sqlHint(cm, options) {
    const cur = cm.getCursor();
    const before = cm.getLine(cur.line).slice(0, cur.ch);
    const base = CodeMirror.hint.sql(cm, options) || { list: [], from: cur, to: cur };
    const m = /([\wÀ-ÿ]+)$/.exec(before);
    if (!m || before.charAt(before.length - m[1].length - 1) === ".") return base; // après un point : CodeMirror suffit
    const word = m[1].toLowerCase();
    const from = CodeMirror.Pos(cur.line, cur.ch - m[1].length);

    const text = cm.getValue().toUpperCase();
    const tables = editor.tables || {};
    const cited = Object.keys(tables).filter((t) => new RegExp(`\\b${t}\\b`).test(text));
    const byCol = new Map(); // colonne -> tables qui la contiennent
    for (const t of Object.keys(tables)) {
      for (const c of tables[t]) {
        if (!c.toLowerCase().startsWith(word)) continue;
        if (!byCol.has(c)) byCol.set(c, []);
        byCol.get(c).push(t);
      }
    }
    const cols = [...byCol.entries()]
      .map(([c, ts]) => ({ c, ts, rank: ts.some((t) => cited.includes(t)) ? 0 : 1 }))
      .sort((a, b) => a.rank - b.rank || a.c.localeCompare(b.c))
      .map(({ c, ts }) => ({ text: c, displayText: `${c}   · ${ts.join(", ")}`, className: "hint-col" }));

    const str = (x) => (typeof x === "string" ? x : x.text);
    const tableItems = base.list.filter((x) => tables[str(x)]).map((x) => ({ text: str(x), displayText: `${str(x)}   · table`, className: "hint-table" }));
    const others = base.list.filter((x) => !tables[str(x)] && !byCol.has(str(x)) && str(x).toLowerCase().startsWith(word));
    const list = [...tableItems, ...cols, ...others];
    return list.length ? { list, from, to: cur } : null;
  }

  function setupEditor() {
    const ta = $("editor");
    if (!window.CodeMirror) {
      ta.addEventListener("input", () => { autoGrow(); store.set(draftKey(current()), ta.value); });
      ta.addEventListener("keydown", (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); run(); return; }
        if (e.key === "Tab" && !e.shiftKey) {
          e.preventDefault();
          ta.setRangeText("  ", ta.selectionStart, ta.selectionEnd, "end");
        }
      });
      return;
    }
    document.querySelector(".editor-help").hidden = false;
    const cm = CodeMirror.fromTextArea(ta, {
      mode: "text/x-sql",
      lineNumbers: true,
      lineWrapping: true,
      indentUnit: 2,
      tabSize: 2,
      viewportMargin: Infinity,
      placeholder: ta.placeholder,
      extraKeys: {
        "Ctrl-Enter": () => run(),
        "Cmd-Enter": () => run(),
        "Ctrl-Space": "autocomplete",
        Tab: (c) => (c.somethingSelected() ? c.indentSelection("add") : c.replaceSelection("  ")),
      },
      hintOptions: { tables: {}, completeSingle: false },
    });
    editor.cm = cm;
    // ouverture automatique : après un point, ou dès 2 lettres d'un mot
    cm.on("inputRead", (c, change) => {
      if (c.state.completionActive || change.origin !== "+input") return;
      const ch = change.text[change.text.length - 1].slice(-1);
      if (ch === ".") { c.showHint(); return; }
      if (!/[A-Za-zÀ-ÿ_]/.test(ch)) return;
      const cur = c.getCursor();
      const tok = c.getTokenAt(cur);
      if (tok.type === "string" || tok.type === "comment") return;
      const word = /[\wÀ-ÿ]+$/.exec(c.getLine(cur.line).slice(0, cur.ch));
      if (word && word[0].length >= 2) c.showHint();
    });
    cm.on("change", () => store.set(draftKey(current()), cm.getValue()));
  }

  const solvedKey = () => "solved:" + state.ex.id;
  const solved = () => new Set(store.get(solvedKey(), []));
  const draftKey = (q) => `draft:${state.ex.id}:${q.id}`;

  // ---------------------------------------------------------------- utilitaires
  function esc(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  function fmtValue(v) {
    if (v === null || v === undefined) return '<span class="null">NULL</span>';
    if (typeof v === "number" && !Number.isInteger(v)) return esc(String(Math.round(v * 10000) / 10000));
    return esc(v);
  }

  function frDate(iso) {
    const p = SQLCompat.parseDate(iso);
    return p ? `${String(p.d).padStart(2, "0")}/${String(p.m).padStart(2, "0")}/${p.y}` : iso;
  }

  function tableHtml(res, opts = {}) {
    if (!res) return "";
    const rows = res.values.slice(0, MAX_ROWS);
    const cls = opts.cls ? ` ${opts.cls}` : "";
    let h = `<div class="table-wrap${cls}"><table><thead><tr>`;
    h += res.columns.map((c) => `<th>${esc(c)}</th>`).join("");
    h += "</tr></thead><tbody>";
    if (!rows.length) h += `<tr><td colspan="${res.columns.length || 1}" class="empty">Aucune ligne</td></tr>`;
    for (const r of rows) h += "<tr>" + r.map((v) => `<td>${fmtValue(v)}</td>`).join("") + "</tr>";
    h += "</tbody></table></div>";
    if (res.values.length > MAX_ROWS) h += `<p class="muted small">… ${res.values.length - MAX_ROWS} ligne(s) supplémentaire(s) non affichée(s).</p>`;
    return h;
  }

  function countLabel(n) { return `${n} ligne${n > 1 ? "s" : ""}`; }

  // ---------------------------------------------------------------- chargement
  async function init() {
    try {
      state.SQL = await initSqlJs({ locateFile: (f) => SQLJS_DIR + f });
      state.catalogue = await (await fetch("exercices/catalogue.json")).json();
      state.exercises = await SQLLibrary.list(state.catalogue);
    } catch (e) {
      $("loading").textContent = "Impossible de charger le moteur SQL ou la liste des exercices. Ouvrez la page via un serveur web (GitHub Pages ou http://localhost), pas en double-cliquant sur le fichier.";
      $("loading").classList.add("error");
      return;
    }
    renderExerciseSelect();
    $("exercice").addEventListener("change", (e) => { location.hash = e.target.value; });
    if (CONFIG.locked) document.body.classList.add("locked");

    setupEditor();
    if (CONFIG.scorm) connectLms();
    const incomingEx = CONFIG.locked ? null : await readIncomingExercise(); // ?exercice=URL d'un zip
    const incoming = CONFIG.locked || incomingEx ? null : await readIncomingPack(); // ?pack=URL ou #pack=…
    const [exId, qId] = incomingEx && incomingEx.exercise ? [incomingEx.exercise.id, "intro"]
      : incoming && !incoming.error ? [incoming.exId, incoming.qId] : parseHash();
    await loadExercise(CONFIG.locked ? CONFIG.exercice : exId || store.get("lastEx", state.catalogue[0].id), qId);
    if (incomingEx) notifyExercise(incomingEx);
    if (incoming) notifyImport(incoming);
    if ((incoming || incomingEx) && state.ex) history.replaceState(null, "", `${location.pathname}#${state.ex.id}/${current().id}`);
    window.addEventListener("hashchange", onHash);
    bindUi();
  }

  function parseHash() {
    const raw = location.hash.slice(1);
    if (raw.startsWith("pack=")) return [];
    const h = decodeURIComponent(raw);
    return h ? h.split("/") : [];
  }

  const knownEx = (id) => state.exercises.some((e) => e.id === id);

  // ---------------------------------------------------------------- plateforme (SCORM)
  /** Reprend la progression mémorisée par la plateforme (elle fait foi, poste partagé ou non) */
  function connectLms() {
    state.lms = SQLScorm.connect();
    const el = $("lmsStatus");
    el.hidden = false;
    if (!state.lms) {
      el.textContent = "Plateforme non détectée : la progression reste dans ce navigateur.";
      return;
    }
    const st = SQLScorm.loadState();
    store.set("solved:" + CONFIG.exercice, st.solved);
    if (st.current) store.set("lastQ:" + CONFIG.exercice, st.current);
    const name = SQLScorm.learnerName();
    const score = SQLScorm.get("cmi.core.score.raw");
    el.textContent = `Connecté à la plateforme${name ? " · " + name : ""}${score ? " · score : " + score + " %" : ""}`;
  }

  /** Transmet score, statut et progression à la plateforme */
  function syncLms(q, sql, firstSuccess) {
    if (!state.lms) return;
    const real = state.ex.questions.filter((x) => !isIntro(x));
    const s = solved();
    const score = SQLScorm.saveProgress({
      solved: real.filter((x) => s.has(x.id)).map((x) => x.id),
      total: real.length,
      current: q.id,
      seuil: CONFIG.seuil,
    });
    if (firstSuccess) SQLScorm.recordInteraction(q.id, sql);
    const name = SQLScorm.learnerName();
    $("lmsStatus").textContent = `Connecté à la plateforme${name ? " · " + name : ""} · score transmis : ${score} %`;
  }

  function renderExerciseSelect() {
    const opt = (e) => `<option value="${esc(e.id)}">${esc(e.titre)}</option>`;
    const builtin = state.exercises.filter((e) => e.kind !== "perso");
    const perso = state.exercises.filter((e) => e.kind === "perso");
    $("exercice").innerHTML = builtin.map(opt).join("") +
      (perso.length ? `<optgroup label="Exercices importés">${perso.map(opt).join("")}</optgroup>` : "");
    if (state.ex) $("exercice").value = state.ex.id;
  }

  // ---------------------------------------------------------------- exercices importés (zip)
  /** Lien ?exercice=https://…/exercice.zip */
  async function readIncomingExercise() {
    const url = new URLSearchParams(location.search).get("exercice");
    if (!url) return null;
    history.replaceState(null, "", location.pathname);
    try {
      const r = await fetch(url, { cache: "no-cache" });
      if (!r.ok) throw new Error(`fichier inaccessible (${r.status})`);
      return await saveExercise(new Uint8Array(await r.arrayBuffer()), url.split("/").pop());
    } catch (e) {
      return { errors: [`Impossible de lire l'exercice du lien : ${e.message}`], warnings: [] };
    }
  }

  /** Contrôle puis enregistre un exercice (zip, .sqlite ou .sql) dans le navigateur */
  async function saveExercise(u8, name) {
    const res = SQLLibrary.readExerciseFile(state.SQL, u8, name);
    if (res.errors.length) return res;
    await SQLLibrary.save(res.exercise, res.bytes);
    state.exercises = await SQLLibrary.list(state.catalogue);
    renderExerciseSelect();
    return res;
  }

  function notifyExercise(res) {
    if (res.errors.length) { notice(res.errors.join(" "), "ko"); return; }
    const n = res.exercise.questions.length;
    let broken = 0;
    if (state.ex && state.ex.id === res.exercise.id) {
      for (const q of state.baseQuestions) if (!SQLPacks.checkQuestion(state.engine, q).ok) broken++;
      state.engine.cache.clear();
    }
    notice(`Exercice importé : « ${res.exercise.titre} », ${n} question${n > 1 ? "s" : ""}.` +
      (broken ? ` ${broken} correction(s) ne fonctionnent pas.` : "") +
      (res.warnings.length ? " " + res.warnings.join(" ") : ""), broken || res.warnings.length ? "partial" : "ok");
  }

  async function removeExercise(id) {
    await SQLLibrary.store.del(id);
    state.exercises = await SQLLibrary.list(state.catalogue);
    renderExerciseSelect();
    await loadExercise(state.catalogue[0].id);
    notice("Exercice retiré de ce navigateur.", "ok");
  }

  // ---------------------------------------------------------------- questions complémentaires
  const packKey = (p) => {
    let h = 5381;
    for (const c of `${p.titre}|${p.auteur || ""}`) h = ((h * 33) ^ c.charCodeAt(0)) >>> 0;
    return "p" + h.toString(36);
  };
  const packsOf = (exId) => store.get("packs:" + exId, []);

  /** Enregistre un pack (remplace celui de même titre et même auteur) */
  function savePack(exId, pack, source) {
    const key = packKey(pack);
    const list = packsOf(exId).filter((p) => p.key !== key);
    list.push({ ...pack, key, source: source || "", importedAt: new Date().toISOString() });
    store.set("packs:" + exId, list);
    return key;
  }

  function removePack(key) {
    store.set("packs:" + state.ex.id, packsOf(state.ex.id).filter((p) => p.key !== key));
    rebuildQuestions();
    if (!state.ex.questions[state.index]) showQuestion(0);
    else showQuestion(state.index);
  }

  /** Lit un pack transmis par lien : ?pack=https://…/fichier.json ou #pack=<données> */
  async function readIncomingPack() {
    const params = new URLSearchParams(location.search);
    const url = params.get("pack");
    const inHash = location.hash.startsWith("#pack=") ? location.hash.slice(6) : null;
    if (!url && !inHash) return null;
    let raw, source;
    try {
      if (inHash) { raw = await SQLPacks.decodePack(inHash); source = "lien"; }
      else {
        const r = await fetch(url, { cache: "no-cache" });
        if (!r.ok) throw new Error(`fichier inaccessible (${r.status})`);
        raw = await r.json();
        source = url;
      }
    } catch (e) {
      history.replaceState(null, "", location.pathname);
      return { error: `Impossible de lire les questions du lien : ${e.message}` };
    }
    const n = SQLPacks.normalizePack(raw);
    history.replaceState(null, "", location.pathname);
    if (!n.pack || !n.pack.questions.length) return { error: "Le lien ne contient aucune question exploitable. " + n.errors.join(" ") };
    let exId = n.pack.exercice;
    if (!knownEx(exId)) exId = store.get("lastEx", state.catalogue[0].id);
    const key = savePack(exId, n.pack, source);
    return { exId, qId: `${key}.${n.pack.questions[0].id}`, pack: n.pack, key };
  }

  /** Questions de l'exercice + présentation + questions complémentaires */
  function rebuildQuestions() {
    const packs = packsOf(state.ex.id);
    const extra = [];
    for (const p of packs) {
      for (const q of p.questions || []) {
        extra.push({ ...q, id: `${p.key}.${q.id}`, group: p.titre, pack: p.key });
      }
    }
    state.ex.questions = [introQuestion(state.ex), ...state.baseQuestions, ...extra];
    state.engine.cache.clear();
    renderPacks();
    renderList();
  }

  /** Signale les corrections importées qui ne s'exécutent pas */
  function checkPackQuestions(key) {
    let broken = 0;
    for (const q of state.ex.questions.filter((x) => x.pack === key)) {
      const c = SQLPacks.checkQuestion(state.engine, q);
      if (!c.ok) broken++;
    }
    return broken;
  }

  function notifyImport(res) {
    if (res.error) { notice(res.error, "ko"); return; }
    const broken = checkPackQuestions(res.key);
    const n = res.pack.questions.length;
    notice(`Questions ajoutées : « ${res.pack.titre} »${res.pack.auteur ? " (" + res.pack.auteur + ")" : ""}, ${n} question${n > 1 ? "s" : ""}, en fin de liste.` +
      (broken ? ` Attention : ${broken} correction(s) ne fonctionnent pas, signalez-le à l'enseignant.` : ""), broken ? "partial" : "ok");
  }

  function notice(text, level = "ok") {
    const n = $("notice");
    n.className = `notice feedback ${level}`;
    n.hidden = false;
    n.querySelector("span").textContent = text;
  }

  async function importFile(file) {
    const u8 = new Uint8Array(await file.arrayBuffer());
    if (SQLLibrary.isZip(u8) || /\.(sqlite3?|db|sql)$/i.test(file.name)) { // exercice complet ou base seule
      $("loading").hidden = false;
      $("loading").textContent = "Import de l'exercice…";
      const res = await saveExercise(u8, file.name);
      $("loading").hidden = true;
      if (!res.errors.length) await loadExercise(res.exercise.id, "intro");
      notifyExercise(res);
      return;
    }
    let raw;
    try {
      raw = SQLPacks.extractJson(new TextDecoder().decode(u8));
    } catch (e) {
      notice(`Fichier illisible : ${e.message}`, "ko");
      return;
    }
    const n = SQLPacks.normalizePack(raw);
    if (!n.pack || !n.pack.questions.length) { notice("Aucune question exploitable dans ce fichier. " + n.errors.join(" "), "ko"); return; }
    let exId = n.pack.exercice;
    if (!knownEx(exId)) exId = state.ex.id;
    const key = savePack(exId, n.pack, file.name);
    const qId = `${key}.${n.pack.questions[0].id}`;
    if (exId !== state.ex.id) await loadExercise(exId, qId);
    else {
      rebuildQuestions();
      showQuestion(state.ex.questions.findIndex((q) => q.id === qId));
    }
    notifyImport({ exId, key, pack: n.pack });
  }

  function renderPacks() {
    const packs = packsOf(state.ex.id);
    $("packList").innerHTML = packs.length
      ? packs.map((p) => `<li><span class="pack-title" title="${esc(p.description || "")}">${esc(p.titre)}</span>` +
          `<span class="muted small">${p.questions.length} q.${p.auteur ? " · " + esc(p.auteur) : ""}</span>` +
          `<button type="button" class="icon-btn small" data-remove-pack="${esc(p.key)}" title="Retirer ces questions" aria-label="Retirer le pack ${esc(p.titre)}">✕</button></li>`).join("")
      : `<li class="muted small">Aucune. Un enseignant peut vous donner un fichier ou un lien.</li>`;
    $("linkCreate").href = `create.html#${encodeURIComponent(state.ex.id)}`;
  }

  async function onHash() {
    if (location.hash.startsWith("#pack=")) { // lien collé dans un onglet déjà ouvert
      const inc = await readIncomingPack();
      if (inc && !inc.error) await loadExercise(inc.exId, inc.qId);
      if (inc) notifyImport(inc);
      return;
    }
    const [exId, qId] = parseHash();
    if (exId && (!state.ex || exId !== state.ex.id)) await loadExercise(exId, qId);
    else if (qId) {
      const i = state.ex.questions.findIndex((q) => q.id === qId);
      if (i >= 0 && i !== state.index) showQuestion(i, false);
    }
  }

  async function loadExercise(exId, qId) {
    if (!knownEx(exId)) exId = state.catalogue[0].id;
    $("loading").hidden = false;
    $("loading").classList.remove("error");
    $("loading").textContent = "Chargement de la base…";
    try {
      const { ex, bytes, kind } = await SQLLibrary.load(exId, state.catalogue);
      state.ex = ex;
      state.kind = kind;
      state.baseQuestions = ex.questions || [];
      state.engine = new SQLEngine(state.SQL, bytes, ex.aujourdhui);
    } catch (e) {
      $("loading").textContent = `Impossible de charger l'exercice « ${exId} » (${e.message}).`;
      $("loading").classList.add("error");
      return;
    }
    store.set("lastEx", exId);
    $("exercice").value = exId;
    $("contexte").textContent = state.ex.contexte || "";
    $("source").textContent = state.ex.source || "";
    $("todayNote").textContent = `Date du jour simulée : ${frDate(state.ex.aujourdhui)}`;
    renderSchema();
    loadInlineDiagram();
    rebuildQuestions();
    let i = state.ex.questions.findIndex((q) => q.id === qId);
    if (i < 0) i = Math.max(0, state.ex.questions.findIndex((q) => q.id === store.get("lastQ:" + exId, "")));
    showQuestion(i, !qId);
    $("loading").hidden = true;
  }

  // ---------------------------------------------------------------- schéma
  function renderSchema() {
    const db = state.engine.fresh();
    const tables = db.exec("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY rowid")[0].values.map((r) => r[0]);
    state.schema = tables.map((t) => {
      const cols = db.exec(`PRAGMA table_info("${t}")`)[0].values; // cid, name, type, notnull, dflt, pk
      const fks = db.exec(`PRAGMA foreign_key_list("${t}")`);
      const fkMap = new Map((fks[0] ? fks[0].values : []).map((r) => [r[3], `${r[2]}.${r[4]}`]));
      const count = db.exec(`SELECT COUNT(*) FROM "${t}"`)[0].values[0][0];
      return { name: t, count, cols: cols.map((c) => ({ name: c[1], type: c[2], pk: c[5] > 0, fk: fkMap.get(c[1]) })) };
    });
    db.close();
    editor.setSchema(state.schema);
    $("schema").innerHTML = state.schema.map((t) => {
      const cols = t.cols.map((c) => {
        let n = esc(c.name);
        if (c.fk) n = `<i title="clé étrangère → ${esc(c.fk)}">#${n}</i>`;
        if (c.pk) n = `<u title="clé primaire">${n}</u>`;
        return n;
      }).join(", ");
      return `<li><button type="button" class="tname" data-table="${esc(t.name)}" title="Afficher le contenu (${t.count} lignes)">${esc(t.name)}</button> (${cols})</li>`;
    }).join("");
  }

  const diagramStore = {
    load: (key) => store.get(key, null),
    save: (key, pos) => store.set(key, pos),
  };

  /** Diagramme affiché dans la colonne de droite (onglet « Diagramme ») */
  function loadInlineDiagram() {
    if (!state.inline) {
      state.inline = new SchemaDiagram($("diagramInline"), {
        ...diagramStore, fit: true, maxFit: 1,
        onOpenTable: previewTable,
      });
    }
    // disposition mémorisée séparément de la vue en grand (formats différents)
    state.inline.load(state.schema, state.ex.schemaGrid, "layout-col:" + state.ex.id);
  }

  function selectTab(name) {
    const diagram = name !== "list";
    $("tabDiagram").setAttribute("aria-selected", String(diagram));
    $("tabList").setAttribute("aria-selected", String(!diagram));
    $("panelDiagram").hidden = !diagram;
    $("panelList").hidden = diagram;
    $("dgTools").hidden = !diagram;
    store.set("schemaTab", diagram ? "diagram" : "list");
    if (diagram && state.inline) state.inline.resize();
  }

  function setCollapsed(collapsed) {
    $("schemaBody").hidden = collapsed;
    $("schemaCol").classList.toggle("collapsed", collapsed);
    $("btnCollapse").setAttribute("aria-expanded", String(!collapsed));
    store.set("schemaCollapsed", collapsed);
    if (!collapsed && state.inline) state.inline.resize();
  }

  /** Poignée entre la zone de travail et le schéma (grand écran) */
  function setupSplitter() {
    const main = document.querySelector(".main");
    const sp = $("splitter");
    const apply = (w) => {
      const max = main.clientWidth - 460;
      w = Math.round(Math.max(300, Math.min(max, w)));
      main.style.setProperty("--schema-w", w + "px");
      return w;
    };
    const saved = store.get("schemaWidth", null);
    if (saved) apply(saved);
    let dragging = false;
    sp.addEventListener("pointerdown", (e) => {
      dragging = true;
      sp.setPointerCapture(e.pointerId);
      sp.classList.add("active");
      document.body.style.userSelect = "none";
    });
    sp.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      const r = main.getBoundingClientRect();
      apply(r.right - parseFloat(getComputedStyle(main).paddingRight) - e.clientX - 6);
    });
    const end = () => {
      if (!dragging) return;
      dragging = false;
      sp.classList.remove("active");
      document.body.style.userSelect = "";
      store.set("schemaWidth", parseFloat(main.style.getPropertyValue("--schema-w")) || null);
    };
    sp.addEventListener("pointerup", end);
    sp.addEventListener("pointercancel", end);
    sp.addEventListener("keydown", (e) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      e.preventDefault();
      const cur = parseFloat(main.style.getPropertyValue("--schema-w")) || $("schemaCol").clientWidth;
      store.set("schemaWidth", apply(cur + (e.key === "ArrowLeft" ? 30 : -30)));
    });
  }

  function openDiagram() {
    if (!state.diagram) {
      state.diagram = new SchemaDiagram($("diagram"), {
        ...diagramStore, fit: true, maxFit: 1.3,
        onOpenTable: (name) => { $("diagramDialog").close(); previewTable(name); },
      });
    }
    $("dgTitle").textContent = `Schéma relationnel – ${state.ex.titre}`;
    $("diagramDialog").showModal();
    state.diagram.load(state.schema, state.ex.schemaGrid, "layout:" + state.ex.id);
  }

  function previewTable(name) {
    const r = state.engine.run(`SELECT * FROM "${name}"`);
    const total = r.result ? r.result.values.length : 0;
    $("resultsCard").hidden = false;
    $("results").innerHTML = `<div class="card-head"><h2>Contenu de la table ${esc(name)}</h2><span class="muted small">${countLabel(total)}</span></div>` +
      `<p class="muted small">Aperçu : équivaut à <code>SELECT * FROM ${esc(name)};</code></p>` + tableHtml(r.result);
    $("resultsCard").scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  // ---------------------------------------------------------------- questions
  function renderList() {
    const done = solved();
    let theme = null, group;
    let h = "";
    state.ex.questions.forEach((q, i) => {
      if (q.group !== group) { // début d'un pack de questions complémentaires
        if (theme !== null) h += "</ol>";
        theme = null;
        group = q.group;
        h += `<h2 class="group">★ ${esc(group)}</h2>`;
      }
      if (q.theme !== theme) {
        if (theme !== null) h += "</ol>";
        theme = q.theme;
        h += `<h3>${esc(theme)}</h3><ol>`;
      }
      const short = q.enonce.length > 70 ? q.enonce.slice(0, 68) + "…" : q.enonce;
      const cls = [done.has(q.id) ? "done" : "", i === state.index ? "current" : "", isIntro(q) ? "intro-item" : ""].filter(Boolean).join(" ");
      h += `<li><a href="#${esc(state.ex.id)}/${esc(q.id)}" data-i="${i}" class="${cls}">` +
        `<span class="num">${qNumber(i)}</span><span class="txt">${esc(short)}</span>${q.type === "write" ? '<span class="tag">✎</span>' : q.type === "schema" ? '<span class="tag" title="Construction de schéma">◫</span>' : q.type === "processus" ? '<span class="tag" title="Processus">⇄</span>' : ""}</a></li>`;
    });
    h += "</ol>";
    $("questionList").innerHTML = h;
    const real = state.ex.questions.filter((q) => !isIntro(q));
    const n = real.length;
    const d = real.filter((q) => done.has(q.id)).length;
    $("progressText").textContent = `${d} / ${n}`;
    $("progressFill").style.width = `${n ? (100 * d) / n : 0}%`;
  }

  function current() { return state.ex.questions[state.index]; }
  const isIntro = (q) => q.type === "intro";
  /** numéro affiché : la présentation est la question 0 */
  const qNumber = (i) => (isIntro(state.ex.questions[0]) ? i : i + 1);

  /** Question 0 : présentation du contexte et de la base, exploration libre */
  function introQuestion(ex) {
    return {
      id: "intro",
      type: "intro",
      theme: "Présentation",
      enonce: "Présentation : le contexte et la base de données",
    };
  }

  function renderIntro() {
    const ex = state.ex;
    const tables = state.schema.map((t) =>
      `<li><button type="button" class="tname" data-table="${esc(t.name)}">${esc(t.name)}</button> <span class="muted small">${countLabel(t.count)}</span></li>`).join("");
    const n = ex.questions.filter((q) => !isIntro(q)).length;
    $("qIntro").innerHTML =
      `<p>${esc(ex.contexte || "")}</p>` +
      (ex.source ? `<p class="muted small">${esc(ex.source)}</p>` : "") +
      `<h3>La base de données</h3>` +
      `<p>Elle contient ${state.schema.length} tables. Observez le diagramme : chaque flèche part d'une <i>#clé étrangère</i> et pointe vers la <u>clé primaire</u> de la table liée. C'est ce lien qui permet les jointures. Cliquez sur une table pour voir son contenu :</p>` +
      `<ul class="tables">${tables}</ul>` +
      `<p class="small">Date du jour simulée : <strong>${esc(frDate(ex.aujourdhui))}</strong> (c'est la date renvoyée par <code>NOW()</code> ou <code>CURDATE()</code>).</p>` +
      `<h3>Comment travailler</h3>` +
      `<ol class="small">` +
      `<li>Lisez l'énoncé et repérez les tables utiles dans le diagramme.</li>` +
      `<li>Écrivez la requête puis exécutez-la (<kbd>Ctrl</kbd>+<kbd>Entrée</kbd>) : elle est comparée au résultat attendu et un message vous guide si elle n'est pas encore juste.</li>` +
      `<li>Si besoin : <em>Résultat attendu</em>, puis <em>Indice</em>, et seulement en dernier recours <em>Correction</em>.</li>` +
      `<li>Les INSERT, UPDATE et DELETE sont fictifs : la base repart de zéro à chaque exécution.</li>` +
      `</ol>` +
      `<p class="small">Ici, l'éditeur sert à <strong>explorer librement</strong> la base, par exemple <code>SELECT * FROM ${esc(state.schema[0] ? state.schema[0].name : "")};</code></p>` +
      `<p><button type="button" class="btn primary small" data-start>Commencer la question 1 →</button> <span class="muted small">${n} questions</span></p>` +
      (state.kind === "perso" && !CONFIG.locked
        ? `<p class="small muted">Exercice importé, conservé dans ce navigateur uniquement. <button type="button" class="link" data-remove-ex>Retirer cet exercice</button></p>`
        : "");
  }

  function showQuestion(i, updateHash = true) {
    const qs = state.ex.questions;
    state.index = Math.max(0, Math.min(qs.length - 1, i));
    const q = current();
    store.set("lastQ:" + state.ex.id, q.id);
    if (state.lms) SQLScorm.setLocation(q.id);
    if (updateHash) history.replaceState(null, "", `#${state.ex.id}/${q.id}`);

    $("qTheme").textContent = q.theme;
    const badge = q.annale ? `Annale ${q.annale}` : q.group ? `★ ${q.group}` : "";
    $("qAnnale").hidden = !badge;
    $("qAnnale").textContent = badge;
    const intro = isIntro(q);
    const total = qs.filter((x) => !isIntro(x)).length;
    $("qNum").textContent = intro ? `${total} questions` : `Question ${qNumber(state.index)} / ${total}`;
    $("qEnonce").textContent = intro ? "Présentation de l'exercice" : q.enonce;
    $("qIntro").hidden = !intro;
    if (intro) renderIntro();
    $("qTools").hidden = intro;
    $("qWriteNote").hidden = q.type !== "write";
    const schemaQ = isSchema(q), processQ = isProcess(q);
    const drawQ = schemaQ || processQ;
    const sqlBox = editor.cm ? editor.cm.getWrapperElement() : $("editor");
    sqlBox.hidden = drawQ;
    sqlBox.style.display = drawQ ? "none" : "";
    document.querySelector(".editor-help").hidden = drawQ || !editor.cm;
    $("schemaEditor").hidden = !schemaQ;
    $("processEditor").hidden = !processQ;
    document.body.classList.toggle("schema-mode", drawQ); // l'éditeur prend toute la largeur
    $("btnExpected").hidden = drawQ;
    $("btnRun").innerHTML = schemaQ ? "✓ Vérifier le schéma" : processQ ? "✓ Vérifier le processus" : "▶ Exécuter <kbd>Ctrl</kbd><kbd>⏎</kbd>";
    if (schemaQ) openSchemaEditor(q);
    else if (processQ) openProcessEditor(q);
    else editor.set(store.get(draftKey(q), ""));

    for (const id of ["hint", "correction", "feedback"]) $(id).hidden = true;
    for (const id of ["btnHint", "btnCorrection", "btnExpected"]) $(id).setAttribute("aria-pressed", "false");
    $("resultsCard").hidden = true;
    $("expectedCard").hidden = true;
    $("btnPrev").disabled = state.index === 0;
    $("btnNext").disabled = state.index === qs.length - 1;
    renderList();
    const cur = document.querySelector("#questionList a.current");
    if (cur) cur.scrollIntoView({ block: "nearest" });
  }

  // ---------------------------------------------------------------- exécution
  /** Exploration libre (question 0) : on exécute et on affiche, sans comparer */
  function explore(sql) {
    const fb = $("feedback");
    let r;
    try {
      r = state.engine.run(sql);
    } catch (e) {
      fb.hidden = false;
      fb.className = "feedback ko";
      fb.innerHTML = `<strong>Erreur dans la requête</strong><p>${esc(SQLCompat.explainError(e.message, sql))}</p>`;
      $("resultsCard").hidden = true;
      return;
    }
    fb.hidden = true;
    let h = "";
    if (r.result) h = `<div class="card-head"><h2>Résultat</h2><span class="muted small">${countLabel(r.result.values.length)}</span></div>` + tableHtml(r.result);
    else h = `<p>${countLabel(r.changes)} modifiée(s) – modification fictive, non conservée.</p>`;
    $("results").innerHTML = h;
    $("resultsCard").hidden = false;
  }

  // ---------------------------------------------------------------- questions « schéma »
  const isSchema = (q) => q && q.type === "schema";

  function baseSchema() { return SQLSchemaCheck.fromDiagramSchema(state.schema); }

  function schemaDepart(q) { return SQLSchemaCheck.departSchema(q, baseSchema()); }

  function openSchemaEditor(q) {
    if (!state.schemaEditor) {
      state.schemaEditor = new SchemaEditor($("schemaEditor"), {
        onChange: (st) => store.set(draftKey(current()), st),
        onReset: () => {
          const qq = current();
          store.set(draftKey(qq), null);
          state.schemaEditor.setState({ ...schemaDepart(qq), pos: {} });
          $("feedback").hidden = true;
        },
      });
    }
    const draft = store.get(draftKey(q), null);
    state.schemaEditor.setState(draft && draft.tables ? draft : { ...schemaDepart(q), pos: {} });
  }

  function checkSchema(q) {
    const st = state.schemaEditor.getState();
    store.set(draftKey(q), st);
    const c = SQLSchemaCheck.compare({ tables: st.tables }, schemaDepart(q), q);
    const fb = $("feedback");
    fb.hidden = false;
    $("resultsCard").hidden = true;
    const score = `<p class="muted small">Points de contrôle respectés : ${c.score.passed} / ${c.score.total}</p>`;
    if (c.ok) {
      const s = solved();
      const first = !s.has(q.id);
      s.add(q.id);
      store.set(solvedKey(), [...s]);
      syncLms(q, SQLSchemaCheck.toText({ tables: st.tables }, false), first);
      renderList();
      fb.className = "feedback ok";
      fb.innerHTML = `<strong>✓ Bravo, le schéma est correct !</strong>` +
        (c.notes.length ? `<ul>${c.notes.map((n) => `<li>${esc(n)}</li>`).join("")}</ul>` : "") + score +
        (state.index < state.ex.questions.length - 1 ? `<p><button type="button" class="btn small" data-next>Question suivante →</button></p>` : "");
    } else {
      fb.className = `feedback ${c.level === "partial" ? "partial" : "ko"}`;
      fb.innerHTML = `<strong>${c.level === "partial" ? "Presque…" : "Pas encore"}</strong><ul>${c.messages.map((m) => `<li>${esc(m)}</li>`).join("")}</ul>` +
        (c.notes.length ? `<p class="muted small">${c.notes.map(esc).join(" ")}</p>` : "") + score;
    }
  }

  // ---------------------------------------------------------------- questions « processus »
  const isProcess = (q) => q && q.type === "processus";

  /** Point de départ : schéma partiel fourni (processus à compléter) ou couloirs seuls */
  function processStart(q) {
    if (q.depart && Array.isArray(q.depart.nodes)) return JSON.parse(JSON.stringify({ lanes: q.couloirs || [], arrows: [], ...q.depart }));
    return { lanes: [...(q.couloirs || [])], nodes: [], arrows: [] };
  }

  function openProcessEditor(q) {
    if (!state.processEditor) {
      state.processEditor = new ProcessEditor($("processEditor"), {
        onChange: (m) => store.set(draftKey(current()), m),
        onReset: () => {
          const qq = current();
          store.set(draftKey(qq), null);
          state.processEditor.setModel(processStart(qq));
          $("feedback").hidden = true;
        },
      });
    }
    const ed = state.processEditor;
    ed.opts.palette = (q.elements || []).map((x) => ({ kind: x.kind, label: x.label }));
    ed.opts.fixedLanes = !!(q.couloirs && q.couloirs.length);
    ed.opts.fileName = `processus-${state.ex.id}-${q.id}`;
    const draft = store.get(draftKey(q), null);
    ed.setModel(draft && draft.nodes ? draft : processStart(q));
  }

  function checkProcess(q) {
    const m = state.processEditor.getModel();
    store.set(draftKey(q), m);
    const c = SQLProcessCheck.check(m, q);
    const fb = $("feedback");
    fb.hidden = false;
    $("resultsCard").hidden = true;
    const score = `<p class="muted small">Contrôles : grammaire du schéma ${c.score.grammar ? "à revoir" : "respectée"} · ${c.score.passed} / ${c.score.total} points vérifiés. Le reste (découpage, noms, acteurs) se compare au corrigé.</p>`;
    if (c.ok) {
      const s = solved();
      const first = !s.has(q.id);
      s.add(q.id);
      store.set(solvedKey(), [...s]);
      syncLms(q, "processus", first);
      renderList();
      fb.className = "feedback ok";
      fb.innerHTML = `<strong>✓ Bravo : le schéma respecte les règles et les synchronisations sont justes !</strong>` + score +
        `<p class="small">Comparez maintenant avec le <button type="button" class="link" data-show-correction>corrigé</button> et cochez la liste d'auto-évaluation.</p>`;
    } else {
      fb.className = `feedback ${c.level === "partial" ? "partial" : "ko"}`;
      fb.innerHTML = `<strong>${c.level === "partial" ? "Presque…" : "Pas encore"}</strong><ul>${c.messages.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` + score;
    }
  }

  function renderProcessCorrection(q) {
    const box = $("correction");
    box.innerHTML = `<p class="muted small">Une solution possible (corrigé) — d'autres découpages peuvent être justes :</p>
      <div class="process-solution"></div>
      ${(q.autoevaluation || []).length ? `<p class="small"><strong>Auto-évaluation</strong> : cochez ce qui est vrai pour votre schéma.</p>
        <ul class="autoeval">${q.autoevaluation.map((t) => `<li><label><input type="checkbox"> ${esc(t)}</label></li>`).join("")}</ul>` : ""}`;
    const v = new ProcessEditor(box.querySelector(".process-solution"), { readonly: true });
    v.setModel(q.solution || processStart(q));
  }

  function run() {
    const q = current();
    if (isSchema(q)) { checkSchema(q); return; }
    if (isProcess(q)) { checkProcess(q); return; }
    const sql = editor.get().trim();
    if (!sql) { editor.focus(); return; }
    store.set(draftKey(q), editor.get());
    if (isIntro(q)) { explore(sql); return; }

    const r = state.engine.evaluate(q, sql);
    const fb = $("feedback");
    fb.hidden = false;

    if (r.error) {
      fb.className = "feedback ko";
      fb.innerHTML = `<strong>Erreur dans la requête</strong><p>${esc(r.error)}</p>` +
        (r.raw && r.raw !== r.error ? `<p class="muted small">Message du moteur : ${esc(r.raw)}</p>` : "");
      $("resultsCard").hidden = true;
      return;
    }

    const c = r.cmp;
    if (c.ok) {
      const s = solved();
      const first = !s.has(q.id);
      s.add(q.id);
      store.set(solvedKey(), [...s]);
      syncLms(q, sql, first);
      renderList();
      fb.className = "feedback ok";
      fb.innerHTML = `<strong>✓ Bravo, c'est le résultat attendu !</strong>` +
        (c.notes.length ? `<ul>${c.notes.map((n) => `<li>${esc(n)}</li>`).join("")}</ul>` : "") +
        (state.index < state.ex.questions.length - 1 ? `<p><button type="button" class="btn small" data-next>Question suivante →</button></p>` : "<p>Vous avez terminé la dernière question de cet exercice.</p>");
    } else {
      fb.className = `feedback ${c.level === "partial" ? "partial" : "ko"}`;
      fb.innerHTML = `<strong>${c.level === "partial" ? "Presque…" : "Pas encore"}</strong><ul>${c.messages.map((m) => `<li>${esc(m)}</li>`).join("")}</ul>` +
        (c.notes.length ? `<p class="muted small">${c.notes.map(esc).join(" ")}</p>` : "") +
        `<p class="muted small">Comparez avec le <button type="button" class="link" data-show-expected>résultat attendu</button>.</p>`;
    }

    // résultat de l'étudiant
    let h = "";
    if (q.type === "write") {
      h += `<div class="card-head"><h2>Effet de votre requête</h2><span class="muted small">${countLabel(r.changes)} modifiée(s), insérée(s) ou supprimée(s)</span></div>`;
      if (c.changedByStudent && c.changedByStudent.length) h += `<h3>Lignes après modification ou ajout</h3>` + tableHtml({ columns: r.expected.after.columns, values: c.changedByStudent }, { cls: "added" });
      if (c.removedByStudent && c.removedByStudent.length) h += `<h3>Lignes avant modification ou supprimées</h3>` + tableHtml({ columns: r.expected.before.columns, values: c.removedByStudent }, { cls: "removed" });
      if (r.result) h += `<h3>Résultat de la dernière instruction</h3>` + tableHtml(r.result);
    } else if (r.result) {
      h += `<div class="card-head"><h2>Votre résultat</h2><span class="muted small">${countLabel(r.result.values.length)}</span></div>` + tableHtml(r.result);
    }
    $("results").innerHTML = h;
    $("resultsCard").hidden = !h;
    if ($("btnExpected").getAttribute("aria-pressed") === "true") renderExpected();
  }

  function renderExpected() {
    const q = current();
    const e = state.engine.expected(q);
    let h;
    if (q.type === "write") {
      const all = [...Array(e.after.columns.length).keys()];
      const key = (r) => JSON.stringify(all.map((j) => SQLCompare.norm(r[j])));
      const bef = new Set(e.before.values.map(key));
      const aft = new Set(e.after.values.map(key));
      const added = e.after.values.filter((r) => !bef.has(key(r)));
      const removed = e.before.values.filter((r) => !aft.has(key(r)));
      h = `<div class="card-head"><h2>Effet attendu</h2></div>`;
      if (added.length) h += `<h3>Lignes après modification ou ajout</h3>` + tableHtml({ columns: e.after.columns, values: added }, { cls: "added" });
      if (removed.length) h += `<h3>Lignes avant modification ou supprimées</h3>` + tableHtml({ columns: e.before.columns, values: removed }, { cls: "removed" });
    } else {
      h = `<div class="card-head"><h2>Résultat attendu</h2><span class="muted small">${countLabel(e.result.values.length)}${q.ordered ? " · ordre imposé" : ""}</span></div>` +
        `<p class="muted small">Les noms de colonnes peuvent différer (alias) : seules les valeurs comptent.</p>` + tableHtml(e.result, { cls: "expected" });
    }
    $("expected").innerHTML = h;
  }

  function toggle(btnId, boxId, render) {
    const btn = $(btnId);
    const on = btn.getAttribute("aria-pressed") !== "true";
    btn.setAttribute("aria-pressed", String(on));
    if (on && render) render();
    $(boxId).hidden = !on;
  }

  function renderCorrection() {
    const q = current();
    if (isProcess(q)) { renderProcessCorrection(q); return; }
    if (isSchema(q)) {
      const depart = schemaDepart(q);
      const sols = [q.solution, ...(q.variantes || [])];
      const cineS = window.SQLCinema ? `<button class="btn small cn-launch" type="button" data-cinema>🎬 Construction pas à pas</button>` : "";
      $("correction").innerHTML = cineS + sols.map((sol, i) =>
        `<p class="muted small">${i === 0 ? "Correction" : sol.partiel ? "Réponse acceptée seulement en partie" : "Autre solution acceptée"}</p>` +
        `<div class="schema-text">${SQLSchemaCheck.toText(SQLSchemaCheck.solutionSchema(depart, sol), true).split("\n").map((l) => `<div>${l}</div>`).join("")}</div>`).join("") +
        `<p class="muted small">Les noms peuvent varier : la vérification accepte les noms équivalents et reconnaît une table à sa clé primaire.</p>`;
      return;
    }
    const blocks = [q.correction, ...(q.variantes || [])];
    const cine = window.SQLCinema && SQLCinema.plan(lines(q.correction), state.schema, q)
      ? `<button class="btn small cn-launch" type="button" data-cinema>🎬 Correction pas à pas</button>` : "";
    $("correction").innerHTML = cine + blocks.map((b, i) =>
      `<p class="muted small">${i === 0 ? "Correction" : "Autre écriture possible"}</p><pre><code>${esc(lines(b))}</code></pre>`).join("");
  }

  /** Mode cinéma : la correction expliquée étape par étape, avec le schéma animé */
  function openCinema() {
    const q = current();
    if (!state.cinema) {
      const ids = { dialog: "cinemaDialog", title: "cnTitle", enonce: "cnEnonce", strip: "cnStrip", diagram: "cnDiagram", comment: "cnComment",
        sql: "cnSql", result: "cnResult", count: "cnCount", first: "cnFirst", prev: "cnPrev", next: "cnNext", play: "cnPlay", close: "cnClose" };
      const els = Object.fromEntries(Object.entries(ids).map(([k, id]) => [k, $(id)]));
      state.cinema = new SQLCinema.Player(els, { store: diagramStore });
    }
    if (isSchema(q)) state.cinema.openSchema({ q, depart: schemaDepart(q) });
    else state.cinema.open({ q, schema: state.schema, engine: state.engine, ex: state.ex, sql: lines(q.correction) });
  }

  function autoGrow() {
    const ed = $("editor");
    ed.style.height = "auto";
    ed.style.height = Math.max(140, ed.scrollHeight + 4) + "px";
  }

  const narrow = () => window.matchMedia("(max-width: 860px)").matches;

  function setSidebar(open) {
    document.body.classList.toggle("sidebar-off", !open);
    $("btnSidebar").setAttribute("aria-expanded", String(open));
  }

  // ---------------------------------------------------------------- événements
  function bindUi() {
    $("btnRun").addEventListener("click", run);
    $("btnPrev").addEventListener("click", () => showQuestion(state.index - 1));
    $("btnNext").addEventListener("click", () => showQuestion(state.index + 1));
    $("btnHint").addEventListener("click", () => toggle("btnHint", "hint", () => { $("hint").textContent = current().indice || "Pas d'indice pour cette question."; }));
    $("btnCorrection").addEventListener("click", () => toggle("btnCorrection", "correction", renderCorrection));
    $("btnExpected").addEventListener("click", () => toggle("btnExpected", "expectedCard", renderExpected));

    $("feedback").addEventListener("click", (e) => {
      if (e.target.closest("[data-next]")) showQuestion(state.index + 1);
      if (e.target.closest("[data-show-correction]") && $("btnCorrection").getAttribute("aria-pressed") !== "true") {
        toggle("btnCorrection", "correction", renderCorrection);
        $("correction").scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
      if (e.target.closest("[data-show-expected]")) {
        if ($("btnExpected").getAttribute("aria-pressed") !== "true") toggle("btnExpected", "expectedCard", renderExpected);
        $("expectedCard").scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    });
    $("correction").addEventListener("click", (e) => { if (e.target.closest("[data-cinema]")) openCinema(); });
    // ----- diagramme
    const dlg = $("diagramDialog");
    $("btnDiagram").addEventListener("click", openDiagram);
    $("dgClose").addEventListener("click", () => dlg.close());
    $("tabDiagram").addEventListener("click", () => selectTab("diagram"));
    $("tabList").addEventListener("click", () => selectTab("list"));
    document.querySelector(".tabs").addEventListener("keydown", (e) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      const toList = $("tabList").getAttribute("aria-selected") !== "true";
      selectTab(toList ? "list" : "diagram");
      $(toList ? "tabList" : "tabDiagram").focus();
    });
    $("btnCollapse").addEventListener("click", () => setCollapsed(!$("schemaBody").hidden));
    $("dgiZoomIn").addEventListener("click", () => state.inline.setZoom(state.inline.zoom + 0.1));
    $("dgiZoomOut").addEventListener("click", () => state.inline.setZoom(state.inline.zoom - 0.1));
    $("dgiReset").addEventListener("click", () => state.inline.reset());
    selectTab(store.get("schemaTab", "diagram"));
    setCollapsed(store.get("schemaCollapsed", false));
    setupSplitter();
    $("dgReset").addEventListener("click", () => state.diagram && state.diagram.reset());
    $("dgZoomIn").addEventListener("click", () => state.diagram.setZoom(state.diagram.zoom + 0.15));
    $("dgZoomOut").addEventListener("click", () => state.diagram.setZoom(state.diagram.zoom - 0.15));
    dlg.addEventListener("click", (e) => { if (e.target === dlg) dlg.close(); }); // clic hors du cadre

    $("schema").addEventListener("click", (e) => {
      const b = e.target.closest("[data-table]");
      if (b) previewTable(b.dataset.table);
    });
    $("questionList").addEventListener("click", (e) => {
      const a = e.target.closest("a[data-i]");
      if (!a) return;
      e.preventDefault();
      showQuestion(+a.dataset.i);
      if (narrow()) setSidebar(false); // sur petit écran, on libère la place après le choix
    });
    $("qIntro").addEventListener("click", (e) => {
      if (e.target.closest("[data-start]")) showQuestion(state.index + 1);
      if (e.target.closest("[data-remove-ex]") && confirm(`Retirer l'exercice « ${state.ex.titre} » de ce navigateur ? (ses questions et sa base seront effacées de ce navigateur)`)) removeExercise(state.ex.id);
      const t = e.target.closest("[data-table]");
      if (t) previewTable(t.dataset.table);
    });

    // ----- questions complémentaires
    $("packFile").addEventListener("change", (e) => {
      const f = e.target.files && e.target.files[0];
      if (f) importFile(f);
      e.target.value = "";
    });
    $("packList").addEventListener("click", (e) => {
      const b = e.target.closest("[data-remove-pack]");
      if (b && confirm("Retirer ces questions complémentaires de votre liste ?")) removePack(b.dataset.removePack);
    });
    $("notice").querySelector("button").addEventListener("click", () => { $("notice").hidden = true; });

    // ----- menu des questions repliable
    $("btnSidebar").addEventListener("click", () => {
      const open = document.body.classList.contains("sidebar-off");
      setSidebar(open);
      store.set("sidebarOpen", open);
    });
    setSidebar(store.get("sidebarOpen", !narrow()));
  }

  init();
})();
