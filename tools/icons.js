/* Génère lib/lucide/icons.css : une classe .i-<nom> par icône Lucide utilisée (masque CSS en
 * data URI, couleur = couleur du texte). Aucune requête réseau, fonctionne dans les paquets SCORM
 * et la documentation. Appelé par tools/vendor.js ; liste des icônes : ICONS ci-dessous.
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const SRC = path.join(root, "node_modules", "lucide-static", "icons");

const ICONS = [
  "play", "pause", "skip-back", "chevron-left", "chevron-right", "chevron-down", "pencil-line", "x",
  "check", "circle-x", "triangle-alert", "rotate-ccw", "maximize-2", "menu", "star", "plus", "minus",
  "circle", "rectangle-horizontal", "clapperboard", "book-open", "corner-down-left", "arrow-up",
  "arrow-down", "arrow-left-right", "workflow", "table-2", "graduation-cap", "presentation", "school",
  "microscope", "building-2", "code-xml", "network", "circle-check", "lightbulb", "eye", "upload",
  "download", "link", "copy", "trash-2", "file-json", "package", "database", "languages",
];
// icônes maison (même grille 24×24, même trait que Lucide)
const CUSTOM = {
  trapezoid: '<path d="M3 6h18l-4 12H7z"/>',
};

function svg(inner) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;
}
function inner(name) {
  const s = fs.readFileSync(path.join(SRC, name + ".svg"), "utf8");
  return s.replace(/<!--[\s\S]*?-->/g, "").replace(/^[\s\S]*?<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "").replace(/\s+/g, " ").trim();
}
const uri = (s) => `url("data:image/svg+xml,${encodeURIComponent(s).replace(/'/g, "%27").replace(/\(/g, "%28").replace(/\)/g, "%29")}")`;

function build() {
  if (!fs.existsSync(SRC)) { console.error("Manquant : " + SRC + " (lancez npm install)"); process.exit(1); }
  const out = [
    "/* Icônes Lucide (https://lucide.dev, licence ISC) — fichier généré par tools/icons.js */",
    ".i { display: inline-block; width: 1.1em; height: 1.1em; flex: none; vertical-align: -.18em; background-color: currentColor;",
    "  -webkit-mask: var(--i) center / contain no-repeat; mask: var(--i) center / contain no-repeat; }",
    ".i + .i-label, .i-label + .i { margin-left: .35em; }",
  ];
  for (const n of ICONS) out.push(`.i-${n} { --i: ${uri(svg(inner(n)))}; }`);
  for (const [n, body] of Object.entries(CUSTOM)) out.push(`.i-${n} { --i: ${uri(svg(body))}; }`);
  const dest = path.join(root, "lib", "lucide");
  fs.mkdirSync(dest, { recursive: true });
  fs.writeFileSync(path.join(dest, "icons.css"), out.join("\n") + "\n");
  fs.copyFileSync(path.join(root, "node_modules", "lucide-static", "LICENSE"), path.join(dest, "LICENSE"));
  console.log(`lib/lucide/icons.css (${ICONS.length + Object.keys(CUSTOM).length} icônes)`);
}

module.exports = { build, ICONS };
if (require.main === module) build();
