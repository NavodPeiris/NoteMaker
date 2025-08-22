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
import { NOTE_CRUD_URL } from "@/urls";
import { useQueryClient } from "@tanstack/react-query";

export default function GroupMaker() {
  const [title, setTitle] = useState<string>("");

  const user_id = Number(localStorage.getItem('user_id'));

  const queryClient = useQueryClient()

  return (
    <div className="flex px-2 justify-start">
      <Toaster richColors position="top-center"/>
      <Dialog>
        <DialogTrigger asChild>
          <Button>Add Group</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create a Group</DialogTitle>
          </DialogHeader>
          
          {/* Title */}
          <Input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          {/* Bottom toolbar */}
          <div className="flex justify-between items-center mt-2">
            <Button onClick={async() => {
              try{
                if(title === "") toast.error("Please Enter a Title")
                const res = await axios.post(`${NOTE_CRUD_URL}/createGroups`, {
                  "title": title,
                  "user_id": user_id
                })

                console.log(res.data)
                queryClient.invalidateQueries({ queryKey: ["groups"] })
              }
              catch(error){
                console.log(error)
              }
            }}>
              Add Group
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
