<?php

namespace App\Models;

use App\Models\Concerns\HasAttachments;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Carbon\Carbon;

class RastreioCognitivo extends Model
{
    use HasFactory, HasAttachments;

    protected $table = 'rastreio_cognitivos';

    protected $fillable = [
        'nome_completo',
        'rg_ou_cpf',
        'data_nascimento',
        'sexo',
        'data_exame',
        'pontuacao_visoespacial',
        'pontuacao_nomeacao',
        'pontuacao_atencao',
        'pontuacao_linguagem',
        'pontuacao_abstracao',
        'pontuacao_evocacao_tardia',
        'pontuacao_orientacao',
        'ajuste_escolaridade',
        'pontuacao_total',
        'nome_avaliador',
        'cid',
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
        'ajuste_escolaridade' => 'boolean',
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
