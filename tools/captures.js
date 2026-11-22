/* Captures d'écran pour le README (Edge ou Chrome sans fenêtre, protocole DevTools).
 *
 *   python -m http.server 8765 --bind 127.0.0.1     (dans un autre terminal)
 *   node tools/captures.js [fr|en] [dossier]        → docs/img/fr/*.png par défaut
 *
 * Un profil temporaire est utilisé : rien n'est lu ni écrit dans le profil du navigateur.
 */
"use strict";
const { spawn } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");

const LANG = process.argv[2] || "fr";
const OUT = path.resolve(process.argv[3] || path.join(__dirname, "..", "docs", "img", LANG));
const BASE = process.env.SQLLAB_URL || "http://127.0.0.1:8765/";
const PORT = 9333;
const W = 1440, H = 900;
const BROWSERS = [
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "/usr/bin/google-chrome", "/usr/bin/chromium", "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const exe = BROWSERS.find((p) => fs.existsSync(p));
  if (!exe) throw new Error("Navigateur Edge ou Chrome introuvable");
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), "sqllab-cap-"));
  const proc = spawn(exe, ["--headless=new", `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`,
    "--no-first-run", "--no-default-browser-check", "--hide-scrollbars", `--window-size=${W},${H}`, "about:blank"], { stdio: "ignore" });
  try {
    let targets;
    for (let i = 0; i < 50 && !targets; i++) {
      try { targets = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json(); } catch (e) { await sleep(200); }
    }
    const page = targets.find((t) => t.type === "page");
    const cdp = await connect(page.webSocketDebuggerUrl);
    await cdp.send("Page.enable");
    await cdp.send("Runtime.enable");
    await cdp.send("Emulation.setDeviceMetricsOverride", { width: W, height: H, deviceScaleFactor: 1, mobile: false });
    await cdp.send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-color-scheme", value: "light" }, { name: "prefers-reduced-motion", value: "reduce" }] });
    fs.mkdirSync(OUT, { recursive: true });

    const ev = async (expr) => {
      const r = await cdp.send("Runtime.evaluate", { expression: `(async () => { ${expr} })()`, awaitPromise: true, returnByValue: true });
      if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception ? r.exceptionDetails.exception.description : r.exceptionDetails.text);
      return r.result.value;
    };
    let n = 0;
    const go = async (url) => {
      // paramètre unique : rechargement complet, sans garder le défilement de la page précédente
      const [a, h] = url.split("#");
      await cdp.send("Page.navigate", { url: `${a}${a.includes("?") ? "&" : "?"}lang=${LANG}&cap=${++n}${h ? "#" + h : ""}` });
      await sleep(2200);
      await ev("window.scrollTo(0, 0);");
    };
    const sidebar = (open) => ev(`if ((document.getElementById("btnSidebar").getAttribute("aria-expanded") === "true") !== ${open}) document.getElementById("btnSidebar").click(); await new Promise(r => setTimeout(r, 300));`);
    const shot = async (name, clip) => {
      await sleep(500);
      const r = await cdp.send("Page.captureScreenshot", { format: "png", ...(clip ? { clip: { ...clip, scale: 1 } } : {}) });
      fs.writeFileSync(path.join(OUT, name + ".png"), Buffer.from(r.data, "base64"));
      console.log("✓", name);
    };
    const dialogClip = (sel) => ev(`const r = document.querySelector(${JSON.stringify(sel)}).getBoundingClientRect(); return { x: Math.max(0, r.x - 12 + scrollX), y: Math.max(0, r.y - 12 + scrollY), width: r.width + 24, height: r.height + 24 };`);

    const S = SCENES[LANG];
    // 1. vue d'une question réussie (en tête du README)
    await go(`${BASE}index.html#${S.ex}/${S.join}`);
    await ev(`const cm = document.querySelector(".CodeMirror").CodeMirror; cm.setValue(${JSON.stringify(S.joinSql)}); document.getElementById("btnRun").click(); await new Promise(r => setTimeout(r, 600));`);
    await shot("question");

    // 2. erreur diagnostiquée (jointure oubliée)
    await ev(`const cm = document.querySelector(".CodeMirror").CodeMirror; cm.setValue(${JSON.stringify(S.joinBad)}); document.getElementById("btnRun").click(); await new Promise(r => setTimeout(r, 600)); document.getElementById("feedback").scrollIntoView({ block: "center" });`);
    await shot("diagnostic");

    // 3. mode cinéma SQL
    await ev(`document.getElementById("btnCorrection").click(); await new Promise(r => setTimeout(r, 300)); document.querySelector("[data-cinema]").click(); await new Promise(r => setTimeout(r, 400));
      document.getElementById("cnNext").click(); document.getElementById("cnNext").click(); document.getElementById("cnNext").click(); await new Promise(r => setTimeout(r, 300));`);
    await shot("cinema-sql", await dialogClip("#cinemaDialog"));
    await ev(`document.getElementById("cnClose").click();`);

    // 4. date et fonctions « à la DCG »
    await go(`${BASE}index.html#${S.ex}/${S.date}`);
    await ev(`const cm = document.querySelector(".CodeMirror").CodeMirror; cm.setValue(${JSON.stringify(S.dateSql)}); document.getElementById("btnRun").click(); await new Promise(r => setTimeout(r, 600));`);
    await shot("dates");

    // 5. diagramme en grand
    await ev(`document.getElementById("btnDiagram").click(); await new Promise(r => setTimeout(r, 500));`);
    await shot("diagramme", await dialogClip("#diagramDialog"));
    await ev(`document.getElementById("dgClose").click();`);

    // 6. question schéma (éditeur)
    await go(`${BASE}index.html#${S.ex}/${S.schema}`);
    await sidebar(false);
    await shot("schema");
    // 7. construction pas à pas
    await ev(`document.getElementById("btnCorrection").click(); await new Promise(r => setTimeout(r, 300)); document.querySelector("[data-cinema]").click(); await new Promise(r => setTimeout(r, 400));
      for (let i = 0; i < ${S.schemaStep}; i++) document.getElementById("cnNext").click(); await new Promise(r => setTimeout(r, 300));`);
    await shot("cinema-schema", await dialogClip("#cinemaDialog"));
    await ev(`document.getElementById("cnClose").click();`);

    // 8. question processus : brouillon pré-rempli avec le corrigé, puis vérification
    {
      const ex = S.processEx || S.ex;
      await ev(`const qs = await (await fetch("exercices/${ex}/questions.json")).json();
        const q = qs.questions.find((x) => x.id === "${S.process}");
        localStorage.setItem("sqllab:draft:${ex}:${S.process}", JSON.stringify(q.solution));`);
      await go(`${BASE}index.html#${ex}/${S.process}`);
      await ev(`document.getElementById("btnRun").click(); await new Promise(r => setTimeout(r, 500)); window.scrollTo(0, document.querySelector(".pe-toolbar, #processEditor").getBoundingClientRect().top + scrollY - 80);`);
      await shot("processus");
      await ev(`localStorage.removeItem("sqllab:draft:${ex}:${S.process}");`);
    }

    // 9. espace enseignant
    await go(`${BASE}create.html#${S.ex}`);
    await shot("creation");
  } finally {
    proc.kill();
    await sleep(500);
    try { fs.rmSync(profile, { recursive: true, force: true }); } catch (e) { /* fichiers encore verrouillés */ }
  }
}

