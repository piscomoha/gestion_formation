import { createEntityApi } from "@/api/entityApi";
import type { Note } from "@/types";
import type { NoteFormValues } from "@/lib/validators";

export const noteApi = createEntityApi<Note, NoteFormValues>("/notes");
