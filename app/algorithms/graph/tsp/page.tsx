import AlgoVisualizerClient from "@/components/graph/AlgoVisualizerClient";

export default function TSPPage() {
  return (
    <AlgoVisualizerClient
      algo="tsp"
      title="Travelling Salesman Problem"
      icon="✈"
      color="bg-pink-700"
      directed={false}
    />
  );
}
