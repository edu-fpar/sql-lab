/* SQL Lab – comparaison du résultat de l'étudiant avec le résultat attendu.
 * Tolérances : noms/alias de colonnes ignorés, ordre des colonnes libre,
 * colonnes supplémentaires acceptées (signalées), nombres arrondis à 2 décimales,
 * casse et espaces des textes ignorés. L'ordre des lignes n'est vérifié que si
 * la question l'exige (ORDER BY demandé).
 */
(function (global) {
  "use strict";

  function norm(v) {
    if (v === null || v === undefined) return "∅";
    if (typeof v === "number") return String(Math.round(v * 100) / 100);
    if (v instanceof Uint8Array) return "[blob]";
    const s = String(v).trim();
    if (/^-?\d+(\.\d+)?$/.test(s)) return String(Math.round(parseFloat(s) * 100) / 100);
    return s.toLowerCase();
  }

  const rowKey = (row, cols) => JSON.stringify(cols.map((c) => norm(row[c])));
  const colSig = (rows, c) => JSON.stringify(rows.map((r) => norm(r[c])).sort());

  function countMap(keys) {
    const m = new Map();
    for (const k of keys) m.set(k, (m.get(k) || 0) + 1);
    return m;
  }

  /** Lignes présentes dans a et absentes de b (au sens multi-ensemble) */
  function minus(aKeys, bKeys) {
    const b = countMap(bKeys);
    const out = [];
    aKeys.forEach((k, i) => {
      const c = b.get(k) || 0;
      if (c > 0) b.set(k, c - 1);
      else out.push(i);
    });
    return out;
  }

  /**
   * Cherche, pour chaque colonne attendue, une colonne de l'étudiant ayant
   * exactement le même contenu. Renvoie le tableau d'indices ou null.
   */
  function mapColumns(exp, got) {
    const used = new Set();
    const mapping = [];
    for (let j = 0; j < exp.columns.length; j++) {
      const sig = colSig(exp.values, j);
      let found = -1;
      if (j < got.columns.length && !used.has(j) && colSig(got.values, j) === sig) found = j;
      for (let k = 0; found < 0 && k < got.columns.length; k++) {
        if (!used.has(k) && colSig(got.values, k) === sig) found = k;
      }
      if (found < 0) return null;
      used.add(found);
      mapping.push(found);
    }
    return mapping;
  }

  /**
   * @param exp {columns, values} résultat attendu
   * @param got {columns, values} résultat de l'étudiant
   * @param opts {ordered: bool}
   * @returns {ok: bool, level: 'ok'|'partial'|'ko', messages: string[], notes: string[]}
   */
  function compareResults(exp, got, opts = {}) {
    const messages = [];
    const notes = [];
    const nE = exp.values.length, nG = got.values.length;
    const cE = exp.columns.length, cG = got.columns.length;
    const allE = [...Array(cE).keys()];

    // 1. correspondance exacte des colonnes (quel que soit leur ordre)
    const mapping = mapColumns(exp, got);
    if (mapping) {
      const expKeys = exp.values.map((r) => rowKey(r, allE));
      const gotKeys = got.values.map((r) => rowKey(r, mapping));
      if (cG > cE) notes.push(`Votre résultat contient ${cG - cE} colonne(s) de plus que demandé : ce n'est pas une erreur, mais tenez-vous en à ce qui est demandé.`);
      if (mapping.some((k, j) => k !== j)) notes.push("Les colonnes ne sont pas dans le même ordre que dans l'énoncé.");
      if (minus(expKeys, gotKeys).length || minus(gotKeys, expKeys).length) {
        return {
          ok: false, level: "partial", notes,
          messages: ["Chaque colonne contient les bonnes valeurs, mais elles ne sont pas associées correctement ligne par ligne (jointure ou regroupement à revoir)."],
        };
      }
      if (opts.ordered) {
        // ordered : true (toutes les colonnes) ou liste des colonnes attendues
        // sur lesquelles porte le tri (les ex æquo peuvent alors être dans n'importe quel ordre)
        const oc = Array.isArray(opts.ordered) ? opts.ordered : allE;
        const same = exp.values.every((r, i) =>
          rowKey(r, oc) === rowKey(got.values[i], oc.map((j) => mapping[j])));
        if (!same) {
          return {
            ok: false, level: "partial", notes,
            messages: ["Les bonnes lignes sont là, mais pas dans le bon ordre. Vérifiez votre ORDER BY (colonne de tri, ordre croissant ASC ou décroissant DESC)."],
          };
        }
      }
      return { ok: true, level: "ok", messages: [], notes };
    }

    // 2. diagnostic
    if (nG === 0 && nE > 0) {
      messages.push(`Votre requête ne renvoie aucune ligne alors qu'on en attend ${nE}. Une condition du WHERE est sans doute trop restrictive (valeur mal orthographiée, mauvais format de date, mauvaise colonne…).`);
      return { ok: false, level: "ko", messages, notes };
    }
    if (nE === 0 && nG > 0) {
      messages.push(`On attend un résultat vide, votre requête renvoie ${nG} ligne(s). Il manque une condition.`);
      return { ok: false, level: "ko", messages, notes };
    }

    if (cG < cE) {
      messages.push(`Votre résultat a ${cG} colonne(s), on en attend ${cE} : ${exp.columns.join(", ")}.`);
    } else if (cG > cE) {
      messages.push(`Votre résultat a ${cG} colonnes, on en attend ${cE}.`);
    }

    if (nG !== nE) {
      messages.push(`Votre résultat a ${nG} ligne(s), on en attend ${nE}.`);
      // doublons : mêmes lignes distinctes ?
      const common = Math.min(cE, cG);
      const idx = [...Array(common).keys()];
      const uniqG = new Set(got.values.map((r) => rowKey(r, idx)));
      const uniqE = new Set(exp.values.map((r) => rowKey(r, idx)));
      if (nG > nE && uniqG.size === nE && uniqE.size === nE) {
        messages.push("Certaines lignes apparaissent plusieurs fois : pensez à SELECT DISTINCT (ou à un GROUP BY).");
      } else if (nG > nE * 3 && nE > 0) {
        messages.push("Beaucoup trop de lignes : avez-vous oublié une condition de jointure ? Sans elle, chaque ligne d'une table est associée à toutes les lignes de l'autre (produit cartésien).");
      } else if (nG > nE) {
        messages.push("Trop de lignes : il manque probablement une condition (WHERE ou HAVING), ou un regroupement.");
      } else {
        messages.push("Pas assez de lignes : une condition est peut-être trop restrictive, ou une jointure élimine des lignes.");
      }
    } else if (cG >= cE) {
      // même nombre de lignes : quelles colonnes diffèrent ?
      const wrong = [];
      for (let j = 0; j < cE; j++) {
        const sig = colSig(exp.values, j);
        let ok = false;
        for (let k = 0; k < cG && !ok; k++) ok = colSig(got.values, k) === sig;
        if (!ok) wrong.push(exp.columns[j]);
      }
      if (wrong.length) {
        messages.push(`Le nombre de lignes est bon, mais les valeurs ne correspondent pas pour : ${wrong.join(", ")}.`);
        messages.push("Vérifiez le calcul ou la colonne choisie, et les conditions de filtre.");
      } else {
        messages.push("Les colonnes contiennent les bonnes valeurs, mais elles ne sont pas associées correctement ligne par ligne (jointure ou regroupement à revoir).");
      }
    }
    return { ok: false, level: "ko", messages, notes };
  }

  /**
   * Comparaison d'état après une requête de modification.
   * before / exp / got : {columns, values} de la requête de vérification
   * (avant, après correction, après requête de l'étudiant).
   */
  function compareStates(before, exp, got) {
    const all = [...Array(exp.columns.length).keys()];
    const kB = before.values.map((r) => rowKey(r, all));
    const kE = exp.values.map((r) => rowKey(r, all));
    const kG = got.values.map((r) => rowKey(r, all));
    const missing = minus(kE, kG); // attendues mais absentes chez l'étudiant
    const extra = minus(kG, kE);   // présentes chez l'étudiant mais pas attendues
    const changedByStudent = minus(kG, kB).map((i) => got.values[i]);
    const removedByStudent = minus(kB, kG).map((i) => before.values[i]);
    const changedExpected = minus(kE, kB).map((i) => exp.values[i]);
    const removedExpected = minus(kB, kE).map((i) => before.values[i]);
    // une ligne modifiée apparaît à la fois comme « retirée » (ancienne version)
    // et « ajoutée » (nouvelle version) : on prend le maximum des deux
    const studentTouched = Math.max(changedByStudent.length, removedByStudent.length);
    const expectedTouched = Math.max(changedExpected.length, removedExpected.length);

    const messages = [];
    if (missing.length === 0 && extra.length === 0) {
      return { ok: true, level: "ok", messages, notes: [], changedByStudent, removedByStudent, changedExpected, removedExpected };
    }
    if (studentTouched === 0) {
      messages.push("Votre requête n'a modifié aucune donnée. Cette question demande un INSERT, un UPDATE ou un DELETE.");
    } else {
      if (exp.values.length !== got.values.length) {
        messages.push(`Après votre requête, la table vérifiée contient ${got.values.length} ligne(s) ; on en attend ${exp.values.length}.`);
      }
      if (studentTouched > expectedTouched) {
        messages.push(`Attention : votre requête a touché plus de lignes que nécessaire (${studentTouched} au lieu de ${expectedTouched}). Votre WHERE est-il assez précis ?`);
      } else if (studentTouched < expectedTouched) {
        messages.push(`Votre requête n'a pas touché toutes les lignes attendues (${studentTouched} au lieu de ${expectedTouched}).`);
      } else {
        messages.push("Le bon nombre de lignes a été modifié, mais pas avec les bonnes valeurs ou pas les bonnes lignes.");
      }
    }
    return { ok: false, level: studentTouched ? "partial" : "ko", messages, notes: [], changedByStudent, removedByStudent, changedExpected, removedExpected };
  }

  const api = { compareResults, compareStates, norm };
  global.SQLCompare = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
