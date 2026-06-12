import type {
  AxiosAdapter,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { AxiosError } from "axios";
import { entityConfigs } from "@/lib/entities";
import { mockData } from "@/mocks/data";
import type { EntityName } from "@/types";

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
    data,
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

export const mockAdapter: AxiosAdapter = async (config) => {
  await delay();

  const path = getPath(config);
  const [, resource, id] = path.split("/");
  const endpoint = `/${resource}`;
  const storeKey = endpointToStoreKey[endpoint];
  const entityName = endpointToEntityName[endpoint];

  if (!storeKey || !entityName) {
    throw createError(config, 404, "Endpoint introuvable");
  }

  const collection = store[storeKey] as Array<Record<string, unknown>>;
  const idKey = entityConfigs[entityName].idKey;
  const numericId = Number(id);
  const method = (config.method ?? "get").toLowerCase();

  if (method === "get" && !id) {
    return createResponse(config, collection);
  }

  if (method === "get" && id) {
    const found = collection.find((item) => Number(item[idKey]) === numericId);
    if (!found) throw createError(config, 404, "Ressource introuvable");
    return createResponse(config, found);
  }

  if (method === "post") {
    const payload = parseBody<Record<string, unknown>>(config.data);
    const nextId =
      collection.length > 0
        ? Math.max(...collection.map((item) => Number(item[idKey]))) + 1
        : 1;
    const created = { ...payload, [idKey]: nextId };
    collection.push(created);
    return createResponse(config, created, 201);
  }

  if (method === "put" && id) {
    const index = collection.findIndex((item) => Number(item[idKey]) === numericId);
    if (index === -1) throw createError(config, 404, "Ressource introuvable");
    const payload = parseBody<Record<string, unknown>>(config.data);
    const updated = { ...collection[index], ...payload, [idKey]: numericId };
    collection[index] = updated;
    return createResponse(config, updated);
  }

  if (method === "delete" && id) {
    const index = collection.findIndex((item) => Number(item[idKey]) === numericId);
    if (index === -1) throw createError(config, 404, "Ressource introuvable");
    collection.splice(index, 1);
    return createResponse(config, { ok: true });
  }

  throw createError(config, 405, "Methode non supportee");
};
