import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { type NoteItem } from "@/types/NoteItem"
import { Toaster } from "@/components/ui/sonner"
import { useNoteSelect } from "@/zustand_stores/note_select_store"

interface NoteProps {
  noteItem: NoteItem;
}

export default function ListedNote({noteItem} : NoteProps) {
  const setNoteSelected = useNoteSelect((store) => store.setNoteSelected)
  
  return (
    <Card className="w-full mb-2 cursor-pointer hover:bg-gray-100"
      onClick={() => {
        setNoteSelected(noteItem)
      }}
    >
      <Toaster richColors position="top-center"/>
      <CardHeader>
        <CardTitle>{noteItem.title}</CardTitle>
        <CardDescription>
          Updated at: {new Date(noteItem.updatedAt).toISOString().replace("T", " ").substring(0, 19)} <br/>
          group: {noteItem.group.title} <br/>
          tags: {noteItem.tags.map((tag) => (tag + ", "))}
        </CardDescription>
      </CardHeader>
    </Card>
  )
}
