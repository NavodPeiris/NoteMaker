import type { NoteItem } from '@/types/NoteItem';
import axios from 'axios';
import { NOTE_CRUD_URL } from '@/urls';
import { keepPreviousData, useQuery } from '@tanstack/react-query';

interface NotesQuery{
    page: number
    pageSize: number
    user_id: number
}

interface NotesReturn{
    notes: NoteItem[]
    has_next: boolean
}

export default function useNotes(query: NotesQuery){
    const fetchData = async () => {
        try{
            const res = await axios.post(`${NOTE_CRUD_URL}/read`, {
                "page": query.page,
                "page_size": query.pageSize,
                "user_id": query.user_id
            });
            return {data: res.data.notes, has_next: res.data.has_next}
        }
        catch(error){
            console.log(error)
            return { data: [], has_next: false }
        }
    }

    return useQuery<NotesReturn>({
        queryKey: ["notes", query],
        queryFn: async () => {
            const { data, has_next } = await fetchData();
            return {notes: data, has_next: has_next}
        },
        staleTime: 10 * 1000,
        placeholderData: keepPreviousData
    })
}


