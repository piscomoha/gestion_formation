import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import type { CellContext, ColumnDef, HeaderContext } from "@tanstack/react-table";
import type { UseMutationResult, UseQueryResult } from "@tanstack/react-query";
import { Edit, Plus, Trash2 } from "lucide-react";
import { useForm, type FieldError, type FieldValues, type Resolver } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { DataTable, SortableHeader } from "@/components/shared/DataTable";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { PageHeader } from "@/components/shared/PageHeader";
import {
  InputField,
  SelectField,
  TextareaField,
} from "@/components/forms/FormFields";
import { entityConfigs } from "@/lib/entities";
import { formatDate, getFullName } from "@/lib/utils";
import {
  affectationSchema,
  anneeScolaireSchema,
  filiereSchema,
  formateurSchema,
  groupeSchema,
  moduleSchema,
  noteSchema,
  presenceSchema,
  stagiaireSchema,
} from "@/lib/validators";
import { affectationHooks } from "@/hooks/useAffectations";
import { anneeScolaireHooks } from "@/hooks/useAnneesScolaires";
import { filiereHooks } from "@/hooks/useFilieres";
import { formateurHooks } from "@/hooks/useFormateurs";
import { groupeHooks } from "@/hooks/useGroupes";
import { moduleHooks } from "@/hooks/useModules";
import { noteHooks } from "@/hooks/useNotes";
import { presenceHooks } from "@/hooks/usePresences";
import { stagiaireHooks } from "@/hooks/useStagiaires";
import type { EntityName, PresenceStatut } from "@/types";

type FormValues = FieldValues;
type FieldType = "text" | "textarea" | "number" | "date" | "email" | "select";

interface FieldDefinition {
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  optionsKey?: ReferenceKey;
}

interface CrudHooks {
  useList: () => UseQueryResult<FormValues[], Error>;
  useCreate: () => UseMutationResult<FormValues, Error, FormValues>;
  useUpdate: () => UseMutationResult<
    FormValues,
    Error,
    { id: number; payload: FormValues }
  >;
  useDelete: () => UseMutationResult<void, Error, number>;
}

type ReferenceKey =
  | "filieres"
  | "groupes"
  | "annees"
  | "formateurs"
  | "modules"
  | "stagiaires"
  | "affectations"
  | "statuts";

const hookMap: Record<EntityName, CrudHooks> = {
  filieres: filiereHooks as unknown as CrudHooks,
  groupes: groupeHooks as unknown as CrudHooks,
  "annees-scolaires": anneeScolaireHooks as unknown as CrudHooks,
  formateurs: formateurHooks as unknown as CrudHooks,
  modules: moduleHooks as unknown as CrudHooks,
  stagiaires: stagiaireHooks as unknown as CrudHooks,
  affectations: affectationHooks as unknown as CrudHooks,
  presences: presenceHooks as unknown as CrudHooks,
  notes: noteHooks as unknown as CrudHooks,
};

const schemas: Record<EntityName, z.ZodType<FormValues>> = {
  filieres: filiereSchema as z.ZodType<FormValues>,
  groupes: groupeSchema as z.ZodType<FormValues>,
  "annees-scolaires": anneeScolaireSchema as z.ZodType<FormValues>,
  formateurs: formateurSchema as z.ZodType<FormValues>,
  modules: moduleSchema as z.ZodType<FormValues>,
  stagiaires: stagiaireSchema as z.ZodType<FormValues>,
  affectations: affectationSchema as z.ZodType<FormValues>,
  presences: presenceSchema as z.ZodType<FormValues>,
  notes: noteSchema as z.ZodType<FormValues>,
};

