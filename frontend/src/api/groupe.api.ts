import { createEntityApi } from "@/api/entityApi";
import type { Groupe } from "@/types";
import type { GroupeFormValues } from "@/lib/validators";

export const groupeApi = createEntityApi<Groupe, GroupeFormValues>("/groupes");
