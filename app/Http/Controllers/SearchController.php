<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class SearchController extends Controller
{
    /**
     * Columnas de nome por módulo que não seguem o padrão "nome_completo".
     */
    private const NAME_COLUMN_OVERRIDES = [
        'electroneuromiografia' => 'nome',
        'electroneuromiografia_facial' => 'nome',
        'potencial' => 'nome',
    ];

    /**
     * Busca global de pacientes entre todos os tipos de cuestionário que o
     * usuário pode acessar na equipe atual. Usada pelo buscador do dashboard.
     */
    public function index(Request $request): JsonResponse
    {
        $query = trim((string) $request->query('q', ''));

        if (mb_strlen($query) < 2) {
            return response()->json(['results' => []]);
        }

        $user = $request->user();
        $team = $request->attributes->get('currentTeam');

        if (! $team) {
            return response()->json(['results' => []]);
        }

        $accessibleModules = $user->getAccessibleModules($team);
        $results = collect();

        foreach (config('questionnaires.types') as $key => $type) {
            if (! in_array($key, $accessibleModules, true)) {
                continue;
            }

            $model = $type['model'];
            $nameColumn = self::NAME_COLUMN_OVERRIDES[$key] ?? 'nome_completo';

            $rows = $model::where('team_id', $team->id)
                ->whereRaw("LOWER({$nameColumn}) LIKE LOWER(?)", ['%' . $query . '%'])
                ->orderByDesc('data_exame')
                ->limit(5)
                ->get(['id', $nameColumn, 'data_exame']);

            foreach ($rows as $row) {
                $results->push([
                    'id' => $row->id,
                    'nome' => $row->{$nameColumn},
                    'data_exame' => optional($row->data_exame)->format('d/m/Y'),
                    'data_sort' => optional($row->data_exame)->format('Y-m-d') ?? '',
                    'tipo' => $type['label'],
                    'color' => $type['color'],
                    'url' => route("questionnaires.{$type['slug']}.show", $row->id),
                ]);
            }
        }

        $results = $results->sortByDesc('data_sort')->take(15)->values()->map(function ($r) {
            unset($r['data_sort']);
            return $r;
        });

        return response()->json(['results' => $results]);
    }
}
