# Desarrollador, colaborador

## Ejecutarlo en local
```
python -m http.server 8765
```
y luego abre http://localhost:8765/?lang=es. Hace falta un servidor web, porque abrir el
archivo directamente no funciona. Pruebas: `npm install` y después `node tools/test_exercice.js`.

## Añadir un ejercicio
`exercices/<id>/db.sql`, `db.sqlite` y `questions.json`, y luego una entrada en
`exercices/catalogue.json` (`"langue": "es"` para un ejercicio en español). El modelo más
sencillo de seguir es `exercices/demo-es/`. Los detalles están en el [README](es/reference/exercise).

## Traducir la interfaz
Cada módulo registra sus traducciones con `I18N.add({ "texto en francés": "traducción" })`, en
`assets/i18n.js`. Un idioma nuevo necesita su código y un diccionario por módulo.

## Informar de un problema
Abre una [incidencia en GitHub](https://github.com/edu-fpar/sql-lab/issues) con el ejercicio, la
pregunta, tu consulta y el mensaje mostrado.
