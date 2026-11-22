# Guide de SQL Lab

*[English version](GUIDE.en.md)* · [README](README.md) · **[Ouvrir l'application](https://edu-fpar.github.io/sql-lab/)** ·
[Espace enseignant](https://edu-fpar.github.io/sql-lab/create.html)

SQL Lab est une application web d'entraînement au SQL pour les étudiants en gestion (DCG UE8,
BTS, licence). Les requêtes s'exécutent dans le navigateur : rien à installer, pas de compte,
aucune donnée envoyée.

Ce guide se lit de deux façons :

- **[par profil](#1-par-profil--que-voulez-vous-faire-)** : vous êtes étudiant, enseignant,
  établissement, chercheur, éditeur ou développeur, et vous cherchez ce que vous pouvez faire ;
- **[par thème](#2-par-thème--comment-ça-marche-)** : vous voulez comprendre une fonction
  précise.

Le [README](README.md) détaille les formats de fichiers et les commandes.

---

## 1. Par profil : que voulez-vous faire ?

| Vous êtes… | Vous voulez… |
|---|---|
| [🎓 Étudiant](#-étudiant) | [me tester sur le SQL](#me-tester-sur-le-sql) · [comprendre mes erreurs](#comprendre-mes-erreurs) · [revoir une correction pas à pas](#revoir-une-correction-pas-à-pas) · [m'entraîner au schéma et aux processus](#mentraîner-au-schéma-relationnel-et-aux-processus) · [reprendre où j'en étais](#reprendre-où-jen-étais) · [faire les questions de mon professeur](#faire-les-questions-données-par-mon-professeur) |
| [🧑‍🏫 Enseignant, formateur](#-enseignant-formateur) | [l'utiliser en cours tel quel](#lutiliser-en-cours-tel-quel) · [projeter une correction](#projeter-une-correction-en-classe) · [ajouter des questions](#ajouter-des-questions) · [utiliser ma propre base](#utiliser-ma-propre-base-de-données) · [partager avec mes étudiants](#partager-avec-mes-étudiants) · [noter dans Moodle](#noter-dans-moodle-ou-un-autre-lms) · [adapter une correction](#adapter-une-correction) |
| [🏫 Établissement, service numérique](#-établissement-service-numérique) | [déployer dans le LMS](#déployer-dans-le-lms) · [héberger en interne](#héberger-en-interne) · [vérifier la conformité (RGPD)](#vérifier-la-conformité-rgpd) |
| [🔬 Universitaire, chercheur](#-universitaire-chercheur) | [citer ce logiciel](#citer-ce-logiciel) · [l'utiliser dans une expérimentation](#lutiliser-dans-une-expérimentation) · [l'adapter à mon terrain](#ladapter-à-mon-terrain) |
| [🏢 EdTech, éditeur, organisme de formation](#-edtech-éditeur-organisme-de-formation) | [l'intégrer dans mon logiciel](#lintégrer-dans-mon-logiciel-ou-ma-plateforme) · [obtenir une licence commerciale](#obtenir-une-licence-commerciale) · [commander des exercices sur mesure](#commander-des-exercices-sur-mesure) |
| [🛠 Développeur, contributeur](#-développeur-contributeur) | [le lancer en local](#le-lancer-en-local) · [ajouter un exercice](#ajouter-un-exercice) · [traduire l'interface](#traduire-linterface) · [signaler un problème](#signaler-un-problème) |

### 🎓 Étudiant

#### Me tester sur le SQL
1. Ouvrez l'[application](https://edu-fpar.github.io/sql-lab/) et choisissez un exercice
   (une annale du DCG, de 2008 à 2026).
2. Lisez la **question 0 « Présentation »** : contexte de l'entreprise, tables, méthode.
3. Écrivez votre requête dans l'éditeur (la complétion propose les tables et les colonnes),
   puis **Exécuter** (Ctrl + Entrée). L'application compare votre résultat au résultat attendu.

Les questions vont du plus simple au plus difficile : une table, calculs, dates, jointures,
regroupements, sous-requêtes, mises à jour, puis schéma et processus.
Voir [Requêtes et correction automatique](#requêtes-et-correction-automatique).

#### Comprendre mes erreurs
- Le message ne dit pas seulement « faux » : il explique ce qui cloche. Par exemple : trop de
  lignes (jointure ou condition oubliée), des doublons (DISTINCT), un mauvais tri, `= NULL` au
  lieu de `IS NULL`, une condition sur un calcul placée dans WHERE au lieu de HAVING.
- Les erreurs de syntaxe de SQLite sont traduites en conseils, par exemple « colonne
  ambiguë : préfixez-la avec le nom de la table ».
- **Résultat attendu** affiche ce qu'il fallait obtenir, **Indice** donne un coup de pouce sans
  la réponse, et un double-clic sur une table du diagramme montre son contenu.

#### Revoir une correction pas à pas
Dans **Correction**, le bouton **🎬 Correction pas à pas** rejoue le raisonnement :

- d'abord les tables qui contiennent l'information ;
- puis les tables de passage, les alias, les colonnes à afficher, les jointures, les filtres,
  le regroupement et le tri.

Le schéma s'anime et la requête se construit morceau par morceau. Vous pouvez avancer étape
par étape ou lancer la lecture automatique. Voir [Correction pas à pas](#correction-pas-à-pas).

#### M'entraîner au schéma relationnel et aux processus
- **Questions de schéma** : faites évoluer le schéma de départ (ajoutez des tables, déplacez des
  attributs, tracez les clés étrangères en tirant le rond ●), puis **Vérifier le schéma**.
  Le bouton **🎬 Construction pas à pas** de la correction montre comment raisonner.
- **Questions de processus** : dessinez le schéma événements-résultats (événements, opérations,
  synchronisations). Les synchronisations sont vérifiées automatiquement ; une liste
  d'auto-évaluation vous aide à comparer le reste avec le corrigé.

#### Reprendre où j'en étais
La progression et vos brouillons sont gardés **dans votre navigateur**, sur votre appareil.
Sur un autre ordinateur, ou en navigation privée, vous repartez de zéro. Dans Moodle (paquet
SCORM), c'est la plateforme qui garde votre progression.

#### Faire les questions données par mon professeur
Votre professeur vous donne un **lien** (ouvrez-le simplement) ou un **fichier** (menu ☰ →
*Importer un fichier*). Ses questions s'ajoutent à la fin de la liste (groupe ★).

### 🧑‍🏫 Enseignant, formateur

#### L'utiliser en cours tel quel
Il n'y a rien à installer. Donnez à vos étudiants le lien de l'application, ou un lien direct
vers une question : `https://edu-fpar.github.io/sql-lab/#dcg2024/q14`. L'application propose :

- 18 exercices tirés des annales du DCG, avec environ 450 questions SQL ;
- au moins une question de schéma par exercice, et des questions de processus.

L'application marche sur ordinateur et sur téléphone.

#### Projeter une correction en classe
La **correction pas à pas** est faite pour être projetée. On avance au clavier (← →), on
discute de chaque étape, et la frise montre où l'on en est. Le diagramme agrandi (bouton ⤢)
et le déplacement des tables aident à expliquer les jointures.

#### Ajouter des questions
Dans l'**[espace enseignant](https://edu-fpar.github.io/sql-lab/create.html)** :

1. Choisissez la base, les thèmes, le niveau et le nombre de questions → **Copier le prompt**.
2. Collez-le dans votre IA (ChatGPT, Claude, Mistral, Gemini…), puis collez sa réponse.
3. Chaque correction est **exécutée sur la base** : les erreurs, les résultats vides et les tris
   non vérifiés sont signalés. Vous retouchez, vous ajoutez des questions de schéma (dessinées
   avec le même éditeur que les étudiants) ou de processus.

Voir [Questions complémentaires et IA](#questions-complémentaires-et-ia).

#### Utiliser ma propre base de données
Dans l'espace enseignant, choisissez **« ＋ Charger ma base (.zip, .sqlite, .sql)… »** et donnez un fichier `.sqlite`
ou `.sql` (CREATE TABLE + INSERT). Le prompt et la vérification fonctionnent alors sur votre
base. Partagez ensuite un **exercice complet (.zip)**. Voir [Bases personnelles](#bases-personnelles).

#### Partager avec mes étudiants
Quatre possibilités, détaillées dans [Partage et plateformes](#partage-et-plateformes) :

- un fichier JSON ;
- un lien sans serveur, où les questions sont dans le lien ;
- un lien vers un fichier hébergé, mis à jour à chaque ouverture ;
- un exercice complet en zip.

#### Noter dans Moodle (ou un autre LMS)
Bouton **Paquet SCORM** à l'étape 4 de l'espace enseignant, puis dans Moodle *Ajouter une
activité → Paquetage SCORM*. La note correspond au pourcentage de questions réussies. Vous
pouvez fixer un seuil de réussite, et la plateforme reprend la progression de l'étudiant.
Voir [SCORM](#scorm-moodle-chamilo).

#### Adapter une correction
Les commentaires de la correction pas à pas sont générés automatiquement. Pour en remplacer un,
ajoutez à la question un champ `"cinema": { "passages": "Votre explication…" }`. Une question
peut aussi avoir plusieurs corrections acceptées (`variantes`).

### 🏫 Établissement, service numérique

#### Déployer dans le LMS
- **Paquet SCORM 1.2**, un par exercice, compatible avec Moodle, Chamilo et les autres LMS
  SCORM.
- Le paquet contient toute l'application **sans appel extérieur** (pas de CDN) et il est
  verrouillé sur l'exercice.
- Il transmet le score, le statut (incomplet, terminé, réussi) et la reprise.
- Il enregistre une interaction par question réussie.

#### Héberger en interne
C'est un site **statique**, sans serveur d'application ni base de données côté serveur. Copiez
le dépôt sur n'importe quel serveur web (Apache, Nginx, IIS, GitHub Pages, intranet). Le seul
point d'attention : servir les fichiers `.wasm` avec le type MIME `application/wasm`.

#### Vérifier la conformité (RGPD)
- Aucune donnée personnelle n'est collectée ni envoyée : pas de compte, pas de statistiques,
  pas de traceur, pas de police ni de script tiers.
- Les requêtes s'exécutent dans le navigateur. La progression reste dans le stockage local de
  l'appareil, ou dans le LMS en SCORM.
- Les questions partagées par lien sont placées après le `#` de l'adresse : elles ne sont
  jamais transmises au serveur.

### 🔬 Universitaire, chercheur

#### Citer ce logiciel
Format APA :

> Parlant, F. (2026). *SQL Lab* [Logiciel pédagogique]. https://github.com/edu-fpar/sql-lab

BibTeX :

```bibtex
@software{parlant_sqllab_2026,
  author = {Parlant, François},
  title  = {SQL Lab : entraînement SQL avec correction automatique et correction pas à pas},
  year   = {2026},
  url    = {https://github.com/edu-fpar/sql-lab},
  note   = {Logiciel pédagogique, licence CC BY-NC-SA 4.0}
}
```

Le bouton **Cite this repository** de GitHub donne aussi ces références, à partir de
[CITATION.cff](CITATION.cff).

#### L'utiliser dans une expérimentation
- L'outil ne collecte rien par défaut : pour recueillir des données, passez par un LMS. En
  SCORM, la plateforme reçoit le score et une interaction par question réussie, avec la
  requête de l'étudiant.
- Les diagnostics d'erreur sont codés dans `assets/compare.js` et `assets/compat.js`. Ce sont
  des catégories d'erreurs typiques (jointure oubliée, doublons, NULL, HAVING…), utiles pour
  une analyse.
- Les exercices sont des fichiers JSON versionnés. Une expérimentation peut donc figer une
  version précise (commit) et la citer.

Pour un projet de recherche ou une collaboration, [contactez-moi](https://edu-fpar.github.io/about.html).

#### L'adapter à mon terrain
La licence (CC BY-NC-SA 4.0) permet de modifier l'outil pour un usage non commercial, en citant
l'auteur et en partageant vos adaptations sous la même licence. Vous pouvez ajouter vos bases,
vos questions et votre langue (voir [Langues](#langues)).

### 🏢 EdTech, éditeur, organisme de formation

#### L'intégrer dans mon logiciel ou ma plateforme
Sur le plan technique, l'intégration est simple :

- application statique en HTML et JavaScript, sans dépendance serveur ;
- moteur SQLite en WebAssembly (sql.js) ;
- formats ouverts en JSON (`sql-lab-questions/1`, `sql-lab-exercice/1`) ;
- intégration par iframe, par lien profond (`#exercice/question`) ou par paquet SCORM.

L'**usage commercial** n'est pas couvert par la licence publique (NC) : intégration dans un
produit payant, revente, formation facturée en tant que produit. Il demande une licence
commerciale.

#### Obtenir une licence commerciale
Une licence commerciale est possible sur accord, y compris en **marque blanche** (votre nom,
vos couleurs). [Prenons contact](https://edu-fpar.github.io/about.html).

Les bibliothèques embarquées (sql.js, CodeMirror, fflate) sont sous licence MIT : leurs avis de
licence sont dans `lib/`.

#### Commander des exercices sur mesure
Bases et questions adaptées à votre public (comptabilité, RH, logistique, commerce…), dans votre
langue, avec questions de schéma et de processus, et paquets SCORM prêts à déposer dans votre
LMS. [Me contacter](https://edu-fpar.github.io/about.html).

### 🛠 Développeur, contributeur

#### Le lancer en local
```
python -m http.server 8765
```
puis ouvrez http://localhost:8765. Un serveur web est nécessaire, car l'ouverture directe du
fichier ne fonctionne pas. Tests : `npm install`, puis `node tools/test_exercice.js`.

#### Ajouter un exercice
`exercices/<id>/db.sql`, `db.sqlite` et `questions.json`, puis une entrée dans
`exercices/catalogue.json`. Le modèle le plus simple à suivre est `exercices/demo-en/`. Le
détail est dans le [README](README.md#ajouter-un-exercice).

#### Traduire l'interface
Chaque module enregistre ses traductions avec `I18N.add({ "texte français": "traduction" })`,
dans `assets/i18n.js`. Une nouvelle langue demande d'ajouter son code et un dictionnaire par
module.

#### Signaler un problème
Ouvrez une [issue GitHub](https://github.com/edu-fpar/sql-lab/issues) en précisant l'exercice,
la question, la requête et le message affiché.

---

## 2. Par thème : comment ça marche ?

### Requêtes et correction automatique
- **Comparaison des valeurs**, avec des tolérances :
  - le nom des colonnes (alias) et leur ordre sont libres ;
  - les colonnes en trop sont acceptées ;
  - la casse est ignorée et les nombres sont arrondis à 2 décimales.
- **Ordre des lignes** : vérifié seulement quand l'énoncé demande un tri.
- **Deux écritures des jointures** acceptées : dans le `WHERE`, ou avec `INNER JOIN … ON`.
- **Requêtes de mise à jour fictives** (INSERT, UPDATE, DELETE) : chaque exécution repart d'une
  copie neuve de la base. L'application montre les lignes ajoutées, modifiées ou supprimées.
- **Dates « comme au DCG »** sur SQLite : `YEAR()`, `MONTH()`, `DATEDIFF()`, `NOW()` (date du
  jour simulée), `'15/06/2024'`, `#15/06/2024#`.

### Schéma relationnel
- Le diagramme suit la notation française : clé primaire soulignée, clé étrangère en italique
  avec #, flèche vers la clé primaire.
- Les tables se déplacent à la souris ou au doigt. Le zoom, la vue en grand et l'onglet de
  notation textuelle sont disponibles.
- **Questions de schéma** : l'étudiant fait évoluer un schéma de départ. La vérification compare
  la *structure* : tables, clés, références, attributs à retirer. Les noms équivalents sont
  acceptés, et une table est reconnue à sa clé primaire.

### Processus
Il s'agit des schémas événements-résultats en couloirs : événements, opérations avec règles
d'émission, synchronisations.

- La **grammaire** du formalisme et les **synchronisations attendues** sont vérifiées
  automatiquement. Une condition équivalente est acceptée : « (C ou B) et A » = « A et (B ou C) ».
- Le reste se compare au corrigé avec une liste d'auto-évaluation.
- Le schéma s'exporte en PNG ou en SVG.

### Correction pas à pas
Les étapes sont générées automatiquement à partir de la correction : l'enseignant n'a rien à
écrire.

- **SQL** : tables évidentes, tables de passage, alias, colonnes, jointures, filtres,
  regroupement, tri, résultat. Les requêtes de mise à jour suivent leur propre déroulé (table,
  valeurs, lignes visées).
- **Schéma** : règles de gestion, ce qui ne tient plus, nouvelles tables, clés étrangères
  (un à plusieurs), tables de liaison (plusieurs à plusieurs), schéma final.
- **Affichage** : une frise des étapes, un diagramme animé, la requête ou le schéma construit
  progressivement, la lecture automatique.

### Questions complémentaires et IA
- **Prompt prêt à copier**, qui contient :
  - le mode d'emploi du format ([skill](skill/sql-lab-questions/SKILL.md)) ;
  - une description de la base générée automatiquement (tables, clés, plages et listes de
    valeurs).
- **Vérification de chaque question** :
  - la correction s'exécute ;
  - le résultat n'est pas vide ;
  - le tri demandé est vérifié ;
  - les variantes donnent le même résultat ;
  - les mises à jour ont un effet.
- **Questions de schéma** : elles se dessinent dans l'éditeur, et la grille de correction en est
  déduite.

### Bases personnelles
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

### Partage et plateformes
| Moyen | Pour quoi | Remarque |
|---|---|---|
| Fichier JSON | quelques questions sur une base existante | « Importer un fichier » côté étudiant |
| Lien sans serveur | partage rapide (messagerie, ENT) | questions compressées après le `#` |
| Lien vers un fichier hébergé | mettre à jour sans renvoyer de lien | le site doit autoriser CORS |
| Exercice complet (.zip) | votre propre base | fichier ou lien `?exercice=` |
| Paquet SCORM | notes et suivi dans le LMS | un paquet par exercice |

### SCORM (Moodle, Chamilo…)
- **Note et statut** : score en pourcentage de questions réussies ; statut *incomplete*, puis
  *completed*, ou *passed* au-delà d'un seuil.
- **Reprise** : elle se fait par la plateforme.
- **Construction** : dans l'espace enseignant, sans rien installer, ou avec
  `node tools/build_scorm.js`.
- **Test sans plateforme** : `tools/scorm-test.html` simule un LMS.

### Langues
- L'interface existe en français et en anglais : bouton FR/EN, ou `?lang=en` dans l'adresse.
- Les exercices gardent leur langue. Les annales du DCG sont en français, et un exercice de
  démonstration en anglais est fourni (`demo-en`).
- En interface anglaise, le prompt pour l'IA demande des questions en anglais.

### Données personnelles et sécurité
- **Aucune collecte** : rien n'est transmis, et tout se passe dans le navigateur.
- **Questions et corrections importées** : elles s'exécutent uniquement dans la base en mémoire,
  et les textes sont affichés comme du texte. Un fichier malveillant ne peut rien abîmer.

### Licence, citation, usage commercial
- **Licence** : [CC BY-NC-SA 4.0](LICENSE).
  - L'usage en classe et en formation est libre, en citant l'auteur.
  - Les adaptations doivent être partagées sous la même licence.
  - L'usage commercial se fait sur accord.
- **Citation** : voir [Citer ce logiciel](#citer-ce-logiciel).
- **Licence commerciale, marque blanche, exercices sur mesure** : voir
  [la page À propos](https://edu-fpar.github.io/about.html).

### Technique
- **Composants** : HTML et JavaScript sans compilation, sql.js 1.10 (SQLite en WebAssembly),
  CodeMirror 5, fflate. Les bibliothèques sont embarquées dans `lib/`.
- **Formats JSON** : questions (`sql-lab-questions/1`) et exercices (`sql-lab-exercice/1`),
  décrits dans le [README](README.md) et la [skill](skill/sql-lab-questions/SKILL.md).
- **Tests** : `tools/test_exercice.js` (corrections, variantes, pièges, schémas, processus) et
  `tools/test_pack.js`.
- **Captures d'écran** : `tools/captures.js`.
