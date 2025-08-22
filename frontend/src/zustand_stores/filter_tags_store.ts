import { create } from "zustand"

type FilterTags = {
    filterTag?: string,
    setFilterTag: (arg: string | undefined) => void
}

export const useFilterTags = create<FilterTags>((set) => ({
    filterTag: undefined,
    setFilterTag: (arg: string | undefined) => {
        set((state) => ({ filterTag: arg }))
    }
}))