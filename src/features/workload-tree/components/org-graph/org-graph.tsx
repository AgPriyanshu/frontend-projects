import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { Employee, LoadStatus } from "api/workload/types";
import { useEffect, useMemo } from "react";
import { minimapColors, nodeTypes } from "./constants";
import { buildGraph } from "./helpers";
import { applyDagreLayout } from "./layout";
import "./org-graph.css";

interface OrgGraphProps {
  employees: Employee[];
  selectedId: string | null;
  onSelectEmployee: (id: string | null) => void;
}

export const OrgGraph = ({
  employees,
  selectedId,
  onSelectEmployee,
}: OrgGraphProps) => {
  // Hooks.
  const { fitView } = useReactFlow();

  // Memos.
  const { nodes: rawNodes, edges: rawEdges } = useMemo(
    () => buildGraph(employees),
    [employees]
  );

  const layoutNodes = useMemo(
    () => applyDagreLayout(rawNodes, rawEdges),
    [rawNodes, rawEdges]
  );

  // States.
  const [nodes, setNodes, onNodesChange] = useNodesState(rawNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(rawEdges);

  // Effects.
  useEffect(() => {
    setNodes(layoutNodes);
    setEdges(rawEdges);
    setTimeout(() => fitView({ padding: 0.2, duration: 400 }), 100);
  }, [layoutNodes, rawEdges, setNodes, setEdges, fitView]);

  // Variables
  const nodesWithSelection = nodes.map((n) => ({
    ...n,
    selected: n.id === selectedId,
  }));

  // Renders.
  return (
    <ReactFlow
      className="org-graph"
      style={{ width: "100%", height: "100%" }}
      nodes={nodesWithSelection}
      edges={edges}
      nodeTypes={nodeTypes}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onNodeClick={(_event, node) => {
        onSelectEmployee(node.id === selectedId ? null : node.id);
      }}
      onPaneClick={() => onSelectEmployee(null)}
      fitView
      minZoom={0.2}
      maxZoom={2}
    >
      <Background gap={20} color="#e2e8f0" />
      <Controls style={{ color: "black" }} />
      <MiniMap
        nodeColor={(node) =>
          minimapColors[(node.data as { loadStatus: LoadStatus }).loadStatus] ??
          "#94a3b8"
        }
        maskColor="rgba(0,0,0,0.05)"
      />
    </ReactFlow>
  );
};

export const OrgGraphContainer = (props: OrgGraphProps) => (
  <ReactFlowProvider>
    <OrgGraph {...props} />
  </ReactFlowProvider>
);
