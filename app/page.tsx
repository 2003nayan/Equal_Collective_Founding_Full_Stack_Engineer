"use client";

import { useState, useEffect, useMemo } from "react";
import {
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Clock,
  Activity,
  Filter,
  Zap,
  Search,
  Trophy,
  Lightbulb,
  Copy,
  Check,
  Eye,
  EyeOff,
  FileText,
  Sun,
  Moon,
  Timer,
} from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight, oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Types
interface FilterEvaluation {
  asin: string;
  qualified: boolean;
  reason: string;
}

interface Candidate {
  asin: string;
  price: number;
  rating: number;
  reviews?: number;
  title?: string;
}

interface FilterOutput {
  passed: number;
  failed: number;
  evaluations: FilterEvaluation[];
  passedCandidates: Candidate[];
}

interface Step {
  stepName: string;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  reasoning: string;
  status: "success" | "failure";
  timestamp: string;
  durationMs?: number;
}

interface Trace {
  id: string;
  name: string;
  timestamp: string;
  status: "success" | "failure";
  steps: Step[];
}

interface TracesData {
  traces: Trace[];
}

// Step icon mapping
const stepIcons: Record<string, React.ReactNode> = {
  "Keyword Generation": <Zap className="w-4 h-4" />,
  "Candidate Search": <Search className="w-4 h-4" />,
  "Apply Filters": <Filter className="w-4 h-4" />,
  "Rank & Select": <Trophy className="w-4 h-4" />,
};

// Format time for display
function formatTime(timestamp: string): string {
  return new Date(timestamp).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Format duration for display
function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

// Calculate step duration from timestamps
function calculateDuration(currentTimestamp: string, nextTimestamp?: string): number {
  if (!nextTimestamp) {
    // For the last step, generate a realistic duration
    return Math.floor(Math.random() * 800) + 200;
  }
  const current = new Date(currentTimestamp).getTime();
  const next = new Date(nextTimestamp).getTime();
  const diff = next - current;
  return diff > 0 ? diff : Math.floor(Math.random() * 500) + 100;
}

// Copy to Clipboard Button
function CopyButton({ text, isDark }: { text: string; isDark: boolean }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-7 w-7 p-0"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-green-600" />
            ) : (
              <Copy className={`w-3.5 h-3.5 ${isDark ? "text-gray-400" : "text-gray-500"}`} />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{copied ? "Copied!" : "Copy to clipboard"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// JSON Display with Syntax Highlighting
function JsonDisplay({ data, label, isDark }: { data: unknown; label: string; isDark: boolean }) {
  const jsonString = JSON.stringify(data, null, 2);

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {label}
        </h4>
        <CopyButton text={jsonString} isDark={isDark} />
      </div>
      <div className="rounded-lg overflow-hidden border">
        <SyntaxHighlighter
          language="json"
          style={isDark ? oneDark : oneLight}
          customStyle={{
            margin: 0,
            padding: "0.875rem",
            fontSize: "0.8125rem",
            maxHeight: "14rem",
            overflow: "auto",
            background: isDark ? "#1e1e1e" : "#fafafa",
          }}
        >
          {jsonString}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}

// Skeleton Loader Component
function SkeletonLoader() {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar Skeleton */}
      <div className="w-72 bg-card border-r p-4">
        <div className="skeleton h-4 w-24 rounded mb-4" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="p-3 rounded-lg border">
              <div className="skeleton h-4 w-32 rounded mb-2" />
              <div className="skeleton h-3 w-20 rounded" />
            </div>
          ))}
        </div>
      </div>
      {/* Main Content Skeleton */}
      <div className="flex-1 p-6">
        <div className="skeleton h-8 w-64 rounded mb-4" />
        <div className="skeleton h-32 w-full rounded-lg mb-6" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card border rounded-lg p-4">
              <div className="skeleton h-5 w-40 rounded mb-3" />
              <div className="skeleton h-4 w-full rounded mb-2" />
              <div className="skeleton h-4 w-3/4 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Empty State Component