const fields: Record<EntityName, FieldDefinition[]> = {
  filieres: [
    { name: "libelle", label: "Libelle", type: "text" },
    { name: "description", label: "Description", type: "textarea" },
  ],
  groupes: [
    { name: "libelle", label: "Libelle", type: "text" },
    { name: "effectif", label: "Effectif", type: "number" },
    { name: "idFiliere", label: "Filiere", type: "select", optionsKey: "filieres" },
  ],
  "annees-scolaires": [
    { name: "libelle", label: "Libelle", type: "text", placeholder: "2025/2026" },
    { name: "dateDebut", label: "Date debut", type: "date" },
    { name: "dateFin", label: "Date fin", type: "date" },
  ],
  formateurs: [
    { name: "nom", label: "Nom", type: "text" },
    { name: "prenom", label: "Prenom", type: "text" },
    { name: "email", label: "Email", type: "email" },
    { name: "telephone", label: "Telephone", type: "text" },
  ],
  modules: [
    { name: "libelle", label: "Libelle", type: "text" },
    { name: "coefficient", label: "Coefficient", type: "number" },
    { name: "description", label: "Description", type: "textarea" },
  ],
  stagiaires: [
    { name: "nom", label: "Nom", type: "text" },
    { name: "prenom", label: "Prenom", type: "text" },
    { name: "email", label: "Email", type: "email" },
    { name: "telephone", label: "Telephone", type: "text" },
    { name: "idGroupe", label: "Groupe", type: "select", optionsKey: "groupes" },
  ],
  affectations: [
    { name: "idAnneeScolaire", label: "Annee scolaire", type: "select", optionsKey: "annees" },
    { name: "idFormateur", label: "Formateur", type: "select", optionsKey: "formateurs" },
    { name: "idModule", label: "Module", type: "select", optionsKey: "modules" },
    { name: "idGroupe", label: "Groupe", type: "select", optionsKey: "groupes" },
  ],
  presences: [
    { name: "dateSeance", label: "Date seance", type: "date" },
    { name: "statut", label: "Statut", type: "select", optionsKey: "statuts" },
    { name: "idAffectation", label: "Affectation", type: "select", optionsKey: "affectations" },
    { name: "idStagiaire", label: "Stagiaire", type: "select", optionsKey: "stagiaires" },
  ],
  notes: [
    { name: "note", label: "Note", type: "number" },
    { name: "dateEvaluation", label: "Date evaluation", type: "date" },
    { name: "idAffectation", label: "Affectation", type: "select", optionsKey: "affectations" },
    { name: "idStagiaire", label: "Stagiaire", type: "select", optionsKey: "stagiaires" },
  ],
};

const visibleColumns: Record<EntityName, string[]> = {
  filieres: ["libelle", "description"],
  groupes: ["libelle", "effectif", "idFiliere"],
  "annees-scolaires": ["libelle", "dateDebut", "dateFin"],
  formateurs: ["nom", "prenom", "email", "telephone"],
  modules: ["libelle", "description", "coefficient"],
  stagiaires: ["nom", "prenom", "email", "telephone", "idGroupe"],
  affectations: ["idAnneeScolaire", "idFormateur", "idModule", "idGroupe"],
  presences: ["dateSeance", "statut", "idAffectation", "idStagiaire"],
  notes: ["note", "dateEvaluation", "idAffectation", "idStagiaire"],
};

const labels: Record<string, string> = {
  libelle: "Libelle",
  description: "Description",
  effectif: "Effectif",
  idFiliere: "Filiere",
  dateDebut: "Date debut",
  dateFin: "Date fin",
  nom: "Nom",
  prenom: "Prenom",
  email: "Email",
  telephone: "Telephone",
  coefficient: "Coefficient",
  idGroupe: "Groupe",
  idAnneeScolaire: "Annee",
  idFormateur: "Formateur",
  idModule: "Module",
  dateSeance: "Date seance",
  statut: "Statut",
  idAffectation: "Affectation",
  idStagiaire: "Stagiaire",
  note: "Note",
  dateEvaluation: "Date evaluation",
};

