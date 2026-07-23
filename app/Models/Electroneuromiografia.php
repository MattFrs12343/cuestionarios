<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Carbon\Carbon;

class Electroneuromiografia extends Model
{
    use HasFactory;

    protected $fillable = [
        // Datos básicos
        'nome',
        'data_nascimento',
        'peso',
        'altura',
        'data_exame',
        'rg',
        'sexo',
        'solicitante',
        'clinica',
        'tipos_exame',
        
        // Información adicional
        'primeira_vez_exame',
        'diabetico',
        'diabetico_tratamento',
        'tomando_medicamentos',
        'medicamentos_detalhes',
        'teve_covid',
        'teve_avc',
        'avc_tipo',
        'avc_quando',
        'dor_coluna',
        'areas_coluna',
        'trabalha',
        'tipo_trabalho',
        'teve_fraturas',
        'fraturas_regiao',
        'faz_quimioterapia',
        'faz_radioterapia',
        'faz_hemodialise',
        'tem_marcapasso',
        'processo_infeccioso',
        'processo_infeccioso_detalhes',
        'consome_alcool',
        'alcool_frequencia',
        'usa_drogas',
        'drogas_quais',
        
        // Membros Superiores
        'ms_dor_bracos',
        'ms_dor_comeca_ombros',
        'ms_dor_maos',
        'ms_dor_mais_de',
        'ms_formigamento_bracos',
        'ms_formigamento_comeca_ombros',
        'ms_formigamento_maos',
        'ms_dormencia_bracos',
        'ms_dormencia_comeca_ombros',
        'ms_dormencia_maos',
        'ms_tremores_bracos',
        'ms_tremores_maos',
        'ms_polegar_treme',
        'ms_fraqueza_bracos',
        'ms_fraqueza_maos',
        'ms_fadiga_falar',
        'ms_perda_peso',
        'ms_queimacao',
        'ms_caibra',
        'ms_membro_mais_afetado',
        
        // Membros Inferiores
        'mi_dor_pernas',
        'mi_dor_comeca_bacia',
        'mi_dor_ciatico',
        'mi_dor_pes',
        'mi_formigamento_pernas',
        'mi_formigamento_comeca_bacia',
        'mi_formigamento_pes',
        'mi_dormencia_pernas',
        'mi_dormencia_comeca_bacia',
        'mi_dormencia_pes',
        'mi_tremores_pernas',
        'mi_tremores_pes',
        'mi_fraqueza_pernas',
        'mi_fraqueza_pes',
        'mi_fraqueza_ascendente',
        'mi_fadiga_falar',
        'mi_perda_peso',
        'mi_queimacao',
        'mi_caibra',
        'mi_membro_mais_afetado',
        
        // Especialistas
        'consultou_reumatologista',
        'reumatologista_motivo',
        'consultou_neurologista',
        'neurologista_motivo',
        'consultou_neurocirurgiao',
        'neurocirurgiao_motivo',
        'consultou_dermatologista',
        'dermatologista_motivo',
        'consultou_geriatra',
        'geriatra_motivo',
        'consultou_ortopedista',
        'ortopedista_motivo',
        
        // Observaciones
        'observacoes',
        
        // Archivos
        'assinatura_paciente',
        'pedido_medico',
        
        // Relaciones
        'team_id',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'data_exame' => 'date',
        'data_nascimento' => 'date',
        'tipos_exame' => 'array',
        'areas_coluna' => 'array',
        
        // Información adicional
        'primeira_vez_exame' => 'boolean',
        'diabetico' => 'boolean',
        'diabetico_tratamento' => 'boolean',
        'tomando_medicamentos' => 'boolean',
        'teve_covid' => 'boolean',
        'teve_avc' => 'boolean',
        'dor_coluna' => 'boolean',
        'trabalha' => 'boolean',
        'teve_fraturas' => 'boolean',
        'faz_quimioterapia' => 'boolean',
        'faz_radioterapia' => 'boolean',
        'faz_hemodialise' => 'boolean',
        'tem_marcapasso' => 'boolean',
        'processo_infeccioso' => 'boolean',
        'consome_alcool' => 'boolean',
        'usa_drogas' => 'boolean',
        
        // Membros Superiores
        'ms_dor_bracos' => 'boolean',
        'ms_dor_comeca_ombros' => 'boolean',
        'ms_dor_maos' => 'boolean',
        'ms_formigamento_bracos' => 'boolean',
        'ms_formigamento_comeca_ombros' => 'boolean',
        'ms_formigamento_maos' => 'boolean',
        'ms_dormencia_bracos' => 'boolean',
        'ms_dormencia_comeca_ombros' => 'boolean',
        'ms_dormencia_maos' => 'boolean',
        'ms_tremores_bracos' => 'boolean',
        'ms_tremores_maos' => 'boolean',
        'ms_polegar_treme' => 'boolean',
        'ms_fraqueza_bracos' => 'boolean',
        'ms_fraqueza_maos' => 'boolean',
        'ms_fadiga_falar' => 'boolean',
        'ms_perda_peso' => 'boolean',
        'ms_queimacao' => 'boolean',
        'ms_caibra' => 'boolean',
        
        // Membros Inferiores
        'mi_dor_pernas' => 'boolean',
        'mi_dor_comeca_bacia' => 'boolean',
        'mi_dor_ciatico' => 'boolean',
        'mi_dor_pes' => 'boolean',
        'mi_formigamento_pernas' => 'boolean',
        'mi_formigamento_comeca_bacia' => 'boolean',
        'mi_formigamento_pes' => 'boolean',
        'mi_dormencia_pernas' => 'boolean',
        'mi_dormencia_comeca_bacia' => 'boolean',
        'mi_dormencia_pes' => 'boolean',
        'mi_tremores_pernas' => 'boolean',
        'mi_tremores_pes' => 'boolean',
        'mi_fraqueza_pernas' => 'boolean',
        'mi_fraqueza_pes' => 'boolean',
        'mi_fraqueza_ascendente' => 'boolean',
        'mi_fadiga_falar' => 'boolean',
        'mi_perda_peso' => 'boolean',
        'mi_queimacao' => 'boolean',
        'mi_caibra' => 'boolean',
        
        // Especialistas
        'consultou_reumatologista' => 'boolean',
        'consultou_neurologista' => 'boolean',
        'consultou_neurocirurgiao' => 'boolean',
        'consultou_dermatologista' => 'boolean',
        'consultou_geriatra' => 'boolean',
        'consultou_ortopedista' => 'boolean',
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
                
                // Asegurar que la fecha del examen sea posterior a la fecha de nacimiento
                if ($examDate->lt($birthDate)) {
                    return '0 anos';
                }
                
                // Calcular años usando diferencia de años
                $years = $examDate->year - $birthDate->year;
                
                // Ajustar si el cumpleaños aún no ha pasado en el año del examen
                if ($examDate->month < $birthDate->month || 
                    ($examDate->month == $birthDate->month && $examDate->day < $birthDate->day)) {
                    $years--;
                }
                
                if ($years < 1) {
                    // Si es menor de 1 año, calcular meses
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