const SCENES = {
  fr: {
    ex: "dcg2024",
    join: "q14",
    joinSql: "SELECT DISTINCT CLIENT.IdCli, NomCli, PrenomCli, MailCli\nFROM CLIENT, DOSSIER, OFFRE\nWHERE CLIENT.IdCli = DOSSIER.IdCli\nAND DOSSIER.IdDoss = OFFRE.IdDoss\nAND AcceptationClient = 'Refusé';",
    joinBad: "SELECT DISTINCT CLIENT.IdCli, NomCli, PrenomCli, MailCli\nFROM CLIENT, DOSSIER, OFFRE\nWHERE CLIENT.IdCli = DOSSIER.IdCli\nAND AcceptationClient = 'Refusé';",
    date: "q10",
    dateSql: "SELECT IdOffre, DateEmissionOffre, TauxInteret\nFROM OFFRE\nWHERE MONTH(DateEmissionOffre) = 3\nAND YEAR(DateEmissionOffre) = 2024;",
    schema: "s01", schemaStep: 6,
    process: "p01", processEx: "dcg2025",
  },
  en: {
    ex: "demo-en",
    join: "q11",
    joinSql: ["SELECT DISTINCT LastName, FirstName", "FROM CUSTOMER, RENTAL, RENTAL_LINE, BIKE", "WHERE CUSTOMER.CustomerId = RENTAL.CustomerId",
      "AND RENTAL.RentalId = RENTAL_LINE.RentalId", "AND RENTAL_LINE.BikeId = BIKE.BikeId", "AND CategoryId = 2;"].join("\n"),
    joinBad: ["SELECT DISTINCT LastName, FirstName", "FROM CUSTOMER, RENTAL, RENTAL_LINE, BIKE", "WHERE CUSTOMER.CustomerId = RENTAL.CustomerId",
      "AND RENTAL.RentalId = RENTAL_LINE.RentalId", "AND CategoryId = 2;"].join("\n"),
    date: "q06",
    dateSql: ["SELECT RentalId, StartDate, ReturnDate", "FROM RENTAL", "WHERE MONTH(StartDate) = 4", "AND YEAR(StartDate) = 2025;"].join("\n"),
    schema: "s01", schemaStep: 6,
    process: "p01",
  },
  es: {
    ex: "demo-es",
    join: "q11",
    joinSql: ["SELECT DISTINCT Apellido, Nombre", "FROM CLIENTE, ALQUILER, LINEA_ALQUILER, BICICLETA", "WHERE CLIENTE.IdCliente = ALQUILER.IdCliente",
      "AND ALQUILER.IdAlquiler = LINEA_ALQUILER.IdAlquiler", "AND LINEA_ALQUILER.IdBicicleta = BICICLETA.IdBicicleta", "AND IdCategoria = 2;"].join("\n"),
    joinBad: ["SELECT DISTINCT Apellido, Nombre", "FROM CLIENTE, ALQUILER, LINEA_ALQUILER, BICICLETA", "WHERE CLIENTE.IdCliente = ALQUILER.IdCliente",
      "AND ALQUILER.IdAlquiler = LINEA_ALQUILER.IdAlquiler", "AND IdCategoria = 2;"].join("\n"),
    date: "q06",
    dateSql: ["SELECT IdAlquiler, FechaInicio, FechaDevolucion", "FROM ALQUILER", "WHERE MONTH(FechaInicio) = 4", "AND YEAR(FechaInicio) = 2025;"].join("\n"),
    schema: "s01", schemaStep: 6,
    process: "p01",
  },
};

function connect(url) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(url);
    let id = 0;
    const pending = new Map();
    ws.onmessage = (m) => {
      const msg = JSON.parse(m.data);
      if (msg.id && pending.has(msg.id)) {
        const { res, rej } = pending.get(msg.id);
        pending.delete(msg.id);
        if (msg.error) rej(new Error(msg.error.message)); else res(msg.result);
      }
    };
    ws.onerror = reject;
    ws.onopen = () => resolve({
      send: (method, params = {}) => new Promise((res, rej) => { const k = ++id; pending.set(k, { res, rej }); ws.send(JSON.stringify({ id: k, method, params })); }),
    });
  });
}

module.exports = { SCENES };
if (require.main === module) main().catch((e) => { console.error(e); process.exit(1); });
