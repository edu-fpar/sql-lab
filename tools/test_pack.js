/* Vérifie un pack de questions (format sql-lab-questions/1) sur la base de son exercice,
 * comme le fait l'espace de création.
 * Usage : node tools/test_pack.js exemples/pack-exemple-dcg2024.json
 */
const fs = require("fs");
const path = require("path");
const initSqlJs = require("sql.js");
globalThis.SQLCompat = require("../assets/compat.js");
globalThis.SQLCompare = require("../assets/compare.js");
const Engine = require("../assets/engine.js");
const Packs = require("../assets/packs.js");

const file = process.argv[2] || path.join(__dirname, "..", "exemples", "pack-exemple-dcg2024.json");
const n = Packs.normalizePack(JSON.parse(fs.readFileSync(file, "utf8")));
if (!n.pack) { console.error(n.errors.join("\n")); process.exit(1); }
const exId = n.pack.exercice || "dcg2024";
const dir = path.join(__dirname, "..", "exercices", exId);
const ex = JSON.parse(fs.readFileSync(path.join(dir, "questions.json"), "utf8"));

initSqlJs().then((SQL) => {
  const eng = new Engine(SQL, new Uint8Array(fs.readFileSync(path.join(dir, "db.sqlite"))), ex.aujourdhui);
  let bad = n.errors.length;
  console.log(`== ${n.pack.titre} (${n.pack.questions.length} questions, exercice ${exId})`);
  for (const w of n.warnings) console.log("  ! " + w);
  n.pack.questions.forEach((q, i) => {
    const c = Packs.checkQuestion(eng, q);
    const msgs = [...n.issues[i].errors, ...n.issues[i].warnings, ...c.errors, ...c.warnings];
    const size = c.result ? `${c.result.values.length} ligne(s)` : c.after ? "modification" : "";
    console.log(`${c.ok && !n.issues[i].errors.length ? "✓" : "✗"} ${q.id} [${q.type || "select"}] ${size}${msgs.length ? " – " + msgs.join(" | ") : ""}`);
    if (!c.ok || n.issues[i].errors.length) bad++;
  });
  process.exit(bad ? 1 : 0);
});
