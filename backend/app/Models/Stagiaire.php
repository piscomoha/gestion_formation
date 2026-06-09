<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Stagiaire extends Model {
    protected $primaryKey = 'idStagiaire';
    protected $fillable = ['nom', 'prenom', 'email', 'telephone', 'idGroupe','user_id'];
    
    public function groupe() {
        return $this->belongsTo(Groupe::class, 'idGroupe', 'idGroupe');
    }
    
    public function presences() {
        return $this->hasMany(Presence::class, 'idStagiaire', 'idStagiaire');
    }
    
    public function notes() {
        return $this->hasMany(Note::class, 'idStagiaire', 'idStagiaire');
    }
     public function user() {
        return $this->belongsTo(User::class, 'user_id');
    }
}
