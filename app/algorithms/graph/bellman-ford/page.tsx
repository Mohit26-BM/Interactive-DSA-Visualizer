import AlgoVisualizerClient from "@/components/graph/AlgoVisualizerClient";
export default function BellmanFordPage() {
  return <AlgoVisualizerClient algo="bellmanFord" title="Bellman-Ford Algorithm" directed={false} />;
}
