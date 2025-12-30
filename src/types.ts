// X-Ray Debugging System - Data Types

export type StepStatus = "success" | "failure";

export interface Step {
  stepName: string;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  reasoning: string;
  status: StepStatus;
  timestamp: string;
}

export interface Trace {
  id: string;
  name: string;
  timestamp: string;
  status: StepStatus;
  steps: Step[];
}

export interface TracesData {
  traces: Trace[];
}

// Filter step specific types
export interface Candidate {
  asin: string;
  price: number;
  rating: number;
  reviews?: number;
  title?: string;
}

export interface FilterEvaluation {
  asin: string;
  qualified: boolean;
  reason: string;
}

export interface FilterOutput {
  passed: number;
  failed: number;
  evaluations: FilterEvaluation[];
  passedCandidates: Candidate[];
  [key: string]: unknown;
}
