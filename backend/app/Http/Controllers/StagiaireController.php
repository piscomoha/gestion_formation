<?php

namespace App\Http\Controllers;

use App\Models\Stagiaire;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class StagiaireController extends Controller
{
    /**
     * Afficher la liste de tous les stagiaires
     */
    public function index()
    {
        $stagiaires = Stagiaire::with('groupe.filiere')->get();
        
        return response()->json([
            'status' => 'success',
            'message' => 'Liste des stagiaires récupérée avec succès.',
            'data' => $stagiaires
        ], 200);
    }

    /**
     * Créer un nouveau stagiaire
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nom' => 'required|string|max:255',
            'prenom' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:stagiaires,email',
            'telephone' => 'required|string',
            'idGroupe' => 'required|exists:groupes,idGroupe',
            'user_id' => 'nullable|exists:users,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Erreur de validation des données.',
                'errors' => $validator->errors()
            ], 422);
        }

        $stagiaire = Stagiaire::create($request->all());

        return response()->json([
            'status' => 'success',
            'message' => 'Stagiaire créé avec succès.',
            'data' => $stagiaire
        ], 201);
    }

    /**
     * Afficher les détails d'un stagiaire spécifique
     */
    public function show(Request $request, $id)
    {
        $stagiaire = Stagiaire::with(['groupe', 'presences', 'notes'])->find($id);

        if (!$stagiaire) {
            return response()->json([
                'status' => 'error',
                'message' => 'Stagiaire introuvable.'
            ], 404);
        }

        // Vérification des permissions : un stagiaire ne peut voir que son propre profil
        $user = $request->user();
        if ($user->role === 'stagiaire' && $stagiaire->user_id !== $user->id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Accès non autorisé. Vous ne pouvez consulter que votre propre profil.'
            ], 403);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Détails du stagiaire récupérés avec succès.',
            'data' => $stagiaire
        ], 200);
    }

    /**
     * Mettre à jour les informations d'un stagiaire
     */
    public function update(Request $request, $id)
    {
        $stagiaire = Stagiaire::find($id);

        if (!$stagiaire) {
            return response()->json([
                'status' => 'error',
                'message' => 'Stagiaire introuvable.'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'nom' => 'sometimes|required|string|max:255',
            'prenom' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|email|unique:stagiaires,email,' . $id . ',idStagiaire',
            'telephone' => 'sometimes|required|string',
            'idGroupe' => 'sometimes|required|exists:groupes,idGroupe',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Erreur de validation des données.',
                'errors' => $validator->errors()
            ], 422);
        }

        $stagiaire->update($request->all());

        return response()->json([
            'status' => 'success',
            'message' => 'Stagiaire mis à jour avec succès.',
            'data' => $stagiaire
        ], 200);
    }

    /**
     * Supprimer un stagiaire
     */
    public function destroy($id)
    {
        $stagiaire = Stagiaire::find($id);

        if (!$stagiaire) {
            return response()->json([
                'status' => 'error',
                'message' => 'Stagiaire introuvable.'
            ], 404);
        }

        $stagiaire->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Stagiaire supprimé avec succès.'
        ], 200);
    }

    /**
     * Récupérer les stagiaires d'un groupe spécifique
     */
    public function getByGroupe($groupeId)
    {
        $stagiaires = Stagiaire::where('idGroupe', $groupeId)->get();
        
        return response()->json([
            'status' => 'success',
            'message' => 'Liste des stagiaires du groupe récupérée avec succès.',
            'data' => $stagiaires
        ], 200);
    }
}