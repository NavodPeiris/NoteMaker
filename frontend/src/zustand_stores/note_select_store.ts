import { create } from "zustand"
import { type NoteItem } from "@/types/NoteItem"

type NoteSelect = {
    noteSelected?: NoteItem,
    setNoteSelected: (note: NoteItem | undefined) => void
}

export const useNoteSelect = create<NoteSelect>((set) => ({
    noteSelected: undefined,
    setNoteSelected: (note: NoteItem | undefined) => {
        set((state) => ({ noteSelected: note }))
    }
}))