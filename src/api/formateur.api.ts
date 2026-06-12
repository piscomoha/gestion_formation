import { createEntityApi } from "@/api/entityApi";
import type { Formateur } from "@/types";
import type { FormateurFormValues } from "@/lib/validators";

export const formateurApi = createEntityApi<Formateur, FormateurFormValues>(
  "/formateurs",
);
