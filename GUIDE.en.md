# SQL Lab guide

*[Version française](GUIDE.md)* · [README](README.en.md) · **[Open the app](https://edu-fpar.github.io/sql-lab/?lang=en#demo-en/intro)** ·
[Teacher space](https://edu-fpar.github.io/sql-lab/create.html?lang=en)

SQL Lab is a web app for practising SQL, built for business students (originally the French
accounting diploma DCG, unit UE8). Queries run in the browser: nothing to install, no account,
no data sent anywhere. The interface is in English and French; the built-in exercises come from
French exam papers, and an English demo exercise is included.

This guide can be read in two ways:

- **[by profile](#1-by-profile-what-do-you-want-to-do)**: you are a student, a teacher, an
  institution, a researcher, an EdTech company or a developer, and you want to know what you can do;
- **[by topic](#2-by-topic-how-does-it-work)**: you want to understand a specific feature.

The [README](README.en.md) covers file formats and commands in detail.

---

## 1. By profile: what do you want to do?

| You are… | You want to… |
|---|---|
| [🎓 Student](#-student) | [test myself on SQL](#test-myself-on-sql) · [understand my mistakes](#understand-my-mistakes) · [replay a solution step by step](#replay-a-solution-step-by-step) · [practise schema and process design](#practise-schema-and-process-design) · [pick up where I left off](#pick-up-where-i-left-off) · [do my teacher's questions](#do-the-questions-my-teacher-gave-me) |
| [🧑‍🏫 Teacher, trainer](#-teacher-trainer) | [use it in class as is](#use-it-in-class-as-is) · [project a solution](#project-a-solution-in-class) · [add questions](#add-questions) · [use my own database](#use-my-own-database) · [share with my students](#share-with-my-students) · [grade in Moodle](#grade-in-moodle-or-another-lms) · [adapt a solution](#adapt-a-solution) |
| [🏫 Institution, IT department](#-institution-it-department) | [deploy in the LMS](#deploy-in-the-lms) · [host it in-house](#host-it-in-house) · [check data protection (GDPR)](#check-data-protection-gdpr) |
| [🔬 Academic, researcher](#-academic-researcher) | [cite this software](#cite-this-software) · [use it in a study](#use-it-in-a-study) · [adapt it to my context](#adapt-it-to-my-context) |
| [🏢 EdTech, publisher, training company](#-edtech-publisher-training-company) | [integrate it into my product](#integrate-it-into-my-software-or-platform) · [get a commercial license](#get-a-commercial-license) · [order custom exercises](#order-custom-exercises) |
| [🛠 Developer, contributor](#-developer-contributor) | [run it locally](#run-it-locally) · [add an exercise](#add-an-exercise) · [translate the interface](#translate-the-interface) · [report a problem](#report-a-problem) |

### 🎓 Student

#### Test myself on SQL
1. Open the [app](https://edu-fpar.github.io/sql-lab/?lang=en#demo-en/intro) and choose an
   exercise (the English demo, or one of the French exam papers).
2. Read **question 0 "Introduction"**: company context, tables, how to work.
3. Write your query in the editor (completion suggests tables and columns), then **Run**
   (Ctrl + Enter). The app compares your result with the expected one.

Questions go from easy to hard: one table, calculations, dates, joins, grouping, subqueries,
updates, then schema and process design. See [Queries and automatic checking](#queries-and-automatic-checking).

#### Understand my mistakes
- The message does not just say "wrong": it explains what is off. For example: too many rows
  (missing join or condition), duplicates (DISTINCT), wrong order, `= NULL` instead of
  `IS NULL`, a condition on a calculation put in WHERE instead of HAVING.
- SQLite syntax errors become plain advice, for example "ambiguous column: prefix it with the
  table name".
- **Expected result** shows what you should get, **Hint** nudges you without the answer, and a
  double-click on a table of the diagram shows its content.

#### Replay a solution step by step
In **Solution**, the **🎬 Step-by-step solution** button replays the reasoning:

- first the tables that hold the information;
- then linking tables, aliases, columns to display, joins, filters, grouping and sorting.

The diagram is animated and the query is built piece by piece. You can go step by step or use
autoplay. See [Step-by-step solutions](#step-by-step-solutions).

#### Practise schema and process design
- **Schema questions**: evolve the starting schema (add tables, move attributes, draw foreign
  keys by dragging the ● handle), then **Check the schema**. The **🎬 Step-by-step build** button
  in the solution shows how to reason.
- **Process questions**: draw the event-driven process diagram (events, operations,
  synchronisations). Synchronisations are checked automatically; a self-assessment checklist
  helps you compare the rest with the model answer.

#### Pick up where I left off
Your progress and drafts are kept **in your browser**, on your device. On another computer, or
in private browsing, you start from scratch. In Moodle (SCORM package), the platform keeps your
progress.

#### Do the questions my teacher gave me
Your teacher gives you a **link** (just open it) or a **file** (☰ menu → *Import a file*). The
questions are added at the end of the list (★ group).

### 🧑‍🏫 Teacher, trainer

#### Use it in class as is
There is nothing to install. Give your students the link to the app, or a direct link to a
question: `https://edu-fpar.github.io/sql-lab/?lang=en#demo-en/q11`. The app offers:

- an English demo exercise and 18 French exam-based exercises, with about 450 SQL questions;
- schema and process questions.

It works on computers and phones.

#### Project a solution in class
The **step-by-step solution** is designed to be projected. You move with the keyboard (← →),
discuss each step, and the timeline shows where you are. The full-size diagram (⤢) and
draggable tables help explain joins.

#### Add questions
In the **[teacher space](https://edu-fpar.github.io/sql-lab/create.html?lang=en)**:

1. Choose the database, topics, level and number of questions → **Copy the prompt**.
2. Paste it into your AI (ChatGPT, Claude, Mistral, Gemini…), then paste its reply.
3. Every solution query is **run on the database**: errors, empty results and unchecked sort
   orders are flagged. You edit, and add schema questions (drawn with the same editor as the
   students) or process questions.

See [Extra questions and AI](#extra-questions-and-ai).

#### Use my own database
In the teacher space, choose **"＋ Load my database (.zip, .sqlite, .sql)…"** and provide a `.sqlite` or `.sql` file
(CREATE TABLE + INSERT). The prompt and the checks then work on your database. Share it as a
**complete exercise (.zip)**. See [Custom databases](#custom-databases).

#### Share with my students
Four options, detailed in [Sharing and platforms](#sharing-and-platforms):

- a JSON file;
- a link without a server, where the questions are in the link;
- a link to a hosted file, updated each time it is opened;
- a complete exercise as a zip.

#### Grade in Moodle (or another LMS)
**SCORM package** button in step 4 of the teacher space, then in Moodle *Add an activity →
SCORM package*. The grade is the percentage of questions solved. You can set a pass threshold,
and the platform resumes the student's progress. See [SCORM](#scorm-moodle-chamilo).

#### Adapt a solution
The step-by-step comments are generated automatically. To replace one, add a field to the
question: `"cinema": { "passages": "Your explanation…" }`. A question can also accept several
solutions (`variantes`).

### 🏫 Institution, IT department

#### Deploy in the LMS
- **SCORM 1.2 package**, one per exercise, compatible with Moodle, Chamilo and other SCORM LMSs.
- The package contains the whole app **with no external calls** (no CDN) and is locked on the
  exercise.
- It reports score, status (incomplete, completed, passed) and resume data.
- It records one interaction per solved question.

#### Host it in-house
It is a **static** website, with no application server and no server-side database. Copy the
repository to any web server (Apache, Nginx, IIS, GitHub Pages, intranet). The only point to
watch: serve `.wasm` files with the `application/wasm` MIME type.

#### Check data protection (GDPR)
- No personal data is collected or sent: no account, no analytics, no tracker, no third-party
  font or script.
- Queries run in the browser. Progress stays in the device's local storage, or in the LMS with
  SCORM.
- Questions shared by link sit after the `#` of the address: they are never sent to the server.

### 🔬 Academic, researcher

#### Cite this software
APA style:

> Parlant, F. (2026). *SQL Lab* [Educational software]. https://github.com/edu-fpar/sql-lab

BibTeX:

```bibtex
@software{parlant_sqllab_2026,
  author = {Parlant, François},
  title  = {SQL Lab: SQL practice with automatic checking and step-by-step solutions},
  year   = {2026},
  url    = {https://github.com/edu-fpar/sql-lab},
  note   = {Educational software, CC BY-NC-SA 4.0 license}
}
```

GitHub's **Cite this repository** button also gives these references, from
[CITATION.cff](CITATION.cff).

#### Use it in a study
- The tool collects nothing by default: to gather data, go through an LMS. With SCORM, the
  platform receives the score and one interaction per solved question, including the
  student's query.
- Error diagnoses are coded in `assets/compare.js` and `assets/compat.js`. They are categories
  of typical mistakes (missing join, duplicates, NULL, HAVING…), useful for analysis.
- Exercises are versioned JSON files, so a study can pin an exact version (commit) and cite it.

For a research project or a collaboration, [get in touch](https://edu-fpar.github.io/about.html?lang=en).

#### Adapt it to my context
The license (CC BY-NC-SA 4.0) allows you to modify the tool for non-commercial use, with credit
to the author and sharing your adaptations under the same license. You can add your databases,
questions and language (see [Languages](#languages)).

### 🏢 EdTech, publisher, training company

#### Integrate it into my software or platform
Technically, integration is simple:

- static HTML and JavaScript app, with no server dependency;
- SQLite engine in WebAssembly (sql.js);
- open JSON formats (`sql-lab-questions/1`, `sql-lab-exercice/1`);
- integration through an iframe, a deep link (`#exercise/question`) or a SCORM package.

**Commercial use** is not covered by the public license (NC): integration into a paid product,
resale, or paid training sold as a product. It requires a commercial license.

#### Get a commercial license
A commercial license is available by agreement, including **white label** (your name, your
colours). [Get in touch](https://edu-fpar.github.io/about.html?lang=en).

The bundled libraries (sql.js, CodeMirror, fflate) are MIT-licensed: their license notices are
in `lib/`.

#### Order custom exercises
Databases and questions tailored to your learners (accounting, HR, logistics, retail…), in your
language, with schema and process questions, and SCORM packages ready for your LMS.
[Get in touch](https://edu-fpar.github.io/about.html?lang=en).

### 🛠 Developer, contributor

#### Run it locally
```
python -m http.server 8765
```
then open http://localhost:8765/?lang=en. A web server is needed, because opening the file
directly does not work. Tests: `npm install`, then `node tools/test_exercice.js`.

#### Add an exercise
`exercices/<id>/db.sql`, `db.sqlite` and `questions.json`, then an entry in
`exercices/catalogue.json` (`"langue": "en"` for an English exercise). The simplest model to
follow is `exercices/demo-en/`. Details are in the [README](README.en.md#adding-an-exercise).

#### Translate the interface
Each module registers its translations with `I18N.add({ "French text": "translation" })`, in
`assets/i18n.js`. A new language needs its code and one dictionary per module.

#### Report a problem
Open a [GitHub issue](https://github.com/edu-fpar/sql-lab/issues) with the exercise, the
question, your query and the message shown.

---

## 2. By topic: how does it work?

### Queries and automatic checking
- **Values are compared**, with tolerances:
  - column names (aliases) and column order are free;
  - extra columns are accepted;
  - case is ignored and numbers are rounded to 2 decimals.
- **Row order**: checked only when the question asks for sorting.
- **Both join styles** are accepted: in `WHERE`, or with `INNER JOIN … ON`.
- **Simulated update queries** (INSERT, UPDATE, DELETE): each run starts from a fresh copy of the
  database. The app shows the rows added, changed or deleted.
- **Exam-style dates** on SQLite: `YEAR()`, `MONTH()`, `DATEDIFF()`, `NOW()` (simulated "today"),
  `'2025-03-15'`, `'15/06/2024'`, `#15/06/2024#`.

### Relational schema
- The diagram follows the French notation: primary key underlined, foreign key in italics with
  #, arrow to the primary key.
- Tables can be dragged with the mouse or a finger. Zoom, full-size view and a text notation tab
  are available.
- **Schema questions**: the student evolves a starting schema. The check compares the
  *structure*: tables, keys, references, attributes to remove. Equivalent names are accepted,
  and a table is recognised by its primary key.

### Process diagrams
These are event-driven process diagrams in swimlanes: events, operations with output rules,
synchronisations.

- The **grammar** of the formalism and the **expected synchronisations** are checked
  automatically. An equivalent condition is accepted: "(C or B) and A" = "A and (B or C)".
- The rest is compared with the model answer through a self-assessment checklist.
- The diagram can be exported as PNG or SVG.

### Step-by-step solutions
The steps are generated automatically from the solution: the teacher has nothing to write.

- **SQL**: obvious tables, linking tables, aliases, columns, joins, filters, grouping, sorting,
  result. Update queries follow their own sequence (table, values, targeted rows).
- **Schema**: business rules, what no longer fits, new tables, foreign keys (one-to-many),
  junction tables (many-to-many), final schema.
- **Display**: a timeline of steps, an animated diagram, the query or schema built
  progressively, autoplay.

### Extra questions and AI
- **Ready-to-copy prompt**, which contains:
  - the format guide ([skill](skill/sql-lab-questions/SKILL.md), in French);
  - an automatic description of the database (tables, keys, value ranges and lists).
- **Each question is checked**:
  - the solution runs;
  - the result is not empty;
  - the requested sort is checked;
  - alternative solutions give the same result;
  - update queries have an effect.
- **Schema questions**: they are drawn in the editor, and the marking grid is derived from the
  drawing.

### Custom databases
- **Accepted formats**:
  - a `.sqlite`, `.db` or `.sql` file on its own (exercise without questions);
  - or a zip containing `exercice.json` with `db.sqlite` or `db.sql`.
- **Import checks**:
  - the file must be valid, with at least one table;
  - the size is watched;
  - dates in the wrong format are flagged (YYYY-MM-DD is required);
  - missing foreign keys are flagged, since the diagram would have no arrows.
- **Where the exercise goes**: it stays in the student's browser (IndexedDB) and can be removed.

### Sharing and platforms
| Option | What for | Note |
|---|---|---|
| JSON file | a few questions on an existing database | "Import a file" on the student side |
| Link without a server | quick sharing (messaging, VLE) | questions compressed after the `#` |
| Link to a hosted file | update without sending a new link | the site must allow CORS |
| Complete exercise (.zip) | your own database | file or `?exercice=` link |
| SCORM package | grades and tracking in the LMS | one package per exercise |

### SCORM (Moodle, Chamilo…)
- **Grade and status**: score as the percentage of questions solved; status *incomplete*, then
  *completed*, or *passed* above a threshold.
- **Resume**: handled by the platform.
- **Building a package**: in the teacher space, with nothing to install, or with
  `node tools/build_scorm.js`.
- **Testing without a platform**: `tools/scorm-test.html` simulates an LMS.

### Languages
- The interface exists in French and English: FR/EN button, or `?lang=en` in the address.
- Exercises keep their own language. The DCG exam papers are in French, and an English demo
  exercise is provided (`demo-en`).
- With the English interface, the AI prompt asks for questions in English.

### Privacy and security
- **No data collection**: nothing is sent, everything happens in the browser.
- **Imported questions and solutions**: they only run in the in-memory database, and texts are
  displayed as text. A malicious file cannot damage anything.

### License, citation, commercial use
- **License**: [CC BY-NC-SA 4.0](LICENSE).
  - Using it in class and in training is free, with credit to the author.
  - Adaptations must be shared under the same license.
  - Commercial use is by agreement.
- **Citation**: see [Cite this software](#cite-this-software).
- **Commercial license, white label, custom exercises**: see
  [the About page](https://edu-fpar.github.io/about.html?lang=en).

### Technical overview
- **Components**: HTML and JavaScript with no build step, sql.js 1.10 (SQLite in WebAssembly),
  CodeMirror 5, fflate. The libraries are bundled in `lib/`.
- **JSON formats**: questions (`sql-lab-questions/1`) and exercises (`sql-lab-exercice/1`),
  described in the [README](README.en.md) and the [skill](skill/sql-lab-questions/SKILL.md).
- **Tests**: `tools/test_exercice.js` (solutions, alternatives, traps, schemas, processes) and
  `tools/test_pack.js`.
- **Screenshots**: `tools/captures.js`.
