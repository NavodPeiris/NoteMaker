import axios from 'axios';
import { NOTE_CRUD_URL } from '@/urls';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { type GroupsItem } from '@/types/GroupsItem';

interface GroupsQuery{
    user_id: number
}

export default function useGroups(query: GroupsQuery){
    const fetchData = async () => {
        try{
            const res = await axios.post(`${NOTE_CRUD_URL}/getGroups`, {
                "user_id": query.user_id
            });
            return res.data.groups
        }
        catch(error){
            console.log(error)
        }
    }

    return useQuery<GroupsItem[]>({
        queryKey: ["groups"],
        queryFn: async () => {
            const data = await fetchData();
            return data ?? []; // fallback to []
        },
        staleTime: 10 * 1000,
        placeholderData: keepPreviousData
    })
}


