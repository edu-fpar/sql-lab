/* SQL Lab – traduction de l'interface (français par défaut, anglais, espagnol).
 *
 * Principe : la chaîne française sert de clé. Chaque module enregistre ses traductions
 * avec I18N.add({ "Texte français {n}": "English text {n}" }) (anglais) ou I18N.add({…}, "es") et écrit ses textes avec
 * I18N.t("Texte français {n}", { n: 3 }). Sans traduction, le français est affiché.
 * Le HTML statique est traduit par I18N.dom(racine) : nœuds de texte et attributs
 * (title, aria-label, placeholder, alt) dont le contenu correspond exactement à une clé.
 *
 * Langue : ?lang=en|fr|es dans l'adresse (mémorisée), sinon SQLLAB_CONFIG.lang (paquet SCORM),
 * sinon le dernier choix, sinon la langue du navigateur.
 * Les bases et les questions ne sont pas traduites : un exercice indique sa langue
 * avec "langue": "en" dans le catalogue.
 */
(function (global) {
  "use strict";

  const SUPPORTED = ["fr", "en", "es"];
  const NAMES = { fr: "Français", en: "English", es: "Español" };
  const KEY = "sqllab:lang";
  const dicts = { en: {}, es: {} }; // clé = texte français
  const cur = () => dicts[I18N.lang] || {};

  function detect() {
    try {
      const u = new URLSearchParams(global.location ? global.location.search : "").get("lang");
      if (u && SUPPORTED.includes(u)) {
        try { global.localStorage.setItem(KEY, JSON.stringify(u)); } catch (e) { /* stockage indisponible */ }
        return u;
      }
    } catch (e) { /* hors navigateur */ }
    const cfg = global.SQLLAB_CONFIG && global.SQLLAB_CONFIG.lang;
    if (cfg && SUPPORTED.includes(cfg)) return cfg;
    try {
      const s = JSON.parse(global.localStorage.getItem(KEY));
      if (s && SUPPORTED.includes(s)) return s;
    } catch (e) { /* stockage indisponible */ }
    const nav = (global.navigator && (global.navigator.language || "")) || "fr";
    if (/^es\b/i.test(nav)) return "es";
    return /^fr\b/i.test(nav) || !nav ? "fr" : "en";
  }

  const I18N = {
    lang: "fr",
    supported: SUPPORTED,

    supportedNames: NAMES,

    /** Ajoute des traductions : { "clé française": "traduction" } ; langue anglaise par défaut */
    add(entries, lang = "en") { Object.assign(dicts[lang] || (dicts[lang] = {}), entries); },

    /** Traduit une chaîne ; {nom} est remplacé par vars.nom (non échappé) */
    t(fr, vars) {
      let s = I18N.lang !== "fr" && Object.prototype.hasOwnProperty.call(cur(), fr) ? cur()[fr] : fr;
      if (vars) s = s.replace(/\{(\w+)\}/g, (m, k) => (vars[k] !== undefined ? vars[k] : m));
      return s;
    },

    /** Choix singulier / pluriel, déjà traduit : I18N.n(3, "{n} ligne", "{n} lignes") */
    n(count, one, many, vars) {
      return I18N.t(count > 1 ? many : one, { n: count, ...(vars || {}) });
    },

    has(fr) { return Object.prototype.hasOwnProperty.call(cur(), fr); },

    /** Traduit le HTML statique d'une racine (document par défaut) */
    dom(root) {
      if (I18N.lang === "fr" || typeof document === "undefined") return;
      root = root || document.documentElement;
      if (root === document.documentElement) document.documentElement.lang = I18N.lang;
      const skip = (el) => el && el.closest && el.closest("script, style, code, pre, textarea, .CodeMirror, [data-no-i18n]");
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      const nodes = [];
      while (walker.nextNode()) nodes.push(walker.currentNode);
      for (const n of nodes) {
        const raw = n.nodeValue;
        const key = raw.replace(/\s+/g, " ").trim();
        if (!key || skip(n.parentElement) || !I18N.has(key)) continue;
        const lead = /^\s/.test(raw) ? " " : "", trail = /\s$/.test(raw) ? " " : "";
        n.nodeValue = lead + cur()[key] + trail;
      }
      const els = root.querySelectorAll ? root.querySelectorAll("[title], [aria-label], [placeholder], [alt]") : [];
      for (const el of [root, ...els]) {
        if (!el.getAttribute || skip(el)) continue;
        for (const a of ["title", "aria-label", "placeholder", "alt"]) {
          const v = el.getAttribute(a);
          if (v && I18N.has(v.trim())) el.setAttribute(a, cur()[v.trim()]);
        }
      }
      if (root === document.documentElement && I18N.has(document.title)) document.title = cur()[document.title];
    },

    /** Change de langue (rechargement de la page, l'ancre est conservée) */
    set(lang) {
      if (!SUPPORTED.includes(lang)) return;
      try { global.localStorage.setItem(KEY, JSON.stringify(lang)); } catch (e) { /* stockage indisponible */ }
      const u = new URL(global.location.href);
      u.searchParams.set("lang", lang);
      global.location.href = u.toString();
    },

    /** Remplace le bouton de langue par un petit sélecteur FR / EN / ES (même id, même classe) */
    toggle(button) {
      if (!button) return;
      const sel = document.createElement("select");
      sel.id = button.id;
      sel.className = (button.className || "") + " lang-select";
      sel.title = "Langue · Language · Idioma";
      sel.setAttribute("aria-label", sel.title);
      for (const l of SUPPORTED) {
        const o = document.createElement("option");
        o.value = l;
        o.textContent = l.toUpperCase();
        o.title = NAMES[l];
        o.lang = l;
        if (l === I18N.lang) o.selected = true;
        sel.appendChild(o);
      }
      sel.addEventListener("change", () => I18N.set(sel.value));
      button.replaceWith(sel);
    },
  };

  I18N.lang = detect();
  global.I18N = I18N;
  if (typeof module !== "undefined" && module.exports) module.exports = I18N;
})(typeof window !== "undefined" ? window : globalThis);
