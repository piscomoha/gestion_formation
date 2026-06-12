<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Note extends Model {
    protected $primaryKey = 'idNote';
    protected $fillable = ['idAffectation', 'idStagiaire', 'note', 'dateEvaluation', 'controle_1', 'controle_2', 'controle_3', 'controle_4', 'controle_5', 'efm'];
    protected $appends = ['note_finale', 'status'];
    
    public function affectation() { return $this->belongsTo(Affectation::class, 'idAffectation', 'idAffectation'); }
    public function stagiaire() { return $this->belongsTo(Stagiaire::class, 'idStagiaire', 'idStagiaire'); }
    
    public function getNoteFinaleAttribute() {
        return $this->note;
    }
    
    public function getStatusAttribute() {
        return 'submitted';
    }
}
