import { apiClient } from "@/api/axios";
import { unwrapApiData } from "@/api/response";
import type { AuthUser } from "@/types";

function normalizeAuthUser(input: unknown): AuthUser {
  const user = input as Record<string, unknown> | null;
  const id = Number(user?.id ?? 0);
  const email = String(user?.email ?? "");
  const role = user?.role as AuthUser["role"];
  const name =
    (typeof user?.name === "string" && user.name.length > 0
      ? user.name
      : `${String(user?.prenom ?? "")} ${String(user?.nom ?? "")}`.trim()) || email;

  return { id, name, email, role };
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: AuthUser;
  token: string;
}

export const authApi = {
  async login(payload: LoginPayload) {
    const { data } = await apiClient.post("/login", payload);
    const unwrapped = unwrapApiData<Record<string, unknown>>(data);
    const user = normalizeAuthUser(unwrapped.user);
    const token = String(unwrapped.token ?? "");
    return { user, token } satisfies LoginResponse;
  },
  async me() {
    const { data } = await apiClient.get("/user");
    const unwrapped = unwrapApiData<unknown>(data);
    return normalizeAuthUser(unwrapped);
  },
  async logout() {
    await apiClient.post("/logout");
  },
};
