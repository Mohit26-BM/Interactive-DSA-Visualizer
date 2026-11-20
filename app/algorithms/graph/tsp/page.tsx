import AlgoVisualizerClient from "@/components/graph/AlgoVisualizerClient";

export default function TSPPage() {
  return (
    <AlgoVisualizerClient
      algo="tsp"
      title="Travelling Salesman Problem"
      directed={false}
    />
  );
}
