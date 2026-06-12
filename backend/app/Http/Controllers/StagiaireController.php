<?php

namespace App\Http\Controllers;

use App\Models\Stagiaire;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class StagiaireController extends Controller
{
    /**
     * Afficher la liste de tous les stagiaires
     */
    public function index(Request $request)
    {
        $stagiaires = Stagiaire::with([
            'groupe.filiere',
            'groupe.affectations.anneeScolaire',
            'user',
        ])
            ->when($request->filled('idAnneeScolaire'), function ($query) use ($request) {
                $query->whereHas('groupe.affectations', function ($affectationQuery) use ($request) {
                    $affectationQuery->where('idAnneeScolaire', $request->idAnneeScolaire);
                });
            })
            ->orderBy('nom')
            ->orderBy('prenom')
            ->get();
        
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
            'email' => 'required|string|email|max:255|unique:stagiaires,email|unique:users,email',
            'telephone' => 'required|string',
            'idGroupe' => 'required|exists:groupes,idGroupe',
            'password' => 'nullable|string|min:6',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Erreur de validation des données.',
                'errors' => $validator->errors()
            ], 422);
        }

        $stagiaire = DB::transaction(function () use ($request) {
            $user = User::create([
                'nom' => $request->nom,
                'prenom' => $request->prenom,
                'email' => $request->email,
                'password' => Hash::make($request->password ?: 'password123'),
                'role' => 'stagiaire',
            ]);

            return Stagiaire::create([
                'nom' => $request->nom,
                'prenom' => $request->prenom,
                'email' => $request->email,
                'telephone' => $request->telephone,
                'idGroupe' => $request->idGroupe,
                'user_id' => $user->id,
            ])->load(['groupe.filiere', 'groupe.affectations.anneeScolaire', 'user']);
        });

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
        $stagiaire = Stagiaire::with([
            'groupe.filiere',
            'groupe.affectations.anneeScolaire',
            'presences',
            'notes',
            'user',
        ])->find($id);

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
            'email' => [
                'sometimes',
                'required',
                'email',
                'unique:stagiaires,email,' . $id . ',idStagiaire',
                'unique:users,email,' . ($stagiaire->user_id ?: 'NULL') . ',id',
            ],
            'telephone' => 'sometimes|required|string',
            'idGroupe' => 'sometimes|required|exists:groupes,idGroupe',
            'password' => 'nullable|string|min:6',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Erreur de validation des données.',
                'errors' => $validator->errors()
            ], 422);
        }

        DB::transaction(function () use ($request, $stagiaire) {
            $stagiaire->update($request->only(['nom', 'prenom', 'email', 'telephone', 'idGroupe']));

            if ($stagiaire->user) {
                $userData = $request->only(['nom', 'prenom', 'email']);
                if ($request->filled('password')) {
                    $userData['password'] = Hash::make($request->password);
                }
                $stagiaire->user->update($userData);
            }
        });

        $stagiaire->load(['groupe.filiere', 'groupe.affectations.anneeScolaire', 'user']);

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

        $user = $stagiaire->user;
        $stagiaire->delete();

        if ($user) {
            $user->delete();
        }

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

    /**
     * Exporter la liste des stagiaires en format CSV
     */
    public function exportCsv(Request $request)
    {
        $stagiaires = Stagiaire::with([
            'groupe.filiere',
            'groupe.affectations.anneeScolaire',
        ])
            ->when($request->filled('idAnneeScolaire') && $request->idAnneeScolaire !== 'Tous', function ($query) use ($request) {
                $query->whereHas('groupe.affectations', function ($affectationQuery) use ($request) {
                    $affectationQuery->where('idAnneeScolaire', $request->idAnneeScolaire);
                });
            })
            ->when($request->filled('idFiliere') && $request->idFiliere !== 'Tous', function ($query) use ($request) {
                $query->whereHas('groupe', function ($gQuery) use ($request) {
                    $gQuery->where('idFiliere', $request->idFiliere);
                });
            })
            ->when($request->filled('idGroupe') && $request->idGroupe !== 'Tous', function ($query) use ($request) {
                $query->where('idGroupe', $request->idGroupe);
            })
            ->orderBy('nom')
            ->orderBy('prenom')
            ->get();

        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="stagiaires_' . date('Y-m-d_H-i-s') . '.csv"',
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0'
        ];

        $callback = function() use ($stagiaires) {
            $file = fopen('php://output', 'w');
            
            // Add UTF-8 BOM for Excel compatibility
            fprintf($file, chr(0xEF).chr(0xBB).chr(0xBF));
            
            fputcsv($file, ['Nom', 'Prénom', 'Email', 'Téléphone', 'Groupe', 'Filière']);

            foreach ($stagiaires as $stg) {
                fputcsv($file, [
                    $stg->nom,
                    $stg->prenom,
                    $stg->email,
                    $stg->telephone ?? '',
                    $stg->groupe->libelle ?? 'N/A',
                    $stg->groupe->filiere->libelle ?? 'N/A',
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Importer des stagiaires à partir d'un fichier CSV
     */
    public function importCsv(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'file' => 'required|file|mimes:csv,txt',
            'idGroupe' => 'required|exists:groupes,idGroupe',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Le fichier est requis et doit être au format CSV.',
                'errors' => $validator->errors()
            ], 422);
        }

        $path = $request->file('file')->getRealPath();
        $file = fopen($path, 'r');

        // Check UTF-8 BOM
        $bom = fread($file, 3);
        if ($bom !== chr(0xEF) . chr(0xBB) . chr(0xBF)) {
            rewind($file); // No BOM, rewind to beginning
        }

        // Get header
        $header = fgetcsv($file);
        // Normalize header to lowercase and strip whitespace
        if ($header) {
            $header = array_map(function($h) {
                return strtolower(trim(str_replace('﻿', '', $h))); // Strip BOM characters if any
            }, $header);
        } else {
            fclose($file);
            return response()->json([
                'status' => 'error',
                'message' => 'Le fichier CSV est vide ou invalide.'
            ], 422);
        }

        // We expect headers: nom, prenom, email, telephone (in any order)
        // Let's map indices
        $nomIdx = array_search('nom', $header);
        $prenomIdx = array_search('prénom', $header);
        if ($prenomIdx === false) {
            $prenomIdx = array_search('prenom', $header);
        }
        $emailIdx = array_search('email', $header);
        $telIdx = array_search('téléphone', $header);
        if ($telIdx === false) {
            $telIdx = array_search('telephone', $header);
        }

        if ($nomIdx === false || $prenomIdx === false || $emailIdx === false) {
            fclose($file);
            return response()->json([
                'status' => 'error',
                'message' => 'Le fichier CSV doit contenir les colonnes : "Nom", "Prénom", et "Email". Les en-têtes trouvés sont : ' . implode(', ', $header)
            ], 422);
        }

        $importedCount = 0;
        $errors = [];
        $lineNum = 1;

        DB::transaction(function () use ($file, $nomIdx, $prenomIdx, $emailIdx, $telIdx, $request, &$importedCount, &$errors, &$lineNum) {
            while (($row = fgetcsv($file)) !== false) {
                $lineNum++;
                
                // Skip empty lines
                if (count($row) < 3 || empty(trim($row[$nomIdx])) || empty(trim($row[$prenomIdx])) || empty(trim($row[$emailIdx]))) {
                    continue;
                }

                $nom = trim($row[$nomIdx]);
                $prenom = trim($row[$prenomIdx]);
                $email = trim($row[$emailIdx]);
                $tel = $telIdx !== false && isset($row[$telIdx]) ? trim($row[$telIdx]) : '';

                // Validate email uniqueness
                if (User::where('email', $email)->exists() || Stagiaire::where('email', $email)->exists()) {
                    $errors[] = "Ligne $lineNum: L'email '$email' est déjà utilisé.";
                    continue;
                }

                // Create User
                $user = User::create([
                    'nom' => $nom,
                    'prenom' => $prenom,
                    'email' => $email,
                    'password' => Hash::make('password123'),
                    'role' => 'stagiaire',
                ]);

                // Create Stagiaire
                Stagiaire::create([
                    'nom' => $nom,
                    'prenom' => $prenom,
                    'email' => $email,
                    'telephone' => $tel ?: '0600000000',
                    'idGroupe' => $request->idGroupe,
                    'user_id' => $user->id,
                ]);

                $importedCount++;
            }
        });

        fclose($file);

        if (count($errors) > 0 && $importedCount === 0) {
            return response()->json([
                'status' => 'error',
                'message' => 'Aucun stagiaire n\'a été importé en raison d\'erreurs.',
                'errors' => $errors
            ], 422);
        }

        return response()->json([
            'status' => 'success',
            'message' => "$importedCount stagiaires ont été importés avec succès.",
            'errors' => $errors,
            'imported_count' => $importedCount
        ], 200);
    }
}
