# Bases personnelles

- **Formats acceptés** :
  - un fichier `.sqlite`, `.db` ou `.sql` seul (exercice sans question) ;
  - ou un zip qui contient `exercice.json` avec `db.sqlite` ou `db.sql`.
- **Contrôles à l'import** :
  - le fichier doit être valide, avec au moins une table ;
  - la taille est surveillée ;
  - les dates au mauvais format sont signalées (il faut AAAA-MM-JJ) ;
  - l'absence de clés étrangères est signalée, car le diagramme n'aurait pas de flèches.
- **Où va l'exercice** : il reste dans le navigateur de l'étudiant (IndexedDB) et peut être
  retiré.