const defaultValues: Record<EntityName, FormValues> = {
  filieres: { libelle: "", description: "" },
  groupes: { libelle: "", effectif: 1, idFiliere: "" },
  "annees-scolaires": { libelle: "", dateDebut: "", dateFin: "" },
  formateurs: { nom: "", prenom: "", email: "", telephone: "" },
  modules: { libelle: "", description: "", coefficient: 1 },
  stagiaires: { nom: "", prenom: "", email: "", telephone: "", idGroupe: "" },
  affectations: {
    idAnneeScolaire: "",
    idFormateur: "",
    idModule: "",
    idGroupe: "",
  },
  presences: {
    dateSeance: "",
    statut: "PRESENT",
    idAffectation: "",
    idStagiaire: "",
  },
  notes: { note: 10, dateEvaluation: "", idAffectation: "", idStagiaire: "" },
};

export function EntityCrudPage({ entityName }: { entityName: EntityName }) {
  const config = entityConfigs[entityName];
  const selectedHooks = hookMap[entityName];
  const listQuery = selectedHooks.useList();
  const createMutation = selectedHooks.useCreate();
  const updateMutation = selectedHooks.useUpdate();
  const deleteMutation = selectedHooks.useDelete();

  const filieres = filiereHooks.useList();
  const groupes = groupeHooks.useList();
  const annees = anneeScolaireHooks.useList();
  const formateurs = formateurHooks.useList();
  const modules = moduleHooks.useList();
  const stagiaires = stagiaireHooks.useList();
  const affectations = affectationHooks.useList();

  const [open, setOpen] = React.useState(false);
  const [editingRecord, setEditingRecord] = React.useState<FormValues | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(
      schemas[entityName] as unknown as z.ZodType<unknown, FormValues>,
    ) as Resolver<FormValues>,
    defaultValues: defaultValues[entityName],
  });

  const referenceOptions = {
    filieres:
      filieres.data?.map((item) => ({
        value: String(item.idFiliere),
        label: String(item.libelle),
      })) ?? [],
    groupes:
      groupes.data?.map((item) => ({
        value: String(item.idGroupe),
        label: String(item.libelle),
      })) ?? [],
    annees:
      annees.data?.map((item) => ({
        value: String(item.idAnneeScolaire),
        label: String(item.libelle),
      })) ?? [],
    formateurs:
      formateurs.data?.map((item) => ({
        value: String(item.idFormateur),
        label: getFullName({
          nom: String(item.nom),
          prenom: String(item.prenom),
        }),
      })) ?? [],
    modules:
      modules.data?.map((item) => ({
        value: String(item.idModule),
        label: String(item.libelle),
      })) ?? [],
    stagiaires:
      stagiaires.data?.map((item) => ({
        value: String(item.idStagiaire),
        label: getFullName({
          nom: String(item.nom),
          prenom: String(item.prenom),
        }),
      })) ?? [],
    affectations:
      affectations.data?.map((item) => ({
        value: String(item.idAffectation),
        label: `Affectation #${String(item.idAffectation)}`,
      })) ?? [],
    statuts: [
      { value: "PRESENT", label: "Present" },
      { value: "ABSENT", label: "Absent" },
      { value: "RETARD", label: "Retard" },
    ],
  } satisfies Record<ReferenceKey, Array<{ value: string; label: string }>>;

  const getReferenceLabel = React.useCallback(
    (key: string, value: unknown) => {
      if (key === "idFiliere") return referenceOptions.filieres.find((item) => item.value === String(value))?.label;
      if (key === "idGroupe") return referenceOptions.groupes.find((item) => item.value === String(value))?.label;
      if (key === "idAnneeScolaire") return referenceOptions.annees.find((item) => item.value === String(value))?.label;
      if (key === "idFormateur") return referenceOptions.formateurs.find((item) => item.value === String(value))?.label;
      if (key === "idModule") return referenceOptions.modules.find((item) => item.value === String(value))?.label;
      if (key === "idStagiaire") return referenceOptions.stagiaires.find((item) => item.value === String(value))?.label;
      if (key === "idAffectation") return referenceOptions.affectations.find((item) => item.value === String(value))?.label;
      return undefined;
    },
    [referenceOptions],
  );

  const columns: ColumnDef<FormValues>[] = [
    ...visibleColumns[entityName].map((key) => ({
        accessorKey: key,
        header: ({ column }: HeaderContext<FormValues, unknown>) => (
          <SortableHeader
            label={labels[key]}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        ),
        cell: ({ row }: CellContext<FormValues, unknown>) => {
          const value = row.original[key];
          const referenceLabel = getReferenceLabel(key, value);

          if (key.toLowerCase().includes("date") && typeof value === "string") {
            return formatDate(value);
          }

          if (key === "statut") {
            const statut = value as PresenceStatut;
            const variant = statut === "ABSENT" ? "destructive" : statut === "RETARD" ? "secondary" : "default";
            return <Badge variant={variant}>{statut}</Badge>;
          }

          return referenceLabel ?? String(value ?? "-");
        },
    })),
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => startEdit(row.original)}
            aria-label="Modifier"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <ConfirmDialog
            title="Supprimer cet element ?"
            description="Cette action est definitive dans la session courante."
            onConfirm={() => deleteMutation.mutate(Number(row.original[config.idKey]))}
            trigger={
              <Button variant="destructive" size="icon" aria-label="Supprimer">
                <Trash2 className="h-4 w-4" />
              </Button>
            }
          />
        </div>
      ),
    },
  ];

  function startCreate() {
    setEditingRecord(null);
    form.reset(defaultValues[entityName]);
    setOpen(true);
  }

  function startEdit(record: FormValues) {
    setEditingRecord(record);
    form.reset(record);
    setOpen(true);
  }

  function handleClose(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      setEditingRecord(null);
      form.reset(defaultValues[entityName]);
    }
  }

  async function onSubmit(values: FormValues) {
    if (editingRecord) {
      await updateMutation.mutateAsync({
        id: Number(editingRecord[config.idKey]),
        payload: values,
      });
    } else {
      await createMutation.mutateAsync(values);
    }

    handleClose(false);
  }

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <PageHeader
        title={config.title}
        description={config.description}
        action={
          <Button onClick={startCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Nouveau
          </Button>
        }
      />

      {listQuery.isLoading ? (
        <LoadingSpinner />
      ) : (
        <DataTable
          columns={columns}
          data={listQuery.data ?? []}
          emptyTitle={`Aucun element dans ${config.title.toLowerCase()}`}
        />
      )}

      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingRecord ? "Modifier" : "Ajouter"} {config.title.toLowerCase()}
            </DialogTitle>
            <DialogDescription>
              Renseignez les informations puis validez le formulaire.
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-4 md:grid-cols-2">
              {fields[entityName].map((field) => {
                const error = form.formState.errors[field.name] as FieldError | undefined;

                if (field.type === "textarea") {
                  return (
                    <TextareaField<FormValues>
                      key={field.name}
                      label={field.label}
                      name={field.name}
                      register={form.register}
                      error={error}
                      placeholder={field.placeholder}
                    />
                  );
                }

                if (field.type === "select" && field.optionsKey) {
                  return (
                    <SelectField
                      key={field.name}
                      label={field.label}
                      value={String(form.watch(field.name) ?? "")}
                      onValueChange={(value) => form.setValue(field.name, value)}
                      placeholder={`Selectionnez ${field.label.toLowerCase()}`}
                      options={referenceOptions[field.optionsKey]}
                      error={error}
                    />
                  );
                }

                return (
                  <InputField<FormValues>
                    key={field.name}
                    label={field.label}
                    name={field.name}
                    register={form.register}
                    type={field.type}
                    placeholder={field.placeholder}
                    error={error}
                  />
                );
              })}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => handleClose(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
