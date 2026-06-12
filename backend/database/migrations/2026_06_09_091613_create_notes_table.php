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
    Schema::create('notes', function (Blueprint $table) {
        $table->id('idNote');
        $table->foreignId('idAffectation')->constrained('affectations', 'idAffectation')->onDelete('cascade');
        $table->foreignId('idStagiaire')->constrained('stagiaires', 'idStagiaire')->onDelete('cascade');
        $table->float('note');
        $table->date('dateEvaluation');
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notes');
    }
};
