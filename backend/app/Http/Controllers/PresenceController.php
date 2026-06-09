<?php

namespace App\Http\Controllers;

use App\Models\Presence;
use App\Models\Affectation;
use App\Models\Stagiaire;
use App\Models\Formateur;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class PresenceController extends Controller
{
    /**
     * Enregistrer l'appel (présence) pour une séance complète
     * Le formateur envoie la liste de tous les stagiaires du groupe avec leur statut
     */
    public function enregistrerAppel(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'idAffectation' => 'required|exists:affectations,idAffectation',
            'dateSeance' => 'required|date',
            'presences' => 'required|array|min:1',
            'presences.*.idStagiaire' => 'required|exists:stagiaires,idStagiaire',
            'presences.*.statut' => 'required|in:Present,Absent,Justifie',
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

        // Vérifier que tous les stagiaires appartiennent bien au groupe de l'affectation
        $stagiairesIds = array_column($request->presences, 'idStagiaire');
        $stagiairesValides = Stagiaire::where('idGroupe', $affectation->idGroupe)
            ->whereIn('idStagiaire', $stagiairesIds)
            ->count();

        if ($stagiairesValides !== count($stagiairesIds)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Certains stagiaires n\'appartiennent pas au groupe de cette affectation.'
            ], 422);
        }

        // Vérifier si un appel a déjà été fait pour cette date et cette affectation
        $appelExiste = Presence::where('idAffectation', $request->idAffectation)
            ->where('dateSeance', $request->dateSeance)
            ->exists();

        if ($appelExiste) {
            return response()->json([
                'status' => 'error',
                'message' => 'L\'appel pour cette séance a déjà été enregistré. Utilisez la mise à jour.'
            ], 409);
        }

        // Enregistrer toutes les présences dans une transaction
        try {
            DB::beginTransaction();

            $presences = [];
            foreach ($request->presences as $p) {
                $presences[] = [
                    'idAffectation' => $request->idAffectation,
                    'idStagiaire' => $p['idStagiaire'],
                    'dateSeance' => $request->dateSeance,
                    'statut' => $p['statut'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }

            Presence::insert($presences);
            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Appel enregistré avec succès pour ' . count($presences) . ' stagiaires.',
                'data' => $presences
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'status' => 'error',
                'message' => 'Erreur lors de l\'enregistrement de l\'appel.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mettre à jour l'appel d'une séance déjà enregistrée
     */
    public function modifierAppel(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'idAffectation' => 'required|exists:affectations,idAffectation',
            'dateSeance' => 'required|date',
            'presences' => 'required|array|min:1',
            'presences.*.idStagiaire' => 'required|exists:stagiaires,idStagiaire',
            'presences.*.statut' => 'required|in:Present,Absent,Justifie',
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

            foreach ($request->presences as $p) {
                Presence::where('idAffectation', $request->idAffectation)
                    ->where('idStagiaire', $p['idStagiaire'])
                    ->where('dateSeance', $request->dateSeance)
                    ->update(['statut' => $p['statut'], 'updated_at' => now()]);
            }

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Appel mis à jour avec succès.'
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
     * Afficher toutes les séances d'une affectation (avec statistiques)
     * Pour le formateur : voir l'historique de ses appels
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

        $presences = Presence::where('idAffectation', $idAffectation)
            ->orderBy('dateSeance', 'desc')
            ->get()
            ->groupBy('dateSeance');

        // Calculer les statistiques globales
        $totalSeances = $presences->count();
        $totalPresences = Presence::where('idAffectation', $idAffectation)->count();
        $totalPresents = Presence::where('idAffectation', $idAffectation)->where('statut', 'Present')->count();
        $pourcentagePresence = $totalPresences > 0 ? round(($totalPresents / $totalPresences) * 100, 2) : 0;

        return response()->json([
            'status' => 'success',
            'data' => [
                'affectation' => $affectation,
                'seances' => $presences,
                'statistiques' => [
                    'total_seances' => $totalSeances,
                    'pourcentage_presence_global' => $pourcentagePresence . '%',
                    'total_presents' => $totalPresents,
                    'total_absents' => $totalPresences - $totalPresents
                ]
            ]
        ], 200);
    }

    /**
     * Afficher l'historique de présence d'un stagiaire spécifique
     * Pour le stagiaire : voir son propre historique
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
                    'message' => 'Accès non autorisé. Vous ne pouvez consulter que votre propre historique.'
                ], 403);
            }
        }

        $presences = Presence::where('idStagiaire', $idStagiaire)
            ->with('affectation.module')
            ->orderBy('dateSeance', 'desc')
            ->get();

        // Statistiques par module
        $statsParModule = $presences->groupBy('affectation.idModule')->map(function ($items) {
            $module = $items->first()->affectation->module;
            $total = $items->count();
            $presents = $items->where('statut', 'Present')->count();
            
            return [
                'module' => $module,
                'total_seances' => $total,
                'presents' => $presents,
                'absents' => $total - $presents,
                'pourcentage' => $total > 0 ? round(($presents / $total) * 100, 2) . '%' : '0%'
            ];
        });

        return response()->json([
            'status' => 'success',
            'data' => [
                'presences' => $presences,
                'statistiques_par_module' => $statsParModule
            ]
        ], 200);
    }

    /**
     * Afficher les présences du stagiaire connecté (Route spéciale pour le dashboard du stagiaire)
     */
    public function mesPresences(Request $request)
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
     * Supprimer un appel (une séance complète)
     */
    public function supprimerSeance(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'idAffectation' => 'required|exists:affectations,idAffectation',
            'dateSeance' => 'required|date',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors()
            ], 422);
        }

        $deleted = Presence::where('idAffectation', $request->idAffectation)
            ->where('dateSeance', $request->dateSeance)
            ->delete();

        if ($deleted === 0) {
            return response()->json([
                'status' => 'error',
                'message' => 'Aucune séance trouvée pour cette date.'
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Séance supprimée avec succès.'
        ], 200);
    }
}