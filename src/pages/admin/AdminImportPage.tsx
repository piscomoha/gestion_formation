import { FormEvent, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/shared/PageHeader";
import { workflowsApi } from "@/api/workflows.api";
import { anneeScolaireHooks } from "@/hooks/useAnneesScolaires";
import { filiereHooks } from "@/hooks/useFilieres";
import { groupeHooks } from "@/hooks/useGroupes";

export function AdminImportPage() {
  const annees = anneeScolaireHooks.useList();
  const filieres = filiereHooks.useList();
  const groupes = groupeHooks.useList();
  const [anneeId, setAnneeId] = useState("");
  const [filiereId, setFiliereId] = useState("");
  const [groupeId, setGroupeId] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const importMutation = useMutation({
    mutationFn: workflowsApi.importStagiaires,
    onSuccess: () => toast.success("Import terminé"),
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file || !anneeId || !filiereId || !groupeId) {
      toast.error("Choisissez le fichier, l'année, la filière et le groupe");
      return;
    }

    const payload = new FormData();
    payload.append("file", file);
    payload.append("idAnneeScolaire", anneeId);
    payload.append("idFiliere", filiereId);
    payload.append("idGroupe", groupeId);
    importMutation.mutate(payload);
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Importer les stagiaires" description="Importez une liste Excel exportée en CSV avec les colonnes: nom, prenom, email, telephone." />
      <Card>
        <CardHeader>
          <CardTitle>Nouveau fichier</CardTitle>
          <CardDescription>Le backend accepte un CSV compatible Excel.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
            <select className="h-10 rounded-md border px-3" value={anneeId} onChange={(event) => setAnneeId(event.target.value)}>
              <option value="">Année scolaire</option>
              {annees.data?.map((annee) => <option key={annee.idAnneeScolaire} value={annee.idAnneeScolaire}>{annee.libelle}</option>)}
            </select>
            <select className="h-10 rounded-md border px-3" value={filiereId} onChange={(event) => setFiliereId(event.target.value)}>
              <option value="">Filière</option>
              {filieres.data?.map((filiere) => <option key={filiere.idFiliere} value={filiere.idFiliere}>{filiere.libelle}</option>)}
            </select>
            <select className="h-10 rounded-md border px-3" value={groupeId} onChange={(event) => setGroupeId(event.target.value)}>
              <option value="">Groupe</option>
              {groupes.data?.map((groupe) => <option key={groupe.idGroupe} value={groupe.idGroupe}>{groupe.libelle}</option>)}
            </select>
            <Input type="file" accept=".csv,.txt" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
            <Button className="md:col-span-2" disabled={importMutation.isPending}>
              <Upload className="mr-2 h-4 w-4" />
              {importMutation.isPending ? "Import..." : "Importer"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
