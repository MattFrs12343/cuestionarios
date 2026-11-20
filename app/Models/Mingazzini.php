<?php

namespace App\Models;

use App\Models\Concerns\HasAttachments;
use App\Models\Concerns\UppercasesTextAttributes;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Mingazzini extends Model
{
    use HasAttachments, HasFactory, UppercasesTextAttributes;

    protected $table = 'mingazzinis';

    protected $fillable = [
        'nome_completo',
        'rg_ou_cpf',
        'data_nascimento',
        'sexo',
        'clinica',
        'data_exame',
        'mmii_membro_avaliado',
        'mmii_sustenta_posicao',
        'mmii_queda',
        'mmii_queda_lados',
        'mmii_tremor',
        'mmii_tremor_lados',
        'mmii_assimetria',
        'mmii_assimetria_lado',
        'mmii_interrupcao',
        'mmii_interrupcao_lados',
        'mmii_tempo_direito_segundos',
        'mmii_tempo_esquerdo_segundos',
        'mmii_alteracoes',
        'mmss_sustenta_posicao',
        'mmss_queda_pronacao',
        'mmss_queda_lados',
        'mmss_tremor',
        'mmss_tremor_lados',
        'mmss_assimetria',
        'mmss_assimetria_lado',
        'mmss_desconforto',
        'observacoes',
        'mmss_tempo_direito_segundos',
        'mmss_tempo_esquerdo_segundos',
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
        'mmii_sustenta_posicao' => 'boolean',
        'mmii_queda' => 'boolean',
        'mmii_queda_lados' => 'array',
        'mmii_tremor' => 'boolean',
        'mmii_tremor_lados' => 'array',
        'mmii_assimetria' => 'boolean',
        'mmii_interrupcao' => 'boolean',
        'mmii_interrupcao_lados' => 'array',
        'mmii_tempo_direito_segundos' => 'integer',
        'mmii_tempo_esquerdo_segundos' => 'integer',
        'mmii_alteracoes' => 'array',
        'mmss_sustenta_posicao' => 'boolean',
        'mmss_queda_pronacao' => 'boolean',
        'mmss_queda_lados' => 'array',
        'mmss_tremor' => 'boolean',
        'mmss_tremor_lados' => 'array',
        'mmss_assimetria' => 'boolean',
        'mmss_desconforto' => 'boolean',
        'mmss_tempo_direito_segundos' => 'integer',
        'mmss_tempo_esquerdo_segundos' => 'integer',
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
                if (! $this->data_nascimento) {
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

                    return $months.($months == 1 ? ' mês' : ' meses');
                }

                return $years.($years == 1 ? ' ano' : ' anos');
            }
        );
    }

    public function getLastModifiedByAttribute(): string
    {
        if ($this->updated_by && $this->editor) {
            return "{$this->updated_at->format('d/m/Y H:i')} por {$this->editor->name}";
        }

        if ($this->creator) {
            return "{$this->created_at->format('d/m/Y H:i')} por {$this->creator->name}";
        }

        return $this->created_at->format('d/m/Y H:i');
    }
}
