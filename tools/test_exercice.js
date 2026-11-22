/* Vérifie un exercice : chaque correction s'exécute, chaque variante est
 * reconnue comme juste, et quelques erreurs typiques sont bien diagnostiquées.
 *
 * Usage : npm install sql.js@1.10.3   (une fois)
 *         node tools/test_exercice.js dcg2024
 */
const fs = require("fs");
const path = require("path");
const initSqlJs = require("sql.js");
const Engine = require("../assets/engine.js");
const Schema = require("../assets/schemacheck.js");
const Process = require("../assets/processcheck.js");

const ex = process.argv[2] || "dcg2024";
const dir = path.join(__dirname, "..", "exercices", ex);
const data = JSON.parse(fs.readFileSync(path.join(dir, "questions.json"), "utf8"));
const bytes = fs.readFileSync(path.join(dir, "db.sqlite"));

// Réponses volontairement fausses : [id question, requête, fragment attendu dans le diagnostic]
// (propres à chaque exercice ; un exercice sans pièges ne vérifie que corrections et variantes)
const PIEGES_PAR_EXERCICE = {};
PIEGES_PAR_EXERCICE.dcg2024 = [
  ["q02", "SELECT NomCli, PrenomCli, TelCli FROM CLIENT WHERE VilleCli = 'Dijon'", "ordre"],
  ["q03", "SELECT NomCli, PrenomCli, TelCli FROM CLIENT WHERE MailCli = NULL ORDER BY NomCli", "aucune ligne"],
  ["q09", "SELECT IdDoss, DateCreation, MontantAFinancer FROM DOSSIER WHERE DateCreation BETWEEN \"01/01/2023\" AND \"31/12/2023\"", "OK"],
  ["q09", "SELECT IdDoss, DateCreation, MontantAFinancer FROM DOSSIER WHERE DateCreation BETWEEN #01/01/2023# AND #31/12/2023#", "OK"],
  ["q09", "SELECT IdDoss, DateCreation, MontantAFinancer FROM DOSSIER WHERE EXTRACT(YEAR FROM DateCreation) = 2023", "OK"],
  ["q12", "SELECT IdDoss, DateCreation, NomCli, PrenomCli FROM DOSSIER, CLIENT WHERE DateCloture IS NULL", "produit cartésien"],
  ["q14", "SELECT CLIENT.IdCli, NomCli, PrenomCli, MailCli FROM CLIENT, DOSSIER, OFFRE WHERE CLIENT.IdCli = DOSSIER.IdCli AND DOSSIER.IdDoss = OFFRE.IdDoss AND AcceptationClient = 'Refusé'", "DISTINCT"],
  ["q14", "SELECT DISTINCT IdCli, NomCli FROM CLIENT, DOSSIER WHERE CLIENT.IdCli = DOSSIER.IdCli", "ambiguë"],
  ["q17", "SELECT DOSSIER.IdDoss, NomChargeClientele, COUNT(*) FROM OFFRE, DOSSIER, CHARGECLIENTELE WHERE DOSSIER.IdDoss = OFFRE.IdDoss AND DOSSIER.IdChargeClientele = CHARGECLIENTELE.IdChargeClientele AND COUNT(*) > 3 GROUP BY DOSSIER.IdDoss", "HAVING"],
  ["q17", "SELECT DOSSIER.IdDoss, NomChargeClientele, COUNT(*) FROM OFFRE, DOSSIER, CHARGECLIENTELE WHERE DOSSIER.IdDoss = OFFRE.IdDoss AND DOSSIER.IdChargeClientele = CHARGECLIENTELE.IdChargeClientele GROUP BY DOSSIER.IdDoss, NomChargeClientele HAVING COUNT(*) > 3 ORDER BY COUNT(*)", "ordre"],
  ["q17", "SELECT NomChargeClientele, COUNT(*), DOSSIER.IdDoss FROM OFFRE, DOSSIER, CHARGECLIENTELE WHERE DOSSIER.IdDoss = OFFRE.IdDoss AND DOSSIER.IdChargeClientele = CHARGECLIENTELE.IdChargeClientele GROUP BY DOSSIER.IdDoss, NomChargeClientele HAVING COUNT(*) > 3 ORDER BY 2 DESC", "OK"],
  ["q19", "SELECT IdDoss, DateCreation FROM DOSSIER WHERE IdDoss NOT IN (SELECT IdDoss FROM OFFRE)", "Trop de lignes"],
  ["q22", "SELECT DISTINCT NomCli, PrenomCli FROM CLIENT, DOSSIER, OFFRE WHERE CLIENT.IdCli = DOSSIER.IdCli AND DOSSIER.IdDoss = OFFRE.IdDoss AND AcceptationClient = 'Refusé' AND DateEmissionOffre > date('now', '-1 year')", "OK"],
  ["q24", "UPDATE OFFRE SET TauxInteret = 4,34 WHERE IdOffre = 3456812", "point"],
  ["q24", "UPDATE OFFRE SET TauxInteret = 4.34", "plus de lignes"],
  ["q24", "SELECT * FROM OFFRE WHERE IdOffre = 3456812", "aucune donnée"],
  ["q26", "UPDATE DOSSIER SET DateCloture = CURRENT_DATE WHERE IdDoss = 2341", "OK"],
  ["q27", "INSERT INTO PRODUIT VALUES ('Prêt étudiant')", "valeurs"],
  ["q28", "DELETE FROM PIECEJOINTE WHERE IdDoss = 2338", "plus de lignes"],
  ["q29", "DELETE FROM CLIENT WHERE IdCli = 1064", "intégrité référentielle"],
  ["q08", "UPDATE OFFRE SET TauxInteret = 0", "SELECT"],
];
const PIEGES = PIEGES_PAR_EXERCICE[ex] || [];

