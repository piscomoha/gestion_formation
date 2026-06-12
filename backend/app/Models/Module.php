<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Module extends Model {
    protected $primaryKey = 'idModule';
    protected $fillable = ['libelle', 'description', 'coefficient'];
    
    public function affectations() {
        return $this->hasMany(Affectation::class, 'idModule', 'idModule');
    }
}
