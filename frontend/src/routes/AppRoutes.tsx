import { Navigate, createBrowserRouter } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { LoginPage } from "@/pages/LoginPage";
import { RoleHome } from "@/pages/RoleHome";
import { FiliereList } from "@/pages/filieres/FiliereList";
import { GroupeList } from "@/pages/groupes/GroupeList";
import { AnneeScolaireList } from "@/pages/annees-scolaires/AnneeScolaireList";
import { FormateurList } from "@/pages/formateurs/FormateurList";
import { ModuleList } from "@/pages/modules/ModuleList";
import { StagiaireList } from "@/pages/stagiaires/StagiaireList";
import { AffectationList } from "@/pages/affectations/AffectationList";
import { PresenceList } from "@/pages/presences/PresenceList";
import { NoteList } from "@/pages/notes/NoteList";
import { AdminNotesPage } from "@/pages/admin/AdminNotesPage";
import { AdminPresencePage } from "@/pages/admin/AdminPresencePage";
import { AdminImportPage } from "@/pages/admin/AdminImportPage";
import { FormateurDashboardPage } from "@/pages/formateur/FormateurDashboardPage";
import { FormateurWorkspacePage } from "@/pages/formateur/FormateurWorkspacePage";
import { StagiaireDashboardPage } from "@/pages/stagiaire/StagiaireDashboardPage";
import { StagiaireBulletinPage } from "@/pages/stagiaire/StagiaireBulletinPage";

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  {
    path: "/",
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { index: true, element: <RoleHome /> },
          {
            element: <ProtectedRoute roles={["admin"]} />,
            children: [
              { path: "admin/notes", element: <AdminNotesPage /> },
              { path: "admin/presences", element: <AdminPresencePage /> },
              { path: "admin/import", element: <AdminImportPage /> },
              { path: "filieres", element: <FiliereList /> },
              { path: "groupes", element: <GroupeList /> },
              { path: "annees-scolaires", element: <AnneeScolaireList /> },
              { path: "formateurs", element: <FormateurList /> },
              { path: "modules", element: <ModuleList /> },
              { path: "stagiaires", element: <StagiaireList /> },
              { path: "affectations", element: <AffectationList /> },
              { path: "presences", element: <PresenceList /> },
              { path: "notes", element: <NoteList /> },
            ],
          },
          {
            element: <ProtectedRoute roles={["formateur"]} />,
            children: [
              { path: "formateur", element: <FormateurWorkspacePage /> },
              { path: "formateur/dashboard", element: <FormateurDashboardPage /> },
            ],
          },
          {
            element: <ProtectedRoute roles={["stagiaire"]} />,
            children: [
              { path: "stagiaire/dashboard", element: <StagiaireDashboardPage /> },
              { path: "stagiaire/bulletin", element: <StagiaireBulletinPage /> }
            ],
          },
          { path: "*", element: <Navigate to="/" replace /> },
        ],
      },
    ],
  },
]);
