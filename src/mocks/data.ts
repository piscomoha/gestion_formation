import type {
  Affectation,
  AnneeScolaire,
  Filiere,
  Formateur,
  Groupe,
  Module,
  Note,
  Presence,
  Stagiaire,
} from "@/types";

export const mockData = {
  filieres: [
    {
      idFiliere: 1,
      libelle: "Developpement Digital",
      description: "Formation orientee web, mobile et cloud.",
    },
    {
      idFiliere: 2,
      libelle: "Infrastructure Digitale",
      description: "Reseaux, systemes et administration cloud.",
    },
    {
      idFiliere: 3,
      libelle: "Gestion des Entreprises",
      description: "Comptabilite, administration et management.",
    },
  ] satisfies Filiere[],
  groupes: [
    { idGroupe: 1, libelle: "DD-101", effectif: 28, idFiliere: 1 },
    { idGroupe: 2, libelle: "DD-102", effectif: 24, idFiliere: 1 },
    { idGroupe: 3, libelle: "ID-201", effectif: 22, idFiliere: 2 },
  ] satisfies Groupe[],
  anneesScolaires: [
    {
      idAnneeScolaire: 1,
      libelle: "2024/2025",
      dateDebut: "2024-09-02",
      dateFin: "2025-07-15",
    },
    {
      idAnneeScolaire: 2,
      libelle: "2025/2026",
      dateDebut: "2025-09-01",
      dateFin: "2026-07-17",
    },
  ] satisfies AnneeScolaire[],
  formateurs: [
    {
      idFormateur: 1,
      nom: "Amrani",
      prenom: "Salma",
      email: "salma.amrani@example.com",
      telephone: "0611223344",
    },
    {
      idFormateur: 2,
      nom: "Bennani",
      prenom: "Youssef",
      email: "youssef.bennani@example.com",
      telephone: "0622334455",
    },
    {
      idFormateur: 3,
      nom: "El Idrissi",
      prenom: "Nadia",
      email: "nadia.idrissi@example.com",
      telephone: "0633445566",
    },
  ] satisfies Formateur[],
  modules: [
    {
      idModule: 1,
      libelle: "React et TypeScript",
      description: "Developpement frontend moderne.",
      coefficient: 3,
    },
    {
      idModule: 2,
      libelle: "Bases de donnees",
      description: "Modelisation SQL et requetes.",
      coefficient: 2,
    },
    {
      idModule: 3,
      libelle: "Administration Linux",
      description: "Services, securite et automatisation.",
      coefficient: 2.5,
    },
  ] satisfies Module[],
  stagiaires: [
    {
      idStagiaire: 1,
      nom: "Ziani",
      prenom: "Imane",
      email: "imane.ziani@example.com",
      telephone: "0644556677",
      idGroupe: 1,
    },
    {
      idStagiaire: 2,
      nom: "Tazi",
      prenom: "Omar",
      email: "omar.tazi@example.com",
      telephone: "0655667788",
      idGroupe: 1,
    },
    {
      idStagiaire: 3,
      nom: "Fassi",
      prenom: "Lina",
      email: "lina.fassi@example.com",
      telephone: "0666778899",
      idGroupe: 2,
    },
  ] satisfies Stagiaire[],
  affectations: [
    {
      idAffectation: 1,
      idAnneeScolaire: 2,
      idFormateur: 1,
      idModule: 1,
      idGroupe: 1,
    },
    {
      idAffectation: 2,
      idAnneeScolaire: 2,
      idFormateur: 2,
      idModule: 2,
      idGroupe: 1,
    },
    {
      idAffectation: 3,
      idAnneeScolaire: 2,
      idFormateur: 3,
      idModule: 3,
      idGroupe: 3,
    },
  ] satisfies Affectation[],
  presences: [
    {
      idPresence: 1,
      dateSeance: "2026-01-08",
      statut: "PRESENT",
      idAffectation: 1,
      idStagiaire: 1,
    },
    {
      idPresence: 2,
      dateSeance: "2026-01-08",
      statut: "RETARD",
      idAffectation: 1,
      idStagiaire: 2,
    },
    {
      idPresence: 3,
      dateSeance: "2026-01-09",
      statut: "ABSENT",
      idAffectation: 2,
      idStagiaire: 3,
    },
  ] satisfies Presence[],
  notes: [
    {
      idNote: 1,
      note: 16,
      dateEvaluation: "2026-01-20",
      idAffectation: 1,
      idStagiaire: 1,
    },
    {
      idNote: 2,
      note: 13.5,
      dateEvaluation: "2026-01-20",
      idAffectation: 1,
      idStagiaire: 2,
    },
    {
      idNote: 3,
      note: 15,
      dateEvaluation: "2026-01-25",
      idAffectation: 2,
      idStagiaire: 3,
    },
  ] satisfies Note[],
};
