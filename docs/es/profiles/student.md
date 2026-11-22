# Estudiante

## Ponerme a prueba en SQL
1. Abre la [aplicación](https://edu-fpar.github.io/sql-lab/?lang=es#demo-es/intro) y elige un
   ejercicio (la demo en español o uno de los exámenes franceses).
2. Lee la **pregunta 0 «Introducción»**: contexto de la empresa, tablas, forma de trabajar.
3. Escribe tu consulta en el editor (el autocompletado sugiere tablas y columnas) y pulsa
   **Ejecutar** (Ctrl + Intro). La aplicación compara tu resultado con el esperado.

Las preguntas van de fáciles a difíciles: una tabla, cálculos, fechas, combinaciones,
agrupaciones, subconsultas, actualizaciones y, por último, diseño de esquemas y de procesos.
Consulta [Consultas y corrección automática](es/topics/queries).

## Repasar la teoría
Junto a cada tema de la lista de preguntas (y junto a la etiqueta de la pregunta), el icono
<i class="i i-lightbulb"></i> abre un **recordatorio teórico** visual:

- el método en pasos que despliegas uno a uno;
- los conceptos y detalles en forma de «pétalos»;
- los errores clásicos, con la forma incorrecta y la correcta de escribirlos.

El botón **Desplegar todo** lo muestra todo a la vez, para repasar o imprimir.

## Entender mis errores
- El mensaje no se limita a decir «incorrecto»: explica qué falla. Por ejemplo: demasiadas
  filas (combinación o condición olvidada), duplicados (DISTINCT), orden incorrecto, `= NULL`
  en lugar de `IS NULL`, una condición sobre un cálculo puesta en WHERE en lugar de HAVING.
- Los errores de sintaxis de SQLite se convierten en consejos sencillos, por ejemplo «columna
  ambigua: prefíjala con el nombre de la tabla».
- **Resultado esperado** muestra lo que deberías obtener, **Pista** te orienta sin darte la
  respuesta, y un doble clic en una tabla del diagrama muestra su contenido.

## Repetir una solución paso a paso
En **Solución**, el botón **<i class="i i-clapperboard"></i> Solución paso a paso** reproduce el razonamiento:

- primero, las tablas que contienen la información;
- después, las tablas intermedias, los alias, las columnas que se muestran, las combinaciones,
  los filtros, la agrupación y el orden.

El diagrama se anima y la consulta se construye pieza a pieza. Puedes avanzar paso a paso o
usar la reproducción automática. Consulta [Soluciones paso a paso](es/topics/step-by-step).

## Practicar el diseño de esquemas y de procesos
- **Preguntas de esquema**: haz evolucionar el esquema de partida (añadir tablas, mover
  atributos, dibujar claves foráneas arrastrando el asa ●) y luego pulsa **Comprobar el
  esquema**. El botón **<i class="i i-clapperboard"></i> Construcción paso a paso** de la
  solución muestra cómo razonar.
- **Preguntas de procesos**: dibuja el diagrama de eventos y resultados (eventos, operaciones,
  sincronizaciones). Las sincronizaciones se comprueban automáticamente; una lista de
  autoevaluación te ayuda a comparar el resto con la solución modelo.

## Retomar donde lo dejé
Tu progreso y tus borradores se guardan **en tu navegador**, en tu dispositivo. En otro
ordenador, o en navegación privada, empiezas de cero. En Moodle (paquete SCORM), la plataforma
guarda tu progreso.

## Hacer las preguntas que me ha dado mi profesor
Tu profesor te da un **enlace** (basta con abrirlo) o un **archivo** (<i class="i i-menu"></i> menú → *Importar un archivo*). Las
preguntas se añaden al final de la lista (grupo <i class="i i-star"></i>).

![La pantalla de una pregunta](../../img/en/question.png)
