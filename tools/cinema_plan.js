/* Aperçu de la correction pas à pas d'une question, pour rédiger son champ « cinema ».
 *
 *   node tools/cinema_plan.js dcg2024 q15     étapes générées (clés phase.n), commentaires et notes
 *   node tools/cinema_plan.js dcg2024         liste des questions et de leurs commentaires
 *
 * Clés du champ « cinema » d'une question :
 *   "phase" / "phase.n"    remplacent le commentaire automatique
 *   "+phase" / "+phase.n"  ajoutent un « point de méthode » sous le commentaire
 * Texte brut avec **gras**, `code` et listes « - ».
 */
"use strict";
const fs = require("fs");
const path = require("path");
global.window = global;
require("../assets/schemacheck.js");
require("../assets/cinema.js");
const SC = global.SQLSchemaCheck, C = global.SQLCinema;

const ROOT = path.join(__dirname, "..");
const text = (h) => String(h || "").replace(/<\/(p|li)>/g, "\n").replace(/<li>/g, "  • ").replace(/<[^>]+>/g, "").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&").replace(/&quot;/g, '"').trim();

/** Schéma du diagramme à partir d'une base sql.js */
function diagramSchema(db) {
  const tables = db.exec("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY rowid")[0].values.map((r) => r[0]);
  return tables.map((t) => {
    const cols = db.exec(`PRAGMA table_info("${t}")`)[0].values;
    const fks = db.exec(`PRAGMA foreign_key_list("${t}")`);
    const fk = new Map((fks[0] ? fks[0].values : []).map((r) => [r[3], `${r[2]}.${r[4]}`]));
    return { name: t, cols: cols.map((c) => ({ name: c[1], pk: c[5] > 0, fk: fk.get(c[1]) })) };
  });
}

/** Plan pas à pas d'une question (null pour un processus ou une présentation) */
function planFor(q, schema) {
  if (q.type === "processus" || !q || (!q.correction && q.type !== "schema")) return null;
  if (q.type === "schema") return C.schemaPlan(SC.departSchema(q, SC.fromDiagramSchema(schema)), q);
  return C.plan([].concat(q.correction).join("\n"), schema, q);
}

/** Problèmes d'un champ « cinema » : clés inconnues ou étapes inexistantes */
function checkCinema(q, schema) {
  if (!q.cinema) return [];
  const P = planFor(q, schema);
  if (!P) return ["champ cinema sur une question sans correction pas à pas"];
  const out = [];
  for (const [k, v] of Object.entries(q.cinema)) {
    const m = /^(\+?)([a-z]+)(?:\.(\d+))?$/.exec(k);
    if (!m) { out.push(`clé « ${k} » invalide`); continue; }
    if (typeof v !== "string" || !v.trim()) { out.push(`clé « ${k} » : texte vide`); continue; }
    const n = P.steps.filter((s) => s.phase === m[2]).length;
    if (!n) out.push(`clé « ${k} » : pas d'étape « ${m[2]} » pour cette question (${[...new Set(P.steps.map((s) => s.phase))].join(", ")})`);
    else if (m[3] && +m[3] > n) out.push(`clé « ${k} » : la phase « ${m[2]} » n'a que ${n} étape(s)`);
  }
  return out;
}

async function main() {
  const [ex, id] = process.argv.slice(2);
  if (!ex) { console.log("Usage : node tools/cinema_plan.js <exercice> [question]"); return; }
  const initSqlJs = require("sql.js");
  const SQL = await initSqlJs();
  const db = new SQL.Database(fs.readFileSync(path.join(ROOT, "exercices", ex, "db.sqlite")));
  const schema = diagramSchema(db);
  const qs = JSON.parse(fs.readFileSync(path.join(ROOT, "exercices", ex, "questions.json"), "utf8")).questions;
  if (!id) {
    for (const q of qs) console.log(`${q.id.padEnd(5)} ${(q.type || "select").padEnd(9)} ${(q.theme || "").padEnd(28)} ${q.cinema ? "★ " + Object.keys(q.cinema).length + " commentaire(s)" : ""}`);
    return;
  }
  const q = qs.find((x) => x.id === id);
  if (!q) { console.log("Question inconnue"); return; }
  const P = planFor(q, schema);
  if (!P) { console.log("Pas de correction pas à pas pour cette question."); return; }
  console.log(`${ex}/${q.id} – ${q.theme}\n${q.enonce}\n`);
  const seen = {};
  for (const st of P.steps) {
    seen[st.phase] = (seen[st.phase] || 0) + 1;
    console.log(`── [${st.phase}.${seen[st.phase]}] ${st.title}`);
    console.log(text(st.text).split("\n").map((l) => "   " + l).join("\n"));
    if (st.notes) console.log("   ★ " + text(st.notes).split("\n").join("\n     "));
  }
  for (const p of checkCinema(q, schema)) console.log("✗ " + p);
}

module.exports = { diagramSchema, planFor, checkCinema };
if (require.main === module) main().catch((e) => { console.error(e); process.exit(1); });
