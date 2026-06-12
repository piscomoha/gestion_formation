<?php

namespace App\Http\Controllers;

use App\Models\Affectation;
use App\Models\Formateur;
use App\Models\Note;
use App\Models\Presence;
use App\Models\Stagiaire;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class FormateurController extends Controller
{
    /**
     * Afficher la liste de tous les formateurs
     */
    public function index()
    {
        $formateurs = Formateur::with([
            'user',
            'affectations.module',
            'affectations.groupe.filiere',
            'affectations.anneeScolaire',
        ])->get();
        
        return response()->json([
            'status' => 'success',
            'message' => 'Liste des formateurs récupérée avec succès.',
            'data' => $formateurs
        ], 200);
    }

    /**
     * Créer un nouveau formateur
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nom' => 'required|string|max:255',
            'prenom' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:formateurs,email|unique:users,email',
            'telephone' => 'required|string',
            'specialite' => 'nullable|string|max:255',
            'password' => 'nullable|string|min:6',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Erreur de validation des données.',
                'errors' => $validator->errors()
            ], 422);
        }

        $formateur = DB::transaction(function () use ($request) {
            $user = User::create([
                'nom' => $request->nom,
                'prenom' => $request->prenom,
                'email' => $request->email,
                'password' => Hash::make($request->password ?: 'password123'),
                'role' => 'formateur',
            ]);

            return Formateur::create([
                'nom' => $request->nom,
                'prenom' => $request->prenom,
                'email' => $request->email,
                'telephone' => $request->telephone,
                'specialite' => $request->specialite,
                'user_id' => $user->id,
            ])->load([
                'user',
                'affectations.module',
                'affectations.groupe.filiere',
                'affectations.anneeScolaire',
            ]);
        });

        return response()->json([
            'status' => 'success',
            'message' => 'Formateur créé avec succès.',
            'data' => $formateur
        ], 201);
    }

    /**
     * Afficher les détails d'un formateur spécifique
     */
    public function show(Request $request, $id)
    {
        $formateur = Formateur::with([
            'user',
            'affectations.module',
            'affectations.groupe.filiere',
            'affectations.anneeScolaire',
        ])->find($id);

        if (!$formateur) {
            return response()->json([
                'status' => 'error',
                'message' => 'Formateur introuvable.'
            ], 404);
        }

        // Vérification des permissions : un formateur ne peut voir que son propre profil
        $user = $request->user();
        if ($user->role === 'formateur' && $formateur->user_id !== $user->id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Accès non autorisé. Vous ne pouvez consulter que votre propre profil.'
            ], 403);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Détails du formateur récupérés avec succès.',
            'data' => $formateur
        ], 200);
    }

    /**
     * Mettre à jour les informations d'un formateur
     */
    public function update(Request $request, $id)
    {
        $formateur = Formateur::find($id);

        if (!$formateur) {
            return response()->json([
                'status' => 'error',
                'message' => 'Formateur introuvable.'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'nom' => 'sometimes|required|string|max:255',
            'prenom' => 'sometimes|required|string|max:255',
            'email' => [
                'sometimes',
                'required',
                'email',
                'unique:formateurs,email,' . $id . ',idFormateur',
                'unique:users,email,' . ($formateur->user_id ?: 'NULL') . ',id',
            ],
            'telephone' => 'sometimes|required|string',
            'specialite' => 'nullable|string|max:255',
            'password' => 'nullable|string|min:6',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Erreur de validation des données.',
                'errors' => $validator->errors()
            ], 422);
        }

        DB::transaction(function () use ($request, $formateur) {
            $formateur->update($request->only(['nom', 'prenom', 'email', 'telephone', 'specialite']));

            if ($formateur->user) {
                $userData = $request->only(['nom', 'prenom', 'email']);
                if ($request->filled('password')) {
                    $userData['password'] = Hash::make($request->password);
                }
                $formateur->user->update($userData);
            }
        });

        $formateur->load([
            'user',
            'affectations.module',
            'affectations.groupe.filiere',
            'affectations.anneeScolaire',
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Formateur mis à jour avec succès.',
            'data' => $formateur
        ], 200);
    }

    /**
     * Supprimer un formateur
     */
    public function destroy($id)
    {
        $formateur = Formateur::find($id);

        if (!$formateur) {
            return response()->json([
                'status' => 'error',
                'message' => 'Formateur introuvable.'
            ], 404);
        }

        $user = $formateur->user;
        $formateur->delete();

        if ($user) {
            $user->delete();
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Formateur supprimé avec succès.'
        ], 200);
    }

    /**
     * Générer des formateurs fictifs (Factory)
     */
    public function generateFake(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'count' => 'nullable|integer|min:1|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Données invalides.',
                'errors' => $validator->errors()
            ], 422);
        }

        $count = $request->input('count', 5);
        $faker = \Faker\Factory::create('fr_FR');
        $specialities = ['Développement Digital', 'Infrastructure Digitale', 'Design & Multimédia', 'Intelligence Artificielle', 'DevOps & Cloud', 'Gestion & Soft Skills'];

        $generated = [];

        DB::transaction(function () use ($count, $faker, $specialities, &$generated) {
            for ($i = 0; $i < $count; $i++) {
                $firstName = $faker->firstName;
                $lastName = $faker->lastName;
                $email = strtolower($firstName . '.' . $lastName) . rand(10, 99) . '@ofppt.ma';
                
                // Avoid email collision
                while (User::where('email', $email)->exists() || Formateur::where('email', $email)->exists()) {
                    $email = strtolower($firstName . '.' . $lastName) . rand(100, 999) . '@ofppt.ma';
                }

                $user = User::create([
                    'nom' => $lastName,
                    'prenom' => $firstName,
                    'email' => $email,
                    'password' => Hash::make('password123'),
                    'role' => 'formateur',
                ]);

                $formateur = Formateur::create([
                    'nom' => $lastName,
                    'prenom' => $firstName,
                    'email' => $email,
                    'telephone' => '06' . $faker->numerify('########'),
                    'specialite' => $faker->randomElement($specialities),
                    'user_id' => $user->id,
                ]);

                $generated[] = $formateur;
            }
        });

        return response()->json([
            'status' => 'success',
            'message' => "$count formateurs générés avec succès.",
            'data' => $generated
        ], 201);
    }

    /**
     * Récupérer les groupes et stagiaires du formateur connecté
     */
    public function mesGroupes(Request $request)
    {
        $user = $request->user();
        $formateur = Formateur::where('user_id', $user->id)->first();
        
        if (!$formateur) {
            return response()->json([
                'status' => 'error',
                'message' => 'Formateur introuvable.'
            ], 404);
        }

        $affectations = $formateur->affectations()->with([
            'groupe.stagiaires',
            'module',
            'anneeScolaire'
        ])->get();

        return response()->json([
            'status' => 'success',
            'message' => 'Groupes et stagiaires récupérés avec succès.',
            'data' => $affectations
        ], 200);
    }

    /**
     * Récupérer le workspace complet du formateur connecté
     */
    public function workspace(Request $request)
    {
        $user = $request->user();
        $formateur = Formateur::where('user_id', $user->id)->first();
        
        if (!$formateur) {
            return response()->json([
                'status' => 'error',
                'message' => 'Formateur introuvable.'
            ], 404);
        }

        $affectations = $formateur->affectations()->with([
            'groupe.stagiaires',
            'module',
            'anneeScolaire'
        ])->get();

        $stagiaires = collect([]);
        foreach ($affectations as $aff) {
            $stagiaires = $stagiaires->merge($aff->groupe->stagiaires);
        }

        $stagiaires = $stagiaires->unique('idStagiaire')->values();

        return response()->json([
            'status' => 'success',
            'message' => 'Workspace du formateur récupéré avec succès.',
            'data' => [
                'formateur' => $formateur,
                'affectations' => $affectations,
                'stagiaires' => $stagiaires
            ]
        ], 200);
    }

    /**
     * Statistiques du dashboard du formateur connecté
     */
    public function stats(Request $request)
    {
        $user = $request->user();
        $formateur = Formateur::where('user_id', $user->id)->first();

        if (!$formateur) {
            return response()->json([
                'status' => 'error',
                'message' => 'Formateur introuvable.'
            ], 404);
        }

        $affectationsQuery = Affectation::query()
            ->where('idFormateur', $formateur->idFormateur);

        if ($request->filled('annee_id')) {
            $affectationsQuery->where('idAnneeScolaire', $request->input('annee_id'));
        }

        $affectations = $affectationsQuery->get(['idAffectation', 'idModule', 'idGroupe']);
        $affectationIds = $affectations->pluck('idAffectation')->values();

        $modulesCount = $affectations->pluck('idModule')->unique()->count();
        $groupes = $affectations->pluck('idGroupe')->unique()->values();
        $groupesCount = $groupes->count();

        $stagiairesCount = $groupesCount > 0
            ? Stagiaire::whereIn('idGroupe', $groupes)->count()
            : 0;

        $presenceCounts = $affectationIds->count() > 0
            ? Presence::whereIn('idAffectation', $affectationIds)
                ->select('statut', DB::raw('count(*) as total'))
                ->groupBy('statut')
                ->pluck('total', 'statut')
            : collect([]);

        $present = (int) ($presenceCounts['Present'] ?? 0);
        $absent = (int) ($presenceCounts['Absent'] ?? 0);
        $justifie = (int) ($presenceCounts['Justifie'] ?? 0);
        $totalAbsences = $absent + $justifie;
        $totalPresences = $present + $absent + $justifie;

        $notesCount = $affectationIds->count() > 0
            ? Note::whereIn('idAffectation', $affectationIds)->count()
            : 0;

        $moyenneNotes = $affectationIds->count() > 0
            ? (float) Note::whereIn('idAffectation', $affectationIds)->avg('note')
            : 0;

        $moyenneNotes = round($moyenneNotes ?: 0, 2);

        $notesParModule = $affectationIds->count() > 0
            ? Note::query()
                ->join('affectations', 'notes.idAffectation', '=', 'affectations.idAffectation')
                ->join('modules', 'affectations.idModule', '=', 'modules.idModule')
                ->whereIn('notes.idAffectation', $affectationIds)
                ->select(
                    'modules.idModule',
                    'modules.libelle',
                    DB::raw('avg(notes.note) as moyenne'),
                    DB::raw('count(notes.idNote) as total_notes')
                )
                ->groupBy('modules.idModule', 'modules.libelle')
                ->orderBy('modules.libelle')
                ->get()
                ->map(function ($row) {
                    return [
                        'idModule' => (int) $row->idModule,
                        'libelle' => (string) $row->libelle,
                        'moyenne' => round((float) $row->moyenne, 2),
                        'total_notes' => (int) $row->total_notes,
                    ];
                })
            : collect([]);

        return response()->json([
            'status' => 'success',
            'message' => 'Statistiques du formateur récupérées avec succès.',
            'data' => [
                'modules_affectes' => $modulesCount,
                'groupes' => $groupesCount,
                'stagiaires' => $stagiairesCount,
                'moyenne_notes' => $moyenneNotes,
                'total_notes' => $notesCount,
                'total_absences' => $totalAbsences,
                'presences' => [
                    'present' => $present,
                    'absent' => $absent,
                    'justifie' => $justifie,
                    'total' => $totalPresences,
                ],
                'notes_par_module' => $notesParModule,
            ],
        ], 200);
    }
}
