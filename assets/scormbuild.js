/* SQL Lab – construction d'un paquet SCORM 1.2 (un exercice + ses questions).
 * Utilisé par l'espace enseignant (navigateur) et par tools/build_scorm.js (Node).
 *
 * Le paquet contient l'application complète, sans CDN, verrouillée sur l'exercice :
 * pas de choix d'exercice ni d'import ; score = % de questions réussies.
 */
(function (global) {
  "use strict";

  // Fichiers de l'application nécessaires dans le paquet (chemins relatifs à la racine du site)
  const APP_FILES = [
    "index.html",
    "assets/style.css",
    "assets/i18n.js",
    "assets/compat.js",
    "assets/compare.js",
    "assets/engine.js",
    "assets/diagram.js",
    "assets/cinema.js",
    "assets/packs.js",
    "assets/library.js",
    "assets/scorm.js",
    "assets/schemacheck.js",
    "assets/schema-editor.js",
    "assets/processcheck.js",
    "assets/process-editor.js",
    "assets/app.js",
    "lib/sql.js/sql-wasm.js",
    "lib/sql.js/sql-wasm.wasm",
    "lib/sql.js/LICENSE",
    "lib/fflate/fflate.js",
    "lib/fflate/LICENSE",
    "lib/codemirror/codemirror.js",
    "lib/codemirror/codemirror.css",
    "lib/codemirror/sql.js",
    "lib/codemirror/show-hint.js",
    "lib/codemirror/show-hint.css",
    "lib/codemirror/sql-hint.js",
    "lib/codemirror/placeholder.js",
    "lib/codemirror/LICENSE",
  ];

  const xml = (s) => String(s).replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[c]));
  const ident = (s) => String(s).replace(/[^A-Za-z0-9_-]/g, "_");

  function manifest(id, titre, files, seuil) {
    const list = files.map((f) => `      <file href="${xml(f)}"/>`).join("\n");
    return `<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="SQLLAB-${ident(id)}" version="1.0"
  xmlns="http://www.imsproject.org/xsd/imscp_rootv1p1p2"
  xmlns:adlcp="http://www.adlnet.org/xsd/adlcp_rootv1p2"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.imsproject.org/xsd/imscp_rootv1p1p2 imscp_rootv1p1p2.xsd http://www.imsglobal.org/xsd/imsmd_rootv1p2p1 imsmd_rootv1p2p1.xsd http://www.adlnet.org/xsd/adlcp_rootv1p2 adlcp_rootv1p2.xsd">
  <metadata>
    <schema>ADL SCORM</schema>
    <schemaversion>1.2</schemaversion>
  </metadata>
  <organizations default="ORG-${ident(id)}">
    <organization identifier="ORG-${ident(id)}">
      <title>${xml(titre)}</title>
      <item identifier="ITEM-${ident(id)}" identifierref="RES-${ident(id)}" isvisible="true">
        <title>${xml(titre)}</title>${seuil ? `\n        <adlcp:masteryscore>${seuil}</adlcp:masteryscore>` : ""}
      </item>
    </organization>
  </organizations>
  <resources>
    <resource identifier="RES-${ident(id)}" type="webcontent" adlcp:scormtype="sco" href="index.html">
${list}
    </resource>
  </resources>
</manifest>
`;
  }

  /**
   * @param o.exercise  exercice complet (id, titre, contexte, aujourdhui, questions…)
   * @param o.db        Uint8Array de la base SQLite
   * @param o.readFile  async (chemin) => Uint8Array  (fichiers de l'application)
   * @param o.fflate    module fflate
   * @param o.seuil     % de réussite pour « passed » (facultatif, 1 à 100)
   * @param o.lang      langue de l'interface du paquet ("fr" | "en"), par défaut celle de la page
   * @returns Uint8Array du zip
   */
  async function buildScorm(o) {
    const { exercise, db, readFile, fflate } = o;
    const enc = (s) => fflate.strToU8(s);
    const id = String(exercise.id || "exercice").replace(/[^\w-]/g, "") || "exercice";
    const seuil = o.seuil && o.seuil >= 1 && o.seuil <= 100 ? Math.round(o.seuil) : null;
    const files = {};

    for (const f of APP_FILES) files[f] = await readFile(f);

    // page verrouillée sur l'exercice, avec les réglages SCORM
    const config = { locked: true, scorm: true, exercice: id };
    if (seuil) config.seuil = seuil;
    const lang = o.lang || (global.I18N && global.I18N.lang);
    if (lang) config.lang = lang;
    let html = new TextDecoder().decode(files["index.html"]);
    html = html.replace("<!--SQLLAB_CONFIG-->", `<script>window.SQLLAB_CONFIG = ${JSON.stringify(config)};</script>`);
    html = html.replace(/<title>[^<]*<\/title>/, `<title>${xml(exercise.titre)} – SQL Lab</title>`);
    files["index.html"] = enc(html);

    const ex = { ...exercise, id };
    files["exercices/catalogue.json"] = enc(JSON.stringify([{ id, titre: ex.titre }], null, 2));
    files[`exercices/${id}/questions.json`] = enc(JSON.stringify(ex, null, 2));
    files[`exercices/${id}/db.sqlite`] = db;

    const all = Object.keys(files);
    files["imsmanifest.xml"] = enc(manifest(id, ex.titre, all, seuil));

    const zipInput = {};
    for (const [k, v] of Object.entries(files)) zipInput[k] = /\.(wasm|sqlite)$/.test(k) ? [v, { level: 6 }] : v;
    return fflate.zipSync(zipInput, { level: 6 });
  }

  const api = { APP_FILES, buildScorm, manifest };
  global.SQLScormBuild = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
