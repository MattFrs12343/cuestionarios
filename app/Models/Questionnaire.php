<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Carbon\Carbon;

class Questionnaire extends Model
{
    use HasFactory;

    protected $fillable = [
        'clinica',
        'data_exame',
        'nome_completo',
        'data_nascimento',
        'sexo',
        'rg_ou_cpf',
        'teve_covid',
        'teve_desmaio',
        'ja_teve_avc',
        'quando_teve_avc',
        'ja_teve_convulsao',
        'quando_teve_convulsao',
        'ja_bateu_cabeca',
        'tem_dor_cabeca',
        'tem_depressao',
        'tem_ansiedade',
        'tem_insonia',
        'tem_esquecimento',
        'tem_alzheimer',
        'tem_parkinson',
        'hipertensao',
        'hipertensao_faz_uso',
        'diabetes',
        'diabetes_faz_uso',
        'tem_dificuldade_aprendizado',
        'hiperativo',
        'agressivo',
        'autismo',
        'tem_dificuldade_dormir',
        'nome_profissional_pedido',
        'nome_tecnico_medico_exame',
        'momento_exame',
        'comentario',
        'assinatura_paciente',
        'pedido_medico',
        'team_id',
        'tipo_exame',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'data_exame' => 'date',
        'data_nascimento' => 'date',
        'teve_covid' => 'boolean',
        'teve_desmaio' => 'boolean',
        'ja_teve_avc' => 'boolean',
        'ja_teve_convulsao' => 'boolean',
        'ja_bateu_cabeca' => 'boolean',
        'tem_dor_cabeca' => 'boolean',
        'tem_depressao' => 'boolean',
        'tem_ansiedade' => 'boolean',
        'tem_insonia' => 'boolean',
        'tem_esquecimento' => 'boolean',
        'tem_alzheimer' => 'boolean',
        'tem_parkinson' => 'boolean',
        'hipertensao' => 'boolean',
        'diabetes' => 'boolean',
        'tem_dificuldade_aprendizado' => 'boolean',
        'hiperativo' => 'boolean',
        'agressivo' => 'boolean',
        'autismo' => 'boolean',
        'tem_dificuldade_dormir' => 'boolean',
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
