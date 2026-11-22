/* SQL Lab – interface. */
(function () {
  "use strict";
  const I18N = window.I18N || { lang: "fr", add() {}, t: (s, v) => (v ? s.replace(/\{(\w+)\}/g, (m, k) => (v[k] !== undefined ? v[k] : m)) : s), n: (c, a, b, v) => (c > 1 ? b : a).replace(/\{(\w+)\}/g, (m, k) => (k === "n" ? c : v && v[k] !== undefined ? v[k] : m)) };
  const tr = I18N.t, trn = I18N.n;
  I18N.add({
    "📖 Aide": "📖 Help",
    "Copier le lien de cette question": "Copy the link to this question",
    "Lien copié : {url}": "Link copied: {url}",
    "Copiez ce lien :": "Copy this link:",
    "Documentation : guide par profil et par thème": "Documentation: guide by profile and by topic",
    // ---- index.html (texte statique, traduit par I18N.dom)
    "Afficher / masquer la liste des questions": "Show / hide the question list",
    "Afficher ou masquer la liste des questions": "Show or hide the question list",
    "Entraînement aux requêtes – DCG UE8": "SQL query practice – DCG UE8",
    "Exercice": "Exercise",
    "réussies": "solved",
    "Questions complémentaires": "Additional questions",
    "Questions (.json) ou exercice complet avec sa base (.zip, .sqlite, .sql)": "Questions (.json) or a full exercise with its database (.zip, .sqlite, .sql)",
    "Importer un fichier…": "Import a file…",
    "Créer des questions": "Create questions",
    "Contexte de l'exercice": "Exercise context",
    "Schéma de la base": "Database schema",
    "Diagramme": "Diagram",
    "Schéma relationnel": "Relational schema",
    "Réduire": "Zoom out",
    "Agrandir": "Zoom in",
    "Agrandir le texte": "Enlarge text",
    "Réinitialiser la disposition et le zoom": "Reset layout and zoom",
    "Réinitialiser la disposition": "Reset layout",
    "Ouvrir en grand": "Open full size",
    "Ouvrir le diagramme en grand": "Open the diagram full size",
    "Replier / déplier": "Collapse / expand",
    "Glissez les tables pour les déplacer · double-clic : contenu de la table · clé primaire": "Drag tables to move them · double-click: table contents · primary key",
    "soulignée": "underlined",
    ", clé étrangère": ", foreign key",
    "#en italique": "#in italics",
    "clé primaire": "primary key",
    "· clé étrangère": "· foreign key",
    "· cliquez sur une table pour voir son contenu": "· click a table to see its contents",
    "Largeur du schéma": "Schema width",
    "Glisser pour élargir le schéma": "Drag to widen the schema",
    "Fermer le message": "Close message",
    "✎ Requête de modification : elle est exécutée sur une copie de la base, vos changements ne sont jamais conservés.": "✎ Data modification query: it runs on a copy of the database, your changes are never kept.",
    "Votre requête SQL": "Your SQL query",
    "Écrivez votre requête ici, puis Ctrl + Entrée pour l'exécuter": "Write your query here, then press Ctrl + Enter to run it",
    "Complétion : tapez le début d'un nom de table ou de colonne, ou": "Autocomplete: type the start of a table or column name, or",
    "Espace": "Space",
    "; après": "; after",
    "(ou un alias": "(or an alias",
    ") les colonnes de la table sont proposées.": ") the table's columns are suggested.",
    "▶ Exécuter": "▶ Run",
    "Résultat attendu": "Expected result",
    "Indice": "Hint",
    "Correction": "Solution",
    "← Précédente": "← Previous",
    "Suivante →": "Next →",
    "Aide-mémoire SQL": "SQL cheat sheet",
    "Consultation": "Querying data",
    "Jointure avec JOIN": "Join with JOIN",
    "Sous-requête": "Subquery",
    "Mises à jour": "Changing data",
    "Dates": "Dates",
    "ou": "or",
    "sont acceptés": "are accepted",
    ": date du jour simulée": ": simulated current date",
    ": écart en jours": ": difference in days",
    "Pièges fréquents": "Common pitfalls",
    "et non": "not",
    "décimales avec un point :": "decimals use a point:",
    "condition sur COUNT/SUM →": "condition on COUNT/SUM →",
    "· Les modifications sont fictives : la base repart de zéro à chaque exécution. · Moteur SQLite (sql.js) dans votre navigateur, aucune réponse n'est envoyée.": "· Changes are simulated: the database starts afresh at each run. · SQLite engine (sql.js) running in your browser, no answers are sent anywhere.",
    "Glissez les tables pour les déplacer · double-clic sur une table : voir son contenu": "Drag tables to move them · double-click a table: see its contents",
    "Fermer": "Close",
    "Correction pas à pas": "Step-by-step solution",
    "Étapes de construction de la requête": "Steps in building the query",
    "Revenir au début": "Back to the start",
    "◀ Précédent": "◀ Previous",
    "Suivant ▶": "Next ▶",
    "⏵ Lecture auto": "⏵ Autoplay",
    "affiché": "shown",
    "filtre": "filter",
    "jointure": "join",
    "table de passage": "linking table",
    "Chargement de la base…": "Loading the database…",
    // ---- textes dynamiques
    "Aucune ligne": "No rows",
    "… {n} ligne(s) supplémentaire(s) non affichée(s).": "… {n} more row(s) not shown.",
    "{n} ligne": "{n} row",
    "{n} lignes": "{n} rows",
    "Impossible de charger le moteur SQL ou la liste des exercices. Ouvrez la page via un serveur web (GitHub Pages ou http://localhost), pas en double-cliquant sur le fichier.": "Could not load the SQL engine or the list of exercises. Open the page through a web server (GitHub Pages or http://localhost), not by double-clicking the file.",
    "Plateforme non détectée : la progression reste dans ce navigateur.": "Learning platform not detected: your progress stays in this browser.",
    "Connecté à la plateforme": "Connected to the learning platform",
    " · score : {s} %": " · score: {s}%",
    " · score transmis : {s} %": " · score sent: {s}%",
    "Exercices importés": "Imported exercises",
    "(FR) ": "(FR) ",
    "fichier inaccessible ({s})": "file not reachable ({s})",
    "Impossible de lire l'exercice du lien : {m}": "Could not read the exercise from the link: {m}",
    "Exercice importé : « {titre} », {n} question.": "Exercise imported: “{titre}”, {n} question.",
    "Exercice importé : « {titre} », {n} questions.": "Exercise imported: “{titre}”, {n} questions.",
    "{n} correction(s) ne fonctionnent pas.": "{n} solution(s) do not work.",
    "Exercice retiré de ce navigateur.": "Exercise removed from this browser.",
    "Impossible de lire les questions du lien : {m}": "Could not read the questions from the link: {m}",
    "Le lien ne contient aucune question exploitable. ": "The link does not contain any usable question. ",
    "Questions ajoutées : « {titre} »{auteur}, {n} question, en fin de liste.": "Questions added: “{titre}”{auteur}, {n} question, at the end of the list.",
    "Questions ajoutées : « {titre} »{auteur}, {n} questions, en fin de liste.": "Questions added: “{titre}”{auteur}, {n} questions, at the end of the list.",
    "Attention : {n} correction(s) ne fonctionnent pas, signalez-le à l'enseignant.": "Careful: {n} solution(s) do not work, please tell your teacher.",
    "Import de l'exercice…": "Importing the exercise…",
    "Fichier illisible : {m}": "Unreadable file: {m}",
    "Aucune question exploitable dans ce fichier. ": "No usable question in this file. ",
    "Retirer ces questions": "Remove these questions",
    "Retirer le pack {titre}": "Remove the question pack {titre}",
    "Aucune. Un enseignant peut vous donner un fichier ou un lien.": "None. A teacher can give you a file or a link.",
    "Impossible de charger l'exercice « {id} » ({m}).": "Could not load the exercise “{id}” ({m}).",
    "Date du jour simulée : {d}": "Simulated current date: {d}",
    "clé étrangère → {fk}": "foreign key → {fk}",
    "Afficher le contenu ({n} lignes)": "Show the contents ({n} rows)",
    "Schéma relationnel – {titre}": "Relational schema – {titre}",
    "Contenu de la table {name}": "Contents of table {name}",
    "Aperçu : équivaut à <code>SELECT * FROM {name};</code>": "Preview: same as <code>SELECT * FROM {name};</code>",
    "Construction de schéma": "Schema building",
    "Processus": "Process",
    "Présentation": "Introduction",
    "Présentation : le contexte et la base de données": "Introduction: the context and the database",
    "La base de données": "The database",
    "Elle contient {n} tables. Observez le diagramme : chaque flèche part d'une <i>#clé étrangère</i> et pointe vers la <u>clé primaire</u> de la table liée. C'est ce lien qui permet les jointures. Cliquez sur une table pour voir son contenu :": "It contains {n} tables. Look at the diagram: each arrow starts from a <i>#foreign key</i> and points to the <u>primary key</u> of the linked table. This link is what makes joins possible. Click a table to see its contents:",
    "Date du jour simulée : <strong>{d}</strong> (c'est la date renvoyée par <code>NOW()</code> ou <code>CURDATE()</code>).": "Simulated current date: <strong>{d}</strong> (this is the date returned by <code>NOW()</code> or <code>CURDATE()</code>).",
    "Comment travailler": "How to work",
    "Lisez l'énoncé et repérez les tables utiles dans le diagramme.": "Read the question and find the tables you need in the diagram.",
    "Écrivez la requête puis exécutez-la (<kbd>Ctrl</kbd>+<kbd>Entrée</kbd>) : elle est comparée au résultat attendu et un message vous guide si elle n'est pas encore juste.": "Write the query, then run it (<kbd>Ctrl</kbd>+<kbd>Enter</kbd>): it is compared with the expected result, and a message guides you if it is not right yet.",
    "Si besoin : <em>Résultat attendu</em>, puis <em>Indice</em>, et seulement en dernier recours <em>Correction</em>.": "If needed: <em>Expected result</em>, then <em>Hint</em>, and only as a last resort <em>Solution</em>.",
    "Les INSERT, UPDATE et DELETE sont fictifs : la base repart de zéro à chaque exécution.": "INSERT, UPDATE and DELETE are simulated: the database starts afresh at each run.",
    "Ici, l'éditeur sert à <strong>explorer librement</strong> la base, par exemple <code>SELECT * FROM {t};</code>": "Here, the editor lets you <strong>explore the database freely</strong>, for example <code>SELECT * FROM {t};</code>",
    "Commencer la question 1 →": "Start question 1 →",
    "Exercice importé, conservé dans ce navigateur uniquement.": "Imported exercise, kept in this browser only.",
    "Retirer cet exercice": "Remove this exercise",
    "Annale {a}": "Exam {a}",
    "Présentation de l'exercice": "About this exercise",
    "✓ Vérifier le schéma": "✓ Check the schema",
    "✓ Vérifier le processus": "✓ Check the process",
    "▶ Exécuter <kbd>Ctrl</kbd><kbd>⏎</kbd>": "▶ Run <kbd>Ctrl</kbd><kbd>⏎</kbd>",
    "Erreur dans la requête": "Error in the query",
    "Résultat": "Result",
    "{rows} modifiée(s) – modification fictive, non conservée.": "{rows} changed – simulated change, not kept.",
    "Points de contrôle respectés : {a} / {b}": "Checkpoints passed: {a} / {b}",
    "✓ Bravo, le schéma est correct !": "✓ Well done, the schema is correct!",
    "Question suivante →": "Next question →",
    "Presque…": "Almost…",
    "Pas encore": "Not yet",
    "Contrôles : grammaire du schéma à revoir · {a} / {b} points vérifiés. Le reste (découpage, noms, acteurs) se compare au corrigé.": "Checks: diagram grammar needs work · {a} / {b} points checked. The rest (breakdown, names, actors) is compared with the model answer.",
    "Contrôles : grammaire du schéma respectée · {a} / {b} points vérifiés. Le reste (découpage, noms, acteurs) se compare au corrigé.": "Checks: diagram grammar respected · {a} / {b} points checked. The rest (breakdown, names, actors) is compared with the model answer.",
    "✓ Bravo : le schéma respecte les règles et les synchronisations sont justes !": "✓ Well done: the diagram follows the rules and the synchronisations are right!",
    "Comparez maintenant avec le <button type=\"button\" class=\"link\" data-show-correction>corrigé</button> et cochez la liste d'auto-évaluation.": "Now compare with the <button type=\"button\" class=\"link\" data-show-correction>model answer</button> and tick the self-assessment checklist.",
    "Une solution possible (corrigé) — d'autres découpages peuvent être justes :": "One possible solution (model answer) — other breakdowns can be right too:",
    "<strong>Auto-évaluation</strong> : cochez ce qui est vrai pour votre schéma.": "<strong>Self-assessment</strong>: tick what is true for your diagram.",
    "Message du moteur : {m}": "Engine message: {m}",
    "✓ Bravo, c'est le résultat attendu !": "✓ Well done, that's the expected result!",
    "Vous avez terminé la dernière question de cet exercice.": "You have finished the last question of this exercise.",
    "Comparez avec le <button type=\"button\" class=\"link\" data-show-expected>résultat attendu</button>.": "Compare with the <button type=\"button\" class=\"link\" data-show-expected>expected result</button>.",
    "Effet de votre requête": "Effect of your query",
    "{rows} modifiée(s), insérée(s) ou supprimée(s)": "{rows} changed, inserted or deleted",
    "Lignes après modification ou ajout": "Rows after the change or insertion",
    "Lignes avant modification ou supprimées": "Rows before the change, or deleted",
    "Résultat de la dernière instruction": "Result of the last statement",
    "Votre résultat": "Your result",
    "Effet attendu": "Expected effect",
    " · ordre imposé": " · order required",
    "Les noms de colonnes peuvent différer (alias) : seules les valeurs comptent.": "Column names may differ (aliases): only the values count.",
    "🎬 Construction pas à pas": "🎬 Step-by-step build",
    "🎬 Correction pas à pas": "🎬 Step-by-step solution",
    "Réponse acceptée seulement en partie": "Answer only partly accepted",
    "Autre solution acceptée": "Other accepted solution",
    "Les noms peuvent varier : la vérification accepte les noms équivalents et reconnaît une table à sa clé primaire.": "Names may vary: the check accepts equivalent names and recognises a table by its primary key.",
    "Autre écriture possible": "Another possible way to write it",
    "Pas d'indice pour cette question.": "No hint for this question.",
    "Retirer l'exercice « {titre} » de ce navigateur ? (ses questions et sa base seront effacées de ce navigateur)": "Remove the exercise “{titre}” from this browser? (its questions and database will be deleted from this browser)",
    "Retirer ces questions complémentaires de votre liste ?": "Remove these additional questions from your list?",
  });

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
    if (!rows.length) h += `<tr><td colspan="${res.columns.length || 1}" class="empty">${tr("Aucune ligne")}</td></tr>`;
    for (const r of rows) h += "<tr>" + r.map((v) => `<td>${fmtValue(v)}</td>`).join("") + "</tr>";
    h += "</tbody></table></div>";
    if (res.values.length > MAX_ROWS) h += `<p class="muted small">${tr("… {n} ligne(s) supplémentaire(s) non affichée(s).", { n: res.values.length - MAX_ROWS })}</p>`;
    return h;
  }

  // en anglais, 0 prend le pluriel (« 0 rows »)
  function countLabel(n) { return trn(n === 0 && I18N.lang !== "fr" ? 2 : n, "{n} ligne", "{n} lignes", { n }); }

  // ---------------------------------------------------------------- chargement
  async function init() {
    I18N.dom && I18N.dom(); // texte statique de la page, avant tout rendu dynamique
    $("editor").placeholder = tr("Écrivez votre requête ici, puis Ctrl + Entrée pour l'exécuter"); // textarea ignorée par I18N.dom
    if (I18N.toggle) I18N.toggle($("btnLang"));
    else $("btnLang").hidden = true;
    // documentation : absente des paquets SCORM, on pointe alors vers le site public
    $("btnDocs").href = (CONFIG.scorm ? "https://edu-fpar.github.io/sql-lab/" : "") + (I18N.lang === "en" ? "docs/#/en/" : "docs/");
    try {
      state.SQL = await initSqlJs({ locateFile: (f) => SQLJS_DIR + f });
      state.catalogue = await (await fetch("exercices/catalogue.json")).json();
      state.exercises = await SQLLibrary.list(state.catalogue);
    } catch (e) {
      $("loading").textContent = tr("Impossible de charger le moteur SQL ou la liste des exercices. Ouvrez la page via un serveur web (GitHub Pages ou http://localhost), pas en double-cliquant sur le fichier.");
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
    // interface en anglais sans exercice imposé : premier exercice en anglais du catalogue
    const enEx = I18N.lang === "en" && state.catalogue.find((e) => e.langue === "en");
    const defaultEx = enEx ? enEx.id : store.get("lastEx", state.catalogue[0].id);
    await loadExercise(CONFIG.locked ? CONFIG.exercice : exId || defaultEx, qId);
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
      el.textContent = tr("Plateforme non détectée : la progression reste dans ce navigateur.");
      return;
    }
    const st = SQLScorm.loadState();
    store.set("solved:" + CONFIG.exercice, st.solved);
    if (st.current) store.set("lastQ:" + CONFIG.exercice, st.current);
    const name = SQLScorm.learnerName();
    const score = SQLScorm.get("cmi.core.score.raw");
    el.textContent = tr("Connecté à la plateforme") + (name ? " · " + name : "") + (score ? tr(" · score : {s} %", { s: score }) : "");
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
    $("lmsStatus").textContent = tr("Connecté à la plateforme") + (name ? " · " + name : "") + tr(" · score transmis : {s} %", { s: score });
  }

  function renderExerciseSelect() {
    // exercices intégrés dans l'autre langue que l'interface : (FR) ou (EN) devant le titre
    const tag = (e) => (e.kind === "perso" ? "" : I18N.lang === "fr" ? (e.langue === "en" ? "(EN) " : "") : e.langue !== "en" ? tr("(FR) ") : "");
    const opt = (e) => `<option value="${esc(e.id)}">${tag(e)}${esc(e.titre)}</option>`;
    const builtin = state.exercises.filter((e) => e.kind !== "perso");
    const perso = state.exercises.filter((e) => e.kind === "perso");
    $("exercice").innerHTML = builtin.map(opt).join("") +
      (perso.length ? `<optgroup label="${tr("Exercices importés")}">${perso.map(opt).join("")}</optgroup>` : "");
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
      if (!r.ok) throw new Error(tr("fichier inaccessible ({s})", { s: r.status }));
      return await saveExercise(new Uint8Array(await r.arrayBuffer()), url.split("/").pop());
    } catch (e) {
      return { errors: [tr("Impossible de lire l'exercice du lien : {m}", { m: e.message })], warnings: [] };
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
    notice(trn(n, "Exercice importé : « {titre} », {n} question.", "Exercice importé : « {titre} », {n} questions.", { titre: res.exercise.titre }) +
      (broken ? " " + tr("{n} correction(s) ne fonctionnent pas.", { n: broken }) : "") +
      (res.warnings.length ? " " + res.warnings.join(" ") : ""), broken || res.warnings.length ? "partial" : "ok");
  }

  async function removeExercise(id) {
    await SQLLibrary.store.del(id);
    state.exercises = await SQLLibrary.list(state.catalogue);
    renderExerciseSelect();
    await loadExercise(state.catalogue[0].id);
    notice(tr("Exercice retiré de ce navigateur."), "ok");
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
        if (!r.ok) throw new Error(tr("fichier inaccessible ({s})", { s: r.status }));
        raw = await r.json();
        source = url;
      }
    } catch (e) {
      history.replaceState(null, "", location.pathname);
      return { error: tr("Impossible de lire les questions du lien : {m}", { m: e.message }) };
    }
    const n = SQLPacks.normalizePack(raw);
    history.replaceState(null, "", location.pathname);
    if (!n.pack || !n.pack.questions.length) return { error: tr("Le lien ne contient aucune question exploitable. ") + n.errors.join(" ") };
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
    notice(trn(n, "Questions ajoutées : « {titre} »{auteur}, {n} question, en fin de liste.", "Questions ajoutées : « {titre} »{auteur}, {n} questions, en fin de liste.",
      { titre: res.pack.titre, auteur: res.pack.auteur ? " (" + res.pack.auteur + ")" : "" }) +
      (broken ? " " + tr("Attention : {n} correction(s) ne fonctionnent pas, signalez-le à l'enseignant.", { n: broken }) : ""), broken ? "partial" : "ok");
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
      $("loading").textContent = tr("Import de l'exercice…");
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
      notice(tr("Fichier illisible : {m}", { m: e.message }), "ko");
      return;
    }
    const n = SQLPacks.normalizePack(raw);
    if (!n.pack || !n.pack.questions.length) { notice(tr("Aucune question exploitable dans ce fichier. ") + n.errors.join(" "), "ko"); return; }
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
          `<button type="button" class="icon-btn small" data-remove-pack="${esc(p.key)}" title="${tr("Retirer ces questions")}" aria-label="${tr("Retirer le pack {titre}", { titre: esc(p.titre) })}">✕</button></li>`).join("")
      : `<li class="muted small">${tr("Aucune. Un enseignant peut vous donner un fichier ou un lien.")}</li>`;
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
    $("loading").textContent = tr("Chargement de la base…");
    try {
      const { ex, bytes, kind } = await SQLLibrary.load(exId, state.catalogue);
      state.ex = ex;
      state.kind = kind;
      state.baseQuestions = ex.questions || [];
      state.engine = new SQLEngine(state.SQL, bytes, ex.aujourdhui);
    } catch (e) {
      $("loading").textContent = tr("Impossible de charger l'exercice « {id} » ({m}).", { id: exId, m: e.message });
      $("loading").classList.add("error");
      return;
    }
    store.set("lastEx", exId);
    $("exercice").value = exId;
    $("contexte").textContent = state.ex.contexte || "";
    $("source").textContent = state.ex.source || "";
    $("todayNote").textContent = tr("Date du jour simulée : {d}", { d: frDate(state.ex.aujourdhui) });
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
        if (c.fk) n = `<i title="${tr("clé étrangère → {fk}", { fk: esc(c.fk) })}">#${n}</i>`;
        if (c.pk) n = `<u title="${tr("clé primaire")}">${n}</u>`;
        return n;
      }).join(", ");
      return `<li><button type="button" class="tname" data-table="${esc(t.name)}" title="${tr("Afficher le contenu ({n} lignes)", { n: t.count })}">${esc(t.name)}</button> (${cols})</li>`;
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
    $("dgTitle").textContent = tr("Schéma relationnel – {titre}", { titre: state.ex.titre });
    $("diagramDialog").showModal();
    state.diagram.load(state.schema, state.ex.schemaGrid, "layout:" + state.ex.id);
  }

  function previewTable(name) {
    const r = state.engine.run(`SELECT * FROM "${name}"`);
    const total = r.result ? r.result.values.length : 0;
    $("resultsCard").hidden = false;
    $("results").innerHTML = `<div class="card-head"><h2>${tr("Contenu de la table {name}", { name: esc(name) })}</h2><span class="muted small">${countLabel(total)}</span></div>` +
      `<p class="muted small">${tr("Aperçu : équivaut à <code>SELECT * FROM {name};</code>", { name: esc(name) })}</p>` + tableHtml(r.result);
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
        h += `<h3><span>${esc(theme)}</span>${window.SQLRappels ? SQLRappels.button(theme) : ""}</h3><ol>`;
      }
      const short = q.enonce.length > 70 ? q.enonce.slice(0, 68) + "…" : q.enonce;
      const cls = [done.has(q.id) ? "done" : "", i === state.index ? "current" : "", isIntro(q) ? "intro-item" : ""].filter(Boolean).join(" ");
      h += `<li><a href="#${esc(state.ex.id)}/${esc(q.id)}" data-i="${i}" class="${cls}">` +
        `<span class="num">${qNumber(i)}</span><span class="txt">${esc(short)}</span>${q.type === "write" ? '<span class="tag">✎</span>' : q.type === "schema" ? `<span class="tag" title="${esc(tr("Construction de schéma"))}">◫</span>` : q.type === "processus" ? `<span class="tag" title="${esc(tr("Processus"))}">⇄</span>` : ""}</a></li>`;
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
      theme: tr("Présentation"),
      enonce: tr("Présentation : le contexte et la base de données"),
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
      `<h3>${tr("La base de données")}</h3>` +
      `<p>${tr("Elle contient {n} tables. Observez le diagramme : chaque flèche part d'une <i>#clé étrangère</i> et pointe vers la <u>clé primaire</u> de la table liée. C'est ce lien qui permet les jointures. Cliquez sur une table pour voir son contenu :", { n: state.schema.length })}</p>` +
      `<ul class="tables">${tables}</ul>` +
      `<p class="small">${tr("Date du jour simulée : <strong>{d}</strong> (c'est la date renvoyée par <code>NOW()</code> ou <code>CURDATE()</code>).", { d: esc(frDate(ex.aujourdhui)) })}</p>` +
      `<h3>${tr("Comment travailler")}</h3>` +
      `<ol class="small">` +
      `<li>${tr("Lisez l'énoncé et repérez les tables utiles dans le diagramme.")}</li>` +
      `<li>${tr("Écrivez la requête puis exécutez-la (<kbd>Ctrl</kbd>+<kbd>Entrée</kbd>) : elle est comparée au résultat attendu et un message vous guide si elle n'est pas encore juste.")}</li>` +
      `<li>${tr("Si besoin : <em>Résultat attendu</em>, puis <em>Indice</em>, et seulement en dernier recours <em>Correction</em>.")}</li>` +
      `<li>${tr("Les INSERT, UPDATE et DELETE sont fictifs : la base repart de zéro à chaque exécution.")}</li>` +
      `</ol>` +
      `<p class="small">${tr("Ici, l'éditeur sert à <strong>explorer librement</strong> la base, par exemple <code>SELECT * FROM {t};</code>", { t: esc(state.schema[0] ? state.schema[0].name : "") })}</p>` +
      `<p><button type="button" class="btn primary small" data-start>${tr("Commencer la question 1 →")}</button> <span class="muted small">${n} questions</span></p>` +
      (state.kind === "perso" && !CONFIG.locked
        ? `<p class="small muted">${tr("Exercice importé, conservé dans ce navigateur uniquement.")} <button type="button" class="link" data-remove-ex>${tr("Retirer cet exercice")}</button></p>`
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
    // lien direct : inutile dans un paquet SCORM ou pour une question importée (absente chez les autres)
    $("btnCopyLink").hidden = !!(CONFIG.locked || CONFIG.scorm || q.group);
    const rp = $("qRappel");
    if (rp) rp.innerHTML = window.SQLRappels && !isIntro(q) ? SQLRappels.button(q.theme) : "";
    const badge = q.annale ? tr("Annale {a}", { a: q.annale }) : q.group ? `★ ${q.group}` : "";
    $("qAnnale").hidden = !badge;
    $("qAnnale").textContent = badge;
    const intro = isIntro(q);
    const total = qs.filter((x) => !isIntro(x)).length;
    $("qNum").textContent = intro ? `${total} questions` : `Question ${qNumber(state.index)} / ${total}`;
    $("qEnonce").textContent = intro ? tr("Présentation de l'exercice") : q.enonce;
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
    $("btnRun").innerHTML = schemaQ ? tr("✓ Vérifier le schéma") : processQ ? tr("✓ Vérifier le processus") : tr("▶ Exécuter <kbd>Ctrl</kbd><kbd>⏎</kbd>");
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
      fb.innerHTML = `<strong>${tr("Erreur dans la requête")}</strong><p>${esc(SQLCompat.explainError(e.message, sql))}</p>`;
      $("resultsCard").hidden = true;
      return;
    }
    fb.hidden = true;
    let h = "";
    if (r.result) h = `<div class="card-head"><h2>${tr("Résultat")}</h2><span class="muted small">${countLabel(r.result.values.length)}</span></div>` + tableHtml(r.result);
    else h = `<p>${tr("{rows} modifiée(s) – modification fictive, non conservée.", { rows: countLabel(r.changes) })}</p>`;
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
    const score = `<p class="muted small">${tr("Points de contrôle respectés : {a} / {b}", { a: c.score.passed, b: c.score.total })}</p>`;
    if (c.ok) {
      const s = solved();
      const first = !s.has(q.id);
      s.add(q.id);
      store.set(solvedKey(), [...s]);
      syncLms(q, SQLSchemaCheck.toText({ tables: st.tables }, false), first);
      renderList();
      fb.className = "feedback ok";
      fb.innerHTML = `<strong>${tr("✓ Bravo, le schéma est correct !")}</strong>` +
        (c.notes.length ? `<ul>${c.notes.map((n) => `<li>${esc(n)}</li>`).join("")}</ul>` : "") + score +
        (state.index < state.ex.questions.length - 1 ? `<p><button type="button" class="btn small" data-next>${tr("Question suivante →")}</button></p>` : "");
    } else {
      fb.className = `feedback ${c.level === "partial" ? "partial" : "ko"}`;
      fb.innerHTML = `<strong>${c.level === "partial" ? tr("Presque…") : tr("Pas encore")}</strong><ul>${c.messages.map((m) => `<li>${esc(m)}</li>`).join("")}</ul>` +
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
    const score = `<p class="muted small">${tr(c.score.grammar
      ? "Contrôles : grammaire du schéma à revoir · {a} / {b} points vérifiés. Le reste (découpage, noms, acteurs) se compare au corrigé."
      : "Contrôles : grammaire du schéma respectée · {a} / {b} points vérifiés. Le reste (découpage, noms, acteurs) se compare au corrigé.", { a: c.score.passed, b: c.score.total })}</p>`;
    if (c.ok) {
      const s = solved();
      const first = !s.has(q.id);
      s.add(q.id);
      store.set(solvedKey(), [...s]);
      syncLms(q, "processus", first);
      renderList();
      fb.className = "feedback ok";
      fb.innerHTML = `<strong>${tr("✓ Bravo : le schéma respecte les règles et les synchronisations sont justes !")}</strong>` + score +
        `<p class="small">${tr("Comparez maintenant avec le <button type=\"button\" class=\"link\" data-show-correction>corrigé</button> et cochez la liste d'auto-évaluation.")}</p>`;
    } else {
      fb.className = `feedback ${c.level === "partial" ? "partial" : "ko"}`;
      fb.innerHTML = `<strong>${c.level === "partial" ? tr("Presque…") : tr("Pas encore")}</strong><ul>${c.messages.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` + score;
    }
  }

  function renderProcessCorrection(q) {
    const box = $("correction");
    box.innerHTML = `<p class="muted small">${tr("Une solution possible (corrigé) — d'autres découpages peuvent être justes :")}</p>
      <div class="process-solution"></div>
      ${(q.autoevaluation || []).length ? `<p class="small">${tr("<strong>Auto-évaluation</strong> : cochez ce qui est vrai pour votre schéma.")}</p>
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
      fb.innerHTML = `<strong>${tr("Erreur dans la requête")}</strong><p>${esc(r.error)}</p>` +
        (r.raw && r.raw !== r.error ? `<p class="muted small">${tr("Message du moteur : {m}", { m: esc(r.raw) })}</p>` : "");
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
      fb.innerHTML = `<strong>${tr("✓ Bravo, c'est le résultat attendu !")}</strong>` +
        (c.notes.length ? `<ul>${c.notes.map((n) => `<li>${esc(n)}</li>`).join("")}</ul>` : "") +
        (state.index < state.ex.questions.length - 1 ? `<p><button type="button" class="btn small" data-next>${tr("Question suivante →")}</button></p>` : `<p>${tr("Vous avez terminé la dernière question de cet exercice.")}</p>`);
    } else {
      fb.className = `feedback ${c.level === "partial" ? "partial" : "ko"}`;
      fb.innerHTML = `<strong>${c.level === "partial" ? tr("Presque…") : tr("Pas encore")}</strong><ul>${c.messages.map((m) => `<li>${esc(m)}</li>`).join("")}</ul>` +
        (c.notes.length ? `<p class="muted small">${c.notes.map(esc).join(" ")}</p>` : "") +
        `<p class="muted small">${tr("Comparez avec le <button type=\"button\" class=\"link\" data-show-expected>résultat attendu</button>.")}</p>`;
    }

    // résultat de l'étudiant
    let h = "";
    if (q.type === "write") {
      h += `<div class="card-head"><h2>${tr("Effet de votre requête")}</h2><span class="muted small">${tr("{rows} modifiée(s), insérée(s) ou supprimée(s)", { rows: countLabel(r.changes) })}</span></div>`;
      if (c.changedByStudent && c.changedByStudent.length) h += `<h3>${tr("Lignes après modification ou ajout")}</h3>` + tableHtml({ columns: r.expected.after.columns, values: c.changedByStudent }, { cls: "added" });
      if (c.removedByStudent && c.removedByStudent.length) h += `<h3>${tr("Lignes avant modification ou supprimées")}</h3>` + tableHtml({ columns: r.expected.before.columns, values: c.removedByStudent }, { cls: "removed" });
      if (r.result) h += `<h3>${tr("Résultat de la dernière instruction")}</h3>` + tableHtml(r.result);
    } else if (r.result) {
      h += `<div class="card-head"><h2>${tr("Votre résultat")}</h2><span class="muted small">${countLabel(r.result.values.length)}</span></div>` + tableHtml(r.result);
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
      h = `<div class="card-head"><h2>${tr("Effet attendu")}</h2></div>`;
      if (added.length) h += `<h3>${tr("Lignes après modification ou ajout")}</h3>` + tableHtml({ columns: e.after.columns, values: added }, { cls: "added" });
      if (removed.length) h += `<h3>${tr("Lignes avant modification ou supprimées")}</h3>` + tableHtml({ columns: e.before.columns, values: removed }, { cls: "removed" });
    } else {
      h = `<div class="card-head"><h2>${tr("Résultat attendu")}</h2><span class="muted small">${countLabel(e.result.values.length)}${q.ordered ? tr(" · ordre imposé") : ""}</span></div>` +
        `<p class="muted small">${tr("Les noms de colonnes peuvent différer (alias) : seules les valeurs comptent.")}</p>` + tableHtml(e.result, { cls: "expected" });
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
      const cineS = window.SQLCinema ? `<button class="btn small cn-launch" type="button" data-cinema>${tr("🎬 Construction pas à pas")}</button>` : "";
      $("correction").innerHTML = cineS + sols.map((sol, i) =>
        `<p class="muted small">${i === 0 ? tr("Correction") : sol.partiel ? tr("Réponse acceptée seulement en partie") : tr("Autre solution acceptée")}</p>` +
        `<div class="schema-text">${SQLSchemaCheck.toText(SQLSchemaCheck.solutionSchema(depart, sol), true).split("\n").map((l) => `<div>${l}</div>`).join("")}</div>`).join("") +
        `<p class="muted small">${tr("Les noms peuvent varier : la vérification accepte les noms équivalents et reconnaît une table à sa clé primaire.")}</p>`;
      return;
    }
    const blocks = [q.correction, ...(q.variantes || [])];
    const cine = window.SQLCinema && SQLCinema.plan(lines(q.correction), state.schema, q)
      ? `<button class="btn small cn-launch" type="button" data-cinema>${tr("🎬 Correction pas à pas")}</button>` : "";
    $("correction").innerHTML = cine + blocks.map((b, i) =>
      `<p class="muted small">${i === 0 ? tr("Correction") : tr("Autre écriture possible")}</p><pre><code>${esc(lines(b))}</code></pre>`).join("");
  }

  /** Copie l'adresse directe de la question affichée (avec la langue d'interface) */
  async function copyQuestionLink() {
    const q = current();
    const u = new URL(location.href);
    u.search = I18N.lang === "en" ? "?lang=en" : "";
    u.hash = `${state.ex.id}/${q.id}`;
    const url = u.toString();
    const btn = $("btnCopyLink");
    try {
      await navigator.clipboard.writeText(url);
      btn.classList.add("copied");
      btn.innerHTML = '<i class="i i-check" aria-hidden="true"></i>';
      btn.title = tr("Lien copié : {url}", { url });
      setTimeout(() => {
        btn.classList.remove("copied");
        btn.innerHTML = '<i class="i i-link" aria-hidden="true"></i>';
        btn.title = tr("Copier le lien de cette question");
      }, 1800);
    } catch (e) {
      window.prompt(tr("Copiez ce lien :"), url); // presse-papiers indisponible (http, droits)
    }
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
    $("btnHint").addEventListener("click", () => toggle("btnHint", "hint", () => { $("hint").textContent = current().indice || tr("Pas d'indice pour cette question."); }));
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
    $("btnCopyLink").addEventListener("click", copyQuestionLink);
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
      if (e.target.closest("[data-remove-ex]") && confirm(tr("Retirer l'exercice « {titre} » de ce navigateur ? (ses questions et sa base seront effacées de ce navigateur)", { titre: state.ex.titre }))) removeExercise(state.ex.id);
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
      if (b && confirm(tr("Retirer ces questions complémentaires de votre liste ?"))) removePack(b.dataset.removePack);
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