/** Question « processus » : le corrigé passe toutes les vérifications, un schéma vide est refusé,
 *  et chaque synchronisation attendue rejette une condition « tout en ET » si elle contient un OU */
function testProcess(q) {
  let bad = 0;
  const r = Process.check(q.solution, q);
  if (!r.ok) bad++;
  const empty = Process.check(q.depart && q.depart.nodes ? { lanes: q.couloirs || [], arrows: [], ...q.depart } : { lanes: q.couloirs || [], nodes: [], arrows: [] }, q);
  if (empty.ok) bad++;
  let traps = 0, trapsOk = 0;
  for (const spec of q.attendus || []) {
    if (!spec.synchronisation || !/(^|[^\p{L}"«])(OU|OR|O)(?=$|[^\p{L}"»])/iu.test(spec.synchronisation)) continue;
    const m = JSON.parse(JSON.stringify(q.solution));
    for (const n of m.nodes) if (n.kind === "sync") n.cond = n.cond.replace(/\bou\b/gi, "et").replace(/\bor\b/gi, "and").replace(/\bo\b/gi, "y");
    traps++;
    if (!Process.check(m, q).ok) trapsOk++; else bad++;
  }
  console.log(`${q.id} [${q.theme}] processus – corrigé : ${r.ok ? "OK" : "✗ " + r.messages.join(" ")} | vide : ${empty.ok ? "✗ accepté" : "refusé"}${traps ? ` | « tout en ET » refusé : ${trapsOk}/${traps}` : ""}`);
  return bad;
}

/** Question « schéma » : chaque solution est reconnue, le départ seul est refusé */
function testSchema(q, base) {
  let bad = 0;
  const depart = Schema.departSchema(q, base);
  const sols = [q.solution, ...(q.variantes || [])];
  const parts = sols.map((sol, i) => {
    const r = Schema.compare(Schema.solutionSchema(depart, sol), depart, q);
    const want = sol.partiel ? "partial" : "ok";
    if (r.level !== want) bad++;
    return `${i ? "variante" : "solution"} ${r.level === want ? "OK" : "✗ " + r.messages.join(" ")}${sol.partiel ? " (partielle)" : ""}`;
  });
  const r0 = Schema.compare(depart, depart, q);
  if (r0.ok) bad++;
  console.log(`${q.id} [${q.theme}] schéma ${depart.tables.length} → ${Schema.solutionSchema(depart, q.solution).tables.length} tables – ${parts.join(" | ")} | départ seul : ${r0.ok ? "✗ accepté" : "refusé (" + r0.score.passed + "/" + r0.score.total + ")"}`);
  return bad;
}

// Erreurs typiques sur les schémas : [id, modification de la solution, fragment attendu]
const findT = (st, n) => st.tables.find((t) => t.name === n);
const SCHEMA_PIEGES = {
  dcg2024: [
    ["s01", (st) => { findT(st, "DOSSIER").cols.push({ name: "IdCli", pk: false, fk: "CLIENT" }); }, "ne doit plus figurer"],
    ["s01", (st) => { findT(st, "EMPRUNTER").cols[1].pk = false; }, "clé composée"],
    ["s01", (st) => { findT(st, "SOUSCRIRE").cols.find((c) => c.name === "IdOffre").fk = "DOSSIER"; }, "pointe pas vers la bonne table"],
    ["s01", (st) => { st.tables = st.tables.filter((t) => t.name !== "TYPE_ASSURANCE"); }, "types d'assurance"],
    ["s01", (st) => { findT(st, "EMPRUNTER").name = "Co_Emprunteur"; }, "OK"],
    ["s01", (st) => { findT(st, "EMPRUNTER").name = "LIEN"; }, "OK"],
  ],
  dcg2022: [
    ["s01", (st) => { findT(st, "AFFECTATION").cols.find((c) => /hydro/i.test(c.name)).fk = "PERSONNEL"; }, "pointe pas vers la bonne table"],
    ["s01", (st) => { st.tables = st.tables.filter((t) => t.name !== "PROPOSER"); findT(st, "PRODUIT").cols.push({ name: "CodeSpa", pk: false, fk: "SPA" }); }, "table d'association"],
    ["s01", (st) => { findT(st, "HYDROTHERAPEUTE").cols[0].fk = null; }, "clé étrangère"],
    ["s01", (st) => { const p = findT(st, "PRODUIT"); p.cols = p.cols.filter((c) => c.name !== "PrixUnitaire"); findT(st, "PROPOSER").cols.push({ name: "Prix", pk: false, fk: null }); }, "OK"],
  ],
};

