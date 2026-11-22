/* Écrit un champ d'une question sur une seule ligne, sans reformater le reste de questions.json :
 * la ligne est insérée après "id", ou remplacée si le champ existe déjà sur une seule ligne.
 *
 *   node tools/set_field.js dcg2024 q05 allerPlusLoin texte.json     (fichier : une chaîne JSON)
 *   node tools/set_field.js dcg2024 q05 enonce texte.json
 *   node tools/set_field.js dcg2024 q05 allerPlusLoin --supprimer
 *
 * Pour le champ « cinema », préférer tools/set_cinema.js (qui vérifie les étapes visées).
 * Un champ écrit sur plusieurs lignes (correction, variantes…) se modifie à la main.
 */
"use strict";
const fs = require("fs");
const path = require("path");

const [ex, id, field, src] = process.argv.slice(2);
if (!ex || !id || !field || !src) { console.log("Usage : node tools/set_field.js <exercice> <question> <champ> <fichier.json | --supprimer>"); process.exit(1); }
const file = path.join(__dirname, "..", "exercices", ex, "questions.json");
let s = fs.readFileSync(file, "utf8");
const eol = s.includes("\r\n") ? "\r\n" : "\n";
const value = src === "--supprimer" ? undefined : JSON.parse(fs.readFileSync(src, "utf8"));
const esc = (x) => x.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const m = new RegExp(`^([ \\t]*)"id"\\s*:\\s*"${esc(id)}"\\s*,[^\\n]*\\n`, "m").exec(s);
if (!m) { console.log(`Question ${id} introuvable (la ligne "id" doit être seule sur sa ligne).`); process.exit(1); }
const start = m.index + m[0].length;
const nextId = s.slice(start).search(/^[ \t]*"id"\s*:/m);
const zone = nextId < 0 ? s.slice(start) : s.slice(start, start + nextId);
const fieldRe = new RegExp(`^([ \\t]*)"${esc(field)}"\\s*:\\s*(.*?)(,?)[ \\t]*\\r?\\n`, "m");
const old = fieldRe.exec(zone);
if (old) {
  try { JSON.parse(old[2]); } catch (e) { console.log(`Le champ « ${field} » tient sur plusieurs lignes : modifiez-le à la main.`); process.exit(1); }
}
const line = value === undefined ? "" : `${m[1]}"${field}": ${JSON.stringify(value)},${eol}`;
let out;
if (old) {
  // dernier champ de l'objet (sans virgule) : garder sans virgule
  const keepComma = old[3] === ",";
  const l = value === undefined ? "" : keepComma ? line : line.replace(/,(\r?\n)$/, "$1");
  out = s.slice(0, start + old.index) + l + s.slice(start + old.index + old[0].length);
} else if (value !== undefined) out = s.slice(0, start) + line + s.slice(start);
else out = s;
const data = JSON.parse(out); // JSON toujours valide ?
const q = data.questions.find((x) => x.id === id);
if (value !== undefined && JSON.stringify(q[field]) !== JSON.stringify(value)) { console.log("Écriture incohérente, rien n'a été écrit."); process.exit(1); }
fs.writeFileSync(file, out);
console.log(value === undefined ? `✓ ${ex}/${id} : ${field} supprimé` : `✓ ${ex}/${id} : ${field} écrit`);
