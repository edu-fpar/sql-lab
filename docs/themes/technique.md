# Technique

- **Composants** : HTML et JavaScript sans compilation, sql.js 1.10 (SQLite en WebAssembly),
  CodeMirror 5, fflate. Les bibliothèques sont embarquées dans `lib/`.
- **Formats JSON** : questions (`sql-lab-questions/1`) et exercices (`sql-lab-exercice/1`),
  décrits dans le [README](reference/) et la [skill](https://github.com/edu-fpar/sql-lab/blob/main/skill/sql-lab-questions/SKILL.md).
- **Tests** : `tools/test_exercice.js` (corrections, variantes, pièges, schémas, processus) et
  `tools/test_pack.js`.
- **Captures d'écran** : `tools/captures.js`.
