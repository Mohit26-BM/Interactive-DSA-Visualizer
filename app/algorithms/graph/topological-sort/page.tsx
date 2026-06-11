import AlgoVisualizerClient from "@/components/graph/AlgoVisualizerClient";

export default function TopologicalSortPage() {
  return (
    <AlgoVisualizerClient
      algo="topoSort"
      title="Topological Sort"
      icon="⊳"
      color="bg-violet-700"
      directed={true}
    />
  );
}
