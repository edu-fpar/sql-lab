# Exercice et base personnelle

## Exercice sur sa propre base (zip)

Un enseignant peut apporter **sa propre base** :

- un **zip** contenant `exercice.json` (titre, contexte, date du jour simulée, `schemaGrid`
  facultatif, questions ; format `sql-lab-exercice/1`) et `db.sqlite` **ou** `db.sql`
  (script `CREATE TABLE` + `INSERT`) ;
- ou simplement un fichier `.sqlite`, `.db` ou `.sql` : l'exercice est alors créé sans question.

Modèle : [`exemples/exercice-perso-mediatheque/`](https://github.com/edu-fpar/sql-lab/blob/main/exemples/exercice-perso-mediatheque/)
(zip construit avec `node tools/zip_exercice.js exemples/exercice-perso-mediatheque`).

- **Étudiant** : « Importer un fichier » (le même bouton accepte .json et .zip), ou lien
  `index.html?exercice=https://…/exercice.zip`. L'exercice apparaît dans le menu
  (« Exercices importés ») et reste dans le navigateur (IndexedDB) ; il peut être retiré
  depuis sa page de présentation.
- **Enseignant** (`create.html`) : « ＋ Charger ma base… » dans la liste des bases, puis
  titre, contexte et date du jour simulée ; le prompt IA et la vérification des questions
  fonctionnent sur sa base. Partage par « Exercice complet (.zip) ».
- Contrôles à l'import : fichier SQLite valide, au moins une table, taille (avertissement
  au-delà de 20 Mo, refus au-delà de 100 Mo), dates stockées en jj/mm/aaaa signalées
  (il faut AAAA-MM-JJ), absence de clés étrangères signalée (pas de flèches dans le diagramme).
- Une base ne peut pas tenir dans un lien long : fichier ou zip hébergé uniquement.

## Ajouter un exercice

1. Créer `exercices/<id>/db.sqlite` (par exemple avec un script sur le modèle de `tools/gen_dcg2024.py`).
2. Écrire `exercices/<id>/questions.json`.
3. Ajouter l'exercice dans `exercices/catalogue.json`.
4. Vérifier : `npm install` (une fois), puis `node tools/test_exercice.js <id>`
   (`npm test` pour dcg2024).
