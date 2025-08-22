import { type GroupsItem } from "./GroupsItem"

export interface NoteItem {
  id: number,
  title: string,
  tags: string[],
  note: string,
  group: GroupsItem,
  updatedAt: string
}