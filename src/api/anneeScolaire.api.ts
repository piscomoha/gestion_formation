import { createEntityApi } from "@/api/entityApi";
import type { AnneeScolaire } from "@/types";
import type { AnneeScolaireFormValues } from "@/lib/validators";

export const anneeScolaireApi = createEntityApi<
  AnneeScolaire,
  AnneeScolaireFormValues
>("/annees-scolaires");
