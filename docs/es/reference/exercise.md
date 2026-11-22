# Añadir un ejercicio

1. Crea `exercices/<id>/db.sql` (CREATE TABLE con `REFERENCES` + INSERT) y genera a partir de él
   `db.sqlite` (con cualquier herramienta SQLite, o con sql.js en Node).
2. Escribe `exercices/<id>/questions.json`: título (`titre`), contexto (`contexte`), «hoy»
   simulado (`aujourdhui`, `AAAA-MM-DD`), disposición opcional del diagrama (`schemaGrid`:
   `{"TABLA": [columna, fila]}`) y las preguntas (consulta [Formatos de archivo](es/reference/formats)).
3. Añade el ejercicio a `exercices/catalogue.json`:
   `{"id": "<id>", "titre": "…", "description": "…", "langue": "es"}`.
4. Comprueba: `npm install` (una vez) y después `node tools/test_exercice.js <id>`. El script
   ejecuta cada solución y cada alternativa, comprueba `ordered`, las soluciones de esquema
   (reconocidas, esquema de partida rechazado) y las de procesos (gramática, sincronizaciones
   esperadas, trampa «todo con Y»).

Toma [`exercices/demo-es/`](https://github.com/edu-fpar/sql-lab/tree/main/exercices/demo-es) como
modelo.

Los profesores que no tocan el repositorio pueden, en su lugar, cargar su base de datos en el
[espacio del profesor](https://edu-fpar.github.io/sql-lab/create.html?lang=es) y compartir un
ejercicio completo en zip.
