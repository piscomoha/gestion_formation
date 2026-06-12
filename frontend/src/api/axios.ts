import axios from "axios";
import { toast } from "sonner";
import { mockAdapter } from "@/api/mockAdapter";

const useMockApi = import.meta.env.VITE_USE_MOCK_API !== "false";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:8080/api",
  timeout: 10_000,
  headers: {
    "Content-Type": "application/json",
  },
  adapter: useMockApi ? mockAdapter : undefined,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("tms_token");
  console.log("🚀 Request:", config.method?.toUpperCase(), config.url);
  console.log("📦 Request headers:", config.headers);
  console.log("🔑 Token:", token ? "exists" : "not found");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    console.log("✅ Response:", response.status, response.config.url);
    console.log("📥 Response data:", response.data);
    return response;
  },
  (error) => {
    console.error("❌ Error:", error.config?.method?.toUpperCase(), error.config?.url);
    console.error("📊 Error response:", error.response);
    const message =
      error.response?.data?.message ??
      "Une erreur est survenue pendant la communication avec l'API";

    toast.error(message);
    return Promise.reject(error);
  },
);
