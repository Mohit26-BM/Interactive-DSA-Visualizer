export interface Step {
  explanation: string;
  highlightLine: number;
  highlightIndices?: number[];
  highlightNodes?: string[];
  phase?: string;
}

export interface ArrayState {
  elements: { value: number; id: string }[];
}

export interface ArrayStep extends Step {
  state: ArrayState;
}

export interface LinkedListNode {
  id: string;
  value: number;
  next: string | null;
}

export interface LinkedListState {
  nodes: LinkedListNode[];
  head: string | null;
}

export interface LinkedListStep extends Step {
  state: LinkedListState;
}

export type Operation = {
  label: string;
  value: string;
};
