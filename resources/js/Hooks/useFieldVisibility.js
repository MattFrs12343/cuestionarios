import { usePage } from '@inertiajs/react';

/**
 * Visibilidad de campos de cuestionario para el equipo actual.
 *
 * La lista la arma el servidor (App\Support\QuestionnaireFields, configurada en
 * config/questionnaire_fields.php) y llega como prop `fieldVisibility` de la
 * página. Acá solo se consulta, para no repetir el mismo condicional en cada
 * vista ni dejar el id del equipo hardcodeado en el frontend.
 *
 * @example
 * const { sees } = useFieldVisibility();
 * {sees('peso') && <TextInput name="peso" />}
 */
export function useFieldVisibility() {
  const { props } = usePage();

  const hidden = props?.fieldVisibility?.hidden ?? [];

  const sees = (field) => !hidden.includes(field);

  const hide = (field) => !sees(field);

  return { sees, hide, hidden };
}

export default useFieldVisibility;
