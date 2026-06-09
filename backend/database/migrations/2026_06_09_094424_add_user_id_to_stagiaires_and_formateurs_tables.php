<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
   public function up(): void
{
    Schema::table('stagiaires', function (Blueprint $table) {
        $table->foreignId('user_id')->nullable()->after('idStagiaire')->constrained('users')->onDelete('cascade');
    });

    Schema::table('formateurs', function (Blueprint $table) {
        $table->foreignId('user_id')->nullable()->after('idFormateur')->constrained('users')->onDelete('cascade');
    });
}

public function down(): void
{
    Schema::table('stagiaires', function (Blueprint $table) {
        $table->dropForeign(['user_id']);
        $table->dropColumn('user_id');
    });
    Schema::table('formateurs', function (Blueprint $table) {
        $table->dropForeign(['user_id']);
        $table->dropColumn('user_id');
    });
}
};