function verdict(r) {
  if (r.error) return "ERREUR : " + r.error;
  return r.cmp.ok ? "OK" + (r.cmp.notes.length ? " (" + r.cmp.notes.join(" ") + ")" : "") : r.cmp.messages.join(" ");
}

initSqlJs().then((SQL) => {
  const eng = new Engine(SQL, new Uint8Array(bytes), data.aujourdhui);
  let fails = 0;
  console.log(`== ${data.titre} : ${data.questions.length} questions`);
  // schéma de la base (comme le diagramme de l'application)
  const db = eng.fresh();
  const tables = db.exec("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY rowid")[0].values.map((r) => r[0]);
  const base = Schema.fromDiagramSchema(tables.map((t) => {
    const fks = new Map((db.exec(`PRAGMA foreign_key_list("${t}")`)[0] || { values: [] }).values.map((r) => [r[3], r[2]]));
    return { name: t, cols: db.exec(`PRAGMA table_info("${t}")`)[0].values.map((c) => ({ name: c[1], pk: c[5] > 0, fk: fks.get(c[1]) || null })) };
  }));
  // commentaires de la correction pas à pas (champ « cinema ») : chaque clé doit viser une étape existante
  const dschema = require("./cinema_plan.js").diagramSchema(db);
  db.close();
  const { checkCinema } = require("./cinema_plan.js");
  for (const q of data.questions) {
    for (const p of checkCinema(q, dschema)) { console.log(`✗ ${q.id} cinema : ${p}`); fails++; }
  }

  for (const q of data.questions) {
    if (q.type === "schema") { fails += testSchema(q, base); continue; }
    if (q.type === "processus") { fails += testProcess(q); continue; }
    const exp = eng.expected(q);
    const size = q.type === "write" ? `${exp.after.values.length} lignes après` : `${exp.result.values.length} ligne(s)`;
    const self = eng.evaluate(q, Engine.lines(q.correction));
    let line = `${q.id} [${q.theme}] ${size} – correction : ${verdict(self)}`;
    if (!self.cmp || !self.cmp.ok) fails++;
    for (const v of q.variantes || []) {
      const r = eng.evaluate(q, Engine.lines(v));
      line += ` | variante : ${verdict(r)}`;
      if (!r.cmp || !r.cmp.ok) fails++;
    }
    console.log(line);
    if (q.type !== "write" && exp.result.values.length === 0) { console.log("   !! résultat attendu vide"); fails++; }
  }
  for (const [id, mutate, attendu] of SCHEMA_PIEGES[ex] || []) {
    const q = data.questions.find((x) => x.id === id);
    const depart = Schema.departSchema(q, base);
    const st = Schema.solutionSchema(depart, q.solution);
    mutate(st);
    const r = Schema.compare(st, depart, q);
    const v = r.ok ? "OK" : r.messages.join(" ");
    const ok = attendu === "OK" ? r.ok : v.toLowerCase().includes(attendu.toLowerCase());
    if (!ok) fails++;
    console.log(`${ok ? "✓" : "✗"} ${id} (schéma) : ${v}`);
  }
  console.log("\n== Pièges");
  for (const [id, sql, attendu] of PIEGES) {
    const q = data.questions.find((x) => x.id === id);
    if (!q) { console.log(`✗ ${id} : question inexistante`); fails++; continue; }
    const v = verdict(eng.evaluate(q, sql));
    const ok = attendu === "OK" ? v.startsWith("OK") : v.toLowerCase().includes(attendu.toLowerCase());
    if (!ok) fails++;
    console.log(`${ok ? "✓" : "✗"} ${id} : ${v}`);
  }
  console.log(fails ? `\n${fails} problème(s)` : "\nTout est correct.");
  process.exit(fails ? 1 : 0);
});
