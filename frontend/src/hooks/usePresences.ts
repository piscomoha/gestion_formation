import { presenceApi } from "@/api/presence.api";
import { createEntityHooks } from "@/hooks/useEntityCrud";
import type { Presence } from "@/types";
import type { PresenceFormValues } from "@/lib/validators";

export const presenceHooks = createEntityHooks<Presence, PresenceFormValues>(
  "presences",
  presenceApi,
  "Presence",
);
