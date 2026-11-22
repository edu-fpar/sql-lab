/* SQL Lab – contenu des rappels de cours (français, anglais et espagnol). Rendu : assets/rappels.js.
 * Blocs : { type: "process", titre, etapes:[{label, detail, code}] }
 *         { type: "petales", titre, centre, petales:[{label, detail, code}] }
 *         { type: "pieges", titre, items:[{titre, faux, juste, note}] }
 * detail / intro / note : HTML simple (contenu de confiance, écrit ici).
 */
(function (global) {
  "use strict";

  const fr = {
    table: {
      titre: "Interroger une seule table", court: "Une table", couleur: "#2563eb",
      intro: "Une requête se lit comme une phrase : <strong>je veux voir</strong> ces colonnes, <strong>de</strong> cette table, <strong>quand</strong> cette condition est vraie, <strong>rangées</strong> dans cet ordre.",
      blocs: [
        { type: "process", titre: "Construire la requête", etapes: [
          { label: "FROM : la table", detail: "Je repère dans le schéma la table qui contient les informations demandées.", code: "FROM CLIENT" },
          { label: "SELECT : les colonnes", detail: "J'écris les colonnes à afficher, dans l'ordre de l'énoncé, séparées par des virgules. <code>*</code> = toutes les colonnes.", code: "SELECT NomCli, PrenomCli, VilleCli" },
          { label: "WHERE : les lignes", detail: "Je ne garde que les lignes qui vérifient la condition. Plusieurs conditions se combinent avec AND / OR.", code: "WHERE VilleCli = 'Lyon'" },
          { label: "ORDER BY : le tri", detail: "Seulement si l'énoncé demande un ordre. ASC (croissant, par défaut) ou DESC (décroissant).", code: "ORDER BY NomCli ASC" },
        ] },
        { type: "petales", titre: "Les conditions du WHERE", centre: "WHERE", petales: [
          { label: "= <> < >", detail: "Comparer à une valeur. Le texte et les dates s'écrivent entre apostrophes, pas les nombres. <code>&lt;&gt;</code> signifie « différent de ».", code: "WHERE MontantAFinancer > 10000" },
          { label: "AND / OR", detail: "AND : les deux conditions doivent être vraies. OR : l'une suffit. Avec les deux, mettez des parenthèses.", code: "WHERE (Ville = 'Lyon' OR Ville = 'Nice')\nAND Actif = 'O'" },
          { label: "BETWEEN", detail: "Entre deux bornes <strong>incluses</strong>.", code: "WHERE Prix BETWEEN 10 AND 20" },
          { label: "IN", detail: "La valeur fait partie d'une liste : plus court qu'une série de OR.", code: "WHERE Ville IN ('Lyon', 'Nice', 'Paris')" },
          { label: "LIKE", detail: "Ressemble à un modèle : <code>%</code> = n'importe quelle suite de caractères, <code>_</code> = un seul caractère.", code: "WHERE NomCli LIKE 'DU%'" },
          { label: "IS NULL", detail: "La valeur est vide (non renseignée). On n'écrit <strong>jamais</strong> <code>= NULL</code>.", code: "WHERE DateCloture IS NULL" },
          { label: "NOT", detail: "Inverse une condition : NOT IN, NOT LIKE, IS NOT NULL.", code: "WHERE MailCli IS NOT NULL" },
          { label: "DISTINCT", detail: "« Sans doublon » : supprime les lignes identiques du résultat. Il se place juste après SELECT.", code: "SELECT DISTINCT VilleCli\nFROM CLIENT" },
        ] },
        { type: "pieges", items: [
          { titre: "Comparer à une valeur vide", faux: "WHERE DateCloture = NULL", juste: "WHERE DateCloture IS NULL", note: "<code>= NULL</code> ne renvoie jamais rien." },
          { titre: "Oublier les apostrophes d'un texte", faux: "WHERE Ville = Lyon", juste: "WHERE Ville = 'Lyon'", note: "Sans apostrophes, Lyon est pris pour un nom de colonne." },
          { titre: "Mélanger AND et OR sans parenthèses", faux: "WHERE Ville = 'Lyon' OR Ville = 'Nice' AND Actif = 'O'", juste: "WHERE (Ville = 'Lyon' OR Ville = 'Nice') AND Actif = 'O'", note: "AND est évalué avant OR." },
        ] },
      ],
    },

    agregats: {
      titre: "Calculs et agrégats", court: "Calculs", couleur: "#7c3aed",
      intro: "Une fonction d'agrégat <strong>résume plusieurs lignes en une seule valeur</strong> : un nombre, une somme, une moyenne… Sans GROUP BY, le résultat tient en une ligne.",
      blocs: [
        { type: "petales", titre: "Les cinq fonctions", centre: "Agrégats", petales: [
          { label: "COUNT(*)", detail: "Compte les <strong>lignes</strong> retenues.", code: "SELECT COUNT(*)\nFROM DOSSIER\nWHERE DateCloture IS NULL" },
          { label: "COUNT(col)", detail: "Compte les lignes où la colonne est <strong>renseignée</strong> (les NULL sont ignorés).", code: "SELECT COUNT(MailCli)\nFROM CLIENT" },
          { label: "COUNT DISTINCT", detail: "Compte les valeurs <strong>différentes</strong>.", code: "SELECT COUNT(DISTINCT VilleCli)\nFROM CLIENT" },
          { label: "SUM", detail: "Fait la somme d'une colonne numérique.", code: "SELECT SUM(MontantOffre)\nFROM OFFRE" },
          { label: "AVG", detail: "Calcule la moyenne (les NULL sont ignorés).", code: "SELECT AVG(TauxInteret)\nFROM OFFRE" },
          { label: "MIN / MAX", detail: "La plus petite / la plus grande valeur. Marche aussi sur les dates et les textes.", code: "SELECT MIN(DateCreation), MAX(DateCreation)\nFROM DOSSIER" },
          { label: "Calcul en ligne", detail: "Un calcul entre colonnes se fait sur <strong>chaque ligne</strong>, sans résumer. On peut le nommer avec AS.", code: "SELECT IdOffre, MontantOffre * TauxInteret / 100 AS Interets\nFROM OFFRE" },
        ] },
        { type: "process", titre: "Ce que fait la base", etapes: [
          { label: "Les lignes de la table", detail: "La base part de toutes les lignes de la table du FROM." },
          { label: "Le filtre WHERE", detail: "Elle ne garde que les lignes qui vérifient la condition." },
          { label: "La fonction", detail: "Elle applique COUNT, SUM, AVG… à ces lignes." },
          { label: "Une seule ligne", detail: "Sans GROUP BY, le résultat est <strong>une ligne</strong> : on ne peut pas afficher en même temps une colonne « normale ». Pour un calcul par groupe, voir le rappel <em>Regroupements</em>." },
        ] },
        { type: "pieges", items: [
          { titre: "Afficher une colonne à côté d'un agrégat sans regrouper", faux: "SELECT VilleCli, COUNT(*)\nFROM CLIENT", juste: "SELECT VilleCli, COUNT(*)\nFROM CLIENT\nGROUP BY VilleCli" },
          { titre: "Mettre un agrégat dans le WHERE", faux: "WHERE COUNT(*) > 3", juste: "GROUP BY …\nHAVING COUNT(*) > 3", note: "Une condition sur un calcul de groupe va dans HAVING." },
        ] },
      ],
    },

    dates: {
      titre: "Les dates", court: "Dates", couleur: "#0d9488",
      intro: "Au DCG, les dates s'écrivent <code>'jj/mm/aaaa'</code> et se découpent avec <strong>YEAR</strong>, <strong>MONTH</strong>, <strong>DAY</strong>. La date du jour de l'exercice est simulée : NOW() la renvoie.",
      blocs: [
        { type: "petales", titre: "Les outils", centre: "Dates", petales: [
          { label: "YEAR()", detail: "Extrait l'année.", code: "WHERE YEAR(DateCreation) = 2024" },
          { label: "MONTH()", detail: "Extrait le mois (1 à 12). Pour « mars 2024 », combinez mois et année.", code: "WHERE MONTH(DateEmission) = 3\nAND YEAR(DateEmission) = 2024" },
          { label: "DAY()", detail: "Extrait le jour du mois (1 à 31).", code: "WHERE DAY(DateCreation) = 1" },
          { label: "BETWEEN", detail: "Une période, bornes <strong>incluses</strong>.", code: "WHERE DateCreation BETWEEN '01/01/2024' AND '31/03/2024'" },
          { label: "Comparaison", detail: "Avant / après une date : &lt; et &gt;.", code: "WHERE DateCreation < '01/07/2024'" },
          { label: "DATEDIFF", detail: "Nombre de jours entre deux dates : DATEDIFF(fin, début).", code: "WHERE DATEDIFF(DateRetour, DateDepart) > 7" },
          { label: "NOW()", detail: "La date du jour (simulée dans l'exercice). CURDATE() est équivalent.", code: "WHERE DATEDIFF(NOW(), DateCreation) > 30" },
        ] },
        { type: "process", titre: "Traduire une période de l'énoncé", etapes: [
          { label: "« en 2024 »", detail: "Une année entière.", code: "YEAR(DateX) = 2024" },
          { label: "« en mars 2024 »", detail: "Un mois d'une année : deux conditions.", code: "MONTH(DateX) = 3 AND YEAR(DateX) = 2024" },
          { label: "« du … au … »", detail: "Une période précise.", code: "DateX BETWEEN '01/03/2024' AND '15/03/2024'" },
          { label: "« depuis plus de 30 jours »", detail: "Un écart avec aujourd'hui.", code: "DATEDIFF(NOW(), DateX) > 30" },
        ] },
        { type: "pieges", items: [
          { titre: "Oublier l'année avec le mois", faux: "WHERE MONTH(DateEmission) = 3", juste: "WHERE MONTH(DateEmission) = 3\nAND YEAR(DateEmission) = 2024", note: "Sinon on obtient tous les mois de mars de toutes les années." },
          { titre: "Date sans apostrophes", faux: "WHERE DateCreation > 01/01/2024", juste: "WHERE DateCreation > '01/01/2024'" },
        ] },
      ],
    },

    jointures: {
      titre: "Les jointures", court: "Jointures", couleur: "#ea580c",
      intro: "Une jointure <strong>relie deux tables</strong> en égalisant une clé étrangère (#) et la clé primaire qu'elle référence : on suit les flèches du schéma.",
      blocs: [
        { type: "process", titre: "La méthode, pas à pas", etapes: [
          { label: "Tables évidentes", detail: "Je repère les tables qui contiennent les colonnes à afficher et celles des conditions.", code: "CLIENT (NomCli…), OFFRE (AcceptationClient)" },
          { label: "Tables de passage", detail: "Si elles ne sont pas reliées directement, je suis les flèches : la table intermédiaire va aussi dans le FROM, même si on n'affiche rien d'elle.", code: "CLIENT ← DOSSIER ← OFFRE" },
          { label: "FROM", detail: "Toutes les tables, séparées par des virgules (alias facultatifs).", code: "FROM CLIENT, DOSSIER, OFFRE" },
          { label: "Une jointure par lien", detail: "n tables → <strong>n − 1 jointures</strong> : clé étrangère = clé primaire. Préfixez les colonnes qui portent le même nom.", code: "WHERE CLIENT.IdCli = DOSSIER.IdCli\nAND DOSSIER.IdDoss = OFFRE.IdDoss" },
          { label: "Filtres", detail: "Puis les conditions de l'énoncé, avec AND.", code: "AND AcceptationClient = 'Refusé'" },
          { label: "SELECT", detail: "Enfin les colonnes à afficher (DISTINCT si « sans doublon »).", code: "SELECT DISTINCT NomCli, PrenomCli" },
        ] },
        { type: "petales", titre: "Les subtilités", centre: "Jointure", petales: [
          { label: "WHERE", detail: "Écriture du DCG : la jointure est une égalité dans le WHERE.", code: "FROM A, B\nWHERE A.IdB = B.IdB" },
          { label: "INNER JOIN", detail: "Écriture équivalente, acceptée aussi.", code: "FROM A\nINNER JOIN B ON A.IdB = B.IdB" },
          { label: "Préfixe", detail: "Une colonne présente dans deux tables doit être précédée du nom de sa table (sinon : « colonne ambiguë »).", code: "SELECT CLIENT.IdCli" },
          { label: "Alias", detail: "Un surnom court pour une table, déclaré dans le FROM.", code: "FROM CLIENT C, DOSSIER D\nWHERE C.IdCli = D.IdCli" },
          { label: "Clé composée", detail: "Si la clé a deux colonnes, il faut égaliser les deux.", code: "WHERE E.NumSal = A.NumSal\nAND E.DateJour = A.DateJour" },
          { label: "Produit cartésien", detail: "Une jointure oubliée combine chaque ligne avec toutes les autres : beaucoup trop de lignes.", code: "-- 3 tables, 1 seule jointure : résultat faux" },
        ] },
        { type: "pieges", items: [
          { titre: "Oublier la table de passage", faux: "FROM CLIENT, OFFRE\nWHERE CLIENT.IdCli = OFFRE.IdCli", juste: "FROM CLIENT, DOSSIER, OFFRE\nWHERE CLIENT.IdCli = DOSSIER.IdCli\nAND DOSSIER.IdDoss = OFFRE.IdDoss", note: "OFFRE n'a pas de colonne IdCli : il faut passer par DOSSIER." },
          { titre: "Colonne ambiguë", faux: "SELECT IdCli, NomCli\nFROM CLIENT, DOSSIER …", juste: "SELECT CLIENT.IdCli, NomCli\nFROM CLIENT, DOSSIER …" },
        ] },
      ],
    },

    groupes: {
      titre: "Regroupements : GROUP BY et HAVING", court: "Regroupements", couleur: "#db2777",
      intro: "« <strong>Pour chaque</strong> produit, le nombre d'offres » : on range les lignes en <strong>groupes</strong>, puis le calcul est fait pour chaque groupe.",
      blocs: [
        { type: "process", titre: "L'ordre dans lequel la base travaille", etapes: [
          { label: "FROM + jointures", detail: "Les tables et leurs jointures forment les lignes de départ." },
          { label: "WHERE", detail: "Filtre les <strong>lignes</strong>, avant tout regroupement.", code: "WHERE YEAR(DateEmission) = 2024" },
          { label: "GROUP BY", detail: "Range les lignes en groupes de même valeur.", code: "GROUP BY DesignationProd" },
          { label: "HAVING", detail: "Filtre les <strong>groupes</strong>, d'après un calcul.", code: "HAVING COUNT(*) >= 3" },
          { label: "SELECT", detail: "Une ligne par groupe : la colonne du groupe et le calcul.", code: "SELECT DesignationProd, COUNT(*)" },
          { label: "ORDER BY", detail: "Trie le résultat, éventuellement sur le calcul.", code: "ORDER BY COUNT(*) DESC" },
        ] },
        { type: "petales", titre: "Les règles d'or", centre: "GROUP BY", petales: [
          { label: "Colonnes du SELECT", detail: "Toute colonne affichée <strong>sans fonction de calcul</strong> doit figurer dans le GROUP BY.", code: "SELECT NomCli, PrenomCli, COUNT(*)\n…\nGROUP BY NomCli, PrenomCli" },
          { label: "WHERE ou HAVING ?", detail: "Condition sur une colonne → WHERE. Condition sur un calcul (COUNT, SUM…) → HAVING." },
          { label: "« Pour chaque »", detail: "Le mot de l'énoncé qui suit « pour chaque » ou « par » indique la colonne du GROUP BY." },
          { label: "Identifiant", detail: "Pour ne pas fusionner deux homonymes, regroupez aussi par l'identifiant.", code: "GROUP BY CLIENT.IdCli, NomCli" },
          { label: "Tri sur le calcul", detail: "On peut trier sur le résultat d'une fonction.", code: "ORDER BY SUM(MontantOffre) DESC" },
        ] },
        { type: "pieges", items: [
          { titre: "Condition sur un calcul dans le WHERE", faux: "WHERE COUNT(*) > 3\nGROUP BY IdCli", juste: "GROUP BY IdCli\nHAVING COUNT(*) > 3" },
          { titre: "Colonne affichée absente du GROUP BY", faux: "SELECT VilleCli, NomCli, COUNT(*)\n…\nGROUP BY VilleCli", juste: "SELECT VilleCli, COUNT(*)\n…\nGROUP BY VilleCli" },
        ] },
      ],
    },

    sousrequetes: {
      titre: "Les sous-requêtes", court: "Sous-requêtes", couleur: "#4f46e5",
      intro: "Une sous-requête est une requête <strong>entre parenthèses</strong> dans une autre. Elle est calculée d'abord, et son résultat sert à la requête principale.",
      blocs: [
        { type: "process", titre: "Lire une sous-requête", etapes: [
          { label: "Repérer la question cachée", detail: "« les clients qui n'ont <strong>jamais</strong> … », « supérieur à la <strong>moyenne</strong> » : il faut d'abord calculer une liste ou une valeur." },
          { label: "Écrire la sous-requête", detail: "Elle renvoie <strong>une colonne</strong> : une liste de valeurs, ou une seule valeur.", code: "SELECT IdCli FROM DOSSIER" },
          { label: "L'utiliser", detail: "Dans le WHERE (ou le HAVING) de la requête principale.", code: "WHERE IdCli NOT IN (SELECT IdCli FROM DOSSIER)" },
        ] },
        { type: "petales", titre: "Les formes courantes", centre: "( SELECT … )", petales: [
          { label: "IN", detail: "La valeur figure dans la liste calculée.", code: "WHERE IdProd IN (SELECT IdProd FROM OFFRE)" },
          { label: "NOT IN", detail: "Traduit « jamais », « aucun », « n'a pas ».", code: "WHERE IdCli NOT IN (SELECT IdCli FROM DOSSIER)" },
          { label: "> (moyenne)", detail: "Comparer à une valeur calculée : la sous-requête renvoie une seule valeur.", code: "WHERE TauxInteret > (SELECT AVG(TauxInteret) FROM OFFRE)" },
          { label: "= (max)", detail: "Trouver la ligne qui a la valeur maximale.", code: "WHERE MontantOffre = (SELECT MAX(MontantOffre) FROM OFFRE)" },
          { label: "EXISTS", detail: "Vrai si la sous-requête renvoie au moins une ligne (elle fait référence à la requête principale).", code: "WHERE NOT EXISTS (SELECT * FROM DOSSIER D\n  WHERE D.IdCli = C.IdCli)" },
          { label: "Dans HAVING", detail: "Comparer un calcul de groupe à une valeur calculée.", code: "HAVING COUNT(*) > (SELECT AVG(NbOffres) FROM …)" },
        ] },
        { type: "pieges", items: [
          { titre: "« Jamais » écrit avec <>", faux: "FROM CLIENT, DOSSIER\nWHERE CLIENT.IdCli <> DOSSIER.IdCli", juste: "FROM CLIENT\nWHERE IdCli NOT IN (SELECT IdCli FROM DOSSIER)", note: "<code>&lt;&gt;</code> compare ligne à ligne et renvoie presque tout." },
          { titre: "Plusieurs colonnes dans la sous-requête", faux: "WHERE IdCli IN (SELECT IdCli, NomCli FROM …)", juste: "WHERE IdCli IN (SELECT IdCli FROM …)" },
        ] },
      ],
    },

    autojointure: {
      titre: "L'auto-jointure", court: "Auto-jointure", couleur: "#ca8a04",
      intro: "Une table peut se référencer elle-même : un salarié a pour responsable un autre salarié. On utilise alors <strong>deux fois la même table</strong>, avec deux alias.",
      blocs: [
        { type: "process", titre: "La méthode", etapes: [
          { label: "Repérer la flèche qui revient", detail: "Dans le schéma, une clé étrangère pointe vers sa propre table (#IdChargeClienteleSupHierarchique → CHARGECLIENTELE)." },
          { label: "Deux alias", detail: "Une copie pour chaque rôle : le salarié (S) et son responsable (R).", code: "FROM CHARGECLIENTELE S, CHARGECLIENTELE R" },
          { label: "La jointure", detail: "La clé étrangère du salarié = la clé primaire du responsable.", code: "WHERE S.IdChargeClienteleSupHierarchique = R.IdChargeClientele" },
          { label: "Les colonnes", detail: "Toujours préfixées par l'alias, pour savoir de quelle copie il s'agit.", code: "SELECT S.NomChargeClientele, R.NomChargeClientele AS Responsable" },
        ] },
        { type: "pieges", items: [
          { titre: "Une seule copie de la table", faux: "FROM CHARGECLIENTELE\nWHERE IdChargeClienteleSupHierarchique = IdChargeClientele", juste: "FROM CHARGECLIENTELE S, CHARGECLIENTELE R\nWHERE S.IdChargeClienteleSupHierarchique = R.IdChargeClientele" },
        ] },
      ],
    },

    majs: {
      titre: "Mises à jour : INSERT, UPDATE, DELETE", court: "Mises à jour", couleur: "#dc2626",
      intro: "Une requête de mise à jour <strong>modifie une seule table</strong>. Dans SQL Lab, elle est fictive : chaque essai repart d'une copie neuve de la base.",
      blocs: [
        { type: "petales", titre: "Les trois ordres", centre: "Mise à jour", petales: [
          { label: "INSERT", detail: "Ajoute une ligne. Les valeurs sont dans l'ordre des colonnes indiquées.", code: "INSERT INTO PRODUIT (IdProd, DesignationProd)\nVALUES (12, 'Prêt étudiant')" },
          { label: "UPDATE", detail: "Modifie des lignes existantes : SET nouvelle valeur, WHERE les lignes visées.", code: "UPDATE OFFRE\nSET TauxInteret = 4.34\nWHERE IdOffre = 3456812" },
          { label: "Calcul dans SET", detail: "La nouvelle valeur peut se calculer à partir de l'ancienne.", code: "UPDATE PRODUIT\nSET Prix = Prix * 1.05" },
          { label: "DELETE", detail: "Supprime des lignes. Sans WHERE, la table entière est vidée.", code: "DELETE FROM PIECEJOINTE\nWHERE IdDoss = 2338" },
          { label: "Sous-requête", detail: "Le WHERE peut utiliser une sous-requête pour viser les lignes.", code: "DELETE FROM CLIENT\nWHERE IdCli NOT IN (SELECT IdCli FROM DOSSIER)" },
        ] },
        { type: "process", titre: "Avant d'exécuter", etapes: [
          { label: "Quelle table ?", detail: "Une seule table par requête." },
          { label: "Quelles valeurs ?", detail: "Textes et dates entre apostrophes ; une clé étrangère doit exister dans la table référencée." },
          { label: "Quelles lignes ?", detail: "Le WHERE cible précisément les lignes, souvent par leur identifiant." },
          { label: "Intégrité", detail: "On ne peut pas supprimer une ligne référencée par une clé étrangère d'une autre table." },
        ] },
        { type: "pieges", items: [
          { titre: "UPDATE sans WHERE", faux: "UPDATE OFFRE SET TauxInteret = 4.34", juste: "UPDATE OFFRE SET TauxInteret = 4.34\nWHERE IdOffre = 3456812", note: "Sans WHERE, toutes les offres sont modifiées." },
          { titre: "INSERT dans le mauvais ordre", faux: "INSERT INTO PRODUIT (IdProd, DesignationProd)\nVALUES ('Prêt étudiant', 12)", juste: "INSERT INTO PRODUIT (IdProd, DesignationProd)\nVALUES (12, 'Prêt étudiant')" },
        ] },
      ],
    },

    schema: {
      titre: "Faire évoluer un schéma relationnel", court: "Schéma", couleur: "#059669",
      intro: "Chaque nouvelle règle de gestion se traduit par un <strong>type de lien</strong> : il décide où va la clé étrangère, ou s'il faut une nouvelle table.",
      blocs: [
        { type: "process", titre: "De la règle au schéma", etapes: [
          { label: "Lire la règle", detail: "Repérer les deux objets reliés et la cardinalité : « un seul » ou « plusieurs », dans les deux sens." },
          { label: "Un à plusieurs", detail: "Chaque A est lié à <strong>un seul</strong> B : la clé de B devient clé étrangère dans A (côté « plusieurs »).", code: "DOSSIER (IdDoss, …, #IdCli)" },
          { label: "Plusieurs à plusieurs", detail: "Un A a plusieurs B <strong>et</strong> un B plusieurs A : il faut une table de liaison.", code: "EMPRUNTER (#IdCli, #IdDoss)" },
          { label: "Clé composée", detail: "La clé primaire de la table de liaison associe les clés des tables reliées ; chacune est aussi clé étrangère." },
          { label: "Attributs du lien", detail: "Une information qui dépend des deux à la fois (quantité, quotité) va dans la table de liaison.", code: "SOUSCRIRE (#IdCli, #CodeTypeAssurance, #IdOffre, Quotite)" },
        ] },
        { type: "petales", titre: "Le vocabulaire", centre: "Schéma", petales: [
          { label: "Clé primaire", detail: "Identifie chaque ligne, soulignée dans la notation. Jamais vide, jamais en double." },
          { label: "Clé étrangère", detail: "Précédée de #, elle référence la clé primaire d'une autre table : la flèche du diagramme." },
          { label: "Table de liaison", detail: "Traduit une relation plusieurs à plusieurs. Clé = clés des tables reliées." },
          { label: "Table de référence", detail: "Décrit un nouvel objet (types, catégories…) avec sa clé et son libellé." },
          { label: "Ce qui ne tient plus", detail: "Si une règle impose plusieurs valeurs, la colonne doit quitter sa table : une case ne contient qu'une valeur." },
          { label: "Réflexive", detail: "Une clé étrangère vers sa propre table (un responsable est un salarié)." },
        ] },
      ],
    },

    processus: {
      titre: "Le schéma événements-résultats", court: "Processus", couleur: "#0891b2",
      intro: "Un processus se lit de haut en bas : des <strong>événements</strong> déclenchent des <strong>opérations</strong>, qui produisent de nouveaux événements, dans le couloir de chaque acteur.",
      blocs: [
        { type: "process", titre: "La chaîne de base", etapes: [
          { label: "Événement", detail: "Un fait qui arrive : une demande, un document reçu, une date (« chaque matin »). Dessiné dans une ellipse." },
          { label: "Synchronisation", detail: "Quand une opération attend <strong>plusieurs</strong> événements : un trapèze avec une condition (A et (B ou C))." },
          { label: "Opération", detail: "Un traitement fait par un acteur, sans interruption : un nom, des actions." },
          { label: "Règles d'émission", detail: "Les cas de sortie de l'opération : « Toujours », ou « accepté » / « refusé »." },
          { label: "Événements résultats", detail: "Chaque règle produit un événement, qui peut déclencher l'opération suivante." },
        ] },
        { type: "petales", titre: "Les règles du formalisme", centre: "Processus", petales: [
          { label: "Couloirs", detail: "Une colonne par acteur ; chaque opération est dans le couloir de celui qui la fait." },
          { label: "Pas de flèche directe", detail: "Une opération ne mène jamais directement à une autre : il y a toujours un événement entre les deux." },
          { label: "ET", detail: "Tous les événements sont nécessaires.", code: "A et B" },
          { label: "OU", detail: "L'un ou l'autre suffit.", code: "A ou B" },
          { label: "Parenthèses", detail: "Elles regroupent les conditions, comme en calcul.", code: "A et (B ou C)" },
          { label: "Toutes les lettres", detail: "Chaque flèche entrante dans la synchronisation a une lettre, et toutes les lettres figurent dans la condition." },
        ] },
      ],
    },
  };

  const en = {
    table: {
      titre: "Querying a single table", court: "One table", couleur: "#2563eb",
      intro: "A query reads like a sentence: <strong>I want to see</strong> these columns, <strong>from</strong> this table, <strong>when</strong> this condition is true, <strong>sorted</strong> in this order.",
      blocs: [
        { type: "process", titre: "Building the query", etapes: [
          { label: "FROM: the table", detail: "Find in the schema the table that holds the requested information.", code: "FROM CUSTOMER" },
          { label: "SELECT: the columns", detail: "Write the columns to display, in the order of the question, separated by commas. <code>*</code> = all columns.", code: "SELECT LastName, FirstName, City" },
          { label: "WHERE: the rows", detail: "Keep only the rows that meet the condition. Combine conditions with AND / OR.", code: "WHERE City = 'Leeds'" },
          { label: "ORDER BY: sorting", detail: "Only if the question asks for an order. ASC (ascending, the default) or DESC (descending).", code: "ORDER BY LastName ASC" },
        ] },
        { type: "petales", titre: "WHERE conditions", centre: "WHERE", petales: [
          { label: "= <> < >", detail: "Compare with a value. Text and dates go in single quotes, numbers do not. <code>&lt;&gt;</code> means \"not equal\".", code: "WHERE DailyRate > 20" },
          { label: "AND / OR", detail: "AND: both conditions must be true. OR: either is enough. With both, use brackets.", code: "WHERE (City = 'Leeds' OR City = 'York')\nAND FrameSize = 'M'" },
          { label: "BETWEEN", detail: "Between two bounds, <strong>both included</strong>.", code: "WHERE DailyRate BETWEEN 10 AND 20" },
          { label: "IN", detail: "The value is in a list: shorter than a series of ORs.", code: "WHERE City IN ('Leeds', 'York', 'Bath')" },
          { label: "LIKE", detail: "Matches a pattern: <code>%</code> = any sequence of characters, <code>_</code> = one character.", code: "WHERE LastName LIKE 'Mc%'" },
          { label: "IS NULL", detail: "The value is empty (not filled in). <strong>Never</strong> write <code>= NULL</code>.", code: "WHERE ReturnDate IS NULL" },
          { label: "NOT", detail: "Reverses a condition: NOT IN, NOT LIKE, IS NOT NULL.", code: "WHERE Email IS NOT NULL" },
          { label: "DISTINCT", detail: "\"Without duplicates\": removes identical rows from the result. It comes right after SELECT.", code: "SELECT DISTINCT City\nFROM CUSTOMER" },
        ] },
        { type: "pieges", items: [
          { titre: "Comparing with an empty value", faux: "WHERE ReturnDate = NULL", juste: "WHERE ReturnDate IS NULL", note: "<code>= NULL</code> never returns anything." },
          { titre: "Forgetting the quotes around text", faux: "WHERE City = Leeds", juste: "WHERE City = 'Leeds'", note: "Without quotes, Leeds is read as a column name." },
          { titre: "Mixing AND and OR without brackets", faux: "WHERE City = 'Leeds' OR City = 'York' AND FrameSize = 'M'", juste: "WHERE (City = 'Leeds' OR City = 'York') AND FrameSize = 'M'", note: "AND is evaluated before OR." },
        ] },
      ],
    },

    agregats: {
      titre: "Calculations and aggregates", court: "Aggregates", couleur: "#7c3aed",
      intro: "An aggregate function <strong>sums up several rows into one value</strong>: a count, a total, an average… Without GROUP BY, the result is a single row.",
      blocs: [
        { type: "petales", titre: "The five functions", centre: "Aggregates", petales: [
          { label: "COUNT(*)", detail: "Counts the <strong>rows</strong> kept.", code: "SELECT COUNT(*)\nFROM RENTAL\nWHERE ReturnDate IS NULL" },
          { label: "COUNT(col)", detail: "Counts the rows where the column is <strong>filled in</strong> (NULLs are ignored).", code: "SELECT COUNT(Email)\nFROM CUSTOMER" },
          { label: "COUNT DISTINCT", detail: "Counts the <strong>different</strong> values.", code: "SELECT COUNT(DISTINCT City)\nFROM CUSTOMER" },
          { label: "SUM", detail: "Adds up a numeric column.", code: "SELECT SUM(DailyPrice)\nFROM RENTAL_LINE" },
          { label: "AVG", detail: "Computes the average (NULLs are ignored).", code: "SELECT AVG(DailyRate)\nFROM CATEGORY" },
          { label: "MIN / MAX", detail: "The smallest / largest value. Also works on dates and text.", code: "SELECT MIN(StartDate), MAX(StartDate)\nFROM RENTAL" },
          { label: "Row calculation", detail: "A calculation between columns is done on <strong>each row</strong>, without summarising. Name it with AS.", code: "SELECT RentalId, DailyPrice * 7 AS WeekPrice\nFROM RENTAL_LINE" },
        ] },
        { type: "process", titre: "What the database does", etapes: [
          { label: "The table's rows", detail: "The database starts from all the rows of the FROM table." },
          { label: "The WHERE filter", detail: "It keeps only the rows that meet the condition." },
          { label: "The function", detail: "It applies COUNT, SUM, AVG… to these rows." },
          { label: "One single row", detail: "Without GROUP BY, the result is <strong>one row</strong>: you cannot display a \"normal\" column next to it. For a calculation per group, see the <em>Grouping</em> reminder." },
        ] },
        { type: "pieges", items: [
          { titre: "Displaying a column next to an aggregate without grouping", faux: "SELECT City, COUNT(*)\nFROM CUSTOMER", juste: "SELECT City, COUNT(*)\nFROM CUSTOMER\nGROUP BY City" },
          { titre: "Putting an aggregate in WHERE", faux: "WHERE COUNT(*) > 3", juste: "GROUP BY …\nHAVING COUNT(*) > 3", note: "A condition on a group calculation goes in HAVING." },
        ] },
      ],
    },

    dates: {
      titre: "Dates", court: "Dates", couleur: "#0d9488",
      intro: "Dates are split with <strong>YEAR</strong>, <strong>MONTH</strong> and <strong>DAY</strong>. Write them as <code>'2025-03-15'</code> (the French exams use <code>'15/03/2025'</code>). Today's date is simulated in each exercise: NOW() returns it.",
      blocs: [
        { type: "petales", titre: "The tools", centre: "Dates", petales: [
          { label: "YEAR()", detail: "Extracts the year.", code: "WHERE YEAR(StartDate) = 2025" },
          { label: "MONTH()", detail: "Extracts the month (1 to 12). For \"March 2025\", combine month and year.", code: "WHERE MONTH(StartDate) = 3\nAND YEAR(StartDate) = 2025" },
          { label: "DAY()", detail: "Extracts the day of the month (1 to 31).", code: "WHERE DAY(StartDate) = 1" },
          { label: "BETWEEN", detail: "A period, bounds <strong>included</strong>.", code: "WHERE StartDate BETWEEN '2025-01-01' AND '2025-03-31'" },
          { label: "Comparison", detail: "Before / after a date: &lt; and &gt;.", code: "WHERE StartDate < '2025-07-01'" },
          { label: "DATEDIFF", detail: "Number of days between two dates: DATEDIFF(end, start).", code: "WHERE DATEDIFF(ReturnDate, StartDate) > 7" },
          { label: "NOW()", detail: "Today's date (simulated in the exercise). CURDATE() is equivalent.", code: "WHERE DATEDIFF(NOW(), StartDate) > 30" },
        ] },
        { type: "process", titre: "Translating a period from the question", etapes: [
          { label: "\"in 2025\"", detail: "A whole year.", code: "YEAR(DateX) = 2025" },
          { label: "\"in March 2025\"", detail: "A month of a year: two conditions.", code: "MONTH(DateX) = 3 AND YEAR(DateX) = 2025" },
          { label: "\"from … to …\"", detail: "A precise period.", code: "DateX BETWEEN '2025-03-01' AND '2025-03-15'" },
          { label: "\"more than 30 days ago\"", detail: "A gap with today.", code: "DATEDIFF(NOW(), DateX) > 30" },
        ] },
        { type: "pieges", items: [
          { titre: "Forgetting the year with the month", faux: "WHERE MONTH(StartDate) = 3", juste: "WHERE MONTH(StartDate) = 3\nAND YEAR(StartDate) = 2025", note: "Otherwise you get every March of every year." },
          { titre: "Date without quotes", faux: "WHERE StartDate > 2025-01-01", juste: "WHERE StartDate > '2025-01-01'" },
        ] },
      ],
    },

    jointures: {
      titre: "Joins", court: "Joins", couleur: "#ea580c",
      intro: "A join <strong>links two tables</strong> by matching a foreign key (#) with the primary key it refers to: follow the arrows of the diagram.",
      blocs: [
        { type: "process", titre: "The method, step by step", etapes: [
          { label: "Obvious tables", detail: "Find the tables holding the columns to display and those of the conditions.", code: "CUSTOMER (LastName…), BIKE (CategoryId)" },
          { label: "Linking tables", detail: "If they are not linked directly, follow the arrows: the intermediate table goes in the FROM too, even if nothing from it is displayed.", code: "CUSTOMER ← RENTAL ← RENTAL_LINE → BIKE" },
          { label: "FROM", detail: "All the tables, separated by commas (aliases optional).", code: "FROM CUSTOMER, RENTAL, RENTAL_LINE, BIKE" },
          { label: "One join per link", detail: "n tables → <strong>n − 1 joins</strong>: foreign key = primary key. Prefix columns that share the same name.", code: "WHERE CUSTOMER.CustomerId = RENTAL.CustomerId\nAND RENTAL.RentalId = RENTAL_LINE.RentalId\nAND RENTAL_LINE.BikeId = BIKE.BikeId" },
          { label: "Filters", detail: "Then the conditions of the question, with AND.", code: "AND CategoryId = 2" },
          { label: "SELECT", detail: "Finally the columns to display (DISTINCT for \"without duplicates\").", code: "SELECT DISTINCT LastName, FirstName" },
        ] },
        { type: "petales", titre: "The finer points", centre: "Join", petales: [
          { label: "WHERE", detail: "Exam style: the join is an equality in the WHERE clause.", code: "FROM A, B\nWHERE A.IdB = B.IdB" },
          { label: "INNER JOIN", detail: "Equivalent writing, also accepted.", code: "FROM A\nINNER JOIN B ON A.IdB = B.IdB" },
          { label: "Prefix", detail: "A column present in two tables must be preceded by its table name (otherwise: \"ambiguous column\").", code: "SELECT CUSTOMER.CustomerId" },
          { label: "Alias", detail: "A short nickname for a table, declared in the FROM.", code: "FROM CUSTOMER C, RENTAL R\nWHERE C.CustomerId = R.CustomerId" },
          { label: "Composite key", detail: "If the key has two columns, match both.", code: "WHERE L.RentalId = X.RentalId\nAND L.BikeId = X.BikeId" },
          { label: "Cartesian product", detail: "A missing join combines every row with every other row: far too many rows.", code: "-- 3 tables, only 1 join: wrong result" },
        ] },
        { type: "pieges", items: [
          { titre: "Forgetting the linking table", faux: "FROM CUSTOMER, RENTAL_LINE\nWHERE CUSTOMER.CustomerId = RENTAL_LINE.CustomerId", juste: "FROM CUSTOMER, RENTAL, RENTAL_LINE\nWHERE CUSTOMER.CustomerId = RENTAL.CustomerId\nAND RENTAL.RentalId = RENTAL_LINE.RentalId", note: "RENTAL_LINE has no CustomerId column: go through RENTAL." },
          { titre: "Ambiguous column", faux: "SELECT CustomerId, LastName\nFROM CUSTOMER, RENTAL …", juste: "SELECT CUSTOMER.CustomerId, LastName\nFROM CUSTOMER, RENTAL …" },
        ] },
      ],
    },

    groupes: {
      titre: "Grouping: GROUP BY and HAVING", court: "Grouping", couleur: "#db2777",
      intro: "\"<strong>For each</strong> store, the number of rentals\": rows are put into <strong>groups</strong>, then the calculation is done for each group.",
      blocs: [
        { type: "process", titre: "The order in which the database works", etapes: [
          { label: "FROM + joins", detail: "The tables and their joins give the starting rows." },
          { label: "WHERE", detail: "Filters the <strong>rows</strong>, before any grouping.", code: "WHERE YEAR(StartDate) = 2025" },
          { label: "GROUP BY", detail: "Puts rows with the same value into groups.", code: "GROUP BY StoreName" },
          { label: "HAVING", detail: "Filters the <strong>groups</strong>, based on a calculation.", code: "HAVING COUNT(*) >= 3" },
          { label: "SELECT", detail: "One row per group: the group column and the calculation.", code: "SELECT StoreName, COUNT(*)" },
          { label: "ORDER BY", detail: "Sorts the result, possibly on the calculation.", code: "ORDER BY COUNT(*) DESC" },
        ] },
        { type: "petales", titre: "The golden rules", centre: "GROUP BY", petales: [
          { label: "SELECT columns", detail: "Every displayed column <strong>without a calculation function</strong> must be in the GROUP BY.", code: "SELECT LastName, FirstName, COUNT(*)\n…\nGROUP BY LastName, FirstName" },
          { label: "WHERE or HAVING?", detail: "Condition on a column → WHERE. Condition on a calculation (COUNT, SUM…) → HAVING." },
          { label: "\"For each\"", detail: "The word after \"for each\" or \"per\" in the question gives the GROUP BY column." },
          { label: "Identifier", detail: "To avoid merging two people with the same name, also group by the identifier.", code: "GROUP BY CUSTOMER.CustomerId, LastName" },
          { label: "Sorting on the calculation", detail: "You can sort on the result of a function.", code: "ORDER BY SUM(DailyPrice) DESC" },
        ] },
        { type: "pieges", items: [
          { titre: "Condition on a calculation in WHERE", faux: "WHERE COUNT(*) > 3\nGROUP BY CustomerId", juste: "GROUP BY CustomerId\nHAVING COUNT(*) > 3" },
          { titre: "Displayed column missing from GROUP BY", faux: "SELECT City, LastName, COUNT(*)\n…\nGROUP BY City", juste: "SELECT City, COUNT(*)\n…\nGROUP BY City" },
        ] },
      ],
    },

    sousrequetes: {
      titre: "Subqueries", court: "Subqueries", couleur: "#4f46e5",
      intro: "A subquery is a query <strong>in brackets</strong> inside another one. It is computed first, and its result is used by the main query.",
      blocs: [
        { type: "process", titre: "Reading a subquery", etapes: [
          { label: "Spot the hidden question", detail: "\"customers who have <strong>never</strong> …\", \"above the <strong>average</strong>\": you first need to compute a list or a value." },
          { label: "Write the subquery", detail: "It returns <strong>one column</strong>: a list of values, or a single value.", code: "SELECT CustomerId FROM RENTAL" },
          { label: "Use it", detail: "In the WHERE (or HAVING) clause of the main query.", code: "WHERE CustomerId NOT IN (SELECT CustomerId FROM RENTAL)" },
        ] },
        { type: "petales", titre: "Common forms", centre: "( SELECT … )", petales: [
          { label: "IN", detail: "The value is in the computed list.", code: "WHERE BikeId IN (SELECT BikeId FROM RENTAL_LINE)" },
          { label: "NOT IN", detail: "Translates \"never\", \"none\", \"has not\".", code: "WHERE CustomerId NOT IN (SELECT CustomerId FROM RENTAL)" },
          { label: "> (average)", detail: "Compare with a computed value: the subquery returns a single value.", code: "WHERE DailyRate > (SELECT AVG(DailyRate) FROM CATEGORY)" },
          { label: "= (max)", detail: "Find the row with the highest value.", code: "WHERE DailyPrice = (SELECT MAX(DailyPrice) FROM RENTAL_LINE)" },
          { label: "EXISTS", detail: "True if the subquery returns at least one row (it refers to the main query).", code: "WHERE NOT EXISTS (SELECT * FROM RENTAL R\n  WHERE R.CustomerId = C.CustomerId)" },
          { label: "In HAVING", detail: "Compare a group calculation with a computed value.", code: "HAVING COUNT(*) > (SELECT AVG(…) FROM …)" },
        ] },
        { type: "pieges", items: [
          { titre: "\"Never\" written with <>", faux: "FROM CUSTOMER, RENTAL\nWHERE CUSTOMER.CustomerId <> RENTAL.CustomerId", juste: "FROM CUSTOMER\nWHERE CustomerId NOT IN (SELECT CustomerId FROM RENTAL)", note: "<code>&lt;&gt;</code> compares row by row and returns almost everything." },
          { titre: "Several columns in the subquery", faux: "WHERE CustomerId IN (SELECT CustomerId, LastName FROM …)", juste: "WHERE CustomerId IN (SELECT CustomerId FROM …)" },
        ] },
      ],
    },

    autojointure: {
      titre: "Self-join", court: "Self-join", couleur: "#ca8a04",
      intro: "A table can refer to itself: a customer was referred by another customer. You then use <strong>the same table twice</strong>, with two aliases.",
      blocs: [
        { type: "process", titre: "The method", etapes: [
          { label: "Spot the looping arrow", detail: "In the diagram, a foreign key points to its own table (#ReferredBy → CUSTOMER)." },
          { label: "Two aliases", detail: "One copy for each role: the customer (C) and the referrer (R).", code: "FROM CUSTOMER C, CUSTOMER R" },
          { label: "The join", detail: "The customer's foreign key = the referrer's primary key.", code: "WHERE C.ReferredBy = R.CustomerId" },
          { label: "The columns", detail: "Always prefixed with the alias, to know which copy they come from.", code: "SELECT C.LastName, R.LastName AS Referrer" },
        ] },
        { type: "pieges", items: [
          { titre: "Only one copy of the table", faux: "FROM CUSTOMER\nWHERE ReferredBy = CustomerId", juste: "FROM CUSTOMER C, CUSTOMER R\nWHERE C.ReferredBy = R.CustomerId" },
        ] },
      ],
    },

    majs: {
      titre: "Updates: INSERT, UPDATE, DELETE", court: "Updates", couleur: "#dc2626",
      intro: "An update query <strong>changes one table only</strong>. In SQL Lab it is simulated: each attempt starts from a fresh copy of the database.",
      blocs: [
        { type: "petales", titre: "The three statements", centre: "Update", petales: [
          { label: "INSERT", detail: "Adds a row. Values follow the order of the listed columns.", code: "INSERT INTO CATEGORY (CategoryId, CategoryName, DailyRate)\nVALUES (7, 'Tandem', 45)" },
          { label: "UPDATE", detail: "Changes existing rows: SET the new value, WHERE the targeted rows.", code: "UPDATE RENTAL\nSET ReturnDate = '2025-06-15'\nWHERE RentalId = 1036" },
          { label: "Calculation in SET", detail: "The new value can be computed from the old one.", code: "UPDATE CATEGORY\nSET DailyRate = DailyRate * 1.05" },
          { label: "DELETE", detail: "Deletes rows. Without WHERE, the whole table is emptied.", code: "DELETE FROM CUSTOMER\nWHERE CustomerId = 25" },
          { label: "Subquery", detail: "The WHERE clause can use a subquery to target rows.", code: "DELETE FROM CUSTOMER\nWHERE CustomerId NOT IN (SELECT CustomerId FROM RENTAL)" },
        ] },
        { type: "process", titre: "Before running it", etapes: [
          { label: "Which table?", detail: "One table per query." },
          { label: "Which values?", detail: "Text and dates in quotes; a foreign key must exist in the referenced table." },
          { label: "Which rows?", detail: "WHERE targets the rows precisely, often by their identifier." },
          { label: "Integrity", detail: "You cannot delete a row that a foreign key in another table refers to." },
        ] },
        { type: "pieges", items: [
          { titre: "UPDATE without WHERE", faux: "UPDATE RENTAL SET ReturnDate = '2025-06-15'", juste: "UPDATE RENTAL SET ReturnDate = '2025-06-15'\nWHERE RentalId = 1036", note: "Without WHERE, every rental is changed." },
          { titre: "INSERT in the wrong order", faux: "INSERT INTO CATEGORY (CategoryId, CategoryName)\nVALUES ('Tandem', 7)", juste: "INSERT INTO CATEGORY (CategoryId, CategoryName)\nVALUES (7, 'Tandem')" },
        ] },
      ],
    },

    schema: {
      titre: "Evolving a relational schema", court: "Schema", couleur: "#059669",
      intro: "Each new business rule translates into a <strong>type of link</strong>: it decides where the foreign key goes, or whether a new table is needed.",
      blocs: [
        { type: "process", titre: "From the rule to the schema", etapes: [
          { label: "Read the rule", detail: "Find the two linked objects and the cardinality: \"only one\" or \"several\", in both directions." },
          { label: "One-to-many", detail: "Each A is linked to <strong>only one</strong> B: B's key becomes a foreign key in A (the \"many\" side).", code: "RENTAL (RentalId, …, #CustomerId)" },
          { label: "Many-to-many", detail: "An A has several Bs <strong>and</strong> a B several As: you need a junction table.", code: "RENTAL_ACCESSORY (#RentalId, #AccessoryId)" },
          { label: "Composite key", detail: "The junction table's primary key combines the keys of the linked tables; each one is also a foreign key." },
          { label: "Link attributes", detail: "Information that depends on both at once (quantity, share) goes in the junction table.", code: "RENTAL_ACCESSORY (#RentalId, #AccessoryId, Quantity)" },
        ] },
        { type: "petales", titre: "The vocabulary", centre: "Schema", petales: [
          { label: "Primary key", detail: "Identifies each row, underlined in the notation. Never empty, never duplicated." },
          { label: "Foreign key", detail: "Preceded by #, it refers to the primary key of another table: the arrow in the diagram." },
          { label: "Junction table", detail: "Translates a many-to-many relationship. Key = keys of the linked tables." },
          { label: "Reference table", detail: "Describes a new object (types, categories…) with its key and its label." },
          { label: "What no longer fits", detail: "If a rule requires several values, the column must leave its table: a cell holds only one value." },
          { label: "Reflexive", detail: "A foreign key pointing to its own table (a referrer is a customer)." },
        ] },
      ],
    },

    processus: {
      titre: "Event-driven process diagrams", court: "Process", couleur: "#0891b2",
      intro: "A process is read from top to bottom: <strong>events</strong> trigger <strong>operations</strong>, which produce new events, in each actor's swimlane.",
      blocs: [
        { type: "process", titre: "The basic chain", etapes: [
          { label: "Event", detail: "Something that happens: a request, a document received, a time (\"every morning\"). Drawn in an ellipse." },
          { label: "Synchronisation", detail: "When an operation waits for <strong>several</strong> events: a trapezoid with a condition (A and (B or C))." },
          { label: "Operation", detail: "Processing done by one actor, without interruption: a name, actions." },
          { label: "Output rules", detail: "The ways out of the operation: \"Always\", or \"accepted\" / \"refused\"." },
          { label: "Resulting events", detail: "Each rule produces an event, which can trigger the next operation." },
        ] },
        { type: "petales", titre: "Rules of the formalism", centre: "Process", petales: [
          { label: "Swimlanes", detail: "One column per actor; each operation sits in the lane of whoever performs it." },
          { label: "No direct arrow", detail: "An operation never leads directly to another one: there is always an event in between." },
          { label: "AND", detail: "All the events are needed.", code: "A and B" },
          { label: "OR", detail: "Either one is enough.", code: "A or B" },
          { label: "Brackets", detail: "They group conditions, as in arithmetic.", code: "A and (B or C)" },
          { label: "All the letters", detail: "Each arrow entering the synchronisation has a letter, and every letter appears in the condition." },
        ] },
      ],
    },
  };

  const es = {
    table: {
      titre: "Consultar una sola tabla", court: "Una tabla", couleur: "#2563eb",
      intro: "Una consulta se lee como una frase: <strong>quiero ver</strong> estas columnas, <strong>de</strong> esta tabla, <strong>cuando</strong> esta condición se cumple, <strong>ordenadas</strong> de esta manera.",
      blocs: [
        { type: "process", titre: "Construir la consulta", etapes: [
          { label: "FROM: la tabla", detail: "Busca en el esquema la tabla que contiene la información pedida.", code: "FROM CLIENTE" },
          { label: "SELECT: las columnas", detail: "Escribe las columnas que se muestran, en el orden del enunciado, separadas por comas. <code>*</code> = todas las columnas.", code: "SELECT Apellido, Nombre, Ciudad" },
          { label: "WHERE: las filas", detail: "Conserva solo las filas que cumplen la condición. Las condiciones se combinan con AND / OR.", code: "WHERE Ciudad = 'Sevilla'" },
          { label: "ORDER BY: el orden", detail: "Solo si el enunciado pide un orden. ASC (ascendente, por defecto) o DESC (descendente).", code: "ORDER BY Apellido ASC" },
        ] },
        { type: "petales", titre: "Las condiciones del WHERE", centre: "WHERE", petales: [
          { label: "= <> < >", detail: "Comparar con un valor. El texto y las fechas van entre comillas simples, los números no. <code>&lt;&gt;</code> significa «distinto de».", code: "WHERE TarifaDiaria > 20" },
          { label: "AND / OR", detail: "AND: las dos condiciones deben cumplirse. OR: basta con una. Si usas las dos, pon paréntesis.", code: "WHERE (Ciudad = 'Sevilla' OR Ciudad = 'Valencia')\nAND TallaCuadro = 'M'" },
          { label: "BETWEEN", detail: "Entre dos límites, <strong>ambos incluidos</strong>.", code: "WHERE TarifaDiaria BETWEEN 10 AND 20" },
          { label: "IN", detail: "El valor está en una lista: más corto que una serie de OR.", code: "WHERE Ciudad IN ('Sevilla', 'Valencia', 'Bilbao')" },
          { label: "LIKE", detail: "Se parece a un patrón: <code>%</code> = cualquier secuencia de caracteres, <code>_</code> = un solo carácter.", code: "WHERE Apellido LIKE 'Gar%'" },
          { label: "IS NULL", detail: "El valor está vacío (sin rellenar). <strong>Nunca</strong> escribas <code>= NULL</code>.", code: "WHERE FechaDevolucion IS NULL" },
          { label: "NOT", detail: "Invierte una condición: NOT IN, NOT LIKE, IS NOT NULL.", code: "WHERE Email IS NOT NULL" },
          { label: "DISTINCT", detail: "«Sin duplicados»: elimina las filas idénticas del resultado. Va justo después de SELECT.", code: "SELECT DISTINCT Ciudad\nFROM CLIENTE" },
        ] },
        { type: "pieges", items: [
          { titre: "Comparar con un valor vacío", faux: "WHERE FechaDevolucion = NULL", juste: "WHERE FechaDevolucion IS NULL", note: "<code>= NULL</code> nunca devuelve nada." },
          { titre: "Olvidar las comillas del texto", faux: "WHERE Ciudad = Sevilla", juste: "WHERE Ciudad = 'Sevilla'", note: "Sin comillas, Sevilla se lee como un nombre de columna." },
          { titre: "Mezclar AND y OR sin paréntesis", faux: "WHERE Ciudad = 'Sevilla' OR Ciudad = 'Valencia' AND TallaCuadro = 'M'", juste: "WHERE (Ciudad = 'Sevilla' OR Ciudad = 'Valencia') AND TallaCuadro = 'M'", note: "AND se evalúa antes que OR." },
        ] },
      ],
    },

    agregats: {
      titre: "Cálculos y agregados", court: "Agregados", couleur: "#7c3aed",
      intro: "Una función de agregado <strong>resume varias filas en un solo valor</strong>: un recuento, un total, una media… Sin GROUP BY, el resultado es una sola fila.",
      blocs: [
        { type: "petales", titre: "Las cinco funciones", centre: "Agregados", petales: [
          { label: "COUNT(*)", detail: "Cuenta las <strong>filas</strong> conservadas.", code: "SELECT COUNT(*)\nFROM ALQUILER\nWHERE FechaDevolucion IS NULL" },
          { label: "COUNT(col)", detail: "Cuenta las filas en las que la columna está <strong>rellenada</strong> (los NULL se ignoran).", code: "SELECT COUNT(Email)\nFROM CLIENTE" },
          { label: "COUNT DISTINCT", detail: "Cuenta los valores <strong>distintos</strong>.", code: "SELECT COUNT(DISTINCT Ciudad)\nFROM CLIENTE" },
          { label: "SUM", detail: "Suma una columna numérica.", code: "SELECT SUM(PrecioDiario)\nFROM LINEA_ALQUILER" },
          { label: "AVG", detail: "Calcula la media (los NULL se ignoran).", code: "SELECT AVG(TarifaDiaria)\nFROM CATEGORIA" },
          { label: "MIN / MAX", detail: "El valor más pequeño / más grande. También sirve con fechas y texto.", code: "SELECT MIN(FechaInicio), MAX(FechaInicio)\nFROM ALQUILER" },
          { label: "Cálculo por fila", detail: "Un cálculo entre columnas se hace en <strong>cada fila</strong>, sin resumir. Ponle nombre con AS.", code: "SELECT IdAlquiler, PrecioDiario * 7 AS PrecioSemana\nFROM LINEA_ALQUILER" },
        ] },
        { type: "process", titre: "Lo que hace la base de datos", etapes: [
          { label: "Las filas de la tabla", detail: "La base de datos parte de todas las filas de la tabla del FROM." },
          { label: "El filtro WHERE", detail: "Conserva solo las filas que cumplen la condición." },
          { label: "La función", detail: "Aplica COUNT, SUM, AVG… a esas filas." },
          { label: "Una sola fila", detail: "Sin GROUP BY, el resultado es <strong>una fila</strong>: no puedes mostrar una columna «normal» a su lado. Para un cálculo por grupo, consulta el recordatorio <em>Agrupación</em>." },
        ] },
        { type: "pieges", items: [
          { titre: "Mostrar una columna junto a un agregado sin agrupar", faux: "SELECT Ciudad, COUNT(*)\nFROM CLIENTE", juste: "SELECT Ciudad, COUNT(*)\nFROM CLIENTE\nGROUP BY Ciudad" },
          { titre: "Poner un agregado en el WHERE", faux: "WHERE COUNT(*) > 3", juste: "GROUP BY …\nHAVING COUNT(*) > 3", note: "Una condición sobre un cálculo de grupo va en HAVING." },
        ] },
      ],
    },

    dates: {
      titre: "Fechas", court: "Fechas", couleur: "#0d9488",
      intro: "Las fechas se descomponen con <strong>YEAR</strong>, <strong>MONTH</strong> y <strong>DAY</strong>. Escríbelas como <code>'2025-03-15'</code> (los exámenes franceses usan <code>'15/03/2025'</code>). La fecha de hoy se simula en cada ejercicio: NOW() la devuelve.",
      blocs: [
        { type: "petales", titre: "Las herramientas", centre: "Fechas", petales: [
          { label: "YEAR()", detail: "Extrae el año.", code: "WHERE YEAR(FechaInicio) = 2025" },
          { label: "MONTH()", detail: "Extrae el mes (de 1 a 12). Para «marzo de 2025», combina mes y año.", code: "WHERE MONTH(FechaInicio) = 3\nAND YEAR(FechaInicio) = 2025" },
          { label: "DAY()", detail: "Extrae el día del mes (de 1 a 31).", code: "WHERE DAY(FechaInicio) = 1" },
          { label: "BETWEEN", detail: "Un periodo, límites <strong>incluidos</strong>.", code: "WHERE FechaInicio BETWEEN '2025-01-01' AND '2025-03-31'" },
          { label: "Comparación", detail: "Antes / después de una fecha: &lt; y &gt;.", code: "WHERE FechaInicio < '2025-07-01'" },
          { label: "DATEDIFF", detail: "Número de días entre dos fechas: DATEDIFF(fin, inicio).", code: "WHERE DATEDIFF(FechaDevolucion, FechaInicio) > 7" },
          { label: "NOW()", detail: "La fecha de hoy (simulada en el ejercicio). CURDATE() es equivalente.", code: "WHERE DATEDIFF(NOW(), FechaInicio) > 30" },
        ] },
        { type: "process", titre: "Traducir un periodo del enunciado", etapes: [
          { label: "«en 2025»", detail: "Un año completo.", code: "YEAR(FechaX) = 2025" },
          { label: "«en marzo de 2025»", detail: "Un mes de un año: dos condiciones.", code: "MONTH(FechaX) = 3 AND YEAR(FechaX) = 2025" },
          { label: "«del … al …»", detail: "Un periodo concreto.", code: "FechaX BETWEEN '2025-03-01' AND '2025-03-15'" },
          { label: "«hace más de 30 días»", detail: "Una diferencia con la fecha de hoy.", code: "DATEDIFF(NOW(), FechaX) > 30" },
        ] },
        { type: "pieges", items: [
          { titre: "Olvidar el año junto al mes", faux: "WHERE MONTH(FechaInicio) = 3", juste: "WHERE MONTH(FechaInicio) = 3\nAND YEAR(FechaInicio) = 2025", note: "Si no, obtienes todos los meses de marzo de todos los años." },
          { titre: "Fecha sin comillas", faux: "WHERE FechaInicio > 2025-01-01", juste: "WHERE FechaInicio > '2025-01-01'" },
        ] },
      ],
    },

    jointures: {
      titre: "Combinaciones (JOIN)", court: "Combinaciones", couleur: "#ea580c",
      intro: "Una combinación <strong>enlaza dos tablas</strong> haciendo coincidir una clave foránea (#) con la clave primaria a la que remite: sigue las flechas del diagrama.",
      blocs: [
        { type: "process", titre: "El método, paso a paso", etapes: [
          { label: "Tablas evidentes", detail: "Localiza las tablas que contienen las columnas que se muestran y las de las condiciones.", code: "CLIENTE (Apellido…), BICICLETA (IdCategoria)" },
          { label: "Tablas intermedias", detail: "Si no están enlazadas directamente, sigue las flechas: la tabla intermedia también va en el FROM, aunque no se muestre nada de ella.", code: "CLIENTE ← ALQUILER ← LINEA_ALQUILER → BICICLETA" },
          { label: "FROM", detail: "Todas las tablas, separadas por comas (alias opcionales).", code: "FROM CLIENTE, ALQUILER, LINEA_ALQUILER, BICICLETA" },
          { label: "Una combinación por enlace", detail: "n tablas → <strong>n − 1 combinaciones</strong>: clave foránea = clave primaria. Prefija las columnas que tienen el mismo nombre.", code: "WHERE CLIENTE.IdCliente = ALQUILER.IdCliente\nAND ALQUILER.IdAlquiler = LINEA_ALQUILER.IdAlquiler\nAND LINEA_ALQUILER.IdBicicleta = BICICLETA.IdBicicleta" },
          { label: "Filtros", detail: "Después, las condiciones del enunciado, con AND.", code: "AND IdCategoria = 2" },
          { label: "SELECT", detail: "Por último, las columnas que se muestran (DISTINCT para «sin duplicados»).", code: "SELECT DISTINCT Apellido, Nombre" },
        ] },
        { type: "petales", titre: "Los detalles", centre: "Combinación", petales: [
          { label: "WHERE", detail: "Estilo examen: la combinación es una igualdad en la cláusula WHERE.", code: "FROM A, B\nWHERE A.IdB = B.IdB" },
          { label: "INNER JOIN", detail: "Escritura equivalente, también aceptada.", code: "FROM A\nINNER JOIN B ON A.IdB = B.IdB" },
          { label: "Prefijo", detail: "Una columna presente en dos tablas debe ir precedida del nombre de su tabla (si no: «columna ambigua»).", code: "SELECT CLIENTE.IdCliente" },
          { label: "Alias", detail: "Un nombre corto para una tabla, declarado en el FROM.", code: "FROM CLIENTE C, ALQUILER A\nWHERE C.IdCliente = A.IdCliente" },
          { label: "Clave compuesta", detail: "Si la clave tiene dos columnas, haz coincidir las dos.", code: "WHERE L.IdAlquiler = X.IdAlquiler\nAND L.IdBicicleta = X.IdBicicleta" },
          { label: "Producto cartesiano", detail: "Una combinación olvidada combina cada fila con todas las demás: demasiadas filas.", code: "-- 3 tablas, solo 1 combinación: resultado erróneo" },
        ] },
        { type: "pieges", items: [
          { titre: "Olvidar la tabla intermedia", faux: "FROM CLIENTE, LINEA_ALQUILER\nWHERE CLIENTE.IdCliente = LINEA_ALQUILER.IdCliente", juste: "FROM CLIENTE, ALQUILER, LINEA_ALQUILER\nWHERE CLIENTE.IdCliente = ALQUILER.IdCliente\nAND ALQUILER.IdAlquiler = LINEA_ALQUILER.IdAlquiler", note: "LINEA_ALQUILER no tiene columna IdCliente: hay que pasar por ALQUILER." },
          { titre: "Columna ambigua", faux: "SELECT IdCliente, Apellido\nFROM CLIENTE, ALQUILER …", juste: "SELECT CLIENTE.IdCliente, Apellido\nFROM CLIENTE, ALQUILER …" },
        ] },
      ],
    },

    groupes: {
      titre: "Agrupación: GROUP BY y HAVING", court: "Agrupación", couleur: "#db2777",
      intro: "«<strong>Para cada</strong> tienda, el número de alquileres»: las filas se reúnen en <strong>grupos</strong> y luego se hace el cálculo para cada grupo.",
      blocs: [
        { type: "process", titre: "El orden en que trabaja la base de datos", etapes: [
          { label: "FROM + combinaciones", detail: "Las tablas y sus combinaciones dan las filas de partida." },
          { label: "WHERE", detail: "Filtra las <strong>filas</strong>, antes de cualquier agrupación.", code: "WHERE YEAR(FechaInicio) = 2025" },
          { label: "GROUP BY", detail: "Reúne en grupos las filas que tienen el mismo valor.", code: "GROUP BY NombreTienda" },
          { label: "HAVING", detail: "Filtra los <strong>grupos</strong>, según un cálculo.", code: "HAVING COUNT(*) >= 3" },
          { label: "SELECT", detail: "Una fila por grupo: la columna del grupo y el cálculo.", code: "SELECT NombreTienda, COUNT(*)" },
          { label: "ORDER BY", detail: "Ordena el resultado, también según el cálculo.", code: "ORDER BY COUNT(*) DESC" },
        ] },
        { type: "petales", titre: "Las reglas de oro", centre: "GROUP BY", petales: [
          { label: "Columnas del SELECT", detail: "Toda columna mostrada <strong>sin función de cálculo</strong> debe estar en el GROUP BY.", code: "SELECT Apellido, Nombre, COUNT(*)\n…\nGROUP BY Apellido, Nombre" },
          { label: "¿WHERE o HAVING?", detail: "Condición sobre una columna → WHERE. Condición sobre un cálculo (COUNT, SUM…) → HAVING." },
          { label: "«Para cada»", detail: "La palabra que sigue a «para cada» o «por» en el enunciado da la columna del GROUP BY." },
          { label: "Identificador", detail: "Para no mezclar a dos personas con el mismo apellido, agrupa también por el identificador.", code: "GROUP BY CLIENTE.IdCliente, Apellido" },
          { label: "Ordenar por el cálculo", detail: "Puedes ordenar por el resultado de una función.", code: "ORDER BY SUM(PrecioDiario) DESC" },
        ] },
        { type: "pieges", items: [
          { titre: "Condición sobre un cálculo en el WHERE", faux: "WHERE COUNT(*) > 3\nGROUP BY IdCliente", juste: "GROUP BY IdCliente\nHAVING COUNT(*) > 3" },
          { titre: "Columna mostrada que falta en el GROUP BY", faux: "SELECT Ciudad, Apellido, COUNT(*)\n…\nGROUP BY Ciudad", juste: "SELECT Ciudad, COUNT(*)\n…\nGROUP BY Ciudad" },
        ] },
      ],
    },

    sousrequetes: {
      titre: "Subconsultas", court: "Subconsultas", couleur: "#4f46e5",
      intro: "Una subconsulta es una consulta <strong>entre paréntesis</strong> dentro de otra. Se calcula primero, y la consulta principal utiliza su resultado.",
      blocs: [
        { type: "process", titre: "Leer una subconsulta", etapes: [
          { label: "Detectar la pregunta oculta", detail: "«los clientes que <strong>nunca</strong> …», «por encima de la <strong>media</strong>»: primero hay que calcular una lista o un valor." },
          { label: "Escribir la subconsulta", detail: "Devuelve <strong>una sola columna</strong>: una lista de valores o un único valor.", code: "SELECT IdCliente FROM ALQUILER" },
          { label: "Utilizarla", detail: "En la cláusula WHERE (o HAVING) de la consulta principal.", code: "WHERE IdCliente NOT IN (SELECT IdCliente FROM ALQUILER)" },
        ] },
        { type: "petales", titre: "Formas habituales", centre: "( SELECT … )", petales: [
          { label: "IN", detail: "El valor está en la lista calculada.", code: "WHERE IdBicicleta IN (SELECT IdBicicleta FROM LINEA_ALQUILER)" },
          { label: "NOT IN", detail: "Traduce «nunca», «ninguno», «no ha».", code: "WHERE IdCliente NOT IN (SELECT IdCliente FROM ALQUILER)" },
          { label: "> (media)", detail: "Comparar con un valor calculado: la subconsulta devuelve un único valor.", code: "WHERE TarifaDiaria > (SELECT AVG(TarifaDiaria) FROM CATEGORIA)" },
          { label: "= (máximo)", detail: "Encontrar la fila con el valor más alto.", code: "WHERE PrecioDiario = (SELECT MAX(PrecioDiario) FROM LINEA_ALQUILER)" },
          { label: "EXISTS", detail: "Verdadero si la subconsulta devuelve al menos una fila (remite a la consulta principal).", code: "WHERE NOT EXISTS (SELECT * FROM ALQUILER A\n  WHERE A.IdCliente = C.IdCliente)" },
          { label: "En el HAVING", detail: "Comparar un cálculo de grupo con un valor calculado.", code: "HAVING COUNT(*) > (SELECT AVG(…) FROM …)" },
        ] },
        { type: "pieges", items: [
          { titre: "«Nunca» escrito con <>", faux: "FROM CLIENTE, ALQUILER\nWHERE CLIENTE.IdCliente <> ALQUILER.IdCliente", juste: "FROM CLIENTE\nWHERE IdCliente NOT IN (SELECT IdCliente FROM ALQUILER)", note: "<code>&lt;&gt;</code> compara fila a fila y devuelve casi todo." },
          { titre: "Varias columnas en la subconsulta", faux: "WHERE IdCliente IN (SELECT IdCliente, Apellido FROM …)", juste: "WHERE IdCliente IN (SELECT IdCliente FROM …)" },
        ] },
      ],
    },

    autojointure: {
      titre: "Autocombinación", court: "Autocombinación", couleur: "#ca8a04",
      intro: "Una tabla puede remitir a sí misma: un cliente fue recomendado por otro cliente. Se utiliza entonces <strong>dos veces la misma tabla</strong>, con dos alias.",
      blocs: [
        { type: "process", titre: "El método", etapes: [
          { label: "Detectar la flecha en bucle", detail: "En el diagrama, una clave foránea apunta a su propia tabla (#RecomendadoPor → CLIENTE)." },
          { label: "Dos alias", detail: "Una copia por papel: el cliente (C) y quien lo recomienda (R).", code: "FROM CLIENTE C, CLIENTE R" },
          { label: "La combinación", detail: "La clave foránea del cliente = la clave primaria de quien lo recomienda.", code: "WHERE C.RecomendadoPor = R.IdCliente" },
          { label: "Las columnas", detail: "Siempre prefijadas con el alias, para saber de qué copia vienen.", code: "SELECT C.Apellido, R.Apellido AS Recomendador" },
        ] },
        { type: "pieges", items: [
          { titre: "Una sola copia de la tabla", faux: "FROM CLIENTE\nWHERE RecomendadoPor = IdCliente", juste: "FROM CLIENTE C, CLIENTE R\nWHERE C.RecomendadoPor = R.IdCliente" },
        ] },
      ],
    },

    majs: {
      titre: "Actualizaciones: INSERT, UPDATE, DELETE", court: "Actualizaciones", couleur: "#dc2626",
      intro: "Una consulta de actualización <strong>modifica una sola tabla</strong>. En SQL Lab se simula: cada intento parte de una copia nueva de la base de datos.",
      blocs: [
        { type: "petales", titre: "Las tres instrucciones", centre: "Actualización", petales: [
          { label: "INSERT", detail: "Añade una fila. Los valores siguen el orden de las columnas indicadas.", code: "INSERT INTO CATEGORIA (IdCategoria, NombreCategoria, TarifaDiaria)\nVALUES (7, 'Tándem', 45)" },
          { label: "UPDATE", detail: "Modifica filas existentes: SET el nuevo valor, WHERE las filas afectadas.", code: "UPDATE ALQUILER\nSET FechaDevolucion = '2025-06-15'\nWHERE IdAlquiler = 1036" },
          { label: "Cálculo en el SET", detail: "El nuevo valor puede calcularse a partir del anterior.", code: "UPDATE CATEGORIA\nSET TarifaDiaria = TarifaDiaria * 1.05" },
          { label: "DELETE", detail: "Elimina filas. Sin WHERE, se vacía toda la tabla.", code: "DELETE FROM CLIENTE\nWHERE IdCliente = 25" },
          { label: "Subconsulta", detail: "La cláusula WHERE puede usar una subconsulta para seleccionar las filas.", code: "DELETE FROM CLIENTE\nWHERE IdCliente NOT IN (SELECT IdCliente FROM ALQUILER)" },
        ] },
        { type: "process", titre: "Antes de ejecutarla", etapes: [
          { label: "¿Qué tabla?", detail: "Una tabla por consulta." },
          { label: "¿Qué valores?", detail: "Texto y fechas entre comillas; una clave foránea debe existir en la tabla a la que remite." },
          { label: "¿Qué filas?", detail: "WHERE selecciona las filas con precisión, a menudo por su identificador." },
          { label: "Integridad", detail: "No puedes eliminar una fila a la que remite una clave foránea de otra tabla." },
        ] },
        { type: "pieges", items: [
          { titre: "UPDATE sin WHERE", faux: "UPDATE ALQUILER SET FechaDevolucion = '2025-06-15'", juste: "UPDATE ALQUILER SET FechaDevolucion = '2025-06-15'\nWHERE IdAlquiler = 1036", note: "Sin WHERE, se modifican todos los alquileres." },
          { titre: "INSERT en el orden equivocado", faux: "INSERT INTO CATEGORIA (IdCategoria, NombreCategoria)\nVALUES ('Tándem', 7)", juste: "INSERT INTO CATEGORIA (IdCategoria, NombreCategoria)\nVALUES (7, 'Tándem')" },
        ] },
      ],
    },

    schema: {
      titre: "Hacer evolucionar un esquema relacional", court: "Esquema", couleur: "#059669",
      intro: "Cada nueva regla de negocio se traduce en un <strong>tipo de vínculo</strong>: decide dónde va la clave foránea o si hace falta una tabla nueva.",
      blocs: [
        { type: "process", titre: "De la regla al esquema", etapes: [
          { label: "Leer la regla", detail: "Localiza los dos objetos vinculados y la cardinalidad: «uno solo» o «varios», en ambos sentidos." },
          { label: "Uno a varios", detail: "Cada A está vinculado a <strong>un solo</strong> B: la clave de B pasa a ser clave foránea en A (el lado «varios»).", code: "ALQUILER (IdAlquiler, …, #IdCliente)" },
          { label: "Varios a varios", detail: "Un A tiene varios B <strong>y</strong> un B varios A: hace falta una tabla de relación.", code: "ALQUILER_ACCESORIO (#IdAlquiler, #IdAccesorio)" },
          { label: "Clave compuesta", detail: "La clave primaria de la tabla de relación combina las claves de las tablas vinculadas; cada una es también clave foránea." },
          { label: "Atributos del vínculo", detail: "La información que depende de ambos a la vez (cantidad, porcentaje) va en la tabla de relación.", code: "ALQUILER_ACCESORIO (#IdAlquiler, #IdAccesorio, Cantidad)" },
        ] },
        { type: "petales", titre: "El vocabulario", centre: "Esquema", petales: [
          { label: "Clave primaria", detail: "Identifica cada fila, subrayada en la notación. Nunca vacía, nunca repetida." },
          { label: "Clave foránea", detail: "Precedida de #, remite a la clave primaria de otra tabla: la flecha del diagrama." },
          { label: "Tabla de relación", detail: "Traduce un vínculo de varios a varios. Clave = claves de las tablas vinculadas." },
          { label: "Tabla de referencia", detail: "Describe un objeto nuevo (tipos, categorías…) con su clave y su nombre." },
          { label: "Lo que ya no encaja", detail: "Si una regla exige varios valores, la columna debe salir de su tabla: una celda contiene un solo valor." },
          { label: "Reflexiva", detail: "Una clave foránea que apunta a su propia tabla (quien recomienda es un cliente)." },
        ] },
      ],
    },

    processus: {
      titre: "Diagramas de eventos y resultados", court: "Proceso", couleur: "#0891b2",
      intro: "Un proceso se lee de arriba abajo: los <strong>eventos</strong> desencadenan <strong>operaciones</strong>, que producen nuevos eventos, en la calle de cada actor.",
      blocs: [
        { type: "process", titre: "La cadena básica", etapes: [
          { label: "Evento", detail: "Algo que ocurre: una solicitud, un documento recibido, un momento («cada mañana»). Se dibuja en una elipse." },
          { label: "Sincronización", detail: "Cuando una operación espera <strong>varios</strong> eventos: un trapecio con una condición (A y (B o C))." },
          { label: "Operación", detail: "Tratamiento que realiza un actor, sin interrupción: un nombre, unas acciones." },
          { label: "Reglas de emisión", detail: "Las salidas de la operación: «Siempre», o «aceptado» / «rechazado»." },
          { label: "Eventos resultantes", detail: "Cada regla produce un evento, que puede desencadenar la operación siguiente." },
        ] },
        { type: "petales", titre: "Reglas del formalismo", centre: "Proceso", petales: [
          { label: "Calles", detail: "Una columna por actor; cada operación se sitúa en la calle de quien la realiza." },
          { label: "Sin flecha directa", detail: "Una operación nunca lleva directamente a otra: siempre hay un evento entre ambas." },
          { label: "Y", detail: "Hacen falta todos los eventos.", code: "A y B" },
          { label: "O", detail: "Basta con uno de ellos.", code: "A o B" },
          { label: "Paréntesis", detail: "Agrupan las condiciones, como en aritmética.", code: "A y (B o C)" },
          { label: "Todas las letras", detail: "Cada flecha que entra en la sincronización lleva una letra, y todas las letras aparecen en la condición." },
        ] },
      ],
    },
  };

  global.SQLRappelsData = { fr, en, es };
})(typeof window !== "undefined" ? window : globalThis);
