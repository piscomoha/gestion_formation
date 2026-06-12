<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Presence extends Model {
    protected $primaryKey = 'idPresence';
    protected $fillable = ['idAffectation', 'idStagiaire', 'dateSeance', 'statut', 'heureSeance', 'remarque'];
    protected $appends = ['heureSeance', 'remarque'];
    
    public function affectation() { return $this->belongsTo(Affectation::class, 'idAffectation', 'idAffectation'); }
    public function stagiaire() { return $this->belongsTo(Stagiaire::class, 'idStagiaire', 'idStagiaire'); }
    
    public function getHeureSeanceAttribute() {
        return null;
    }
    
    public function getRemarqueAttribute() {
        if ($this->statut === 'Justifie') {
            return 'Justifié';
        }
        return null;
    }
    
    public function getStatutAttribute($value) {
        if ($value === 'Present') return 'PRESENT';
        if ($value === 'Absent') return 'ABSENT';
        return $value;
    }
}
