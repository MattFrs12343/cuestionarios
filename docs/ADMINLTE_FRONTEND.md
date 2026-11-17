# Panel y navegación

La interfaz usa la estructura visual de AdminLTE con React/Tailwind. No agrega Bootstrap ni estilos CSS globales. El sidebar es desplazable sin barra visible; el perfil está en el header y la búsqueda está centralizada en pacientes. El login tiene una portada SVG propia de 905 bytes, diferente del hero. Las animaciones respetan movimiento reducido.

## Navegación por perfil

HandleInertiaRequests comparte capacidades de navegación calculadas con isAdmin()/isSuperAdmin(), las mismas reglas del backend. Solo el superadmin recibe manageRoles. El administrador conserva gestión de sus equipos, usuarios y módulos. Los perfiles sin administración no reciben enlaces administrativos. Las rutas mantienen sus validaciones; ocultar enlaces no reemplaza autorización.

## Carga del directorio

El panel usa los índices existentes con directory=1 y respuestas parciales Inertia. Esta consulta selecciona únicamente identidad, fechas, clínica y evaluador, y carga solo el nombre del creador. Omite respuestas clínicas, firmas, imágenes, equipos y editores. Lee 100 registros por página, con un máximo de tres solicitudes simultáneas. Los índices habituales conservan 15 registros y todos sus datos. No se modifican guardado, esquema ni permisos. No se almacenan datos clínicos en caché local.

La lista se actualiza progresivamente e informa errores parciales. Cada consulta sigue limitada al equipo actual y a módulos autorizados. La agrupación usa documento y nacimiento; cuando falta documento, nombre y nacimiento sin coincidencias ambiguas. Nunca se agrupa solo por nombre.

## Verificación

Build de producción y 304 pruebas PHP aprobadas (2699 aserciones), incluyendo capacidades de navegación, rechazo de roles para administradores y consulta ligera en los 18 módulos con aislamiento de equipo y bloqueo por módulo. Se mantienen seis pruebas de agrupación en Node. Revisión visual de escritorio y móvil a 390 px, sin desbordamiento horizontal. No se afirma una mejora porcentual de latencia sin medición en producción.
