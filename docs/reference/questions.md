# Format d'une question SQL

```json
{
  "id": "q17",
  "theme": "Jointures et regroupements",
  "enonce": "…",
  "annale": "2024",
  "ordered": [2],
  "correction": ["SELECT …", "FROM …"],
  "variantes": [["SELECT …", "FROM … INNER JOIN …"]],
  "indice": "…"
}
```

- `correction` / `variantes` : une chaîne ou un tableau de lignes.
- `ordered` : à indiquer seulement si l'énoncé demande un tri ; liste des colonnes
  (indices à partir de 0) sur lesquelles porte le tri. Les ex æquo peuvent être dans n'importe quel ordre.
- Pour une requête d'écriture : `"type": "write"` et `"verif": "SELECT * FROM TABLE ORDER BY …"`
  (requête qui photographie la table modifiée, avant et après).
