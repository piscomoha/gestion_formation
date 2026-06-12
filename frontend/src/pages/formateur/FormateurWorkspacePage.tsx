import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/shared/PageHeader";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { workflowsApi } from "@/api/workflows.api";
import { anneeScolaireHooks } from "@/hooks/useAnneesScolaires";

type NoteLine = Record<string, string | number | boolean | null>;
type PresenceLine = { idStagiaire: number; statut: "PRESENT" | "ABSENT" | "RETARD"; remarque?: string };

function valueOf(source: unknown, path: string) {
  return path.split(".").reduce<unknown>((value, key) => {
    if (value && typeof value === "object" && key in value) return (value as Record<string, unknown>)[key];
    return undefined;
  }, source);
}

export function FormateurWorkspacePage() {
  const queryClient = useQueryClient();
  const annees = anneeScolaireHooks.useList();
  const [anneeId, setAnneeId] = useState("");
  const [search, setSearch] = useState("");
  const [affectationId, setAffectationId] = useState("");
  const [controlCount, setControlCount] = useState(2);
  const [dateEvaluation, setDateEvaluation] = useState(new Date().toISOString().slice(0, 10));
  const [dateSeance, setDateSeance] = useState(new Date().toISOString().slice(0, 10));
  const [heureSeance, setHeureSeance] = useState("09:00");
  const [notes, setNotes] = useState<Record<number, NoteLine>>({});
  const [presences, setPresences] = useState<Record<number, PresenceLine>>({});

  const workspace = useQuery({
    queryKey: ["formateur-workspace", anneeId, search],
    queryFn: () => workflowsApi.formateurWorkspace({ annee_id: anneeId || undefined, search: search || undefined }),
  });

  const selectedAffectation = useMemo(
    () => workspace.data?.affectations.find((item) => String(valueOf(item, "idAffectation")) === affectationId),
    [affectationId, workspace.data?.affectations],
  );

  const selectedGroupId = selectedAffectation ? Number(valueOf(selectedAffectation, "idGroupe")) : null;

  const stagiaires = useMemo(() => {
    const allStagiaires = workspace.data?.stagiaires ?? [];
    if (!selectedGroupId) return allStagiaires;
    return allStagiaires.filter((stagiaire) => Number(stagiaire.idGroupe) === selectedGroupId);
  }, [selectedGroupId, workspace.data?.stagiaires]);

  const submitNotes = useMutation({
    mutationFn: workflowsApi.submitNotes,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("Notes envoyees a l'admin");
    },
  });

  const submitPresence = useMutation({
    mutationFn: workflowsApi.submitPresence,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("Presence envoyee a l'admin");
    },
  });

  useEffect(() => {
    if (!workspace.data?.affectations?.length) {
      if (affectationId) setAffectationId("");
      return;
    }

    const affectationStillExists = workspace.data.affectations.some(
      (item) => String(valueOf(item, "idAffectation")) === affectationId,
    );

    if (!affectationId || !affectationStillExists) {
      setAffectationId(String(valueOf(workspace.data.affectations[0], "idAffectation") ?? ""));
    }
  }, [affectationId, workspace.data?.affectations]);

  useEffect(() => {
    setNotes({});
    setPresences({});
  }, [affectationId]);

  function setNoteValue(idStagiaire: number, field: string, value: string | boolean) {
    setNotes((current) => ({
      ...current,
      [idStagiaire]: {
        ...(current[idStagiaire] ?? { idStagiaire }),
        [field]: value === "" ? null : value,
      },
    }));
  }

  function handleSubmitNotes() {
    if (!affectationId) {
      toast.error("Choisissez une affectation");
      return;
    }

    submitNotes.mutate({
      idAffectation: Number(affectationId),
      dateEvaluation,
      notes: stagiaires.map((stagiaire) => {
        const cleanLine: NoteLine = {};
        Object.entries(notes[stagiaire.idStagiaire] ?? {}).forEach(([key, value]) => {
          if (key !== "idStagiaire") cleanLine[key] = value;
        });
        return Object.assign({ idStagiaire: stagiaire.idStagiaire }, cleanLine);
      }),
    });
  }

  function handleSubmitPresence() {
    if (!affectationId) {
      toast.error("Choisissez une affectation");
      return;
    }

    submitPresence.mutate({
      idAffectation: Number(affectationId),
      dateSeance,
      heureSeance,
      presences: stagiaires.map((stagiaire) => {
        const line = presences[stagiaire.idStagiaire] ?? { statut: "PRESENT" };
        return Object.assign({}, line, { idStagiaire: stagiaire.idStagiaire });
      }),
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Espace formateur" description="Vos groupes, modules, notes et pointage de l'année sélectionnée." />
      <Card>
        <CardContent className="grid gap-4 p-4 md:grid-cols-4">
          <select className="h-10 rounded-md border px-3" value={anneeId} onChange={(event) => setAnneeId(event.target.value)}>
            <option value="">Année courante / toutes</option>
            {annees.data?.map((annee) => <option key={annee.idAnneeScolaire} value={annee.idAnneeScolaire}>{annee.libelle}</option>)}
          </select>
          <Input placeholder="Recherche nom ou prénom" value={search} onChange={(event) => setSearch(event.target.value)} />
          <select className="h-10 rounded-md border px-3 md:col-span-2" value={affectationId} onChange={(event) => setAffectationId(event.target.value)}>
            <option value="">Choisir groupe / module</option>
            {workspace.data?.affectations.map((affectation) => (
              <option key={String(valueOf(affectation, "idAffectation"))} value={String(valueOf(affectation, "idAffectation"))}>
                {String(valueOf(affectation, "groupe.libelle") ?? "Groupe")} - {String(valueOf(affectation, "module.libelle") ?? "Module")}
              </option>
            ))}
          </select>
        </CardContent>
      </Card>

      {workspace.isLoading ? <LoadingSpinner /> : null}

      <div className="grid gap-4 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Stagiaires affectés</CardTitle>
            <CardDescription>
              {selectedAffectation
                ? `${stagiaires.length} stagiaires pour le groupe sélectionné`
                : `${stagiaires.length} stagiaires trouvés`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {!selectedAffectation ? <p className="text-sm text-muted-foreground">Choisissez une affectation pour afficher le bon groupe.</p> : null}
            {stagiaires.map((stagiaire) => (
              <div key={stagiaire.idStagiaire} className="rounded-lg border p-3">
                <p className="font-medium">{stagiaire.prenom} {stagiaire.nom}</p>
                <p className="text-sm text-muted-foreground">{stagiaire.email}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Notes module</CardTitle>
            <CardDescription>
              {selectedAffectation ? `${String(valueOf(selectedAffectation, "module.libelle") ?? "")}` : "Choisissez une affectation"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-3">
              <Input type="date" value={dateEvaluation} onChange={(event) => setDateEvaluation(event.target.value)} />
              <select className="h-10 rounded-md border px-3" value={controlCount} onChange={(event) => setControlCount(Number(event.target.value))}>
                {[1, 2, 3, 4, 5].map((count) => <option key={count} value={count}>{count} contrôles</option>)}
              </select>
              <Button onClick={handleSubmitNotes} disabled={submitNotes.isPending || !selectedAffectation || stagiaires.length === 0}>
                <Send className="mr-2 h-4 w-4" />
                Partager notes
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="p-2">Stagiaire</th>
                    {Array.from({ length: controlCount }).map((_, index) => <th key={index} className="p-2">C{index + 1}</th>)}
                    <th className="p-2">EFM</th>
                  </tr>
                </thead>
                <tbody>
                  {stagiaires.length === 0 ? (
                    <tr>
                      <td className="p-4 text-center text-muted-foreground" colSpan={controlCount + 2}>
                        Aucun stagiaire dans cette affectation.
                      </td>
                    </tr>
                  ) : null}
                  {stagiaires.map((stagiaire) => (
                    <tr key={stagiaire.idStagiaire} className="border-b">
                      <td className="p-2">{stagiaire.prenom} {stagiaire.nom}</td>
                      {Array.from({ length: controlCount }).map((_, index) => {
                        const field = `controle_${index + 1}`;
                        const absentField = `controle_${index + 1}_absent`;
                        return (
                          <td key={field} className="p-2">
                            <div className="flex items-center gap-2">
                              <Input className="w-20" type="number" min="0" max="20" onChange={(event) => setNoteValue(stagiaire.idStagiaire, field, event.target.value)} />
                              <label className="flex items-center gap-1 text-xs">
                                <input type="checkbox" onChange={(event) => setNoteValue(stagiaire.idStagiaire, absentField, event.target.checked)} />
                                A
                              </label>
                            </div>
                          </td>
                        );
                      })}
                      <td className="p-2">
                        <div className="flex items-center gap-2">
                          <Input className="w-20" type="number" min="0" max="20" onChange={(event) => setNoteValue(stagiaire.idStagiaire, "efm", event.target.value)} />
                          <label className="flex items-center gap-1 text-xs">
                            <input type="checkbox" onChange={(event) => setNoteValue(stagiaire.idStagiaire, "efm_absent", event.target.checked)} />
                            A
                          </label>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pointage présence</CardTitle>
          <CardDescription>Démarrer une séance, choisir date/heure et envoyer à l'admin.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-3">
            <Input type="date" value={dateSeance} onChange={(event) => setDateSeance(event.target.value)} />
            <Input type="time" value={heureSeance} onChange={(event) => setHeureSeance(event.target.value)} />
            <Button onClick={handleSubmitPresence} disabled={submitPresence.isPending || !selectedAffectation || stagiaires.length === 0}>Envoyer présence</Button>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {stagiaires.length === 0 ? <p className="text-sm text-muted-foreground">Sélectionnez une affectation contenant des stagiaires.</p> : null}
            {stagiaires.map((stagiaire) => (
              <div key={stagiaire.idStagiaire} className="rounded-lg border p-3">
                <p className="font-medium">{stagiaire.prenom} {stagiaire.nom}</p>
                <div className="mt-2 grid gap-2 md:grid-cols-[120px_1fr]">
                  <select className="h-10 rounded-md border px-3" onChange={(event) => setPresences((current) => ({ ...current, [stagiaire.idStagiaire]: { ...(current[stagiaire.idStagiaire] ?? { idStagiaire: stagiaire.idStagiaire }), statut: event.target.value as PresenceLine["statut"] } }))}>
                    <option value="PRESENT">P</option>
                    <option value="ABSENT">A</option>
                    <option value="RETARD">Retard</option>
                  </select>
                  <Input placeholder="Remarque" onChange={(event) => setPresences((current) => ({ ...current, [stagiaire.idStagiaire]: { ...(current[stagiaire.idStagiaire] ?? { idStagiaire: stagiaire.idStagiaire, statut: "PRESENT" }), remarque: event.target.value } }))} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
