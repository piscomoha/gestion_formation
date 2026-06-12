import { z } from "zod";

const requiredString = (label: string) =>
  z.string().trim().min(2, `${label} doit contenir au moins 2 caracteres`);

const phoneSchema = z
  .string()
  .trim()
  .min(8, "Le telephone doit contenir au moins 8 caracteres");

export const filiereSchema = z.object({
  libelle: requiredString("Le libelle"),
  description: requiredString("La description"),
});

export const groupeSchema = z.object({
  libelle: requiredString("Le libelle"),
  effectif: z.coerce.number().int().min(1, "L'effectif doit etre positif"),
  idFiliere: z.coerce.number().int().min(1, "Selectionnez une filiere"),
});

export const anneeScolaireSchema = z
  .object({
    libelle: requiredString("Le libelle"),
    dateDebut: z.string().min(1, "La date de debut est requise"),
    dateFin: z.string().min(1, "La date de fin est requise"),
  })
  .refine((data) => new Date(data.dateDebut) <= new Date(data.dateFin), {
    path: ["dateFin"],
    message: "La date de fin doit etre apres la date de debut",
  });

export const formateurSchema = z.object({
  nom: requiredString("Le nom"),
  prenom: requiredString("Le prenom"),
  email: z.string().trim().email("Email invalide"),
  telephone: phoneSchema,
});

export const moduleSchema = z.object({
  libelle: requiredString("Le libelle"),
  description: requiredString("La description"),
  coefficient: z.coerce.number().min(0.1, "Le coefficient doit etre positif"),
});

export const stagiaireSchema = z.object({
  nom: requiredString("Le nom"),
  prenom: requiredString("Le prenom"),
  email: z.string().trim().email("Email invalide"),
  telephone: phoneSchema,
  idGroupe: z.coerce.number().int().min(1, "Selectionnez un groupe"),
});

export const affectationSchema = z.object({
  idAnneeScolaire: z.coerce.number().int().min(1, "Selectionnez une annee"),
  idFormateur: z.coerce.number().int().min(1, "Selectionnez un formateur"),
  idModule: z.coerce.number().int().min(1, "Selectionnez un module"),
  idGroupe: z.coerce.number().int().min(1, "Selectionnez un groupe"),
});

export const presenceSchema = z.object({
  dateSeance: z.string().min(1, "La date de seance est requise"),
  statut: z.enum(["PRESENT", "ABSENT", "RETARD"]),
  idAffectation: z.coerce.number().int().min(1, "Selectionnez une affectation"),
  idStagiaire: z.coerce.number().int().min(1, "Selectionnez un stagiaire"),
});

export const noteSchema = z.object({
  note: z.coerce.number().min(0, "La note minimale est 0").max(20, "La note maximale est 20"),
  dateEvaluation: z.string().min(1, "La date d'evaluation est requise"),
  idAffectation: z.coerce.number().int().min(1, "Selectionnez une affectation"),
  idStagiaire: z.coerce.number().int().min(1, "Selectionnez un stagiaire"),
});

export type FiliereFormValues = z.infer<typeof filiereSchema>;
export type GroupeFormValues = z.infer<typeof groupeSchema>;
export type AnneeScolaireFormValues = z.infer<typeof anneeScolaireSchema>;
export type FormateurFormValues = z.infer<typeof formateurSchema>;
export type ModuleFormValues = z.infer<typeof moduleSchema>;
export type StagiaireFormValues = z.infer<typeof stagiaireSchema>;
export type AffectationFormValues = z.infer<typeof affectationSchema>;
export type PresenceFormValues = z.infer<typeof presenceSchema>;
export type NoteFormValues = z.infer<typeof noteSchema>;
