import { create } from "zustand"

type FilterGroup = {
    filterGroup?: string,
    setFilterGroup: (arg: string | undefined) => void
}

export const useFilterGroup = create<FilterGroup>((set) => ({
    filterGroup: undefined,
    setFilterGroup: (arg: string | undefined) => {
        set((state) => ({ filterGroup: arg }))
    }
}))