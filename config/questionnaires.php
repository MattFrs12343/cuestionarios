<?php

use App\Models\AvaliacaoEquilibrio;
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
 */
return [

    'types' => [
        'electroencefalograma' => [
            'model' => Questionnaire::class,
            'slug' => 'electroencefalograma',
            'label' => 'Electroencefalograma',
            'description' => 'Questionário para exames de electroencefalograma',
            'color' => 'bg-blue-500',
            'core' => true,
        ],
        'electroneuromiografia' => [
            'model' => Electroneuromiografia::class,
            'slug' => 'electroneuromiografia',
            'label' => 'Electroneuromiografía',
            'description' => 'Questionário para exames de electroneuromiografia',
            'color' => 'bg-purple-500',
            'core' => true,
        ],
        'potencial' => [
            'model' => Potencial::class,
            'slug' => 'potencial',
            'label' => 'Potencial Evocado',
            'description' => 'Questionário para exames de potencial evocado auditivo e visual',
            'color' => 'bg-green-500',
            'core' => true,
        ],
        'electroneuromiografia_facial' => [
            'model' => ElectroneuromiografiaFacial::class,
            'slug' => 'electroneuromiografia-facial',
            'label' => 'Electroneuromiografia Facial',
            'description' => 'Questionário para exames de electroneuromiografia facial',
            'color' => 'bg-orange-500',
            'core' => true,
        ],
        'rastreio_cognitivo' => [
            'model' => RastreioCognitivo::class,
            'slug' => 'rastreio-cognitivo',
            'label' => 'Rastreio Cognitivo (MoCA)',
            'description' => 'Protocolo de rastreio cognitivo em consulta',
            'color' => 'bg-teal-500',
            'core' => true,
        ],
        'equilibrio' => [
            'model' => AvaliacaoEquilibrio::class,
            'slug' => 'equilibrio',
            'label' => 'Avaliação do Equilíbrio',
            'description' => 'Avaliação do equilíbrio clínico e risco de quedas',
            'color' => 'bg-yellow-500',
            'core' => true,
        ],
        'mini_exame_mental' => [
            'model' => MiniExameMental::class,
            'slug' => 'mini-exame-mental',
            'label' => 'Mini Exame do Estado Mental (MEEM)',
            'description' => 'Protocolo de rastreio cognitivo breve em consulta',
            'color' => 'bg-blue-500',
            'core' => true,
        ],
        'estesiometria' => [
            'model' => Estesiometria::class,
            'slug' => 'estesiometria',
            'label' => 'Estesiometria',
            'description' => 'Avaliação sensitiva com monofilamentos',
            'color' => 'bg-red-500',
            'core' => false,
        ],
        'tdah_infantil' => [
            'model' => TdahInfantil::class,
            'slug' => 'tdah-infantil',
            'label' => 'TDAH Infantil (SNAP-IV)',
            'description' => 'Escala de autoavaliação para TDAH em crianças',
            'color' => 'bg-violet-500',
            'core' => false,
        ],
        'tdah_adulto' => [
            'model' => TdahAdulto::class,
            'slug' => 'tdah-adulto',
            'label' => 'TDAH Adulto (ASRS-18)',
            'description' => 'Escala de autoavaliação para TDAH em adultos',
            'color' => 'bg-indigo-500',
            'core' => false,
        ],
        'dinamometro' => [
            'model' => Dinamometro::class,
            'slug' => 'dinamometro',
            'label' => 'Dinamômetro',
            'description' => 'Avaliação de força de preensão manual',
            'color' => 'bg-violet-500',
            'core' => false,
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
