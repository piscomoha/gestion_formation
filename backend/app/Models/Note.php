<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Note extends Model {
    protected $primaryKey = 'idNote';
    protected $fillable = ['idAffectation', 'idStagiaire', 'note', 'dateEvaluation'];
    
    public function affectation() { return $this->belongsTo(Affectation::class, 'idAffectation', 'idAffectation'); }
    public function stagiaire() { return $this->belongsTo(Stagiaire::class, 'idStagiaire', 'idStagiaire'); }
}
