<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Groupe extends Model {
    protected $primaryKey = 'idGroupe';
    protected $fillable = ['libelle', 'effectif', 'idFiliere'];
    
    public function filiere() {
        return $this->belongsTo(Filiere::class, 'idFiliere', 'idFiliere');
    }
    
    public function stagiaires() {
        return $this->hasMany(Stagiaire::class, 'idGroupe', 'idGroupe');
    }
    
    public function affectations() {
        return $this->hasMany(Affectation::class, 'idGroupe', 'idGroupe');
    }
}