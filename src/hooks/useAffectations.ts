import { affectationApi } from "@/api/affectation.api";
import { createEntityHooks } from "@/hooks/useEntityCrud";
import type { Affectation } from "@/types";
import type { AffectationFormValues } from "@/lib/validators";

export const affectationHooks = createEntityHooks<
  Affectation,
  AffectationFormValues
>("affectations", affectationApi, "Affectation");
