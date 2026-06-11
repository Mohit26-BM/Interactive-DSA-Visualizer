import AlgoVisualizerClient from "@/components/graph/AlgoVisualizerClient";
export default function KruskalPage() {
  return <AlgoVisualizerClient algo="kruskal" title="Kruskal's MST" icon="⌂" color="bg-indigo-700" directed={false} />;
}
