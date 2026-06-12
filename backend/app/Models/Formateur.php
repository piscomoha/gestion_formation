<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Formateur extends Model {
    protected $primaryKey = 'idFormateur';
    protected $fillable = ['nom', 'prenom', 'email', 'telephone', 'specialite', 'user_id'];
    
    public function affectations() {
        return $this->hasMany(Affectation::class, 'idFormateur', 'idFormateur');
    }

    public function user() {
        return $this->belongsTo(User::class, 'user_id');
    }
}
