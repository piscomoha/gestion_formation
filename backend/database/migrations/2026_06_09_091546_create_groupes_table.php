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
    Schema::create('groupes', function (Blueprint $table) {
        $table->id('idGroupe');
        $table->string('libelle');
        $table->integer('effectif')->default(0);
        $table->foreignId('idFiliere')->constrained('filieres', 'idFiliere')->onDelete('cascade');
        $table->timestamps();
    });
}   
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('groupes');
    }
};
