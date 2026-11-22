# Paquet SCORM 1.2

Un paquet par exercice : l'application complète **sans CDN** (bibliothèques dans `lib/`),
verrouillée sur l'exercice (pas de choix d'exercice ni d'import).

- **Score** transmis : % de questions réussies (`cmi.core.score.raw`).
- **Statut** : `incomplete`, puis `completed` quand tout est réussi ; avec un seuil,
  `passed` dès que le score l'atteint (aussi déclaré en `masteryscore` dans le manifeste).
- **Reprise** : questions réussies et question en cours conservées par la plateforme
  (`cmi.suspend_data`, `cmi.core.lesson_location`) ; la plateforme fait foi, même sur un
  poste partagé. Les brouillons de requêtes restent dans le navigateur (limite SCORM 1.2).
- **Détail** : une interaction par question réussie (identifiant + requête de l'étudiant).

Production :

```
npm install
npm run vendor                                   # copie les bibliothèques dans lib/ (déjà fait)
node tools/build_scorm.js dcg2024                # → dist/sqllab-dcg2024-scorm12.zip
node tools/build_scorm.js dcg2024 mon-pack.json --seuil 80
node tools/build_scorm.js exemples/exercice-perso-mediatheque.zip
node tools/build_scorm.js --tous                 # un paquet par exercice du catalogue
```

ou, sans rien installer, bouton **« Paquet SCORM »** à l'étape 4 de `create.html`
(base + questions de l'exercice + questions du pack, seuil facultatif).

Dans Moodle : *Ajouter une activité → Paquetage SCORM*, déposer le zip ; régler l'évaluation
sur « Note la plus élevée » ou « Dernière tentative » selon l'usage.

**Tester sans plateforme** : `tools/scorm-test.html` simule une plateforme SCORM 1.2
(objet `API`, données conservées entre deux sessions, journal des appels). Décompresser le
paquet dans `dist/test/<id>/`, puis ouvrir
`http://localhost:8765/tools/scorm-test.html?paquet=../dist/test/<id>/index.html`.
