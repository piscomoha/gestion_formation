<?php

namespace App\Http\Controllers;

use App\Models\AnneeScolaire;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AnneeScolaireController extends Controller
{
    /**
     * Afficher toutes les années scolaires
     */
    public function index()
    {
        $annees = AnneeScolaire::orderBy('dateDebut', 'desc')->get();
        
        return response()->json([
            'status' => 'success',
            'message' => 'Liste des années scolaires récupérée avec succès.',
            'data' => $annees
        ], 200);
    }

    /**
     * Créer une nouvelle année scolaire
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'libelle' => 'required|string|max:255|unique:annees_scolaires,libelle',
            'dateDebut' => 'required|date',
            'dateFin' => 'required|date|after:dateDebut',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Erreur de validation des données.',
                'errors' => $validator->errors()
            ], 422);
        }

        $annee = AnneeScolaire::create($request->all());

        return response()->json([
            'status' => 'success',
            'message' => 'Année scolaire créée avec succès.',
            'data' => $annee
        ], 201);
    }

    /**
     * Afficher les détails d'une année scolaire
     */
    public function show($id)
    {
        $annee = AnneeScolaire::find($id);

        if (!$annee) {
            return response()->json([
                'status' => 'error',
                'message' => 'Année scolaire introuvable.'
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $annee
        ], 200);
    }

    /**
     * Mettre à jour une année scolaire
     */
    public function update(Request $request, $id)
    {
        $annee = AnneeScolaire::find($id);

        if (!$annee) {
            return response()->json([
                'status' => 'error',
                'message' => 'Année scolaire introuvable.'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'libelle' => 'sometimes|required|string|max:255|unique:annees_scolaires,libelle,' . $id . ',idAnneeScolaire',
            'dateDebut' => 'sometimes|required|date',
            'dateFin' => 'sometimes|required|date|after:dateDebut',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Erreur de validation des données.',
                'errors' => $validator->errors()
            ], 422);
        }

        $annee->update($request->all());

        return response()->json([
            'status' => 'success',
            'message' => 'Année scolaire mise à jour avec succès.',
            'data' => $annee
        ], 200);
    }

    /**
     * Supprimer une année scolaire
     */
    public function destroy($id)
    {
        $annee = AnneeScolaire::find($id);

        if (!$annee) {
            return response()->json([
                'status' => 'error',
                'message' => 'Année scolaire introuvable.'
            ], 404);
        }

        // Empêcher la suppression si l'année est utilisée dans des affectations
        if ($annee->affectations()->count() > 0) {
            return response()->json([
                'status' => 'error',
                'message' => 'Impossible de supprimer cette année scolaire car elle est liée à des affectations.'
            ], 409);
        }

        $annee->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Année scolaire supprimée avec succès.'
        ], 200);
    }
}