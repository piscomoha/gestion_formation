<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\AnneeScolaire;
use App\Models\Filiere;
use App\Models\Groupe;
use App\Models\Module;
use App\Models\Formateur;
use App\Models\Stagiaire;
use App\Models\Affectation;
use App\Models\Presence;
use App\Models\Note;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Année Scolaire
        $annee = AnneeScolaire::create([
            'libelle' => '2025/2026',
            'dateDebut' => '2025-09-01',
            'dateFin' => '2026-07-15',
        ]);

        // 2. Filières
        $filiereDev = Filiere::create(['libelle' => 'Développement Digital', 'description' => 'Filière spécialisée dans le développement de logiciels et web.']);
        $filiereInf = Filiere::create(['libelle' => 'Infrastructure Digitale', 'description' => 'Réseaux, systèmes et sécurité informatique.']);
        $filiereDig = Filiere::create(['libelle' => 'Digital Marketing', 'description' => 'Marketing digital et stratégie numérique.']);

        // 3. Groupes
        $groupeDev1 = Groupe::create(['libelle' => 'DEV101', 'effectif' => 25, 'idFiliere' => $filiereDev->idFiliere]);
        $groupeDev2 = Groupe::create(['libelle' => 'DEV102', 'effectif' => 22, 'idFiliere' => $filiereDev->idFiliere]);
        $groupeInf1 = Groupe::create(['libelle' => 'INF201', 'effectif' => 20, 'idFiliere' => $filiereInf->idFiliere]);
        $groupeDig1 = Groupe::create(['libelle' => 'DIG101', 'effectif' => 15, 'idFiliere' => $filiereDig->idFiliere]);

        // 4. Modules
        $moduleReact = Module::create(['libelle' => 'Développement Frontend React', 'coefficient' => 4]);
        $moduleLaravel = Module::create(['libelle' => 'Développement Backend Laravel', 'coefficient' => 3]);
        $moduleDevOps = Module::create(['libelle' => 'Pratiques DevOps', 'coefficient' => 2]);
        $moduleReseau = Module::create(['libelle' => 'Réseaux et Sécurité', 'coefficient' => 4]);
        $moduleCloud = Module::create(['libelle' => 'Architecture Cloud', 'coefficient' => 3]);
        $moduleSEO = Module::create(['libelle' => 'Référencement SEO', 'coefficient' => 2]);

        // 5. Users and Profiles
        
        // Admin
        User::create([
            'nom' => 'Admin',
            'prenom' => 'Super',
            'email' => 'admin@ofppt.ma',
            'password' => Hash::make('password123'),
            'role' => 'admin'
        ]);
        $formateurUser = User::create([
            'nom' => 'Formateur',
            'prenom' => 'Mohammed',
            'email' => 'form@ofppt.ma',
            'password' => Hash::make('password123'),
            'role' => 'formateur'
        ]);
        Formateur::create([
            'nom'        => 'Formateur',
            'prenom'     => 'Mohammed',
            'email'      => 'form@ofppt.ma',
            'telephone'  => '0600000000',
            'specialite' => 'Informatique',
            'user_id'    => $formateurUser->id
        ]);

        $stagiaireUser = User::create([
            'nom' => 'Stagiaire',
            'prenom' => 'Mohammed',
            'email' => 'stagiaire@ofppt.ma',
            'password' => Hash::make('password123'),
            'role' => 'stagiaire'
        ]);
        $stagiairePrincipal = Stagiaire::create([
            'nom'        => 'Stagiaire',
            'prenom'     => 'Mohammed',
            'email'      => 'stagiaire@ofppt.ma',
            'telephone'  => '0600000000',
            'idGroupe'   => $groupeDev1->idGroupe,
            'user_id'    => $stagiaireUser->id
        ]);

        // Formateurs (1 base + 6 enrichis)
        $formateurData = [
            ['nom' => 'El Amrani', 'prenom' => 'Youssef', 'email' => 'youssef.elamrani@ofppt.ma', 'tel' => '0612345678', 'specialite' => 'Développement Digital'],
            ['nom' => 'Bennani',   'prenom' => 'Amina',   'email' => 'amina.bennani@ofppt.ma',    'tel' => '0698765432', 'specialite' => 'Infrastructure Digitale'],
            ['nom' => 'Mansouri',  'prenom' => 'Karim',   'email' => 'k.mansouri@ofppt.ma',       'tel' => '0655443322', 'specialite' => 'DevOps & Cloud'],
            ['nom' => 'Zahra',     'prenom' => 'Fatima',  'email' => 'f.zahra@ofppt.ma',          'tel' => '0622334455', 'specialite' => 'Design & Multimédia'],
            ['nom' => 'Tazi',      'prenom' => 'Ahmed',   'email' => 'a.tazi@ofppt.ma',           'tel' => '0677889900', 'specialite' => 'Intelligence Artificielle'],
            ['nom' => 'Slaoui',    'prenom' => 'Nadia',   'email' => 'n.slaoui@ofppt.ma',         'tel' => '0644556677', 'specialite' => 'Gestion & Soft Skills'],
            ['nom' => 'Idrissi',   'prenom' => 'Omar',    'email' => 'o.idrissi@ofppt.ma',        'tel' => '0611223344', 'specialite' => 'Infrastructure Digitale'],
        ];

        $formateursObj = [];
        foreach ($formateurData as $data) {
            $user = User::create([
                'nom' => $data['nom'],
                'prenom' => $data['prenom'],
                'email' => $data['email'],
                'password' => Hash::make('password123'),
                'role' => 'formateur'
            ]);
            $formateursObj[] = Formateur::create([
                'nom'        => $data['nom'],
                'prenom'     => $data['prenom'],
                'email'      => $data['email'],
                'telephone'  => $data['tel'],
                'specialite' => $data['specialite'],
                'user_id'    => $user->id
            ]);
        }

        // Stagiaires DEV101
        $stagiairesData = [
            ['nom' => 'Alaoui', 'prenom' => 'Mohammed', 'email' => 'mohammed.alaoui@ofppt.ma'],
            ['nom' => 'Benjelloun', 'prenom' => 'Sara', 'email' => 'sara.benjelloun@ofppt.ma'],
            ['nom' => 'Chraibi', 'prenom' => 'Omar', 'email' => 'omar.chraibi@ofppt.ma'],
            ['nom' => 'Idrissi', 'prenom' => 'Fatima', 'email' => 'fatima.idrissi@ofppt.ma'],
            ['nom' => 'Kabbaj', 'prenom' => 'Yassine', 'email' => 'yassine.kabbaj@ofppt.ma'],
        ];

        $stagiairesObj = [$stagiairePrincipal];
        foreach ($stagiairesData as $data) {
            $user = User::create([
                'nom' => $data['nom'],
                'prenom' => $data['prenom'],
                'email' => $data['email'],
                'password' => Hash::make('password123'),
                'role' => 'stagiaire'
            ]);
            
            $stagiairesObj[] = Stagiaire::create([
                'nom' => $data['nom'],
                'prenom' => $data['prenom'],
                'email' => $data['email'],
                'telephone' => '060000000' . rand(0, 9),
                'idGroupe' => $groupeDev1->idGroupe,
                'user_id' => $user->id
            ]);
        }

        // 6. Affectations
        $affectation1 = Affectation::create(['idAnneeScolaire' => $annee->idAnneeScolaire, 'idFormateur' => $formateursObj[0]->idFormateur, 'idModule' => $moduleReact->idModule, 'idGroupe' => $groupeDev1->idGroupe]);
        $affectation2 = Affectation::create(['idAnneeScolaire' => $annee->idAnneeScolaire, 'idFormateur' => $formateursObj[0]->idFormateur, 'idModule' => $moduleLaravel->idModule, 'idGroupe' => $groupeDev1->idGroupe]);
        $affectation3 = Affectation::create(['idAnneeScolaire' => $annee->idAnneeScolaire, 'idFormateur' => $formateursObj[1]->idFormateur, 'idModule' => $moduleReseau->idModule, 'idGroupe' => $groupeInf1->idGroupe]);
        
        // 3 Clean Affectations for CRUD
        Affectation::create(['idAnneeScolaire' => $annee->idAnneeScolaire, 'idFormateur' => $formateursObj[2]->idFormateur, 'idModule' => $moduleDevOps->idModule, 'idGroupe' => $groupeDev2->idGroupe]);
        Affectation::create(['idAnneeScolaire' => $annee->idAnneeScolaire, 'idFormateur' => $formateursObj[3]->idFormateur, 'idModule' => $moduleCloud->idModule, 'idGroupe' => $groupeInf1->idGroupe]);
        Affectation::create(['idAnneeScolaire' => $annee->idAnneeScolaire, 'idFormateur' => $formateursObj[4]->idFormateur, 'idModule' => $moduleSEO->idModule, 'idGroupe' => $groupeDig1->idGroupe]);

        // 7. Test Presences and Notes for Affectation 1 (React - DEV101)
        $dateAppel = Carbon::now()->subDays(2)->format('Y-m-d');
        foreach ($stagiairesObj as $index => $stg) {
            Presence::create([
                'idAffectation' => $affectation1->idAffectation,
                'idStagiaire' => $stg->idStagiaire,
                'dateSeance' => $dateAppel,
                'statut' => $index === 0 ? 'Absent' : ($index === 1 ? 'Justifie' : 'Present')
            ]);
            
            Note::create([
                'idAffectation' => $affectation1->idAffectation,
                'idStagiaire' => $stg->idStagiaire,
                'note' => rand(10, 19) + ($index % 2 === 0 ? 0.5 : 0),
                'dateEvaluation' => Carbon::now()->subDays(10)->format('Y-m-d')
            ]);

            Note::create([
                'idAffectation' => $affectation2->idAffectation,
                'idStagiaire' => $stg->idStagiaire,
                'note' => rand(8, 18),
                'dateEvaluation' => Carbon::now()->subDays(5)->format('Y-m-d')
            ]);
        }

        // Additional data for Stagiaire Principal (Mohammed) for a richer dashboard
        Presence::create([
            'idAffectation' => $affectation2->idAffectation,
            'idStagiaire' => $stagiairePrincipal->idStagiaire,
            'dateSeance' => Carbon::now()->subDays(1)->format('Y-m-d'),
            'statut' => 'Present'
        ]);
        Presence::create([
            'idAffectation' => $affectation1->idAffectation,
            'idStagiaire' => $stagiairePrincipal->idStagiaire,
            'dateSeance' => Carbon::now()->subDays(4)->format('Y-m-d'),
            'statut' => 'Justifie'
        ]);
    }
}
