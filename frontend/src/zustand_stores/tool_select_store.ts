import { create } from "zustand"

type ToolSelect = {
    toolSelected: string,
    setTool: (tool: string) => void
}

export const useToolStore = create<ToolSelect>((set) => ({
    toolSelected: "notes",
    setTool: (tool) => {
        set((state) => ({ toolSelected: tool }))
    }
}))