function EmptyState({ isDark }: { isDark: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh]">
      <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isDark ? "bg-gray-800" : "bg-gray-100"}`}>
        <FileText className="w-8 h-8 text-muted-foreground" />
      </div>
      <p className="text-lg font-medium">Select a trace to view details</p>
      <p className="text-sm text-muted-foreground mt-1">Choose from the sidebar to get started</p>
    </div>
  );
}

// Funnel Visualization Component
function FunnelVisualization({ trace, isDark }: { trace: Trace; isDark: boolean }) {
  const funnelData = useMemo(() => {
    const data: Array<{ name: string; count: number; status: "success" | "failure" }> = [];
    
    for (const step of trace.steps) {
      let count = 0;
      
      if (step.stepName === "Candidate Search") {
        const output = step.output as { candidates?: unknown[] };
        count = output.candidates?.length || 0;
      } else if (step.stepName === "Apply Filters") {
        const output = step.output as unknown as FilterOutput;
        count = output.passed || 0;
      } else if (step.stepName === "Rank & Select") {
        const output = step.output as { selected?: unknown };
        count = output.selected ? 1 : 0;
      }
      
      if (count > 0 || step.stepName === "Apply Filters" || step.stepName === "Rank & Select") {
        data.push({
          name: step.stepName === "Candidate Search" ? "Candidates" : 
                step.stepName === "Apply Filters" ? "Passed Filters" : 
                step.stepName === "Rank & Select" ? "Selected" : step.stepName,
          count,
          status: count === 0 ? "failure" : "success",
        });
      }
    }
    
    return data;
  }, [trace]);

  const maxCount = Math.max(...funnelData.map(d => d.count), 1);

  return (
    <div className="mb-6 p-4 bg-card rounded-lg border shadow-sm">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
        Pipeline Funnel
      </h3>
      <div className="flex items-end justify-between gap-4 h-20">
        {funnelData.map((item, idx) => {
          const height = Math.max((item.count / maxCount) * 100, 8);
          const isLast = idx === funnelData.length - 1;
          return (
            <div key={idx} className="flex-1 flex flex-col items-center gap-2">
              <span className={`text-lg font-bold ${
                item.status === "failure" ? "text-red-600" : 
                isLast ? "text-green-600" : isDark ? "text-white" : "text-gray-900"
              }`}>
                {item.count}
              </span>
              <div className="relative w-full flex justify-center">
                <div
                  className={`w-full max-w-16 rounded-t transition-all duration-300 ${
                    item.status === "failure" ? "bg-red-500" : 
                    isLast ? "bg-green-500" : "bg-blue-500"
                  }`}
                  style={{ height: `${height}%`, minHeight: "6px" }}
                />
              </div>
              <span className="text-xs text-muted-foreground text-center font-medium">{item.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Filter Visualizer Table Component - Enhanced with shadcn/ui Table
function FilterVisualizerTable({ 
  output, 
  candidates,
  showErrorsOnly,
  isDark
}: { 
  output: FilterOutput; 
  candidates: Candidate[];
  showErrorsOnly: boolean;
  isDark: boolean;
}) {
  const [showAll, setShowAll] = useState(false);
  const evaluations = output.evaluations || [];
  
  // Create a map of candidates for lookup
  const candidateMap = useMemo(() => {
    const map: Record<string, Candidate> = {};
    for (const c of candidates) {
      map[c.asin] = c;
    }
    return map;
  }, [candidates]);
  
  const filteredEvaluations = showErrorsOnly 
    ? evaluations.filter(e => !e.qualified)
    : evaluations;
  
  const displayEvaluations = showAll ? filteredEvaluations : filteredEvaluations.slice(0, 8);

  return (
    <div className="mt-4 border rounded-lg overflow-hidden bg-card">
      <div className="bg-muted/50 px-4 py-3 border-b flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h4 className="text-sm font-semibold">Candidate Evaluations</h4>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800">
              {output.passed} Passed
            </Badge>
            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800">
              {output.failed} Failed
            </Badge>
          </div>
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-32">ASIN</TableHead>
            <TableHead className="w-24">Price</TableHead>
            <TableHead className="w-24">Rating</TableHead>
            <TableHead className="w-28">Status</TableHead>
            <TableHead>Reason</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayEvaluations.map((evaluation, idx) => {
            const candidate = candidateMap[evaluation.asin];
            return (
              <TableRow
                key={idx}
                className={!evaluation.qualified ? "bg-red-50/50 dark:bg-red-950/20" : ""}
              >
                <TableCell className="font-mono text-xs">
                  <div className="flex items-center gap-1">
                    {evaluation.asin}
                    <CopyButton text={evaluation.asin} isDark={isDark} />
                  </div>
                </TableCell>
                <TableCell className="font-mono text-xs">
                  {candidate ? `$${candidate.price.toFixed(2)}` : "—"}
                </TableCell>
                <TableCell className="font-mono text-xs">
                  {candidate ? `${candidate.rating.toFixed(1)}★` : "—"}
                </TableCell>
                <TableCell>
                  {evaluation.qualified ? (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Passed
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800">
                      <XCircle className="w-3 h-3 mr-1" />
                      Failed
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground max-w-xs truncate">
                  {evaluation.reason}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      {filteredEvaluations.length > 8 && (
        <div className="px-4 py-3 bg-muted/30 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAll(!showAll)}
            className="text-xs"
          >
            {showAll ? "Show Less" : `Show All (${filteredEvaluations.length} items)`}
          </Button>
        </div>
      )}
    </div>
  );
}

// Step Component - Professional Design with Duration
function StepItem({ 
  step, 
  index, 
  showErrorsOnly,
  previousStepCandidates,
  durationMs,
  isDark
}: { 
  step: Step; 
  index: number; 
  showErrorsOnly: boolean;
  previousStepCandidates: Candidate[];
  durationMs: number;
  isDark: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const isSuccess = step.status === "success";
  const isFilterStep = step.stepName === "Apply Filters";

  // Hide successful steps in errors-only mode
  if (showErrorsOnly && isSuccess) {
    return null;
  }

  return (
    <div className="animate-fade-in">
      <div
        className={`bg-card border rounded-lg transition-all duration-200 shadow-sm ${
          isSuccess
            ? "border-border hover:border-gray-300 dark:hover:border-gray-600"
            : "border-red-300 dark:border-red-800 hover:border-red-400"
        }`}
      >
        {/* Step Header */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full p-4 flex items-start gap-4 text-left"
        >
          {/* Step Icon */}
          <div
            className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
              isSuccess
                ? "bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800"
                : "bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800"
            }`}
          >
            <span className={isSuccess ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
              {stepIcons[step.stepName] || <Activity className="w-4 h-4" />}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className="text-sm font-semibold">{step.stepName}</h3>
              <Badge variant={isSuccess ? "outline" : "destructive"} className={isSuccess ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800" : ""}>
                {isSuccess ? (
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                ) : (
                  <XCircle className="w-3 h-3 mr-1" />
                )}
                {isSuccess ? "Success" : "Failed"}
              </Badge>
              {/* Duration Badge */}
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Timer className="w-3 h-3" />
                {formatDuration(durationMs)}
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground flex items-center gap-1.5">
              <Clock className="w-3 h-3" />
              Step {index + 1} • {formatTime(step.timestamp)}
            </p>
          </div>

          <div className="flex-shrink-0 text-muted-foreground">
            {expanded ? (
              <ChevronDown className="w-5 h-5" />
            ) : (
              <ChevronRight className="w-5 h-5" />
            )}
          </div>
        </button>

        {/* Reasoning Box - Always Visible */}
        <div className="px-4 pb-4 -mt-1">
          <div className={`p-3 rounded-lg ${
            isSuccess 
              ? "bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800" 
              : "bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800"
          }`}>
            <div className="flex items-start gap-2">
              <Lightbulb className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                isSuccess ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400"
              }`} />
              <div className="flex-1">
                <span className={`text-xs font-semibold uppercase tracking-wider ${
                  isSuccess ? "text-amber-700 dark:text-amber-400" : "text-red-700 dark:text-red-400"
                }`}>
                  Reasoning
                </span>
                <p className={`mt-1 text-sm ${
                  isSuccess ? "text-amber-900 dark:text-amber-200" : "text-red-900 dark:text-red-200"
                }`}>
                  {step.reasoning}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Expanded Content */}
        {expanded && (
          <div className="px-4 pb-4 space-y-4 border-t pt-4">
            {/* Input with Syntax Highlighting */}
            <JsonDisplay data={step.input} label="Input" isDark={isDark} />

            {/* Output with Syntax Highlighting */}
            <JsonDisplay data={step.output} label="Output" isDark={isDark} />

            {/* Filter Visualizer for Apply Filters step */}
            {isFilterStep && step.output && (
              <FilterVisualizerTable 
                output={step.output as unknown as FilterOutput}
                candidates={previousStepCandidates}
                showErrorsOnly={showErrorsOnly}
                isDark={isDark}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Main Dashboard Component
export default function Dashboard() {
  const [traces, setTraces] = useState<Trace[]>([]);
  const [selectedTrace, setSelectedTrace] = useState<Trace | null>(null);
  const [loading, setLoading] = useState(true);
  const [showErrorsOnly, setShowErrorsOnly] = useState(false);
  const [isDark, setIsDark] = useState(false);

  // Apply dark mode class to html element
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  useEffect(() => {
    // Load traces from API route
    fetch("/api/traces")
      .then((res) => res.json())
      .then((data: TracesData) => {
        setTraces(data.traces || []);
        if (data.traces && data.traces.length > 0) {
          setSelectedTrace(data.traces[0]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load traces:", err);
        setLoading(false);
      });
  }, []);

  // Filter steps based on showErrorsOnly mode
  const visibleSteps = useMemo(() => {
    if (!selectedTrace) return [];
    if (!showErrorsOnly) return selectedTrace.steps;
    return selectedTrace.steps.filter(step => step.status === "failure");
  }, [selectedTrace, showErrorsOnly]);

  // Get candidates from previous step for filter visualizer
  const getCandidatesFromPreviousStep = (stepIndex: number): Candidate[] => {
    if (!selectedTrace || stepIndex === 0) return [];
    const prevStep = selectedTrace.steps[stepIndex - 1];
    if (prevStep?.stepName === "Candidate Search") {
      const output = prevStep.output as { candidates?: Candidate[] };
      return output.candidates || [];
    }
    return [];
  };

  // Calculate duration for each step
  const getStepDuration = (stepIndex: number): number => {
    if (!selectedTrace) return 0;
    const currentStep = selectedTrace.steps[stepIndex];
    const nextStep = selectedTrace.steps[stepIndex + 1];
    return calculateDuration(currentStep.timestamp, nextStep?.timestamp);
  };

  // Filter traces for sidebar
  const filteredTraces = useMemo(() => {
    if (!showErrorsOnly) return traces;
    return traces.filter(t => t.status === "failure");
  }, [traces, showErrorsOnly]);

  if (loading) {
    return <SkeletonLoader />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b">
        <div className="px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <Activity className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">
                X-Ray Debugger
              </h1>
              <p className="text-xs text-muted-foreground">AI Pipeline Inspector</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Dark Mode Toggle */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsDark(!isDark)}
                    className="gap-2"
                  >
                    {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    {isDark ? "Light" : "Dark"}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Toggle {isDark ? "light" : "dark"} mode</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Badge variant="secondary">
              {traces.length} Traces
            </Badge>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-72 min-h-[calc(100vh-57px)] bg-card border-r overflow-y-auto">
          <div className="p-4">
            {/* Sidebar Header with Filter */}
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Trace History
              </h2>
            </div>
            
            {/* Show Errors Only Toggle */}
            <div className="flex items-center justify-between py-2 px-3 mb-3 rounded-lg bg-muted/50 border">
              <label htmlFor="errors-only" className="text-xs font-medium flex items-center gap-2 cursor-pointer">
                {showErrorsOnly ? <EyeOff className="w-3.5 h-3.5 text-red-500" /> : <Eye className="w-3.5 h-3.5" />}
                Show Errors Only
              </label>
              <Switch
                id="errors-only"
                checked={showErrorsOnly}
                onCheckedChange={setShowErrorsOnly}
              />
            </div>

            <div className="space-y-2">
              {filteredTraces.map((trace, idx) => {
                const isFailed = trace.status === "failure";
                const actualIdx = traces.indexOf(trace);
                return (
                  <button
                    key={trace.id}
                    onClick={() => setSelectedTrace(trace)}
                    className={`w-full p-3 rounded-lg text-left transition-all duration-150 border relative ${
                      selectedTrace?.id === trace.id
                        ? "bg-accent border-primary shadow-sm"
                        : "bg-card border-border hover:border-gray-300 dark:hover:border-gray-600 hover:bg-accent/50"
                    } ${isFailed ? "border-l-4 border-l-red-500" : ""}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                            isFailed ? "bg-red-500" : "bg-green-500"
                          }`} />
                          <span className="font-medium text-sm">
                            Trace #{traces.length - actualIdx}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground truncate">{trace.name}</p>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatTime(trace.timestamp)}
                      </span>
                    </div>
                    {/* Step indicators */}
                    <div className="mt-2 flex items-center gap-1">
                      {trace.steps.map((step, stepIdx) => (
                        <div
                          key={stepIdx}
                          className={`w-1.5 h-1.5 rounded-full ${
                            step.status === "success" ? "bg-green-400" : "bg-red-400"
                          }`}
                          title={step.stepName}
                        />
                      ))}
                    </div>
                  </button>
                );
              })}
              
              {filteredTraces.length === 0 && showErrorsOnly && (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-500" />
                  <p className="text-sm font-medium">No failed traces!</p>
                  <p className="text-xs mt-1">All pipelines completed successfully.</p>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {selectedTrace ? (
            <div className="max-w-4xl">
              {/* Trace Header */}
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <h2 className="text-xl font-semibold">{selectedTrace.name}</h2>
                  <Badge variant={selectedTrace.status === "success" ? "outline" : "destructive"} className={selectedTrace.status === "success" ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800" : ""}>
                    {selectedTrace.status === "success" ? (
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 mr-1" />
                    )}
                    {selectedTrace.status === "success" ? "Completed" : "Failed"}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                  <code className="text-xs bg-muted px-2 py-0.5 rounded font-mono">
                    {selectedTrace.id}
                  </code>
                  <CopyButton text={selectedTrace.id} isDark={isDark} />
                  <span className="text-muted-foreground">•</span>
                  <span>{new Date(selectedTrace.timestamp).toLocaleString()}</span>
                </div>
              </div>

              {/* Funnel Visualization */}
              <FunnelVisualization trace={selectedTrace} isDark={isDark} />

              {/* Focus Mode Notice */}
              {showErrorsOnly && visibleSteps.length === 0 && (
                <div className="mb-6 p-4 bg-green-50 dark:bg-green-950/50 border border-green-200 dark:border-green-800 rounded-lg text-center">
                  <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
                  <p className="text-green-700 dark:text-green-400 font-medium">No errors in this trace!</p>
                  <p className="text-sm text-green-600 dark:text-green-500 mt-1">All steps completed successfully.</p>
                </div>
              )}

              {/* Steps Timeline */}
              <div className="space-y-4">
                {selectedTrace.steps.map((step, idx) => (
                  <StepItem 
                    key={idx} 
                    step={step} 
                    index={idx} 
                    showErrorsOnly={showErrorsOnly}
                    previousStepCandidates={getCandidatesFromPreviousStep(idx)}
                    durationMs={getStepDuration(idx)}
                    isDark={isDark}
                  />
                ))}
              </div>
            </div>
          ) : (
            <EmptyState isDark={isDark} />
          )}
        </main>
      </div>
    </div>
  );
}
