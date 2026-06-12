import { createEntityApi } from "@/api/entityApi";
import type { Module } from "@/types";
import type { ModuleFormValues } from "@/lib/validators";

export const moduleApi = createEntityApi<Module, ModuleFormValues>("/modules");
