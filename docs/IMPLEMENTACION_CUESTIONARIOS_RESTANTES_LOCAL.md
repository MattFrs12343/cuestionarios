# Implementación local de los cuestionarios restantes

Estado: los seis módulos cotizados están implementados en local y disponibles para revisión del usuario. Fecha: 15 de noviembre de 2026.

## Módulos incluidos en esta entrega

| Módulo | Clave | Ruta | Secciones | Nivel | Precio |
| --- | --- | --- | ---: | --- | ---: |
| Manobra de Finger Tapping | finger_tapping | /questionnaires/finger-tapping | 4 | C | Bs 300 |
| Manobra de Mingazzini MMSS y MMII | mingazzini | /questionnaires/mingazzini | 4 | C | Bs 300 |
| Manobra de Raimiste | raimiste | /questionnaires/raimiste | 4 | C | Bs 300 |
| Teste de Wartenberg | wartenberg | /questionnaires/wartenberg | 4 | C | Bs 300 |

Mingazzini contiene las diez preguntas de MMII y MMSS en un único módulo, con campos y tiempos independientes para cada evaluación. Los otros tres módulos contienen las cinco preguntas de sus respectivos documentos de `modulo`.

## Funciones

Se conserva el patrón de los módulos anteriores: datos del paciente, instrucciones minimalistas, campos condicionales, selección de lateralidad, tiempos, comentarios, firma del evaluador, pedido médico privado y hasta cinco imágenes con cámara, galería y edición. Incluye creación, edición, detalle, eliminación, filtros, ordenamiento, paginación, historial y recuperación de borradores por usuario, equipo y registro.

Los cuatro módulos nuevos comparten componentes de formulario, presentación de resultados e instrucciones en `resources/js/Pages/Questionnaires/MotorManeuvers`. Sus modelos, tablas, controladores y rutas son independientes. Epley, Barré y los cuestionarios anteriores conservan sus formularios y exportadores existentes.

La exportación JPG de estos cuatro módulos captura toda la altura del contenido, incluyendo las dos evaluaciones de Mingazzini. Los archivos privados permanecen disponibles por sus rutas autenticadas.

## Observación del documento de Mingazzini

Las instrucciones originales de MMSS indican 20 a 30 segundos, mientras que su primera pregunta menciona 60 segundos. Ambos valores se conservaron y la diferencia se muestra en las instrucciones para revisión del protocolo. No se eligió un tiempo clínico nuevo ni se generaron diagnósticos automáticos.

## Activación local

Las cuatro migraciones nuevas están aplicadas en la base de trabajo local. Solo agregan las tablas `finger_tappings`, `mingazzinis`, `raimistes` y `wartenbergs`. Los módulos son opcionales y se asignan mediante los controles de administración existentes; no se cambiaron asignaciones de usuarios en la base de trabajo.

El panel de revisión en `http://127.0.0.1:8001/questionnaires` usa una base SQLite separada con datos ficticios. Allí se habilitaron los cuatro módulos para la cuenta de demostración existente. La base local de trabajo sigue en el puerto 8000.

## Verificación

- 281 pruebas y 2.290 verificaciones pasaron, incluyendo los cuestionarios anteriores, Epley y Barré.
- Pruebas específicas de los cuatro módulos: persistencia de todas las respuestas, valor cero en tiempos, mayúsculas, asignación forzada al equipo actual, edición multipart, limpieza de campos ocultos, preservación de firma y archivos, eliminación, validación y filtros.
- Las pruebas compartidas verifican aislamiento entre equipos y acceso a archivos para todos los tipos registrados.
- Prueba adicional de coherencia de la opción sin alteraciones en Mingazzini MMII.
- Clasificación comercial correcta para los 18 tipos de cuestionario registrados.
- Compilación Vite correcta. Se mantienen advertencias anteriores de claves `_method` duplicadas en otros formularios.
- Revisión en navegador de los cuatro módulos; edición de Finger Tapping y Raimiste, creación de Wartenberg, presentación móvil de Mingazzini y Wartenberg, diez grupos de respuestas en Mingazzini y ausencia de desbordamiento horizontal.
- Descarga e inspección visual del JPG completo de Mingazzini, incluyendo el final de MMSS y los tiempos de ambos lados.

No se desplegaron cambios a producción. Todos los módulos quedan pendientes de la revisión del usuario.
