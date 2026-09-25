<?php

namespace App\Models;

use App\Models\Concerns\HasAttachments;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Carbon\Carbon;

class Dinamometro extends Model
{
    use HasFactory, HasAttachments;

    protected $table = 'dinamometros';

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
        'responsavel_menor',
        'diagnostico_principal',
        'indicacao_avaliacao',
        'contextos_clinicos',
        'doencas_cronicas',
        'cirurgias_membro_superior',
        'medicacoes_uso',
        'fisioterapia_recente',
        'lesao_previa_atual',
        'lesao_previa_atual_qual',
        'dor_atual',
        'dor_piora_com_forca',
        'localizacao_dor',
        'neuro_lado_afetado',
        'neuro_espasticidade',
        'neuro_tremor',
        'neuro_dominancia_igual_lado_afetado',
        'neuro_melhor_efeito_medicacao',
        'orto_fase_aguda_lesao',
        'orto_dor_piora_forca',
        'orto_quickdash_score',
        'orto_fase_tratamento',
        'geri_quedas_ultimo_ano',
        'geri_num_medicamentos_dia',
        'geri_fragilidade_fried',
        'geri_classificacao_fragilidade',
        'geri_comprometimento_cognitivo',
        'pedi_dominancia_nao_definida',
        'pedi_paralisia_cerebral_sindrome',
        'pedi_segura_objetos_normalmente',
        'pedi_coopera_teste',
        'pedi_idade_cronologica_vs_desenvolvimento',
        'dormiu_bem',
        'esforco_fisico_24h',
        'dor_desconforto_hoje',
        'consentimento_tcle',
        'tentativas',
        'intervalo_segundos',
        'mao_dominante_t1',
        'mao_dominante_t2',
        'mao_dominante_t3',
        'mao_dominante_media',
        'mao_nao_dominante_t1',
        'mao_nao_dominante_t2',
        'mao_nao_dominante_t3',
        'mao_nao_dominante_media',
        'classificacao',
        'assimetria_percentual',
        'conclusao',
        'conduta',
        'nome_avaliador',
        'crefito_crm',
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
        'contextos_clinicos' => 'array',
        'fisioterapia_recente' => 'boolean',
        'lesao_previa_atual' => 'boolean',
        'dor_piora_com_forca' => 'boolean',
        'neuro_espasticidade' => 'boolean',
        'neuro_tremor' => 'boolean',
        'neuro_dominancia_igual_lado_afetado' => 'boolean',
        'neuro_melhor_efeito_medicacao' => 'boolean',
        'orto_fase_aguda_lesao' => 'boolean',
        'orto_dor_piora_forca' => 'boolean',
        'geri_quedas_ultimo_ano' => 'boolean',
        'geri_comprometimento_cognitivo' => 'boolean',
        'pedi_dominancia_nao_definida' => 'boolean',
        'pedi_paralisia_cerebral_sindrome' => 'boolean',
        'pedi_segura_objetos_normalmente' => 'boolean',
        'pedi_coopera_teste' => 'boolean',
        'dormiu_bem' => 'boolean',
        'esforco_fisico_24h' => 'boolean',
        'dor_desconforto_hoje' => 'boolean',
        'consentimento_tcle' => 'boolean',
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
