/* SQL Lab – icônes (Lucide, lib/lucide/icons.css) à la place des symboles et emojis.
 *
 * Les textes de l'interface (et leurs traductions) gardent un symbole simple (▶, ✎, ✕…) ;
 * ce module le remplace à l'affichage par une icône vectorielle, partout et en continu
 * (MutationObserver), sans toucher aux clés de traduction. Seuls sont concernés un symbole
 * seul, en début ou en fin de texte ; le contenu des exercices, le code et les listes
 * déroulantes ne sont pas modifiés.
 */
(function (global) {
  "use strict";

  // symbole → icône ; une fonction choisit selon la position ou le contexte
  const MAP = {
    "▶": (pos) => (pos === "end" ? "chevron-right" : "play"),
    "⏵": "play", "⏸": "pause", "⏮": "skip-back", "◀": "chevron-left",
    "✓": "check", "✗": "circle-x", "⚠": "triangle-alert", "✎": "pencil-line", "✕": "x",
    "◫": "table-2",
    "⇄": (pos, el) => (el.closest(".se-main, .se-toolbar, .se-inspector, .se-cols") ? "arrow-left-right" : "workflow"),
    "↑": "arrow-up", "↓": (pos, el, rest) => (/^(PNG|SVG)/.test(rest) ? "download" : "arrow-down"), "↺": "rotate-ccw", "⟲": "rotate-ccw", "⤢": "maximize-2",
    "◯": "circle", "▭": "rectangle-horizontal", "⏢": "trapezoid",
    "☰": "menu", "▾": "chevron-down", "★": "star", "＋": "plus", "−": "minus", "⏎": "corner-down-left",
    "🎬": "clapperboard", "📖": "book-open",
  };
  // « + » seul n'est remplacé que dans un bouton-icône (zoom), jamais dans un texte
  const ICON_ONLY = { "+": "plus" };
  const GLYPHS = Object.keys(MAP);
  const SKIP = "code, pre, textarea, select, option, script, style, svg, title, .CodeMirror, [contenteditable], .no-icons, .q-text, .grid, .table-wrap";

  function iconFor(g, pos, el, rest) {
    const v = MAP[g] || (pos === "only" && el.closest(".icon-btn") ? ICON_ONLY[g] : null);
    return typeof v === "function" ? v(pos, el, rest || "") : v;
  }

  function make(name) {
    const i = document.createElement("i");
    i.className = "i i-" + name;
    i.setAttribute("aria-hidden", "true");
    return i;
  }

  function decorateText(node) {
    const el = node.parentElement;
    if (!el || el.closest(SKIP)) return;
    const raw = node.nodeValue;
    const t = raw.trim();
    if (!t) return;
    const first = [...t][0], last = [...t].pop();
    let name, rest, pos;
    if ((MAP[first] || ICON_ONLY[first]) && [...t].length === 1) { pos = "only"; name = iconFor(first, pos, el); rest = ""; }
    else if (MAP[first] && /\s/.test(t.slice(first.length, first.length + 1))) { pos = "start"; rest = t.slice(first.length).trim(); name = iconFor(first, pos, el, rest); }
    else if (MAP[last] && /\s/.test(t.slice(-last.length - 1, -last.length))) { pos = "end"; rest = t.slice(0, -last.length).trim(); name = iconFor(last, pos, el, rest); }
    if (!name) return;
    const frag = document.createDocumentFragment();
    const lead = /^\s/.test(raw) ? " " : "", trail = /\s$/.test(raw) ? " " : "";
    if (lead) frag.appendChild(document.createTextNode(lead));
    if (pos === "end") {
      frag.appendChild(document.createTextNode(rest + " "));
      frag.appendChild(make(name));
    } else {
      frag.appendChild(make(name));
      if (rest) frag.appendChild(document.createTextNode(" " + rest));
    }
    if (trail) frag.appendChild(document.createTextNode(trail));
    // bouton réduit à une icône : il lui faut un nom accessible
    const btn = el.closest("button, a, label");
    if (pos === "only" && btn && !btn.getAttribute("aria-label") && btn.title) btn.setAttribute("aria-label", btn.title);
    node.replaceWith(frag);
  }

  function decorate(root) {
    if (!root) return;
    if (root.nodeType === 3) { decorateText(root); return; }
    if (root.nodeType !== 1 || (root.closest && root.closest(SKIP))) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: (n) => (GLYPHS.some((g) => n.nodeValue.includes(g)) || /^\s*\+\s*$/.test(n.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP),
    });
    const list = [];
    while (walker.nextNode()) list.push(walker.currentNode);
    list.forEach(decorateText);
  }

  function start() {
    decorate(document.body);
    new MutationObserver((muts) => {
      for (const m of muts) {
        if (m.type === "characterData") decorate(m.target);
        else m.addedNodes.forEach(decorate);
      }
    }).observe(document.body, { childList: true, subtree: true, characterData: true });
  }

  global.SQLIcons = { decorate, MAP };
  if (typeof document !== "undefined") {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
    else start();
  }
})(typeof window !== "undefined" ? window : globalThis);
