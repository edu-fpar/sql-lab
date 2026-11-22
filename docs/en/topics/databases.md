# Custom databases

- **Accepted formats**:
  - a `.sqlite`, `.db` or `.sql` file on its own (exercise without questions);
  - or a zip containing `exercice.json` with `db.sqlite` or `db.sql`.
- **Import checks**:
  - the file must be valid, with at least one table;
  - the size is watched;
  - dates in the wrong format are flagged (YYYY-MM-DD is required);
  - missing foreign keys are flagged, since the diagram would have no arrows.
- **Where the exercise goes**: it stays in the student's browser (IndexedDB) and can be removed.
