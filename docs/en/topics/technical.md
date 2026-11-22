# Technical overview

- **Components**: HTML and JavaScript with no build step, sql.js 1.10 (SQLite in WebAssembly),
  CodeMirror 5, fflate. The libraries are bundled in `lib/`.
- **JSON formats**: questions (`sql-lab-questions/1`) and exercises (`sql-lab-exercice/1`),
  described in the [README](en/reference/) and the [skill](https://github.com/edu-fpar/sql-lab/blob/main/skill/sql-lab-questions/SKILL.md).
- **Tests**: `tools/test_exercice.js` (solutions, alternatives, traps, schemas, processes) and
  `tools/test_pack.js`.
- **Screenshots**: `tools/captures.js`.
