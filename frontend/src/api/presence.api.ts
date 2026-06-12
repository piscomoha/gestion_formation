import { createEntityApi } from "@/api/entityApi";
import type { Presence } from "@/types";
import type { PresenceFormValues } from "@/lib/validators";

export const presenceApi = createEntityApi<Presence, PresenceFormValues>(
  "/presences",
);
