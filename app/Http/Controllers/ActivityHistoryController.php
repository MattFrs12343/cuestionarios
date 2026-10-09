<?php

namespace App\Http\Controllers;

use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Historial de actividad de los cuestionarios creados por los usuarios.
 *
 * No hay una tabla de auditoría única: cada tipo de cuestionario vive en su
 * propia tabla. Este controlador arma un UNION de todas las tablas registradas
 * en config('questionnaires.types') para presentar una línea de tiempo por
 * equipo y rango de fechas.
 *
 * Visibilidad:
 * - Un usuario normal (técnico/laudador) solo ve sus propios registros.
 * - Un administrador de equipo (o super-admin) ve todo el equipo activo.
 *
 * El rango de fechas filtra por created_at (cuándo se realizó el cuestionario),
 * no por data_exame. Cada fila incluye un enlace al "show" del tipo en cuestión.
 */
class ActivityHistoryController extends Controller
{
    /**
     * Cantidad de registros por página en la línea de tiempo.
     */
    private const PER_PAGE = 25;

    public function index(Request $request): Response
    {
        $user = $request->user();
        $team = $request->attributes->get('currentTeam');

        abort_if(! $team, 403, 'Você não tem nenhuma equipe atribuída.');

        $canViewAll = $user->isSuperAdmin() || $user->isAdmin();

        [$range, $from, $to] = $this->resolveRange($request);

        $types = config('questionnaires.types');

        $timeline = $this->buildTimelineQuery($types, $team->id, $user, $canViewAll, $from, $to);
        $rows = $timeline->orderByDesc('created_at')
            ->paginate(self::PER_PAGE)
            ->withQueryString();

        $creatorNames = $this->creatorNames($rows->getCollection());

        $rows->through(function ($row) use ($creatorNames) {
            $row->creator_name = $creatorNames[$row->created_by] ?? '—';
            $row->show_url = route("questionnaires.{$row->slug}.show", $row->questionnaire_id);

            return $row;
        });

        $counts = [];
        $total = 0;
        foreach ($types as $key => $type) {
            $count = $this->buildTimelineQuery(
                [$key => $type],
                $team->id,
                $user,
                $canViewAll,
                $from,
                $to
            )->count();

            $counts[] = [
                'type_key' => $key,
                'label' => $type['label'],
                'slug' => $type['slug'],
                'color' => $type['color'] ?? 'bg-gray-500',
                'count' => $count,
            ];
            $total += $count;
        }

        usort($counts, fn ($a, $b) => $b['count'] <=> $a['count']);

        return Inertia::render('History/Index', [
            'timeline' => $rows,
            'counts' => $counts,
            'total' => $total,
            'range' => $range,
            'dateFrom' => $from->toDateString(),
            'dateTo' => $to->toDateString(),
            'canViewAll' => $canViewAll,
            'teamName' => $team->name,
        ]);
    }

    /**
     * Query UNION de una o varias tablas de cuestionarios con las columnas
     * comunes del historial.
     *
     * @param  array<string, array<string, mixed>>  $types
     */
    private function buildTimelineQuery(array $types, int $teamId, User $user, bool $canViewAll, Carbon $from, Carbon $to)
    {
        $union = null;

        foreach ($types as $key => $type) {
            $model = new $type['model'];
            $table = $model->getTable();
            $nameField = $type['name_field'];

            $query = DB::table($table)
                ->select([
                    DB::raw("'{$key}' as type_key"),
                    DB::raw("'{$type['label']}' as type_label"),
                    DB::raw("'{$type['slug']}' as slug"),
                    'id as questionnaire_id',
                    DB::raw("COALESCE({$nameField}, '—') as patient_name"),
                    'created_by',
                    'created_at',
                ])
                ->where('team_id', $teamId)
                ->whereBetween('created_at', [$from, $to]);

            if (! $canViewAll) {
                $query->where('created_by', $user->id);
            }

            $union = $union === null ? $query : $union->unionAll($query);
        }

        return $union;
    }

    /**
     * Nombres de los usuarios que crearon los cuestionarios de la página.
     *
     * @param  Collection<int, object>  $rows
     * @return array<int, string>
     */
    private function creatorNames($rows): array
    {
        $ids = $rows->pluck('created_by')->filter()->unique()->values();

        if ($ids->isEmpty()) {
            return [];
        }

        return User::whereIn('id', $ids)->pluck('name', 'id')->all();
    }

    /**
     * Traduce el selector de rango de tiempo a un par de fechas [desde, hasta].
     *
     * @return array{0: string, 1: Carbon, 2: Carbon}
     */
    private function resolveRange(Request $request): array
    {
        $range = $request->get('range', 'today');
        $now = Carbon::now();

        switch ($range) {
            case 'yesterday':
                return ['yesterday', $now->copy()->subDay()->startOfDay(), $now->copy()->subDay()->endOfDay()];

            case '7d':
                return ['7d', $now->copy()->subDays(6)->startOfDay(), $now->copy()->endOfDay()];

            case '30d':
                return ['30d', $now->copy()->subDays(29)->startOfDay(), $now->copy()->endOfDay()];

            case 'month':
                return ['month', $now->copy()->startOfMonth(), $now->copy()->endOfMonth()];

            case 'custom':
                $from = $this->safeDate($request->get('date_from')) ?? $now->copy()->startOfDay();
                $to = $this->safeDate($request->get('date_to')) ?? $now->copy()->endOfDay();

                if ($to->lt($from)) {
                    [$from, $to] = [$to->copy()->startOfDay(), $from->copy()->endOfDay()];
                }

                return ['custom', $from, $to];

            case 'today':
            default:
                return ['today', $now->copy()->startOfDay(), $now->copy()->endOfDay()];
        }
    }

    private function safeDate(?string $value): ?Carbon
    {
        if (! $value) {
            return null;
        }

        try {
            return Carbon::parse($value)->startOfDay();
        } catch (\Throwable) {
            return null;
        }
    }
}
