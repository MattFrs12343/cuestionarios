<?php

namespace App\Models;

use App\Models\Concerns\HasAttachments;
use App\Models\Concerns\UppercasesTextAttributes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Carbon\Carbon;

class DinamometriaMmii extends Model
{
    use HasFactory, HasAttachments, UppercasesTextAttributes;

    protected $table = 'dinamometria_mmiis';

    protected $fillable = [
        'clinica',
        'data_exame',
        'nome_completo',
        'data_nascimento',
        'sexo',
        'peso',
        'altura',
        'dominancia',
        'profissao',
        'indicacao_clinica',

        'fraqueza_muscular',
        'fraqueza_lado',
        'fraqueza_tipo',
        'dificuldade_atividades',
        'fadiga_muscular',
        'dor_membros',
        'dor_localizacao',
        'dor_eva',
        'parestesias',
        'parestesias_localizacao',
        'dor_neuropatica',
        'caimbras',
        'tremores',
        'rigidez_muscular',
        'alteracao_equilibrio',
        'quedas_6meses',
        'quedas_quantidade',
        'dispositivo_auxiliar',
        'dispositivo_auxiliar_outro',

        'antecedentes_clinicos',
        'antecedentes_outra',

        'seguranca_teste',
        'seguranca_observacoes',

        'tono_mid',
        'tono_mie',
        'forca_mrc',

        'posicao_protocolo',
        'unidade',
        'unidade_outra',
        'dinamometria',
        'valor_analise',
        'valor_analise_outro',
        'tempo_sustentacao_segundos',
        'assimetria_global_pct',
        'intercorrencias_teste',

        'impressao_funcional',
        'observacoes_correlacao',
        'modelo_conclusao',
        'maior_assimetria_pct',
        'maior_assimetria_movimento',
        'menor_forca_lado',
        'comportamento_teste',
        'conclusao_final',
        'examinador',
        'crm_registro',

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
        'fraqueza_muscular' => 'boolean',
        'fraqueza_tipo' => 'array',
        'dificuldade_atividades' => 'array',
        'fadiga_muscular' => 'boolean',
        'dor_membros' => 'boolean',
        'parestesias' => 'boolean',
        'dor_neuropatica' => 'boolean',
        'caimbras' => 'boolean',
        'tremores' => 'boolean',
        'rigidez_muscular' => 'boolean',
        'alteracao_equilibrio' => 'boolean',
        'quedas_6meses' => 'boolean',
        'antecedentes_clinicos' => 'array',
        'seguranca_teste' => 'array',
        'forca_mrc' => 'array',
        'dinamometria' => 'array',
        'intercorrencias_teste' => 'array',
        'impressao_funcional' => 'array',
        'comportamento_teste' => 'array',
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

        if ($this->creator) {
            return "{$this->created_at->format('d/m/Y H:i')} por {$this->creator->name}";
        }

        return $this->created_at->format('d/m/Y H:i');
    }
}
