/* Reconstruit exercices/<id>/db.sqlite à partir de exercices/<id>/db.sql (CREATE TABLE + INSERT).
 *
 *   node tools/build_db.js dcg2024            reconstruit la base
 *   node tools/build_db.js --verifier         compare db.sql et db.sqlite pour tous les exercices
 *
 * À lancer après toute correction de données dans db.sql, puis node tools/test_exercice.js <id>.
 */
"use strict";
const fs = require("fs");
const path = require("path");
const initSqlJs = require("sql.js");

const ROOT = path.join(__dirname, "..");
const dir = (id) => path.join(ROOT, "exercices", id);

function build(SQL, id) {
  const db = new SQL.Database();
  db.run("PRAGMA foreign_keys = ON;");
  db.exec(fs.readFileSync(path.join(dir(id), "db.sql"), "utf8"));
  const bad = db.exec("PRAGMA foreign_key_check");
  if (bad.length && bad[0].values.length) throw new Error(`${id} : ${bad[0].values.length} ligne(s) violent une clé étrangère`);
  return db;
}

/** Contenu comparable : schéma + lignes de chaque table */
function dump(db) {
  const out = {};
  for (const [name, sql] of db.exec("SELECT name, sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name")[0].values) {
    const r = db.exec(`SELECT * FROM "${name}"`);
    out[name] = { sql: sql.replace(/\s+/g, " "), rows: r.length ? r[0].values : [] };
  }
  return JSON.stringify(out);
}

async function main() {
  const SQL = await initSqlJs();
  const args = process.argv.slice(2);
  if (args[0] === "--verifier") {
    const cat = JSON.parse(fs.readFileSync(path.join(ROOT, "exercices", "catalogue.json"), "utf8"));
    let diff = 0;
    for (const { id } of cat) {
      const a = dump(build(SQL, id));
      const b = dump(new SQL.Database(fs.readFileSync(path.join(dir(id), "db.sqlite"))));
      if (a !== b) { diff++; console.log(`✗ ${id} : db.sqlite ne correspond pas à db.sql`); }
    }
    console.log(diff ? `${diff} différence(s)` : "Toutes les bases correspondent à leur db.sql.");
    process.exit(diff ? 1 : 0);
  }
  for (const id of args) {
    const db = build(SQL, id);
    fs.writeFileSync(path.join(dir(id), "db.sqlite"), Buffer.from(db.export()));
    console.log(`✓ ${id}/db.sqlite reconstruite`);
  }
  if (!args.length) console.log("Usage : node tools/build_db.js <exercice…> | --verifier");
}
main().catch((e) => { console.error(e.message); process.exit(1); });
