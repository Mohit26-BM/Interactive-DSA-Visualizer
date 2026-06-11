import QueueVisualizerClient from "@/components/queue/QueueVisualizerClient";
export default function LLQueuePage() {
  return <QueueVisualizerClient queueType="linkedlist" title="Linked List Queue" icon="⇒" color="bg-sky-600" />;
}
