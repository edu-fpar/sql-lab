# Estructura y herramientas

## Estructura

```
index.html                  aplicación del estudiante
create.html                 espacio del profesor (prompt para la IA, comprobaciones, compartir)
docs/                       esta documentación (docsify, francés, inglés y español)
skill/sql-lab-questions/    guía del formato de preguntas, para las IA (francés)
exemples/                   ejemplo de paquete de preguntas y de ejercicio propio
lib/                        bibliotecas incluidas (sql.js, CodeMirror, fflate, docsify): sin CDN
assets/
  i18n.js                   traducción de la interfaz (claves en francés, diccionarios por módulo)
  compat.js                 reescritura de consultas (fechas…) y funciones añadidas a SQLite
  compare.js                comparación resultado del estudiante / resultado esperado
  engine.js                 ejecución (copia nueva de la base de datos para cada consulta)
  cinema.js                 soluciones paso a paso (SQL y esquema)
  diagram.js                esquema relacional gráfico
  schemacheck.js, schema-editor.js     preguntas de esquema
  processcheck.js, process-editor.js   preguntas de procesos
  packs.js, library.js      paquetes de preguntas, ejercicios importados (zip, IndexedDB)
  scorm.js, scormbuild.js   runtime SCORM 1.2 y creador de paquetes
  create.js, create.css     espacio del profesor
  app.js, style.css         interfaz
exercices/                  catalogue.json, demo-en/, demo-es/, dcg2008 … dcg2026/
tools/                      pruebas, creación SCORM, capturas, vendoring
```

## Ejecutar en local

La página debe servirla un servidor web (abrir el archivo directamente no funciona):

```
python -m http.server 8765
```

y luego abre http://localhost:8765/?lang=es (documentación: http://localhost:8765/docs/#/es/).

## Pruebas

```
npm install
node tools/test_exercice.js            # todos los ejercicios (o: node tools/test_exercice.js demo-es)
node tools/test_pack.js exemples/pack-exemple-dcg2024.json
```

## Bibliotecas

`npm run vendor` copia las bibliotecas con versión fijada de `node_modules` a `lib/` (sql.js,
CodeMirror, fflate, docsify). El tema de docsify se copia sin su importación de Google Fonts, de
modo que la documentación tampoco hace llamadas externas.

## Capturas de pantalla

`node tools/captures.js en` (o `fr`) regenera `docs/img/en/` con Edge o Chrome sin interfaz, a
partir del servidor local (perfil temporal, no se escribe nada en tu navegador). La
documentación en español usa las capturas en inglés.

## Publicar en GitHub Pages

Sube el repositorio y luego *Settings → Pages → Deploy from a branch* (raíz). La aplicación está
en `/sql-lab/`, la documentación en `/sql-lab/docs/`.
