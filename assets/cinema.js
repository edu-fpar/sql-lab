/* SQL Lab – « mode cinéma » : correction pas à pas commentée.
 *
 * La correction d'une question est analysée (SELECT … FROM … WHERE … GROUP BY …
 * HAVING … ORDER BY, ou INSERT / UPDATE / DELETE) puis découpée dans l'ordre où
 * l'on raisonne, qui n'est pas l'ordre d'écriture : tables évidentes, tables de
 * passage, alias, colonnes à afficher, jointures, filtres, regroupement, tri.
 * Chaque étape dit quoi surligner sur le schéma et quelle partie de la requête
 * apparaît. Aucun scénario à écrire : un champ facultatif « cinema » de la
 * question permet seulement de remplacer les commentaires d'une phase.
 *
 * SQLCinema.build(sql, schema, q) -> { kind, phases, steps } (sans DOM, testable)
 * new SQLCinema.Player(els, opts)  -> lecteur dans une boîte de dialogue
 */
(function (global) {
  "use strict";

  // ------------------------------------------------------------ traductions
  // tr / trn plutôt que t (t désigne souvent une table dans ce fichier).
  const I18N = global.I18N || { lang: "fr", add() {}, t: (s, v) => (v ? s.replace(/\{(\w+)\}/g, (m, k) => (v[k] !== undefined ? v[k] : m)) : s) };
  const tr = I18N.t;
  /** singulier / pluriel : en français 0 et 1 au singulier, en anglais seul 1 */
  const trn = (n, one, many, v) => tr((I18N.lang === "fr" ? n > 1 : n !== 1) ? many : one, { n, ...(v || {}) });
  I18N.add({
    // listes
    "{a} et {b}": "{a} and {b}",
    // expressions du SELECT
    "toutes les colonnes": "all columns",
    "compte les lignes": "counts the rows",
    "compte les valeurs <em>différentes</em>": "counts the <em>distinct</em> values",
    "compte les lignes où la colonne est renseignée": "counts the rows where the column is filled in",
    "fait la somme": "adds up the values",
    "calcule la moyenne": "calculates the average",
    "retient la plus petite valeur": "keeps the smallest value",
    "retient la plus grande valeur": "keeps the largest value",
    "extrait l'année de la date": "extracts the year from the date",
    "extrait le mois de la date": "extracts the month from the date",
    "nombre de jours entre deux dates": "number of days between two dates",
    "calcul à partir d'un regroupement": "calculation based on a grouping",
    "colonne calculée": "calculated column",
    // conditions
    " sur {t}": " on {t}",
    "<strong>sous-requête</strong>{sub} : je garde les lignes pour lesquelles elle ne renvoie <em>rien</em> (NOT EXISTS).": "<strong>subquery</strong>{sub}: I keep the rows for which it returns <em>nothing</em> (NOT EXISTS).",
    "<strong>sous-requête</strong>{sub} : je garde les lignes pour lesquelles elle renvoie au moins une ligne (EXISTS).": "<strong>subquery</strong>{sub}: I keep the rows for which it returns at least one row (EXISTS).",
    "<strong>sous-requête</strong>{sub} : elle calcule d'abord une liste, puis je garde les lignes qui n'y figurent <em>pas</em> (NOT IN). C'est la traduction de « n'a jamais… », « aucun… ».": "<strong>subquery</strong>{sub}: it first computes a list, then I keep the rows that are <em>not</em> in it (NOT IN). This is how you express “has never…”, “no…”.",
    "<strong>sous-requête</strong>{sub} : elle calcule d'abord une liste, puis je garde les lignes qui y figurent (IN).": "<strong>subquery</strong>{sub}: it first computes a list, then I keep the rows that are in it (IN).",
    "la valeur de comparaison est calculée par une <strong>sous-requête</strong>{sub}, exécutée d'abord.": "the comparison value is computed by a <strong>subquery</strong>{sub}, which runs first.",
    "valeur <em>renseignée</em> : IS NOT NULL.": "the value is <em>filled in</em>: IS NOT NULL.",
    "valeur <em>vide</em> (non renseignée) : IS NULL — jamais <code>= NULL</code>.": "the value is <em>empty</em> (not filled in): IS NULL — never <code>= NULL</code>.",
    "la valeur ne doit être aucune de celles de la liste (NOT IN).": "the value must not be any of those in the list (NOT IN).",
    "la valeur doit être l'une de celles de la liste (IN).": "the value must be one of those in the list (IN).",
    "BETWEEN … AND … : bornes comprises.": "BETWEEN … AND …: both bounds are included.",
    "LIKE : <code>%</code> remplace n'importe quelle suite de caractères.": "LIKE: <code>%</code> stands for any sequence of characters.",
    "on extrait le mois et l'année de la date.": "I extract the month and the year from the date.",
    "YEAR() extrait l'année de la date.": "YEAR() extracts the year from the date.",
    "MONTH() extrait le mois de la date.": "MONTH() extracts the month from the date.",
    "l'une <em>ou</em> l'autre condition suffit : les parenthèses évitent de mélanger OR et AND.": "one condition <em>or</em> the other is enough: the parentheses keep OR and AND from getting mixed up.",
    "le texte entre apostrophes doit être écrit exactement comme dans la base.": "the text between quotes must be written exactly as it is in the database.",
    "comparaison de dates.": "date comparison.",
    // phases
    "Tables": "Tables", "Tables de passage": "Linking tables", "Alias": "Aliases", "Colonnes": "Columns",
    "Jointures": "Joins", "Filtres": "Filters", "Regroupement": "Grouping", "Tri": "Sorting", "Résultat": "Result",
    "Table": "Table", "Valeurs": "Values", "Lignes visées": "Targeted rows",
    "Règles de gestion": "Business rules", "Ce qui ne tient plus": "What no longer fits", "Nouvelles tables": "New tables",
    "Clés étrangères (1 → n)": "Foreign keys (1 → n)", "Tables de liaison (n ↔ n)": "Junction tables (n ↔ n)", "Schéma final": "Final schema",
    // 1. tables évidentes
    " (ce sont ses lignes que l'on compte)": " (its rows are the ones being counted)",
    "Je lis l'énoncé et je cherche où se trouvent les informations demandées : tout est dans la table {t}{cols}. Une seule table, donc <strong>pas de jointure</strong>.": "I read the question and look for where the requested information is: everything is in the {t} table{cols}. Only one table, so <strong>no join</strong>.",
    "Je lis l'énoncé et je repère les tables qui contiennent les informations demandées (à afficher ou à filtrer) : {list}.": "I read the question and spot the tables that hold the requested information (to display or to filter on): {list}.",
    " Sur le schéma, elles sont reliées directement par une flèche : pas besoin de table intermédiaire.": " On the diagram, they are linked directly by an arrow: no intermediate table is needed.",
    " Sur le schéma, elles sont reliées directement par des flèches : pas besoin de table intermédiaire.": " On the diagram, they are linked directly by arrows: no intermediate table is needed.",
    "Les tables évidentes": "The obvious tables",
    // 2. tables de passage
    "{t} fait le lien entre {list}": "{t} links {list}",
    "{t} est nécessaire pour atteindre {list}": "{t} is needed to reach {list}",
    "les autres tables": "the other tables",
    " ; ": "; ",
    "Ces tables ne sont pas reliées directement : je suis les flèches du schéma. {why}. ": "These tables are not linked directly: I follow the arrows on the diagram. {why}. ",
    "Elle n'apporte aucune colonne au résultat, mais elle doit figurer dans le FROM pour faire le chemin.": "It adds no column to the result, but it must appear in the FROM to complete the path.",
    "Elles n'apportent aucune colonne au résultat, mais elles doivent figurer dans le FROM pour faire le chemin.": "They add no columns to the result, but they must appear in the FROM to complete the path.",
    "Les tables de passage": "The linking tables",
    // 3. alias
    "{a} pour {t}": "{a} for {t}",
    "colonne": "column",
    "Pour éviter de répéter les noms complets, je donne un surnom (alias) à la table dans le FROM : {list}. Ensuite j'écris {ex} au lieu du nom complet.": "To avoid repeating full names, I give the table a nickname (alias) in the FROM: {list}. Then I write {ex} instead of the full name.",
    "Pour éviter de répéter les noms complets, je donne un surnom (alias) à chaque table dans le FROM : {list}. Ensuite j'écris {ex} au lieu du nom complet.": "To avoid repeating full names, I give each table a nickname (alias) in the FROM: {list}. Then I write {ex} instead of the full name.",
    " Ici la table {t} est utilisée deux fois : les alias sont <strong>obligatoires</strong> pour distinguer ses deux rôles.": " Here the {t} table is used twice: aliases are <strong>required</strong> to tell its two roles apart.",
    "Les alias": "Aliases",
    // 4. SELECT
    "{t} figure deux fois : l'alias {a} dit de quelle copie il s'agit": "{t} appears twice: the alias {a} says which copy is meant",
    "{c} existe aussi dans {list} : je précise la table": "{c} also exists in {list}: I specify the table",
    "colonne renommée « {a} »": "column renamed “{a}”",
    "Je liste ce que je veux voir apparaître, dans l'ordre de l'énoncé :<ul>{lis}</ul>": "I list what I want to see, in the order given in the question:<ul>{lis}</ul>",
    "<p>« Sans doublon » : {d} supprime les lignes identiques du résultat.</p>": "<p>“Without duplicates”: {d} removes identical rows from the result.</p>",
    "<p>Pas de GROUP BY : le calcul porte sur toutes les lignes retenues, le résultat tient en <strong>une ligne</strong>.</p>": "<p>No GROUP BY: the calculation covers all the rows kept, so the result fits on <strong>a single row</strong>.</p>",
    "<p class=\"muted small\">Le SELECT s'écrit en premier, mais on le remplit une fois qu'on sait d'où viennent les données.</p>": "<p class=\"muted small\">The SELECT is written first, but you fill it in once you know where the data comes from.</p>",
    "Ce que je veux voir": "What I want to see",
    // 5. jointures
    "{t} tables, donc {n} jointure, écrites ici avec {c} : chaque ON égalise une clé étrangère et la clé primaire qu'elle référence.": "{t} tables, so {n} join, written here with {c}: each ON matches a foreign key with the primary key it references.",
    "{t} tables, donc {n} jointures, écrites ici avec {c} : chaque ON égalise une clé étrangère et la clé primaire qu'elle référence.": "{t} tables, so {n} joins, written here with {c}: each ON matches a foreign key with the primary key it references.",
    "Les jointures": "The joins",
    "Avec {t} tables dans le FROM, il faut {n} jointure (une de moins que de tables), sinon chaque ligne serait combinée avec toutes les autres (produit cartésien). ": "With {t} tables in the FROM, I need {n} join (one fewer than the number of tables); otherwise every row would be combined with every other row (Cartesian product). ",
    "Avec {t} tables dans le FROM, il faut {n} jointures (une de moins que de tables), sinon chaque ligne serait combinée avec toutes les autres (produit cartésien). ": "With {t} tables in the FROM, I need {n} joins (one fewer than the number of tables); otherwise every row would be combined with every other row (Cartesian product). ",
    "Je relie {a} et {b}. La clé est <strong>composée</strong> de {n} colonnes ({list}) : il faut égaliser <em>chacune</em> d'elles, sinon la jointure associe des lignes qui ne vont pas ensemble.": "I link {a} and {b}. The key is <strong>composite</strong>, made of {n} columns ({list}): <em>each</em> of them must be matched, otherwise the join pairs up rows that don't belong together.",
    "Je relie {a} et {b} : la clé étrangère <i>#{fk}</i> de {a} pointe vers la clé primaire <u>{pk}</u> de {b}.": "I link {a} and {b}: the foreign key <i>#{fk}</i> in {a} points to the primary key <u>{pk}</u> of {b}.",
    "Je relie {a} et {b} par leur colonne commune.": "I link {a} and {b} through the column they share.",
    " La colonne porte le même nom dans les deux tables : je la préfixe ({c}).": " The column has the same name in both tables: I prefix it ({c}).",
    " C'est la même table utilisée deux fois (relation réflexive) : les alias distinguent les deux rôles.": " It is the same table used twice (self-referencing relationship): the aliases tell the two roles apart.",
    "Jointure {i} / {n}": "Join {i} / {n}",
    "La jointure": "The join",
    // 6. filtres
    "{c} : {d}": "{c}: {d}",
    "Je ne garde que les lignes qui répondent à l'énoncé. {b}": "I keep only the rows that match the question. {b}",
    "J'ajoute une condition avec AND : {b}": "I add a condition with AND: {b}",
    "Filtre {i} / {n}": "Filter {i} / {n}",
    "Le filtre": "The filter",
    // 7. regroupement
    "fonction": "function",
    "Le calcul est demandé « par » {g} : je regroupe les lignes avec <code>GROUP BY</code>. Le calcul ({c}) est alors fait pour chaque groupe.": "The calculation is asked for “per” {g}: I group the rows with <code>GROUP BY</code>. The calculation ({c}) is then done for each group.",
    " Règle : chaque colonne affichée <em>sans</em> fonction de calcul ({list}) doit figurer dans le GROUP BY.": " Rule: every column displayed <em>without</em> an aggregate function ({list}) must appear in the GROUP BY.",
    "Le regroupement": "Grouping",
    "La condition {h} porte sur le <em>résultat d'un calcul</em> : elle ne peut pas aller dans le WHERE (qui filtre les lignes avant le regroupement) ; elle se place dans <code>HAVING</code>, après le GROUP BY.": "The condition {h} applies to the <em>result of a calculation</em>: it cannot go in the WHERE (which filters rows before grouping); it goes in <code>HAVING</code>, after the GROUP BY.",
    " La valeur de comparaison vient d'une sous-requête sur {list}.": " The comparison value comes from a subquery on {list}.",
    "La condition sur les groupes": "The condition on groups",
    // 8. tri
    "{c} par ordre <strong>décroissant</strong> (DESC)": "{c} in <strong>descending</strong> order (DESC)",
    "{c} par ordre croissant (par défaut)": "{c} in ascending order (the default)",
    "L'énoncé demande un tri : {list}. Le second critère départage les égalités du premier. <code>ORDER BY</code> se place toujours à la fin.": "The question asks for sorting: {list}. The second criterion breaks ties in the first. <code>ORDER BY</code> always goes at the end.",
    "L'énoncé demande un tri : {list}. <code>ORDER BY</code> se place toujours à la fin.": "The question asks for sorting: {list}. <code>ORDER BY</code> always goes at the end.",
    "Le tri": "Sorting",
    "Le résultat": "The result",
    "J'exécute la requête et je vérifie que le résultat répond bien à l'énoncé (nombre de lignes, colonnes, valeurs).": "I run the query and check that the result really answers the question (number of rows, columns, values).",
    // requêtes de mise à jour
    "Il s'agit de modifier des lignes existantes : UPDATE. Je repère la table touchée : {t}. Une requête de mise à jour ne modifie qu'<strong>une seule table</strong>.": "The task is to change existing rows: UPDATE. I identify the table affected: {t}. A data-modification query only changes <strong>one table</strong>.",
    "Il s'agit de supprimer des lignes : DELETE. Je repère la table touchée : {t}. Une requête de mise à jour ne modifie qu'<strong>une seule table</strong>.": "The task is to delete rows: DELETE. I identify the table affected: {t}. A data-modification query only changes <strong>one table</strong>.",
    "Il s'agit de ajouter une ligne : INSERT INTO. Je repère la table touchée : {t}. Une requête de mise à jour ne modifie qu'<strong>une seule table</strong>.": "The task is to add a row: INSERT INTO. I identify the table affected: {t}. A data-modification query only changes <strong>one table</strong>.",
    "La table concernée": "The target table",
    " — la nouvelle valeur est calculée à partir de l'ancienne": " — the new value is calculated from the old one",
    "Après <code>SET</code>, j'indique chaque colonne à changer et sa nouvelle valeur :<ul>{lis}</ul>": "After <code>SET</code>, I give each column to change and its new value:<ul>{lis}</ul>",
    "Les nouvelles valeurs": "The new values",
    "Les valeurs proviennent d'une requête <code>SELECT</code> : chaque ligne qu'elle renvoie est ajoutée.": "The values come from a <code>SELECT</code> query: every row it returns is added.",
    "Les valeurs sont données dans le même ordre que les colonnes :<ul>{lis}</ul>": "The values are given in the same order as the columns:<ul>{lis}</ul>",
    " {c} est une clé étrangère : la valeur doit déjà exister dans {t}.": " {c} is a foreign key: the value must already exist in {t}.",
    " {c} sont des clés étrangères : la valeur doit déjà exister dans {t}.": " {c} are foreign keys: their values must already exist in {t}.",
    " Les textes et les dates s'écrivent entre apostrophes, pas les nombres.": " Text and dates go between single quotes; numbers don't.",
    "Les valeurs à ajouter": "The values to add",
    "Le <code>WHERE</code> cible les lignes concernées :<ul>{lis}</ul><strong>Sans WHERE, toutes les lignes seraient supprimées.</strong>": "The <code>WHERE</code> targets the rows concerned:<ul>{lis}</ul><strong>Without WHERE, every row would be deleted.</strong>",
    "Le <code>WHERE</code> cible les lignes concernées :<ul>{lis}</ul><strong>Sans WHERE, toutes les lignes seraient modifiées.</strong>": "The <code>WHERE</code> targets the rows concerned:<ul>{lis}</ul><strong>Without WHERE, every row would be changed.</strong>",
    " Attention : si des lignes de {t} font référence aux lignes supprimées, l'intégrité référentielle bloque la suppression.": " Watch out: if rows in {t} refer to the deleted rows, referential integrity blocks the deletion.",
    "Les lignes visées": "The targeted rows",
    "Pas de <code>WHERE</code> : <strong>toutes les lignes</strong> de {t} sont concernées. C'est voulu ici, mais à vérifier à chaque fois.": "No <code>WHERE</code>: <strong>every row</strong> of {t} is affected. That is intended here, but always check it.",
    "J'exécute la requête (sur une copie de la base) et je contrôle les lignes touchées.": "I run the query (on a copy of the database) and check the rows affected.",
    // schéma : lecture
    "Je lis les règles de gestion": "I read the business rules",
    "Je repère, dans le schéma de départ, les tables concernées par les nouvelles règles. Pour chaque règle, je cherche le <strong>type de lien</strong> :<ul><li>« un … est lié à <em>un seul</em> … » : relation un à plusieurs, une <strong>clé étrangère</strong> suffit (du côté « plusieurs ») ;</li><li>« un … peut être lié à <em>plusieurs</em> …, et inversement » : relation plusieurs à plusieurs, il faut une <strong>nouvelle table</strong> ;</li><li>un nouvel objet à décrire, avec ses propres informations : une nouvelle table.</li></ul>": "In the starting schema, I spot the tables affected by the new rules. For each rule, I look for the <strong>type of relationship</strong>:<ul><li>“a … is linked to <em>only one</em> …”: a one-to-many relationship, a <strong>foreign key</strong> is enough (on the “many” side);</li><li>“a … can be linked to <em>several</em> …, and vice versa”: a many-to-many relationship, a <strong>new table</strong> is needed;</li><li>a new object to describe, with its own information: a new table.</li></ul>",
    "<p>Ici, {n} nouvelle table à créer.</p>": "<p>Here, there is {n} new table to create.</p>",
    "<p>Ici, {n} nouvelles tables à créer.</p>": "<p>Here, there are {n} new tables to create.</p>",
    // schéma : retraits
    "{c} ne peut plus rester dans {t} : dans une ligne, une colonne ne contient qu'<em>une seule</em> valeur, or la nouvelle règle en demande plusieurs.": "{c} can no longer stay in {t}: in a row, a column holds only <em>one</em> value, but the new rule calls for several.",
    "{c} ne peuvent plus rester dans {t} : dans une ligne, une colonne ne contient qu'<em>une seule</em> valeur, or la nouvelle règle en demande plusieurs.": "{c} can no longer stay in {t}: in a row, a column holds only <em>one</em> value, but the new rule calls for several.",
    " L'information sera reprise dans {t}.": " This information moves to {t}.",
    "Une table disparaît": "A table disappears",
    "La table {t} n'a plus lieu d'être avec les nouvelles règles : je la supprime, avec les flèches qui y mènent.": "The {t} table is no longer needed under the new rules: I delete it, along with the arrows leading to it.",
    // schéma : nouvelles tables
    "Il faut {r} : je crée la table {t}.": "I need to {r}: I create the {t} table.",
    "je crée la table {t}.": "I create the {t} table.",
    " Sa clé primaire {pk} identifie chaque ligne ; elle porte {a}.": " Its primary key {pk} identifies each row; it holds {a}.",
    " Sa clé primaire {pk} identifie chaque ligne.": " Its primary key {pk} identifies each row.",
    " Sa clé contient {k} : une ligne de {t} n'existe qu'à l'intérieur de cette table.": " Its key contains {k}: a row of {t} only exists within that table.",
    " Sa clé contient {k} : une ligne de {t} n'existe qu'à l'intérieur de ces tables.": " Its key contains {k}: a row of {t} only exists within those tables.",
    " Chaque ligne est rattachée à un seul {r} : relation un à plusieurs, d'où la clé étrangère {k} et la flèche.": " Each row is attached to a single {r}: a one-to-many relationship, hence the foreign key {k} and the arrow.",
    "Une nouvelle table": "A new table",
    // schéma : clés étrangères
    "<p>Chaque ligne de {t} est liée à <em>un seul</em> {r}, qui peut l'être à plusieurs : relation <strong>un à plusieurs</strong>. J'ajoute la clé étrangère <i>#{k}</i> dans {t}, du côté « plusieurs » : la flèche part de {t} vers {r}.</p>": "<p>Each row of {t} is linked to <em>only one</em> {r}, which can be linked to several: a <strong>one-to-many</strong> relationship. I add the foreign key <i>#{k}</i> to {t}, on the “many” side: the arrow goes from {t} to {r}.</p>",
    "<p>J'ajoute {a} dans {t} : c'est une information sur chaque ligne de cette table.</p>": "<p>I add {a} to {t}: it is information about each row of this table.</p>",
    "<p>J'ajoute {a} dans {t} : ce sont des informations sur chaque ligne de cette table.</p>": "<p>I add {a} to {t}: they are information about each row of this table.</p>",
    "Une clé étrangère": "A foreign key",
    "Un nouvel attribut": "A new attribute",
    // schéma : tables de liaison
    "Règle : il faut {r}. ": "Rule: we need to {r}. ",
    "Le lien concerne {n} tables à la fois ({list}). ": "The relationship involves {n} tables at once ({list}). ",
    "Un {a} peut être lié à plusieurs {b}, et inversement : relation <strong>plusieurs à plusieurs</strong>. ": "One {a} can be linked to several {b}, and vice versa: a <strong>many-to-many</strong> relationship. ",
    "Une clé étrangère ne suffit pas (il faudrait plusieurs valeurs dans une case) : je crée la table {t}. Sa clé primaire <strong>associe</strong> les clés des tables reliées : {pk}.": "A foreign key is not enough (one cell would need several values): I create the {t} table. Its primary key <strong>combines</strong> the keys of the linked tables: {pk}.",
    "Une table de liaison": "A junction table",
    "<i>#{k}</i> renvoie à {t}": "<i>#{k}</i> refers to {t}",
    "Chaque partie de la clé est aussi une <strong>clé étrangère</strong> : {list}. D'où la flèche.": "Each part of the key is also a <strong>foreign key</strong>: {list}. Hence the arrow.",
    "Chaque partie de la clé est aussi une <strong>clé étrangère</strong> : {list}. D'où les flèches.": "Each part of the key is also a <strong>foreign key</strong>: {list}. Hence the arrows.",
    " {a} dépend à la fois de {r} : l'attribut se place dans {t}, la table du lien.": " {a} depends jointly on {r}: the attribute goes in {t}, the junction table.",
    " {a} dépendent à la fois de {r} : les attributs se placent dans {t}, la table du lien.": " {a} depend jointly on {r}: the attributes go in {t}, the junction table.",
    "Les clés étrangères de la table de liaison": "The junction table's foreign keys",
    // schéma : bilan
    "Le schéma final : {t} a été créée ou modifiée.": "The final schema: {t} was created or modified.",
    "Le schéma final : {t} ont été créées ou modifiées.": "The final schema: {t} were created or modified.",
    "<p>Pour vérifier : chaque nouvelle règle est-elle traduite ? chaque table a-t-elle une clé primaire ? chaque flèche part-elle d'une clé étrangère vers une clé primaire ?</p>": "<p>To check: is every new rule reflected? Does every table have a primary key? Does every arrow go from a foreign key to a primary key?</p>",
    "<p class=\"muted small\">Les noms peuvent varier : la vérification accepte les noms équivalents et reconnaît une table à sa clé primaire.</p>": "<p class=\"muted small\">Names may vary: the check accepts equivalent names and recognises a table by its primary key.</p>",
    "<p class=\"muted small\">Une autre solution est aussi acceptée : voir la correction.</p>": "<p class=\"muted small\">Another solution is also accepted: see the solution.</p>",
    "Le schéma final": "The final schema",
    // lecteur
    "Construction du schéma pas à pas": "Building the schema step by step",
    "Correction pas à pas": "Step-by-step solution",
    "Pas nécessaire ici": "Not needed here",
    "<i class=\"lg add\"></i>nouveau <i class=\"lg join\"></i>clé étrangère <i class=\"lg del\"></i>retiré <i class=\"lg inter\"></i>table reliée": "<i class=\"lg add\"></i>new <i class=\"lg join\"></i>foreign key <i class=\"lg del\"></i>removed <i class=\"lg inter\"></i>linked table",
    "<i class=\"lg sel\"></i>affiché <i class=\"lg filt\"></i>filtre <i class=\"lg join\"></i>jointure <i class=\"lg inter\"></i>table de passage": "<i class=\"lg sel\"></i>displayed <i class=\"lg filt\"></i>filter <i class=\"lg join\"></i>join <i class=\"lg inter\"></i>linking table",
    "<strong>{n}</strong> ligne": "<strong>{n}</strong> row",
    "<strong>{n}</strong> lignes": "<strong>{n}</strong> rows",
    " (les {m} premières)": " (first {m} shown)",
    "<strong>{n}</strong> ligne touchée (sur une copie : la base n'est pas modifiée).": "<strong>{n}</strong> row affected (on a copy: the database is not changed).",
    "<strong>{n}</strong> lignes touchées (sur une copie : la base n'est pas modifiée).": "<strong>{n}</strong> rows affected (on a copy: the database is not changed).",
    "<p class=\"muted small\">La correction contient {n} requêtes : seule la première est détaillée ici.</p>": "<p class=\"muted small\">The solution contains {n} queries: only the first one is explained here.</p>",
    "Exécution impossible : {e}": "Cannot run the query: {e}",
    "⏸ Pause": "⏸ Pause",
    "⏵ Lecture auto": "⏵ Autoplay",
    // textes statiques du dialogue #cinemaDialog (index.html, traduits par I18N.dom)
    "Fermer": "Close",
    "Étapes de construction de la requête": "Steps for building the query",
    "Revenir au début": "Back to the start",
    "◀ Précédent": "◀ Previous",
    "Suivant ▶": "Next ▶",
    "affiché": "displayed",
    "filtre": "filter",
    "jointure": "join",
    "table de passage": "linking table",
  });

  // ------------------------------------------------------------ masques
  // Deux masques de même longueur que la requête :
  //  - « split » : chaînes et contenu des parenthèses neutralisés (découpage au niveau 0)
  //  - « ident » : chaînes et sous-requêtes neutralisées (recherche des colonnes)
  const HIDE = "·";

  function masks(sql) {
    let split = "", ident = "";
    let depth = 0, sub = 0; // sub : profondeur à laquelle commence une sous-requête masquée
    for (let i = 0; i < sql.length; i++) {
      const c = sql[i];
      const isQuote = c === "'" || c === '"' || (c === "#" && /\d/.test(sql[i + 1] || ""));
      if (isQuote) {
        let j = i + 1;
        for (; j < sql.length; j++) {
          if (sql[j] === c) { if (c !== "#" && sql[j + 1] === c) { j++; continue; } break; }
        }
        const len = Math.min(j, sql.length - 1) - i + 1;
        const inner = c + HIDE.repeat(Math.max(0, len - 2)) + (len > 1 ? c : "");
        split += depth ? HIDE.repeat(len) : inner;
        ident += sub ? HIDE.repeat(len) : inner;
        i += len - 1;
        continue;
      }
      if (c === "(") {
        depth++;
        if (!sub && /^\(\s*SELECT\b/i.test(sql.slice(i, i + 20))) { sub = depth; ident += "("; }
        else ident += sub ? HIDE : "(";
        split += depth === 1 ? "(" : HIDE;
        continue;
      }
      if (c === ")") {
        split += depth === 1 ? ")" : HIDE;
        if (sub && depth === sub) { sub = 0; ident += ")"; }
        else ident += sub ? HIDE : ")";
        depth = Math.max(0, depth - 1);
        continue;
      }
      split += depth ? HIDE : c;
      ident += sub ? HIDE : c;
    }
    return { split, ident };
  }

  /** Morceau de requête : texte d'origine + masques, mêmes indices */
  function piece(t, s, k, a = 0, b = t.length) {
    let x = a, y = b;
    while (x < y && /\s/.test(t[x])) x++;
    while (y > x && /\s/.test(t[y - 1])) y--;
    return { t: t.slice(x, y), s: s.slice(x, y), k: k.slice(x, y) };
  }
  function mk(t) { const m = masks(t); return piece(t, m.split, m.ident); }
  function sub(p, a, b) { return piece(p.t, p.s, p.k, a, b); }

  function splitBy(p, re) {
    const out = [];
    let start = 0, m;
    const g = new RegExp(re.source, "gi");
    while ((m = g.exec(p.s))) { out.push(sub(p, start, m.index)); start = m.index + m[0].length; }
    out.push(sub(p, start));
    return out.filter((x) => x.t);
  }

  /** Découpe sur AND au niveau 0, sans couper « BETWEEN x AND y » */
  function splitAnd(p) {
    const out = [];
    let start = 0, between = false, m;
    const g = /\b(AND|BETWEEN)\b/gi;
    while ((m = g.exec(p.s))) {
      if (m[1].toUpperCase() === "BETWEEN") { between = true; continue; }
      if (between) { between = false; continue; }
      out.push(sub(p, start, m.index));
      start = m.index + 3;
    }
    out.push(sub(p, start));
    return out.filter((x) => x.t);
  }

  /** Clauses de premier niveau : { SELECT: piece, FROM: piece, … } */
  function clauses(p, names) {
    const re = new RegExp("\\b(" + names.map((n) => n.replace(" ", "\\s+")).join("|") + ")\\b", "gi");
    const hits = [];
    let m;
    while ((m = re.exec(p.s))) hits.push({ name: m[1].toUpperCase().replace(/\s+/g, " "), at: m.index, end: m.index + m[0].length });
    const out = {};
    hits.forEach((h, i) => {
      if (out[h.name]) return;
      out[h.name] = sub(p, h.end, i + 1 < hits.length ? hits[i + 1].at : p.t.length);
    });
    return out;
  }

  /** Sous-requêtes présentes dans un morceau (texte intérieur) */
  function subqueries(p) {
    const out = [];
    for (let i = 0; i < p.k.length; i++) {
      if (p.k[i] !== "(" || !/^\(\s*SELECT\b/i.test(p.t.slice(i, i + 20))) continue;
      let j = i + 1;
      while (j < p.k.length && p.k[j] !== ")") j++;
      out.push(p.t.slice(i + 1, j));
      i = j;
    }
    return out;
  }

  // ------------------------------------------------------------ résolution des noms
  const low = (x) => String(x || "").toLowerCase();
  const unq = (x) => String(x || "").replace(/^[\["`]|[\]"`]$/g, "");

  function tableOf(schema, name) { return schema.find((t) => low(t.name) === low(unq(name))) || null; }
  function colOf(t, name) { return t ? t.cols.find((c) => low(c.name) === low(unq(name))) || null : null; }

  /** Référence de colonne → { e (entrée du FROM), col } */
  function resolve(from, prefix, name) {
    if (prefix) {
      const e = from.find((x) => low(x.alias) === low(prefix)) || from.find((x) => low(x.table) === low(prefix));
      const c = e && colOf(e.t, name);
      return c ? { e, col: c.name } : null;
    }
    for (const e of from) { const c = colOf(e.t, name); if (c) return { e, col: c.name }; }
    return null;
  }

  /** Colonnes citées dans un morceau (hors chaînes et sous-requêtes) */
  function columnsIn(p, from) {
    const out = [];
    const re = /(?:([A-Za-z_À-ÿ][\wÀ-ÿ]*)\s*\.\s*)?([A-Za-z_À-ÿ][\wÀ-ÿ]*)(\s*\()?/g;
    let m;
    while ((m = re.exec(p.k))) {
      if (m[3]) continue; // appel de fonction
      const r = resolve(from, m[1], m[2]);
      if (r && !out.some((x) => x.e === r.e && x.col === r.col)) out.push(r);
    }
    return out;
  }

  // ------------------------------------------------------------ analyse
  const AGG = /\b(COUNT|SUM|AVG|MIN|MAX)\s*\(/i;

  function parseFrom(p, schema) {
    const from = [], joins = [];
    const ref = (x) => {
      const m = /^([\w\[\]"`À-ÿ]+)(?:\s+(?:AS\s+)?([\wÀ-ÿ]+))?$/i.exec(x.t.replace(/\s+/g, " "));
      if (!m) return null;
      const e = { table: unq(m[1]), alias: m[2] || null, text: x.t };
      e.t = tableOf(schema, e.table);
      if (e.t) e.table = e.t.name;
      return e;
    };
    if (/\bJOIN\b/i.test(p.s)) {
      const parts = splitBy(p, /\b(?:(?:INNER|LEFT|RIGHT|FULL)\s+(?:OUTER\s+)?)?JOIN\b/);
      parts.forEach((x, i) => {
        const on = /\bON\b/i.exec(x.s);
        const tp = on ? sub(x, 0, on.index) : x;
        const e = ref(tp);
        if (e) from.push(e);
        if (on && i > 0) joins.push(...splitAnd(sub(x, on.index + 2)).map((c) => ({ p: c, explicit: true })));
      });
      return { from, onConds: joins, explicit: true };
    }
    for (const x of splitBy(p, /,/)) { const e = ref(x); if (e) from.push(e); }
    return { from, onConds: [], explicit: false };
  }

  function classify(c, from) {
    const m = /^\s*((?:[\wÀ-ÿ]+\s*\.\s*)?[\wÀ-ÿ]+)\s*=\s*((?:[\wÀ-ÿ]+\s*\.\s*)?[\wÀ-ÿ]+)\s*$/.exec(c.k);
    if (m) {
      const side = (s) => { const [a, b] = s.includes(".") ? s.split(".").map((x) => x.trim()) : [null, s.trim()]; return resolve(from, a, b); };
      const a = side(m[1]), b = side(m[2]);
      if (a && b && a.e !== b.e) return { kind: "join", a, b };
    }
    return { kind: "filter", cols: columnsIn(c, from) };
  }

  function parseSelect(sql, schema) {
    const p = mk(sql);
    const cl = clauses(p, ["SELECT", "FROM", "WHERE", "GROUP BY", "HAVING", "ORDER BY"]);
    if (!cl.SELECT || !cl.FROM) return null;
    let sel = cl.SELECT, distinct = false;
    const dm = /^DISTINCT\b/i.exec(sel.s);
    if (dm) { distinct = true; sel = sub(sel, dm[0].length); }
    const F = parseFrom(cl.FROM, schema);
    const from = F.from;
    if (!from.length) return null;
    const items = splitBy(sel, /,/).map((x) => {
      const am = /\s+(?:AS\s+)?([\wÀ-ÿ]+|\[[^\]]*\]|"[^"]*")$/i.exec(x.s);
      let expr = x, alias = null;
      // un alias sans AS n'est retenu que si l'expression n'est pas une simple colonne préfixée
      if (am && (/\bAS\s/i.test(am[0]) || /[)\w\]]\s+[\wÀ-ÿ\["]/.test(x.s)) && !/^\s*[\wÀ-ÿ.]+\s*$/.test(x.s)) {
        expr = sub(x, 0, am.index); alias = unq(x.t.slice(am.index).replace(/^\s+(?:AS\s+)?/i, ""));
      }
      return { p: x, expr, alias, cols: columnsIn(expr, from), agg: AGG.test(expr.s) };
    });
    const conds = [];
    for (const c of F.onConds) conds.push({ p: c.p, explicit: true, ...classify(c.p, from) });
    if (cl.WHERE) for (const c of splitAnd(cl.WHERE)) conds.push({ p: c, ...classify(c, from) });
    for (const c of conds) c.subs = subqueries(c.p).map((s) => build(s, schema)).filter(Boolean);
    const group = cl["GROUP BY"] ? splitBy(cl["GROUP BY"], /,/).map((x) => ({ p: x, cols: columnsIn(x, from) })) : [];
    const having = cl.HAVING ? splitAnd(cl.HAVING).map((x) => ({ p: x, cols: columnsIn(x, from), subs: subqueries(x).map((s) => build(s, schema)).filter(Boolean) })) : [];
    const order = cl["ORDER BY"] ? splitBy(cl["ORDER BY"], /,/).map((x) => {
      const desc = /\bDESC\s*$/i.test(x.s);
      const e = sub(x, 0, x.t.replace(/\s+(ASC|DESC)\s*$/i, "").length);
      return { p: x, expr: e, desc, cols: columnsIn(e, from) };
    }) : [];
    return { kind: "select", distinct, items, from, explicit: F.explicit, conds, group, having, order, fromClause: cl.FROM };
  }

  function parseWrite(sql, schema) {
    const p = mk(sql);
    let m;
    if ((m = /^UPDATE\s+([\w\[\]"À-ÿ]+)(?:\s+(?:AS\s+)?([\wÀ-ÿ]+))?\s+SET\b/i.exec(p.s))) {
      const e = { table: unq(m[1]), alias: m[2] || null }; e.t = tableOf(schema, e.table); if (e.t) e.table = e.t.name;
      const rest = sub(p, m[0].length);
      const w = /\bWHERE\b/i.exec(rest.s);
      const set = w ? sub(rest, 0, w.index) : rest;
      const where = w ? sub(rest, w.index + 5) : null;
      const sets = splitBy(set, /,/).map((x) => {
        const eq = x.s.indexOf("=");
        return { p: x, col: x.t.slice(0, eq).trim().replace(/^.*\./, ""), val: sub(x, eq + 1) };
      });
      const conds = where ? splitAnd(where).map((c) => ({ p: c, kind: "filter", cols: columnsIn(c, [e]), subs: subqueries(c).map((s) => build(s, schema)).filter(Boolean) })) : [];
      return { kind: "update", e, sets, conds, sql: p.t };
    }
    if ((m = /^DELETE\s+FROM\s+([\w\[\]"À-ÿ]+)/i.exec(p.s))) {
      const e = { table: unq(m[1]) }; e.t = tableOf(schema, e.table); if (e.t) e.table = e.t.name;
      const rest = sub(p, m[0].length);
      const w = /\bWHERE\b/i.exec(rest.s);
      const conds = w ? splitAnd(sub(rest, w.index + 5)).map((c) => ({ p: c, kind: "filter", cols: columnsIn(c, [e]), subs: subqueries(c).map((s) => build(s, schema)).filter(Boolean) })) : [];
      return { kind: "delete", e, conds, sql: p.t };
    }
    if ((m = /^INSERT\s+INTO\s+([\w\[\]"À-ÿ]+)\s*/i.exec(p.s))) {
      const e = { table: unq(m[1]) }; e.t = tableOf(schema, e.table); if (e.t) e.table = e.t.name;
      let rest = sub(p, m[0].length);
      let cols = null;
      if (rest.s[0] === "(") {
        const j = rest.s.indexOf(")");
        cols = rest.t.slice(1, j).split(",").map((x) => unq(x.trim()));
        rest = sub(rest, j + 1);
      }
      const v = /^VALUES\s*/i.exec(rest.s);
      let rows = [];
      let select = null;
      if (v) {
        const r = sub(rest, v[0].length);
        rows = splitBy(r, /,/).map((x) => {
          const inner = x.t.replace(/^\(|\)$/g, "");
          return splitBy(mk(inner), /,/).map((y) => y.t);
        });
      } else if (/^SELECT\b/i.test(rest.s)) select = build(rest.t, schema);
      if (!cols && e.t) cols = e.t.cols.map((c) => c.name);
      return { kind: "insert", e, cols: cols || [], rows, select, sql: p.t };
    }
    return null;
  }

  function statements(sql) {
    const m = masks(sql);
    const out = [];
    let start = 0;
    for (let i = 0; i < m.split.length; i++) if (m.split[i] === ";") { out.push(sql.slice(start, i)); start = i + 1; }
    out.push(sql.slice(start));
    return out.map((s) => s.replace(/--[^\n]*/g, "").trim()).filter(Boolean);
  }

  function build(sql, schema) {
    const s = statements(sql)[0];
    if (!s) return null;
    return /^SELECT\b/i.test(s) ? parseSelect(s, schema) : parseWrite(s, schema);
  }

  // ------------------------------------------------------------ rédaction
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const code = (s) => `<code>${esc(s)}</code>`;
  const tb = (s) => `<b class="cn-t">${esc(s)}</b>`;
  function listFr(a) {
    if (a.length <= 1) return a.join("");
    return tr("{a} et {b}", { a: a.slice(0, -1).join(", "), b: a[a.length - 1] });
  }

  function describeExpr(p) {
    const s = p.s, t = p.t;
    let m;
    if (/^\*$/.test(t.trim())) return tr("toutes les colonnes");
    if ((m = /^COUNT\s*\(\s*\*\s*\)$/i.exec(t.trim()))) return tr("compte les lignes");
    if ((m = /^COUNT\s*\(\s*DISTINCT\b/i.exec(t))) return tr("compte les valeurs <em>différentes</em>");
    if (/^COUNT\s*\(/i.test(s)) return tr("compte les lignes où la colonne est renseignée");
    if (/^SUM\s*\(/i.test(s)) return tr("fait la somme");
    if (/^AVG\s*\(/i.test(s)) return tr("calcule la moyenne");
    if (/^MIN\s*\(/i.test(s)) return tr("retient la plus petite valeur");
    if (/^MAX\s*\(/i.test(s)) return tr("retient la plus grande valeur");
    if (/^(YEAR|ANNEE)\s*\(/i.test(s)) return tr("extrait l'année de la date");
    if (/^(MONTH|MOIS)\s*\(/i.test(s)) return tr("extrait le mois de la date");
    if (/^DATEDIFF\s*\(/i.test(s)) return tr("nombre de jours entre deux dates");
    if (AGG.test(s)) return tr("calcul à partir d'un regroupement");
    if (/[-+*/]/.test(s.replace(/[\wÀ-ÿ]+\.[\wÀ-ÿ]+/g, ""))) return tr("colonne calculée");
    return "";
  }

  function describeCond(c) {
    const s = c.p.s, k = c.p.k;
    const subT = (c.subs || []).flatMap((q) => (q.from || (q.e ? [q.e] : [])).map((e) => e.table));
    const subTxt = subT.length ? tr(" sur {t}", { t: listFr([...new Set(subT)].map(tb)) }) : "";
    const sv = { sub: subTxt };
    if (/\bNOT\s+EXISTS\s*\(/i.test(s)) return tr("<strong>sous-requête</strong>{sub} : je garde les lignes pour lesquelles elle ne renvoie <em>rien</em> (NOT EXISTS).", sv);
    if (/\bEXISTS\s*\(/i.test(s)) return tr("<strong>sous-requête</strong>{sub} : je garde les lignes pour lesquelles elle renvoie au moins une ligne (EXISTS).", sv);
    if (/\bNOT\s+IN\s*\(/i.test(s) && c.subs && c.subs.length) return tr("<strong>sous-requête</strong>{sub} : elle calcule d'abord une liste, puis je garde les lignes qui n'y figurent <em>pas</em> (NOT IN). C'est la traduction de « n'a jamais… », « aucun… ».", sv);
    if (/\bIN\s*\(/i.test(s) && c.subs && c.subs.length) return tr("<strong>sous-requête</strong>{sub} : elle calcule d'abord une liste, puis je garde les lignes qui y figurent (IN).", sv);
    if (c.subs && c.subs.length) return tr("la valeur de comparaison est calculée par une <strong>sous-requête</strong>{sub}, exécutée d'abord.", sv);
    if (/\bIS\s+NOT\s+NULL\b/i.test(s)) return tr("valeur <em>renseignée</em> : IS NOT NULL.");
    if (/\bIS\s+NULL\b/i.test(s)) return tr("valeur <em>vide</em> (non renseignée) : IS NULL — jamais <code>= NULL</code>.");
    if (/\bNOT\s+IN\s*\(/i.test(s)) return tr("la valeur ne doit être aucune de celles de la liste (NOT IN).");
    if (/\bIN\s*\(/i.test(s)) return tr("la valeur doit être l'une de celles de la liste (IN).");
    if (/\bBETWEEN\b/i.test(s)) return tr("BETWEEN … AND … : bornes comprises.");
    if (/\bLIKE\b/i.test(s)) return tr("LIKE : <code>%</code> remplace n'importe quelle suite de caractères.");
    if (/\b(YEAR|ANNEE)\s*\(/i.test(k) && /\b(MONTH|MOIS)\s*\(/i.test(k)) return tr("on extrait le mois et l'année de la date.");
    if (/\b(YEAR|ANNEE)\s*\(/i.test(k)) return tr("YEAR() extrait l'année de la date.");
    if (/\b(MONTH|MOIS)\s*\(/i.test(k)) return tr("MONTH() extrait le mois de la date.");
    if (/\bOR\b/i.test(s)) return tr("l'une <em>ou</em> l'autre condition suffit : les parenthèses évitent de mélanger OR et AND.");
    if (/'/.test(s) || /"/.test(s)) return tr("le texte entre apostrophes doit être écrit exactement comme dans la base.");
    if (/[#]\d|\d{2}\/\d{2}\/\d{4}/.test(c.p.t)) return tr("comparaison de dates.");
    return "";
  }

  function fkBetween(a, b) {
    // a.col référence-t-elle b ?
    const c = colOf(a.e.t, a.col);
    return !!(c && c.fk && low(c.fk.split(".")[0]) === low(b.e.table));
  }

  // ------------------------------------------------------------ étapes
  const PHASES_SELECT = [
    ["tables", "Tables"], ["passages", "Tables de passage"], ["alias", "Alias"], ["select", "Colonnes"],
    ["jointures", "Jointures"], ["filtres", "Filtres"], ["groupe", "Regroupement"], ["tri", "Tri"], ["resultat", "Résultat"],
  ];
  const PHASES_WRITE = [["table", "Table"], ["valeurs", "Valeurs"], ["ciblage", "Lignes visées"], ["resultat", "Résultat"]];

  function addCols(map, list, kind) {
    for (const r of list) {
      const t = r.e.table;
      map[t] = map[t] || {};
      if (!map[t][r.col] || kind === "join") map[t][r.col] = kind;
    }
    return map;
  }
  const clone = (o) => JSON.parse(JSON.stringify(o));

  function selectSteps(Q) {
    const steps = [];
    const joins = Q.conds.filter((c) => c.kind === "join");
    const filters = Q.conds.filter((c) => c.kind === "filter");
    const name = (e) => e.alias || e.table;
    const usedBy = new Map(Q.from.map((e) => [e, []]));
    const push = (list) => { for (const r of list) { const l = usedBy.get(r.e); if (l && !l.includes(r.col)) l.push(r.col); } };
    for (const it of Q.items) push(it.cols);
    for (const f of filters) push(f.cols);
    for (const g of Q.group) push(g.cols);
    for (const h of Q.having) push(h.cols);
    for (const o of Q.order) push(o.cols);
    const star = Q.items.some((it) => it.expr.t.trim() === "*");
    let main = Q.from.filter((e) => usedBy.get(e).length);
    if (!main.length || star) main = Q.from.slice();
    // COUNT(*) : la table dont on compte les lignes n'apporte aucune colonne, mais elle n'est pas
    // une simple table de passage. C'est celle qui ne porte que des clés étrangères vers les autres.
    const counted = new Set();
    if (Q.items.some((it) => /COUNT\s*\(\s*\*\s*\)/i.test(it.expr.t))) {
      for (const e of Q.from) {
        if (main.includes(e)) continue;
        const js = joins.filter((j) => j.a.e === e || j.b.e === e);
        if (js.length && js.every((j) => { const me = j.a.e === e ? j.a : j.b, other = me === j.a ? j.b : j.a; return fkBetween(me, other); })) counted.add(e);
      }
      if (counted.size === 1) main = Q.from.filter((e) => main.includes(e) || counted.has(e));
      else counted.clear();
    }
    const inter = Q.from.filter((e) => !main.includes(e));
    const tableNames = (list) => [...new Set(list.map((e) => e.table))];
    const subTables = (list) => [...new Set(list.flatMap((c) => (c.subs || []).flatMap((q) => (q.from || (q.e ? [q.e] : [])).map((e) => e.table))))];

    // état cumulatif de la requête affichée
    const shown = { select: false, from: null, where: [], group: false, having: false, order: false };
    const focus = { main: tableNames(main), inter: [], sub: [], cols: {}, aliases: {}, links: [], now: [] };
    const plainFrom = (list) => list.map((e) => e.table).join(", ");
    const hot = (list) => list.map((r) => [r.e.table, r.col]);
    const snap = (phase, title, text, newParts, extra = {}) => {
      steps.push({ phase, title, text, sql: clone(shown), fresh: newParts, focus: clone({ ...focus, ...extra }) });
      focus.now = [];
    };

    // 1. tables évidentes
    const colsTxt = (e) => counted.has(e) ? tr(" (ce sont ses lignes que l'on compte)") : usedBy.get(e).length ? ` (${usedBy.get(e).map(esc).join(", ")})` : "";
    addCols(focus.cols, Q.items.flatMap((it) => it.cols), "sel");
    addCols(focus.cols, filters.flatMap((f) => f.cols), "filt");
    addCols(focus.cols, Q.having.flatMap((h) => h.cols), "filt");
    addCols(focus.cols, Q.group.flatMap((g) => g.cols), "grp");
    addCols(focus.cols, Q.order.flatMap((o) => o.cols), "ord");
    let t1;
    if (Q.from.length === 1) {
      t1 = tr("Je lis l'énoncé et je cherche où se trouvent les informations demandées : tout est dans la table {t}{cols}. Une seule table, donc <strong>pas de jointure</strong>.", { t: tb(Q.from[0].table), cols: colsTxt(Q.from[0]) });
    } else {
      t1 = tr("Je lis l'énoncé et je repère les tables qui contiennent les informations demandées (à afficher ou à filtrer) : {list}.",
        { list: listFr(main.map((e) => tb(e.table) + colsTxt(e))) });
      if (!inter.length) t1 += trn(main.length - 1, " Sur le schéma, elles sont reliées directement par une flèche : pas besoin de table intermédiaire.", " Sur le schéma, elles sont reliées directement par des flèches : pas besoin de table intermédiaire.");
    }
    shown.from = Q.explicit ? null : (inter.length ? plainFrom(main) : plainFrom(Q.from));
    snap("tables", tr("Les tables évidentes"), t1, ["from"], { hot: main.flatMap((e) => usedBy.get(e).map((col) => [e.table, col])) });

    // 2. tables de passage
    if (inter.length) {
      const why = inter.map((e) => {
        const nb = joins.filter((j) => j.a.e === e || j.b.e === e).map((j) => (j.a.e === e ? j.b.e : j.a.e).table);
        const u = [...new Set(nb)];
        return u.length >= 2 ? tr("{t} fait le lien entre {list}", { t: tb(e.table), list: listFr(u.map(tb)) }) : tr("{t} est nécessaire pour atteindre {list}", { t: tb(e.table), list: listFr(u.map(tb)) || tr("les autres tables") });
      });
      const text = tr("Ces tables ne sont pas reliées directement : je suis les flèches du schéma. {why}. ", { why: why.join(tr(" ; ")) }) +
        trn(inter.length, "Elle n'apporte aucune colonne au résultat, mais elle doit figurer dans le FROM pour faire le chemin.", "Elles n'apportent aucune colonne au résultat, mais elles doivent figurer dans le FROM pour faire le chemin.");
      focus.inter = tableNames(inter);
      addCols(focus.cols, joins.flatMap((j) => [j.a, j.b]).filter((r) => inter.includes(r.e)), "join");
      shown.from = Q.explicit ? null : plainFrom(Q.from);
      snap("passages", tr("Les tables de passage"), text, ["from"], { hot: hot(joins.flatMap((j) => [j.a, j.b]).filter((r) => inter.includes(r.e))) });
    }

    // 3. alias
    const aliased = Q.from.filter((e) => e.alias);
    if (aliased.length) {
      const twice = Q.from.filter((e, i) => Q.from.findIndex((x) => low(x.table) === low(e.table)) !== i).map((e) => e.table);
      let text = trn(aliased.length,
        "Pour éviter de répéter les noms complets, je donne un surnom (alias) à la table dans le FROM : {list}. Ensuite j'écris {ex} au lieu du nom complet.",
        "Pour éviter de répéter les noms complets, je donne un surnom (alias) à chaque table dans le FROM : {list}. Ensuite j'écris {ex} au lieu du nom complet.", {
          list: listFr(aliased.map((e) => tr("{a} pour {t}", { a: code(e.alias), t: tb(e.table) }))),
          ex: code(aliased[0].alias + "." + (aliased[0].t && aliased[0].t.cols[0] ? aliased[0].t.cols[0].name : tr("colonne"))),
        });
      if (twice.length) text += tr(" Ici la table {t} est utilisée deux fois : les alias sont <strong>obligatoires</strong> pour distinguer ses deux rôles.", { t: tb(twice[0]) });
      for (const e of aliased) focus.aliases[e.table] = focus.aliases[e.table] ? focus.aliases[e.table] + " / " + e.alias : e.alias;
      shown.from = Q.explicit ? null : Q.fromClause.t.replace(/\s+/g, " ");
      snap("alias", tr("Les alias"), text, ["from"]);
    }

    // 4. SELECT
    {
      const lis = Q.items.map((it) => {
        let d = describeExpr(it.expr);
        const c0 = it.cols[0];
        if (!d && c0 && /\./.test(it.expr.t) && Q.from.filter((e) => colOf(e.t, c0.col)).length > 1) {
          const others = Q.from.filter((e) => e !== c0.e && colOf(e.t, c0.col));
          const same = others.filter((e) => e.table === c0.e.table);
          d = same.length
            ? tr("{t} figure deux fois : l'alias {a} dit de quelle copie il s'agit", { t: tb(c0.e.table), a: code(c0.e.alias || c0.e.table) })
            : tr("{c} existe aussi dans {list} : je précise la table", { c: esc(c0.col), list: listFr([...new Set(others.map((e) => e.table))].map(tb)) });
        }
        if (it.alias) d = (d ? d + ", " : "") + tr("colonne renommée « {a} »", { a: esc(it.alias) });
        return `<li>${code(it.p.t)}${d ? " — " + d : ""}</li>`;
      });
      let text = tr("Je liste ce que je veux voir apparaître, dans l'ordre de l'énoncé :<ul>{lis}</ul>", { lis: lis.join("") });
      if (Q.distinct) text += tr("<p>« Sans doublon » : {d} supprime les lignes identiques du résultat.</p>", { d: code("DISTINCT") });
      if (Q.items.some((it) => it.agg) && !Q.group.length) text += tr("<p>Pas de GROUP BY : le calcul porte sur toutes les lignes retenues, le résultat tient en <strong>une ligne</strong>.</p>");
      text += tr('<p class="muted small">Le SELECT s\'écrit en premier, mais on le remplit une fois qu\'on sait d\'où viennent les données.</p>');
      addCols(focus.cols, Q.items.flatMap((it) => it.cols), "sel");
      shown.select = true;
      if (Q.explicit) shown.from = null;
      snap("select", tr("Ce que je veux voir"), text, ["select"], { hot: hot(Q.items.flatMap((it) => it.cols)) });
    }

    // 5. jointures
    if (Q.explicit) {
      shown.from = Q.fromClause.t.replace(/\s+/g, " ");
      for (const j of joins) { focus.links.push([j.a.e.table, j.b.e.table]); focus.now.push([j.a.e.table, j.b.e.table]); }
      addCols(focus.cols, joins.flatMap((j) => [j.a, j.b]), "join");
      const n = Q.from.length;
      snap("jointures", tr("Les jointures"), trn(n - 1, "{t} tables, donc {n} jointure, écrites ici avec {c} : chaque ON égalise une clé étrangère et la clé primaire qu'elle référence.", "{t} tables, donc {n} jointures, écrites ici avec {c} : chaque ON égalise une clé étrangère et la clé primaire qu'elle référence.", { t: n, c: code("INNER JOIN … ON") }), ["from"]);
    } else {
      // une jointure = une paire de tables ; plusieurs égalités si la clé est composée
      const groups = [];
      for (const j of joins) {
        const g = groups.find((x) => (x.a === j.a.e && x.b === j.b.e) || (x.a === j.b.e && x.b === j.a.e));
        if (g) g.list.push(j); else groups.push({ a: j.a.e, b: j.b.e, list: [j] });
      }
      groups.forEach((g, i) => {
        const j = g.list[0];
        const [fk, pk] = fkBetween(j.a, j.b) ? [j.a, j.b] : fkBetween(j.b, j.a) ? [j.b, j.a] : [j.a, j.b];
        const linked = fkBetween(fk, pk);
        let text = i === 0 ? trn(Q.from.length - 1, "Avec {t} tables dans le FROM, il faut {n} jointure (une de moins que de tables), sinon chaque ligne serait combinée avec toutes les autres (produit cartésien). ", "Avec {t} tables dans le FROM, il faut {n} jointures (une de moins que de tables), sinon chaque ligne serait combinée avec toutes les autres (produit cartésien). ", { t: Q.from.length }) : "";
        if (g.list.length > 1) {
          text += tr("Je relie {a} et {b}. La clé est <strong>composée</strong> de {n} colonnes ({list}) : il faut égaliser <em>chacune</em> d'elles, sinon la jointure associe des lignes qui ne vont pas ensemble.", { a: tb(fk.e.table), b: tb(pk.e.table), n: g.list.length, list: listFr(g.list.map((x) => code(x.a.col))) });
        } else {
          text += linked
            ? tr("Je relie {a} et {b} : la clé étrangère <i>#{fk}</i> de {a} pointe vers la clé primaire <u>{pk}</u> de {b}.", { a: tb(fk.e.table), b: tb(pk.e.table), fk: esc(fk.col), pk: esc(pk.col) })
            : tr("Je relie {a} et {b} par leur colonne commune.", { a: tb(j.a.e.table), b: tb(j.b.e.table) });
          if (low(fk.col) === low(pk.col)) text += tr(" La colonne porte le même nom dans les deux tables : je la préfixe ({c}).", { c: code(name(fk.e) + "." + fk.col) });
        }
        if (g.a.table === g.b.table) text += tr(" C'est la même table utilisée deux fois (relation réflexive) : les alias distinguent les deux rôles.");
        focus.links.push([g.a.table, g.b.table]);
        focus.now.push([g.a.table, g.b.table]);
        addCols(focus.cols, g.list.flatMap((x) => [x.a, x.b]), "join");
        for (const x of g.list) shown.where.push(Q.conds.indexOf(x));
        snap("jointures", groups.length > 1 ? tr("Jointure {i} / {n}", { i: i + 1, n: groups.length }) : tr("La jointure"), text, g.list.map((x) => "w" + Q.conds.indexOf(x)), { hot: hot(g.list.flatMap((x) => [x.a, x.b])) });
      });
    }

    // 6. filtres
    filters.forEach((f, i) => {
      const d = describeCond(f);
      const c = code(f.p.t.replace(/\s+/g, " "));
      const b = d ? tr("{c} : {d}", { c, d }) : c + ".";
      const text = i === 0 ? tr("Je ne garde que les lignes qui répondent à l'énoncé. {b}", { b }) : tr("J'ajoute une condition avec AND : {b}", { b });
      addCols(focus.cols, f.cols, "filt");
      const st = subTables([f]);
      if (st.length) focus.sub = [...new Set([...focus.sub, ...st])];
      shown.where.push(Q.conds.indexOf(f));
      snap("filtres", filters.length > 1 ? tr("Filtre {i} / {n}", { i: i + 1, n: filters.length }) : tr("Le filtre"), text, ["w" + Q.conds.indexOf(f)], { hot: hot(f.cols) });
    });

    // 7. regroupement
    if (Q.group.length) {
      const plain = Q.items.filter((it) => !it.agg && it.expr.t.trim() !== "*").map((it) => code(it.expr.t));
      let text = tr("Le calcul est demandé « par » {g} : je regroupe les lignes avec <code>GROUP BY</code>. Le calcul ({c}) est alors fait pour chaque groupe.",
        { g: listFr(Q.group.map((g) => code(g.p.t))), c: listFr(Q.items.filter((it) => it.agg).map((it) => code(it.expr.t))) || tr("fonction") });
      if (plain.length) text += tr(" Règle : chaque colonne affichée <em>sans</em> fonction de calcul ({list}) doit figurer dans le GROUP BY.", { list: listFr(plain) });
      addCols(focus.cols, Q.group.flatMap((g) => g.cols), "grp");
      shown.group = true;
      snap("groupe", tr("Le regroupement"), text, ["group"], { hot: hot(Q.group.flatMap((g) => g.cols)) });
    }
    if (Q.having.length) {
      const st = [...new Set(Q.having.flatMap((h) => (h.subs || []).flatMap((q) => (q.from || []).map((e) => e.table))))];
      if (st.length) focus.sub = [...new Set([...focus.sub, ...st])];
      const text = tr("La condition {h} porte sur le <em>résultat d'un calcul</em> : elle ne peut pas aller dans le WHERE (qui filtre les lignes avant le regroupement) ; elle se place dans <code>HAVING</code>, après le GROUP BY.", { h: listFr(Q.having.map((h) => code(h.p.t))) }) +
        (st.length ? tr(" La valeur de comparaison vient d'une sous-requête sur {list}.", { list: listFr(st.map(tb)) }) : "");
      shown.having = true;
      snap("groupe", tr("La condition sur les groupes"), text, ["having"], { hot: hot(Q.having.flatMap((h) => h.cols)) });
    }

    // 8. tri
    if (Q.order.length) {
      const list = listFr(Q.order.map((o) => tr(o.desc ? "{c} par ordre <strong>décroissant</strong> (DESC)" : "{c} par ordre croissant (par défaut)", { c: code(o.expr.t) })));
      const text = Q.order.length > 1
        ? tr("L'énoncé demande un tri : {list}. Le second critère départage les égalités du premier. <code>ORDER BY</code> se place toujours à la fin.", { list })
        : tr("L'énoncé demande un tri : {list}. <code>ORDER BY</code> se place toujours à la fin.", { list });
      addCols(focus.cols, Q.order.flatMap((o) => o.cols), "ord");
      shown.order = true;
      snap("tri", tr("Le tri"), text, ["order"], { hot: hot(Q.order.flatMap((o) => o.cols)) });
    }

    snap("resultat", tr("Le résultat"), tr("J'exécute la requête et je vérifie que le résultat répond bien à l'énoncé (nombre de lignes, colonnes, valeurs)."), [], { run: true });
    return { phases: PHASES_SELECT, steps };
  }

  function writeSteps(W) {
    const steps = [];
    const t = W.e.table;
    const focus = { main: [t], inter: [], sub: [], cols: {}, aliases: {}, links: [], now: [] };
    const shown = { parts: [] };
    const snap = (phase, title, text, parts, extra = {}) => {
      shown.parts.push(...parts);
      steps.push({ phase, title, text, sql: clone(shown), fresh: parts, focus: clone({ ...focus, ...extra }) });
    };
    const intro = {
      update: "Il s'agit de modifier des lignes existantes : UPDATE. Je repère la table touchée : {t}. Une requête de mise à jour ne modifie qu'<strong>une seule table</strong>.",
      delete: "Il s'agit de supprimer des lignes : DELETE. Je repère la table touchée : {t}. Une requête de mise à jour ne modifie qu'<strong>une seule table</strong>.",
      insert: "Il s'agit de ajouter une ligne : INSERT INTO. Je repère la table touchée : {t}. Une requête de mise à jour ne modifie qu'<strong>une seule table</strong>.",
    }[W.kind];
    snap("table", tr("La table concernée"), tr(intro, { t: tb(t) }), ["head"]);
    if (W.kind === "update") {
      const lis = W.sets.map((s) => {
        const self = new RegExp("\\b" + s.col + "\\b", "i").test(s.val.k);
        return `<li>${code(s.p.t)}${self ? tr(" — la nouvelle valeur est calculée à partir de l'ancienne") : ""}</li>`;
      });
      focus.cols[t] = Object.fromEntries(W.sets.map((s) => [s.col, "set"]));
      snap("valeurs", tr("Les nouvelles valeurs"), tr("Après <code>SET</code>, j'indique chaque colonne à changer et sa nouvelle valeur :<ul>{lis}</ul>", { lis: lis.join("") }), ["set"]);
    }
    if (W.kind === "insert") {
      const row = W.rows[0] || [];
      const fks = W.e.t ? W.cols.map((c) => colOf(W.e.t, c)).filter((c) => c && c.fk) : [];
      const lis = W.cols.map((c, i) => `<li>${code(c)} ← ${code(row[i] !== undefined ? row[i] : "?")}</li>`);
      let text = W.select
        ? tr("Les valeurs proviennent d'une requête <code>SELECT</code> : chaque ligne qu'elle renvoie est ajoutée.")
        : tr("Les valeurs sont données dans le même ordre que les colonnes :<ul>{lis}</ul>", { lis: lis.join("") });
      if (fks.length) {
        text += trn(fks.length, " {c} est une clé étrangère : la valeur doit déjà exister dans {t}.", " {c} sont des clés étrangères : la valeur doit déjà exister dans {t}.", { c: listFr(fks.map((c) => code(c.name))), t: listFr([...new Set(fks.map((c) => tb(c.fk.split(".")[0])))]) });
        focus.links = fks.map((c) => [t, c.fk.split(".")[0]]);
        focus.now = focus.links.slice();
        focus.inter = [...new Set(fks.map((c) => c.fk.split(".")[0]))];
      }
      text += tr(" Les textes et les dates s'écrivent entre apostrophes, pas les nombres.");
      focus.cols[t] = Object.fromEntries(W.cols.map((c) => [c, "set"]));
      snap("valeurs", tr("Les valeurs à ajouter"), text, ["values"]);
    }
    if (W.kind !== "insert") {
      if (W.conds.length) {
        const lis = W.conds.map((c) => { const d = describeCond(c); return `<li>${code(c.p.t.replace(/\s+/g, " "))}${d ? " — " + d : ""}</li>`; });
        focus.sub = [...new Set(W.conds.flatMap((c) => (c.subs || []).flatMap((q) => (q.from || []).map((e) => e.table))))];
        focus.cols[t] = { ...(focus.cols[t] || {}), ...Object.fromEntries(W.conds.flatMap((c) => c.cols).map((r) => [r.col, (focus.cols[t] || {})[r.col] || "filt"])) };
        let text = tr(W.kind === "delete"
          ? "Le <code>WHERE</code> cible les lignes concernées :<ul>{lis}</ul><strong>Sans WHERE, toutes les lignes seraient supprimées.</strong>"
          : "Le <code>WHERE</code> cible les lignes concernées :<ul>{lis}</ul><strong>Sans WHERE, toutes les lignes seraient modifiées.</strong>", { lis: lis.join("") });
        if (W.kind === "delete" && global.SQLCinemaSchema) {
          const refs = global.SQLCinemaSchema.filter((x) => x.cols.some((c) => c.fk && low(c.fk.split(".")[0]) === low(t))).map((x) => x.name);
          if (refs.length) {
            text += tr(" Attention : si des lignes de {t} font référence aux lignes supprimées, l'intégrité référentielle bloque la suppression.", { t: listFr(refs.map(tb)) });
            focus.links = refs.map((r) => [r, t]); focus.inter = refs;
          }
        }
        snap("ciblage", tr("Les lignes visées"), text, ["where"]);
      } else {
        snap("ciblage", tr("Les lignes visées"), tr("Pas de <code>WHERE</code> : <strong>toutes les lignes</strong> de {t} sont concernées. C'est voulu ici, mais à vérifier à chaque fois.", { t: tb(t) }), []);
      }
    }
    snap("resultat", tr("Le résultat"), tr("J'exécute la requête (sur une copie de la base) et je contrôle les lignes touchées."), [], { run: true });
    return { phases: PHASES_WRITE, steps };
  }

  // ------------------------------------------------------------ évolution d'un schéma
  const PHASES_SCHEMA = [
    ["lecture", "Règles de gestion"], ["retraits", "Ce qui ne tient plus"], ["entites", "Nouvelles tables"],
    ["liens", "Clés étrangères (1 → n)"], ["associations", "Tables de liaison (n ↔ n)"], ["bilan", "Schéma final"],
  ];

  /** Commentaires remplacés par l'enseignant : { "jointures": "…", "filtres.2": "…" } (texte brut, échappé) */
  function override(out, q) {
    const over = q && q.cinema;
    if (!over || typeof over !== "object") return;
    for (const st of out.steps) if (typeof over[st.phase] === "string") st.text = esc(over[st.phase]);
    for (const [k, v] of Object.entries(over)) {
      const m = /^(\w+)\.(\d+)$/.exec(k);
      if (!m || typeof v !== "string") continue;
      const list = out.steps.filter((s) => s.phase === m[1]);
      if (list[+m[2] - 1]) list[+m[2] - 1].text = esc(v);
    }
  }

  /**
   * Correction pas à pas d'une question « schéma ».
   * depart : { tables:[{name, cols:[{name, pk, fk:"TABLE"|null}]}] } ; q.solution : format schemacheck
   */
  function schemaPlan(depart, q) {
    const SC = global.SQLSchemaCheck;
    const sol = q && q.solution;
    if (!SC || !sol || !Array.isArray(sol.tables)) return null;
    const norm = (s) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
    const first = (spec) => String(spec).split("|")[0].trim();
    const same = (spec, name) => String(spec).split("|").some((a) => norm(a) === norm(name));
    const findT = (schema, t) => schema.tables.find((x) => [t.nom, ...(t.alias || [])].some((n) => norm(n) === norm(x.name)));
    const steps = [];
    let cur = clone(depart);
    const toDiagram = (s) => s.tables.map((t) => ({ name: t.name, cols: t.cols.map((c) => ({ name: c.name, pk: !!c.pk, fk: c.fk ? c.fk + "." : undefined })) }));
    const snap = (phase, title, text, focus = {}, fresh = []) => steps.push({
      phase, title, text, edit: clone(cur), schema: toDiagram(cur), fresh,
      focus: { main: [], inter: [], sub: [], cols: {}, aliases: {}, links: [], now: [], ...focus },
    });
    const colsMap = (t, list, kind) => ({ [t]: Object.fromEntries(list.map((c) => [c, kind])) });
    const refName = (ref) => { const t = cur.tables.find((x) => norm(x.name) === norm(ref)); return t ? t.name : ref; };

    const info = sol.tables.map((t) => {
      const existing = findT(depart, t);
      const pk = (t.pk || []).map(first);
      const fk = Object.entries(t.fk || {}).map(([k, v]) => [first(k), v]);
      const fkInPk = fk.filter(([k]) => pk.some((p) => norm(p) === norm(k)));
      const kind = existing ? "modif" : pk.length >= 2 && fkInPk.length >= 2 ? "assoc" : "entite";
      return { t, existing, pk, fk, fkInPk, kind, name: existing ? existing.name : t.nom,
        attrs: (t.attributs || []).map(first), interdits: t.interdits || [], role: t.role || "" };
    });

    // 1. lecture
    {
      const n = info.filter((x) => x.kind !== "modif").length;
      snap("lecture", tr("Je lis les règles de gestion"),
        tr("Je repère, dans le schéma de départ, les tables concernées par les nouvelles règles. Pour chaque règle, je cherche le <strong>type de lien</strong> :" +
        "<ul><li>« un … est lié à <em>un seul</em> … » : relation un à plusieurs, une <strong>clé étrangère</strong> suffit (du côté « plusieurs ») ;</li>" +
        "<li>« un … peut être lié à <em>plusieurs</em> …, et inversement » : relation plusieurs à plusieurs, il faut une <strong>nouvelle table</strong> ;</li>" +
        "<li>un nouvel objet à décrire, avec ses propres informations : une nouvelle table.</li></ul>") +
        (n ? trn(n, "<p>Ici, {n} nouvelle table à créer.</p>", "<p>Ici, {n} nouvelles tables à créer.</p>") : ""),
        { main: depart.tables.map((t) => t.name) });
    }

    // 2. ce qui ne tient plus
    for (const x of info.filter((i) => i.kind === "modif" && i.interdits.length)) {
      const T = cur.tables.find((t) => t.name === x.name);
      if (!T) continue;
      const gone = T.cols.filter((c) => x.interdits.some((spec) => same(spec, c.name))).map((c) => c.name);
      if (!gone.length) continue;
      const where = info.filter((o) => o !== x && gone.some((g) => o.pk.some((p) => norm(p) === norm(g)) || o.fk.some(([k]) => norm(k) === norm(g)) || o.attrs.some((a) => norm(a) === norm(g))));
      let text = trn(gone.length, "{c} ne peut plus rester dans {t} : dans une ligne, une colonne ne contient qu'<em>une seule</em> valeur, or la nouvelle règle en demande plusieurs.",
        "{c} ne peuvent plus rester dans {t} : dans une ligne, une colonne ne contient qu'<em>une seule</em> valeur, or la nouvelle règle en demande plusieurs.", { c: listFr(gone.map((g) => code(g))), t: tb(x.name) });
      if (where.length) text += tr(" L'information sera reprise dans {t}.", { t: listFr(where.map((o) => tb(o.name))) });
      snap("retraits", tr("Ce qui ne tient plus"), text, { main: [x.name], cols: colsMap(x.name, gone, "del") });
      T.cols = T.cols.filter((c) => !gone.includes(c.name));
    }
    for (const name of sol.tablesSupprimees || []) {
      const T = cur.tables.find((t) => norm(t.name) === norm(name));
      if (!T) continue;
      snap("retraits", tr("Une table disparaît"), tr("La table {t} n'a plus lieu d'être avec les nouvelles règles : je la supprime, avec les flèches qui y mènent.", { t: tb(T.name) }),
        { sub: [T.name], cols: colsMap(T.name, T.cols.map((c) => c.name), "del") });
      cur.tables = cur.tables.filter((t) => t !== T);
      for (const t of cur.tables) for (const c of t.cols) if (c.fk && norm(c.fk) === norm(T.name)) c.fk = null;
    }

    // 3. nouvelles tables (objets à décrire) : d'abord celles qui ne dépendent de rien
    const ents = info.filter((x) => x.kind === "entite").sort((a, b) => a.fk.length - b.fk.length);
    for (const x of ents) {
      cur = SC.solutionSchema(cur, { tables: [x.t] });
      const own = x.fk.filter(([k]) => !x.pk.some((p) => norm(p) === norm(k)));
      const weak = x.fkInPk;
      let text = x.role ? tr("Il faut {r} : je crée la table {t}.", { r: esc(x.role), t: tb(x.name) }) : tr("je crée la table {t}.", { t: tb(x.name) });
      const pkList = listFr(x.pk.map((p) => `<u>${esc(p)}</u>`));
      text += x.attrs.length
        ? tr(" Sa clé primaire {pk} identifie chaque ligne ; elle porte {a}.", { pk: pkList, a: listFr(x.attrs.map(code)) })
        : tr(" Sa clé primaire {pk} identifie chaque ligne.", { pk: pkList });
      if (weak.length) text += trn(weak.length, " Sa clé contient {k} : une ligne de {t} n'existe qu'à l'intérieur de cette table.", " Sa clé contient {k} : une ligne de {t} n'existe qu'à l'intérieur de ces tables.",
        { k: listFr(weak.map(([k, r]) => `<i>#${esc(k)}</i> (${tb(refName(r))})`)), t: tb(x.name) });
      if (own.length) text += tr(" Chaque ligne est rattachée à un seul {r} : relation un à plusieurs, d'où la clé étrangère {k} et la flèche.",
        { r: listFr(own.map(([, r]) => tb(refName(r)))), k: listFr(own.map(([k]) => `<i>#${esc(k)}</i>`)) });
      const links = x.fk.map(([, r]) => [x.name, refName(r)]);
      snap("entites", tr("Une nouvelle table"), text, {
        main: [x.name], inter: x.fk.map(([, r]) => refName(r)),
        cols: { [x.name]: { ...Object.fromEntries(x.pk.map((p) => [p, "add"])), ...Object.fromEntries(x.attrs.map((a) => [a, "sel"])), ...Object.fromEntries(x.fk.map(([k]) => [k, "join"])) } },
        links, now: links,
      }, [x.name]);
    }

    // 4. tables existantes qui gagnent une clé étrangère ou un attribut
    for (const x of info.filter((i) => i.kind === "modif")) {
      const before = clone(cur.tables.find((t) => t.name === x.name) || { cols: [] });
      const had = (n) => before.cols.some((c) => norm(c.name) === norm(n));
      const hadFk = (n) => before.cols.some((c) => norm(c.name) === norm(n) && c.fk);
      const newFk = x.fk.filter(([k]) => !hadFk(k));
      const newAttrs = x.attrs.filter((a) => !had(a));
      cur = SC.solutionSchema(cur, { tables: [x.t] });
      if (!newFk.length && !newAttrs.length) continue;
      let text = "";
      for (const [k, r] of newFk) {
        text += tr("<p>Chaque ligne de {t} est liée à <em>un seul</em> {r}, qui peut l'être à plusieurs : relation <strong>un à plusieurs</strong>. " +
          "J'ajoute la clé étrangère <i>#{k}</i> dans {t}, du côté « plusieurs » : la flèche part de {t} vers {r}.</p>", { t: tb(x.name), r: tb(refName(r)), k: esc(k) });
      }
      if (newAttrs.length) text += trn(newAttrs.length, "<p>J'ajoute {a} dans {t} : c'est une information sur chaque ligne de cette table.</p>", "<p>J'ajoute {a} dans {t} : ce sont des informations sur chaque ligne de cette table.</p>", { a: listFr(newAttrs.map(code)), t: tb(x.name) });
      const links = newFk.map(([, r]) => [x.name, refName(r)]);
      snap("liens", newFk.length ? tr("Une clé étrangère") : tr("Un nouvel attribut"), text, {
        main: [x.name], inter: newFk.map(([, r]) => refName(r)),
        cols: { [x.name]: { ...Object.fromEntries(newFk.map(([k]) => [k, "join"])), ...Object.fromEntries(newAttrs.map((a) => [a, "add"])) } },
        links, now: links,
      });
    }

    // 5. tables de liaison (plusieurs à plusieurs)
    for (const x of info.filter((i) => i.kind === "assoc")) {
      const refs = [...new Set(x.fkInPk.map(([, r]) => refName(r)))];
      cur = SC.solutionSchema(cur, { tables: [{ ...x.t, fk: {}, attributs: [] }] });
      const pkTxt = x.pk.map((p) => `<u>${esc(p)}</u>`).join(" + ");
      let text = x.role ? tr("Règle : il faut {r}. ", { r: esc(x.role) }) : "";
      text += refs.length >= 3
        ? tr("Le lien concerne {n} tables à la fois ({list}). ", { n: refs.length, list: listFr(refs.map(tb)) })
        : tr("Un {a} peut être lié à plusieurs {b}, et inversement : relation <strong>plusieurs à plusieurs</strong>. ", { a: tb(refs[0] || "?"), b: tb(refs[1] || refs[0] || "?") });
      text += tr("Une clé étrangère ne suffit pas (il faudrait plusieurs valeurs dans une case) : je crée la table {t}. Sa clé primaire <strong>associe</strong> les clés des tables reliées : {pk}.", { t: tb(x.name), pk: pkTxt });
      snap("associations", tr("Une table de liaison"), text, {
        main: [x.name], inter: refs, cols: { [x.name]: Object.fromEntries(x.pk.map((p) => [p, "add"])) },
      }, [x.name]);
      cur = SC.solutionSchema(cur, { tables: [x.t] });
      const links = x.fk.map(([, r]) => [x.name, refName(r)]);
      let t2 = trn(links.length, "Chaque partie de la clé est aussi une <strong>clé étrangère</strong> : {list}. D'où la flèche.", "Chaque partie de la clé est aussi une <strong>clé étrangère</strong> : {list}. D'où les flèches.",
        { list: listFr(x.fk.map(([k, r]) => tr("<i>#{k}</i> renvoie à {t}", { k: esc(k), t: tb(refName(r)) }))) });
      if (x.attrs.length) t2 += trn(x.attrs.length, " {a} dépend à la fois de {r} : l'attribut se place dans {t}, la table du lien.", " {a} dépendent à la fois de {r} : les attributs se placent dans {t}, la table du lien.",
        { a: listFr(x.attrs.map(code)), r: listFr(refs.map(tb)), t: tb(x.name) });
      snap("associations", tr("Les clés étrangères de la table de liaison"), t2, {
        main: [x.name], inter: refs,
        cols: { [x.name]: { ...Object.fromEntries(x.fk.map(([k]) => [k, "join"])), ...Object.fromEntries(x.attrs.map((a) => [a, "sel"])) } },
        links, now: links,
      });
    }

    // 6. bilan
    cur = SC.solutionSchema(depart, sol);
    const changed = info.map((x) => x.name);
    const allLinks = info.flatMap((x) => x.fk.map(([, r]) => [x.name, refName(r)]));
    let text = trn(changed.length, "Le schéma final : {t} a été créée ou modifiée.", "Le schéma final : {t} ont été créées ou modifiées.", { t: listFr(changed.map(tb)) }) +
      tr("<p>Pour vérifier : chaque nouvelle règle est-elle traduite ? chaque table a-t-elle une clé primaire ? chaque flèche part-elle d'une clé étrangère vers une clé primaire ?</p>") +
      tr('<p class="muted small">Les noms peuvent varier : la vérification accepte les noms équivalents et reconnaît une table à sa clé primaire.</p>');
    if ((q.variantes || []).length) text += tr('<p class="muted small">Une autre solution est aussi acceptée : voir la correction.</p>');
    snap("bilan", tr("Le schéma final"), text, { main: changed, links: allLinks });

    const out = { kind: "schema", phases: PHASES_SCHEMA, steps };
    override(out, q);
    return out;
  }

  function renderSchemaText(st) {
    const marks = st.focus.cols || {};
    return st.edit.tables.map((t) => {
      const m = marks[t.name] || {};
      const cols = t.cols.map((c) => {
        let n = esc((c.fk ? "#" : "") + c.name);
        if (c.fk) n = `<i>${n}</i>`;
        if (c.pk) n = `<u>${n}</u>`;
        if (m[c.name] === "del") n = `<s class="cn-del">${n}</s>`;
        else if (m[c.name] && st.phase !== "bilan") n = `<mark class="cn-new">${n}</mark>`;
        return n;
      }).join(", ");
      const line = `<strong>${esc(t.name)}</strong> (${cols})`;
      return st.fresh.includes(t.name) ? `<mark class="cn-new">${line}</mark>` : line;
    }).join("\n");
  }

  /** Point d'entrée sans DOM */
  function plan(sql, schema, q) {
    global.SQLCinemaSchema = schema;
    const list = statements(sql);
    if (!list.length) return null;
    const Q = /^SELECT\b/i.test(list[0]) ? parseSelect(list[0], schema) : parseWrite(list[0], schema);
    if (!Q) return null;
    const out = Q.kind === "select" ? selectSteps(Q) : writeSteps(Q);
    out.kind = Q.kind;
    out.parsed = Q;
    out.sql = list[0];
    out.more = list.length - 1;
    override(out, q);
    return out;
  }

  // ------------------------------------------------------------ affichage de la requête
  function renderSql(P, step) {
    const Q = P.parsed;
    const nw = new Set(step.fresh);
    const mark = (id, html) => (nw.has(id) ? `<mark class="cn-new">${html}</mark>` : html);
    const ph = '<span class="cn-ph">…</span>';
    const one = (s) => esc(s.replace(/\s+/g, " ").trim());
    const L = [];
    if (P.kind === "select") {
      const s = step.sql;
      const items = Q.items.map((it) => one(it.p.t)).join(", ");
      L.push(`<span class="kw">SELECT</span> ${s.select ? mark("select", (Q.distinct ? '<span class="kw">DISTINCT</span> ' : "") + items) : ph}`);
      L.push(`<span class="kw">FROM</span> ${s.from ? mark("from", esc(s.from)) : ph}`);
      const w = s.where.slice().sort((a, b) => a - b);
      w.forEach((i, n) => L.push(`${n ? "  <span class=\"kw\">AND</span>" : '<span class="kw">WHERE</span>'} ${mark("w" + i, one(Q.conds[i].p.t))}`));
      if (s.group) L.push(mark("group", `<span class="kw">GROUP BY</span> ${Q.group.map((g) => one(g.p.t)).join(", ")}`));
      if (s.having) L.push(mark("having", `<span class="kw">HAVING</span> ${Q.having.map((h) => one(h.p.t)).join(" AND ")}`));
      if (s.order) L.push(mark("order", `<span class="kw">ORDER BY</span> ${Q.order.map((o) => one(o.p.t)).join(", ")}`));
      return L.join("\n") + ";";
    }
    // écritures : on découpe le texte d'origine en en-tête / SET-VALUES / WHERE
    const parts = new Set(step.sql.parts);
    const txt = P.sql.replace(/\s+/g, " ").trim();
    const w = /\sWHERE\s/i.exec(masks(txt).split);
    let head = txt, body = "", where = "";
    if (P.kind === "update") {
      const st = /\sSET\s/i.exec(txt);
      head = txt.slice(0, st.index); body = w ? txt.slice(st.index + 1, w.index) : txt.slice(st.index + 1); where = w ? txt.slice(w.index + 1) : "";
    } else if (P.kind === "delete") {
      head = w ? txt.slice(0, w.index) : txt; where = w ? txt.slice(w.index + 1) : "";
    } else {
      const v = /\s(VALUES|SELECT)\b/i.exec(txt);
      head = v ? txt.slice(0, v.index) : txt; body = v ? txt.slice(v.index + 1) : "";
    }
    const kw = (s) => esc(s).replace(/^(UPDATE|DELETE FROM|INSERT INTO|SET|WHERE|VALUES)\b/i, '<span class="kw">$1</span>');
    L.push(parts.has("head") ? mark("head", kw(head)) : ph);
    if (body) L.push(parts.has("set") || parts.has("values") ? mark(P.kind === "update" ? "set" : "values", kw(body)) : ph);
    if (where) L.push(parts.has("where") ? mark("where", kw(where)) : ph);
    return L.join("\n") + ";";
  }

  // ------------------------------------------------------------ lecteur
  class Player {
    /**
     * els : { dialog, title, enonce, strip, diagram, comment, sql, result, count, first, prev, next, play, close }
     * opts : { store (load/save des dispositions), onOpenTable }
     */
    constructor(els, opts = {}) {
      this.els = els;
      this.opts = opts;
      this.i = 0;
      this.timer = null;
      els.first.addEventListener("click", () => this.go(0));
      els.prev.addEventListener("click", () => this.go(this.i - 1));
      els.next.addEventListener("click", () => this.go(this.i + 1));
      els.play.addEventListener("click", () => this.toggle());
      els.close.addEventListener("click", () => els.dialog.close());
      els.dialog.addEventListener("close", () => this.stop());
      els.strip.addEventListener("click", (e) => {
        const li = e.target.closest("[data-phase]");
        if (!li) return;
        const k = this.plan.steps.findIndex((s) => s.phase === li.dataset.phase);
        if (k >= 0) this.go(k);
      });
      els.dialog.addEventListener("keydown", (e) => {
        if (e.target.closest && e.target.closest("button") && (e.key === " " || e.key === "Enter")) return;
        if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); this.go(this.i + 1); }
        if (e.key === "ArrowLeft") { e.preventDefault(); this.go(this.i - 1); }
        if (e.key === "Home") { e.preventDefault(); this.go(0); }
      });
    }

    /** q : question, schema : [{name, cols}], engine : SQLEngine, ex : exercice */
    open({ q, schema, engine, ex, sql }) {
      const P = plan(sql, schema, q);
      if (!P) return false;
      this.engine = engine;
      this.setMode("sql");
      this.show(P, q);
      this.diagram.load(schema, ex && ex.schemaGrid, "layout:" + (ex ? ex.id : "x"));
      this.go(0);
      return true;
    }

    /** Question « schéma » : depart = schéma de départ (format schemacheck) */
    openSchema({ q, depart }) {
      const P = schemaPlan(depart, q);
      if (!P || !P.steps.length) return false;
      this.setMode("schema");
      this.show(P, q);
      // disposition calculée une fois sur le schéma final : les tables ne bougent plus ensuite
      this.layout = null;
      this.diagram.load(P.steps[P.steps.length - 1].schema, null, "cinema-schema");
      this.layout = { ...this.diagram.pos };
      this.go(0);
      return true;
    }

    setMode(mode) {
      this.mode = mode;
      const base = { fit: true, maxFit: 1.2, onOpenTable: mode === "sql" ? this.opts.onOpenTable : null };
      const store = mode === "sql" ? (this.opts.store || {}) : { load: () => this.layout, save: (k, p) => { this.layout = { ...p }; } };
      if (!this.diagram) this.diagram = new SchemaDiagram(this.els.diagram, { ...base, ...store });
      else this.diagram.opts = { ...base, ...store };
    }

    show(P, q) {
      this.plan = P;
      this.q = q;
      const els = this.els;
      els.title.textContent = (P.kind === "schema" ? tr("Construction du schéma pas à pas") : tr("Correction pas à pas")) + (q.id ? ` – ${q.id}` : "");
      els.enonce.textContent = q.enonce || "";
      els.strip.innerHTML = P.phases.map(([k, label], n) => {
        const used = P.steps.some((s) => s.phase === k);
        return `<li data-phase="${k}" class="${used ? "" : "skip"}" ${used ? "" : `title="${esc(tr("Pas nécessaire ici"))}"`}><span class="n">${n + 1}</span>${esc(tr(label))}</li>`;
      }).join("");
      els.dialog.classList.toggle("cn-schema", P.kind === "schema");
      const legend = els.dialog.querySelector("#cnLegend");
      if (legend) legend.innerHTML = P.kind === "schema"
        ? tr('<i class="lg add"></i>nouveau <i class="lg join"></i>clé étrangère <i class="lg del"></i>retiré <i class="lg inter"></i>table reliée')
        : tr('<i class="lg sel"></i>affiché <i class="lg filt"></i>filtre <i class="lg join"></i>jointure <i class="lg inter"></i>table de passage');
      if (!els.dialog.open) els.dialog.showModal();
      els.next.focus();
    }

    go(i) {
      const P = this.plan;
      if (!P) return;
      this.i = Math.max(0, Math.min(P.steps.length - 1, i));
      const st = P.steps[this.i];
      const els = this.els;
      els.comment.innerHTML = `<h3>${esc(st.title)}</h3><div>${st.text}</div>`;
      els.sql.innerHTML = P.kind === "schema" ? renderSchemaText(st) : renderSql(P, st);
      if (st.schema) this.diagram.load(st.schema, null, "cinema-schema");
      els.count.textContent = `${this.i + 1} / ${P.steps.length}`;
      els.prev.disabled = els.first.disabled = this.i === 0;
      els.next.disabled = this.i === P.steps.length - 1;
      const cur = P.phases.findIndex(([k]) => k === st.phase);
      [...els.strip.children].forEach((li, n) => {
        li.classList.toggle("done", n < cur && !li.classList.contains("skip"));
        li.classList.toggle("now", n === cur);
        li.setAttribute("aria-current", n === cur ? "step" : "false");
      });
      this.diagram.focus(st.focus);
      this.frame();
      els.result.innerHTML = st.focus.run ? this.result() : "";
      if (this.i === P.steps.length - 1) this.stop();
    }

    /** Recadre le diagramme sur les tables mises en évidence si elles sortent de la vue */
    frame() {
      const wrap = this.els.diagram;
      const boxes = [...wrap.querySelectorAll(".dg-box.cn-main, .dg-box.cn-inter, .dg-box.cn-sub")];
      if (!boxes.length) return;
      const w = wrap.getBoundingClientRect();
      const r = boxes.map((b) => b.getBoundingClientRect());
      const x0 = Math.min(...r.map((b) => b.left)) - w.left + wrap.scrollLeft, x1 = Math.max(...r.map((b) => b.right)) - w.left + wrap.scrollLeft;
      const y0 = Math.min(...r.map((b) => b.top)) - w.top + wrap.scrollTop, y1 = Math.max(...r.map((b) => b.bottom)) - w.top + wrap.scrollTop;
      const visible = x0 >= wrap.scrollLeft && x1 <= wrap.scrollLeft + wrap.clientWidth && y0 >= wrap.scrollTop && y1 <= wrap.scrollTop + wrap.clientHeight;
      if (visible) return;
      const fitH = y1 - y0 <= wrap.clientHeight, fitW = x1 - x0 <= wrap.clientWidth;
      wrap.scrollTo({
        left: fitW ? (x0 + x1) / 2 - wrap.clientWidth / 2 : x0 - 12,
        top: fitH ? (y0 + y1) / 2 - wrap.clientHeight / 2 : y0 - 12,
        behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      });
    }

    result() {
      const P = this.plan;
      let html = "";
      try {
        const r = this.engine.run(P.sql);
        if (P.kind === "select" && r.result) {
          const { columns, values } = r.result;
          const max = 8;
          html = `<p class="small">${trn(values.length, "<strong>{n}</strong> ligne", "<strong>{n}</strong> lignes")}${values.length > max ? tr(" (les {m} premières)", { m: max }) : ""}</p>` +
            `<div class="table-wrap"><table class="grid"><thead><tr>${columns.map((c) => `<th>${esc(c)}</th>`).join("")}</tr></thead><tbody>` +
            values.slice(0, max).map((row) => `<tr>${row.map((v) => `<td>${v === null ? '<span class="null">NULL</span>' : esc(v)}</td>`).join("")}</tr>`).join("") +
            "</tbody></table></div>";
        } else {
          html = `<p class="small">${trn(r.changes, "<strong>{n}</strong> ligne touchée (sur une copie : la base n'est pas modifiée).", "<strong>{n}</strong> lignes touchées (sur une copie : la base n'est pas modifiée).")}</p>`;
        }
        if (P.more) html += tr('<p class="muted small">La correction contient {n} requêtes : seule la première est détaillée ici.</p>', { n: P.more + 1 });
      } catch (e) {
        html = `<p class="small">${tr("Exécution impossible : {e}", { e: esc(e.message) })}</p>`;
      }
      return html;
    }

    toggle() { if (this.timer) this.stop(); else { if (this.i === this.plan.steps.length - 1) this.go(0); this.start(); } }
    start() {
      this.els.play.textContent = tr("⏸ Pause");
      this.els.play.setAttribute("aria-pressed", "true");
      const tick = () => {
        const st = this.plan.steps[this.i];
        const len = (st.text.replace(/<[^>]+>/g, "").length || 100);
        this.timer = setTimeout(() => { this.go(this.i + 1); if (this.timer) tick(); }, Math.min(14000, 2500 + len * 45));
      };
      tick();
    }
    stop() {
      clearTimeout(this.timer);
      this.timer = null;
      this.els.play.textContent = tr("⏵ Lecture auto");
      this.els.play.setAttribute("aria-pressed", "false");
    }
  }

  global.SQLCinema = { plan, schemaPlan, build, masks, statements, renderSql, renderSchemaText, Player };
})(typeof window !== "undefined" ? window : globalThis);
