# 🎓 Student

## Test myself on SQL
1. Open the [app](https://edu-fpar.github.io/sql-lab/?lang=en#demo-en/intro) and choose an
   exercise (the English demo, or one of the French exam papers).
2. Read **question 0 "Introduction"**: company context, tables, how to work.
3. Write your query in the editor (completion suggests tables and columns), then **Run**
   (Ctrl + Enter). The app compares your result with the expected one.

Questions go from easy to hard: one table, calculations, dates, joins, grouping, subqueries,
updates, then schema and process design. See [Queries and automatic checking](en/topics/queries).

## Understand my mistakes
- The message does not just say "wrong": it explains what is off. For example: too many rows
  (missing join or condition), duplicates (DISTINCT), wrong order, `= NULL` instead of
  `IS NULL`, a condition on a calculation put in WHERE instead of HAVING.
- SQLite syntax errors become plain advice, for example "ambiguous column: prefix it with the
  table name".
- **Expected result** shows what you should get, **Hint** nudges you without the answer, and a
  double-click on a table of the diagram shows its content.

## Replay a solution step by step
In **Solution**, the **🎬 Step-by-step solution** button replays the reasoning:

- first the tables that hold the information;
- then linking tables, aliases, columns to display, joins, filters, grouping and sorting.

The diagram is animated and the query is built piece by piece. You can go step by step or use
autoplay. See [Step-by-step solutions](en/topics/step-by-step).

## Practise schema and process design
- **Schema questions**: evolve the starting schema (add tables, move attributes, draw foreign
  keys by dragging the ● handle), then **Check the schema**. The **🎬 Step-by-step build** button
  in the solution shows how to reason.
- **Process questions**: draw the event-driven process diagram (events, operations,
  synchronisations). Synchronisations are checked automatically; a self-assessment checklist
  helps you compare the rest with the model answer.

## Pick up where I left off
Your progress and drafts are kept **in your browser**, on your device. On another computer, or
in private browsing, you start from scratch. In Moodle (SCORM package), the platform keeps your
progress.

## Do the questions my teacher gave me
Your teacher gives you a **link** (just open it) or a **file** (☰ menu → *Import a file*). The
questions are added at the end of the list (★ group).

![The question screen](../../img/en/question.png)
