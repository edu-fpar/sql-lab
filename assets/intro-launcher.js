/* SQL Lab – vidéo de présentation (intro.html) dans l'application.
 *
 * - Bouton « 🎬 Intro » dans le bandeau, à côté de l'aide : revoir la vidéo à tout moment.
 * - Première visite : la vidéo s'ouvre d'elle-même, une seule fois (clé sqllab:introSeen).
 *   Jamais quand on arrive par un lien précis (#exercice/question, ?pack=, ?exercice=),
 *   ni dans un paquet SCORM, ni avec ?intro=0, ni sous un navigateur piloté (captures).
 * - La vidéo est affichée dans une iframe (intro.html?embed=app) ; elle demande sa fermeture
 *   par postMessage ({ sqllab: "intro-close" }) : bouton « Passer », « Commencer » ou Échap.
 */
(function (global) {
  "use strict";
  const CONFIG = global.SQLLAB_CONFIG || {};
  if (CONFIG.scorm || CONFIG.locked) return; // intro.html n'est pas dans les paquets SCORM

  const I18N = global.I18N;
  const t = (s) => (I18N && I18N.t ? I18N.t(s) : s);
  if (I18N && I18N.add) {
    I18N.add({ "🎬 Intro": "🎬 Intro", "Revoir la vidéo de présentation": "Watch the introduction video again", "Vidéo de présentation": "Introduction video" });
    I18N.add({ "🎬 Intro": "🎬 Intro", "Revoir la vidéo de présentation": "Volver a ver el vídeo de presentación", "Vidéo de présentation": "Vídeo de presentación" }, "es");
  }
  const KEY = "sqllab:introSeen";
  let overlay = null, opener = null;

  function open(from) {
    if (overlay) return;
    opener = from || document.activeElement;
    try { global.localStorage.setItem(KEY, "1"); } catch (e) { /* stockage indisponible */ }
    overlay = document.createElement("div");
    overlay.className = "intro-overlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-label", t("Vidéo de présentation"));
    overlay.style.cssText = "position:fixed;inset:0;z-index:10000;background:rgba(7,18,38,.96)";
    const frame = document.createElement("iframe");
    frame.src = "intro.html?embed=app&lang=" + encodeURIComponent((I18N && I18N.lang) || "fr");
    frame.title = t("Vidéo de présentation");
    frame.allow = "autoplay; fullscreen";
    frame.style.cssText = "width:100%;height:100%;border:0;display:block;background:transparent";
    overlay.appendChild(frame);
    document.body.appendChild(overlay);
    document.documentElement.style.overflow = "hidden";
    frame.addEventListener("load", () => { try { frame.contentWindow.focus(); } catch (e) { /* rien */ } });
  }

  function close() {
    if (!overlay) return;
    overlay.remove(); overlay = null;
    document.documentElement.style.overflow = "";
    if (opener && opener.focus) opener.focus();
  }

  global.addEventListener("message", (e) => {
    if (e.origin === global.location.origin && e.data && e.data.sqllab === "intro-close") close();
  });
  global.addEventListener("keydown", (e) => { if (overlay && e.key === "Escape") close(); });

  function addButton() {
    const docs = document.getElementById("btnDocs");
    if (!docs || document.getElementById("btnIntro")) return;
    const b = document.createElement("button");
    b.type = "button"; b.id = "btnIntro"; b.className = "btn small ghost";
    b.textContent = t("🎬 Intro");
    b.title = t("Revoir la vidéo de présentation");
    b.addEventListener("click", () => open(b));
    docs.parentNode.insertBefore(b, docs);
  }

  function shouldAutoOpen() {
    try { if (global.localStorage.getItem(KEY)) return false; } catch (e) { return false; }
    if (global.navigator.webdriver) return false;
    if (global.location.hash && global.location.hash.length > 1) return false;
    const p = new URLSearchParams(global.location.search);
    return !(p.has("pack") || p.has("exercice") || p.has("cap") || p.get("intro") === "0");
  }

  function start() { addButton(); if (shouldAutoOpen()) open(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();

  global.SQLLabIntro = { open, close };
})(window);
