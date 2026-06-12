import { formateurApi } from "@/api/formateur.api";
import { createEntityHooks } from "@/hooks/useEntityCrud";
import type { Formateur } from "@/types";
import type { FormateurFormValues } from "@/lib/validators";

export const formateurHooks = createEntityHooks<Formateur, FormateurFormValues>(
  "formateurs",
  formateurApi,
  "Formateur",
);
