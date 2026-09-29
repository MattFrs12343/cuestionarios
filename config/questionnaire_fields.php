<?php

/**
 * Visibilidad de campos de cuestionario por equipo.
 *
 * Algunos equipos usan variantes del mismo cuestionario: preguntas que el resto
 * no llena, o preguntas que un equipo específico no quiere ver. En vez de
 * duplicar el formulario entero, acá se declara qué campos se ocultan y cuáles
 * son exclusivos de un equipo; `App\Support\QuestionnaireFields` lo resuelve y
 * los controladores lo pasan a las vistas.
 *
 * Estructura por equipo:
 *   - "hidden"   => campos que ese equipo NO ve (se ocultan del formulario, del
 *                   detalle y de la exportación; los datos ya cargados en la base
 *                   no se tocan, así que la decisión es reversible).
 *   - "exclusive" => campos que SOLO ese equipo ve. Para el resto no se renderizan
 *                   y el backend descarta el valor si alguien lo envía a mano.
 *
 * POR QUÉ SE USA EL ID Y NO EL NOMBRE DEL EQUIPO:
 * el commit 9b8796e eliminó el "hack del equipo rojo", que comparaba el equipo
 * por nombre ("Rojo"). Los nombres cambian —el equipo se renombra, se fusiona,
 * se crea "Rojo 2"— y eso rompe la lógica en silencio. El id es clave foránea en
 * todas las tablas, así que no se mueve nunca. El nombre vive solo como
 * comentario legible; la lógica nunca lo lee.
 *
 * Si se agrega un equipo nuevo, no aparece acá y por lo tanto ve el
 * cuestionario completo (comportamiento por defecto).
 */
return [

    'team_overrides' => [

        // id=5 → equipo "Azul"
        5 => [
            'hidden' => [
                // El PEA no pide peso ni altura para este equipo.
                'potencial' => ['peso', 'altura'],
            ],

            'exclusive' => [
                // Pregunta agregada solo para este equipo.
                'potencial' => ['hiperativo'],

                // Preguntas agregadas solo para este equipo.
                'eletroneuromiografia-facial' => ['teve_avc', 'avc_quando'],
            ],
        ],

    ],

];
