import axios from 'axios';
import { AI_ANALYZE_URL } from '@/urls';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { type GraphEdge, type GraphNode} from 'reagraph';

interface KGQuery{
    user_id: number
}

interface KGReturn{
    kgNodes: GraphNode[]
    kgEdges: GraphEdge[]
}

export default function useKnowledgeGraph(query: KGQuery){
    const fetchData = async () => {
        try{
            const nodesRes = await axios.post(`${AI_ANALYZE_URL}/getKGNodes`, {
                "user_id": query.user_id
            });

            const edgesRes = await axios.post(`${AI_ANALYZE_URL}/getKGEdges`, {
                "user_id": query.user_id
            });

            return {kgNodes: nodesRes.data.nodes, kgEdges: edgesRes.data.edges}
        }
        catch(error){
            console.log(error)
            return { kgNodes: [], kgEdges: [] }
        }
    }

    return useQuery<KGReturn>({
        queryKey: ["knowledge_graph"],
        queryFn: async () => {
            const { kgNodes, kgEdges } = await fetchData();
            return {kgNodes: kgNodes, kgEdges: kgEdges}
        },
        staleTime: 10 * 1000,
        placeholderData: keepPreviousData
    })
}


