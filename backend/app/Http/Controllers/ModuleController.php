<?php

namespace App\Http\Controllers;

use App\Models\Module;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ModuleController extends Controller
{
    /**
     * Afficher tous les modules
     */
    public function index()
    {
        $modules = Module::all();
        
        return response()->json([
            'status' => 'success',
            'message' => 'Liste des modules récupérée avec succès.',
            'data' => $modules
        ], 200);
    }

    /**
     * Créer un nouveau module
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'libelle' => 'required|string|max:255|unique:modules,libelle',
            'description' => 'nullable|string',
            'coefficient' => 'required|numeric|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Erreur de validation des données.',
                'errors' => $validator->errors()
            ], 422);
        }

        $module = Module::create($request->all());

        return response()->json([
            'status' => 'success',
            'message' => 'Module créé avec succès.',
            'data' => $module
        ], 201);
    }

    /**
     * Afficher un module spécifique
     */
    public function show($id)
    {
        $module = Module::find($id);

        if (!$module) {
            return response()->json([
                'status' => 'error',
                'message' => 'Module introuvable.'
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $module
        ], 200);
    }

    /**
     * Mettre à jour un module
     */
    public function update(Request $request, $id)
    {
        $module = Module::find($id);

        if (!$module) {
            return response()->json([
                'status' => 'error',
                'message' => 'Module introuvable.'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'libelle' => 'sometimes|required|string|max:255|unique:modules,libelle,' . $id . ',idModule',
            'description' => 'nullable|string',
            'coefficient' => 'sometimes|required|numeric|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Erreur de validation des données.',
                'errors' => $validator->errors()
            ], 422);
        }

        $module->update($request->all());

        return response()->json([
            'status' => 'success',
            'message' => 'Module mis à jour avec succès.',
            'data' => $module
        ], 200);
    }

    /**
     * Supprimer un module
     */
    public function destroy($id)
    {
        $module = Module::find($id);

        if (!$module) {
            return response()->json([
                'status' => 'error',
                'message' => 'Module introuvable.'
            ], 404);
        }

        // Empêcher la suppression si le module est utilisé dans des affectations
        if ($module->affectations()->count() > 0) {
            return response()->json([
                'status' => 'error',
                'message' => 'Impossible de supprimer ce module car il est lié à des affectations.'
            ], 409);
        }

        $module->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Module supprimé avec succès.'
        ], 200);
    }
}