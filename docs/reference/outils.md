# Structure et outils

## Structure

```
index.html                  application étudiant
create.html                 espace enseignant (prompt IA, vérification, partage)
skill/sql-lab-questions/    mode d'emploi du format de questions, pour les IA
exemples/                   pack de questions et exercice personnel d'exemple
lib/                        bibliothèques embarquées (sql.js, CodeMirror, fflate) : aucun CDN
dist/                       paquets SCORM générés (non versionnés)
assets/
  compat.js                 réécriture des requêtes (dates…) et fonctions ajoutées à SQLite
  compare.js                comparaison résultat étudiant / résultat attendu
  engine.js                 exécution (copie neuve de la base à chaque requête)
  packs.js                  packs de questions : contrôle, vérification, lien compressé, description de la base
  diagram.js                schéma relationnel graphique
  library.js                exercices intégrés et importés (zip, IndexedDB)
  scorm.js                  liaison SCORM 1.2 avec la plateforme
  scormbuild.js             construction d'un paquet SCORM
  create.js, create.css     espace enseignant
  app.js, style.css         interface
exercices/
  catalogue.json            liste des exercices proposés dans le menu
  dcg2024/
    questions.json          contexte, date du jour simulée, questions
    db.sql                  base lisible (CREATE TABLE + INSERT)
    db.sqlite               base chargée par l'application
tools/
  gen_dcg2024.py            génère db.sql et db.sqlite (données fictives, graine fixe)
  test_exercice.js          vérifie corrections, variantes et diagnostics
annales/                    sujets et corrigés d'origine (ne pas publier si non souhaité)
```

## Tester en local

La page doit être servie par un serveur web (pas d'ouverture directe du fichier) :

```
python -m http.server 8765
```

puis ouvrir http://localhost:8765. UwAmp convient aussi.

## Captures d'écran

`node tools/captures.js fr` (ou `en`) régénère les captures de `docs/img/` avec Edge ou Chrome
sans fenêtre, à partir du serveur local (profil temporaire, rien n'est écrit dans le navigateur).

## Publier sur GitHub Pages

Pousser le dossier dans un dépôt, puis *Settings → Pages → Deploy from a branch* (racine).
Le `.gitignore` exclut déjà `annales/` (sujets d'origine), `node_modules/` et `.claude/`.
