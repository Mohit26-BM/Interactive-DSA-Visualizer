import AlgoVisualizerClient from "@/components/graph/AlgoVisualizerClient";
export default function DijkstraPage() {
  return <AlgoVisualizerClient algo="dijkstra" title="Dijkstra's Algorithm" directed={false} />;
}
