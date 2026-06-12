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
use App\Http\Controllers\DashboardController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected routes (require authentication)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', function (Request $request) {
        return response()->json([
            'status' => 'success',
            'data' => $request->user()
        ]);
    });

    // Admin-only routes (full CRUD)
    Route::middleware('role:admin')->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'index']);
        Route::post('formateurs/generate-fake', [FormateurController::class, 'generateFake']);
        Route::get('stagiaires/export', [StagiaireController::class, 'exportCsv']);
        Route::post('stagiaires/import', [StagiaireController::class, 'importCsv']);
        
        Route::apiResource('filieres', FiliereController::class);
        Route::apiResource('groupes', GroupeController::class);
        Route::apiResource('annees-scolaires', AnneeScolaireController::class);
        Route::apiResource('modules', ModuleController::class);
        Route::apiResource('formateurs', FormateurController::class);
        Route::apiResource('stagiaires', StagiaireController::class);
        Route::apiResource('affectations', AffectationController::class);
        Route::apiResource('presences', PresenceController::class);
        Route::apiResource('notes', NoteController::class);

        Route::get('groupes/{groupeId}/stagiaires', [StagiaireController::class, 'getByGroupe']);
        Route::get('presences/affectation/{idAffectation}', [PresenceController::class, 'getParAffectation']);
        Route::get('presences/stagiaire/{idStagiaire}', [PresenceController::class, 'getParStagiaire']);
        Route::delete('presences/seance', [PresenceController::class, 'supprimerSeance']);
        Route::get('notes/affectation/{idAffectation}', [NoteController::class, 'getParAffectation']);
        Route::get('notes/stagiaire/{idStagiaire}', [NoteController::class, 'getParStagiaire']);
        Route::delete('notes/evaluation', [NoteController::class, 'supprimerEvaluation']);
        
        Route::get('/admin/stagiaires', function (Request $request) {
            $query = \App\Models\Stagiaire::query()->with(['groupe.filiere']);

            if ($request->filled('idGroupe')) {
                $query->where('idGroupe', $request->input('idGroupe'));
            }

            if ($request->filled('idFiliere')) {
                $idFiliere = $request->input('idFiliere');
                $query->whereHas('groupe', function ($q) use ($idFiliere) {
                    $q->where('idFiliere', $idFiliere);
                });
            }

            if ($request->filled('search')) {
                $search = $request->input('search');
                $query->where(function ($q) use ($search) {
                    $q->where('nom', 'like', "%{$search}%")
                        ->orWhere('prenom', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            }

            return response()->json(['status' => 'success', 'data' => $query->get()]);
        });

        Route::get('/admin/note-sheets', function (Request $request) {
            $query = \App\Models\Note::query()->with(['stagiaire', 'affectation.groupe', 'affectation.module', 'affectation.anneeScolaire']);

            if ($request->filled('idGroupe')) {
                $idGroupe = $request->input('idGroupe');
                $query->whereHas('affectation', function ($q) use ($idGroupe) {
                    $q->where('idGroupe', $idGroupe);
                });
            }

            if ($request->filled('idFiliere')) {
                $idFiliere = $request->input('idFiliere');
                $query->whereHas('affectation.groupe', function ($q) use ($idFiliere) {
                    $q->where('idFiliere', $idFiliere);
                });
            }

            if ($request->filled('annee_id')) {
                $anneeId = $request->input('annee_id');
                $query->whereHas('affectation', function ($q) use ($anneeId) {
                    $q->where('idAnneeScolaire', $anneeId);
                });
            }

            $notes = $query->orderByDesc('dateEvaluation')->get()->map(function ($note) {
                $note->setAttribute('note_finale', $note->note);
                $note->setAttribute('status', 'submitted');
                return $note;
            });

            return response()->json(['status' => 'success', 'data' => $notes]);
        });

        Route::post('/admin/note-sheets/{idAffectation}/validate', function ($idAffectation) {
            return response()->json(['status' => 'success', 'data' => ['idAffectation' => (int)$idAffectation, 'status' => 'validated']]);
        });

        Route::post('/admin/note-sheets/{idAffectation}/devalidate', function ($idAffectation) {
            return response()->json(['status' => 'success', 'data' => ['idAffectation' => (int)$idAffectation, 'status' => 'submitted']]);
        });

        Route::get('/admin/presence-sessions', function (Request $request) {
            $query = \App\Models\Presence::query()->with(['stagiaire', 'affectation.groupe', 'affectation.module', 'affectation.anneeScolaire']);

            if ($request->filled('idGroupe')) {
                $idGroupe = $request->input('idGroupe');
                $query->whereHas('affectation', function ($q) use ($idGroupe) {
                    $q->where('idGroupe', $idGroupe);
                });
            }

            if ($request->filled('idFiliere')) {
                $idFiliere = $request->input('idFiliere');
                $query->whereHas('affectation.groupe', function ($q) use ($idFiliere) {
                    $q->where('idFiliere', $idFiliere);
                });
            }

            if ($request->filled('annee_id')) {
                $anneeId = $request->input('annee_id');
                $query->whereHas('affectation', function ($q) use ($anneeId) {
                    $q->where('idAnneeScolaire', $anneeId);
                });
            }

            $presences = $query->orderByDesc('dateSeance')->get()->map(function ($presence) {
                $statut = (string) $presence->statut;
                if ($statut === 'Present') $presence->statut = 'PRESENT';
                if ($statut === 'Absent') $presence->statut = 'ABSENT';
                if ($statut === 'Justifie') {
                    $presence->statut = 'ABSENT';
                    $presence->setAttribute('remarque', 'Justifié');
                }
                $presence->setAttribute('heureSeance', null);
                return $presence;
            });

            return response()->json(['status' => 'success', 'data' => $presences]);
        });

        Route::post('/admin/import-stagiaires', [StagiaireController::class, 'importCsv']);
    });

    // Formateur-only routes
    Route::middleware('role:formateur')->group(function () {
        Route::get('/mes-groupes', [FormateurController::class, 'mesGroupes']);
        Route::get('/formateur/stats', [FormateurController::class, 'stats']);
        Route::get('mes-groupes/{groupeId}/stagiaires', [StagiaireController::class, 'getByGroupe']);
        Route::get('groupes', [GroupeController::class, 'index']);
        Route::get('groupes/{id}', [GroupeController::class, 'show']);
        Route::get('mes-affectations', [AffectationController::class, 'getMesAffectations']);
        Route::get('affectations/{id}', [AffectationController::class, 'show']);
        Route::post('presences/appel', [PresenceController::class, 'enregistrerAppel']);
        Route::put('presences/appel', [PresenceController::class, 'modifierAppel']);
        Route::get('presences/affectation/{idAffectation}', [PresenceController::class, 'getParAffectation']);
        Route::delete('presences/seance', [PresenceController::class, 'supprimerSeance']);
        Route::post('notes', [NoteController::class, 'enregistrerNotes']);
        Route::put('notes', [NoteController::class, 'modifierNotes']);
        Route::get('notes/affectation/{idAffectation}', [NoteController::class, 'getParAffectation']);
        Route::delete('notes/evaluation', [NoteController::class, 'supprimerEvaluation']);
        
        Route::get('/formateur/workspace', function (Request $request) {
            $user = $request->user();
            $formateur = \App\Models\Formateur::where('user_id', $user->id)->first();

            if (!$formateur) {
                return response()->json(['status' => 'error', 'message' => 'Profil formateur introuvable.'], 404);
            }

            $affectationsQuery = \App\Models\Affectation::query()
                ->where('idFormateur', $formateur->idFormateur)
                ->with(['groupe.filiere', 'module', 'anneeScolaire']);

            if ($request->filled('annee_id')) {
                $affectationsQuery->where('idAnneeScolaire', $request->input('annee_id'));
            }

            $affectations = $affectationsQuery->get();

            $groupIds = $affectations->pluck('idGroupe')->unique()->values();
            $stagiairesQuery = \App\Models\Stagiaire::query()->whereIn('idGroupe', $groupIds)->with('groupe');

            if ($request->filled('search')) {
                $search = $request->input('search');
                $stagiairesQuery->where(function ($q) use ($search) {
                    $q->where('nom', 'like', "%{$search}%")
                        ->orWhere('prenom', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            }

            return response()->json([
                'status' => 'success',
                'data' => [
                    'formateur' => $formateur,
                    'affectations' => $affectations,
                    'stagiaires' => $stagiairesQuery->get(),
                ],
            ]);
        });

        Route::post('/formateur/note-sheets', function (Request $request) {
            $payload = $request->all();
            $payload['notes'] = array_map(function ($line) {
                $idStagiaire = $line['idStagiaire'] ?? null;
                $note = $line['note'] ?? null;

                if (!is_numeric($note)) {
                    $numbers = [];
                    foreach (['controle_1', 'controle_2', 'controle_3', 'controle_4', 'controle_5', 'efm', 'note_finale'] as $field) {
                        if (isset($line[$field]) && is_numeric($line[$field])) {
                            $numbers[] = (float) $line[$field];
                        }
                    }
                    $note = count($numbers) > 0 ? array_sum($numbers) / count($numbers) : 0;
                }

                return ['idStagiaire' => $idStagiaire, 'note' => (float) $note];
            }, $payload['notes'] ?? []);

            $request->replace($payload);
            return app(NoteController::class)->enregistrerNotes($request);
        });

        Route::post('/formateur/presence-sessions', function (Request $request) {
            $payload = $request->all();
            $payload['presences'] = array_map(function ($line) {
                $statut = $line['statut'] ?? 'PRESENT';
                if ($statut === 'PRESENT') $statut = 'Present';
                if ($statut === 'ABSENT') $statut = 'Absent';
                if ($statut === 'RETARD') $statut = 'Present';
                return ['idStagiaire' => $line['idStagiaire'] ?? null, 'statut' => $statut];
            }, $payload['presences'] ?? []);

            $request->replace($payload);
            return app(PresenceController::class)->enregistrerAppel($request);
        });
    });

    // Stagiaire-only routes
    Route::middleware('role:stagiaire')->group(function () {
        Route::get('/mes-notes', [StagiaireController::class, 'mesNotes']);
        Route::get('mon-groupe', function() {
            $stagiaire = \App\Models\Stagiaire::where('user_id', Auth::id())->first();
            if(!$stagiaire) return response()->json(['message' => 'Aucun groupe assigné.'], 404);
            return response()->json(['status' => 'success', 'data' => $stagiaire->groupe]);
        });
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
        Route::get('mes-presences', [PresenceController::class, 'mesPresences']);
        
        Route::get('/stagiaire/bulletin', function (Request $request) {
            $user = $request->user();
            $stagiaire = \App\Models\Stagiaire::where('user_id', $user->id)->first();

            if (!$stagiaire) {
                return response()->json(['status' => 'error', 'message' => 'Profil stagiaire introuvable.'], 404);
            }

            $query = \App\Models\Note::query()
                ->where('idStagiaire', $stagiaire->idStagiaire)
                ->with(['affectation.module', 'affectation.anneeScolaire']);

            if ($request->filled('annee_id')) {
                $anneeId = $request->input('annee_id');
                $query->whereHas('affectation', function ($q) use ($anneeId) {
                    $q->where('idAnneeScolaire', $anneeId);
                });
            }

            $notes = $query->orderByDesc('dateEvaluation')->get()->map(function ($note) {
                $note->setAttribute('note_finale', $note->note);
                $note->setAttribute('status', 'validated');
                return $note;
            });

            return response()->json([
                'status' => 'success',
                'data' => [
                    'stagiaire' => $stagiaire,
                    'notes' => $notes,
                ],
            ]);
        });

        Route::get('/stagiaire/presences', function (Request $request) {
            $user = $request->user();
            $stagiaire = \App\Models\Stagiaire::where('user_id', $user->id)->first();

            if (!$stagiaire) {
                return response()->json(['status' => 'error', 'message' => 'Profil stagiaire introuvable.'], 404);
            }

            $query = \App\Models\Presence::query()
                ->where('idStagiaire', $stagiaire->idStagiaire)
                ->with(['affectation.module', 'affectation.anneeScolaire']);

            if ($request->filled('annee_id')) {
                $anneeId = $request->input('annee_id');
                $query->whereHas('affectation', function ($q) use ($anneeId) {
                    $q->where('idAnneeScolaire', $anneeId);
                });
            }

            $presences = $query->orderByDesc('dateSeance')->get()->map(function ($presence) {
                $statut = (string) $presence->statut;
                if ($statut === 'Present') $presence->statut = 'PRESENT';
                if ($statut === 'Absent') $presence->statut = 'ABSENT';
                if ($statut === 'Justifie') {
                    $presence->statut = 'ABSENT';
                    $presence->setAttribute('remarque', 'Justifié');
                }
                $presence->setAttribute('heureSeance', null);
                return $presence;
            });

            return response()->json([
                'status' => 'success',
                'data' => [
                    'stagiaire' => $stagiaire,
                    'presences' => $presences,
                ],
            ]);
        });
    });

    // Shared routes (all authenticated users)
    Route::get('modules', [ModuleController::class, 'index']);
    Route::get('annees-scolaires', [AnneeScolaireController::class, 'index']);
    Route::get('/notifications', function () {
        return response()->json(['status' => 'success', 'data' => []]);
    });
});
