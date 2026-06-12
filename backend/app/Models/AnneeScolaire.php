<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AnneeScolaire extends Model {
    protected $table = 'annees_scolaires';
    protected $primaryKey = 'idAnneeScolaire';
    protected $fillable = ['libelle', 'dateDebut', 'dateFin'];
    
    public function affectations() {
        return $this->hasMany(Affectation::class, 'idAnneeScolaire', 'idAnneeScolaire');
    }
}
