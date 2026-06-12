export type PresenceStatut = "PRESENT" | "ABSENT" | "RETARD";
export type UserRole = "admin" | "formateur" | "stagiaire";

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

export interface AppNotification {
  id: number;
  type: string;
  title: string;
  message: string;
  payload?: Record<string, unknown>;
  read_at?: string | null;
  created_at?: string;
}

export interface Filiere {
  idFiliere: number;
  libelle: string;
  description: string;
}

export interface Groupe {
  idGroupe: number;
  libelle: string;
  effectif: number;
  idFiliere: number;
}

export interface AnneeScolaire {
  idAnneeScolaire: number;
  libelle: string;
  dateDebut: string;
  dateFin: string;
}

export interface Formateur {
  idFormateur: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
}

export interface Module {
  idModule: number;
  libelle: string;
  description: string;
  coefficient: number;
}

export interface Stagiaire {
  idStagiaire: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  idGroupe: number;
}

export interface Affectation {
  idAffectation: number;
  idAnneeScolaire: number;
  idFormateur: number;
  idModule: number;
  idGroupe: number;
}

export interface Presence {
  idPresence: number;
  dateSeance: string;
  heureSeance?: string | null;
  statut: PresenceStatut;
  remarque?: string | null;
  idAffectation: number;
  idStagiaire: number;
}

export interface Note {
  idNote: number;
  note?: number;
  controle_1?: number | null;
  controle_1_absent?: boolean;
  controle_2?: number | null;
  controle_2_absent?: boolean;
  controle_3?: number | null;
  controle_3_absent?: boolean;
  controle_4?: number | null;
  controle_4_absent?: boolean;
  controle_5?: number | null;
  controle_5_absent?: boolean;
  efm?: number | null;
  efm_absent?: boolean;
  note_finale?: number;
  status?: "draft" | "submitted" | "validated";
  remarque?: string | null;
  dateEvaluation: string;
  idAffectation: number;
  idStagiaire: number;
}

export interface EntityConfig<TRecord extends object> {
  title: string;
  description: string;
  endpoint: string;
  route: string;
  idKey: keyof TRecord & string;
  queryKey: string;
}

export type EntityName =
  | "filieres"
  | "groupes"
  | "annees-scolaires"
  | "formateurs"
  | "modules"
  | "stagiaires"
  | "affectations"
  | "presences"
  | "notes";
