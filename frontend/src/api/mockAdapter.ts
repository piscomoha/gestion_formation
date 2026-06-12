import type {
  AxiosAdapter,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { AxiosError } from "axios";
import { entityConfigs } from "@/lib/entities";
import { mockData } from "@/mocks/data";
import type { EntityName, AuthUser, AppNotification, UserRole } from "@/types";

type Store = typeof mockData;
type StoreKey = keyof Store;

const endpointToStoreKey: Record<string, StoreKey> = {
  "/filieres": "filieres",
  "/groupes": "groupes",
  "/annees-scolaires": "anneesScolaires",
  "/formateurs": "formateurs",
  "/modules": "modules",
  "/stagiaires": "stagiaires",
  "/affectations": "affectations",
  "/presences": "presences",
  "/notes": "notes",
};

const endpointToEntityName: Record<string, EntityName> = {
  "/filieres": "filieres",
  "/groupes": "groupes",
  "/annees-scolaires": "annees-scolaires",
  "/formateurs": "formateurs",
  "/modules": "modules",
  "/stagiaires": "stagiaires",
  "/affectations": "affectations",
  "/presences": "presences",
  "/notes": "notes",
};

const store: Store = structuredClone(mockData);

type StoredNotification = AppNotification & {
  targetRole?: UserRole;
  targetEmail?: string;
};

const notifications: StoredNotification[] = [];
let nextNotificationId = 1;

// Mock auth state
let currentUser: AuthUser | null = null;
const mockUsers = [
  { id: 1, name: "Super Admin", email: "admin@example.com", role: "admin" as const },
  { id: 4, name: "Super Admin", email: "admin@ofppt.ma", role: "admin" as const },
  { id: 2, name: "Salma Amrani", email: "salma.amrani@example.com", role: "formateur" as const },
  { id: 5, name: "Mohammed Formateur", email: "form@ofppt.ma", role: "formateur" as const },
  { id: 3, name: "Imane Ziani", email: "imane.ziani@example.com", role: "stagiaire" as const },
  { id: 6, name: "Mohammed Stagiaire", email: "stagiaire@ofppt.ma", role: "stagiaire" as const },
];

function delay(ms = 350) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function getPath(config: InternalAxiosRequestConfig) {
  const baseURL = config.baseURL ?? window.location.origin;
  const url = new URL(config.url ?? "", baseURL);
  return url.pathname.replace(/^\/api/, "");
}

function createResponse<T>(
  config: InternalAxiosRequestConfig,
  data: T,
  status = 200,
): AxiosResponse<T> {
  return {
    data: structuredClone(data),
    status,
    statusText: status === 201 ? "Created" : "OK",
    headers: {},
    config,
  };
}

function createError(
  config: InternalAxiosRequestConfig,
  status: number,
  message: string,
) {
  return new AxiosError(
    message,
    undefined,
    config,
    undefined,
    createResponse(config, { message }, status),
  );
}

function parseBody<T>(data: unknown): T {
  if (typeof data === "string" && data.length > 0) {
    return JSON.parse(data) as T;
  }

  return data as T;
}

function addNotification(
  notification: Omit<StoredNotification, "id" | "created_at" | "read_at">,
) {
  notifications.unshift({
    ...notification,
    id: nextNotificationId,
    read_at: null,
    created_at: new Date().toISOString(),
  });
  nextNotificationId += 1;
}

function fullName(person?: { nom?: string; prenom?: string }) {
  return [person?.prenom, person?.nom].filter(Boolean).join(" ") || "Utilisateur";
}

function getAffectationContext(idAffectation: number) {
  const affectation = store.affectations.find(
    (item) => Number(item.idAffectation) === idAffectation,
  );
  const groupe = store.groupes.find(
    (item) => Number(item.idGroupe) === Number(affectation?.idGroupe),
  );
  const module = store.modules.find(
    (item) => Number(item.idModule) === Number(affectation?.idModule),
  );
  const formateur = store.formateurs.find(
    (item) => Number(item.idFormateur) === Number(affectation?.idFormateur),
  );

  return { affectation, groupe, module, formateur };
}

function notifyFormateurAffectation(idAffectation: number) {
  const { groupe, module, formateur } = getAffectationContext(idAffectation);

  if (!formateur) {
    return;
  }

  addNotification({
    targetRole: "formateur",
    targetEmail: formateur.email,
    type: "affectation.updated",
    title: "Affectation modifiee",
    message: `Vous etes affecte au groupe ${groupe?.libelle ?? "-"} pour le module ${module?.libelle ?? "-"}.`,
    payload: { idAffectation },
  });
}

export const mockAdapter: AxiosAdapter = async (config) => {
  await delay();

  const path = getPath(config);
  const pathParts = path.split("/");
  const [, resource, idOrSubResource, nestedId, action] = pathParts;
  const endpoint = `/${resource}`;
  const method = (config.method ?? "get").toLowerCase();

  // Handle auth endpoints
  if (path === "/login" && method === "post") {
    const payload = parseBody<{ email: string; password: string }>(config.data);
    const user = mockUsers.find(u => u.email === payload.email);
    if (!user) {
      throw createError(config, 401, "Identifiants incorrects");
    }
    currentUser = user;
    return createResponse(config, {
      status: "success",
      message: "Connexion réussie",
      data: { user, token: "mock-jwt-token" },
    });
  }

  if (path === "/user" && method === "get") {
    if (!currentUser) {
      throw createError(config, 401, "Non authentifié");
    }
    return createResponse(config, {
      status: "success",
      data: currentUser,
    });
  }

  if (path === "/logout" && method === "post") {
    currentUser = null;
    return createResponse(config, {
      status: "success",
      data: { ok: true },
    });
  }

  // Handle admin and other workflow endpoints
  if (path === "/admin/stagiaires" && method === "get") {
    return createResponse(config, { status: "success", data: store.stagiaires });
  }
  if (path === "/admin/note-sheets" && method === "get") {
    return createResponse(config, { status: "success", data: store.notes });
  }
  if (resource === "admin" && idOrSubResource === "note-sheets" && nestedId && action === "validate" && method === "post") {
    return createResponse(config, { status: "success", data: { idAffectation: Number(nestedId), status: "validated" } });
  }
  if (resource === "admin" && idOrSubResource === "note-sheets" && nestedId && action === "devalidate" && method === "post") {
    return createResponse(config, { status: "success", data: { idAffectation: Number(nestedId), status: "submitted" } });
  }
  if (path === "/admin/presence-sessions" && method === "get") {
    return createResponse(config, { status: "success", data: store.presences });
  }
  if (path === "/admin/import-stagiaires" && method === "post") {
    return createResponse(config, { status: "success", data: { ok: true } });
  }
  if (path === "/formateur/workspace" && method === "get") {
        let formateur = store.formateurs[0];
        let affectations = store.affectations;
        
        if (currentUser?.email === "form@ofppt.ma") {
          formateur = store.formateurs[3];
          affectations = [store.affectations[0], store.affectations[1]];
        }
        
        return createResponse(config, {
          status: "success",
          data: {
            formateur: formateur,
            affectations: affectations,
            stagiaires: store.stagiaires,
          },
        });
      }
  if (path === "/formateur/stats" && method === "get") {
    const affectationsForUser =
      currentUser?.email === "form@ofppt.ma"
        ? [store.affectations[0], store.affectations[1]]
        : store.affectations;

    const moduleIds = Array.from(new Set(affectationsForUser.map((a) => Number(a.idModule))));
    const groupeIds = Array.from(new Set(affectationsForUser.map((a) => Number(a.idGroupe))));
    const stagiaires = store.stagiaires.filter((s) => groupeIds.includes(Number(s.idGroupe)));

    const notes = store.notes.filter((n) => affectationsForUser.some((a) => Number(a.idAffectation) === Number(n.idAffectation)));
    const moyenneNotes = notes.length ? notes.reduce((sum, n) => sum + Number(n.note ?? n.note_finale ?? 0), 0) / notes.length : 0;

    const presences = store.presences.filter((p) => affectationsForUser.some((a) => Number(a.idAffectation) === Number(p.idAffectation)));
    const present = presences.filter((p) => p.statut === "PRESENT").length;
    const absent = presences.filter((p) => p.statut === "ABSENT").length;
    const justifie = presences.filter((p) => String(p.statut) === "JUSTIFIE").length;

    const notesParModule = moduleIds.map((idModule) => {
      const moduleLabel =
        affectationsForUser.find((a) => Number(a.idModule) === idModule)?.module?.libelle ?? `Module ${idModule}`;
      const idsAff = affectationsForUser.filter((a) => Number(a.idModule) === idModule).map((a) => Number(a.idAffectation));
      const moduleNotes = notes.filter((n) => idsAff.includes(Number(n.idAffectation)));
      const moyenne = moduleNotes.length ? moduleNotes.reduce((sum, n) => sum + Number(n.note ?? n.note_finale ?? 0), 0) / moduleNotes.length : 0;
      return { idModule, libelle: moduleLabel, moyenne: Number(moyenne.toFixed(2)), total_notes: moduleNotes.length };
    });

    return createResponse(config, {
      status: "success",
      data: {
        modules_affectes: moduleIds.length,
        groupes: groupeIds.length,
        stagiaires: stagiaires.length,
        moyenne_notes: Number(moyenneNotes.toFixed(2)),
        total_notes: notes.length,
        total_absences: absent + justifie,
        presences: { present, absent, justifie, total: presences.length },
        notes_par_module: notesParModule,
      },
    });
  }
  if (path === "/formateur/note-sheets" && method === "post") {
    const payload = parseBody<{ idAffectation: number; notes?: Array<{ idStagiaire: number }> }>(config.data);
    const { groupe, module } = getAffectationContext(Number(payload.idAffectation));

    addNotification({
      targetRole: "admin",
      type: "notes.submitted",
      title: "Notes recues",
      message: `${currentUser?.name ?? "Un formateur"} a envoye les notes du groupe ${groupe?.libelle ?? "-"} pour ${module?.libelle ?? "un module"}.`,
      payload: { idAffectation: Number(payload.idAffectation) },
    });

    payload.notes?.forEach((line) => {
      const stagiaire = store.stagiaires.find(
        (item) => Number(item.idStagiaire) === Number(line.idStagiaire),
      );
      if (!stagiaire) return;

      addNotification({
        targetRole: "stagiaire",
        targetEmail: stagiaire.email,
        type: "notes.available",
        title: "Nouvelle note",
        message: `Votre note pour ${module?.libelle ?? "un module"} a ete envoyee.`,
        payload: { idAffectation: Number(payload.idAffectation), idStagiaire: stagiaire.idStagiaire },
      });
    });

    return createResponse(config, { status: "success", data: { ok: true } });
  }
  if (path === "/formateur/presence-sessions" && method === "post") {
    const payload = parseBody<{ idAffectation: number }>(config.data);
    const { groupe, module } = getAffectationContext(Number(payload.idAffectation));

    addNotification({
      targetRole: "admin",
      type: "presence.submitted",
      title: "Presence recue",
      message: `${currentUser?.name ?? "Un formateur"} a envoye la presence du groupe ${groupe?.libelle ?? "-"} pour ${module?.libelle ?? "un module"}.`,
      payload: { idAffectation: Number(payload.idAffectation) },
    });

    return createResponse(config, { status: "success", data: { ok: true } });
  }
  if (path === "/stagiaire/bulletin" && method === "get") {
    const currentUserEmail = currentUser?.email;
    const stagiaire =
      (currentUserEmail
        ? store.stagiaires.find((s) => s.email === currentUserEmail)
        : undefined) ?? store.stagiaires[0];
    return createResponse(config, {
      status: "success",
      data: {
        stagiaire,
        notes: store.notes.filter((n) => n.idStagiaire === stagiaire.idStagiaire),
      },
    });
  }
  if (path === "/stagiaire/presences" && method === "get") {
    const currentUserEmail = currentUser?.email;
    const stagiaire =
      (currentUserEmail
        ? store.stagiaires.find((s) => s.email === currentUserEmail)
        : undefined) ?? store.stagiaires[0];
    return createResponse(config, {
      status: "success",
      data: {
        stagiaire,
        presences: store.presences.filter((p) => p.idStagiaire === stagiaire.idStagiaire),
      },
    });
  }
  if (path === "/notifications" && method === "get") {
    const data = notifications
      .filter((item) => {
        if (!currentUser) return false;
        if (item.targetEmail) return item.targetEmail === currentUser.email;
        return item.targetRole === currentUser.role;
      })
      .map(({ targetEmail, targetRole, ...notification }) => notification);

    return createResponse(config, { status: "success", data });
  }
  if (path === "/notifications/read" && method === "post") {
    notifications.forEach((item) => {
      if (!currentUser) return;
      const isTarget = item.targetEmail
        ? item.targetEmail === currentUser.email
        : item.targetRole === currentUser.role;

      if (isTarget && !item.read_at) {
        item.read_at = new Date().toISOString();
      }
    });

    return createResponse(config, { status: "success", data: { ok: true } });
  }

  // Handle entity endpoints
  const storeKey = endpointToStoreKey[endpoint];
  const entityName = endpointToEntityName[endpoint];

  if (!storeKey || !entityName) {
    throw createError(config, 404, "Endpoint introuvable");
  }

  const collection = store[storeKey] as Array<Record<string, unknown>>;
  const idKey = entityConfigs[entityName].idKey;
  const id = idOrSubResource;
  const numericId = Number(id);

  if (method === "get" && !id) {
    return createResponse(config, {
      status: "success",
      data: collection,
    });
  }

  if (method === "get" && id) {
    const found = collection.find((item) => Number(item[idKey]) === numericId);
    if (!found) throw createError(config, 404, "Ressource introuvable");
    return createResponse(config, {
      status: "success",
      data: found,
    });
  }

  if (method === "post") {
    const payload = parseBody<Record<string, unknown>>(config.data);
    const nextId =
      collection.length > 0
        ? Math.max(...collection.map((item) => Number(item[idKey]))) + 1
        : 1;
    const created = { ...payload, [idKey]: nextId };
    collection.push(created);
    if (entityName === "affectations") {
      notifyFormateurAffectation(nextId);
    }
    return createResponse(config, {
      status: "success",
      data: created,
    }, 201);
  }

  if (method === "put" && id) {
    const index = collection.findIndex((item) => Number(item[idKey]) === numericId);
    if (index === -1) throw createError(config, 404, "Ressource introuvable");
    const payload = parseBody<Record<string, unknown>>(config.data);
    const updated = { ...collection[index], ...payload, [idKey]: numericId };
    collection[index] = updated;
    if (entityName === "affectations") {
      notifyFormateurAffectation(numericId);
    }
    return createResponse(config, {
      status: "success",
      data: updated,
    });
  }

  if (method === "delete" && id) {
    const index = collection.findIndex((item) => Number(item[idKey]) === numericId);
    if (index === -1) throw createError(config, 404, "Ressource introuvable");
    collection.splice(index, 1);
    return createResponse(config, {
      status: "success",
      data: { ok: true },
    });
  }

  throw createError(config, 405, "Methode non supportee");
};
