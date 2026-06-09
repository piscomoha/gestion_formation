<?php
use App\Http\Controllers\FiliereController;
use App\Http\Controllers\GroupeController;
use App\Http\Controllers\StagiaireController;
use App\Http\Controllers\AffectationController;
use App\Http\Controllers\PresenceController;
use App\Http\Controllers\NoteController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\FormateurController;
use App\Http\Controllers\AnneeScolaireController;
use App\Http\Controllers\ModuleController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;


Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Routes محمية (تحتاج تسجيل دخول)
Route::middleware('auth:sanctum')->group(function () {
    
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Routes خاصة بالـ Admin فقط
    Route::middleware('role:admin')->group(function () {
        Route::apiResource('stagiaires', StagiaireController::class);
        Route::apiResource('formateurs', FormateurController::class);
        // أي Route أخرى خاصة بالإدارة
    });

    // Routes خاصة بالـ Formateur فقط
    Route::middleware('role:formateur')->group(function () {
        Route::get('/mes-groupes', [FormateurController::class, 'mesGroupes']);
        // Routes أخرى للمكون
    });

    // Routes خاصة بالـ Stagiaire فقط
    Route::middleware('role:stagiaire')->group(function () {
        Route::get('/mes-notes', [StagiaireController::class, 'mesNotes']);
        // Routes أخرى للمتدرب
    });
});


Route::middleware('role:admin')->group(function () {
    Route::apiResource('stagiaires', StagiaireController::class);
    // Route جديد
    Route::get('groupes/{groupeId}/stagiaires', [StagiaireController::class, 'getByGroupe']);
});

// Route للـ Formateur باش يشوف المتدربين ديالو
Route::middleware('role:formateur')->group(function () {
    Route::get('mes-groupes/{groupeId}/stagiaires', [StagiaireController::class, 'getByGroupe']);
});




Route::middleware('role:admin')->group(function () {
    // ... Stagiaires
    Route::apiResource('formateurs', FormateurController::class);
    Route::apiResource('groupes', GroupeController::class);
    Route::apiResource('filieres', FiliereController::class);
});

// للـ Formateur باش يشوف المجموعات ديالو
Route::middleware('role:formateur')->group(function () {
    Route::get('groupes', [GroupeController::class, 'index']);
    Route::get('groupes/{id}', [GroupeController::class, 'show']);
});

// للـ Stagiaire باش يشوف المجموعة ديالو
Route::middleware('role:stagiaire')->group(function () {
    Route::get('mon-groupe', function() {
        $stagiaire = \App\Models\Stagiaire::where('user_id', Auth::id())->first();
        if(!$stagiaire) return response()->json(['message' => 'Aucun groupe assigné.'], 404);
        return response()->json(['status' => 'success', 'data' => $stagiaire->groupe]);
    });
});


// 1. Routes Admin (CRUD complet)
Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
    // ... باقي الـ routes (stagiaires, formateurs, groupes, filieres)
    
    Route::apiResource('affectations', AffectationController::class)->except(['update']); // update rarement utilisé pour affectation
});

// 2. Routes Formateur (يشوف فقط المجموعات والمواد اللي كيقري)
Route::middleware(['auth:sanctum', 'role:formateur'])->group(function () {
    Route::get('mes-affectations', [AffectationController::class, 'getMesAffectations']);
    Route::get('affectations/{id}', [AffectationController::class, 'show']); // باش يشوف لائحة التلاميذ ديالو
});

// 3. Routes Stagiaire (يشوف فقط المواد والمكونين ديال مجموعتو)
Route::middleware(['auth:sanctum', 'role:stagiaire'])->group(function () {
    Route::get('mes-cours', function() {
        $user = Auth::user();
        $stagiaire = \App\Models\Stagiaire::where('user_id', $user->id)->first();
        
        if (!$stagiaire) {
            return response()->json(['status' => 'error', 'message' => 'Aucun groupe assigné.'], 404);
        }

        $affectations = \App\Models\Affectation::where('idGroupe', $stagiaire->idGroupe)
            ->with(['formateur', 'module', 'anneeScolaire'])
            ->get();
            
        return response()->json([
            'status' => 'success', 
            'message' => 'Liste de vos cours récupérée avec succès.',
            'data' => $affectations
        ], 200);
    });
});


Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
    // ... باقي الـ routes اللي درنا قبل
    
    Route::apiResource('annees-scolaires', AnneeScolaireController::class);
    Route::apiResource('modules', ModuleController::class);
});

// السماح للـ Formateur و Stagiaire بقائمة المواد فقط (للعرض)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('modules', [ModuleController::class, 'index']);
    Route::get('annees-scolaires', [AnneeScolaireController::class, 'index']);
});

// 1. Routes Admin (تقدر دير كلشي)
Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
    Route::get('presences/affectation/{idAffectation}', [PresenceController::class, 'getParAffectation']);
    Route::get('presences/stagiaire/{idStagiaire}', [PresenceController::class, 'getParStagiaire']);
    Route::delete('presences/seance', [PresenceController::class, 'supprimerSeance']);
});

// 2. Routes Formateur (كيدير الغياب ويشوف تاريخ ديالو)
Route::middleware(['auth:sanctum', 'role:formateur'])->group(function () {
    Route::post('presences/appel', [PresenceController::class, 'enregistrerAppel']);
    Route::put('presences/appel', [PresenceController::class, 'modifierAppel']);
    Route::get('presences/affectation/{idAffectation}', [PresenceController::class, 'getParAffectation']);
    Route::delete('presences/seance', [PresenceController::class, 'supprimerSeance']);
});

// 3. Routes Stagiaire (غير يشوف الحضور ديالو)
Route::middleware(['auth:sanctum', 'role:stagiaire'])->group(function () {
    Route::get('mes-presences', [PresenceController::class, 'mesPresences']);
});

// 1. Routes Admin
Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
    Route::get('notes/affectation/{idAffectation}', [NoteController::class, 'getParAffectation']);
    Route::get('notes/stagiaire/{idStagiaire}', [NoteController::class, 'getParStagiaire']);
    Route::delete('notes/evaluation', [NoteController::class, 'supprimerEvaluation']);
});

// 2. Routes Formateur (يحط النقط ويشوف النتائج)
Route::middleware(['auth:sanctum', 'role:formateur'])->group(function () {
    Route::post('notes', [NoteController::class, 'enregistrerNotes']);
    Route::put('notes', [NoteController::class, 'modifierNotes']);
    Route::get('notes/affectation/{idAffectation}', [NoteController::class, 'getParAffectation']);
    Route::delete('notes/evaluation', [NoteController::class, 'supprimerEvaluation']);
});

// 3. Routes Stagiaire (يشوف نقطو فقط)
Route::middleware(['auth:sanctum', 'role:stagiaire'])->group(function () {
    Route::get('mes-notes', [NoteController::class, 'mesNotes']);
});


Route::apiResource('filieres', FiliereController::class);
Route::apiResource('groupes', GroupeController::class);
Route::apiResource('stagiaires', StagiaireController::class);
Route::apiResource('affectations', AffectationController::class);
Route::apiResource('presences', PresenceController::class);
Route::apiResource('notes', NoteController::class);