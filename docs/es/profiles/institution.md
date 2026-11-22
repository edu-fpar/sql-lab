# Centro educativo, servicio informático

## Desplegarlo en el LMS
- **Paquete SCORM 1.2**, uno por ejercicio, compatible con Moodle, Chamilo y otros LMS SCORM.
- El paquete contiene toda la aplicación **sin llamadas externas** (sin CDN) y está bloqueado en
  el ejercicio.
- Comunica la puntuación, el estado (incompleto, completado, aprobado) y los datos de
  reanudación.
- Registra una interacción por cada pregunta resuelta.

## Alojarlo internamente
Es un sitio web **estático**, sin servidor de aplicaciones ni base de datos en el servidor.
Copia el repositorio en cualquier servidor web (Apache, Nginx, IIS, GitHub Pages, intranet).
El único punto a vigilar: servir los archivos `.wasm` con el tipo MIME `application/wasm`.

## Comprobar la protección de datos (RGPD)
- No se recoge ni se envía ningún dato personal: sin cuenta, sin analítica, sin rastreadores,
  sin fuentes ni scripts de terceros.
- Las consultas se ejecutan en el navegador. El progreso se queda en el almacenamiento local del
  dispositivo, o en el LMS con SCORM.
- Las preguntas compartidas por enlace van después del `#` de la dirección: nunca se envían al
  servidor.
