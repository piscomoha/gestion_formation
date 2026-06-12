import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/PageHeader";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { workflowsApi } from "@/api/workflows.api";
import { anneeScolaireHooks } from "@/hooks/useAnneesScolaires";
import { formatDate, formatNumber } from "@/lib/utils";

function getValue(source: unknown, path: string) {
  return path.split(".").reduce<unknown>((value, key) => {
    if (value && typeof value === "object" && key in value) return (value as Record<string, unknown>)[key];
    return undefined;
  }, source);
}

export function StagiairePortalPage() {
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

  return (
    <div className="space-y-6">
      <PageHeader title="Mon espace stagiaire" description="Consultez uniquement vos notes validées et votre historique de présence." />
      <Card>
        <CardContent className="p-4">
          <select className="h-10 rounded-md border px-3" value={anneeId} onChange={(event) => setAnneeId(event.target.value)}>
            <option value="">Toutes les années</option>
            {annees.data?.map((annee) => <option key={annee.idAnneeScolaire} value={annee.idAnneeScolaire}>{annee.libelle}</option>)}
          </select>
        </CardContent>
      </Card>

      {(bulletin.isLoading || presences.isLoading) ? <LoadingSpinner /> : null}

      <Card>
        <CardHeader>
          <CardTitle>Bulletin</CardTitle>
          <p className="text-sm text-muted-foreground">Moyenne générale: {formatNumber(average, { maximumFractionDigits: 2 })}/20</p>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="p-3">Module</th>
                <th className="p-3">C1</th>
                <th className="p-3">C2</th>
                <th className="p-3">C3</th>
                <th className="p-3">C4</th>
                <th className="p-3">C5</th>
                <th className="p-3">EFM</th>
                <th className="p-3">Finale</th>
              </tr>
            </thead>
            <tbody>
              {bulletin.data?.notes.map((note) => {
                const row = note as unknown as Record<string, unknown>;
                return (
                  <tr key={note.idNote} className="border-b">
                    <td className="p-3">{String(getValue(row, "affectation.module.libelle") ?? "-")}</td>
                    <td className="p-3">{note.controle_1_absent ? "A" : note.controle_1 ?? "-"}</td>
                    <td className="p-3">{note.controle_2_absent ? "A" : note.controle_2 ?? "-"}</td>
                    <td className="p-3">{note.controle_3_absent ? "A" : note.controle_3 ?? "-"}</td>
                    <td className="p-3">{note.controle_4_absent ? "A" : note.controle_4 ?? "-"}</td>
                    <td className="p-3">{note.controle_5_absent ? "A" : note.controle_5 ?? "-"}</td>
                    <td className="p-3">{note.efm_absent ? "A" : note.efm ?? "-"}</td>
                    <td className="p-3 font-semibold">{note.note_finale ?? 0}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Historique des présences</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="p-3">Date</th>
                <th className="p-3">Heure</th>
                <th className="p-3">Module</th>
                <th className="p-3">Statut</th>
                <th className="p-3">Remarque</th>
              </tr>
            </thead>
            <tbody>
              {presences.data?.presences.map((presence) => {
                const row = presence as unknown as Record<string, unknown>;
                return (
                  <tr key={presence.idPresence} className="border-b">
                    <td className="p-3">{formatDate(presence.dateSeance)}</td>
                    <td className="p-3">{presence.heureSeance ?? "-"}</td>
                    <td className="p-3">{String(getValue(row, "affectation.module.libelle") ?? "-")}</td>
                    <td className="p-3"><Badge>{presence.statut}</Badge></td>
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
