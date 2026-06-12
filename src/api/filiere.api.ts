import { createEntityApi } from "@/api/entityApi";
import type { Filiere } from "@/types";
import type { FiliereFormValues } from "@/lib/validators";

export const filiereApi = createEntityApi<Filiere, FiliereFormValues>("/filieres");
