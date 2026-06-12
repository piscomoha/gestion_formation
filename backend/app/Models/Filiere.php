<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Filiere extends Model {
    protected $primaryKey = 'idFiliere';
    protected $fillable = ['libelle', 'description'];
    
    public function groupes() {
        return $this->hasMany(Groupe::class, 'idFiliere', 'idFiliere');
    }
}
