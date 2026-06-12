<?php

namespace App\Http\Controllers;

use App\Models\Stagiaire;
use App\Models\Formateur;
use App\Models\Groupe;
use App\Models\Presence;
use App\Models\Filiere;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index()
    {
        $totalStagiaires = Stagiaire::count();
        $totalFormateurs = Formateur::count();
        $totalGroupes = Groupe::count();

        // Calculate average attendance rate (simulated logic for now based on presence table)
        $totalPresences = Presence::count();
        $presentCount = Presence::where('statut', 'Present')->count();
        $attendanceRate = $totalPresences > 0 ? round(($presentCount / $totalPresences) * 100, 2) : 0;

        // Performance by Filiere (average notes)
        $filierePerformance = Filiere::with(['groupes.stagiaires.notes'])->get()->map(function ($filiere) {
            $notes = $filiere->groupes->flatMap(function ($groupe) {
                return $stagiairesNotes = $groupe->stagiaires->flatMap->notes;
            });
            
            return [
                'label' => $filiere->nomFiliere,
                'value' => $notes->avg('note') ? round(($notes->avg('note') / 20) * 100, 2) : 0,
            ];
        });

        return response()->json([
            'status' => 'success',
            'data' => [
                'stats' => [
                    'totalStagiaires' => $totalStagiaires,
                    'totalFormateurs' => $totalFormateurs,
                    'totalGroupes' => $totalGroupes,
                    'attendanceRate' => $attendanceRate,
                ],
                'filierePerformance' => $filierePerformance,
            ]
        ]);
    }
}
