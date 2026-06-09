<?php

namespace App\Http\Controllers;

use App\Models\Note;
use App\Models\Affectation;
use App\Models\Stagiaire;
use App\Models\Formateur;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class NoteController extends Controller
{
    /**
     * Enregistrer les notes pour une évaluation complète (un examen ou contrôle)
     * Le formateur envoie la liste de tous les stagiaires avec leurs notes
     */
    public function enregistrerNotes(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'idAffectation' => 'required|exists:affectations,idAffectation',
            'dateEvaluation' => 'required|date',
            'notes' => 'required|array|min:1',
            'notes.*.idStagiaire' => 'required|exists:stagiaires,idStagiaire',
            'notes.*.note' => 'required|numeric|min:0|max:20',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Erreur de validation des données.',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = $request->user();
        
        // Vérifier que l'utilisateur est bien le formateur de cette affectation
        $formateur = Formateur::where('user_id', $user->id)->first();
        $affectation = Affectation::find($request->idAffectation);

        if (!$formateur || $affectation->idFormateur !== $formateur->idFormateur) {
            if ($user->role !== 'admin') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Accès non autorisé. Vous n\'êtes pas le formateur de ce cours.'
                ], 403);
            }
        }

        // Vérifier que tous les stagiaires appartiennent bien au groupe
        $stagiairesIds = array_column($request->notes, 'idStagiaire');
        $stagiairesValides = Stagiaire::where('idGroupe', $affectation->idGroupe)
            ->whereIn('idStagiaire', $stagiairesIds)
            ->count();

        if ($stagiairesValides !== count($stagiairesIds)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Certains stagiaires n\'appartiennent pas au groupe de cette affectation.'
            ], 422);
        }

        // Vérifier si des notes existent déjà pour cette date
        $notesExistent = Note::where('idAffectation', $request->idAffectation)
            ->where('dateEvaluation', $request->dateEvaluation)
            ->exists();

        if ($notesExistent) {
            return response()->json([
                'status' => 'error',
                'message' => 'Des notes existent déjà pour cette date. Utilisez la mise à jour.'
            ], 409);
        }

        // Enregistrer toutes les notes dans une transaction
        try {
            DB::beginTransaction();

            $notes = [];
            foreach ($request->notes as $n) {
                $notes[] = [
                    'idAffectation' => $request->idAffectation,
                    'idStagiaire' => $n['idStagiaire'],
                    'note' => $n['note'],
                    'dateEvaluation' => $request->dateEvaluation,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }

            Note::insert($notes);
            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Notes enregistrées avec succès pour ' . count($notes) . ' stagiaires.',
                'data' => $notes
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'Erreur lors de l\'enregistrement des notes.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mettre à jour les notes d'une évaluation déjà enregistrée
     */
    public function modifierNotes(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'idAffectation' => 'required|exists:affectations,idAffectation',
            'dateEvaluation' => 'required|date',
            'notes' => 'required|array|min:1',
            'notes.*.idStagiaire' => 'required|exists:stagiaires,idStagiaire',
            'notes.*.note' => 'required|numeric|min:0|max:20',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Erreur de validation des données.',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            foreach ($request->notes as $n) {
                Note::where('idAffectation', $request->idAffectation)
                    ->where('idStagiaire', $n['idStagiaire'])
                    ->where('dateEvaluation', $request->dateEvaluation)
                    ->update(['note' => $n['note'], 'updated_at' => now()]);
            }

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Notes mises à jour avec succès.'
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'Erreur lors de la mise à jour.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Afficher toutes les évaluations d'une affectation avec moyennes
     */
    public function getParAffectation($idAffectation)
    {
        $affectation = Affectation::with(['module', 'groupe', 'formateur'])->find($idAffectation);

        if (!$affectation) {
            return response()->json([
                'status' => 'error',
                'message' => 'Affectation introuvable.'
            ], 404);
        }

        $notes = Note::where('idAffectation', $idAffectation)
            ->orderBy('dateEvaluation', 'desc')
            ->get()
            ->groupBy('dateEvaluation');

        // Calculer les statistiques
        $totalEvaluations = $notes->count();
        $moyenneGenerale = Note::where('idAffectation', $idAffectation)->avg('note');
        $noteMax = Note::where('idAffectation', $idAffectation)->max('note');
        $noteMin = Note::where('idAffectation', $idAffectation)->min('note');

        return response()->json([
            'status' => 'success',
            'data' => [
                'affectation' => $affectation,
                'evaluations' => $notes,
                'statistiques' => [
                    'total_evaluations' => $totalEvaluations,
                    'moyenne_generale' => round($moyenneGenerale, 2),
                    'note_maximale' => $noteMax,
                    'note_minimale' => $noteMin
                ]
            ]
        ], 200);
    }

    /**
     * Afficher l'historique des notes d'un stagiaire spécifique
     */
    public function getParStagiaire(Request $request, $idStagiaire)
    {
        $user = $request->user();

        // Vérification des permissions
        if ($user->role === 'stagiaire') {
            $stagiaireConnecte = Stagiaire::where('user_id', $user->id)->first();
            if (!$stagiaireConnecte || $stagiaireConnecte->idStagiaire !== (int)$idStagiaire) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Accès non autorisé. Vous ne pouvez consulter que vos propres notes.'
                ], 403);
            }
        }

        $notes = Note::where('idStagiaire', $idStagiaire)
            ->with('affectation.module')
            ->orderBy('dateEvaluation', 'desc')
            ->get();

        // Statistiques par module
        $statsParModule = $notes->groupBy('affectation.idModule')->map(function ($items) {
            $module = $items->first()->affectation->module;
            $moyenne = $items->avg('note');
            $meilleure = $items->max('note');
            
            return [
                'module' => $module,
                'moyenne' => round($moyenne, 2),
                'meilleure_note' => $meilleure,
                'nombre_evaluations' => $items->count()
            ];
        });

        // Moyenne générale pondérée par coefficient
        $moyenneGenerale = 0;
        $totalCoefficients = 0;
        
        foreach ($statsParModule as $stat) {
            $moyenneGenerale += $stat['moyenne'] * $stat['module']->coefficient;
            $totalCoefficients += $stat['module']->coefficient;
        }
        
        $moyenneGenerale = $totalCoefficients > 0 ? round($moyenneGenerale / $totalCoefficients, 2) : 0;

        return response()->json([
            'status' => 'success',
            'data' => [
                'notes' => $notes,
                'statistiques_par_module' => $statsParModule,
                'moyenne_generale_ponderee' => $moyenneGenerale
            ]
        ], 200);
    }

    /**
     * Afficher les notes du stagiaire connecté
     */
    public function mesNotes(Request $request)
    {
        $user = $request->user();
        $stagiaire = Stagiaire::where('user_id', $user->id)->first();

        if (!$stagiaire) {
            return response()->json([
                'status' => 'error',
                'message' => 'Profil stagiaire introuvable.'
            ], 404);
        }

        return $this->getParStagiaire($request, $stagiaire->idStagiaire);
    }

    /**
     * Supprimer toutes les notes d'une évaluation
     */
    public function supprimerEvaluation(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'idAffectation' => 'required|exists:affectations,idAffectation',
            'dateEvaluation' => 'required|date',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors()
            ], 422);
        }

        $deleted = Note::where('idAffectation', $request->idAffectation)
            ->where('dateEvaluation', $request->dateEvaluation)
            ->delete();

        if ($deleted === 0) {
            return response()->json([
                'status' => 'error',
                'message' => 'Aucune évaluation trouvée pour cette date.'
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Évaluation supprimée avec succès.'
        ], 200);
    }
}