import QueueVisualizerClient from "@/components/queue/QueueVisualizerClient";
export default function CircularQueuePage() {
  return <QueueVisualizerClient queueType="circular" title="Circular Queue" icon="↻" color="bg-cyan-600" />;
}
