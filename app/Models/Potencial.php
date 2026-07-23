<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Carbon\Carbon;

class Potencial extends Model
{
    use HasFactory;

    protected $table = 'potenciais';

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
        
        // Potencial Evocado Auditivo
        'tem_zumbido_ouvido',
        'passou_fonoaudiologo',
        'fonoaudiologo_motivo',
        'passou_otorrino',
        'otorrino_motivo',
        'passa_neurologista',
        'neurologista_motivo',
        'passa_neuropediatra',
        'neuropediatra_motivo',
        'passa_psiquiatra',
        'psiquiatra_motivo',
        'tem_retardo_mental',
        'retardo_mental_grau',
        'tem_paralisia_cerebral',
        'sindrome_down',
        'autismo',
        'cefaleia_enxaqueca',
        'crise_convulsiva',
        'desmaios',
        'dificuldade_fala',
        'deficit_atencao',
        'dificuldade_aprendizado',
        'familiar_perda_auditiva',
        'familiar_perda_auditiva_quem',
        'teste_orelhinha_alterado',
        'gestacao_meses',
        'teve_perda_audicao',
        'perda_audicao_ouvido',
        'teve_infeccao_ouvido',
        'teve_trauma_ouvido',
        'tem_labirintite_tontura_auditivo',
        'tem_hipertensao_auditivo',
        'tem_diabetes_auditivo',
        
        // Potencial Evocado Visual
        'teve_avc',
        'avc_quando',
        'dificuldade_olhar_fixo',
        'tem_diplopia',
        'passou_oftalmologista',
        'oftalmologista_motivo',
        'tem_patologia_olho',
        'patologia_olho_detalhes',
        'usa_oculos',
        'grau_oculos',
        'cefaleia_visual',
        'tem_enxaqueca_visual',
        'incomoda_claridade',
        've_pontinhos_coloridos',
        'tem_alucinacoes_visuais',
        'tem_labirintite_tontura_visual',
        'tem_hipertensao_visual',
        'tem_diabetes_visual',
        
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
        'data_exame' => 'date:Y-m-d',
        'data_nascimento' => 'date:Y-m-d',
        
        // Potencial Evocado Auditivo
        'tem_zumbido_ouvido' => 'boolean',
        'passou_fonoaudiologo' => 'boolean',
        'passou_otorrino' => 'boolean',
        'passa_neurologista' => 'boolean',
        'passa_neuropediatra' => 'boolean',
        'passa_psiquiatra' => 'boolean',
        'tem_retardo_mental' => 'boolean',
        'tem_paralisia_cerebral' => 'boolean',
        'sindrome_down' => 'boolean',
        'autismo' => 'boolean',
        'cefaleia_enxaqueca' => 'boolean',
        'crise_convulsiva' => 'boolean',
        'desmaios' => 'boolean',
        'dificuldade_fala' => 'boolean',
        'deficit_atencao' => 'boolean',
        'dificuldade_aprendizado' => 'boolean',
        'familiar_perda_auditiva' => 'boolean',
        'teste_orelhinha_alterado' => 'boolean',
        'teve_perda_audicao' => 'boolean',
        'teve_infeccao_ouvido' => 'boolean',
        'teve_trauma_ouvido' => 'boolean',
        'tem_labirintite_tontura_auditivo' => 'boolean',
        'tem_hipertensao_auditivo' => 'boolean',
        'tem_diabetes_auditivo' => 'boolean',
        
        // Potencial Evocado Visual
        'teve_avc' => 'boolean',
        'dificuldade_olhar_fixo' => 'boolean',
        'tem_diplopia' => 'boolean',
        'passou_oftalmologista' => 'boolean',
        'tem_patologia_olho' => 'boolean',
        'usa_oculos' => 'boolean',
        'cefaleia_visual' => 'boolean',
        'tem_enxaqueca_visual' => 'boolean',
        'incomoda_claridade' => 'boolean',
        've_pontinhos_coloridos' => 'boolean',
        'tem_alucinacoes_visuais' => 'boolean',
        'tem_labirintite_tontura_visual' => 'boolean',
        'tem_hipertensao_visual' => 'boolean',
        'tem_diabetes_visual' => 'boolean',
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