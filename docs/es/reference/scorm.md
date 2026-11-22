# Paquete SCORM 1.2

Un paquete por ejercicio: la aplicación completa **sin ningún CDN** (bibliotecas en `lib/`),
bloqueada en el ejercicio (sin elección de ejercicio, sin importación).

- **Puntuación**: % de preguntas resueltas (`cmi.core.score.raw`).
- **Estado**: `incomplete` y después `completed` cuando todo está resuelto; con un umbral,
  `passed` en cuanto la puntuación lo alcanza (declarado también como `masteryscore` en el
  manifiesto).
- **Reanudación**: la plataforma guarda las preguntas resueltas y la pregunta actual
  (`cmi.suspend_data`, `cmi.core.lesson_location`). Los borradores de consultas se quedan en el
  navegador (límite de SCORM 1.2).
- **Detalle**: una interacción por pregunta resuelta (id + la consulta del estudiante).
- **Idioma**: el paquete conserva el idioma de interfaz con el que se creó (`SQLLAB_CONFIG.lang`).

Creación:

```
npm install
node tools/build_scorm.js demo-es                # → dist/sqllab-demo-es-scorm12.zip
node tools/build_scorm.js dcg2024 mi-paquete.json --seuil 80
node tools/build_scorm.js exemples/exercice-perso-mediatheque.zip
node tools/build_scorm.js --tous                 # un paquete por ejercicio del catálogo
```

o, sin nada que instalar, el botón **Paquete SCORM** del paso 4 del espacio del profesor.

En Moodle: *Añadir una actividad → Paquete SCORM*, sube el zip; configura la calificación en
«Calificación más alta» o «Último intento».

**Probar sin plataforma**: `tools/scorm-test.html` simula una plataforma SCORM 1.2 (objeto
`API`, datos conservados entre sesiones, registro de llamadas). Descomprime el paquete en
`dist/test/<id>/` y abre
`http://localhost:8765/tools/scorm-test.html?paquet=../dist/test/<id>/index.html`.
