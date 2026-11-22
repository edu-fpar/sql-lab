# File formats

All files are JSON. **Keys stay in French** whatever the language of the exercise (`enonce`,
`correction`, `indice`…); only the values (statements, hints, names) are in the exercise's
language. The simplest complete example is
[`exercices/demo-en/questions.json`](https://github.com/edu-fpar/sql-lab/blob/main/exercices/demo-en/questions.json).

## SQL question

```json
{
  "id": "q11",
  "theme": "Joins",
  "enonce": "Display, without duplicates, the last name and first name of the customers who have rented at least one electric bike (category number 2).",
  "correction": [
    "SELECT DISTINCT LastName, FirstName",
    "FROM CUSTOMER, RENTAL, RENTAL_LINE, BIKE",
    "WHERE CUSTOMER.CustomerId = RENTAL.CustomerId",
    "AND RENTAL.RentalId = RENTAL_LINE.RentalId",
    "AND RENTAL_LINE.BikeId = BIKE.BikeId",
    "AND CategoryId = 2;"
  ],
  "variantes": [["SELECT DISTINCT LastName, FirstName", "FROM CUSTOMER INNER JOIN RENTAL ON …"]],
  "indice": "Follow the arrows from CUSTOMER to BIKE."
}
```

| Key | Required | Role |
|---|---|---|
| `id` | recommended | short unique id |
| `theme` | recommended | topic, used to group questions in the menu |
| `enonce` | **yes** | the statement, in business language |
| `correction` | **yes** | reference query: a string or an array of lines |
| `variantes` | no | other correct writings, same format |
| `indice` | recommended | a hint that does not give the query |
| `ordered` | if sorting is asked | indexes (from 0) of the result columns the sort is on |
| `type` | for updates | `"write"` for INSERT / UPDATE / DELETE |
| `verif` | for updates | `SELECT * FROM <table>`: the table is compared before/after |
| `annale` | no | exam year (badge) |
| `cinema` | no | replaces step-by-step comments: `{ "passages": "…", "filtres.2": "…" }` |

The step names for `cinema` are `tables`, `passages` (linking tables), `alias`, `select`,
`jointures`, `filtres`, `groupe`, `tri`, `resultat`; for schema questions `lecture`,
`retraits`, `entites`, `liens`, `associations`, `bilan`. `step.n` targets the n-th step of a
phase. Plain text only.

## Schema question

```json
{
  "id": "s01", "type": "schema", "theme": "Schema design",
  "enonce": "…business rules…",
  "depart": "base",
  "solution": { "tables": [
    { "nom": "BIKE", "interdits": ["Model", "Brand"] },
    { "nom": "RENTAL_ACCESSORY", "alias": ["RENTAL_ACCESSORIES"],
      "role": "record which accessories were taken in a rental",
      "pk": ["RentalId", "AccessoryId"], "fk": { "RentalId": "RENTAL", "AccessoryId": "ACCESSORY" },
      "attributs": ["Quantity|Qty"] }
  ] },
  "variantes": [ { "tables": [ … ], "partiel": "Message if only partly right" } ],
  "indice": "…"
}
```

- `depart`: `"base"` (whole database), a list of table names, or described tables
  `{ "nom": "STAFF", "colonnes": ["_StaffId", "Name", "#StoreId>STORE"] }`
  (`_` = primary key, `#…>TABLE` = foreign key).
- `solution.tables`: only new or changed tables. `pk`, `fk` (attribute → table), `attributs`
  (required), `optionnels` (tolerated), `interdits` (must leave the table). `role` is
  **required** for each new table: it is used in "A table is missing to …".
- Names are compared ignoring case, accents and `_`; equivalent names with `|`; a table with an
  unexpected name is recognised by its primary key.

## Process question

```json
{
  "id": "p01", "type": "processus", "theme": "Process",
  "enonce": "Interview text, then the instruction.",
  "couloirs": ["Customer", "Website", "Store counter", "Workshop"],
  "elements": [ { "kind": "event", "label": "Booking request" }, { "kind": "operation", "label": "Bike handover" } ],
  "attendus": [
    { "operation": "Bike handover", "synchronisation": "Booking confirmed AND (Deposit paid OR Member card shown)" },
    { "operation": "Availability check", "regles": ["Bike available", "No bike available"] }
  ],
  "equivalents": { "Booking confirmed": ["Booking accepted"] },
  "solution": { "lanes": [], "nodes": [], "arrows": [] },
  "autoevaluation": ["The customer is an actor.", "…"]
}
```

Conditions accept `and`/`or` as well as `et`/`ou`, in any case and order. An event name
containing "and"/"or" goes in quotes. Optional events: `"facultatifs": ["…"]` in the expected
item. `depart` (same format as `solution`): a partial diagram to complete. The drawn `solution`
and the suggested `elements` are easiest to produce in the app.

## Question pack (`sql-lab-questions/1`)

```json
{ "format": "sql-lab-questions/1", "exercice": "demo-en", "titre": "Join practice",
  "auteur": "…", "questions": [ … ] }
```

Shared as a file ("Import a file"), a link without a server (`index.html#pack=…`, compressed
after the `#`), or a link to a hosted file (`index.html?pack=https://…/questions.json`, the site
must allow CORS).

## Exercise with your own database (`sql-lab-exercice/1`)

A zip containing `exercice.json` (title, context, simulated "today" `aujourdhui`, optional
`schemaGrid`, questions) and `db.sqlite` **or** `db.sql` (`CREATE TABLE` + `INSERT`). Dates must
be stored as `YYYY-MM-DD`; declare foreign keys with `REFERENCES` so the diagram draws arrows.
Model: [`exemples/exercice-perso-mediatheque/`](https://github.com/edu-fpar/sql-lab/tree/main/exemples/exercice-perso-mediatheque).
Student link: `index.html?exercice=https://…/exercice.zip`.
