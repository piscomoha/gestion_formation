import { stagiaireApi } from "@/api/stagiaire.api";
import { createEntityHooks } from "@/hooks/useEntityCrud";
import type { Stagiaire } from "@/types";
import type { StagiaireFormValues } from "@/lib/validators";

export const stagiaireHooks = createEntityHooks<Stagiaire, StagiaireFormValues>(
  "stagiaires",
  stagiaireApi,
  "Stagiaire",
);
