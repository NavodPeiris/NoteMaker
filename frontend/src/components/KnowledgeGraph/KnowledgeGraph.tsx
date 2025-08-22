import { div } from 'framer-motion/client';
import React, { useRef } from 'react';
import { GraphCanvas, useSelection, type GraphEdge, type GraphNode} from 'reagraph';

interface KGInputs {
    nodes: GraphNode[]
    edges: GraphEdge[]
}

export default function KnowledgeGraph(props: KGInputs){
  const graphRef = useRef(null);

  const { selections, actives, onNodeClick, onCanvasClick } = useSelection({
    ref: graphRef,
    nodes: props.nodes,
    edges: props.edges,
    pathSelectionType: 'all',
  });

  return (
    <div style={{ position: "fixed", width: '75%', height: '50%'}}>
      <GraphCanvas
        ref={graphRef}
        nodes={props.nodes}
        edges={props.edges}
        selections={selections}
        actives={actives}
        onNodeClick={onNodeClick}
        onCanvasClick={onCanvasClick}
      />
    </div>
  );
}