/* Construit le zip d'un exercice personnel à partir d'un dossier contenant
 * exercice.json + db.sqlite (ou db.sql).
 * Usage : node tools/zip_exercice.js exemples/exercice-perso-mediatheque
 */
const fs = require("fs");
const path = require("path");
const { zipSync, strToU8 } = require("fflate");

const dir = path.resolve(process.argv[2] || "exemples/exercice-perso-mediatheque");
const files = {};
for (const f of ["exercice.json", "db.sqlite", "db.sql"]) {
  const p = path.join(dir, f);
  if (fs.existsSync(p)) files[f] = new Uint8Array(fs.readFileSync(p));
}
if (!files["exercice.json"] || (!files["db.sqlite"] && !files["db.sql"])) {
  console.error("Le dossier doit contenir exercice.json et db.sqlite (ou db.sql).");
  process.exit(1);
}
files["LISEZMOI.txt"] = strToU8("Exercice SQL Lab : dans SQL Lab, menu « Importer un fichier », choisir ce zip.\n");
const out = dir.replace(/[\\/]$/, "") + ".zip";
fs.writeFileSync(out, zipSync(files, { level: 6 }));
console.log(out);
