/* SQL Lab – espace enseignant : prompt IA, import, vérification, partage. */
(function (global) {
  "use strict";

  const I18N = global.I18N || { lang: "fr", add() {}, has: () => false, t: (s, v) => (v ? s.replace(/\{(\w+)\}/g, (m, k) => (v[k] !== undefined ? v[k] : m)) : s), n: (c, a, b, v) => (c > 1 ? b : a).replace(/\{(\w+)\}/g, (m, k) => (k === "n" ? c : v && v[k] !== undefined ? v[k] : m)) };
  const t = I18N.t, tn = I18N.n;
  const EN = () => I18N.lang !== "fr"; // prompt dans une autre langue que le français
  const LANG_NAME = () => ({ en: "English", es: "Spanish (español)" }[I18N.lang] || "English");
  const numLocale = () => ({ fr: "fr-FR", en: "en-GB", es: "es-ES" }[I18N.lang] || "fr-FR");
  I18N.add({
    "📖 Aide": "📖 Help",
    "Documentation : guide par profil et par thème": "Documentation: guide by profile and by topic",
    // ---- page (HTML statique, traduite par I18N.dom)
    "SQL Lab – Créer des questions": "SQL Lab – Create questions",
    "Espace enseignant de SQL Lab : préparer un prompt pour son IA, vérifier les questions générées, les partager par fichier ou par lien.": "SQL Lab teacher space: prepare a prompt for your AI, check the generated questions, share them as a file or a link.",
    "SQL Lab – Espace enseignant": "SQL Lab – Teacher space",
    "Créer des questions complémentaires sur une base d'exercice": "Create additional questions on an exercise database",
    "Base": "Database",
    "← Entraînement": "← Practice",
    "Trois étapes : <strong>1.</strong> préparez la demande pour votre IA (ChatGPT, Claude, Mistral, Gemini…), <strong>2.</strong> collez sa réponse, <strong>3.</strong> vérifiez et retouchez les questions (chaque correction est exécutée sur la base), puis <strong>4.</strong> partagez-les à vos étudiants par fichier ou par lien. Vous pouvez aussi écrire vos questions directement à l'étape 3. Votre travail est enregistré dans ce navigateur.":
      "Four steps: <strong>1.</strong> prepare the request for your AI (ChatGPT, Claude, Mistral, Gemini…), <strong>2.</strong> paste its answer, <strong>3.</strong> check and adjust the questions (each solution is run on the database), then <strong>4.</strong> share them with your students as a file or a link. You can also write your questions directly in step 3. Your work is saved in this browser.",
    "Ma base": "My database",
    "Base personnelle conservée dans ce navigateur. Ces informations accompagnent la base quand vous la partagez (exercice complet ou SCORM).": "Personal database stored in this browser. This information goes with the database when you share it (full exercise or SCORM).",
    "Titre de l'exercice": "Exercise title",
    "Auteur": "Author",
    "Date du jour simulée": "Simulated current date",
    "Contexte présenté aux étudiants": "Context shown to students",
    "L'entreprise, ce que contiennent les tables, le sens des colonnes importantes…": "The company, what the tables contain, the meaning of the important columns…",
    "Supprimer cette base de ce navigateur": "Delete this database from this browser",
    "Schéma de la base": "Database schema",
    "Télécharger la description détaillée de la base (.md)": "Download the detailed database description (.md)",
    "Lire le mode d'emploi pour l'IA (skill)": "Read the instructions for the AI (skill, in French)",
    "Préparer la demande à votre IA": "Prepare the request for your AI",
    "Titre du pack": "Pack title",
    "Ex. Révisions jointures – TD 4": "E.g. Joins revision – Tutorial 4",
    "Ex. M. Dupont, BTS/DCG lycée…": "E.g. Mr Smith, accounting degree…",
    "Nombre de questions": "Number of questions",
    "Niveau": "Level",
    "Découverte (très guidé)": "Beginner (highly guided)",
    "Entraînement (niveau TD)": "Practice (tutorial level)",
    "Examen (style annales DCG)": "Exam (DCG past-paper style)",
    "Thèmes à faire travailler": "Topics to practise",
    "(aucun coché : progression au choix de l'IA)": "(none ticked: the AI chooses the progression)",
    "Consignes particulières": "Specific instructions",
    "Ex. uniquement des questions sur les offres de 2023 ; éviter les sous-requêtes ; vocabulaire très simple ; 2 questions de mise à jour à la fin…": "E.g. only questions about the 2023 offers; avoid subqueries; very simple vocabulary; 2 update questions at the end…",
    "Inclure le mode d'emploi complet dans le prompt (pour une IA qui ne peut pas ouvrir de lien)": "Include the full instructions in the prompt (for an AI that cannot open links)",
    "Ajouter 1 ou 2 questions de construction / évolution du schéma (dessin de tables, clés et références)": "Add 1 or 2 schema design / evolution questions (drawing tables, keys and references)",
    "Lister les questions déjà proposées dans l'exercice (pour éviter les doublons)": "List the questions already in the exercise (to avoid duplicates)",
    "Copier le prompt": "Copy the prompt",
    "Voir le prompt": "Show the prompt",
    "Importer la réponse de l'IA": "Import the AI's answer",
    "Collez ici la réponse complète (le bloc JSON suffit, le texte autour est ignoré)": "Paste the full answer here (the JSON block is enough; any text around it is ignored)",
    "Charger ces questions": "Load these questions",
    "Ouvrir un fichier JSON…": "Open a JSON file…",
    "Commencer un pack vide": "Start an empty pack",
    "Vérifier et retravailler": "Check and revise",
    "(facultatif)": "(optional)",
    "Objectif du pack, consignes pour les étudiants…": "Purpose of the pack, instructions for students…",
    "Tout vérifier": "Check all",
    "+ Ajouter une question": "+ Add a question",
    "+ Question de schéma": "+ Schema question",
    "+ Question de processus": "+ Process question",
    "Aucune question pour l'instant : importez la réponse de l'IA (étape 2) ou ajoutez une question.": "No questions yet: import the AI's answer (step 2) or add a question.",
    "Partager avec les étudiants": "Share with students",
    "Exercice complet (.zip)": "Full exercise (.zip)",
    "La base, son contexte et les questions dans un seul fichier. L'étudiant l'importe avec « Importer un fichier » ; un autre enseignant peut le charger ici.": "The database, its context and the questions in a single file. Students import it with \"Import a file\"; another teacher can load it here.",
    "Inclure les questions déjà présentes dans l'exercice": "Include the questions already in the exercise",
    "Télécharger l'exercice": "Download the exercise",
    "Paquet SCORM (Moodle…)": "SCORM package (Moodle…)",
    "L'application complète, verrouillée sur cet exercice (base + questions cochées ci-contre), à déposer dans Moodle comme « Paquetage SCORM ». Score transmis : % de questions réussies ; l'étudiant reprend où il en était.": "The complete application, locked to this exercise (database + the questions selected here), to upload to Moodle as a \"SCORM package\". Score reported: % of questions passed; students resume where they left off.",
    "Seuil de réussite (facultatif, en %)": "Pass mark (optional, in %)",
    "ex. 80": "e.g. 80",
    "Télécharger le paquet SCORM": "Download the SCORM package",
    "Fichier": "File",
    "À déposer sur Moodle, à envoyer par mail… L'étudiant l'importe avec « Importer un fichier » dans SQL Lab.": "To upload to Moodle, send by email… Students import it with \"Import a file\" in SQL Lab.",
    "Télécharger le JSON": "Download the JSON",
    "Lien sans serveur": "Serverless link",
    "Les questions sont contenues dans le lien lui-même (compressées). Rien n'est hébergé ni envoyé à un serveur.": "The questions are contained in the link itself (compressed). Nothing is hosted or sent to a server.",
    "Copier le lien": "Copy the link",
    "Tester": "Test",
    "Lien vers un fichier hébergé": "Link to a hosted file",
    "Si vous déposez le JSON en ligne (GitHub, Gist « raw », votre site…) : les étudiants verront toujours la dernière version.": "If you put the JSON online (GitHub, \"raw\" Gist, your website…), students will always see the latest version.",
    "https://…/mes-questions.json": "https://…/my-questions.json",
    "Le site doit autoriser la lecture depuis une autre page (en-tête CORS) : c'est le cas de GitHub et des Gists, rarement de Moodle.": "The site must allow reading from another page (CORS header): GitHub and Gists do, Moodle rarely does.",
    "Dessinez le schéma attendu à partir du départ : nouvelles tables, clés primaires, références, attributs à retirer.": "Draw the expected schema from the starting point: new tables, primary keys, references, attributes to remove.",
    "Annuler": "Cancel",
    "Enregistrer la solution": "Save the solution",
    "Corrigé": "Solution",
    "Dessinez le schéma événements-résultats : acteurs, événements, opérations et leurs règles d'émission, synchronisations.": "Draw the event-driven process diagram: actors, events, operations with their output rules, synchronisations.",
    "Enregistrer": "Save",
    "Chargement de la base…": "Loading the database…",

    // ---- thèmes et niveaux (interface et prompt)
    "Une seule table (SELECT, WHERE, ORDER BY)": "A single table (SELECT, WHERE, ORDER BY)",
    "Calculs et agrégats (COUNT, SUM, AVG, MIN, MAX)": "Calculations and aggregates (COUNT, SUM, AVG, MIN, MAX)",
    "Dates (YEAR, MONTH, BETWEEN, date du jour)": "Dates (YEAR, MONTH, BETWEEN, current date)",
    "Jointures": "Joins",
    "Jointures et regroupements (GROUP BY, HAVING)": "Joins and grouping (GROUP BY, HAVING)",
    "Sous-requêtes (NOT IN, comparaison à une moyenne…)": "Subqueries (NOT IN, comparison with an average…)",
    "Auto-jointure (relation réflexive)": "Self-join (reflexive relationship)",
    "Mises à jour (INSERT, UPDATE, DELETE)": "Updates (INSERT, UPDATE, DELETE)",
    "Découverte : requêtes courtes, une notion à la fois, énoncés très guidés.": "Beginner: short queries, one concept at a time, highly guided questions.",
    "Entraînement : niveau des exercices de TD du DCG UE8.": "Practice: the level of DCG UE8 tutorial exercises.",
    "Examen : énoncés dans le style des annales du DCG UE8, combinant plusieurs notions.": "Exam: questions in the style of past DCG UE8 exam papers, combining several concepts.",

    // ---- chargement, bases personnelles
    "Impossible de charger le moteur SQL : ouvrez la page via un serveur web (GitHub Pages ou http://localhost).": "Unable to load the SQL engine: open the page through a web server (GitHub Pages or http://localhost).",
    "Mes bases": "My databases",
    "＋ Charger ma base (.zip, .sqlite, .sql)…": "＋ Load my database (.zip, .sqlite, .sql)…",
    "Lecture de la base…": "Reading the database…",
    "Impossible d'utiliser ce fichier :\n- ": "Unable to use this file:\n- ",
    "Une base « {titre} » existe déjà dans ce navigateur. La remplacer ?": "A database \"{titre}\" already exists in this browser. Replace it?",
    "Base chargée : {titre}": "Database loaded: {titre}",
    " (voir les remarques)": " (see the notes)",
    "Supprimer la base « {titre} » de ce navigateur ?": "Delete the database \"{titre}\" from this browser?",

    // ---- cartes de questions
    "Monter": "Move up",
    "Descendre": "Move down",
    "Dupliquer": "Duplicate",
    "Supprimer": "Delete",
    "Thème": "Theme",
    "Consultation (SELECT)": "Query (SELECT)",
    "Modification (INSERT, UPDATE, DELETE)": "Data change (INSERT, UPDATE, DELETE)",
    "Construction de schéma": "Schema design",
    "Processus (événements-résultats)": "Process (event-driven diagram)",
    "Indice": "Hint",
    "▶ Vérifier": "▶ Check",
    "▶ Tester": "▶ Test",
    "Énoncé": "Question",
    "Correction": "Solution",
    "Table vérifiée après modification": "Table checked after the change",
    "(vide : déduite de la correction)": "(empty: inferred from the solution)",
    "Variantes acceptées": "Accepted variants",
    "Autres écritures justes, séparées par une ligne <code>---</code>": "Other correct ways to write it, separated by a <code>---</code> line",
    "À vérifier": "To check",
    "✗ À corriger": "✗ To fix",
    "⚠ À relire": "⚠ To review",
    "{n} question": "{n} question",
    "{n} questions": "{n} questions",
    " · {n} à vérifier": " · {n} to check",
    "Supprimer la question {n} ?": "Delete question {n}?",
    "Questions complémentaires": "Additional questions",
    "Vérification déduite : {v}": "Inferred check: {v}",

    // ---- questions de schéma
    "◫ schéma": "◫ schema",
    "Énoncé (règles de gestion à modéliser)": "Question (business rules to model)",
    "Schéma de départ donné à l'étudiant": "Starting schema given to the student",
    "Départ décrit dans le fichier ({n} tables) :": "Starting point described in the file ({n} tables):",
    "Remplacer par des tables de la base": "Replace with tables from the database",
    "Solution attendue": "Expected solution",
    "✎ Modifier la solution": "✎ Edit the solution",
    "✎ Dessiner la solution": "✎ Draw the solution",
    "Pas encore de solution. Dessinez le schéma attendu à partir du départ : la grille de correction (tables, clés, références, attributs à retirer) en sera déduite.": "No solution yet. Draw the expected schema from the starting point: the marking grid (tables, keys, references, attributes to remove) will be derived from it.",
    "Noms acceptés": "Accepted names",
    "(une ligne par table ou attribut)": "(one line per table or attribute)",
    "Rôle des nouvelles tables": "Role of the new tables",
    "(pour le message « Il manque une table pour … »)": "(for the message \"A table is missing to …\")",
    "EMPRUNTER = relier les emprunteurs et les dossiers": "EMPRUNTER = link the borrowers and the files",
    "{n} variante(s) de solution définie(s) dans le fichier : elles sont conservées.": "Solution variants defined in the file: {n} (they are kept).",
    "Solution de la question {n}": "Solution for question {n}",
    "Évolution du schéma": "Schema evolution",
    "énoncé manquant": "missing question text",
    "Aucune solution : cliquez sur « Dessiner la solution ».": "No solution: click \"Draw the solution\".",
    "La solution n'est pas reconnue : {m}": "The solution is not recognised: {m}",
    "La solution est identique au schéma de départ : il n'y a rien à faire.": "The solution is identical to the starting schema: there is nothing to do.",
    "Variante {k} : non reconnue ({m})": "Variant {k}: not recognised ({m})",
    "Pas de rôle pour {nom} : si elle manque, l'étudiant lira « Il manque une table ({nom}) », ce qui donne la réponse.": "No role for {nom}: if it is missing, the student will read \"A table is missing ({nom})\", which gives the answer away.",
    "La solution est reconnue et le schéma de départ seul est refusé.": "The solution is recognised and the starting schema alone is rejected.",
    "{n} points de contrôle.": "{n} checkpoints.",

    // ---- questions de processus
    "⇄ processus": "⇄ process",
    "Texte décrivant le processus et consigne": "Text describing the process, and instructions",
    "Acteurs (couloirs) fournis à l'étudiant": "Actors (swimlanes) given to the student",
    "(séparés par des virgules ; vide : l'étudiant crée les siens)": "(comma-separated; empty: the student creates their own)",
    "Modifier le départ (facultatif)": "Edit the starting point (optional)",
    "Dessiner le départ (facultatif)": "Draw the starting point (optional)",
    "✎ Modifier le corrigé": "✎ Edit the solution",
    "✎ Dessiner le corrigé": "✎ Draw the solution",
    "{a} acteurs · {e} événements · {o} opérations · {s} synchronisation(s)": "{a} actors · {e} events · {o} operations · {s} synchronisation(s)",
    "Pas encore de corrigé.": "No solution yet.",
    " · départ fourni : {n} élément(s)": " · starting point provided: {n} element(s)",
    "Proposer à l'étudiant les événements et opérations du corrigé (étiquettes à placer)": "Offer the student the events and operations of the solution (labels to place)",
    "Ce qui est vérifié": "What is checked",
    "(« Opération = condition » avec les noms des événements ; « Opération : cas 1 | cas 2 » pour les règles d'émission)": "(\"Operation = condition\" using the event names; \"Operation: case 1 | case 2\" for output rules)",
    "Création transport = Détails demande ET (Fiche patient OU Fiche patient créée)&#10;Traitement demande : Patient existant | Patient non existant": "Create transport = Request details AND (Patient record OR Patient record created)&#10;Process request : Existing patient | New patient",
    "Proposer à partir du corrigé dessiné": "Suggest from the drawn solution",
    "Noms équivalents": "Equivalent names",
    "(Événement = autre nom, autre nom)": "(Event = other name, other name)",
    "Auto-évaluation": "Self-assessment",
    "(une phrase par ligne)": "(one sentence per line)",
    "Acteur": "Actor",
    "processus-corrige": "process-solution",
    "Départ fourni à l'étudiant – question {n}": "Starting point given to the student – question {n}",
    "Corrigé – question {n}": "Solution – question {n}",
    "Processus": "Process",
    "Dessinez d'abord le corrigé.": "Draw the solution first.",
    "Aucun corrigé : cliquez sur « Dessiner le corrigé ».": "No solution: click \"Draw the solution\".",
    "Le corrigé ne passe pas les vérifications : {m}": "The solution fails the checks: {m}",
    "Le schéma de départ est déjà accepté : il n'y a rien à faire.": "The starting diagram is already accepted: there is nothing to do.",
    "Aucune synchronisation ni règle attendue : seule la grammaire du schéma sera vérifiée.": "No expected synchronisation or rule: only the diagram's syntax will be checked.",
    "Condition attendue illisible pour « {op} » : {m}": "Unreadable expected condition for \"{op}\": {m}",
    "Pas de liste d'auto-évaluation : l'étudiant ne verra que le corrigé.": "No self-assessment list: the student will only see the solution.",

    // ---- résultats des vérifications
    "Cliquez sur « Tester » pour exécuter la correction.": "Click \"Test\" to run the solution.",
    "Résultat attendu : {n} ligne(s). Cochez les colonnes sur lesquelles l'ordre demandé doit être vérifié (seulement si l'énoncé demande un tri).": "Expected result: {n} row(s). Tick the columns on which the requested order must be checked (only if the question asks for sorting).",
    "Aucune ligne": "No rows",
    "… {n} autre(s) ligne(s)": "… {n} more row(s)",
    "Effet de la correction sur la table vérifiée : {n} ligne(s) touchée(s).": "Effect of the solution on the checked table: {n} row(s) affected.",
    "Toutes les corrections ont été exécutées.": "All solutions have been run.",

    // ---- import
    "{m} Vérifiez que vous avez copié toute la réponse de l'IA.": "{m} Check that you copied the AI's whole answer.",
    "Aucune question exploitable. {m}": "No usable questions. {m}",
    "Ces questions ont été écrites pour la base « {a} », pas pour « {b} ». Les charger quand même sur la base actuelle ?": "These questions were written for the database \"{a}\", not for \"{b}\". Load them on the current database anyway?",
    "Remplacer les questions en cours d'édition par celles-ci ?": "Replace the questions you are editing with these?",
    "{n} question(s) chargée(s)": "{n} question(s) loaded",
    " depuis {s}": " from {s}",
    ", {n} corrigée(s) automatiquement": ", {n} fixed automatically",
    "Abandonner les questions en cours et commencer un pack vide ?": "Discard the current questions and start an empty pack?",

    // ---- prompt et partage
    "{n} caractères · à coller dans la conversation de votre IA": "{n} characters · to paste into your AI chat",
    "Prompt copié : collez-le dans votre IA.": "Prompt copied: paste it into your AI.",
    "{n} question(s) ont une correction qui ne fonctionne pas : corrigez-les avant de partager.": "{n} question(s) have a solution that does not work: fix them before sharing.",
    "{n} question(s) n'ont pas encore été vérifiées (bouton « Tout vérifier »).": "{n} question(s) have not been checked yet (\"Check all\" button).",
    "{n} caractères": "{n} characters",
    " : lien long, certains outils (messageries, Moodle) peuvent le couper ; préférez alors le fichier.": ": long link, some tools (messaging apps, Moodle) may cut it; use the file instead.",
    "{n} question(s) ont une correction qui ne fonctionne pas : corrigez-les avant d'exporter.": "{n} question(s) have a solution that does not work: fix them before exporting.",
    "Aucune question à mettre dans le paquet.": "No questions to put in the package.",
    "Construction du paquet…": "Building the package…",
    "{f} introuvable ({s})": "{f} not found ({s})",
    "Paquet SCORM prêt ({n} questions, {k} Ko).": "SCORM package ready ({n} questions, {k} KB).",
    "Impossible de construire le paquet : {m}": "Unable to build the package: {m}",
    "Lien copié : il contient toutes les questions.": "Link copied: it contains all the questions.",
    "Indiquez l'adresse https:// du fichier JSON hébergé.": "Enter the https:// address of the hosted JSON file.",
    "Lien copié : il pointe vers votre fichier hébergé.": "Link copied: it points to your hosted file.",

    // ---- prompt pour l'IA (en anglais, il demande des questions en anglais)
    "Tu es enseignant(e) en systèmes d'information de gestion (DCG UE8). Crée un pack de questions d'entraînement SQL pour l'application SQL Lab, destiné à des étudiants en gestion (pas à des informaticiens).": "You are a teacher of management information systems (DCG UE8, French accounting and management degree). Create a pack of SQL practice questions for the SQL Lab application, intended for business students (not computer scientists). Write the questions in English.",
    "## Mode d'emploi (format JSON attendu et règles de rédaction)": "## Instructions (expected JSON format and writing rules)",
    "Lien : {url}": "Link: {url}",
    "<<<DÉBUT DU MODE D'EMPLOI": "<<<START OF INSTRUCTIONS (in French)",
    "FIN DU MODE D'EMPLOI>>>": "END OF INSTRUCTIONS>>>",
    "## Base de données à utiliser (n'utiliser que ces tables, colonnes et valeurs)": "## Database to use (use only these tables, columns and values)",
    "## Demande de l'enseignant": "## Teacher's request",
    "- Valeur du champ \"exercice\" : \"{id}\"": "- Value of the \"exercice\" field: \"{id}\"",
    "- Titre du pack : {v}": "- Pack title: {v}",
    "(à proposer)": "(to be suggested, in English)",
    "- Auteur : {v}": "- Author: {v}",
    "- Nombre de questions : {n}": "- Number of questions: {n}",
    "- Thèmes à faire travailler : {v}": "- Topics to practise: {v}",
    "au choix, en progression du plus simple au plus difficile": "your choice, progressing from the simplest to the most difficult",
    "- Niveau : {v}": "- Level: {v}",
    "- Consignes particulières : {v}": "- Specific instructions: {v}",
    "aucune": "none",
    "- Ajouter aussi 1 ou 2 questions de construction / évolution du schéma relationnel (type \"schema\", voir le mode d'emploi), à partir de règles de gestion nouvelles et plausibles pour cette entreprise.": "- Also add 1 or 2 relational schema design / evolution questions (type \"schema\", see the instructions), based on new, plausible business rules for this company.",
    "- Questions déjà proposées aux étudiants sur cette base (ne pas les reproduire à l'identique) :": "- Questions already given to students on this database (do not reproduce them as they are):",
    "## Réponse attendue": "## Expected answer",
    "Réponds uniquement avec le JSON complet du pack, dans un seul bloc ```json, sans texte avant ni après. Vérifie chaque correction sur le schéma ci-dessus avant de répondre.": "Reply only with the complete JSON of the pack, in a single ```json block, with no text before or after. Check every solution against the schema above before replying.",
  });

  const SQLJS_DIR = "lib/sql.js/";
  const SKILL_PATH = "skill/sql-lab-questions/SKILL.md";
  const $ = (id) => document.getElementById(id);
  const P = SQLPacks;

  const THEMES = [
    "Une seule table (SELECT, WHERE, ORDER BY)",
    "Calculs et agrégats (COUNT, SUM, AVG, MIN, MAX)",
    "Dates (YEAR, MONTH, BETWEEN, date du jour)",
    "Jointures",
    "Jointures et regroupements (GROUP BY, HAVING)",
    "Sous-requêtes (NOT IN, comparaison à une moyenne…)",
    "Auto-jointure (relation réflexive)",
    "Mises à jour (INSERT, UPDATE, DELETE)",
  ];
  const NIVEAUX = {
    decouverte: "Découverte : requêtes courtes, une notion à la fois, énoncés très guidés.",
    entrainement: "Entraînement : niveau des exercices de TD du DCG UE8.",
    examen: "Examen : énoncés dans le style des annales du DCG UE8, combinant plusieurs notions.",
  };

  const state = { SQL: null, catalogue: [], ex: null, engine: null, pack: null, checks: [], schemaMd: "", skill: null };

  // ---------------------------------------------------------------- utilitaires
  const store = {
    get(k, d) { try { const v = localStorage.getItem("sqllab:" + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem("sqllab:" + k, JSON.stringify(v)); } catch (e) { /* indisponible */ } },
  };
  function esc(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }
  const lines = P.lines;
  function slug(s) {
    return (s || "questions").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "questions";
  }
  let toastTimer;
  function toast(msg) {
    const t = $("toast");
    t.textContent = msg;
    t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { t.hidden = true; }, 2800);
  }
  async function copy(text, okMsg) {
    try {
      await navigator.clipboard.writeText(text);
    } catch (e) {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    toast(okMsg);
  }
  function download(name, text, type) {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([text], { type }));
    a.download = name;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  }
  function fmt(v) {
    if (v === null || v === undefined) return '<span class="null">NULL</span>';
    if (typeof v === "number" && !Number.isInteger(v)) return esc(String(Math.round(v * 10000) / 10000));
    return esc(v);
  }

  // ---------------------------------------------------------------- chargement
  /** Textes statiques de la page (HTML) */
  function translatePage() {
    if (I18N.lang === "fr") return;
    I18N.dom();
    const intro = $("introText");
    const key = intro.innerHTML.replace(/\s+/g, " ").trim();
    if (I18N.has(key)) intro.innerHTML = t(key); // texte fixe de la page, sans donnée extérieure
    for (const id of ["bContexte", "pConsignes"]) $(id).placeholder = t($(id).placeholder.trim());
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.content = t(meta.content);
  }

  async function init() {
    translatePage();
    if (I18N.toggle) I18N.toggle($("btnLang"));
    if (I18N.lang !== "fr") $("btnDocs").href = `docs/#/${I18N.lang}/profiles/teacher`;
    try {
      state.SQL = await initSqlJs({ locateFile: (f) => SQLJS_DIR + f });
      state.catalogue = await (await fetch("exercices/catalogue.json")).json();
      state.exercises = await SQLLibrary.list(state.catalogue);
    } catch (e) {
      $("loading").textContent = t("Impossible de charger le moteur SQL : ouvrez la page via un serveur web (GitHub Pages ou http://localhost).");
      $("loading").classList.add("error");
      return;
    }
    renderExerciseSelect();
    $("themes").innerHTML = THEMES.map((th, i) => `<label class="chip"><input type="checkbox" value="${i}"> ${esc(t(th))}</label>`).join("");
    bind();
    const wanted = decodeURIComponent(location.hash.slice(1));
    const known = (id) => state.exercises.some((e) => e.id === id);
    // par défaut : le premier exercice dans la langue de l'interface (les annales en français)
    const byLang = state.catalogue.find((e) => (e.langue || "fr") === I18N.lang) || state.catalogue[0];
    const last = store.get("creator:lastEx", byLang.id);
    await loadExercise(known(wanted) ? wanted : known(last) ? last : byLang.id);
  }

  function renderExerciseSelect() {
    const opt = (e) => `<option value="${esc(e.id)}">${esc(e.titre)}</option>`;
    const perso = state.exercises.filter((e) => e.kind === "perso");
    $("exercice").innerHTML = state.exercises.filter((e) => e.kind !== "perso").map(opt).join("") +
      (perso.length ? `<optgroup label="${esc(t("Mes bases"))}">${perso.map(opt).join("")}</optgroup>` : "") +
      `<option value="__new">${t("＋ Charger ma base (.zip, .sqlite, .sql)…")}</option>`;
    if (state.ex) $("exercice").value = state.ex.id;
  }

  /** Base personnelle apportée par l'enseignant */
  async function importBase(file) {
    $("loading").hidden = false;
    $("loading").textContent = t("Lecture de la base…");
    const res = SQLLibrary.readExerciseFile(state.SQL, new Uint8Array(await file.arrayBuffer()), file.name);
    $("loading").hidden = true;
    if (res.errors.length) { alert(t("Impossible d'utiliser ce fichier :\n- ") + res.errors.join("\n- ")); return; }
    if (state.exercises.some((e) => e.id === res.exercise.id) && !confirm(t("Une base « {titre} » existe déjà dans ce navigateur. La remplacer ?", { titre: res.exercise.titre }))) return;
    await SQLLibrary.save(res.exercise, res.bytes);
    state.exercises = await SQLLibrary.list(state.catalogue);
    renderExerciseSelect();
    await loadExercise(res.exercise.id);
    toast(t("Base chargée : {titre}", { titre: res.exercise.titre }) + (res.warnings.length ? t(" (voir les remarques)") : ""));
    $("baseWarn").hidden = !res.warnings.length;
    $("baseWarn").textContent = res.warnings.join(" ");
  }

  let metaTimer;
  function saveBaseMeta() {
    clearTimeout(metaTimer);
    metaTimer = setTimeout(async () => {
      if (state.kind !== "perso") return;
      state.ex.titre = $("bTitre").value.trim() || state.ex.titre;
      state.ex.contexte = $("bContexte").value.trim();
      state.ex.aujourdhui = $("bDate").value || state.ex.aujourdhui;
      const auteur = $("bAuteur").value.trim();
      if (auteur) state.ex.auteur = auteur; else delete state.ex.auteur;
      await SQLLibrary.save(state.ex, state.bytes);
      state.exercises = await SQLLibrary.list(state.catalogue);
      renderExerciseSelect();
      state.engine.today = state.ex.aujourdhui;
      state.engine.cache.clear();
      state.schemaMd = P.describeSchema(state.engine, state.ex);
      updatePromptInfo();
    }, 400);
  }

  async function loadExercise(exId) {
    $("loading").hidden = false;
    $("loading").textContent = t("Chargement de la base…");
    const { ex, bytes, kind } = await SQLLibrary.load(exId, state.catalogue);
    state.ex = ex;
    state.kind = kind;
    state.bytes = bytes;
    ex.questions = ex.questions || [];
    state.engine = new SQLEngine(state.SQL, bytes, ex.aujourdhui);
    $("baseCard").hidden = kind !== "perso";
    $("baseWarn").hidden = true;
    if (kind === "perso") {
      $("bTitre").value = ex.titre || "";
      $("bAuteur").value = ex.auteur || "";
      $("bDate").value = ex.aujourdhui || "";
      $("bContexte").value = ex.contexte || "";
    }
    state.schemaMd = P.describeSchema(state.engine, ex);
    state.base = baseSchema();
    store.set("creator:lastEx", exId);
    $("exercice").value = exId;
    $("backLink").href = `index.html#${encodeURIComponent(exId)}`;
    history.replaceState(null, "", "#" + exId);
    renderSchema();
    const prefs = store.get("creator:prefs", {});
    for (const k of ["pTitre", "pAuteur", "pNombre", "pNiveau", "pConsignes"]) if (prefs[k] !== undefined) $(k).value = prefs[k];
    for (const cb of $("themes").querySelectorAll("input")) cb.checked = (prefs.themes || []).includes(+cb.value);
    setPack(store.get("creator:draft:" + exId, null), false);
    $("loading").hidden = true;
    updatePromptInfo();
  }

  /** Schéma de la base au format des questions « schéma » */
  function baseSchema() {
    const db = state.engine.fresh();
    const tables = db.exec("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY rowid")[0].values.map((r) => r[0]);
    const out = {
      tables: tables.map((t) => {
        const fks = new Map((db.exec(`PRAGMA foreign_key_list("${t}")`)[0] || { values: [] }).values.map((r) => [r[3], r[2]]));
        return { name: t, cols: db.exec(`PRAGMA table_info("${t}")`)[0].values.map((c) => ({ name: c[1], pk: c[5] > 0, fk: fks.get(c[1]) || null })) };
      }),
    };
    db.close();
    return out;
  }

  // ---------------------------------------------------------------- questions « schéma »
  const SC = () => SQLSchemaCheck;
  const isSchemaQ = (q) => q && q.type === "schema";
  const departOf = (q) => SC().departSchema(q, state.base);
  const schemaHtml = (schema) => SC().toText(schema, true).split("\n").map((l) => `<div>${l}</div>`).join("");

  /** Textes « noms acceptés » et « rôles » de la question (saisis, ou tirés de la solution) */
  function schemaTexts(q) {
    if (q._eqText === undefined || q._rolesText === undefined) {
      const t = SC().solutionTexts(q.solution);
      if (q._eqText === undefined) q._eqText = t.equivalents;
      if (q._rolesText === undefined) q._rolesText = t.roles;
    }
    return { eq: q._eqText, roles: q._rolesText };
  }

  /** Recalcule la grille de correction à partir d'un schéma dessiné (ou de la solution actuelle) */
  function rebuildSolution(q, drawn) {
    const depart = departOf(q);
    const prev = q.solution || { tables: [] };
    drawn = drawn || SC().solutionSchema(depart, prev);
    const tx = schemaTexts(q);
    const sol = SC().deriveSolution(depart, drawn, tx.eq, tx.roles, prev.tablesOptionnelles);
    for (const t of sol.tables) { // les attributs facultatifs saisis dans le fichier sont conservés
      const old = prev.tables.find((x) => SC().norm(x.nom) === SC().norm(t.nom));
      if (old && old.optionnels) t.optionnels = old.optionnels;
    }
    q.solution = sol;
  }

  function checkSchemaQ(i) {
    const q = state.pack.questions[i];
    const errors = [], warnings = [];
    const depart = departOf(q);
    const sol = q.solution || { tables: [] };
    if (!q.enonce || !q.enonce.trim()) errors.push(t("énoncé manquant"));
    if (!sol.tables.length) errors.push(t("Aucune solution : cliquez sur « Dessiner la solution »."));
    else {
      const drawn = SC().solutionSchema(depart, sol);
      const r = SC().compare(drawn, depart, q);
      if (!r.ok) errors.push(t("La solution n'est pas reconnue : {m}", { m: r.messages.join(" ") }));
      if (SC().compare(depart, depart, q).ok) errors.push(t("La solution est identique au schéma de départ : il n'y a rien à faire."));
      (q.variantes || []).forEach((v, k) => {
        const rv = SC().compare(SC().solutionSchema(depart, v), depart, q);
        if (rv.level !== (v.partiel ? "partial" : "ok")) warnings.push(t("Variante {k} : non reconnue ({m})", { k: k + 1, m: rv.messages.join(" ") }));
      });
      for (const tb of sol.tables) {
        const isNew = !depart.tables.some((d) => SC().norm(d.name) === SC().norm(tb.nom));
        if (isNew && !tb.role) warnings.push(t("Pas de rôle pour {nom} : si elle manque, l'étudiant lira « Il manque une table ({nom}) », ce qui donne la réponse.", { nom: tb.nom }));
      }
      return { ok: !errors.length, errors, warnings, schema: true, total: r.score.total };
    }
    return { ok: !errors.length, errors, warnings, schema: true };
  }

  function schemaCardHtml(q, i, total) {
    const s = statusOf(i);
    const depart = departOf(q);
    const explicit = Array.isArray(q.depart) && q.depart.some((x) => typeof x === "object");
    const chosen = q.depart === "base" || !q.depart ? state.base.tables.map((t) => t.name) : (q.depart || []).filter((x) => typeof x === "string");
    const tx = schemaTexts(q);
    const sol = q.solution || { tables: [] };
    const nv = (q.variantes || []).length;
    return `<article class="qcard ${s.cls}" data-i="${i}">
      <header>
        <span class="qn">Question ${i + 1}</span><span class="badge-schema">${t("◫ schéma")}</span>
        <span class="status ${s.cls}">${s.label}</span>
        <span class="spacer"></span>
        <button type="button" class="icon-btn small" data-act="up" ${i === 0 ? "disabled" : ""} title="${t("Monter")}" aria-label="${t("Monter")}">↑</button>
        <button type="button" class="icon-btn small" data-act="down" ${i === total - 1 ? "disabled" : ""} title="${t("Descendre")}" aria-label="${t("Descendre")}">↓</button>
        <button type="button" class="icon-btn small" data-act="dup" title="${t("Dupliquer")}" aria-label="${t("Dupliquer")}">⧉</button>
        <button type="button" class="icon-btn small" data-act="del" title="${t("Supprimer")}" aria-label="${t("Supprimer")}">✕</button>
      </header>
      <div class="qgrid">
        <label>${t("Thème")} <input type="text" data-f="theme" value="${esc(q.theme || "")}"></label>
        <label>Type
          <select data-f="type">
            <option value="select">${t("Consultation (SELECT)")}</option>
            <option value="write">${t("Modification (INSERT, UPDATE, DELETE)")}</option>
            <option value="schema" selected>${t("Construction de schéma")}</option>
            <option value="processus">${t("Processus (événements-résultats)")}</option>
          </select>
        </label>
      </div>
      <label class="block">${t("Énoncé (règles de gestion à modéliser)")} <textarea data-f="enonce" rows="3">${esc(q.enonce || "")}</textarea></label>
      <fieldset class="depart">
        <legend>${t("Schéma de départ donné à l'étudiant")}</legend>
        ${explicit
          ? `<p class="small muted">${t("Départ décrit dans le fichier ({n} tables) :", { n: depart.tables.length })}</p><div class="schema-text">${schemaHtml(depart)}</div>
             <button type="button" class="link small" data-act="depart-base">${t("Remplacer par des tables de la base")}</button>`
          : `<div class="chips">${state.base.tables.map((t) => `<label class="chip"><input type="checkbox" data-depart="${esc(t.name)}" ${chosen.includes(t.name) ? "checked" : ""}> ${esc(t.name)}</label>`).join("")}</div>`}
      </fieldset>
      <div class="sol-box">
        <div class="sol-head"><strong>${t("Solution attendue")}</strong>
          <button type="button" class="btn small primary" data-act="draw">${sol.tables.length ? t("✎ Modifier la solution") : t("✎ Dessiner la solution")}</button></div>
        ${sol.tables.length ? `<div class="schema-text">${schemaHtml(SC().solutionSchema(depart, sol))}</div>` : `<p class="muted small">${t("Pas encore de solution. Dessinez le schéma attendu à partir du départ : la grille de correction (tables, clés, références, attributs à retirer) en sera déduite.")}</p>`}
      </div>
      <div class="qgrid">
        <label>${t("Noms acceptés")} <span class="muted small">${t("(une ligne par table ou attribut)")}</span>
          <textarea data-f="sch-eq" rows="4" class="mono" spellcheck="false" placeholder="EMPRUNTER = EMPRUNT, EMPRUNTEUR&#10;SOUSCRIRE.Quotite = Pourcentage, Taux">${esc(tx.eq)}</textarea></label>
        <label>${t("Rôle des nouvelles tables")} <span class="muted small">${t("(pour le message « Il manque une table pour … »)")}</span>
          <textarea data-f="sch-roles" rows="4" spellcheck="false" placeholder="${t("EMPRUNTER = relier les emprunteurs et les dossiers")}">${esc(tx.roles)}</textarea></label>
      </div>
      ${nv ? `<p class="small muted">${t("{n} variante(s) de solution définie(s) dans le fichier : elles sont conservées.", { n: nv })}</p>` : ""}
      <label class="block">${t("Indice")} <textarea data-f="indice" rows="2">${esc(q.indice || "")}</textarea></label>
      <div class="actions"><button type="button" class="btn small" data-act="test">${t("▶ Vérifier")}</button></div>
      <div class="qresult">${resultHtml(i)}</div>
    </article>`;
  }

  // ---------------------------------------------------------------- questions « processus »
  const isProcessQ = (q) => q && q.type === "processus";
  const PC = () => SQLProcessCheck;

  /** « Op = condition » et « Op : règle 1 | règle 2 » -> attendus */
  function parseAttendus(text, previous) {
    const out = [];
    const get = (name) => {
      let a = out.find((x) => PC().norm(x.operation) === PC().norm(name));
      if (!a) {
        a = { operation: name };
        const old = (previous || []).find((x) => PC().norm(x.operation) === PC().norm(name));
        if (old && old.alias) a.alias = old.alias;
        out.push(a);
      }
      return a;
    };
    for (const line of String(text || "").split(/\r?\n/)) {
      let m = /^\s*(.+?)\s*=\s*(.+?)\s*$/.exec(line);
      if (m) { get(m[1]).synchronisation = m[2]; continue; }
      m = /^\s*(.+?)\s*:\s*(.+?)\s*$/.exec(line);
      if (m) get(m[1]).regles = m[2].split("|").map((x) => x.trim()).filter(Boolean);
    }
    return out;
  }

  function attendusText(att) {
    const lines = [];
    for (const a of att || []) {
      if (a.synchronisation) lines.push(`${a.operation} = ${a.synchronisation}`);
      if (a.regles) lines.push(`${a.operation} : ${Array.isArray(a.regles) ? a.regles.join(" | ") : a.regles}`);
    }
    return lines.join("\n");
  }

  /** Attendus proposés à partir du corrigé dessiné : synchronisations et opérations à plusieurs cas */
  function deriveAttendus(sol) {
    const lines = [];
    const byId = new Map(sol.nodes.map((n) => [n.id, n]));
    for (const op of sol.nodes.filter((n) => n.kind === "operation")) {
      const inc = sol.arrows.filter((a) => a.to === op.id);
      const s = inc.length === 1 && byId.get(inc[0].from);
      if (s && s.kind === "sync" && s.cond) {
        const names = {};
        for (const a of sol.arrows.filter((x) => x.to === s.id)) if (a.letter && byId.get(a.from)) names[a.letter.toUpperCase()] = byId.get(a.from).label;
        // un nom qui contient « et » / « ou » est mis entre guillemets pour ne pas être lu comme un opérateur
        const quote = (nm) => (/(^|[^\p{L}])(et|ou|and|or|non|not)([^\p{L}]|$)/iu.test(nm) ? `"${nm}"` : nm);
        const cond = s.cond.replace(/\b([A-Za-z])\b/g, (m, l) => (names[l.toUpperCase()] ? quote(names[l.toUpperCase()]) : m))
          .replace(/(^|[\s(])et(?=[\s(])/gi, "$1ET").replace(/(^|[\s(])ou(?=[\s(])/gi, "$1OU");
        lines.push(`${op.label} = ${cond}`);
      }
      if ((op.rules || []).length > 1) lines.push(`${op.label} : ${op.rules.join(" | ")}`);
    }
    return lines.join("\n");
  }

  function eqText(eq) {
    return Object.entries(eq || {}).map(([k, v]) => `${k} = ${v.join(", ")}`).join("\n");
  }
  function parseEq(text) {
    const out = {};
    for (const line of String(text || "").split(/\r?\n/)) {
      const m = /^\s*(.+?)\s*=\s*(.+?)\s*$/.exec(line);
      if (m) out[m[1]] = m[2].split(",").map((x) => x.trim()).filter(Boolean);
    }
    return out;
  }

  /** Éléments proposés = événements et opérations du corrigé absents du départ */
  function syncElements(q) {
    if (!q._withElements || !q.solution) { delete q.elements; return; }
    const inDepart = new Set(((q.depart && q.depart.nodes) || []).map((n) => n.kind + "|" + PC().norm(n.label)));
    q.elements = q.solution.nodes.filter((n) => n.kind !== "sync" && n.label && !inDepart.has(n.kind + "|" + PC().norm(n.label)))
      .map((n) => ({ kind: n.kind, label: n.label }));
  }

  function checkProcessQ(i) {
    const q = state.pack.questions[i];
    const errors = [], warnings = [];
    if (!q.enonce || !q.enonce.trim()) errors.push(t("énoncé manquant"));
    if (!q.solution || !(q.solution.nodes || []).length) errors.push(t("Aucun corrigé : cliquez sur « Dessiner le corrigé »."));
    else {
      const r = PC().check(q.solution, q);
      if (!r.ok) errors.push(t("Le corrigé ne passe pas les vérifications : {m}", { m: r.messages.join(" ") }));
      const start = q.depart && q.depart.nodes ? { lanes: q.couloirs || [], arrows: [], ...q.depart } : { lanes: q.couloirs || [], nodes: [], arrows: [] };
      if (PC().check(start, q).ok) errors.push(t("Le schéma de départ est déjà accepté : il n'y a rien à faire."));
      if (!(q.attendus || []).length) warnings.push(t("Aucune synchronisation ni règle attendue : seule la grammaire du schéma sera vérifiée."));
      for (const a of q.attendus || []) {
        if (a.synchronisation) { try { PC().parse(a.synchronisation); } catch (e) { errors.push(t("Condition attendue illisible pour « {op} » : {m}", { op: a.operation, m: e.message })); } }
      }
      if (!(q.autoevaluation || []).length) warnings.push(t("Pas de liste d'auto-évaluation : l'étudiant ne verra que le corrigé."));
    }
    return { ok: !errors.length, errors, warnings, schema: true };
  }

  function processCardHtml(q, i, total) {
    const s = statusOf(i);
    const sol = q.solution && (q.solution.nodes || []).length ? q.solution : null;
    const ops = sol ? sol.nodes.filter((n) => n.kind === "operation").length : 0;
    const evs = sol ? sol.nodes.filter((n) => n.kind === "event").length : 0;
    const sys = sol ? sol.nodes.filter((n) => n.kind === "sync").length : 0;
    if (q._attText === undefined) q._attText = attendusText(q.attendus);
    if (q._eqText === undefined) q._eqText = eqText(q.equivalents);
    if (q._withElements === undefined) q._withElements = !!(q.elements && q.elements.length);
    return `<article class="qcard ${s.cls}" data-i="${i}">
      <header>
        <span class="qn">Question ${i + 1}</span><span class="badge-schema">${t("⇄ processus")}</span>
        <span class="status ${s.cls}">${s.label}</span>
        <span class="spacer"></span>
        <button type="button" class="icon-btn small" data-act="up" ${i === 0 ? "disabled" : ""} title="${t("Monter")}" aria-label="${t("Monter")}">↑</button>
        <button type="button" class="icon-btn small" data-act="down" ${i === total - 1 ? "disabled" : ""} title="${t("Descendre")}" aria-label="${t("Descendre")}">↓</button>
        <button type="button" class="icon-btn small" data-act="dup" title="${t("Dupliquer")}" aria-label="${t("Dupliquer")}">⧉</button>
        <button type="button" class="icon-btn small" data-act="del" title="${t("Supprimer")}" aria-label="${t("Supprimer")}">✕</button>
      </header>
      <div class="qgrid">
        <label>${t("Thème")} <input type="text" data-f="theme" value="${esc(q.theme || "")}"></label>
        <label>Type
          <select data-f="type">
            <option value="select">${t("Consultation (SELECT)")}</option>
            <option value="write">${t("Modification (INSERT, UPDATE, DELETE)")}</option>
            <option value="schema">${t("Construction de schéma")}</option>
            <option value="processus" selected>${t("Processus (événements-résultats)")}</option>
          </select>
        </label>
      </div>
      <label class="block">${t("Texte décrivant le processus et consigne")} <textarea data-f="enonce" rows="5">${esc(q.enonce || "")}</textarea></label>
      <label class="block">${t("Acteurs (couloirs) fournis à l'étudiant")} <span class="muted small">${t("(séparés par des virgules ; vide : l'étudiant crée les siens)")}</span>
        <input type="text" data-f="pr-lanes" value="${esc((q.couloirs || []).join(", "))}"></label>
      <div class="sol-box">
        <div class="sol-head"><strong>${t("Corrigé")}</strong>
          <span>
            <button type="button" class="btn small" data-act="pr-depart">${q.depart && (q.depart.nodes || []).length ? t("Modifier le départ (facultatif)") : t("Dessiner le départ (facultatif)")}</button>
            <button type="button" class="btn small primary" data-act="pr-draw">${sol ? t("✎ Modifier le corrigé") : t("✎ Dessiner le corrigé")}</button>
          </span></div>
        <p class="small muted">${sol ? t("{a} acteurs · {e} événements · {o} opérations · {s} synchronisation(s)", { a: (sol.lanes || []).length, e: evs, o: ops, s: sys }) : t("Pas encore de corrigé.")}
          ${q.depart && (q.depart.nodes || []).length ? t(" · départ fourni : {n} élément(s)", { n: q.depart.nodes.length }) : ""}</p>
        <label class="small check-line"><input type="checkbox" data-f="pr-elements" ${q._withElements ? "checked" : ""}> ${t("Proposer à l'étudiant les événements et opérations du corrigé (étiquettes à placer)")}</label>
      </div>
      <label class="block">${t("Ce qui est vérifié")} <span class="muted small">${t("(« Opération = condition » avec les noms des événements ; « Opération : cas 1 | cas 2 » pour les règles d'émission)")}</span>
        <textarea data-f="pr-att" rows="3" class="mono" spellcheck="false" placeholder="${t("Création transport = Détails demande ET (Fiche patient OU Fiche patient créée)&#10;Traitement demande : Patient existant | Patient non existant")}">${esc(q._attText)}</textarea></label>
      <button type="button" class="link small" data-act="pr-derive">${t("Proposer à partir du corrigé dessiné")}</button>
      <div class="qgrid">
        <label>${t("Noms équivalents")} <span class="muted small">${t("(Événement = autre nom, autre nom)")}</span>
          <textarea data-f="pr-eq" rows="3" class="mono" spellcheck="false">${esc(q._eqText)}</textarea></label>
        <label>${t("Auto-évaluation")} <span class="muted small">${t("(une phrase par ligne)")}</span>
          <textarea data-f="pr-auto" rows="3">${esc((q.autoevaluation || []).join("\n"))}</textarea></label>
      </div>
      <label class="block">${t("Indice")} <textarea data-f="indice" rows="2">${esc(q.indice || "")}</textarea></label>
      <div class="actions"><button type="button" class="btn small" data-act="test">${t("▶ Vérifier")}</button></div>
      <div class="qresult">${resultHtml(i)}</div>
    </article>`;
  }

  function openProcessDialog(i, which) {
    const q = state.pack.questions[i];
    if (!state.procEditor) {
      state.procEditor = new ProcessEditor($("processDlgEditor"), {
        onReset: () => state.procEditor.setModel({ lanes: [...(state.pack.questions[state.procIndex].couloirs || [t("Acteur")])], nodes: [], arrows: [] }),
      });
    }
    state.procIndex = i;
    state.procWhich = which;
    const lanes = (q.couloirs && q.couloirs.length) ? [...q.couloirs] : [t("Acteur")];
    let start;
    if (which === "depart") start = q.depart && q.depart.nodes ? { lanes, arrows: [], ...q.depart } : { lanes, nodes: [], arrows: [] };
    else start = q.solution && q.solution.nodes && q.solution.nodes.length ? q.solution
      : q.depart && q.depart.nodes ? { lanes, arrows: [], ...q.depart } : { lanes, nodes: [], arrows: [] };
    state.procEditor.opts.fileName = t("processus-corrige");
    $("processDialogTitle").textContent = which === "depart" ? t("Départ fourni à l'étudiant – question {n}", { n: i + 1 }) : t("Corrigé – question {n}", { n: i + 1 });
    $("processDialog").showModal();
    state.procEditor.setModel(start);
  }

  function saveProcessDialog() {
    const i = state.procIndex;
    const q = state.pack.questions[i];
    const m = state.procEditor.getModel();
    if (state.procWhich === "depart") q.depart = m.nodes.length ? m : undefined;
    else {
      q.solution = m;
      if (!(q.attendus || []).length && !(q._attText || "").trim()) {
        q._attText = deriveAttendus(m);
        q.attendus = parseAttendus(q._attText, []);
      }
    }
    if (!(q.couloirs || []).length || state.procWhich === "solution") q.couloirs = [...m.lanes];
    if (!q.depart) delete q.depart;
    syncElements(q);
    $("processDialog").close();
    state.checks[i] = checkProcessQ(i);
    refreshCard(i);
    saveDraft();
  }

  // ----- dessin de la solution (fenêtre)
  function openSolutionEditor(i) {
    const q = state.pack.questions[i];
    const depart = departOf(q);
    if (!state.solEditor) {
      state.solEditor = new SchemaEditor($("schemaDlgEditor"), {
        onReset: () => state.solEditor.setState({ ...departOf(state.pack.questions[state.solIndex]), pos: {} }),
      });
    }
    state.solIndex = i;
    const sol = q.solution || { tables: [] };
    const start = sol.tables.length ? SC().solutionSchema(depart, sol) : depart;
    $("schemaDialogTitle").textContent = t("Solution de la question {n}", { n: i + 1 });
    $("schemaDialog").showModal();
    state.solEditor.setState({ ...start, pos: q._pos || {} });
  }

  function saveSolutionEditor() {
    const i = state.solIndex;
    const q = state.pack.questions[i];
    const drawn = state.solEditor.getState();
    q._pos = drawn.pos;
    rebuildSolution(q, { tables: drawn.tables });
    $("schemaDialog").close();
    state.checks[i] = checkSchemaQ(i);
    refreshCard(i);
    saveDraft();
  }

  function renderSchema() {
    const db = state.engine.fresh();
    const tables = db.exec("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY rowid")[0].values.map((r) => r[0]);
    $("schema").innerHTML = tables.map((t) => {
      const cols = db.exec(`PRAGMA table_info("${t}")`)[0].values;
      const fk = new Set((db.exec(`PRAGMA foreign_key_list("${t}")`)[0] || { values: [] }).values.map((r) => r[3]));
      return `<li><strong class="mono">${esc(t)}</strong> (` + cols.map((c) => {
        let n = esc(c[1]);
        if (fk.has(c[1])) n = `<i>#${n}</i>`;
        if (c[5] > 0) n = `<u>${n}</u>`;
        return n;
      }).join(", ") + ")</li>";
    }).join("");
    db.close();
    $("schemaSummary").textContent = `· ${tables.length} tables · ${state.ex.titre}`;
  }

  // ---------------------------------------------------------------- 1. prompt
  function savePrefs() {
    const prefs = {};
    for (const k of ["pTitre", "pAuteur", "pNombre", "pNiveau", "pConsignes"]) prefs[k] = $(k).value;
    prefs.themes = [...$("themes").querySelectorAll("input:checked")].map((c) => +c.value);
    store.set("creator:prefs", prefs);
  }

  async function skillText() {
    if (state.skill === null) {
      try {
        state.skill = (await (await fetch(SKILL_PATH)).text()).replace(/^---[\s\S]*?---\s*/, "");
      } catch (e) { state.skill = ""; }
    }
    return state.skill;
  }

  async function buildPrompt() {
    const ex = state.ex;
    const skillUrl = new URL(SKILL_PATH, location.href).href;
    const themes = [...$("themes").querySelectorAll("input:checked")].map((c) => t(THEMES[+c.value]));
    const n = Math.max(1, Math.min(40, parseInt($("pNombre").value, 10) || 8));
    const out = [];
    out.push(t("Tu es enseignant(e) en systèmes d'information de gestion (DCG UE8). Crée un pack de questions d'entraînement SQL pour l'application SQL Lab, destiné à des étudiants en gestion (pas à des informaticiens)."));
    out.push("");
    out.push(t("## Mode d'emploi (format JSON attendu et règles de rédaction)"));
    out.push(t("Lien : {url}", { url: skillUrl }));
    if (EN()) out.push(`Note: these instructions are written in French. Follow them, but write everything the students will read in ${LANG_NAME()} (pack title and description, theme, enonce, indice, roles, autoevaluation…). Keep the JSON keys and fixed values (such as \"type\": \"write\") exactly as specified.`);
    if ($("pInclureSkill").checked) {
      const s = await skillText();
      if (s) out.push("", t("<<<DÉBUT DU MODE D'EMPLOI"), s.trim(), t("FIN DU MODE D'EMPLOI>>>"));
    }
    out.push("", t("## Base de données à utiliser (n'utiliser que ces tables, colonnes et valeurs)"), "", state.schemaMd.trim(), "");
    out.push(t("## Demande de l'enseignant"));
    out.push(t("- Valeur du champ \"exercice\" : \"{id}\"", { id: ex.id }));
    out.push(t("- Titre du pack : {v}", { v: $("pTitre").value.trim() || t("(à proposer)") }));
    if ($("pAuteur").value.trim()) out.push(t("- Auteur : {v}", { v: $("pAuteur").value.trim() }));
    out.push(t("- Nombre de questions : {n}", { n }));
    out.push(t("- Thèmes à faire travailler : {v}", { v: themes.length ? themes.join(EN() ? "; " : " ; ") : t("au choix, en progression du plus simple au plus difficile") }));
    out.push(t("- Niveau : {v}", { v: t(NIVEAUX[$("pNiveau").value]) }));
    out.push(t("- Consignes particulières : {v}", { v: $("pConsignes").value.trim() || t("aucune") }));
    if (EN()) out.push(`- Language: write the questions (enonce), themes, hints (indice) and every other text for students in ${LANG_NAME()}, even though the instructions are in French.`);
    if ($("pSchema").checked) out.push(t("- Ajouter aussi 1 ou 2 questions de construction / évolution du schéma relationnel (type \"schema\", voir le mode d'emploi), à partir de règles de gestion nouvelles et plausibles pour cette entreprise."));
    if ($("pEviter").checked && ex.questions.length) {
      out.push(t("- Questions déjà proposées aux étudiants sur cette base (ne pas les reproduire à l'identique) :"));
      ex.questions.forEach((q, i) => out.push(`  ${i + 1}. ${q.enonce}`));
    }
    out.push("", t("## Réponse attendue"));
    out.push(t("Réponds uniquement avec le JSON complet du pack, dans un seul bloc ```json, sans texte avant ni après. Vérifie chaque correction sur le schéma ci-dessus avant de répondre."));
    return out.join("\n");
  }

  async function updatePromptInfo() {
    const p = await buildPrompt();
    $("promptText").value = p;
    $("promptInfo").textContent = t("{n} caractères · à coller dans la conversation de votre IA", { n: p.length.toLocaleString(numLocale()) });
  }

  // ---------------------------------------------------------------- 2. import
  function importText(text, source) {
    $("importMsg").hidden = true;
    let raw;
    try {
      raw = P.extractJson(text);
    } catch (e) {
      showImportError(t("{m} Vérifiez que vous avez copié toute la réponse de l'IA.", { m: e.message }));
      return;
    }
    const n = P.normalizePack(raw, { exercice: state.ex.id });
    if (!n.pack || !n.pack.questions.length) { showImportError(t("Aucune question exploitable. {m}", { m: n.errors.join(" ") })); return; }
    if (n.pack.exercice && n.pack.exercice !== state.ex.id) {
      if (!confirm(t("Ces questions ont été écrites pour la base « {a} », pas pour « {b} ». Les charger quand même sur la base actuelle ?", { a: n.pack.exercice, b: state.ex.id }))) return;
      n.pack.exercice = state.ex.id;
    }
    if (state.pack && state.pack.questions.length && !confirm(t("Remplacer les questions en cours d'édition par celles-ci ?"))) return;
    setPack(n.pack, true);
    const fixed = n.issues.filter((x) => x.warnings.length).length;
    toast(t("{n} question(s) chargée(s)", { n: n.pack.questions.length }) + (source ? t(" depuis {s}", { s: source }) : "") + (fixed ? t(", {n} corrigée(s) automatiquement", { n: fixed }) : "") + ".");
    $("s3").scrollIntoView({ behavior: "smooth" });
  }

  function showImportError(msg) {
    $("importMsg").textContent = msg;
    $("importMsg").hidden = false;
  }

  // ---------------------------------------------------------------- 3. édition
  function setPack(pack, check) {
    state.pack = pack || null;
    state.checks = [];
    if (state.pack) {
      state.pack.exercice = state.ex.id;
      $("mTitre").value = state.pack.titre || "";
      $("mAuteur").value = state.pack.auteur || "";
      $("mDescription").value = state.pack.description || "";
    } else {
      for (const k of ["mTitre", "mAuteur", "mDescription"]) $(k).value = "";
    }
    if (check) checkAll(); else renderCards();
    saveDraft();
  }

  function ensurePack() {
    if (!state.pack) {
      state.pack = { format: P.FORMAT, exercice: state.ex.id, titre: $("pTitre").value.trim() || t("Questions complémentaires"), questions: [] };
      if ($("pAuteur").value.trim()) state.pack.auteur = $("pAuteur").value.trim();
      $("mTitre").value = state.pack.titre;
      $("mAuteur").value = state.pack.auteur || "";
    }
    return state.pack;
  }

  let saveTimer;
  function saveDraft() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => store.set("creator:draft:" + state.ex.id, state.pack), 300);
    updateShare();
  }

  /** Question prête pour le moteur (id unique, type déduit…) */
  function engineQuestion(q, i) {
    const n = P.normalizeQuestion(q, i, new Set());
    return { ...n.q, id: `__edit${i}`, _issues: n };
  }

  function checkOne(i) {
    if (isSchemaQ(state.pack.questions[i])) { state.checks[i] = checkSchemaQ(i); return state.checks[i]; }
    if (isProcessQ(state.pack.questions[i])) { state.checks[i] = checkProcessQ(i); return state.checks[i]; }
    const q = state.pack.questions[i];
    const eq = engineQuestion(q, i);
    const c = P.checkQuestion(state.engine, eq);
    c.errors.unshift(...eq._issues.errors);
    if (eq.type === "write" && !q.verif && eq.verif) c.warnings.push(t("Vérification déduite : {v}", { v: eq.verif }));
    c.ok = !c.errors.length;
    state.checks[i] = c;
    return c;
  }

  function checkAll() {
    if (!state.pack) { renderCards(); return; }
    state.pack.questions.forEach((_, i) => checkOne(i));
    renderCards();
  }

  function statusOf(i) {
    const c = state.checks[i];
    if (!c) return { cls: "pending", label: t("À vérifier") };
    if (!c.ok) return { cls: "ko", label: t("✗ À corriger") };
    if (c.warnings.length) return { cls: "partial", label: t("⚠ À relire") };
    return { cls: "ok", label: "✓ OK" };
  }

  function renderSummary() {
    const qs = state.pack ? state.pack.questions : [];
    const counts = { ok: 0, partial: 0, ko: 0, pending: 0 };
    qs.forEach((_, i) => counts[statusOf(i).cls]++);
    $("summary").innerHTML = qs.length
      ? `<strong>${tn(qs.length, "{n} question", "{n} questions")}</strong> · <span class="ok-t">✓ ${counts.ok}</span> · <span class="warn-t">⚠ ${counts.partial}</span> · <span class="ko-t">✗ ${counts.ko}</span>` + (counts.pending ? t(" · {n} à vérifier", { n: counts.pending }) : "")
      : "";
    $("emptyPack").hidden = !!qs.length;
  }

  function resultHtml(i) {
    const c = state.checks[i];
    if (!c) return `<p class="muted small">${t("Cliquez sur « Tester » pour exécuter la correction.")}</p>`;
    const q = state.pack.questions[i];
    let h = "";
    const msgs = [...c.errors.map((m) => `<li class="ko-t">${esc(m)}</li>`), ...c.warnings.map((m) => `<li class="warn-t">${esc(m)}</li>`)];
    if (msgs.length) h += `<ul class="msgs">${msgs.join("")}</ul>`;
    if (c.schema) {
      if (c.ok) h += `<p class="small muted">${t("La solution est reconnue et le schéma de départ seul est refusé.")} ${c.total ? t("{n} points de contrôle.", { n: c.total }) : ""}</p>`;
      return h;
    }
    if (c.result) {
      const ord = Array.isArray(q.ordered) ? q.ordered : q.ordered === true ? c.result.columns.map((_, j) => j) : [];
      const rows = c.result.values.slice(0, 8);
      h += `<p class="small muted">${t("Résultat attendu : {n} ligne(s). Cochez les colonnes sur lesquelles l'ordre demandé doit être vérifié (seulement si l'énoncé demande un tri).", { n: c.result.values.length })}</p>`;
      h += `<div class="table-wrap"><table><thead><tr>` + c.result.columns.map((col, j) =>
        `<th><label class="ord"><input type="checkbox" data-ord="${j}" ${ord.includes(j) ? "checked" : ""}> ${esc(col)}</label></th>`).join("") + `</tr></thead><tbody>` +
        (rows.length ? rows.map((r) => "<tr>" + r.map((v) => `<td>${fmt(v)}</td>`).join("") + "</tr>").join("") : `<tr><td class="empty" colspan="${c.result.columns.length || 1}">${t("Aucune ligne")}</td></tr>`) +
        `</tbody></table></div>` + (c.result.values.length > 8 ? `<p class="muted small">${t("… {n} autre(s) ligne(s)", { n: c.result.values.length - 8 })}</p>` : "");
    } else if (c.after) {
      const C = SQLCompare;
      const st = C.compareStates(c.before, c.before, c.after);
      const changed = st.changedByStudent || [];
      const removed = st.removedByStudent || [];
      h += `<p class="small muted">${t("Effet de la correction sur la table vérifiée : {n} ligne(s) touchée(s).", { n: Math.max(changed.length, removed.length) })}</p>`;
      if (changed.length) h += `<div class="table-wrap added"><table><thead><tr>${c.after.columns.map((x) => `<th>${esc(x)}</th>`).join("")}</tr></thead><tbody>${changed.slice(0, 5).map((r) => "<tr>" + r.map((v) => `<td>${fmt(v)}</td>`).join("") + "</tr>").join("")}</tbody></table></div>`;
      if (removed.length) h += `<div class="table-wrap removed"><table><thead><tr>${c.before.columns.map((x) => `<th>${esc(x)}</th>`).join("")}</tr></thead><tbody>${removed.slice(0, 5).map((r) => "<tr>" + r.map((v) => `<td>${fmt(v)}</td>`).join("") + "</tr>").join("")}</tbody></table></div>`;
    }
    return h;
  }

  function cardHtml(q, i, total) {
    if (isSchemaQ(q)) return schemaCardHtml(q, i, total);
    if (isProcessQ(q)) return processCardHtml(q, i, total);
    const s = statusOf(i);
    const isWrite = q.type === "write" || (!q.type && P.writeTarget(lines(q.correction)));
    const variantes = (q.variantes || []).map(lines).join("\n---\n");
    return `<article class="qcard ${s.cls}" data-i="${i}">
      <header>
        <span class="qn">Question ${i + 1}</span>
        <span class="status ${s.cls}">${s.label}</span>
        <span class="spacer"></span>
        <button type="button" class="icon-btn small" data-act="up" ${i === 0 ? "disabled" : ""} title="${t("Monter")}" aria-label="${t("Monter")}">↑</button>
        <button type="button" class="icon-btn small" data-act="down" ${i === total - 1 ? "disabled" : ""} title="${t("Descendre")}" aria-label="${t("Descendre")}">↓</button>
        <button type="button" class="icon-btn small" data-act="dup" title="${t("Dupliquer")}" aria-label="${t("Dupliquer")}">⧉</button>
        <button type="button" class="icon-btn small" data-act="del" title="${t("Supprimer")}" aria-label="${t("Supprimer")}">✕</button>
      </header>
      <div class="qgrid">
        <label>${t("Thème")} <input type="text" data-f="theme" value="${esc(q.theme || "")}"></label>
        <label>Type
          <select data-f="type">
            <option value="select" ${isWrite ? "" : "selected"}>${t("Consultation (SELECT)")}</option>
            <option value="write" ${isWrite ? "selected" : ""}>${t("Modification (INSERT, UPDATE, DELETE)")}</option>
            <option value="schema">${t("Construction de schéma")}</option>
            <option value="processus">${t("Processus (événements-résultats)")}</option>
          </select>
        </label>
      </div>
      <label class="block">${t("Énoncé")} <textarea data-f="enonce" rows="2">${esc(q.enonce || "")}</textarea></label>
      <label class="block">${t("Correction")} <textarea data-f="correction" rows="${Math.min(10, Math.max(3, lines(q.correction).split("\n").length + 1))}" class="mono" spellcheck="false">${esc(lines(q.correction))}</textarea></label>
      <label class="block verif" ${isWrite ? "" : "hidden"}>${t("Table vérifiée après modification")} <span class="muted small">${t("(vide : déduite de la correction)")}</span>
        <input type="text" data-f="verif" class="mono" value="${esc(q.verif || "")}" placeholder="SELECT * FROM TABLE"></label>
      <details ${variantes ? "open" : ""}><summary class="small">${t("Variantes acceptées")} <span class="muted">(${(q.variantes || []).length})</span></summary>
        <label class="block"><span class="muted small">${t("Autres écritures justes, séparées par une ligne <code>---</code>")}</span>
        <textarea data-f="variantes" rows="4" class="mono" spellcheck="false">${esc(variantes)}</textarea></label>
      </details>
      <label class="block">${t("Indice")} <textarea data-f="indice" rows="2">${esc(q.indice || "")}</textarea></label>
      <div class="actions"><button type="button" class="btn small" data-act="test">${t("▶ Tester")}</button></div>
      <div class="qresult">${resultHtml(i)}</div>
    </article>`;
  }

  function renderCards() {
    const qs = state.pack ? state.pack.questions : [];
    $("cards").innerHTML = qs.map((q, i) => cardHtml(q, i, qs.length)).join("");
    renderSummary();
    updateShare();
  }

  function refreshCard(i) {
    const el = $("cards").querySelector(`.qcard[data-i="${i}"]`);
    if (!el) return;
    const tmp = document.createElement("div");
    tmp.innerHTML = cardHtml(state.pack.questions[i], i, state.pack.questions.length);
    const fresh = tmp.firstElementChild;
    // garder l'état ouvert/fermé des variantes
    const was = el.querySelector("details");
    if (was && fresh.querySelector("details")) fresh.querySelector("details").open = was.open;
    el.replaceWith(fresh);
    renderSummary();
  }

  function onField(e) {
    const tg = e.target;
    const card = tg.closest(".qcard");
    if (!card || (!tg.dataset.f && tg.dataset.depart === undefined)) return;
    const i = +card.dataset.i;
    const q = state.pack.questions[i];
    const f = tg.dataset.f;
    const v = tg.value;
    if (tg.dataset.depart !== undefined) {
      const names = [...card.querySelectorAll("[data-depart]:checked")].map((x) => x.dataset.depart);
      q.depart = names.length === state.base.tables.length ? "base" : names;
      rebuildSolution(q);
      state.checks[i] = undefined;
      refreshCard(i);
      saveDraft();
      return;
    }
    if (!f) return;
    if (f === "type" && (v === "processus" || isProcessQ(q)) && v !== "schema") {
      const keep = { theme: q.theme, enonce: q.enonce, indice: q.indice, id: q.id };
      for (const k of Object.keys(q)) delete q[k];
      Object.assign(q, keep);
      if (v === "processus") Object.assign(q, { type: "processus", theme: keep.theme || t("Processus"), couloirs: [], attendus: [] });
      else { q.correction = ""; if (v === "write") q.type = "write"; }
      state.checks[i] = undefined;
      refreshCard(i);
      saveDraft();
      return;
    }
    if (f && f.startsWith("pr-")) {
      if (f === "pr-lanes") q.couloirs = v.split(",").map((x) => x.trim()).filter(Boolean);
      else if (f === "pr-att") { q._attText = v; q.attendus = parseAttendus(v, q.attendus); }
      else if (f === "pr-eq") { q._eqText = v; q.equivalents = parseEq(v); }
      else if (f === "pr-auto") q.autoevaluation = v.split(/\r?\n/).map((x) => x.trim()).filter(Boolean);
      else if (f === "pr-elements") { q._withElements = tg.checked; syncElements(q); }
      state.checks[i] = undefined;
      const st = card.querySelector(".status");
      st.className = "status pending"; st.textContent = t("À vérifier"); card.className = "qcard pending";
      renderSummary();
      saveDraft();
      return;
    }
    if (f === "type" && (v === "schema" || isSchemaQ(q))) {
      if (v === "schema") {
        for (const k of ["correction", "variantes", "verif", "ordered"]) delete q[k];
        Object.assign(q, { type: "schema", depart: "base", solution: { tables: [] } });
        if (!q.theme) q.theme = t("Évolution du schéma");
      } else {
        for (const k of ["depart", "solution", "variantes", "_pos", "_eqText", "_rolesText"]) delete q[k];
        q.correction = "";
        if (v === "write") q.type = "write"; else delete q.type;
      }
      state.checks[i] = undefined;
      refreshCard(i);
      saveDraft();
      return;
    }
    if (f === "sch-eq" || f === "sch-roles") {
      q[f === "sch-eq" ? "_eqText" : "_rolesText"] = v;
      if ((q.solution || { tables: [] }).tables.length) rebuildSolution(q);
    } else if (f === "variantes") {
      const parts = v.split(/^\s*-{3,}\s*$/m).map((x) => x.trim()).filter(Boolean);
      if (parts.length) q.variantes = parts; else delete q.variantes;
    } else if (f === "type") {
      if (v === "write") { q.type = "write"; delete q.ordered; } else { delete q.type; delete q.verif; }
      card.querySelector(".verif").hidden = v !== "write";
    } else if (v.trim()) q[f] = f === "correction" ? v : v.trim();
    else delete q[f];
    state.checks[i] = undefined;
    const st = card.querySelector(".status");
    st.className = "status pending";
    st.textContent = t("À vérifier");
    card.className = "qcard pending";
    renderSummary();
    saveDraft();
  }

  function onCardClick(e) {
    const card = e.target.closest(".qcard");
    if (!card) return;
    const i = +card.dataset.i;
    const qs = state.pack.questions;
    const ord = e.target.closest("[data-ord]");
    if (ord) {
      const q = qs[i];
      const cols = [...card.querySelectorAll("[data-ord]:checked")].map((x) => +x.dataset.ord);
      if (cols.length) q.ordered = cols; else delete q.ordered;
      checkOne(i);
      refreshCard(i);
      saveDraft();
      return;
    }
    const act = e.target.closest("[data-act]");
    if (!act) return;
    switch (act.dataset.act) {
      case "test": checkOne(i); refreshCard(i); return;
      case "draw": openSolutionEditor(i); return;
      case "pr-draw": openProcessDialog(i, "solution"); return;
      case "pr-depart": openProcessDialog(i, "depart"); return;
      case "pr-derive": {
        const q = qs[i];
        if (!q.solution || !(q.solution.nodes || []).length) { toast(t("Dessinez d'abord le corrigé.")); return; }
        q._attText = deriveAttendus(q.solution);
        q.attendus = parseAttendus(q._attText, q.attendus);
        state.checks[i] = undefined;
        break;
      }
      case "depart-base": qs[i].depart = "base"; rebuildSolution(qs[i]); state.checks[i] = undefined; break;
      case "up": if (i > 0) { [qs[i - 1], qs[i]] = [qs[i], qs[i - 1]]; [state.checks[i - 1], state.checks[i]] = [state.checks[i], state.checks[i - 1]]; } break;
      case "down": if (i < qs.length - 1) { [qs[i + 1], qs[i]] = [qs[i], qs[i + 1]]; [state.checks[i + 1], state.checks[i]] = [state.checks[i], state.checks[i + 1]]; } break;
      case "dup": {
        const copyQ = JSON.parse(JSON.stringify(qs[i]));
        copyQ.id = (copyQ.id || "q") + "-copie";
        qs.splice(i + 1, 0, copyQ);
        state.checks.splice(i + 1, 0, undefined);
        break;
      }
      case "del":
        if (!confirm(t("Supprimer la question {n} ?", { n: i + 1 }))) return;
        qs.splice(i, 1);
        state.checks.splice(i, 1);
        break;
      default: return;
    }
    renderCards();
    saveDraft();
  }

  // ---------------------------------------------------------------- 4. partage
  /** Exercice complet = base + questions de l'exercice (si cochées) + questions du pack */
  function mergedExercise() {
    const ex = state.ex;
    const pack = finalPack();
    const base = $("inclBase").checked ? (ex.questions || []) : [];
    const used = new Set(base.map((q) => q.id));
    const extra = (pack ? pack.questions : []).map((q) => {
      let id = q.id;
      while (used.has(id)) id += "b";
      used.add(id);
      return { ...q, id };
    });
    const perso = state.kind === "perso";
    const titre = perso || !pack ? ex.titre : `${ex.titre} – ${pack.titre}`;
    const out = {
      id: perso ? ex.id : `perso-${SQLLibrary.slug(titre)}`,
      titre,
      contexte: ex.contexte || "",
      aujourdhui: ex.aujourdhui,
      questions: [...base, ...extra],
    };
    if (ex.source) out.source = ex.source;
    if (ex.schemaGrid) out.schemaGrid = ex.schemaGrid;
    const auteur = (pack && pack.auteur) || ex.auteur;
    if (auteur) out.auteur = auteur;
    return out;
  }

  /** Pack nettoyé, prêt à être partagé */
  function finalPack() {
    if (!state.pack) return null;
    const raw = { ...state.pack, titre: $("mTitre").value.trim(), auteur: $("mAuteur").value.trim(), description: $("mDescription").value.trim() };
    if (!raw.auteur) delete raw.auteur;
    if (!raw.description) delete raw.description;
    return P.normalizePack(raw, { exercice: state.ex.id }).pack;
  }

  function appUrl() { return new URL("index.html", location.href).href; }

  let shareTimer;
  function updateShare() {
    clearTimeout(shareTimer);
    shareTimer = setTimeout(async () => {
      const pack = finalPack();
      const has = pack && pack.questions.length;
      for (const id of ["download", "copyLink", "copyHosted"]) $(id).disabled = !has;
      const hasAny = has || (state.ex.questions || []).length;
      for (const id of ["dlExercise", "dlScorm"]) $(id).disabled = !hasAny;
      $("openLink").classList.toggle("disabled", !has);
      const bad = state.pack ? state.pack.questions.filter((_, i) => statusOf(i).cls === "ko").length : 0;
      const pending = state.pack ? state.pack.questions.filter((_, i) => statusOf(i).cls === "pending").length : 0;
      $("shareWarn").hidden = !(bad || pending);
      $("shareWarn").textContent = bad
        ? t("{n} question(s) ont une correction qui ne fonctionne pas : corrigez-les avant de partager.", { n: bad })
        : t("{n} question(s) n'ont pas encore été vérifiées (bouton « Tout vérifier »).", { n: pending });
      if (!has) { $("linkInfo").textContent = ""; $("openLink").href = "#"; return; }
      const link = `${appUrl()}#pack=${await P.encodePack(pack)}`;
      state.link = link;
      $("openLink").href = link;
      $("linkInfo").textContent = t("{n} caractères", { n: link.length.toLocaleString(numLocale()) }) +
        (link.length > 8000 ? t(" : lien long, certains outils (messageries, Moodle) peuvent le couper ; préférez alors le fichier.") : ".");
    }, 250);
  }

  // ---------------------------------------------------------------- événements
  function bind() {
    $("exercice").addEventListener("change", (e) => {
      if (e.target.value === "__new") { e.target.value = state.ex.id; $("baseFile").click(); return; }
      loadExercise(e.target.value);
    });
    $("baseFile").addEventListener("change", (e) => {
      const f = e.target.files && e.target.files[0];
      if (f) importBase(f);
      e.target.value = "";
    });
    for (const id of ["bTitre", "bAuteur", "bDate", "bContexte"]) $(id).addEventListener("input", saveBaseMeta);
    $("bDelete").addEventListener("click", async () => {
      if (!confirm(t("Supprimer la base « {titre} » de ce navigateur ?", { titre: state.ex.titre }))) return;
      await SQLLibrary.store.del(state.ex.id);
      state.exercises = await SQLLibrary.list(state.catalogue);
      renderExerciseSelect();
      await loadExercise(state.catalogue[0].id);
    });
    $("dlScorm").addEventListener("click", async () => {
      const bad = state.pack ? state.pack.questions.filter((_, i) => statusOf(i).cls === "ko").length : 0;
      if (bad) { alert(t("{n} question(s) ont une correction qui ne fonctionne pas : corrigez-les avant d'exporter.", { n: bad })); return; }
      const ex = mergedExercise();
      if (!ex.questions.length) { alert(t("Aucune question à mettre dans le paquet.")); return; }
      const btn = $("dlScorm");
      btn.disabled = true;
      btn.textContent = t("Construction du paquet…");
      try {
        const zip = await SQLScormBuild.buildScorm({
          exercise: ex,
          db: state.bytes,
          fflate,
          seuil: parseInt($("scormSeuil").value, 10) || null,
          lang: I18N.lang,
          readFile: async (f) => {
            const r = await fetch(f, { cache: "no-cache" });
            if (!r.ok) throw new Error(t("{f} introuvable ({s})", { f, s: r.status }));
            return new Uint8Array(await r.arrayBuffer());
          },
        });
        download(`scorm-${SQLLibrary.slug(ex.titre)}.zip`, zip, "application/zip");
        toast(t("Paquet SCORM prêt ({n} questions, {k} Ko).", { n: ex.questions.length, k: Math.round(zip.length / 1024) }));
      } catch (e) {
        alert(t("Impossible de construire le paquet : {m}", { m: e.message }));
      } finally {
        btn.disabled = false;
        btn.textContent = t("Télécharger le paquet SCORM");
      }
    });
    $("dlExercise").addEventListener("click", () => {
      const ex = mergedExercise();
      download(`exercice-${SQLLibrary.slug(ex.titre)}.zip`, SQLLibrary.exerciseZip(ex, state.bytes), "application/zip");
    });
    for (const id of ["pTitre", "pAuteur", "pNombre", "pNiveau", "pConsignes", "pInclureSkill", "pEviter", "pSchema"]) {
      $(id).addEventListener("input", () => { savePrefs(); updatePromptInfo(); });
    }
    $("themes").addEventListener("change", () => { savePrefs(); updatePromptInfo(); });
    $("copyPrompt").addEventListener("click", async () => copy(await buildPrompt(), t("Prompt copié : collez-le dans votre IA.")));
    $("dlSchema").addEventListener("click", () => download(`schema-${state.ex.id}.md`, state.schemaMd, "text/markdown"));

    $("loadPaste").addEventListener("click", () => importText($("pasteBox").value, ""));
    $("openFile").addEventListener("change", async (e) => {
      const f = e.target.files && e.target.files[0];
      if (f) importText(await f.text(), f.name);
      e.target.value = "";
    });
    $("newPack").addEventListener("click", () => {
      if (state.pack && state.pack.questions.length && !confirm(t("Abandonner les questions en cours et commencer un pack vide ?"))) return;
      state.pack = null;
      ensurePack();
      state.pack.questions.push({ theme: "", enonce: "", correction: "" });
      renderCards();
      saveDraft();
      $("s3").scrollIntoView({ behavior: "smooth" });
    });

    for (const id of ["mTitre", "mAuteur", "mDescription"]) {
      $(id).addEventListener("input", () => {
        ensurePack();
        const k = id.slice(1).toLowerCase();
        const v = $(id).value.trim();
        if (v) state.pack[k] = v; else delete state.pack[k];
        saveDraft();
      });
    }
    $("checkAll").addEventListener("click", () => { checkAll(); toast(t("Toutes les corrections ont été exécutées.")); });
    $("addSchemaQuestion").addEventListener("click", () => {
      ensurePack().questions.push({ theme: t("Évolution du schéma"), type: "schema", enonce: "", depart: "base", solution: { tables: [] } });
      renderCards();
      saveDraft();
      const last = $("cards").lastElementChild;
      if (last) { last.scrollIntoView({ behavior: "smooth", block: "center" }); last.querySelector("[data-f=enonce]").focus(); }
    });
    $("schemaDlgSave").addEventListener("click", saveSolutionEditor);
    $("processDlgSave").addEventListener("click", saveProcessDialog);
    $("processDlgCancel").addEventListener("click", () => $("processDialog").close());
    $("addProcessQuestion").addEventListener("click", () => {
      ensurePack().questions.push({ theme: t("Processus"), type: "processus", enonce: "", couloirs: [], attendus: [] });
      renderCards();
      saveDraft();
      const last = $("cards").lastElementChild;
      if (last) { last.scrollIntoView({ behavior: "smooth", block: "center" }); last.querySelector("[data-f=enonce]").focus(); }
    });
    $("schemaDlgCancel").addEventListener("click", () => $("schemaDialog").close());
    $("addQuestion").addEventListener("click", () => {
      ensurePack().questions.push({ theme: "", enonce: "", correction: "" });
      renderCards();
      saveDraft();
      const last = $("cards").lastElementChild;
      if (last) { last.scrollIntoView({ behavior: "smooth", block: "center" }); last.querySelector("[data-f=enonce]").focus(); }
    });
    $("cards").addEventListener("input", onField);
    $("cards").addEventListener("click", onCardClick);

    $("download").addEventListener("click", () => {
      const p = finalPack();
      if (p) download(`${slug(p.titre)}.json`, JSON.stringify(p, null, 2), "application/json");
    });
    $("copyLink").addEventListener("click", async () => {
      const p = finalPack();
      if (p) copy(`${appUrl()}#pack=${await P.encodePack(p)}`, t("Lien copié : il contient toutes les questions."));
    });
    $("openLink").addEventListener("click", (e) => { if ($("openLink").classList.contains("disabled")) e.preventDefault(); });
    $("copyHosted").addEventListener("click", () => {
      const u = $("hostedUrl").value.trim();
      if (!/^https:\/\//i.test(u)) { toast(t("Indiquez l'adresse https:// du fichier JSON hébergé.")); return; }
      copy(`${appUrl()}?pack=${encodeURIComponent(u)}`, t("Lien copié : il pointe vers votre fichier hébergé."));
    });
  }

  init();
})(typeof window !== "undefined" ? window : globalThis);
