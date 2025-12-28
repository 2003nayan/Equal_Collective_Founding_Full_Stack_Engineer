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
  AlertCircle,
  Copy,
  Check,
  Eye,
  EyeOff,
} from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

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
  "Keyword Generation": <Zap className="w-5 h-5" />,
  "Candidate Search": <Search className="w-5 h-5" />,
  "Apply Filters": <Filter className="w-5 h-5" />,
  "Rank & Select": <Trophy className="w-5 h-5" />,
};

// Time ago helper
function timeAgo(timestamp: string): string {
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? "s" : ""} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
}

// Copy to Clipboard Button
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="absolute top-2 right-2 p-1.5 rounded-md bg-slate-700/50 hover:bg-slate-600/50 transition-colors"
      title="Copy to clipboard"
    >
      {copied ? (
        <Check className="w-4 h-4 text-emerald-400" />
      ) : (
        <Copy className="w-4 h-4 text-slate-400" />
      )}
    </button>
  );
}

// JSON Display with Syntax Highlighting
function JsonDisplay({ data, label }: { data: unknown; label: string }) {
  const jsonString = JSON.stringify(data, null, 2);

  return (
    <div className="relative">
      <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
        {label}
      </h4>
      <div className="relative rounded-lg overflow-hidden border border-slate-700">
        <CopyButton text={jsonString} />
        <SyntaxHighlighter
          language="json"
          style={oneDark}
          customStyle={{
            margin: 0,
            padding: "1rem",
            backgroundColor: "#0f172a",
            fontSize: "0.75rem",
            maxHeight: "16rem",
            overflow: "auto",
          }}
        >
          {jsonString}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}

// Reasoning Badge Parser - Extracts keywords and creates colored badges
function ReasoningBadges({ reasoning }: { reasoning: string }) {
  const badges = useMemo(() => {
    const badgePatterns = [
      { pattern: /failed/i, color: "bg-red-500/20 text-red-400 border-red-500/30", label: "Failed" },
      { pattern: /passed/i, color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30", label: "Passed" },
      { pattern: /price.*(\$[\d.]+)/i, color: "bg-blue-500/20 text-blue-400 border-blue-500/30", extract: true },
      { pattern: /rating.*([0-9.]+)/i, color: "bg-amber-500/20 text-amber-400 border-amber-500/30", extract: true },
      { pattern: /(\d+)\s*candidates?/i, color: "bg-purple-500/20 text-purple-400 border-purple-500/30", extract: true },
      { pattern: /selected/i, color: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30", label: "Selected" },
      { pattern: /eliminated/i, color: "bg-orange-500/20 text-orange-400 border-orange-500/30", label: "Eliminated" },
    ];

    const extracted: Array<{ label: string; color: string }> = [];
    
    for (const { pattern, color, label, extract } of badgePatterns) {
      const match = reasoning.match(pattern);
      if (match) {
        if (extract && match[1]) {
          extracted.push({ label: match[0], color });
        } else if (label) {
          extracted.push({ label, color });
        }
      }
    }
    
    return extracted.slice(0, 4); // Limit to 4 badges
  }, [reasoning]);

  if (badges.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {badges.map((badge, idx) => (
        <span
          key={idx}
          className={`px-2 py-0.5 rounded-full text-xs font-medium border ${badge.color}`}
        >
          {badge.label}
        </span>
      ))}
    </div>
  );
}

// Funnel Visualization Component
function FunnelVisualization({ trace }: { trace: Trace }) {
  const funnelData = useMemo(() => {
    const data: Array<{ name: string; count: number; color: string }> = [];
    
    for (const step of trace.steps) {
      let count = 0;
      
      if (step.stepName === "Candidate Search") {
        const output = step.output as { candidates?: unknown[] };
        count = output.candidates?.length || 0;
      } else if (step.stepName === "Apply Filters") {
        const output = step.output as FilterOutput;
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
          color: count === 0 ? "bg-red-500" : 
                 step.stepName === "Rank & Select" ? "bg-emerald-500" : "bg-cyan-500",
        });
      }
    }
    
    return data;
  }, [trace]);

  const maxCount = Math.max(...funnelData.map(d => d.count), 1);

  return (
    <div className="mb-8 p-4 bg-slate-800/30 rounded-xl border border-slate-700">
      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
        Pipeline Funnel
      </h3>
      <div className="flex items-end justify-between gap-2 h-24">
        {funnelData.map((item, idx) => {
          const height = Math.max((item.count / maxCount) * 100, 5);
          return (
            <div key={idx} className="flex-1 flex flex-col items-center gap-2">
              <div className="relative w-full flex justify-center">
                <div
                  className={`w-full max-w-20 ${item.color} rounded-t-lg transition-all duration-500`}
                  style={{ height: `${height}%`, minHeight: "4px" }}
                />
                <span className="absolute -top-6 text-lg font-bold text-white">
                  {item.count}
                </span>
              </div>
              <span className="text-xs text-slate-400 text-center">{item.name}</span>
            </div>
          );
        })}
      </div>
      {/* Funnel arrow indicators */}
      <div className="flex items-center justify-center gap-4 mt-4">
        {funnelData.map((_, idx) => (
          idx < funnelData.length - 1 && (
            <div key={idx} className="flex items-center">
              <span className="text-slate-600">→</span>
            </div>
          )
        ))}
      </div>
    </div>
  );
}

// Filter Visualizer Table Component
function FilterVisualizerTable({ output, showErrorsOnly }: { output: FilterOutput; showErrorsOnly: boolean }) {
  const [showAll, setShowAll] = useState(false);
  const evaluations = output.evaluations || [];
  
  const filteredEvaluations = showErrorsOnly 
    ? evaluations.filter(e => !e.qualified)
    : evaluations;
  
  const displayEvaluations = showAll ? filteredEvaluations : filteredEvaluations.slice(0, 10);

  return (
    <div className="mt-4 border border-slate-700 rounded-lg overflow-hidden">
      <div className="bg-slate-800/50 px-4 py-3 border-b border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h4 className="text-sm font-semibold text-white">Candidate Evaluations</h4>
          <div className="flex items-center gap-2 text-xs">
            <span className="px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              {output.passed} Passed
            </span>
            <span className="px-2 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
              {output.failed} Failed
            </span>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-800/30">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                ASIN
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                Reason
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {displayEvaluations.map((evaluation, idx) => (
              <tr
                key={idx}
                className={`${
                  evaluation.qualified ? "bg-emerald-500/5" : "bg-red-500/5"
                } hover:bg-slate-800/30 transition-colors`}
              >
                <td className="px-4 py-3 text-slate-300 font-mono text-xs">
                  {evaluation.asin}
                </td>
                <td className="px-4 py-3">
                  {evaluation.qualified ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Passed
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30">
                      <XCircle className="w-3.5 h-3.5" />
                      Failed
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-slate-400 text-xs max-w-md">
                  {evaluation.reason}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {filteredEvaluations.length > 10 && (
        <div className="px-4 py-3 bg-slate-800/30 border-t border-slate-700">
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            {showAll ? "Show Less" : `Show All (${filteredEvaluations.length} items)`}
          </button>
        </div>
      )}
    </div>
  );
}

// Step Component
function StepItem({ step, index, showErrorsOnly }: { step: Step; index: number; showErrorsOnly: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const isSuccess = step.status === "success";
  const isFilterStep = step.stepName === "Apply Filters";

  // Hide successful steps in errors-only mode
  if (showErrorsOnly && isSuccess) {
    return null;
  }

  return (
    <div className="relative animate-fade-in">
      {/* Timeline connector */}
      <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-gradient-to-b from-slate-600 to-transparent" />

      <div
        className={`relative border rounded-xl transition-all duration-300 ${
          expanded ? "bg-slate-800/50" : "bg-slate-900/50 hover:bg-slate-800/30"
        } ${
          isSuccess
            ? "border-slate-700 hover:border-slate-600"
            : "border-red-500/30 hover:border-red-500/50"
        }`}
      >
        {/* Step Header */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full p-4 flex items-start gap-4 text-left"
        >
          {/* Step number badge */}
          <div
            className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${
              isSuccess
                ? "bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30"
                : "bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-500/30"
            }`}
          >
            <span className={`${isSuccess ? "text-emerald-400" : "text-red-400"}`}>
              {stepIcons[step.stepName] || <Activity className="w-5 h-5" />}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <h3 className="text-base font-semibold text-white">{step.stepName}</h3>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                  isSuccess
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-red-500/20 text-red-400"
                }`}
              >
                {isSuccess ? (
                  <CheckCircle2 className="w-3 h-3" />
                ) : (
                  <XCircle className="w-3 h-3" />
                )}
                {isSuccess ? "Success" : "Failed"}
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-400 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5" />
              Step {index + 1}
            </p>
          </div>

          <div className="flex-shrink-0 text-slate-400">
            {expanded ? (
              <ChevronDown className="w-5 h-5" />
            ) : (
              <ChevronRight className="w-5 h-5" />
            )}
          </div>
        </button>

        {/* Reasoning Box with Badges */}
        <div className="px-4 pb-4 -mt-2">
          <div
            className={`p-3 rounded-lg border ${
              isSuccess
                ? "bg-amber-500/10 border-amber-500/30"
                : "bg-blue-500/10 border-blue-500/30"
            }`}
          >
            <div className="flex items-start gap-2">
              <AlertCircle
                className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                  isSuccess ? "text-amber-400" : "text-blue-400"
                }`}
              />
              <div className="flex-1">
                <span
                  className={`text-xs font-semibold uppercase tracking-wider ${
                    isSuccess ? "text-amber-400" : "text-blue-400"
                  }`}
                >
                  Reasoning
                </span>
                <p className={`mt-1 text-sm ${isSuccess ? "text-amber-100" : "text-blue-100"}`}>
                  {step.reasoning}
                </p>
                <ReasoningBadges reasoning={step.reasoning} />
              </div>
            </div>
          </div>
        </div>

        {/* Expanded Content */}
        {expanded && (
          <div className="px-4 pb-4 space-y-4 border-t border-slate-700/50">
            {/* Input with Syntax Highlighting */}
            <div className="pt-4">
              <JsonDisplay data={step.input} label="Input" />
            </div>

            {/* Output with Syntax Highlighting */}
            <div>
              <JsonDisplay data={step.output} label="Output" />
            </div>

            {/* Filter Visualizer for Apply Filters step */}
            {isFilterStep && step.output && (
              <FilterVisualizerTable 
                output={step.output as unknown as FilterOutput} 
                showErrorsOnly={showErrorsOnly}
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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400">Loading traces...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                X-Ray Debugger
              </h1>
              <p className="text-xs text-slate-400">AI Pipeline Inspector</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Focus Mode Toggle */}
            <button
              onClick={() => setShowErrorsOnly(!showErrorsOnly)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${
                showErrorsOnly
                  ? "bg-red-500/20 border-red-500/50 text-red-400"
                  : "bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600"
              }`}
            >
              {showErrorsOnly ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
              <span className="text-sm font-medium">
                {showErrorsOnly ? "Errors Only" : "Show All"}
              </span>
            </button>
            <span className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-sm text-slate-400">
              {traces.length} Traces
            </span>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-80 min-h-[calc(100vh-73px)] bg-slate-900/50 border-r border-slate-800 overflow-y-auto">
          <div className="p-4">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Historical Traces
            </h2>
            <div className="space-y-2">
              {traces.map((trace, idx) => (
                <button
                  key={trace.id}
                  onClick={() => setSelectedTrace(trace)}
                  className={`w-full p-3 rounded-xl text-left transition-all duration-200 ${
                    selectedTrace?.id === trace.id
                      ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30"
                      : "bg-slate-800/50 border border-slate-700/50 hover:border-slate-600"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {trace.status === "success" ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                        )}
                        <span className="font-medium text-white truncate text-sm">
                          Run #{traces.length - idx}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-400 truncate">{trace.name}</p>
                    </div>
                    <span className="text-xs text-slate-500 whitespace-nowrap">
                      {timeAgo(trace.timestamp)}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-1.5">
                    {trace.steps.map((step, stepIdx) => (
                      <div
                        key={stepIdx}
                        className={`w-2 h-2 rounded-full ${
                          step.status === "success" ? "bg-emerald-500" : "bg-red-500"
                        }`}
                        title={step.stepName}
                      />
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {selectedTrace ? (
            <div className="max-w-4xl mx-auto">
              {/* Trace Header */}
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold text-white">{selectedTrace.name}</h2>
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${
                      selectedTrace.status === "success"
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-red-500/20 text-red-400 border border-red-500/30"
                    }`}
                  >
                    {selectedTrace.status === "success" ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <XCircle className="w-4 h-4" />
                    )}
                    {selectedTrace.status === "success" ? "Completed" : "Failed"}
                  </span>
                </div>
                <p className="text-sm text-slate-400">
                  Trace ID: {selectedTrace.id} • Started{" "}
                  {new Date(selectedTrace.timestamp).toLocaleString()}
                </p>
              </div>

              {/* Funnel Visualization */}
              <FunnelVisualization trace={selectedTrace} />

              {/* Focus Mode Notice */}
              {showErrorsOnly && visibleSteps.length === 0 && (
                <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                  <p className="text-emerald-400 font-medium">No errors in this trace!</p>
                  <p className="text-sm text-slate-400 mt-1">All steps completed successfully.</p>
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
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400">
              <Activity className="w-16 h-16 mb-4 opacity-50" />
              <p className="text-lg">Select a trace to view details</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
