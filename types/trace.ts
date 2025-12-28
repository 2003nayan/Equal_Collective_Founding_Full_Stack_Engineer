export type StepStatus = 'success' | 'failed' | 'pending';

export interface StepData {
  id: string;
  name: string;
  status: StepStatus;
  duration: number; // in ms
  timestamp: string;
  reasoning: string;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  icon: 'zap' | 'search' | 'filter' | 'target' | 'check';
}

export interface Candidate {
  asin: string;
  title: string;
  price: number;
  rating: number;
  reviews: number;
  status: 'passed' | 'failed';
  reason?: string;
}

export interface PipelineFunnel {
  candidates: number;
  passedFilters: number;
  selected: number;
}

export interface Trace {
  id: string;
  traceId: string;
  title: string;
  subtitle: string;
  status: 'completed' | 'failed';
  timestamp: string;
  funnel: PipelineFunnel;
  steps: StepData[];
  candidates?: Candidate[];
}
