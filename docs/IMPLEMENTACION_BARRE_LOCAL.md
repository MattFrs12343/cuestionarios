# Implementación local de Manobra de Barré

Estado: implementado y verificado en local el 15 de noviembre de 2026.

Fuente: `modulo/QUESTIONÁRIO – MANOBRA DE BARRÉ.docx`.

## Alcance

Cuatro secciones: datos básicos, instrucciones, evaluación de miembros inferiores y archivos con firma. Nivel C, Bs 300.

Se conservaron las cinco preguntas del documento, con lateralidad, asimetría, tiempo hasta la caída o interrupción para cada miembro inferior y todos los tipos de alteración. Las tres alteraciones indicadas con D-E se registran por lado. Se impide combinar la opción sin alteraciones con respuestas que indiquen alteraciones.

Incluye creación, edición, visualización, eliminación, filtros, ordenamiento, paginación, historial, borradores por usuario/equipo, firma, pedido médico privado, hasta cinco adjuntos y exportación JPG. Utiliza los controles de acceso y componentes compartidos existentes. Las instrucciones siguen el diseño minimalista aprobado para Epley.

## Activación y migración

El módulo opcional `barre` se asigna desde Administración, siguiendo las reglas existentes del equipo y del usuario. No se habilitó automáticamente a usuarios de la base de trabajo.

La migración se aplicó localmente, agregando únicamente la tabla `barres`. Para otra instalación:

```powershell
& C:/php84/php.exe artisan migrate --path=database/migrations/2026_11_15_000001_create_barres_table.php
```

El servidor de trabajo usa el puerto 8000. La revisión visual usa una base de datos ficticia separada y el puerto 8001; allí se habilitó Barré para la cuenta de demostración existente.

## Verificación

- 224 pruebas y 1.369 verificaciones pasaron, incluyendo Epley, Barré y los cuestionarios anteriores.
- Ocho pruebas específicas de Barré cubren respuestas y tiempos, edición multipart, limpieza de campos ocultos, archivos privados, eliminación, aislamiento entre equipos, módulo desactivado, validación, filtros y combinaciones incompatibles.
- Clasificación comercial correcta para los 14 cuestionarios registrados.
- Compilación Vite y formato PHP correctos. La compilación conserva advertencias preexistentes de claves `_method` duplicadas en otros formularios.
- Revisión visual en escritorio y móvil, creación desde navegador, comprobación del detalle y descarga del JPG; se inspeccionó el archivo exportado.

Sin despliegue a producción. Los otros cuatro módulos se completaron posteriormente; ver docs/IMPLEMENTACION_CUESTIONARIOS_RESTANTES_LOCAL.md.
