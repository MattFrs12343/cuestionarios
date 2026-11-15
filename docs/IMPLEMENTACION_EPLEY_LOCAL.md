# Implementación local de Manobra de Epley

Estado: implementado y verificado en local el 15 de noviembre de 2026.

## Funciones

- Formulario de cuatro secciones, nivel C, Bs 300.
- Cinco preguntas del documento `modulo/MANOBRA DE EPLEY.docx`, con lateralidad, tiempo e interpretación de referencia.
- Instrucciones y observaciones técnicas tomadas del documento fuente.
- Creación, edición, detalle, eliminación y registro del creador y último editor.
- Búsqueda, filtros por clínica y fechas, ordenamiento y paginación.
- Firma, pedido médico privado, hasta cinco adjuntos con los componentes de cámara, galería y edición de imágenes existentes.
- Recuperación de borradores por usuario, equipo y registro.
- Exportación JPG y presentación adaptable a móvil y escritorio.
- Catálogo, historial y controles de acceso por equipo y asignación individual existentes.

## Activación

El módulo `epley` es opcional, igual que los módulos nuevos más recientes. Se habilita desde la administración de módulos del equipo o del usuario, siguiendo las reglas de acceso existentes. No se habilitaron automáticamente módulos a usuarios existentes.

La migración nueva se aplicó a la base local, agregando únicamente la tabla `epleys`. Para otra instalación:

```powershell
& C:/php84/php.exe artisan migrate --path=database/migrations/2026_11_15_000000_create_epleys_table.php
```

El PHP adecuado está en `C:/php84/php.exe` (8.4.24). El PHP de XAMPP es 8.0.30 y no satisface las dependencias del proyecto.

## Verificación

- Antes de implementar: 192 pruebas existentes pasaron.
- Después de integrar: 207 pruebas y 1.221 verificaciones pasaron, incluyendo pruebas del nuevo módulo y pruebas compartidas del catálogo.
- Compilación Vite completada. Se mantienen advertencias preexistentes de claves `_method` duplicadas en formularios anteriores.
- Clasificación comercial: los 13 cuestionarios coinciden con sus secciones y tarifas.
- Revisión en navegador: creación, recuperación de borrador, edición, detalle móvil y escritorio y descarga JPG. Se inspeccionó la imagen exportada.
- Pruebas de adjuntos, pedido médico, limpieza de archivos, validación y aislamiento entre equipos incluidas en `tests/Feature/EpleyTest.php`.
- La revisión visual usó una base SQLite separada en `storage/epley-qa/database.sqlite`, con datos ficticios del seeder local. No se ejecutó el seeder sobre la base local de trabajo.

No se desplegaron cambios a producción. Los otros cinco módulos cotizados quedan pendientes.
