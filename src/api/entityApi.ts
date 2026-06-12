import { apiClient } from "@/api/axios";
import { unwrapApiData } from "@/api/response";

export function createEntityApi<TRecord extends object, TPayload extends object>(
  endpoint: string,
) {
  return {
    async list() {
      const { data } = await apiClient.get<TRecord[]>(endpoint);
      return unwrapApiData<TRecord[]>(data);
    },
    async get(id: number) {
      const { data } = await apiClient.get<TRecord>(`${endpoint}/${id}`);
      return unwrapApiData<TRecord>(data);
    },
    async create(payload: TPayload) {
      const { data } = await apiClient.post<TRecord>(endpoint, payload);
      return unwrapApiData<TRecord>(data);
    },
    async update(id: number, payload: TPayload) {
      const { data } = await apiClient.put<TRecord>(`${endpoint}/${id}`, payload);
      return unwrapApiData<TRecord>(data);
    },
    async remove(id: number) {
      await apiClient.delete(`${endpoint}/${id}`);
    },
  };
}
