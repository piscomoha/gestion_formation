import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BookOpen, ClipboardCheck, GraduationCap, Send, UserX } from "lucide-react";
import { Link } from "react-router-dom";
import { workflowsApi } from "@/api/workflows.api";
import { anneeScolaireHooks } from "@/hooks/useAnneesScolaires";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const COLORS = ["#2563eb", "#16a34a", "#f97316", "#dc2626"];

function valueOf(source: unknown, path: string) {
  return path.split(".").reduce<unknown>((value, key) => {
    if (value && typeof value === "object" && key in value) return (value as Record<string, unknown>)[key];
    return undefined;
  }, source);
}

export function FormateurDashboardPage() {
  const annees = anneeScolaireHooks.useList();
  const [anneeId, setAnneeId] = useState("");

  const statsQuery = useQuery({
    queryKey: ["formateur-stats", anneeId],
    queryFn: () => workflowsApi.formateurStats({ annee_id: anneeId || undefined }),
  });

  const workspace = useQuery({
    queryKey: ["formateur-dashboard", anneeId],
    queryFn: () => workflowsApi.formateurWorkspace({ annee_id: anneeId || undefined }),
  });

  const summary = useMemo(() => {
    const affectations = workspace.data?.affectations ?? [];
    const stagiaires = workspace.data?.stagiaires ?? [];

    const groupes = affectations.reduce<Array<{ id: number; label: string }>>((items, affectation) => {
      const id = Number(valueOf(affectation, "idGroupe"));
      if (!id || items.some((item) => item.id === id)) return items;

      items.push({
        id,
        label: String(valueOf(affectation, "groupe.libelle") ?? `Groupe ${id}`),
      });
      return items;
    }, []);

    const modules = affectations.reduce<Array<{ id: number; label: string }>>((items, affectation) => {
      const id = Number(valueOf(affectation, "idModule"));
      if (!id || items.some((item) => item.id === id)) return items;

      items.push({
        id,
        label: String(valueOf(affectation, "module.libelle") ?? `Module ${id}`),
      });
      return items;
    }, []);

    const stagiairesParGroupe = groupes.map((groupe) => ({
      ...groupe,
      count: stagiaires.filter((stagiaire) => Number(stagiaire.idGroupe) === groupe.id).length,
    }));

    return {
      affectations,
      groupes,
      modules,
      stagiaires,
      stagiairesParGroupe,
    };
  }, [workspace.data]);

  const presenceData = useMemo(() => {
    const presences = statsQuery.data?.presences;
    if (!presences) return [];
    return [
      { name: "Présents", value: presences.present },
      { name: "Absents", value: presences.absent + presences.justifie },
    ];
  }, [statsQuery.data?.presences]);

  const notesParModule = statsQuery.data?.notes_par_module ?? [];

  if (workspace.isLoading || statsQuery.isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tableau de bord formateur"
        description="Résumé de vos modules, présences et notes."
      />

      <Card>
        <CardContent className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <select
              className="h-10 rounded-md border px-3"
              value={anneeId}
              onChange={(event) => setAnneeId(event.target.value)}
            >
              <option value="">Toutes les annees</option>
              {annees.data?.map((annee) => (
                <option key={annee.idAnneeScolaire} value={annee.idAnneeScolaire}>
                  {annee.libelle}
                </option>
              ))}
            </select>
          </div>
          <Button asChild>
            <Link to="/formateur">
              <Send className="mr-2 h-4 w-4" />
              Ouvrir l’espace formateur
            </Link>
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Modules affectés</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsQuery.data?.modules_affectes ?? 0}</div>
            <p className="text-xs text-muted-foreground">Modules pris en charge</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stagiaires</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsQuery.data?.stagiaires ?? 0}</div>
            <p className="text-xs text-muted-foreground">Sur vos groupes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Absences</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsQuery.data?.total_absences ?? 0}</div>
            <p className="text-xs text-muted-foreground">Sur toutes les séances</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Moyenne notes</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(statsQuery.data?.moyenne_notes ?? 0).toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">Sur 20</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Moyenne des notes par module</CardTitle>
            <CardDescription>Moyenne calculée à partir des notes saisies.</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={notesParModule}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="libelle" tick={{ fontSize: 12 }} interval={0} height={60} />
                <YAxis domain={[0, 20]} />
                <Tooltip />
                <Bar dataKey="moyenne" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Répartition des présences</CardTitle>
            <CardDescription>Présences vs absences sur vos séances.</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={presenceData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={110}
                  label
                >
                  {presenceData.map((entry, index) => (
                    <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Mes affectations</CardTitle>
            <CardDescription>Resume des cours pris en charge pour l'annee selectionnee.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {summary.affectations.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucune affectation trouvee.</p>
            ) : (
              summary.affectations.map((affectation) => (
                <div
                  key={String(valueOf(affectation, "idAffectation"))}
                  className="rounded-lg border p-3"
                >
                  <p className="font-medium">
                    {String(valueOf(affectation, "module.libelle") ?? "Module")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {String(valueOf(affectation, "groupe.libelle") ?? "Groupe")}{" "}
                    •{" "}
                    {String(valueOf(affectation, "anneeScolaire.libelle") ?? "Annee")}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Stagiaires par groupe</CardTitle>
            <CardDescription>Repartition des stagiaires sur vos groupes.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {summary.stagiairesParGroupe.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucun groupe trouve.</p>
            ) : (
              summary.stagiairesParGroupe.map((groupe) => (
                <div key={groupe.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="font-medium">{groupe.label}</p>
                    <p className="text-sm text-muted-foreground">Groupe suivi</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold">{groupe.count}</p>
                    <p className="text-xs text-muted-foreground">stagiaires</p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Modules enseignes</CardTitle>
          <CardDescription>Liste des modules presents dans vos affectations.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {summary.modules.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucun module trouve.</p>
          ) : (
            summary.modules.map((module) => (
              <div key={module.id} className="rounded-lg border p-3">
                <p className="font-medium">{module.label}</p>
                <p className="text-sm text-muted-foreground">Module enseigne dans vos groupes.</p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
