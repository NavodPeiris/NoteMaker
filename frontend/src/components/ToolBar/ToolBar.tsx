import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"
import { useToolStore } from "@/zustand_stores/tool_select_store"


export default function ToolBar() {

  const setTool = useToolStore((tool) => tool.setTool)
  const toolSelected = useToolStore((tool) => tool.toolSelected)

  return (
    <ToggleGroup className="gap-2" type="single">
      <ToggleGroupItem style={{ backgroundColor: "white"}} value="notes" aria-label="Toggle notes"
        onClick={() => {setTool("notes")}}
      >
        Notes
      </ToggleGroupItem>
      <ToggleGroupItem style={{ backgroundColor: "white"}} value="knowledge_graph" aria-label="Toggle kg"
        onClick={() => {setTool("knowledge_graph")}}
      >
        Knowledge Graph
      </ToggleGroupItem>
      <ToggleGroupItem style={{ backgroundColor: "white"}} value="chat" aria-label="Toggle chat"
        onClick={() => {setTool("chat")}}
      >
        Chat With Notes
      </ToggleGroupItem>
    </ToggleGroup>
  )
}