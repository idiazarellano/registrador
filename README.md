# Registrador

Aplicación web de un solo archivo (`index.html`) para registrar en qué dedicas tu tiempo cada día.

## Archivos

- `index.html`: toda la aplicación.
- `manifest.webmanifest`: hace que Chrome la instale como app completa (icono, pantalla completa).
- `sw.js`: service worker; permite abrirla sin conexión. Red primero, caché de respaldo.
- `icon-*.png`: iconos de la app.

## Alojamiento y publicación

La app se sirve desde GitHub Pages, rama `main`, raíz del repositorio. Publicar una versión nueva:

```bash
cd ~/Apps/Registrador
git add -A && git commit -m "descripción del cambio" && git push
```

GitHub Pages tarda uno o dos minutos en servir la versión nueva. En el móvil, cerrar y abrir la app la recarga.

## Instalar en el móvil

1. Abre la dirección de GitHub Pages en Chrome (Android).
2. Menú ⋮ → "Instalar aplicación" (o "Añadir a pantalla de inicio").
3. Aparece en la lista de apps del launcher como una app más.

## Dónde viven los datos

- Los registros se guardan en el almacenamiento del navegador (`localStorage`), bajo la clave `registrador.v1`.
- Al abrir la app se pide a Chrome almacenamiento persistente, para que no borre los datos si anda corto de espacio.
- Cada día, antes de tocar nada, la app guarda una copia intacta de los datos en `registrador.v1.snap.AAAA-MM-DD`. Se conservan las 7 últimas. Si una actualización fallara al leer los datos, arranca con la más reciente.
- Los datos van ligados a la dirección (origen) desde la que abres la app. Mientras el enlace sea el mismo, las actualizaciones no tocan los datos.

## Actualizar la app sin perder nada

- Los datos llevan un número de esquema (`schema`). La función `migrate()` en `index.html` convierte estructuras antiguas a la actual; cualquier cambio de formato se añade ahí como un paso `if(d.schema<N){...}`.
- Republicar con el mismo enlace sustituye solo el código. El almacenamiento del navegador no se toca.
- Antes de una actualización grande, pulsa "Guardar copia ahora" en Ajustes → Copia de seguridad. Si algo sale mal, "Restaurar desde una copia" recupera todo.

## Copia de seguridad (Ajustes → Copia de seguridad)

- Cada copia es un JSON con **todo el histórico** (categorías, registros, ajustes), no solo el día. Basta con restaurar la más reciente. El nombre lleva fecha y hora (`registrador-2026-09-06-1830.json`), así nunca pregunta si sobrescribir; las antiguas se pueden borrar de Descargas.
- **Copia diaria**: Automática (al abrir la app, si hay registros nuevos y han pasado 20 h desde la última, se descarga sola), Avisar (aparece un botón en Hoy) o No.
- "Compartir copia" abre el menú de compartir de Android para enviar el JSON a Drive, correo, Telegram…
- "Exportar CSV" genera una tabla (fecha, inicio, fin, categoría, minutos, descanso) para hojas de cálculo.
- **Días de descanso.** El botón 🌴 junto a la fecha (en Hoy o en Registros) marca el día. Las medias de Totales solo cuentan los días que no son de descanso, y en esos días no se avisa de huecos sin registrar.

## Borrar datos (Ajustes → Datos → Zona peligrosa)

- **Borrar todos los registros**: hay que escribir el número de registros; antes se descarga una copia (sin ella no se borra) y lo borrado va a una papelera interna (`registrador.v1.trash`) durante 30 días, con un botón "Deshacer el borrado" en Datos.
- **Borrar todo definitivamente**: solo aparece mientras la papelera tiene contenido. Escribiendo BORRAR elimina del navegador todas las claves `registrador.*` (datos, categorías, ajustes, copias internas y papelera). Los JSON descargados no se tocan.

## Insertar un registro donde no hay hueco

En la lista de registros, entre dos registros seguidos aparece un círculo "+". Abre el editor con un registro nuevo de duración cero en esa unión; con −X en el inicio o +X en el fin se le da duración, y la línea "Al guardar: …" muestra cómo cambian los demás.

Regla de la inserción: los dos vecinos se ajustan al nuevo registro (se acortan o se alargan) para que ningún minuto quede sin dueño. Si el nuevo ocupa 08:45–08:55 en la unión de las 09:00, el anterior acaba a las 08:45 y el siguiente empieza a las 08:55. Solo se alarga un vecino si no hay otro registro entre medias. Las ediciones normales siguen igual: recortan a los vecinos pero nunca los alargan, así que pueden dejar hueco a propósito.

## Tiempo sin asignar

En Totales de hoy, en la línea de totales del día seleccionado en Registros y en Totales · N días aparece "Tiempo sin asignar": la suma de los huecos entre registros (y, si es hoy y no hay nada en marcha, desde el último registro hasta ahora). Su porcentaje se muestra como "+X %" respecto al tiempo registrado, porque va aparte y no forma parte del 100 %. En los días de descanso no se cuenta.

## Formato del JSON

```json
{
  "schema": 2,
  "categories": [{"id": "c1", "name": "Trabajo", "color": "#2a78d6"}],
  "entries": [{"id": "abc", "cat": "c1", "start": 1757059200000, "end": 1757062800000}],
  "restDays": ["2026-09-06"],
  "settings": {"backupMode": "auto", "theme": "system", "granularity": 5},
  "meta": {"created": 0, "updated": 0, "lastBackup": 0, "lastBackupUpdated": 0}
}
```

`start` y `end` son milisegundos desde 1970 (hora local del dispositivo al mostrarse). `end` es `null` mientras el registro está en marcha.
