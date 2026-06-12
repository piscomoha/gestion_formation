import { groupeApi } from "@/api/groupe.api";
import { createEntityHooks } from "@/hooks/useEntityCrud";
import type { Groupe } from "@/types";
import type { GroupeFormValues } from "@/lib/validators";

export const groupeHooks = createEntityHooks<Groupe, GroupeFormValues>(
  "groupes",
  groupeApi,
  "Groupe",
);
