import { Trace, StepData, Candidate, PipelineFunnel } from '@/types/trace';

// API response types (from existing traces.json)
interface ApiStep {
  stepName: string;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  reasoning: string;
  status: 'success' | 'failure';
  timestamp: string;
  durationMs?: number;
}

interface ApiTrace {
  id: string;
  name: string;
  timestamp: string;
  status: 'success' | 'failure';
  steps: ApiStep[];
}

interface ApiTracesData {
  traces: ApiTrace[];
}

// Icon mapping based on step name
function getStepIcon(stepName: string): 'zap' | 'search' | 'filter' | 'target' | 'check' {
  const iconMap: Record<string, 'zap' | 'search' | 'filter' | 'target' | 'check'> = {
    'Keyword Generation': 'zap',
    'Candidate Search': 'search',
    'Apply Filters': 'filter',
    'Rank & Select': 'target',
    'Final Selection': 'check',
  };
  return iconMap[stepName] || 'zap';
}

// Extract title and subtitle from trace name
function parseTraceName(name: string): { title: string; subtitle: string } {
  const parts = name.split(' - ');
  if (parts.length >= 2) {
    return { title: parts[0], subtitle: parts.slice(1).join(' - ') };
  }
  return { title: name, subtitle: 'Pipeline Trace' };
}

// Calculate duration from timestamps or use provided value
function calculateDuration(step: ApiStep, nextStep?: ApiStep): number {
  if (step.durationMs) return step.durationMs;
  if (!nextStep) return Math.floor(Math.random() * 400) + 100;
  
  const current = new Date(step.timestamp).getTime();
  const next = new Date(nextStep.timestamp).getTime();
  const diff = next - current;
  return diff > 0 ? diff : Math.floor(Math.random() * 400) + 100;
}

// Format timestamp to display format
function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

// Extract funnel data from steps
function extractFunnelData(steps: ApiStep[]): PipelineFunnel {
  let candidates = 0;
  let passedFilters = 0;
  let selected = 0;

  for (const step of steps) {
    if (step.stepName === 'Candidate Search') {
      const output = step.output as { candidates?: unknown[]; candidatesRetrieved?: number };
      candidates = output.candidates?.length || output.candidatesRetrieved || 0;
    } else if (step.stepName === 'Apply Filters') {
      const output = step.output as { passed?: number; passedCandidates?: unknown[] };
      passedFilters = output.passed || output.passedCandidates?.length || 0;
    } else if (step.stepName === 'Rank & Select' || step.stepName === 'Final Selection') {
      const output = step.output as { selected?: unknown; selectedAsin?: string };
      if (output.selected || output.selectedAsin) {
        selected = 1;
      }
    }
  }

  return { candidates, passedFilters, selected };
}

// Extract candidates from steps for the filter visualizer
function extractCandidates(steps: ApiStep[]): Candidate[] {
  const filterStep = steps.find(s => s.stepName === 'Apply Filters');
  const searchStep = steps.find(s => s.stepName === 'Candidate Search');
  
  if (!filterStep || !searchStep) return [];

  const searchOutput = searchStep.output as { candidates?: Array<{ asin: string; title: string; price: number; rating: number; reviews: number }> };
  const filterOutput = filterStep.output as { evaluations?: Array<{ asin: string; qualified: boolean; reason: string }> };
  
  if (!searchOutput.candidates || !filterOutput.evaluations) return [];

  const evaluationMap = new Map(filterOutput.evaluations.map(e => [e.asin, e]));
  
  return searchOutput.candidates.slice(0, 10).map(c => {
    const evaluation = evaluationMap.get(c.asin);
    return {
      asin: c.asin,
      title: c.title || `Product ${c.asin}`,
      price: c.price,
      rating: c.rating,
      reviews: c.reviews || 0,
      status: evaluation?.qualified ? 'passed' : 'failed' as 'passed' | 'failed',
      reason: evaluation?.reason,
    };
  });
}

// Transform a single step
function transformStep(step: ApiStep, index: number, steps: ApiStep[]): StepData {
  return {
    id: `step-${index + 1}`,
    name: step.stepName,
    status: step.status === 'success' ? 'success' : 'failed',
    duration: calculateDuration(step, steps[index + 1]),
    timestamp: formatTimestamp(step.timestamp),
    reasoning: step.reasoning,
    input: step.input,
    output: step.output,
    icon: getStepIcon(step.stepName),
  };
}

// Transform a single trace
function transformTrace(apiTrace: ApiTrace, index: number): Trace {
  const { title, subtitle } = parseTraceName(apiTrace.name);
  const steps = apiTrace.steps.map((step, i) => transformStep(step, i, apiTrace.steps));
  const funnel = extractFunnelData(apiTrace.steps);
  const candidates = extractCandidates(apiTrace.steps);

  return {
    id: apiTrace.id,
    traceId: apiTrace.id,
    title,
    subtitle,
    status: apiTrace.status === 'success' ? 'completed' : 'failed',
    timestamp: apiTrace.timestamp,
    funnel,
    steps,
    candidates: candidates.length > 0 ? candidates : undefined,
  };
}

// Main transform function for API data
export function transformApiTraces(data: ApiTracesData): Trace[] {
  return data.traces.map((trace, index) => transformTrace(trace, index));
}

// Helper to check if API data format
export function isApiFormat(data: unknown): data is ApiTracesData {
  if (!data || typeof data !== 'object') return false;
  const d = data as Record<string, unknown>;
  return Array.isArray(d.traces) && d.traces.length > 0 && 
    typeof (d.traces[0] as Record<string, unknown>).name === 'string';
}
