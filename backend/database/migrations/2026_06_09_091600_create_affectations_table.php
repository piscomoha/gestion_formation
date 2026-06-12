<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
 public function up(): void {
    Schema::create('affectations', function (Blueprint $table) {
        $table->id('idAffectation');
        $table->foreignId('idAnneeScolaire')->constrained('annees_scolaires', 'idAnneeScolaire')->onDelete('cascade');
        $table->foreignId('idFormateur')->constrained('formateurs', 'idFormateur')->onDelete('cascade');
        $table->foreignId('idModule')->constrained('modules', 'idModule')->onDelete('cascade');
        $table->foreignId('idGroupe')->constrained('groupes', 'idGroupe')->onDelete('cascade');
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('affectations');
    }
};
