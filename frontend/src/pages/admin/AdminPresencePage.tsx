import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/PageHeader";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { workflowsApi } from "@/api/workflows.api";
import { anneeScolaireHooks } from "@/hooks/useAnneesScolaires";
import { filiereHooks } from "@/hooks/useFilieres";
import { groupeHooks } from "@/hooks/useGroupes";
import { formatDate } from "@/lib/utils";

function getNestedLabel(source: unknown, path: string) {
  return path.split(".").reduce<unknown>((value, key) => {
    if (value && typeof value === "object" && key in value) {
      return (value as Record<string, unknown>)[key];
    }
    return undefined;
  }, source);
}

export function AdminPresencePage() {
  const [anneeId, setAnneeId] = useState("");
  const [filiereId, setFiliereId] = useState("");
  const [groupeId, setGroupeId] = useState("");
  const annees = anneeScolaireHooks.useList();
  const filieres = filiereHooks.useList();
  const groupes = groupeHooks.useList();
  const presences = useQuery({
    queryKey: ["admin-presences", anneeId, filiereId, groupeId],
    queryFn: () =>
      workflowsApi.adminPresences({
        annee_id: anneeId || undefined,
        idFiliere: filiereId || undefined,
        idGroupe: groupeId || undefined,
      }),
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Présences détaillées" description="Consultez les séances par groupe, stagiaire, année et remarques formateur." />
      <Card>
        <CardContent className="grid gap-4 p-4 md:grid-cols-3">
          <select className="h-10 rounded-md border px-3" value={anneeId} onChange={(event) => setAnneeId(event.target.value)}>
            <option value="">Toutes les années</option>
            {annees.data?.map((annee) => <option key={annee.idAnneeScolaire} value={annee.idAnneeScolaire}>{annee.libelle}</option>)}
          </select>
          <select className="h-10 rounded-md border px-3" value={filiereId} onChange={(event) => setFiliereId(event.target.value)}>
            <option value="">Toutes les filières</option>
            {filieres.data?.map((filiere) => <option key={filiere.idFiliere} value={filiere.idFiliere}>{filiere.libelle}</option>)}
          </select>
          <select className="h-10 rounded-md border px-3" value={groupeId} onChange={(event) => setGroupeId(event.target.value)}>
            <option value="">Tous les groupes</option>
            {groupes.data?.map((groupe) => <option key={groupe.idGroupe} value={groupe.idGroupe}>{groupe.libelle}</option>)}
          </select>
        </CardContent>
      </Card>

      {presences.isLoading ? <LoadingSpinner /> : null}
      <Card>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="p-3">Date</th>
                <th className="p-3">Heure</th>
                <th className="p-3">Stagiaire</th>
                <th className="p-3">Groupe</th>
                <th className="p-3">Module</th>
                <th className="p-3">Statut</th>
                <th className="p-3">Remarque</th>
              </tr>
            </thead>
            <tbody>
              {presences.data?.map((presence) => {
                const row = presence as unknown as Record<string, unknown>;
                const status = String(row.statut);
                return (
                  <tr key={presence.idPresence} className="border-b">
                    <td className="p-3">{formatDate(presence.dateSeance)}</td>
                    <td className="p-3">{presence.heureSeance ?? "-"}</td>
                    <td className="p-3">{String(getNestedLabel(row, "stagiaire.prenom") ?? "")} {String(getNestedLabel(row, "stagiaire.nom") ?? "")}</td>
                    <td className="p-3">{String(getNestedLabel(row, "affectation.groupe.libelle") ?? "-")}</td>
                    <td className="p-3">{String(getNestedLabel(row, "affectation.module.libelle") ?? "-")}</td>
                    <td className="p-3">
                      <Badge variant={status === "ABSENT" ? "destructive" : status === "RETARD" ? "secondary" : "default"}>{status}</Badge>
                    </td>
                    <td className="p-3">{presence.remarque ?? "-"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
