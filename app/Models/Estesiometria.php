<?php

namespace App\Models;

use App\Models\Concerns\HasAttachments;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Carbon\Carbon;

class Estesiometria extends Model
{
    use HasFactory, HasAttachments;

    protected $table = 'estesiometrias';

    protected $fillable = [
        'clinica',
        'data_exame',
        'nome_completo',
        'data_nascimento',
        'sexo',
        'nome_avaliador',
        'crm_rg',
        'diagnostico',
        'dormencia_formigamento',
        'dificuldade_sentir_objetos',
        'feridas_sem_dor',
        'diagnostico_diabetes_hanseniase',
        'cirurgia_fratura_recente',
        'medicamentos_sistema_nervoso',
        'pontos_pes',
        'pontos_maos',
        'pes_percent_acerto_d',
        'pes_percent_acerto_e',
        'pes_classificacao',
        'maos_percent_acerto_d',
        'maos_percent_acerto_e',
        'maos_classificacao',
        'comentario',
        'assinatura_paciente',
        'pedido_medico',
        'team_id',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'data_nascimento' => 'date',
        'data_exame' => 'date',
        'dormencia_formigamento' => 'boolean',
        'dificuldade_sentir_objetos' => 'boolean',
        'feridas_sem_dor' => 'boolean',
        'diagnostico_diabetes_hanseniase' => 'boolean',
        'cirurgia_fratura_recente' => 'boolean',
        'medicamentos_sistema_nervoso' => 'boolean',
        'pontos_pes' => 'array',
        'pontos_maos' => 'array',
    ];

    protected $appends = [
        'idade',
        'last_modified_by',
    ];

    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function editor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    protected function idade(): Attribute
    {
        return Attribute::make(
            get: function () {
                if (!$this->data_nascimento) {
                    return null;
                }

                $birthDate = Carbon::parse($this->data_nascimento);
                $examDate = $this->data_exame ? Carbon::parse($this->data_exame) : Carbon::now();

                if ($examDate->lt($birthDate)) {
                    return '0 anos';
                }

                $years = $examDate->year - $birthDate->year;

                if ($examDate->month < $birthDate->month ||
                    ($examDate->month == $birthDate->month && $examDate->day < $birthDate->day)) {
                    $years--;
                }

                if ($years < 1) {
                    $months = 0;
                    $tempDate = $birthDate->copy();

                    while ($tempDate->addMonth()->lte($examDate)) {
                        $months++;
                    }

                    return $months . ($months == 1 ? ' mês' : ' meses');
                }

                return $years . ($years == 1 ? ' ano' : ' anos');
            }
        );
    }

    public function getLastModifiedByAttribute(): string
    {
        if ($this->updated_by && $this->editor) {
            return "{$this->updated_at->format('d/m/Y H:i')} por {$this->editor->name}";
        }

        return "{$this->created_at->format('d/m/Y H:i')} por {$this->creator->name}";
    }
}
