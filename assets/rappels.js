/* SQL Lab – rappels de cours, très visuels, à côté de chaque grand thème de questions.
 *
 * Trois formes, colorées par thème :
 *  - « processus » : chevrons numérotés (type SmartArt), chaque étape se déplie au clic ;
 *  - « pétales » : une notion au centre, ses variantes ou subtilités en pétales cliquables ;
 *  - « pièges » : à ne pas écrire / à écrire.
 * Bouton « Tout déplier » : toutes les étapes et tous les pétales ouverts d'un coup.
 * Contenu : assets/rappels-data.js (français et anglais).
 */
(function (global) {
  "use strict";

  const I18N = global.I18N || { lang: "fr", add() {}, t: (s) => s };
  const tr = I18N.t;
  I18N.add({
    "Rappel de cours": "Course reminder",
    "Rappel de cours : {titre}": "Course reminder: {titre}",
    "Tout déplier": "Expand all",
    "Tout replier": "Collapse all",
    "Fermer": "Close",
    "Autres rappels": "Other reminders",
    "Cliquez sur une étape pour la déplier.": "Click a step to expand it.",
    "Cliquez sur un pétale pour voir la subtilité.": "Click a petal to see the detail.",
    "À éviter": "Avoid",
    "À écrire": "Write instead",
    "Pièges classiques": "Classic pitfalls",
  });

  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const KW = /\b(SELECT|DISTINCT|FROM|WHERE|AND|OR|NOT|IN|EXISTS|BETWEEN|LIKE|IS|NULL|AS|ORDER BY|GROUP BY|HAVING|ASC|DESC|INNER JOIN|LEFT JOIN|JOIN|ON|COUNT|SUM|AVG|MIN|MAX|YEAR|MONTH|DAY|DATEDIFF|NOW|CURDATE|INSERT INTO|VALUES|UPDATE|SET|DELETE FROM)\b/g;
  /** Coloration SQL minimale (le texte est échappé avant) */
  function sql(code) {
    return esc(code).replace(/('[^']*')/g, "\u0001$1\u0002").split(/(\u0001[^\u0002]*\u0002)/).map((part) =>
      part.startsWith("\u0001") ? `<span class="rp-str">${part.slice(1, -1)}</span>` : part.replace(KW, '<span class="rp-kw">$1</span>')).join("");
  }
  const codeBlock = (c) => (c ? `<pre class="rp-code"><code>${sql(c)}</code></pre>` : "");

  // ----------------------------------------------------------- correspondance thème → rappel
  const MATCH = [
    [/auto-?jointure|self-?join|autocombinaci/i, "autojointure"],
    [/regroupement|grouping|agrupaci/i, "groupes"],
    [/jointure|join|combinaci/i, "jointures"],
    [/sous-requ|subquer|subconsult/i, "sousrequetes"],
    [/agr[ée]gat|calcul|c[aá]lculo|aggregate|agregado/i, "agregats"],
    [/mise.? à jour|\bupdates?\b|actualizaci/i, "majs"], // avant les dates : « Updates » contient « date »
    [/\bdates?\b|fecha/i, "dates"],
    [/sch[ée]ma|esquema/i, "schema"],
    [/processus|process|proceso/i, "processus"],
    [/une seule table|single table|una sola tabla/i, "table"],
  ];
  function idFor(theme) {
    for (const [re, id] of MATCH) if (re.test(theme || "")) return id;
    return null;
  }

  function data() {
    const D = global.SQLRappelsData || {};
    return D[I18N.lang] || D.fr || {};
  }

  // ----------------------------------------------------------- rendu des blocs
  function renderProcess(b, k) {
    const steps = b.etapes.map((s, i) =>
      `<button type="button" class="rp-chev" data-step="${k}-${i}" aria-expanded="false" style="--n:${i}">` +
      `<span class="rp-num">${i + 1}</span><span class="rp-lab">${esc(s.label)}</span></button>`).join("");
    const panels = b.etapes.map((s, i) =>
      `<div class="rp-panel" data-panel="${k}-${i}" hidden><h4><span class="rp-num">${i + 1}</span>${esc(s.label)}</h4>` +
      `<p>${s.detail}</p>${codeBlock(s.code)}</div>`).join("");
    return `<section class="rp-block rp-process"><h3>${esc(b.titre)}</h3><p class="rp-hint">${tr("Cliquez sur une étape pour la déplier.")}</p>` +
      `<div class="rp-chevrons" style="--count:${b.etapes.length}">${steps}</div><div class="rp-panels">${panels}</div></section>`;
  }

  function renderPetals(b, k) {
    const n = b.petales.length;
    const petals = b.petales.map((p, i) => {
      const a = (360 / n) * i - 90;
      return `<button type="button" class="rp-petal" data-step="${k}-${i}" aria-expanded="false" style="--a:${a}deg;--h:${(i * 360) / n}">` +
        `<span>${esc(p.label)}</span></button>`;
    }).join("");
    const panels = b.petales.map((p, i) =>
      `<div class="rp-panel rp-panel-petal" data-panel="${k}-${i}" hidden style="--h:${(i * 360) / n}"><h4>${esc(p.label)}</h4>` +
      `<p>${p.detail}</p>${codeBlock(p.code)}</div>`).join("");
    return `<section class="rp-block rp-petals-block"><h3>${esc(b.titre)}</h3><p class="rp-hint">${tr("Cliquez sur un pétale pour voir la subtilité.")}</p>` +
      `<div class="rp-flower-wrap"><div class="rp-flower" style="--count:${n}">${petals}<div class="rp-core">${esc(b.centre)}</div></div>` +
      `<div class="rp-panels rp-panels-petals">${panels}</div></div></section>`;
  }

  function renderPitfalls(b) {
    const items = b.items.map((p) =>
      `<div class="rp-pit"><p class="rp-pit-title"><i class="i i-triangle-alert" aria-hidden="true"></i> ${esc(p.titre)}</p>` +
      `<div class="rp-pit-pair"><div class="rp-bad"><span>${tr("À éviter")}</span>${codeBlock(p.faux)}</div>` +
      `<div class="rp-good"><span>${tr("À écrire")}</span>${codeBlock(p.juste)}</div></div>` +
      (p.note ? `<p class="rp-note">${p.note}</p>` : "") + "</div>").join("");
    return `<section class="rp-block rp-pitfalls"><h3>${esc(b.titre || tr("Pièges classiques"))}</h3><div class="rp-pits">${items}</div></section>`;
  }

  function renderBody(r) {
    return (r.intro ? `<p class="rp-intro">${r.intro}</p>` : "") + r.blocs.map((b, k) =>
      b.type === "process" ? renderProcess(b, k) : b.type === "petales" ? renderPetals(b, k) : renderPitfalls(b)).join("");
  }

  // ----------------------------------------------------------- boîte de dialogue
  let dlg = null;
  function ensureDialog() {
    if (dlg) return dlg;
    dlg = document.createElement("dialog");
    dlg.className = "rappel-dialog";
    dlg.setAttribute("aria-labelledby", "rpTitle");
    dlg.innerHTML = `<div class="rp-head"><span class="rp-icon"><i class="i i-lightbulb" aria-hidden="true"></i></span>` +
      `<h2 id="rpTitle"></h2><span class="spacer"></span>` +
      `<button class="btn small" type="button" data-rp-all aria-pressed="false"></button>` +
      `<button class="btn small primary" type="button" data-rp-close>${esc(tr("Fermer"))}</button></div>` +
      `<nav class="rp-nav" aria-label="${esc(tr("Autres rappels"))}"></nav><div class="rp-body"></div>`;
    document.body.appendChild(dlg);
    dlg.addEventListener("click", (e) => {
      if (e.target === dlg) { dlg.close(); return; } // clic sur le fond
      if (e.target.closest("[data-rp-close]")) { dlg.close(); return; }
      const nav = e.target.closest("[data-rp-go]");
      if (nav) { show(nav.dataset.rpGo); return; }
      if (e.target.closest("[data-rp-all]")) { setAll(!dlg.classList.contains("rp-all")); return; }
      const step = e.target.closest("[data-step]");
      if (step) toggleStep(step);
    });
    return dlg;
  }

  function toggleStep(btn) {
    const key = btn.dataset.step;
    const block = btn.closest(".rp-block");
    const open = btn.getAttribute("aria-expanded") !== "true";
    if (!dlg.classList.contains("rp-all")) {
      // un seul panneau ouvert par bloc (sauf en « tout déplier »)
      block.querySelectorAll("[data-step]").forEach((b) => b.setAttribute("aria-expanded", "false"));
      block.querySelectorAll("[data-panel]").forEach((p) => { p.hidden = true; });
    }
    btn.setAttribute("aria-expanded", String(open));
    block.querySelector(`[data-panel="${key}"]`).hidden = !open;
  }

  function setAll(on) {
    dlg.classList.toggle("rp-all", on);
    const b = dlg.querySelector("[data-rp-all]");
    b.innerHTML = `<i class="i i-${on ? "minus" : "plus"}" aria-hidden="true"></i> ${esc(on ? tr("Tout replier") : tr("Tout déplier"))}`;
    b.setAttribute("aria-pressed", String(on));
    dlg.querySelectorAll("[data-step]").forEach((s) => s.setAttribute("aria-expanded", String(on)));
    dlg.querySelectorAll("[data-panel]").forEach((p) => { p.hidden = !on; });
  }

  function show(id) {
    const all = data();
    const r = all[id];
    if (!r) return false;
    ensureDialog();
    dlg.style.setProperty("--rp", r.couleur);
    dlg.querySelector("#rpTitle").textContent = r.titre;
    dlg.querySelector(".rp-nav").innerHTML = Object.entries(all).map(([k, x]) =>
      `<button type="button" class="rp-chip${k === id ? " on" : ""}" data-rp-go="${k}" style="--c:${x.couleur}"${k === id ? ' aria-current="true"' : ""}>${esc(x.court || x.titre)}</button>`).join("");
    const body = dlg.querySelector(".rp-body");
    body.innerHTML = renderBody(r);
    body.scrollTop = 0;
    setAll(false);
    if (!dlg.open) dlg.showModal();
    return true;
  }

  /** Bouton à placer à côté d'un thème ; renvoie "" si le thème n'a pas de rappel */
  function button(theme) {
    const id = idFor(theme);
    if (!id || !data()[id]) return "";
    const label = tr("Rappel de cours : {titre}", { titre: data()[id].titre });
    return `<button type="button" class="rappel-btn" data-rappel="${id}" title="${esc(label)}" aria-label="${esc(label)}" style="--rp:${data()[id].couleur}"><i class="i i-lightbulb" aria-hidden="true"></i></button>`;
  }

  // délégation : tout bouton [data-rappel] de la page ouvre son rappel
  if (typeof document !== "undefined") {
    document.addEventListener("click", (e) => {
      const b = e.target.closest && e.target.closest("[data-rappel]");
      if (!b) return;
      e.preventDefault();
      e.stopPropagation();
      show(b.dataset.rappel);
    }, true);
  }

  global.SQLRappels = { show, button, idFor, sql };
})(typeof window !== "undefined" ? window : globalThis);
