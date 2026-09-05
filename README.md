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
- Cada día, antes de tocar nada, la app guarda una copia intacta del día anterior en `registrador.v1.prev`. Si una actualización fallara al leer los datos, arranca con esa copia.
- Los datos van ligados a la dirección (origen) desde la que abres la app. Mientras el enlace sea el mismo, las actualizaciones no tocan los datos.

## Actualizar la app sin perder nada

- Los datos llevan un número de esquema (`schema`). La función `migrate()` en `index.html` convierte estructuras antiguas a la actual; cualquier cambio de formato se añade ahí como un paso `if(d.schema<N){...}`.
- Republicar el artefacto con el mismo enlace sustituye solo el código. El almacenamiento del navegador no se toca.
- Antes de una actualización grande, pulsa "Guardar copia ahora" en Ajustes. Si algo sale mal, "Restaurar desde una copia" recupera todo.

## Copia de seguridad

- Ajustes → Copia de seguridad. La copia es un JSON con todo (categorías, registros, ajustes) que se guarda en Descargas del móvil.
- Con el aviso diario activado, al abrir la app aparece un botón "Guardar copia" si hay registros nuevos desde la última copia.
- "Exportar CSV" genera una tabla (fecha, inicio, fin, categoría, minutos) para hojas de cálculo.

## Formato del JSON

```json
{
  "schema": 1,
  "categories": [{"id": "c1", "name": "Trabajo", "color": "#2a78d6"}],
  "entries": [{"id": "abc", "cat": "c1", "start": 1757059200000, "end": 1757062800000}],
  "settings": {"autoBackup": true, "theme": "system"},
  "meta": {"created": 0, "updated": 0, "lastBackup": 0, "lastBackupUpdated": 0}
}
```

`start` y `end` son milisegundos desde 1970 (hora local del dispositivo al mostrarse). `end` es `null` mientras el registro está en marcha.
