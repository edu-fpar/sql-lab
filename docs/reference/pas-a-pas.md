# Correction pas à pas

Dans la correction d'une question SQL, le bouton **<i class="i i-clapperboard"></i> Correction pas à pas** rejoue le
raisonnement, dans l'ordre où on le mène (qui n'est pas l'ordre d'écriture) : tables évidentes →
tables de passage → alias → colonnes à afficher → jointures → filtres → regroupement → tri →
résultat. Une frise montre où l'on en est (les phases inutiles pour la requête sont barrées), le
diagramme s'anime (tables allumées, tables de passage en pointillés, colonnes surlignées par rôle,
flèche de la jointure en cours) et la requête se construit morceau par morceau. Les requêtes de
mise à jour ont leur propre déroulé : table, valeurs, lignes visées, résultat.

![Correction pas à pas : la jointure en cours est animée sur le schéma](../img/fr/cinema-sql.png)

Les questions de **schéma** ont le même mode (**<i class="i i-clapperboard"></i> Construction pas à pas**) : règles de gestion →
ce qui ne tient plus (colonne barrée) → nouvelles tables → clés étrangères (relation un à
plusieurs) → tables de liaison (plusieurs à plusieurs, clé composée puis flèches) → schéma final.
Le diagramme évolue à chaque étape.

![Construction du schéma pas à pas : table de liaison ternaire et ses clés étrangères](../img/fr/cinema-schema.png)

Rien à écrire : les étapes sont **générées à partir de la correction** (ou de la solution du
schéma) par `assets/cinema.js`.
Pour remplacer un commentaire automatique, ajouter à la question un champ facultatif :

```json
"cinema": { "passages": "DOSSIER est le pivot du modèle…", "filtres.2": "…" }
```

(clé = phase, ou `phase.n` pour la n-ième étape d'une phase ; texte brut).
