import { createEntityApi } from "@/api/entityApi";
import type { Stagiaire } from "@/types";
import type { StagiaireFormValues } from "@/lib/validators";

export const stagiaireApi = createEntityApi<Stagiaire, StagiaireFormValues>(
  "/stagiaires",
);
