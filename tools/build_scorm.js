/* Construit un paquet SCORM 1.2 pour un exercice.
 *
 * Usage :
 *   node tools/build_scorm.js dcg2024
 *   node tools/build_scorm.js dcg2024 exemples/pack-exemple-dcg2024.json --seuil 80
 *   node tools/build_scorm.js exemples/exercice-perso-mediatheque.zip
 *   node tools/build_scorm.js --tous            (un paquet par exercice du catalogue)
 *
 * Résultat : dist/sqllab-<exercice>-scorm12.zip, à déposer tel quel dans Moodle
 * (activité « Paquetage SCORM »).
 */
const fs = require("fs");
const path = require("path");
const fflate = require("fflate");
const initSqlJs = require("sql.js");
globalThis.SQLCompat = require("../assets/compat.js");
globalThis.SQLCompare = require("../assets/compare.js");
globalThis.SQLPacks = require("../assets/packs.js");
globalThis.fflate = fflate;
const Library = require("../assets/library.js");
const Engine = require("../assets/engine.js");
const { buildScorm } = require("../assets/scormbuild.js");

const root = path.join(__dirname, "..");
const args = process.argv.slice(2);
const opt = (name) => { const i = args.indexOf(name); if (i < 0) return null; const v = args[i + 1]; args.splice(i, 2); return v; };
const seuil = parseInt(opt("--seuil"), 10) || null;
const titre = opt("--titre");
const tous = args.includes("--tous");

async function exercise(SQL, source) {
  if (/\.zip$|\.sqlite3?$|\.sql$/i.test(source)) {
    const r = Library.readExerciseFile(SQL, new Uint8Array(fs.readFileSync(source)), path.basename(source));
    if (r.errors.length) throw new Error(r.errors.join(" "));
    r.warnings.forEach((w) => console.warn("  ! " + w));
    return { ex: r.exercise, db: r.bytes };
  }
  const dir = path.join(root, "exercices", source);
  return {
    ex: JSON.parse(fs.readFileSync(path.join(dir, "questions.json"), "utf8")),
    db: new Uint8Array(fs.readFileSync(path.join(dir, "db.sqlite"))),
  };
}

async function one(SQL, source, packs) {
  const { ex, db } = await exercise(SQL, source);
  ex.questions = ex.questions || [];
  const used = new Set(ex.questions.map((q) => q.id));
  for (const f of packs) {
    const n = SQLPacks.normalizePack(JSON.parse(fs.readFileSync(f, "utf8")));
    if (!n.pack) throw new Error(`${f} : ${n.errors.join(" ")}`);
    for (const q of n.pack.questions) {
      let id = q.id;
      while (used.has(id)) id += "b";
      used.add(id);
      ex.questions.push({ ...q, id });
    }
  }
  if (titre) ex.titre = titre;

  // contrôle : toutes les corrections doivent s'exécuter
  const eng = new Engine(SQL, db, ex.aujourdhui);
  const ko = ex.questions.filter((q) => !SQLPacks.checkQuestion(eng, q).ok);
  if (ko.length) throw new Error(`corrections qui ne s'exécutent pas : ${ko.map((q) => q.id).join(", ")}`);

  const zip = await buildScorm({
    exercise: ex, db, fflate, seuil,
    readFile: async (f) => new Uint8Array(fs.readFileSync(path.join(root, f))),
  });
  fs.mkdirSync(path.join(root, "dist"), { recursive: true });
  const out = path.join(root, "dist", `sqllab-${String(ex.id).replace(/[^\w-]/g, "")}-scorm12.zip`);
  fs.writeFileSync(out, zip);
  console.log(`${out}  (${ex.questions.length} questions, ${Math.round(zip.length / 1024)} Ko${seuil ? ", seuil " + seuil + " %" : ""})`);
}

initSqlJs().then(async (SQL) => {
  try {
    if (tous) {
      const cat = JSON.parse(fs.readFileSync(path.join(root, "exercices", "catalogue.json"), "utf8"));
      for (const e of cat) await one(SQL, e.id, []);
    } else {
      const [source, ...packs] = args;
      if (!source) { console.error("Indiquez un exercice (ex. dcg2024) ou un zip d'exercice."); process.exit(1); }
      await one(SQL, source, packs);
    }
  } catch (e) {
    console.error("Erreur : " + e.message);
    process.exit(1);
  }
});
