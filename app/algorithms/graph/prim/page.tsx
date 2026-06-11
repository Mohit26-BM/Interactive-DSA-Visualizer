import AlgoVisualizerClient from "@/components/graph/AlgoVisualizerClient";

export default function PrimPage() {
  return (
    <AlgoVisualizerClient
      algo="prim"
      title="Prim's MST"
      icon="⌂"
      color="bg-emerald-700"
      directed={false}
    />
  );
}
