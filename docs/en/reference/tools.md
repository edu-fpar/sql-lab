# Structure and tools

## Structure

```
index.html                  student app
create.html                 teacher space (AI prompt, checks, sharing)
docs/                       this documentation (docsify, French and English)
skill/sql-lab-questions/    question format guide, for AIs (French)
exemples/                   sample question pack and custom exercise
lib/                        bundled libraries (sql.js, CodeMirror, fflate, docsify): no CDN
assets/
  i18n.js                   interface translation (French keys, English dictionaries per module)
  compat.js                 query rewriting (dates…) and functions added to SQLite
  compare.js                student result / expected result comparison
  engine.js                 execution (fresh copy of the database for each query)
  cinema.js                 step-by-step solutions (SQL and schema)
  diagram.js                graphical relational schema
  schemacheck.js, schema-editor.js     schema questions
  processcheck.js, process-editor.js   process questions
  packs.js, library.js      question packs, imported exercises (zip, IndexedDB)
  scorm.js, scormbuild.js   SCORM 1.2 runtime and package builder
  create.js, create.css     teacher space
  app.js, style.css         interface
exercices/                  catalogue.json, demo-en/, dcg2008 … dcg2026/
tools/                      tests, SCORM build, screenshots, vendoring
```

## Run locally

The page must be served by a web server (opening the file directly does not work):

```
python -m http.server 8765
```

then open http://localhost:8765/?lang=en (documentation: http://localhost:8765/docs/#/en/).

## Tests

```
npm install
node tools/test_exercice.js            # every exercise (or: node tools/test_exercice.js demo-en)
node tools/test_pack.js exemples/pack-exemple-dcg2024.json
```

## Libraries

`npm run vendor` copies the pinned libraries from `node_modules` into `lib/` (sql.js, CodeMirror,
fflate, docsify). The docsify theme is copied without its Google Fonts import, so the
documentation makes no external calls either.

## Screenshots

`node tools/captures.js en` (or `fr`) regenerates `docs/img/en/` with headless Edge or Chrome,
from the local server (temporary profile, nothing written to your browser).

## Publish on GitHub Pages

Push the repository, then *Settings → Pages → Deploy from a branch* (root). The app is at
`/sql-lab/`, the documentation at `/sql-lab/docs/`.
