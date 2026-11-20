import AlgoVisualizerClient from "@/components/graph/AlgoVisualizerClient";
export default function KruskalPage() {
  return <AlgoVisualizerClient algo="kruskal" title="Kruskal's MST" directed={false} />;
}
