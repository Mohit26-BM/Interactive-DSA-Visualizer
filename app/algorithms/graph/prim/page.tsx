import AlgoVisualizerClient from "@/components/graph/AlgoVisualizerClient";

export default function PrimPage() {
  return (
    <AlgoVisualizerClient
      algo="prim"
      title="Prim's MST"
      directed={false}
    />
  );
}
