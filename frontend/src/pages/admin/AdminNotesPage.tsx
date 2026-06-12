import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/PageHeader";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { workflowsApi } from "@/api/workflows.api";
import { anneeScolaireHooks } from "@/hooks/useAnneesScolaires";
import { filiereHooks } from "@/hooks/useFilieres";
import { groupeHooks } from "@/hooks/useGroupes";
import { formatNumber } from "@/lib/utils";
import type { Note } from "@/types";

interface EnrichedNote extends Note {
  stagiaire?: {
    nom?: string;
    prenom?: string;
  };
  affectation?: {
    groupe?: { libelle?: string };
    module?: { libelle?: string };
  };
}

export function AdminNotesPage() {
  const queryClient = useQueryClient();
  const [anneeId, setAnneeId] = useState("");
  const [filiereId, setFiliereId] = useState("");
  const [groupeId, setGroupeId] = useState("");
  const annees = anneeScolaireHooks.useList();
  const filieres = filiereHooks.useList();
  const groupes = groupeHooks.useList();
  const notes = useQuery({
    queryKey: ["admin-notes", anneeId, filiereId, groupeId],
    queryFn: () =>
      workflowsApi.adminNotes({
        annee_id: anneeId || undefined,
        idFiliere: filiereId || undefined,
        idGroupe: groupeId || undefined,
      }),
  });

  const validateMutation = useMutation({
    mutationFn: workflowsApi.validateNotes,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-notes"] }),
  });

  const devalidateMutation = useMutation({
    mutationFn: workflowsApi.devalidateNotes,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-notes"] }),
  });

  const grouped = useMemo(() => {
    return ((notes.data ?? []) as EnrichedNote[]).reduce<Record<string, EnrichedNote[]>>((acc, note) => {
      const key = String(note.idAffectation);
      acc[key] = [...(acc[key] ?? []), note];
      return acc;
    }, {});
  }, [notes.data]);

  return (
    <div className="space-y-6">
      <PageHeader title="Validation des notes" description="Filtrer par année, filière et groupe puis valider les notes reçues des formateurs." />
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

      {notes.isLoading ? <LoadingSpinner /> : null}

      <div className="space-y-4">
        {Object.entries(grouped).map(([idAffectation, lines]) => {
          const first = lines?.[0];
          const affectation = first?.affectation;
          const status = lines?.some((line) => line.status === "validated") ? "validated" : "submitted";

          return (
            <Card key={idAffectation}>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">
                  {affectation?.groupe?.libelle ?? `Groupe #${idAffectation}`} - {affectation?.module?.libelle ?? "Module"}
                </CardTitle>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => validateMutation.mutate(Number(idAffectation))}>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Valider
                  </Button>
                  {status === "validated" ? (
                    <Button size="sm" variant="outline" onClick={() => devalidateMutation.mutate(Number(idAffectation))}>
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Dévalider
                    </Button>
                  ) : null}
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left">
                        <th className="p-2">Stagiaire</th>
                        <th className="p-2">C1</th>
                        <th className="p-2">C2</th>
                        <th className="p-2">C3</th>
                        <th className="p-2">C4</th>
                        <th className="p-2">C5</th>
                        <th className="p-2">EFM</th>
                        <th className="p-2">Finale</th>
                        <th className="p-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lines?.map((line) => {
                        return (
                          <tr key={line.idNote} className="border-b">
                            <td className="p-2">{line.stagiaire?.prenom} {line.stagiaire?.nom}</td>
                            <td className="p-2">{line.controle_1_absent ? "A" : line.controle_1 ?? "-"}</td>
                            <td className="p-2">{line.controle_2_absent ? "A" : line.controle_2 ?? "-"}</td>
                            <td className="p-2">{line.controle_3_absent ? "A" : line.controle_3 ?? "-"}</td>
                            <td className="p-2">{line.controle_4_absent ? "A" : line.controle_4 ?? "-"}</td>
                            <td className="p-2">{line.controle_5_absent ? "A" : line.controle_5 ?? "-"}</td>
                            <td className="p-2">{line.efm_absent ? "A" : line.efm ?? "-"}</td>
                            <td className="p-2 font-semibold">{formatNumber(Number(line.note_finale ?? 0), { maximumFractionDigits: 2 })}</td>
                            <td className="p-2">{line.status}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
