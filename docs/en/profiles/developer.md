# Developer, contributor

## Run it locally
```
python -m http.server 8765
```
then open http://localhost:8765/?lang=en. A web server is needed, because opening the file
directly does not work. Tests: `npm install`, then `node tools/test_exercice.js`.

## Add an exercise
`exercices/<id>/db.sql`, `db.sqlite` and `questions.json`, then an entry in
`exercices/catalogue.json` (`"langue": "en"` for an English exercise). The simplest model to
follow is `exercices/demo-en/`. Details are in the [README](en/reference/exercise).

## Translate the interface
Each module registers its translations with `I18N.add({ "French text": "translation" })`, in
`assets/i18n.js`. A new language needs its code and one dictionary per module.

## Report a problem
Open a [GitHub issue](https://github.com/edu-fpar/sql-lab/issues) with the exercise, the
question, your query and the message shown.
