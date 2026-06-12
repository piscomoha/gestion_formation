import { noteApi } from "@/api/note.api";
import { createEntityHooks } from "@/hooks/useEntityCrud";
import type { Note } from "@/types";
import type { NoteFormValues } from "@/lib/validators";

export const noteHooks = createEntityHooks<Note, NoteFormValues>(
  "notes",
  noteApi,
  "Note",
);
