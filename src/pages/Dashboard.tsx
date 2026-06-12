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
import { BookOpen, ClipboardCheck, GraduationCap, Users } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageHeader } from "@/components/shared/PageHeader";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { filiereHooks } from "@/hooks/useFilieres";
import { groupeHooks } from "@/hooks/useGroupes";
import { stagiaireHooks } from "@/hooks/useStagiaires";
import { formateurHooks } from "@/hooks/useFormateurs";
import { moduleHooks } from "@/hooks/useModules";
import { presenceHooks } from "@/hooks/usePresences";
import { noteHooks } from "@/hooks/useNotes";
import { formatNumber } from "@/lib/utils";

const COLORS = ["#2563eb", "#16a34a", "#f97316", "#dc2626"];

export function Dashboard() {
  const filieres = filiereHooks.useList();
  const groupes = groupeHooks.useList();
  const stagiaires = stagiaireHooks.useList();
  const formateurs = formateurHooks.useList();
  const modules = moduleHooks.useList();
  const presences = presenceHooks.useList();
  const notes = noteHooks.useList();

  const isLoading = [
    filieres,
    groupes,
    stagiaires,
    formateurs,
    modules,
    presences,
    notes,
  ].some((query) => query.isLoading);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const moyenne =
    notes.data && notes.data.length > 0
      ? notes.data.reduce((total, item) => total + Number(item.note), 0) /
        notes.data.length
      : 0;

  const groupesParFiliere =
    filieres.data?.map((filiere) => ({
      name: String(filiere.libelle),
      groupes:
        groupes.data?.filter(
          (groupe) => Number(groupe.idFiliere) === Number(filiere.idFiliere),
        ).length ?? 0,
      stagiaires:
        stagiaires.data?.filter((stagiaire) =>
          groupes.data
            ?.filter(
              (groupe) => Number(groupe.idFiliere) === Number(filiere.idFiliere),
            )
            .some(
              (groupe) => Number(groupe.idGroupe) === Number(stagiaire.idGroupe),
            ),
        ).length ?? 0,
    })) ?? [];

  const presenceData = ["PRESENT", "ABSENT", "RETARD"].map((statut) => ({
    name: statut,
    value:
      presences.data?.filter((presence) => presence.statut === statut).length ?? 0,
  }));

  const stats = [
    {
      label: "Filieres",
      value: filieres.data?.length ?? 0,
      icon: BookOpen,
      description: "Parcours actifs",
    },
    {
      label: "Groupes",
      value: groupes.data?.length ?? 0,
      icon: Users,
      description: "Groupes ouverts",
    },
    {
      label: "Stagiaires",
      value: stagiaires.data?.length ?? 0,
      icon: GraduationCap,
      description: "Apprenants inscrits",
    },
    {
      label: "Moyenne notes",
      value: formatNumber(moyenne, { maximumFractionDigits: 1 }),
      icon: ClipboardCheck,
      description: "Sur 20",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Vue d'ensemble des formations, effectifs, presences et evaluations."
      />

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

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Effectifs par filiere</CardTitle>
            <CardDescription>Groupes et stagiaires par parcours.</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={groupesParFiliere}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="groupes" fill="#2563eb" radius={[6, 6, 0, 0]} />
                <Bar dataKey="stagiaires" fill="#16a34a" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Repartition des presences</CardTitle>
            <CardDescription>Statuts saisis dans les seances.</CardDescription>
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

      <Card>
        <CardHeader>
          <CardTitle>Capacite pedagogique</CardTitle>
          <CardDescription>
            {formateurs.data?.length ?? 0} formateurs pour {modules.data?.length ?? 0} modules.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
