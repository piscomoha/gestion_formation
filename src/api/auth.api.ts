import { apiClient } from "@/api/axios";
import { unwrapApiData } from "@/api/response";
import type { AuthUser } from "@/types";

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
    const { data } = await apiClient.post<LoginResponse>("/login", payload);
    return unwrapApiData<LoginResponse>(data);
  },
  async me() {
    const { data } = await apiClient.get<AuthUser>("/user");
    return unwrapApiData<AuthUser>(data);
  },
  async logout() {
    await apiClient.post("/logout");
  },
};
