<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Formateur extends Model {
    protected $primaryKey = 'idFormateur';
    protected $fillable = ['nom', 'prenom', 'email', 'telephone'];
    
    public function affectations() {
        return $this->hasMany(Affectation::class, 'idFormateur', 'idFormateur');
    }
}