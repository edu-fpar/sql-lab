---
name: sql-lab-questions
description: Rédiger un pack de questions d'entraînement SQL (format JSON « sql-lab-questions/1 ») pour l'application SQL Lab, à partir du schéma d'une base d'exercice, pour des étudiants en gestion (DCG UE8). À utiliser quand un enseignant demande de créer, compléter ou corriger des questions SQL pour SQL Lab.
---

# Créer un pack de questions pour SQL Lab

SQL Lab est une application web d'entraînement au SQL pour des **étudiants en gestion**
(DCG, UE8 « Systèmes d'information de gestion »), pas pour des informaticiens.
L'étudiant lit un énoncé, écrit sa requête, et l'application compare son résultat avec celui
de la **correction** que tu fournis. La qualité du pack dépend donc avant tout de corrections
justes et d'énoncés sans ambiguïté.

## Ce que tu dois produire

Uniquement un objet JSON (dans un bloc ```json), au format suivant :

```json
{
  "format": "sql-lab-questions/1",
  "exercice": "dcg2024",
  "titre": "Révisions jointures",
  "auteur": "Nom de l'enseignant (facultatif)",
  "description": "Une phrase sur l'objectif du pack (facultatif)",
  "questions": [
    {
      "id": "j01",
      "theme": "Jointures",
      "enonce": "Afficher le nom et le prénom des clients ayant un dossier non clos, triés par nom.",
      "correction": [
        "SELECT NomCli, PrenomCli",
        "FROM CLIENT, DOSSIER",
        "WHERE CLIENT.IdCli = DOSSIER.IdCli",
        "AND DateCloture IS NULL",
        "ORDER BY NomCli;"
      ],
      "variantes": [[
        "SELECT NomCli, PrenomCli",
        "FROM CLIENT",
        "INNER JOIN DOSSIER ON CLIENT.IdCli = DOSSIER.IdCli",
        "WHERE DateCloture IS NULL",
        "ORDER BY NomCli;"
      ]],
      "ordered": [0],
      "indice": "Le nom est dans CLIENT, la date de clôture dans DOSSIER : reliez les deux tables par IdCli."
    },
    {
      "id": "m01",
      "theme": "Mises à jour",
      "type": "write",
      "enonce": "Le client n° 1012 a changé de numéro de téléphone : enregistrer le 06 11 22 33 44.",
      "correction": "UPDATE CLIENT SET TelCli = '06 11 22 33 44' WHERE IdCli = 1012;",
      "verif": "SELECT * FROM CLIENT",
      "indice": "UPDATE … SET … WHERE : sans WHERE, tous les clients seraient modifiés."
    }
  ]
}
```

### Champs d'une question

| Champ | Obligatoire | Rôle |
|---|---|---|
| `id` | conseillé | Identifiant court et unique dans le pack (lettres, chiffres, `-`, `_`). |
| `theme` | conseillé | Notion travaillée ; sert à regrouper les questions dans le menu. |
| `enonce` | **oui** | La consigne, en langage de gestion. |
| `correction` | **oui** | La requête de référence : une chaîne, ou un tableau de lignes (plus lisible). |
| `variantes` | non | Autres écritures justes (par ex. la jointure avec `INNER JOIN`), même format que `correction`. |
| `indice` | conseillé | Un coup de pouce qui oriente **sans donner la requête**. |
| `ordered` | si tri demandé | Indices (à partir de 0) des colonnes du résultat sur lesquelles porte le tri demandé. |
| `type` | pour les modifications | `"write"` pour INSERT / UPDATE / DELETE (déduit automatiquement sinon). |
| `verif` | pour les modifications | `SELECT * FROM <table modifiée>` : l'application compare la table avant/après. |
| `annale` | non | Année de l'annale dont la question s'inspire (affiche un badge). |

### Questions de construction de schéma (`"type": "schema"`)

Sans SQL : l'étudiant fait évoluer un schéma relationnel de départ dans un éditeur graphique
(tables, attributs, clé primaire, clés étrangères), puis l'application compare la **structure**
de son schéma à la solution. À utiliser pour des règles de gestion nouvelles : une association
« plusieurs à plusieurs » qui devient une table, un attribut qui doit changer de table, une
catégorie (sous-type) de personnel, une table de référence à créer…

```json
{
  "id": "s01",
  "type": "schema",
  "theme": "Évolution du schéma",
  "enonce": "Plusieurs clients peuvent être emprunteurs d'un même dossier ; un client peut emprunter sur plusieurs dossiers. Faites évoluer le schéma.",
  "depart": ["CLIENT", "DOSSIER"],
  "solution": {
    "tables": [
      { "nom": "DOSSIER", "interdits": ["IdCli"] },
      { "nom": "EMPRUNTER", "alias": ["EMPRUNT", "EMPRUNTEUR"],
        "role": "relier les emprunteurs (clients) et les dossiers",
        "pk": ["IdCli", "IdDoss"], "fk": { "IdCli": "CLIENT", "IdDoss": "DOSSIER" } }
    ]
  },
  "variantes": [],
  "indice": "Une relation « plusieurs à plusieurs » devient une table dont la clé primaire associe les clés des deux tables."
}
```

- `depart` : `"base"` (toute la base), une liste de tables **existantes** de la base, ou des tables
  décrites : `{ "nom": "PERSONNEL", "colonnes": ["_NumPersonnel", "NomPersonnel", "#CodeSalon>SALON"] }`
  (`_` = clé primaire, `#…>TABLE` = clé étrangère).
- `solution.tables` : seulement les tables **nouvelles ou modifiées** : `pk` (attributs de la clé
  primaire), `fk` (attribut → table référencée), `attributs` (autres attributs exigés),
  `optionnels` (tolérés), `interdits` (attributs qui doivent disparaître de la table).
  `tablesOptionnelles` : tables tolérées ; `tablesSupprimees` : tables de départ à supprimer.
- Noms comparés sans tenir compte de la casse, des accents ni des « _ » : donne des `alias` pour
  les noms de table probables et des équivalents d'attributs avec `|` (`"Quotite|Pourcentage"`).
- `role` est **obligatoire** pour chaque nouvelle table : il apparaît dans « Il manque une table
  pour … » et ne doit pas donner le nom de la table.
- `variantes` : autres solutions complètes acceptées ; une variante avec `"partiel": "explication"`
  est reconnue comme seulement en partie juste (message affiché à l'étudiant).
- L'énoncé contient toutes les règles de gestion nécessaires, en langage métier.

### Questions de processus (`"type": "processus"`, en fin de série)

Schéma événements-résultats en couloirs : l'étudiant lit le texte et dessine acteurs, événements,
opérations (actions + règles d'émission) et synchronisations. L'application vérifie la grammaire
du formalisme et les **synchronisations / règles attendues** ; le reste est comparé au corrigé par
une liste d'auto-évaluation.

```json
{
  "id": "p01", "type": "processus", "theme": "Processus",
  "enonce": "Texte décrivant le processus (entretien…) puis la consigne.",
  "couloirs": ["Client", "Commercial", "Magasin"],
  "attendus": [
    { "operation": "Préparation commande", "alias": ["Préparer la commande"],
      "synchronisation": "Commande validée ET (Stock disponible OU Réapprovisionnement reçu)" },
    { "operation": "Vérification stock", "regles": ["Stock suffisant", "Stock insuffisant"] }
  ],
  "equivalents": { "Commande validée": ["Commande acceptée"] },
  "autoevaluation": ["Les trois acteurs sont présents.", "…"],
  "indice": "…"
}
```

Le corrigé dessiné (`solution`) et les étiquettes proposées (`elements`) se préparent dans
l'espace de création : une IA peut se limiter aux champs ci-dessus.

## Comment l'application corrige (à garder en tête en rédigeant)

- Elle exécute la correction et la requête de l'étudiant sur **la même base**, puis compare
  les **valeurs** : les noms/alias de colonnes et l'ordre des colonnes sont libres, les
  colonnes en trop sont tolérées, la casse des textes est ignorée, les nombres sont arrondis
  à 2 décimales.
- L'**ordre des lignes** n'est vérifié que si `ordered` est renseigné. Si l'énoncé demande un
  tri, renseigne `ordered` avec la (les) colonne(s) de tri ; s'il ne demande pas de tri,
  ne mets pas d'`ORDER BY` dans la correction et n'indique pas `ordered`.
- Les requêtes de modification sont **fictives** : chaque exécution repart d'une base neuve ;
  l'application compare la table indiquée par `verif` après la correction et après la requête
  de l'étudiant.
- Le moteur est SQLite, mais l'étudiant peut écrire « comme au DCG » : `YEAR()`, `MONTH()`,
  `DAY()`, `DATEDIFF(fin, début)`, `NOW()` / `CURDATE()` (date du jour simulée de l'exercice),
  dates `'15/06/2024'` ou `#15/06/2024#`, `EXTRACT(YEAR FROM …)`.

## Règles de rédaction

1. **Public** : étudiants en gestion. Vocabulaire métier (« les clients ayant refusé une
   offre ») plutôt que technique (« faire une jointure entre… »). Une notion nouvelle à la fois.
2. **Énoncé précis** : dire quelles informations afficher (et dans quel ordre si un tri est
   attendu), les valeurs exactes à utiliser (orthographe et accents identiques aux données),
   et l'unité si besoin. L'étudiant doit pouvoir produire exactement le résultat attendu.
3. **Uniquement le schéma fourni** : n'utilise que les tables et colonnes listées, avec leur
   orthographe exacte. N'invente pas de valeurs : prends les exemples, plages et listes de
   valeurs données dans la description de la base (villes, statuts, identifiants, dates).
4. **Résultat non vide et parlant** : chaque `SELECT` doit renvoyer au moins une ligne
   (idéalement entre 1 et 50). Évite les questions dont le résultat est trop long pour être
   lu ou une liste vide.
5. **Style de correction DCG** :
   - jointures dans le `WHERE` (`FROM A, B WHERE A.cle = B.cle`) pour la correction
     principale, et la version `INNER JOIN … ON` en variante ;
   - préfixe les colonnes présentes dans plusieurs tables (`CLIENT.IdCli`) ;
   - dates avec `YEAR()`, `MONTH()` ou `BETWEEN 'jj/mm/aaaa' AND 'jj/mm/aaaa'` ;
   - pas de fonctions propres à SQLite (`strftime`, `julianday`, `LIMIT`, `||`…), pas de
     `WITH`, pas de fonctions de fenêtrage : ce n'est pas au programme.
6. **Progression** : du plus simple au plus difficile (une table → conditions → agrégats →
   jointures → regroupements → sous-requêtes → mises à jour), sauf consigne contraire.
7. **Modifications** : cibler des lignes précises par leur identifiant existant ; pour un
   INSERT, utiliser un identifiant libre (supérieur au maximum indiqué) et respecter les
   clés étrangères ; une suppression ne doit pas violer l'intégrité référentielle (sauf si
   c'est le but explicite de la question, mais alors l'application ne peut pas la corriger
   automatiquement).
8. **Indices** : ils rappellent la notion ou la table utile, jamais la requête complète.
9. **Variantes** : ajoute-les quand une autre écriture courante est juste (INNER JOIN,
   NOT EXISTS au lieu de NOT IN, BETWEEN au lieu de YEAR…). Chaque variante doit donner
   exactement le même résultat que la correction.

## Vérification avant de répondre

Pour chaque question, relis : tables et colonnes existent ? valeurs citées présentes dans les
données ? résultat non vide ? `ordered` cohérent avec l'énoncé et l'`ORDER BY` ? `verif`
présent pour les modifications ? `id` uniques ? JSON valide (guillemets doubles, apostrophes
SQL doublées dans les chaînes SQL : `'d''occasion'`) ?

L'enseignant importera ensuite le JSON dans l'espace de création de SQL Lab, qui exécute
chaque correction et signale les problèmes ; il pourra alors retoucher les questions.
