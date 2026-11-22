# SCORM 1.2 package

One package per exercise: the complete app **without any CDN** (libraries in `lib/`), locked on
the exercise (no exercise choice, no import).

- **Score**: % of questions solved (`cmi.core.score.raw`).
- **Status**: `incomplete`, then `completed` when everything is solved; with a threshold,
  `passed` as soon as the score reaches it (also declared as `masteryscore` in the manifest).
- **Resume**: solved questions and current question kept by the platform
  (`cmi.suspend_data`, `cmi.core.lesson_location`). Query drafts stay in the browser
  (SCORM 1.2 limit).
- **Detail**: one interaction per solved question (id + the student's query).
- **Language**: the package keeps the interface language it was built with (`SQLLAB_CONFIG.lang`).

Building:

```
npm install
node tools/build_scorm.js demo-en                # → dist/sqllab-demo-en-scorm12.zip
node tools/build_scorm.js dcg2024 my-pack.json --seuil 80
node tools/build_scorm.js exemples/exercice-perso-mediatheque.zip
node tools/build_scorm.js --tous                 # one package per catalogue exercise
```

or, with nothing to install, the **SCORM package** button in step 4 of the teacher space.

In Moodle: *Add an activity → SCORM package*, upload the zip; set grading to "Highest grade" or
"Last attempt".

**Test without a platform**: `tools/scorm-test.html` simulates a SCORM 1.2 platform (`API`
object, data kept between sessions, call log). Unzip the package in `dist/test/<id>/`, then open
`http://localhost:8765/tools/scorm-test.html?paquet=../dist/test/<id>/index.html`.
