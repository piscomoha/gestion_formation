import { apiClient } from "@/api/axios";
import { unwrapApiData } from "@/api/response";
import type { AppNotification, Note, Presence, Stagiaire } from "@/types";

export interface WorkflowFilters {
  annee_id?: string;
  idGroupe?: string;
  idFiliere?: string;
  idStagiaire?: string;
  search?: string;
}

export interface FormateurWorkspace {
  formateur: unknown;
  affectations: Array<Record<string, unknown>>;
  stagiaires: Stagiaire[];
}

export const workflowsApi = {
  async adminStagiaires(filters: WorkflowFilters) {
    const { data } = await apiClient.get<Stagiaire[]>("/admin/stagiaires", { params: filters });
    return unwrapApiData<Stagiaire[]>(data);
  },
  async adminNotes(filters: WorkflowFilters) {
    const { data } = await apiClient.get<Note[]>("/admin/note-sheets", { params: filters });
    return unwrapApiData<Note[]>(data);
  },
  async validateNotes(idAffectation: number) {
    const { data } = await apiClient.post(`/admin/note-sheets/${idAffectation}/validate`);
    return unwrapApiData(data);
  },
  async devalidateNotes(idAffectation: number) {
    const { data } = await apiClient.post(`/admin/note-sheets/${idAffectation}/devalidate`);
    return unwrapApiData(data);
  },
  async adminPresences(filters: WorkflowFilters) {
    const { data } = await apiClient.get<Presence[]>("/admin/presence-sessions", { params: filters });
    return unwrapApiData<Presence[]>(data);
  },
  async importStagiaires(payload: FormData) {
    const { data } = await apiClient.post("/admin/import-stagiaires", payload, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return unwrapApiData(data);
  },
  async formateurWorkspace(filters: WorkflowFilters) {
    const { data } = await apiClient.get<FormateurWorkspace>("/formateur/workspace", { params: filters });
    return unwrapApiData<FormateurWorkspace>(data);
  },
  async submitNotes(payload: Record<string, unknown>) {
    const { data } = await apiClient.post("/formateur/note-sheets", payload);
    return unwrapApiData(data);
  },
  async submitPresence(payload: Record<string, unknown>) {
    const { data } = await apiClient.post("/formateur/presence-sessions", payload);
    return unwrapApiData(data);
  },
  async bulletin(filters: WorkflowFilters) {
    const { data } = await apiClient.get<{ stagiaire: Stagiaire; notes: Note[] }>("/stagiaire/bulletin", { params: filters });
    return unwrapApiData<{ stagiaire: Stagiaire; notes: Note[] }>(data);
  },
  async stagiairePresences(filters: WorkflowFilters) {
    const { data } = await apiClient.get<{ stagiaire: Stagiaire; presences: Presence[] }>("/stagiaire/presences", { params: filters });
    return unwrapApiData<{ stagiaire: Stagiaire; presences: Presence[] }>(data);
  },
  async notifications() {
    const { data } = await apiClient.get<AppNotification[]>("/notifications");
    return unwrapApiData<AppNotification[]>(data);
  },
};
