import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { type NoteItem } from "@/types/NoteItem"
import { type GroupsItem } from "@/types/GroupsItem"
import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tag, Trash } from "lucide-react";
import { Toaster } from "@/components/ui/sonner"
import { toast } from "sonner"
import { AI_ANALYZE_URL, NOTE_CRUD_URL } from "@/urls";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios"
import useGroups from "@/hooks/useGroups"
import { useNoteSelect } from "@/zustand_stores/note_select_store"

interface NoteProps {
  noteItem: NoteItem;
}

export default function NoteCard({noteItem} : NoteProps) {

  const [title, setTitle] = useState<string>(noteItem.title);
  const [tags, setTags]= useState<string[]>(noteItem.tags);
  const [note, setNote] = useState<string>(noteItem.note);
  const [group, setGroup] = useState<GroupsItem>(noteItem.group);
  const [summary, setSummary] = useState<string>("");

  const [updateOpen, setUpdateOpen] = useState(false);

  const queryClient = useQueryClient()
  const user_id = Number(localStorage.getItem('user_id'))

  const { data: groups, isLoading, error } = useGroups({user_id: user_id})
  const setNoteSelected = useNoteSelect((store) => store.setNoteSelected)

  useEffect(() => {
    setTitle(noteItem.title)
    setTags(noteItem.tags)
    setNote(noteItem.note)
    setGroup(noteItem.group)
    setSummary("")
  }, [noteItem])

  return (isLoading ? (<div>Loading</div>): (
    <Card className="w-full mb-2">
      <Toaster richColors position="top-center"/>
      <CardHeader>
        <CardTitle>{noteItem.title}</CardTitle>
        <CardDescription>
          Updated at: {new Date(noteItem.updatedAt).toISOString().replace("T", " ").substring(0, 19)} <br/>
          group: {noteItem.group.title} <br/>
          tags: {noteItem.tags.map((tag) => (tag + ", "))}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p>
          {noteItem.note}
        </p>
      </CardContent>

      <CardFooter className="flex justify-end gap-2">
        {/* update note button*/}
        <Dialog open={updateOpen} onOpenChange={setUpdateOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setUpdateOpen(true)}>Update Note</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Update Note</DialogTitle>
            </DialogHeader>
            
            {/* Title */}
            <Input
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <Select
              value={String(group?.id)} // select expects a string/number
              onValueChange={(value) => {
                const selectedGroup = groups?.find((g) => g.id === Number(value));
                if (selectedGroup) {
                  setGroup({
                    id: selectedGroup.id,
                    title: selectedGroup.title,
                  });
                }
              }}
            >
              <SelectTrigger style={{ backgroundColor: "white" }} className="w-[180px]">
                <SelectValue placeholder="Select a Group" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Groups</SelectLabel>
                  {groups?.map((grp) => (
                    <SelectItem key={grp.id} value={String(grp.id)}>
                      {grp.title}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            {/* Toolbar */}
            <div className="flex items-center space-x-2 border-b py-2">
              <Button 
                variant="outline" 
                style={{backgroundColor: "white"}} 
                size="icon"
                onClick={() => {setTags((prev) => [...prev, ""])}}
              >
                <Tag size={18} />
              </Button>
            </div>

            {tags.map((tag, index) => (
              <div className="flex items-center space-x-2 border-b py-2">
                <Input
                  placeholder="add tag"
                  value={tag}
                  onChange={(e) => {
                    const updatedTags = [...tags]
                    updatedTags[index] = e.target.value
                    setTags(updatedTags)
                  }}
                />
                <Button 
                  variant="outline" 
                  style={{backgroundColor: "white"}} 
                  size="icon"
                  onClick={() => {
                    const updatedTags = tags.filter((_, i) => i != index)
                    setTags(updatedTags)
                  }}
                >
                  <Trash color="red" size={18} />
                </Button>
              </div>
            ))}

            {/* Textarea */}
            <Textarea
              placeholder="Write your note..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="h-32"
            />

            {/* Bottom toolbar */}
            <div className="flex justify-between items-center mt-2">
              <Button onClick={async() => {
                try{
                  if(title === "") toast.error("Please Enter a Title")
                  
                    const updatedAt = new Date().toISOString()
                    const res = await axios.post(`${NOTE_CRUD_URL}/update`, {
                    "id": noteItem.id,
                    "title": title,
                    "tags": tags,
                    "note": note,
                    "group_id": group.id,
                    "updatedAt": new Date().toISOString(),
                    "user_id": user_id
                  })

                  setNoteSelected({
                    "id": noteItem.id,
                    "title": title,
                    "tags": tags,
                    "note": note,
                    "group": {
                      "id": group.id,
                      "title": group.title
                    },
                    "updatedAt": updatedAt,
                  })

                  console.log(res.data)
                  queryClient.invalidateQueries({ queryKey: ["notes"] })

                  const res2 = await axios.post(`${AI_ANALYZE_URL}/kgupdate`, {
                    "note_id": noteItem.id,
                    "text": note,
                    "user_id": user_id
                  })

                  queryClient.invalidateQueries({ queryKey: ["knowledge_graph"] })
                  console.log(res2.data)

                  setUpdateOpen(false)
                }
                catch(error){
                  toast.error("Failed to update note")
                  console.log(error)
                }
              }}>
                Update
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        

        {/* delete note button*/}
        <Button
          onClick={async() => {
            try{
              const res1 = await axios.post(`${NOTE_CRUD_URL}/delete`, {
                "id": noteItem.id,
                "user_id": user_id
              })

              console.log(res1.data)
              setNoteSelected(undefined)

              queryClient.invalidateQueries({ queryKey: ["notes"] })

              const res2 = await axios.post(`${AI_ANALYZE_URL}/kgdelete`, {
                "note_id": noteItem.id,
              })

              queryClient.invalidateQueries({ queryKey: ["knowledge_graph"] })
              console.log(res2.data)
            }
            catch(err){
              toast.error("Failed to delete note")
              console.log(err)
            }
          }}
        >
          Delete
        </Button>
        

        {/* generate note summary button*/}
        <Dialog>
          <DialogTrigger asChild>
            <Button>Genrate Summary</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Summary</DialogTitle>
            </DialogHeader>
            
            <p>
              {summary}
            </p>  

            {/* Bottom toolbar */}
            <div className="flex justify-between items-center mt-2">
              <Button onClick={async() => {
                try{
                  const res = await axios.post(`${AI_ANALYZE_URL}/summarize`, {
                    "text": noteItem.note,
                    "user_id": user_id
                  })

                  console.log(res.data)
                  setSummary(res.data.summary)
                }
                catch(error){
                  toast.error("Failed to generate summary")
                  console.log(error)
                }
              }}>
                Generate
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardFooter>

    </Card>
  ))
}
