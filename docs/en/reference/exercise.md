# Adding an exercise

1. Create `exercices/<id>/db.sql` (CREATE TABLE with `REFERENCES` + INSERT) and generate
   `db.sqlite` from it (any SQLite tool, or sql.js in Node).
2. Write `exercices/<id>/questions.json`: title (`titre`), context (`contexte`), simulated
   "today" (`aujourdhui`, `YYYY-MM-DD`), optional diagram layout (`schemaGrid`:
   `{"TABLE": [column, row]}`) and the questions (see [File formats](en/reference/formats)).
3. Add the exercise to `exercices/catalogue.json`:
   `{"id": "<id>", "titre": "…", "description": "…", "langue": "en"}`.
4. Check: `npm install` (once), then `node tools/test_exercice.js <id>`. The script runs every
   solution and alternative, checks `ordered`, schema solutions (recognised, starting schema
   refused) and process solutions (grammar, expected synchronisations, "all AND" trap).

Use [`exercices/demo-en/`](https://github.com/edu-fpar/sql-lab/tree/main/exercices/demo-en) as a
model.

Teachers who do not touch the repository can instead load their database in the
[teacher space](https://edu-fpar.github.io/sql-lab/create.html?lang=en) and share a complete
exercise as a zip.
