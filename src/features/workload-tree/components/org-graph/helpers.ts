import { type Edge, type Node } from "@xyflow/react";
import type { Employee } from "api/workload";

export type GraphResult = {
  nodes: Node[];
  edges: Edge[];
};

export const buildGraph = (employees: Employee[]): GraphResult => {
  const nodes: Node[] = employees.map((emp) => ({
    id: emp.id,
    type: "person",
    position: { x: 0, y: 0 },
    data: {
      name: emp.name,
      designation: emp.designation,
      loadStatus: emp.loadStatus,
      loadRatio: emp.loadRatio,
      activeTaskCount: emp.activeTaskCount,
      capacity: emp.capacity,
    },
  }));

  const edges: Edge[] = employees
    .filter((emp) => emp.manager !== null)
    .map((emp) => ({
      id: `${emp.manager}->${emp.id}`,
      source: emp.manager as string,
      target: emp.id,
      type: "smoothstep",
      style: { strokeWidth: 2 },
    }));

  return { nodes, edges };
};
