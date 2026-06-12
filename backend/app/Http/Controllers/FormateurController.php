<?php

namespace App\Http\Controllers;

use App\Models\Formateur;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class FormateurController extends Controller
{
    /**
     * Afficher la liste de tous les formateurs
     */
    public function index()
    {
        $formateurs = Formateur::with('affectations.module')->get();
        
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
            'email' => 'required|string|email|max:255|unique:formateurs,email',
            'telephone' => 'required|string',
            'user_id' => 'nullable|exists:users,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Erreur de validation des données.',
                'errors' => $validator->errors()
            ], 422);
        }

        $formateur = Formateur::create($request->all());

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
        $formateur = Formateur::with(['affectations.module', 'affectations.groupe'])->find($id);

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
            'email' => 'sometimes|required|email|unique:formateurs,email,' . $id . ',idFormateur',
            'telephone' => 'sometimes|required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Erreur de validation des données.',
                'errors' => $validator->errors()
            ], 422);
        }

        $formateur->update($request->all());

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

        $formateur->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Formateur supprimé avec succès.'
        ], 200);
    }
}