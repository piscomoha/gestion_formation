<?php

namespace App\Http\Controllers;

use App\Models\Groupe;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class GroupeController extends Controller
{
    /**
     * Afficher la liste de tous les groupes
     */
    public function index()
    {
        // On récupère les groupes avec leur filière et le nombre réel de stagiaires
        $groupes = Groupe::with('filiere')->withCount('stagiaires')->get();
        
        return response()->json([
            'status' => 'success',
            'message' => 'Liste des groupes récupérée avec succès.',
            'data' => $groupes
        ], 200);
    }

    /**
     * Créer un nouveau groupe
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'libelle' => 'required|string|max:255|unique:groupes,libelle',
            'effectif' => 'required|integer|min:0',
            'idFiliere' => 'required|exists:filieres,idFiliere',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Erreur de validation des données.',
                'errors' => $validator->errors()
            ], 422);
        }

        $groupe = Groupe::create($request->all());

        return response()->json([
            'status' => 'success',
            'message' => 'Groupe créé avec succès.',
            'data' => $groupe
        ], 201);
    }

    /**
     * Afficher les détails d'un groupe spécifique (avec ses stagiaires)
     */
    public function show($id)
    {
        $groupe = Groupe::with(['filiere', 'stagiaires'])->find($id);

        if (!$groupe) {
            return response()->json([
                'status' => 'error',
                'message' => 'Groupe introuvable.'
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Détails du groupe récupérés avec succès.',
            'data' => $groupe
        ], 200);
    }

    /**
     * Mettre à jour un groupe
     */
    public function update(Request $request, $id)
    {
        $groupe = Groupe::find($id);

        if (!$groupe) {
            return response()->json([
                'status' => 'error',
                'message' => 'Groupe introuvable.'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'libelle' => 'sometimes|required|string|max:255|unique:groupes,libelle,' . $id . ',idGroupe',
            'effectif' => 'sometimes|required|integer|min:0',
            'idFiliere' => 'sometimes|required|exists:filieres,idFiliere',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Erreur de validation des données.',
                'errors' => $validator->errors()
            ], 422);
        }

        $groupe->update($request->all());

        return response()->json([
            'status' => 'success',
            'message' => 'Groupe mis à jour avec succès.',
            'data' => $groupe
        ], 200);
    }

    /**
     * Supprimer un groupe
     */
    public function destroy($id)
    {
        $groupe = Groupe::find($id);

        if (!$groupe) {
            return response()->json([
                'status' => 'error',
                'message' => 'Groupe introuvable.'
            ], 404);
        }

        // Vérifier s'il y a des stagiaires dans ce groupe avant de supprimer
        if ($groupe->stagiaires()->count() > 0) {
            return response()->json([
                'status' => 'error',
                'message' => 'Impossible de supprimer ce groupe car il contient des stagiaires.'
            ], 409); // 409 Conflict
        }

        $groupe->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Groupe supprimé avec succès.'
        ], 200);
    }
}