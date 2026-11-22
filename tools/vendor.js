/* Copie les bibliothèques utilisées par l'application dans lib/ (versions figées par package.json).
 * L'application n'a ainsi besoin d'aucun CDN : indispensable pour les paquets SCORM et le hors-ligne.
 * Usage : npm install && npm run vendor
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const nm = path.join(root, "node_modules");
const FILES = {
  "sql.js/sql-wasm.js": "sql.js/dist/sql-wasm.js",
  "sql.js/sql-wasm.wasm": "sql.js/dist/sql-wasm.wasm",
  "fflate/fflate.js": "fflate/umd/index.js",
  "codemirror/codemirror.js": "codemirror/lib/codemirror.js",
  "codemirror/codemirror.css": "codemirror/lib/codemirror.css",
  "codemirror/sql.js": "codemirror/mode/sql/sql.js",
  "codemirror/show-hint.js": "codemirror/addon/hint/show-hint.js",
  "codemirror/show-hint.css": "codemirror/addon/hint/show-hint.css",
  "codemirror/sql-hint.js": "codemirror/addon/hint/sql-hint.js",
  "codemirror/placeholder.js": "codemirror/addon/display/placeholder.js",
};
const LICENCES = {
  "sql.js/LICENSE": "sql.js/LICENSE",
  "fflate/LICENSE": "fflate/LICENSE",
  "codemirror/LICENSE": "codemirror/LICENSE",
};

for (const [dest, src] of Object.entries({ ...FILES, ...LICENCES })) {
  const from = path.join(nm, src);
  const to = path.join(root, "lib", dest);
  if (!fs.existsSync(from)) { console.error("Manquant : " + from + " (lancez npm install)"); process.exit(1); }
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.copyFileSync(from, to);
  console.log("lib/" + dest);
}
