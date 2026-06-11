import AlgoVisualizerClient from "@/components/graph/AlgoVisualizerClient";
export default function BellmanFordPage() {
  return <AlgoVisualizerClient algo="bellmanFord" title="Bellman-Ford Algorithm" icon="↺" color="bg-purple-700" directed={false} />;
}
