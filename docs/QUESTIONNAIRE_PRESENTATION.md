# Presentación coherente de los cuestionarios

La pauta visual se aplica explícitamente a las páginas de los 18 cuestionarios. No añade CSS global ni modifica los componentes PrimaryButton y SecondaryButton usados fuera de los cuestionarios.

## Orden general

1. Datos e identificación del paciente.
2. Instrucciones, cuando el protocolo las incluya.
3. Evaluación y secciones clínicas en su orden original.
4. Observaciones y resultados, cuando correspondan.
5. Archivos y firma.
6. Cancelar y guardar, al final del formulario.

Los protocolos extensos conservan su navegación por secciones y la numeración clínica. No se agregan secciones artificiales ni se cambia la clasificación comercial.

## Colores de acciones

| Acción | Color |
| --- | --- |
| Nuevo, guardar y editar | Azul |
| Exportar | Verde esmeralda |
| Eliminar | Rojo |
| Visualizar | Gris pizarra |
| Volver, cancelar y limpiar filtros | Neutro |

Los botones de acción tienen una altura mínima de 44 px, esquinas de 8 px, estado desactivado y foco de teclado visible. Las acciones de los listados usan botones de icono de 44 × 44 px. Los botones de cámara, galería, firma y los avisos clínicos conservan sus componentes y significados existentes.

## Identidad de los módulos

Los encabezados y acentos mantienen el color del catálogo definido en `config/questionnaires.php`:

- EEG y MEEM: azul.
- Electroneuromiografía: púrpura.
- Potencial Evocado: verde.
- Electroneuromiografía Facial: naranja.
- Rastreio Cognitivo y las seis maniobras nuevas: verde azulado.
- Equilibrio: ámbar.
- Estesiometría: rojo.
- TDAH Infantil y Dinamómetro: violeta.
- TDAH Adulto: índigo.
- Dinamometría MMII: cian.

Los encabezados de exportación siguen esa misma identidad. Se corrigieron diferencias anteriores, como el violeta del JPG de Potencial Evocado y el rosa del formulario de TDAH Infantil.

## Aplicación en código

Las clases de acciones y paletas están en `resources/js/Components/Questionnaires/presentation.jsx` y se importan explícitamente en las páginas que las necesitan. Los nuevos formularios compartidos resuelven la paleta mediante la clave del módulo. No se utilizan selectores CSS sobre body, formularios de otras páginas ni componentes globales.

Para añadir un cuestionario, registrar su paleta local con la misma clave del catálogo y reutilizar estas clases para las acciones. Conservar los campos, permisos, validaciones y eventos del módulo. Los títulos de sección mantienen su marcado compatible con el contador comercial existente.

## Verificación local

- 285 pruebas y 2.330 verificaciones pasaron.
- Clasificación de los 18 cuestionarios correcta, con las mismas secciones y tarifas.
- Compilación Vite correcta; permanecen las advertencias preexistentes de claves `_method` duplicadas en otros formularios.
- El ajuste automático verificó que no cambiasen los atributos de eventos, rutas, valores, nombres, estados y restricciones de los controles.
- Revisión visual de Potencial Evocado y TDAH Infantil en escritorio; Dinamometría MMII y el listado de Epley en móvil; y las acciones del formulario de Raimiste.
- Confirmados colores de acción uniformes, tamaño de 44 px y ausencia de desbordamiento horizontal en las vistas revisadas.

Estado: aplicado en local, pendiente de revisión del usuario. Sin publicación a producción.
