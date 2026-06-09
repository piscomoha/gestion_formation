<?php

namespace App\Http\Controllers;

use App\Models\Filiere;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class FiliereController extends Controller
{
    public function index()
    {
        $filieres = Filiere::withCount('groupes')->get();
        return response()->json(['status' => 'success', 'data' => $filieres], 200);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'libelle' => 'required|string|max:255|unique:filieres,libelle',
            'description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 'error', 'errors' => $validator->errors()], 422);
        }

        $filiere = Filiere::create($request->all());
        return response()->json(['status' => 'success', 'message' => 'Filière créée avec succès.', 'data' => $filiere], 201);
    }

    public function update(Request $request, $id)
    {
        $filiere = Filiere::find($id);
        if (!$filiere) return response()->json(['status' => 'error', 'message' => 'Filière introuvable.'], 404);

        $filiere->update($request->all());
        return response()->json(['status' => 'success', 'message' => 'Filière mise à jour avec succès.', 'data' => $filiere], 200);
    }

    public function destroy($id)
    {
        $filiere = Filiere::find($id);
        if (!$filiere) return response()->json(['status' => 'error', 'message' => 'Filière introuvable.'], 404);

        if ($filiere->groupes()->count() > 0) {
            return response()->json(['status' => 'error', 'message' => 'Impossible de supprimer cette filière car elle contient des groupes.'], 409);
        }

        $filiere->delete();
        return response()->json(['status' => 'success', 'message' => 'Filière supprimée avec succès.'], 200);
    }
}