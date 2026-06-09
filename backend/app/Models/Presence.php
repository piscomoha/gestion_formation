<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Presence extends Model {
    protected $primaryKey = 'idPresence';
    protected $fillable = ['idAffectation', 'idStagiaire', 'dateSeance', 'statut'];
    
    public function affectation() { return $this->belongsTo(Affectation::class, 'idAffectation', 'idAffectation'); }
    public function stagiaire() { return $this->belongsTo(Stagiaire::class, 'idStagiaire', 'idStagiaire'); }
}
