import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tag, Trash } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import axios from "axios";
import { Toaster } from "@/components/ui/sonner"
import { toast } from "sonner"
import { NOTE_CRUD_URL, AI_ANALYZE_URL } from "@/urls";
import { useQueryClient } from "@tanstack/react-query";
import useGroups from "@/hooks/useGroups";
import type { GroupsItem } from "@/types/GroupsItem";

export default function NoteMaker() {
  const [title, setTitle] = useState<string>("");
  const [tags, setTags]= useState<string[]>([]);
  const [note, setNote] = useState<string>("");
  const [group, setGroup] = useState<GroupsItem>();

  const [open, setOpen] = useState(false);

  const user_id = Number(localStorage.getItem('user_id'));

  const queryClient = useQueryClient()

  const { data: groups, isLoading, error } = useGroups({user_id: user_id})
  
  return( isLoading ? (<div>Loading</div>): (
    <div className="flex px-2 justify-start">
      <Toaster richColors position="top-center"/>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>Add Note</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create a Note</DialogTitle>
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
                console.log("selected group:", selectedGroup)
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
              console.log("group: ", group)
              try{
                if(title === "") toast.error("Please Enter a Title")
                const res1 = await axios.post(`${NOTE_CRUD_URL}/create`, {
                  "title": title,
                  "tags": tags,
                  "note": note,
                  "group_id": group?.id,
                  "updatedAt": new Date().toISOString(),
                  "user_id": user_id
                })

                console.log(res1.data)
                queryClient.invalidateQueries({ queryKey: ["notes"] })

                const res2 = await axios.post(`${AI_ANALYZE_URL}/kgupdate`, {
                  "note_id": res1.data.note_id,
                  "text": note,
                  "user_id": user_id
                })

                queryClient.invalidateQueries({ queryKey: ["knowledge_graph"] })
                console.log(res2.data)

                setOpen(false)
              }
              catch(error){
                console.log(error)
              }
            }}>
              Add Note
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  ))
    
}
