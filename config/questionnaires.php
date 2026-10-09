<?php

use App\Models\AvaliacaoEquilibrio;
use App\Models\DinamometriaMmii;
use App\Models\Dinamometro;
use App\Models\Electroneuromiografia;
use App\Models\ElectroneuromiografiaFacial;
use App\Models\Estesiometria;
use App\Models\MiniExameMental;
use App\Models\Potencial;
use App\Models\Questionnaire;
use App\Models\RastreioCognitivo;
use App\Models\TdahAdulto;
use App\Models\TdahInfantil;

/**
 * Registro central de los tipos de cuestionario/módulo.
 *
 * Antes, agregar un cuestionario nuevo obligaba a tocar 4 archivos distintos
 * (UserModule::MODULES, User::RED_TEAM_ONLY_MODULES, AttachmentController::TYPES
 * y el closure de routes/web.php). Ahora todos esos puntos leen de acá.
 *
 * - La clave (ej. "rastreio_cognitivo") es el "module_name": se usa en
 *   team_modules, user_modules y como tipo de ícono (QuestionnaireTypeIcon).
 * - "slug" es la versión con guiones usada en rutas, anexos y pedidos médicos
 *   (ej. "rastreio-cognitivo").
 * - "core" = true → el módulo viene habilitado por defecto para cualquier
 *   equipo nuevo. "core" = false → el equipo tiene que habilitarlo explícitamente
 *   en team_modules (reemplaza el hack de "equipo Rojo").
 * - "jsx" = ruta relativa a resources/js/Pages del formulario del cuestionario.
 * - "precio" = clasificación comercial del laudo: cuántas secciones tiene ese
 *   formulario, su nivel y su precio en Bs. Regla: 3-4 secciones → C (Bs 250),
 *   5-6 → B (Bs 350), 7+ → A (Bs 450). El test PricingClassificationTest y el
 *   comando `php artisan laudos:clasificar` fallan si un tipo nuevo no tiene
 *   "precio", si el JSX detectado no coincide con "secciones" o si nivel/precio
 *   no respetan la regla: la alerta que corre antes de construir nuevos
 *   cuestionarios.
 */
