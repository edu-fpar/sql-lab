/* Écrit le champ « cinema » (commentaires de la correction pas à pas) d'une question, sans
 * reformater le reste du fichier : une seule ligne insérée après "id", ou remplacée si elle existe.
 *
 *   node tools/set_cinema.js dcg2024 q15 commentaires.json     (objet { "+tables": "…", … })
 *   node tools/set_cinema.js dcg2024 q15 --supprimer
 *
 * Vérifie ensuite le JSON et que chaque clé vise une étape existante (tools/cinema_plan.js).
 */
"use strict";
const fs = require("fs");
const path = require("path");

async function main() {
  const [ex, id, src] = process.argv.slice(2);
  if (!ex || !id || !src) { console.log("Usage : node tools/set_cinema.js <exercice> <question> <fichier.json | --supprimer>"); process.exit(1); }
  const file = path.join(__dirname, "..", "exercices", ex, "questions.json");
  let s = fs.readFileSync(file, "utf8");
  const eol = s.includes("\r\n") ? "\r\n" : "\n";
  const obj = src === "--supprimer" ? null : JSON.parse(fs.readFileSync(src, "utf8"));
  const idRe = new RegExp(`^([ \\t]*)"id"\\s*:\\s*"${id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"\\s*,[^\\n]*\\n`, "m");
  const m = idRe.exec(s);
  if (!m) { console.log(`Question ${id} introuvable (la ligne "id" doit être seule sur sa ligne).`); process.exit(1); }
  const start = m.index + m[0].length;
  const nextId = s.slice(start).search(/^[ \t]*"id"\s*:/m);
  const zone = nextId < 0 ? s.slice(start) : s.slice(start, start + nextId);
  const old = /^[ \t]*"cinema"\s*:\s*\{.*\},?[ \t]*\r?\n/m.exec(zone);
  const line = obj ? `${m[1]}"cinema": ${JSON.stringify(obj)},${eol}` : "";
  if (old) s = s.slice(0, start + old.index) + line + s.slice(start + old.index + old[0].length);
  else if (obj) s = s.slice(0, start) + line + s.slice(start);
  const data = JSON.parse(s); // JSON toujours valide ?
  const q = data.questions.find((x) => x.id === id);

  const initSqlJs = require("sql.js");
  const SQL = await initSqlJs();
  const { diagramSchema, checkCinema } = require("./cinema_plan.js");
  const db = new SQL.Database(fs.readFileSync(path.join(__dirname, "..", "exercices", ex, "db.sqlite")));
  const pb = checkCinema(q, diagramSchema(db));
  if (pb.length) { pb.forEach((p) => console.log("✗ " + p)); console.log("Rien n'a été écrit."); process.exit(1); }
  fs.writeFileSync(file, s);
  console.log(obj ? `✓ ${ex}/${id} : ${Object.keys(obj).length} commentaire(s)` : `✓ ${ex}/${id} : commentaires supprimés`);
}
main().catch((e) => { console.error(e.message); process.exit(1); });
