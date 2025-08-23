import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { NOTE_CRUD_URL } from "@/urls";
import { useQueryClient } from "@tanstack/react-query";

export default function GroupMaker() {
  const [title, setTitle] = useState<string>("");
  const [open, setOpen] = useState(false);
  const user_id = Number(localStorage.getItem("user_id"));
  const queryClient = useQueryClient();

  const handleAddGroup = async () => {
    try {
      if (title.trim() === "") {
        toast.error("Please Enter a Title");
        return;
      }

      const res = await axios.post(`${NOTE_CRUD_URL}/createGroups`, {
        title,
        user_id,
      });

      console.log(res.data);
      queryClient.invalidateQueries({ queryKey: ["groups"] });

      setOpen(false);
      setTitle("");
    } catch (error) {
      console.log(error);
      toast.error("Failed to create group");
    }
  };

  return (
    <div className="flex px-2 justify-start">
      <Toaster richColors position="top-center" />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button onClick={() => setOpen(true)}>Add Group</Button>
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
            <Button onClick={handleAddGroup}>Add Group</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
