import { createEntityApi } from "@/api/entityApi";
import type { Affectation } from "@/types";
import type { AffectationFormValues } from "@/lib/validators";

export const affectationApi = createEntityApi<
  Affectation,
  AffectationFormValues
>("/affectations");
