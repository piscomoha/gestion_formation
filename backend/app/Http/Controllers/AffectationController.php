<?php

namespace App\Http\Controllers;

use App\Models\Affectation;
use App\Models\AnneeScolaire;
use App\Models\Formateur;
use App\Models\Module;
use App\Models\Groupe;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AffectationController extends Controller
{
    /**
     * Afficher toutes les affectations (Pour l'Admin)
     */
    public function index()
    {
        $affectations = Affectation::with([
            'anneeScolaire', 
            'formateur', 
            'module', 
            'groupe.filiere'
        ])->withCount(['presences', 'notes'])->latest()->get();
        
        return response()->json([
            'status' => 'success',
            'message' => 'Liste des affectations récupérée avec succès.',
            'data' => $affectations
        ], 200);
    }

    /**
     * Créer une nouvelle affectation
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'idAnneeScolaire' => 'required|exists:annees_scolaires,idAnneeScolaire',
            'idFormateur' => 'required|exists:formateurs,idFormateur',
            'idModule' => 'required|exists:modules,idModule',
            'idGroupe' => 'required|exists:groupes,idGroupe',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Erreur de validation des données.',
                'errors' => $validator->errors()
            ], 422);
        }

        // Vérifier si cette affectation existe déjà (éviter les doublons)
        $exists = Affectation::where('idAnneeScolaire', $request->idAnneeScolaire)
            ->where('idFormateur', $request->idFormateur)
            ->where('idModule', $request->idModule)
            ->where('idGroupe', $request->idGroupe)
            ->exists();

        if ($exists) {
            return response()->json([
                'status' => 'error',
                'message' => 'Cette affectation existe déjà.'
            ], 409); // 409 Conflict
        }

        $affectation = Affectation::create($request->all());
        $affectation->load(['anneeScolaire', 'formateur', 'module', 'groupe']);

        return response()->json([
            'status' => 'success',
            'message' => 'Affectation créée avec succès.',
            'data' => $affectation
        ], 201);
    }

    /**
     * Modifier une affectation existante
     */
    public function update(Request $request, $id)
    {
        $affectation = Affectation::find($id);

        if (!$affectation) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Affectation introuvable.'
            ], 404);
        }

        // Bloquer la modification si des présences ou notes existent déjà
        if ($affectation->presences()->count() > 0 || $affectation->notes()->count() > 0) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Impossible de modifier cette affectation car elle contient déjà des présences ou des notes enregistrées.'
            ], 409);
        }

        $validator = Validator::make($request->all(), [
            'idAnneeScolaire' => 'required|exists:annees_scolaires,idAnneeScolaire',
            'idFormateur'     => 'required|exists:formateurs,idFormateur',
            'idModule'        => 'required|exists:modules,idModule',
            'idGroupe'        => 'required|exists:groupes,idGroupe',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Erreur de validation des données.',
                'errors'  => $validator->errors()
            ], 422);
        }

        // Vérifier si la nouvelle combinaison crée un doublon (autre que l'affectation actuelle)
        $duplicate = Affectation::where('idAnneeScolaire', $request->idAnneeScolaire)
            ->where('idFormateur', $request->idFormateur)
            ->where('idModule',    $request->idModule)
            ->where('idGroupe',    $request->idGroupe)
            ->where('idAffectation', '!=', $id)
            ->exists();

        if ($duplicate) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Une affectation identique existe déjà.'
            ], 409);
        }

        $affectation->update($request->only(['idAnneeScolaire', 'idFormateur', 'idModule', 'idGroupe']));
        $affectation->load(['anneeScolaire', 'formateur', 'module', 'groupe.filiere']);

        return response()->json([
            'status'  => 'success',
            'message' => 'Affectation modifiée avec succès.',
            'data'    => $affectation
        ], 200);
    }

    /**
     * Afficher les détails d'une affectation avec la liste des stagiaires du groupe
     * (Très utile pour que le formateur puisse faire l'appel ou saisir les notes)
     */
    public function show($id)
    {
        $affectation = Affectation::with([
            'anneeScolaire', 
            'formateur', 
            'module', 
            'groupe.filiere',
            'groupe.stagiaires' // On charge les stagiaires de ce groupe !
        ])->find($id);

        if (!$affectation) {
            return response()->json([
                'status' => 'error',
                'message' => 'Affectation introuvable.'
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Détails de l\'affectation récupérés avec succès.',
            'data' => $affectation
        ], 200);
    }

    /**
     * Supprimer une affectation
     */
    public function destroy($id)
    {
        $affectation = Affectation::find($id);

        if (!$affectation) {
            return response()->json([
                'status' => 'error',
                'message' => 'Affectation introuvable.'
            ], 404);
        }

        // Vérifier s'il y a déjà des présences ou des notes liées à cette affectation
        if ($affectation->presences()->count() > 0 || $affectation->notes()->count() > 0) {
            return response()->json([
                'status' => 'error',
                'message' => 'Impossible de supprimer cette affectation car elle contient déjà des présences ou des notes.'
            ], 409);
        }

        $affectation->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Affectation supprimée avec succès.'
        ], 200);
    }

    /**
     * Récupérer les affectations d'un formateur spécifique (Pour le dashboard du Formateur)
     */
    public function getMesAffectations(Request $request)
    {
        $user = $request->user();
        
        // Trouver le profil Formateur lié à cet utilisateur
        $formateur = Formateur::where('user_id', $user->id)->first();
        
        if (!$formateur) {
            return response()->json([
                'status' => 'error',
                'message' => 'Profil formateur introuvable.'
            ], 404);
        }

        $affectations = Affectation::where('idFormateur', $formateur->idFormateur)
            ->with(['anneeScolaire', 'module', 'groupe.filiere'])
            ->latest()
            ->get();

        return response()->json([
            'status' => 'success',
            'message' => 'Vos affectations ont été récupérées avec succès.',
            'data' => $affectations
        ], 200);
    }
}