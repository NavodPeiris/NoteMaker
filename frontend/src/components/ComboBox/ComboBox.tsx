import { useState } from "react"
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useFilterGroup } from "@/zustand_stores/filter_group_store"
import { useFilterTags } from "@/zustand_stores/filter_tags_store"

/*
const frameworks = [
  {
    value: "next.js",
    label: "Next.js",
  },
  {
    value: "sveltekit",
    label: "SvelteKit",
  },
  {
    value: "nuxt.js",
    label: "Nuxt.js",
  },
  {
    value: "remix",
    label: "Remix",
  },
  {
    value: "astro",
    label: "Astro",
  },
]
*/

type listItem = {
    value: string
    label: string
}

interface ComboBoxProps{
    items: listItem[] | undefined
    comboPlaceholder: string
    searchPlaceholder: string
    searchNotFoundMsg: string
    valueUsing: string
}

export default function ComboBox(props: ComboBoxProps) {
  const [open, setOpen] = useState<boolean>(false)

  let value: string | undefined
  let setValue: (arg: string | undefined) => void

  if(props.valueUsing === "group"){
    value = useFilterGroup((store) => store.filterGroup)
    setValue = useFilterGroup((store) => store.setFilterGroup)
  }

  if(props.valueUsing === "tag"){
    value = useFilterTags((store) => store.filterTag)
    setValue = useFilterTags((store) => store.setFilterTag)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          style={{ backgroundColor: "white"}}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between mb-2"
        >
          {value
            ? props.items?.find((item) => item.value === value)?.label
            : props.comboPlaceholder}
          <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder={props.searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{props.searchNotFoundMsg}</CommandEmpty>
            <CommandGroup>
              {props.items?.map((item) => (
                <CommandItem
                  key={item.value}
                  value={item.value}
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? undefined : currentValue)
                    setOpen(false)
                  }}
                >
                  <CheckIcon
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === item.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {item.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}