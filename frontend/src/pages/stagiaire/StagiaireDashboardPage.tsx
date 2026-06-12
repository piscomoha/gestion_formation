import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/PageHeader";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { workflowsApi } from "@/api/workflows.api";
import { anneeScolaireHooks } from "@/hooks/useAnneesScolaires";
import { formatNumber } from "@/lib/utils";
import { BookOpen, ClipboardCheck, AlertCircle, CheckCircle2 } from "lucide-react";
import {
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  Cell,
} from "recharts";

const COLORS = ["#16a34a", "#dc2626"];

export function StagiaireDashboardPage() {
  const [anneeId, setAnneeId] = useState("");
  const annees = anneeScolaireHooks.useList();
  const bulletin = useQuery({
    queryKey: ["stagiaire-bulletin", anneeId],
    queryFn: () => workflowsApi.bulletin({ annee_id: anneeId || undefined }),
  });
  const presences = useQuery({
    queryKey: ["stagiaire-presences", anneeId],
    queryFn: () => workflowsApi.stagiairePresences({ annee_id: anneeId || undefined }),
  });

  const average =
    bulletin.data?.notes && bulletin.data.notes.length > 0
      ? bulletin.data.notes.reduce((sum, note) => sum + Number(note.note_finale ?? 0), 0) / bulletin.data.notes.length
      : 0;

  const totalModules = bulletin.data?.notes.length ?? 0;
  
  const absences = presences.data?.presences.filter(p => p.statut === 'ABSENT').length ?? 0;
  const presents = presences.data?.presences.filter(p => p.statut === 'PRESENT').length ?? 0;

  const stats = [
    {
      label: "Modules Évalués",
      value: totalModules,
      icon: BookOpen,
      description: "Modules avec notes",
    },
    {
      label: "Moyenne Générale",
      value: formatNumber(average, { maximumFractionDigits: 2 }),
      icon: ClipboardCheck,
      description: "Sur 20",
    },
    {
      label: "Séances Présent",
      value: presents,
      icon: CheckCircle2,
      description: "Total des présences",
    },
    {
      label: "Absences",
      value: absences,
      icon: AlertCircle,
      description: "Total des absences",
    },
  ];

  const presenceData = [
    { name: "Présent", value: presents },
    { name: "Absent", value: absences },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6">
      <PageHeader title="Tableau de bord" description="Vue d'ensemble de vos performances et de votre assiduité." />
      <Card>
        <CardContent className="p-4">
          <select className="h-10 rounded-md border px-3" value={anneeId} onChange={(event) => setAnneeId(event.target.value)}>
            <option value="">Toutes les années</option>
            {annees.data?.map((annee) => <option key={annee.idAnneeScolaire} value={annee.idAnneeScolaire}>{annee.libelle}</option>)}
          </select>
        </CardContent>
      </Card>

      {(bulletin.isLoading || presences.isLoading) ? <LoadingSpinner /> : null}

      {!bulletin.isLoading && !presences.isLoading && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Répartition des présences</CardTitle>
            <CardDescription>Vue d'ensemble des absences et présences.</CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            {presenceData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={presenceData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {presenceData.map((entry, index) => (
                      <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                Aucune donnée de présence
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
