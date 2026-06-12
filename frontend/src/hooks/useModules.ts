import { moduleApi } from "@/api/module.api";
import { createEntityHooks } from "@/hooks/useEntityCrud";
import type { Module } from "@/types";
import type { ModuleFormValues } from "@/lib/validators";

export const moduleHooks = createEntityHooks<Module, ModuleFormValues>(
  "modules",
  moduleApi,
  "Module",
);