return [

    'types' => [
        'electroencefalograma' => [
            'model' => Questionnaire::class,
            'name_field' => 'nome_completo',
            'slug' => 'electroencefalograma',
            'label' => 'Electroencefalograma',
            'description' => 'Questionário para exames de electroencefalograma',
            'color' => 'bg-blue-500',
            'core' => true,
            'jsx' => 'Questionnaires/Electroencefalograma/Create.jsx',
            'precio' => ['secciones' => 5, 'nivel' => 'B', 'bs' => 350],
        ],
        'electroneuromiografia' => [
            'model' => Electroneuromiografia::class,
            'name_field' => 'nome',
            'slug' => 'electroneuromiografia',
            'label' => 'Electroneuromiografía',
            'description' => 'Questionário para exames de electroneuromiografia',
            'color' => 'bg-purple-500',
            'core' => true,
            'jsx' => 'Questionnaires/Electroneuromiografia/Create.jsx',
            'precio' => ['secciones' => 7, 'nivel' => 'A', 'bs' => 450],
        ],
        'potencial' => [
            'model' => Potencial::class,
            'name_field' => 'nome',
            'slug' => 'potencial',
            'label' => 'Potencial Evocado',
            'description' => 'Questionário para exames de potencial evocado auditivo e visual',
            'color' => 'bg-green-500',
            'core' => true,
            'jsx' => 'Questionnaires/Potencial/Create.jsx',
            'precio' => ['secciones' => 5, 'nivel' => 'B', 'bs' => 350],
        ],
        'electroneuromiografia_facial' => [
            'model' => ElectroneuromiografiaFacial::class,
            'name_field' => 'nome',
            'slug' => 'electroneuromiografia-facial',
            'label' => 'Electroneuromiografia Facial',
            'description' => 'Questionário para exames de electroneuromiografia facial',
            'color' => 'bg-orange-500',
            'core' => true,
            'jsx' => 'Questionnaires/ElectroneuromiografiaFacial/Create.jsx',
            'precio' => ['secciones' => 4, 'nivel' => 'C', 'bs' => 250],
        ],
        'rastreio_cognitivo' => [
            'model' => RastreioCognitivo::class,
            'name_field' => 'nome_completo',
            'slug' => 'rastreio-cognitivo',
            'label' => 'Rastreio Cognitivo (MoCA)',
            'description' => 'Protocolo de rastreio cognitivo em consulta',
            'color' => 'bg-teal-500',
            'core' => true,
            'jsx' => 'Questionnaires/RastreioCognitivo/Create.jsx',
            'precio' => ['secciones' => 4, 'nivel' => 'C', 'bs' => 250],
        ],
        'equilibrio' => [
            'model' => AvaliacaoEquilibrio::class,
            'name_field' => 'nome_completo',
            'slug' => 'equilibrio',
            'label' => 'Avaliação do Equilíbrio',
            'description' => 'Avaliação do equilíbrio clínico e risco de quedas',
            'color' => 'bg-yellow-500',
            'core' => true,
            'jsx' => 'Questionnaires/AvaliacaoEquilibrio/Create.jsx',
            'precio' => ['secciones' => 5, 'nivel' => 'B', 'bs' => 350],
        ],
        'mini_exame_mental' => [
            'model' => MiniExameMental::class,
            'name_field' => 'nome_completo',
            'slug' => 'mini-exame-mental',
            'label' => 'Mini Exame do Estado Mental (MEEM)',
            'description' => 'Protocolo de rastreio cognitivo breve em consulta',
            'color' => 'bg-blue-500',
            'core' => true,
            'jsx' => 'Questionnaires/MiniExameMental/Create.jsx',
            'precio' => ['secciones' => 4, 'nivel' => 'C', 'bs' => 250],
        ],
        'estesiometria' => [
            'model' => Estesiometria::class,
            'name_field' => 'nome_completo',
            'slug' => 'estesiometria',
            'label' => 'Estesiometria',
            'description' => 'Avaliação sensitiva com monofilamentos',
            'color' => 'bg-red-500',
            'core' => false,
            'jsx' => 'Questionnaires/Estesiometria/Create.jsx',
            'precio' => ['secciones' => 5, 'nivel' => 'B', 'bs' => 350],
        ],
        'tdah_infantil' => [
            'model' => TdahInfantil::class,
            'name_field' => 'nome_completo',
            'slug' => 'tdah-infantil',
            'label' => 'TDAH Infantil (SNAP-IV)',
            'description' => 'Escala de autoavaliação para TDAH em crianças',
            'color' => 'bg-violet-500',
            'core' => false,
            'jsx' => 'Questionnaires/TdahInfantil/Create.jsx',
            'precio' => ['secciones' => 3, 'nivel' => 'C', 'bs' => 250],
        ],
        'tdah_adulto' => [
            'model' => TdahAdulto::class,
            'name_field' => 'nome_completo',
            'slug' => 'tdah-adulto',
            'label' => 'TDAH Adulto (ASRS-18)',
            'description' => 'Escala de autoavaliação para TDAH em adultos',
            'color' => 'bg-indigo-500',
            'core' => false,
            'jsx' => 'Questionnaires/TdahAdulto/Create.jsx',
            'precio' => ['secciones' => 3, 'nivel' => 'C', 'bs' => 250],
        ],
        'dinamometro' => [
            'model' => Dinamometro::class,
            'name_field' => 'nome_completo',
            'slug' => 'dinamometro',
            'label' => 'Dinamômetro',
            'description' => 'Avaliação de força de preensão manual',
            'color' => 'bg-violet-500',
            'core' => false,
            'jsx' => 'Questionnaires/Dinamometro/Create.jsx',
            'precio' => ['secciones' => 9, 'nivel' => 'A', 'bs' => 450],
        ],
        'dinamometria_mmii' => [
            'model' => DinamometriaMmii::class,
            'name_field' => 'nome_completo',
            'slug' => 'dinamometria-mmii',
            'label' => 'Dinamometria de Membros Inferiores',
            'description' => 'Avaliação neurológica e funcional de força muscular dos membros inferiores',
            'color' => 'bg-cyan-500',
            'core' => false,
            'jsx' => 'Questionnaires/DinamometriaMmii/Create.jsx',
            'precio' => ['secciones' => 8, 'nivel' => 'A', 'bs' => 450],
        ],
    ],

    /**
     * Slugs retirados -> clave actual de "types".
     *
     * El módulo de Electro neuromiografía Facial se renombró de
     * "eletroneuromiografia-facial" a "electroneuromiografia-facial".
     * Los enlaces de pedido médico ya compartidos (WhatsApp, email) usan el
     * slug viejo en la URL, así que se mantiene como alias para que sigan
     * sirviendo. No hay que sacarlo salvo que se acepte romper esos enlaces.
     */
    'legacy_slugs' => [
        'eletroneuromiografia-facial' => 'electroneuromiografia_facial',
    ],

];
