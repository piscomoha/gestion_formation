<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Affectation extends Model {
    protected $primaryKey = 'idAffectation';
    protected $fillable = ['idAnneeScolaire', 'idFormateur', 'idModule', 'idGroupe'];
    
    public function anneeScolaire() { return $this->belongsTo(AnneeScolaire::class, 'idAnneeScolaire', 'idAnneeScolaire'); }
    public function formateur() { return $this->belongsTo(Formateur::class, 'idFormateur', 'idFormateur'); }
    public function module() { return $this->belongsTo(Module::class, 'idModule', 'idModule'); }
    public function groupe() { return $this->belongsTo(Groupe::class, 'idGroupe', 'idGroupe'); }
    
    public function presences() { return $this->hasMany(Presence::class, 'idAffectation', 'idAffectation'); }
    public function notes() { return $this->hasMany(Note::class, 'idAffectation', 'idAffectation'); }
}