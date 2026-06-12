import { anneeScolaireApi } from "@/api/anneeScolaire.api";
import { createEntityHooks } from "@/hooks/useEntityCrud";
import type { AnneeScolaire } from "@/types";
import type { AnneeScolaireFormValues } from "@/lib/validators";

export const anneeScolaireHooks = createEntityHooks<
  AnneeScolaire,
  AnneeScolaireFormValues
>("annees-scolaires", anneeScolaireApi, "Annee scolaire");
