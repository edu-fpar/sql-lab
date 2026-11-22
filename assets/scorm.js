/* SQL Lab – liaison avec une plateforme (Moodle…) via l'API SCORM 1.2.
 * Le paquet SCORM ouvre index.html dans une fenêtre ou un cadre de la plateforme,
 * qui expose un objet « API » dans une fenêtre parente.
 */
(function (global) {
  "use strict";

  function findApi(win) {
    for (let i = 0; win && i < 12; i++) {
      try {
        if (win.API) return win.API;
      } catch (e) { return null; } // autre domaine
      if (win.parent === win) break;
      win = win.parent;
    }
    return null;
  }

  function hhmmss(ms) {
    const s = Math.max(0, Math.round(ms / 1000));
    const p = (n) => String(n).padStart(2, "0");
    return `${p(Math.floor(s / 3600))}:${p(Math.floor((s % 3600) / 60))}:${p(s % 60)}`;
  }

  const Scorm = {
    api: null,
    started: 0,
    finished: false,
    interactions: 0,

    /** Démarre la session ; renvoie true si une plateforme répond */
    connect() {
      this.api = findApi(global) || (global.opener ? findApi(global.opener) : null);
      if (!this.api) return false;
      const ok = String(this.api.LMSInitialize("")) === "true";
      if (!ok) { this.api = null; return false; }
      this.started = Date.now();
      const n = parseInt(this.get("cmi.interactions._count"), 10);
      this.interactions = Number.isFinite(n) ? n : 0;
      if (this.get("cmi.core.lesson_status") === "not attempted") this.set("cmi.core.lesson_status", "incomplete");
      global.addEventListener("pagehide", () => this.finish());
      global.addEventListener("beforeunload", () => this.finish());
      return true;
    },
    get(k) { return this.api ? String(this.api.LMSGetValue(k) || "") : ""; },
    set(k, v) { if (this.api) this.api.LMSSetValue(k, String(v)); },
    commit() { if (this.api) this.api.LMSCommit(""); },
    learnerName() { return this.get("cmi.core.student_name"); },

    /** Progression mémorisée par la plateforme : { s: [ids réussis], q: question en cours } */
    loadState() {
      let data = {};
      try { data = JSON.parse(this.get("cmi.suspend_data") || "{}"); } catch (e) { data = {}; }
      return { solved: Array.isArray(data.s) ? data.s : [], current: data.q || this.get("cmi.core.lesson_location") || "" };
    },

    /**
     * Enregistre la progression et le score.
     * seuil : pourcentage à atteindre pour « passed » (facultatif)
     */
    saveProgress({ solved, total, current, seuil }) {
      if (!this.api) return;
      const score = total ? Math.round((100 * solved.length) / total) : 0;
      this.set("cmi.core.score.min", 0);
      this.set("cmi.core.score.max", 100);
      this.set("cmi.core.score.raw", score);
      let status = "incomplete";
      if (seuil && score >= seuil) status = "passed";
      else if (solved.length >= total && total) status = seuil ? "passed" : "completed";
      this.set("cmi.core.lesson_status", status);
      // SCORM 1.2 : suspend_data limité à 4096 caractères
      let data = JSON.stringify({ s: solved, q: current });
      while (data.length > 4000 && solved.length) { solved = solved.slice(1); data = JSON.stringify({ s: solved, q: current }); }
      this.set("cmi.suspend_data", data);
      if (current) this.set("cmi.core.lesson_location", String(current).slice(0, 255));
      this.commit();
      return score;
    },

    /** Trace d'une réponse juste (rapport détaillé de la plateforme) */
    recordInteraction(qid, answer) {
      if (!this.api) return;
      const n = this.interactions++;
      const p = `cmi.interactions.${n}.`;
      this.set(p + "id", String(qid).replace(/[^\w.-]/g, "_").slice(0, 255));
      this.set(p + "type", "performance");
      this.set(p + "student_response", String(answer).replace(/\s+/g, " ").slice(0, 255));
      this.set(p + "result", "correct");
      const d = new Date();
      this.set(p + "time", `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`);
    },

    setLocation(qid) {
      if (this.api && qid) this.set("cmi.core.lesson_location", String(qid).slice(0, 255));
    },

    finish() {
      if (!this.api || this.finished) return;
      this.finished = true;
      this.set("cmi.core.session_time", hhmmss(Date.now() - this.started));
      this.set("cmi.core.exit", "suspend");
      this.commit();
      this.api.LMSFinish("");
    },
  };

  global.SQLScorm = Scorm;
})(window);
