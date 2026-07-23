<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Carbon\Carbon;

class EletroneuromiografiaFacial extends Model
{
    use HasFactory;

    protected $table = 'eletroneuromiografia_facial';

    protected $fillable = [
        'nome',
        'data_nascimento',
        'idade',
        'peso',
        'altura',
        'data_exame',
        'rg',
        'solicitante',
        'clinica',
        'sexo',
        'tem_dor_testa',
        'tem_dor_olhos',
        'dor_olhos_lado',
        'tem_dor_mandibula',
        'tem_dor_dentes_agua_gelada',
        'tem_espasmos_face',
        'espasmos_face_parte',
        'aplicou_botox',
        'botox_parte_face',
        'tem_implante_dentario',
        'tem_dores_apos_implante',
        'teve_paralisia_facial',
        'paralisia_facial_vezes',
        'tem_parte_face_paralisada',
        'parte_face_paralisada_qual',
        'tem_enxaqueca',
        'consegue_sorrir_normalmente',
        'pode_comer_normalmente',
        'pode_assoviar',
        'consegue_encher_bexiga',
        'tem_infeccao_ouvido_repetidamente',
        'diabetico',
        'toma_medicamento',
        'medicamentos',
        'assinatura_paciente',
        'pedido_medico',
        'team_id',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'data_nascimento' => 'date',
        'data_exame' => 'date',
        'peso' => 'decimal:2',
        'altura' => 'decimal:2',
        'tem_dor_testa' => 'boolean',
        'tem_dor_olhos' => 'boolean',
        'tem_dor_mandibula' => 'boolean',
        'tem_dor_dentes_agua_gelada' => 'boolean',
        'tem_espasmos_face' => 'boolean',
        'aplicou_botox' => 'boolean',
        'tem_implante_dentario' => 'boolean',
        'tem_dores_apos_implante' => 'boolean',
        'teve_paralisia_facial' => 'boolean',
        'tem_parte_face_paralisada' => 'boolean',
        'tem_enxaqueca' => 'boolean',
        'consegue_sorrir_normalmente' => 'boolean',
        'pode_comer_normalmente' => 'boolean',
        'pode_assoviar' => 'boolean',
        'consegue_encher_bexiga' => 'boolean',
        'tem_infeccao_ouvido_repetidamente' => 'boolean',
        'diabetico' => 'boolean',
        'toma_medicamento' => 'boolean',
    ];

    protected $appends = [
        'idade_calculada',
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

    protected function idadeCalculada(): Attribute
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
