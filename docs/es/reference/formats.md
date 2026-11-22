# Formatos de archivo

Todos los archivos son JSON. **Las claves se quedan en francés** sea cual sea el idioma del
ejercicio (`enonce`, `correction`, `indice`…); solo los valores (enunciados, pistas, nombres)
están en el idioma del ejercicio. El ejemplo completo más sencillo es
[`exercices/demo-es/questions.json`](https://github.com/edu-fpar/sql-lab/blob/main/exercices/demo-es/questions.json).

## Pregunta de SQL

```json
{
  "id": "q11",
  "theme": "Combinaciones",
  "enonce": "Muestra, sin duplicados, el apellido y el nombre de los clientes que han alquilado al menos una bicicleta eléctrica (categoría número 2).",
  "correction": [
    "SELECT DISTINCT Apellido, Nombre",
    "FROM CLIENTE, ALQUILER, LINEA_ALQUILER, BICICLETA",
    "WHERE CLIENTE.IdCliente = ALQUILER.IdCliente",
    "AND ALQUILER.IdAlquiler = LINEA_ALQUILER.IdAlquiler",
    "AND LINEA_ALQUILER.IdBicicleta = BICICLETA.IdBicicleta",
    "AND IdCategoria = 2;"
  ],
  "variantes": [["SELECT DISTINCT Apellido, Nombre", "FROM CLIENTE INNER JOIN ALQUILER ON …"]],
  "indice": "Sigue las flechas de CLIENTE a BICICLETA."
}
```

| Clave | Obligatoria | Función |
|---|---|---|
| `id` | recomendada | identificador corto y único |
| `theme` | recomendada | tema, sirve para agrupar las preguntas en el menú |
| `enonce` | **sí** | el enunciado, en lenguaje de negocio |
| `correction` | **sí** | consulta de referencia: una cadena o un array de líneas |
| `variantes` | no | otras escrituras correctas, mismo formato |
| `indice` | recomendada | una pista que no da la consulta |
| `ordered` | si se pide ordenar | índices (desde 0) de las columnas del resultado por las que se ordena |
| `type` | para actualizaciones | `"write"` para INSERT / UPDATE / DELETE |
| `verif` | para actualizaciones | `SELECT * FROM <tabla>`: se compara la tabla antes/después |
| `annale` | no | año del examen (etiqueta) |
| `cinema` | no | sustituye comentarios de la solución paso a paso: `{ "passages": "…", "filtres.2": "…" }` |

Los nombres de paso para `cinema` son `tables`, `passages` (tablas intermedias), `alias`,
`select`, `jointures`, `filtres`, `groupe`, `tri`, `resultat`; para las preguntas de esquema,
`lecture`, `retraits`, `entites`, `liens`, `associations`, `bilan`. `paso.n` designa el n-ésimo
paso de una fase. Solo texto plano.

## Pregunta de esquema

```json
{
  "id": "s01", "type": "schema", "theme": "Diseño de esquemas",
  "enonce": "…reglas de negocio…",
  "depart": "base",
  "solution": { "tables": [
    { "nom": "BICICLETA", "interdits": ["Modelo", "Marca"] },
    { "nom": "ALQUILER_ACCESORIO", "alias": ["ALQUILER_ACCESORIOS"],
      "role": "registrar qué accesorios se llevaron en un alquiler",
      "pk": ["IdAlquiler", "IdAccesorio"], "fk": { "IdAlquiler": "ALQUILER", "IdAccesorio": "ACCESORIO" },
      "attributs": ["Cantidad|Cant"] }
  ] },
  "variantes": [ { "tables": [ … ], "partiel": "Mensaje si solo es parcialmente correcto" } ],
  "indice": "…"
}
```

- `depart`: `"base"` (toda la base de datos), una lista de nombres de tablas, o tablas descritas
  `{ "nom": "EMPLEADO", "colonnes": ["_IdEmpleado", "Nombre", "#IdTienda>TIENDA"] }`
  (`_` = clave primaria, `#…>TABLA` = clave foránea).
- `solution.tables`: solo las tablas nuevas o modificadas. `pk`, `fk` (atributo → tabla),
  `attributs` (obligatorios), `optionnels` (tolerados), `interdits` (deben salir de la tabla).
  `role` es **obligatorio** para cada tabla nueva: se usa en «Falta una tabla para …».
- Los nombres se comparan sin tener en cuenta mayúsculas, acentos ni `_`; nombres equivalentes
  con `|`; una tabla con un nombre inesperado se reconoce por su clave primaria.

## Pregunta de procesos

```json
{
  "id": "p01", "type": "processus", "theme": "Proceso",
  "enonce": "Texto de la entrevista y, después, la consigna.",
  "couloirs": ["Cliente", "Sitio web", "Mostrador de la tienda", "Taller"],
  "elements": [ { "kind": "event", "label": "Solicitud de reserva" }, { "kind": "operation", "label": "Entrega de la bicicleta" } ],
  "attendus": [
    { "operation": "Entrega de la bicicleta", "synchronisation": "Reserva confirmada y (Fianza pagada o Tarjeta de socio presentada)" },
    { "operation": "Comprobación de disponibilidad", "regles": ["Bicicleta disponible", "Ninguna bicicleta disponible"] }
  ],
  "equivalents": { "Reserva confirmada": ["Reserva aceptada"] },
  "solution": { "lanes": [], "nodes": [], "arrows": [] },
  "autoevaluation": ["El cliente es un actor.", "…"]
}
```

Las condiciones aceptan `y`/`o`, así como `and`/`or` y `et`/`ou`, en mayúsculas o minúsculas y
en cualquier orden. Un nombre de evento que contenga «y»/«o» va entre comillas. Eventos
opcionales: `"facultatifs": ["…"]` en el elemento esperado. `depart` (mismo formato que
`solution`): un diagrama parcial que hay que completar. La `solution` dibujada y los `elements`
sugeridos se producen más fácilmente en la aplicación.

## Paquete de preguntas (`sql-lab-questions/1`)

```json
{ "format": "sql-lab-questions/1", "exercice": "demo-es", "titre": "Práctica de combinaciones",
  "auteur": "…", "questions": [ … ] }
```

Se comparte como archivo («Importar un archivo»), como enlace sin servidor (`index.html#pack=…`,
comprimido después del `#`) o como enlace a un archivo alojado
(`index.html?pack=https://…/questions.json`, el sitio debe permitir CORS).

## Ejercicio con tu propia base de datos (`sql-lab-exercice/1`)

Un zip que contiene `exercice.json` (título, contexto, «hoy» simulado `aujourdhui`, `schemaGrid`
opcional, preguntas) y `db.sqlite` **o** `db.sql` (`CREATE TABLE` + `INSERT`). Las fechas deben
guardarse como `AAAA-MM-DD`; declara las claves foráneas con `REFERENCES` para que el diagrama
dibuje las flechas.
Modelo: [`exemples/exercice-perso-mediatheque/`](https://github.com/edu-fpar/sql-lab/tree/main/exemples/exercice-perso-mediatheque).
Enlace para el estudiante: `index.html?exercice=https://…/exercice.zip`.
