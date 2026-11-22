# 🛠 Développeur, contributeur

## Le lancer en local
```
python -m http.server 8765
```
puis ouvrez http://localhost:8765. Un serveur web est nécessaire, car l'ouverture directe du
fichier ne fonctionne pas. Tests : `npm install`, puis `node tools/test_exercice.js`.

## Ajouter un exercice
`exercices/<id>/db.sql`, `db.sqlite` et `questions.json`, puis une entrée dans
`exercices/catalogue.json`. Le modèle le plus simple à suivre est `exercices/demo-en/`. Le
détail est dans le [README](reference/exercice).

## Traduire l'interface
Chaque module enregistre ses traductions avec `I18N.add({ "texte français": "traduction" })`,
dans `assets/i18n.js`. Une nouvelle langue demande d'ajouter son code et un dictionnaire par
module.

## Signaler un problème
Ouvrez une [issue GitHub](https://github.com/edu-fpar/sql-lab/issues) en précisant l'exercice,
la question, la requête et le message affiché.
