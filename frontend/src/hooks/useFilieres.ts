import { filiereApi } from "@/api/filiere.api";
import { createEntityHooks } from "@/hooks/useEntityCrud";
import type { Filiere } from "@/types";
import type { FiliereFormValues } from "@/lib/validators";

export const filiereHooks = createEntityHooks<Filiere, FiliereFormValues>(
  "filieres",
  filiereApi,
  "Filiere",
);
