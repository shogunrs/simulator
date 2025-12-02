import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, RotateCcw, Server } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

type ViewMode = "simulation" | "results";

interface SimulationState {
  time: number;
  workload: number;
  instances: number;
  latency: number;
  p95Latency: number;
  infraCost: number;
  slaViolations: number;
  scalingActions: number;
  awsInstances: number;
  gcpInstances: number;
  awsUtilization: number;
  gcpUtilization: number;
  providerCost: {
    aws: number;
    gcp: number;
  };
}

const SIMULATION_DURATION = 30; // 60 seconds = 1 minute
const UPDATE_INTERVAL = 100; // Update every 100ms
const TOTAL_STEPS = (SIMULATION_DURATION * 1000) / UPDATE_INTERVAL;
const SLA_THRESHOLD = 200; // 200ms p95 latency SLA (from report)
const SIMULATION_WINDOW_HOURS = 6; // 6-hour window based on the report scenario
const AWS_COST_PER_INSTANCE = 0.096; // $0.096/hour for AWS m5.large
const GCP_COST_PER_INSTANCE = 0.089; // $0.089/hour for GCP n1-standard-2
const SLA_PENALTY_PER_VIOLATION = 0.1;
const RESEARCH_BENCHMARKS = [
  {
    label: "SLA violation rate",
    threshold: "8.7%",
    rl: "2.1%",
    insight: "PPO cut violations by 75.6% (report Table 1).",
  },
  {
    label: "Average cost ($/h)",
    threshold: "$2.85",
    rl: "$4.25",
    insight: "+49.1% cost to deliver premium latency.",
  },
  {
    label: "Scaling actions (run)",
    threshold: "342",
    rl: "156",
    insight: "-54.4% oscillations => more operational stability.",
  },
];

// Simulated workload pattern (6AM-12PM) as described in the report
const getWorkload = (step: number): number => {
  const progress = step / TOTAL_STEPS;
  const hour = 6 + progress * 6; // 6AM to 12PM

  if (hour < 7.5) return 150 + Math.random() * 30;
  if (hour < 8.5) return 300 + (hour - 7.5) * 300 + Math.random() * 50;
  if (hour < 10.5) return 700 + Math.random() * 100;
  return 500 - (hour - 10.5) * 100 + Math.random() * 50;
};

// Calculate latency based on utilization (from report lines 424-437)
const calculateLatency = (
  requestRate: number,
  instances: number
): { avg: number; p95: number } => {
  const capacity = instances * 50; // 50 req/s per instance (from report line 419)
  const utilization = requestRate / capacity;

  const baseLatency = 20; // ms (from report line 425)

  if (utilization < 0.7) {
    return {
      avg: baseLatency + Math.random() * 5,
      p95: baseLatency * 1.5 + Math.random() * 10,
    };
  } else if (utilization < 0.85) {
    return {
      avg: baseLatency * 2 + Math.random() * 10,
      p95: baseLatency * 4 + Math.random() * 20,
    };
  } else {
    // Exponential increase when overloaded (from report lines 434-435)
    const factor = 1 / Math.max(1 - utilization, 0.01); // Prevent division by zero
    return {
      avg: baseLatency * factor + Math.random() * 20,
      p95: baseLatency * factor * 2 + Math.random() * 40,
    };
  }
};

const accumulateProviderCost = (
  prevCost: SimulationState["providerCost"],
  awsInstances: number,
  gcpInstances: number
) => {
  const timePerStep = SIMULATION_WINDOW_HOURS / TOTAL_STEPS;
  const aws = prevCost.aws + awsInstances * AWS_COST_PER_INSTANCE * timePerStep;
  const gcp = prevCost.gcp + gcpInstances * GCP_COST_PER_INSTANCE * timePerStep;
  return { aws, gcp };
};

const deriveProviderUtilization = (
  workload: number,
  awsInstances: number,
  gcpInstances: number
) => {
  const totalInstances = Math.max(awsInstances + gcpInstances, 1);
  const totalCapacity = totalInstances * 50;
  const baseUtilization = Math.min(workload / totalCapacity, 0.99);
  const awsShare = awsInstances / totalInstances;
  const gcpShare = gcpInstances / totalInstances;
  const bias = (awsShare - gcpShare) * 0.1;

  return {
    baseUtilization,
    totalInstances,
    aws: Math.max(0.05, Math.min(0.99, baseUtilization + bias)),
    gcp: Math.max(0.05, Math.min(0.99, baseUtilization - bias)),
  };
};

// Threshold-based scaling logic (reactive)
const thresholdScaling = (
  prevState: SimulationState,
  workload: number,
  step: number
): SimulationState => {
  const progress = step / TOTAL_STEPS;
  const hour = 6 + progress * 6;

  let awsInstances = prevState.awsInstances;
  let gcpInstances = prevState.gcpInstances;
  let scalingAction = 0;

  const totalInstances = Math.max(awsInstances + gcpInstances, 1);
  const capacity = totalInstances * 50;
  const utilization = workload / capacity;
  const cpuUtil = utilization * 100;

  if (cpuUtil > 70 && totalInstances < 30 && step % 15 === 0) {
    if (awsInstances <= gcpInstances) {
      awsInstances += 1;
    } else {
      gcpInstances += 1;
    }
    scalingAction = 1;
  } else if (
    cpuUtil < 20 &&
    totalInstances > 4 &&
    hour > 11 &&
    step % 20 === 0
  ) {
    if (gcpInstances > awsInstances && gcpInstances > 2) {
      gcpInstances -= 1;
    } else if (awsInstances > 2) {
      awsInstances -= 1;
    }
    scalingAction = 1;
  }

  const newInstances = awsInstances + gcpInstances;
  const { avg, p95 } = calculateLatency(workload, newInstances);
  const providerCost = accumulateProviderCost(
    prevState.providerCost,
    awsInstances,
    gcpInstances
  );
  const infraCost = providerCost.aws + providerCost.gcp;
  const { aws, gcp } = deriveProviderUtilization(
    workload,
    awsInstances,
    gcpInstances
  );
  const slaViolation = p95 > SLA_THRESHOLD ? 1 : 0;

  return {
    ...prevState,
    time: prevState.time + 1,
    workload,
    instances: newInstances,
    awsInstances,
    gcpInstances,
    latency: avg,
    p95Latency: p95,
    infraCost,
    providerCost,
    awsUtilization: aws * 100,
    gcpUtilization: gcp * 100,
    slaViolations: prevState.slaViolations + slaViolation,
    scalingActions: prevState.scalingActions + scalingAction,
  };
};

const determineRlTargets = (hour: number) => {
  if (hour >= 7 && hour < 7.5) return { aws: 8, gcp: 6 };
  if (hour >= 7.5 && hour < 8.5) return { aws: 12, gcp: 8 };
  if (hour >= 8.5 && hour < 11) return { aws: 14, gcp: 10 };
  if (hour >= 11 && hour < 11.5) return { aws: 10, gcp: 8 };
  if (hour >= 11.5) return { aws: 6, gcp: 5 };
  return { aws: 5, gcp: 5 };
};

// RL-based scaling logic (proactive with PPO-inspired targets)
const rlScaling = (
  prevState: SimulationState,
  workload: number,
  step: number
): SimulationState => {
  const progress = step / TOTAL_STEPS;
  const hour = 6 + progress * 6;
  const targets = determineRlTargets(hour);

  let awsInstances = prevState.awsInstances;
  let gcpInstances = prevState.gcpInstances;
  let scalingAction = 0;

  if (targets.aws > awsInstances) {
    const delta = Math.min(2, targets.aws - awsInstances);
    awsInstances += delta;
    scalingAction += delta;
  } else if (targets.aws < awsInstances) {
    awsInstances = Math.max(targets.aws, awsInstances - 1);
    scalingAction += 1;
  }

  if (targets.gcp > gcpInstances) {
    const delta = Math.min(2, targets.gcp - gcpInstances);
    gcpInstances += delta;
    scalingAction += delta;
  } else if (targets.gcp < gcpInstances) {
    gcpInstances = Math.max(targets.gcp, gcpInstances - 1);
    scalingAction += 1;
  }

  const newInstances = awsInstances + gcpInstances;
  const { avg, p95 } = calculateLatency(workload, newInstances);
  const providerCost = accumulateProviderCost(
    prevState.providerCost,
    awsInstances,
    gcpInstances
  );
  const infraCost = providerCost.aws + providerCost.gcp;
  const { aws, gcp } = deriveProviderUtilization(
    workload,
    awsInstances,
    gcpInstances
  );
  const slaViolation = p95 > SLA_THRESHOLD ? 1 : 0;

  return {
    ...prevState,
    time: prevState.time + 1,
    workload,
    instances: newInstances,
    awsInstances,
    gcpInstances,
    latency: avg,
    p95Latency: p95,
    infraCost,
    providerCost,
    awsUtilization: aws * 100,
    gcpUtilization: gcp * 100,
    slaViolations: prevState.slaViolations + slaViolation,
    scalingActions: prevState.scalingActions + scalingAction,
  };
};

const createInitialState = (
  overrides?: Partial<SimulationState>
): SimulationState => {
  const base: SimulationState = {
    time: 0,
    workload: 100,
    instances: 10,
    latency: 20,
    p95Latency: 30,
    infraCost: 0,
    slaViolations: 0,
    scalingActions: 0,
    awsInstances: 5,
    gcpInstances: 5,
    awsUtilization: 35,
    gcpUtilization: 35,
    providerCost: { aws: 0, gcp: 0 },
  };
  const merged: SimulationState = { ...base, ...overrides };
  merged.instances = merged.awsInstances + merged.gcpInstances;
  return merged;
};

// Server visualization component
function ServerGrid({
  count,
  color,
  label,
}: {
  count: number;
  color: string;
  label?: string;
}) {
  return (
    <div>
      {label && (
        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase mb-1">
          {label}
        </p>
      )}
      <div className="flex flex-wrap gap-2 min-h-[96px]">
        <AnimatePresence>
          {Array.from({ length: count }).map((_, i) => (
            <motion.div
              key={`${label ?? "provider"}-${i}`}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex items-center justify-center w-11 h-11 rounded-lg shadow-sm ${color} relative overflow-hidden group`}
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <Server className="w-5 h-5 relative z-10" />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function ComparativeSimulator() {
  const [isRunning, setIsRunning] = useState(false);
  const [step, setStep] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>("simulation");
  const fromPresentation =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("fromPresentation")
      : null;

  const [thresholdState, setThresholdState] = useState<SimulationState>(() =>
    createInitialState()
  );

  const [rlState, setRlState] = useState<SimulationState>(() =>
    createInitialState({ awsInstances: 6, gcpInstances: 4 })
  );

  const [thresholdHistory, setThresholdHistory] = useState<SimulationState[]>(
    []
  );
  const [rlHistory, setRlHistory] = useState<SimulationState[]>([]);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleReset = useCallback(() => {
    setIsRunning(false);
    setStep(0);
    setThresholdState(createInitialState());
    setRlState(createInitialState({ awsInstances: 6, gcpInstances: 4 }));
    setThresholdHistory([]);
    setRlHistory([]);
  }, []);

  useEffect(() => {
    if (isRunning && step < TOTAL_STEPS) {
      intervalRef.current = setInterval(() => {
        const workload = getWorkload(step);

        setThresholdState((prev) => {
          const newState = thresholdScaling(prev, workload, step);
          setThresholdHistory((h) => [...h, newState]);
          return newState;
        });

        setRlState((prev) => {
          const newState = rlScaling(prev, workload, step);
          setRlHistory((h) => [...h, newState]);
          return newState;
        });

        setStep((s) => s + 1);
      }, UPDATE_INTERVAL);
    } else if (step >= TOTAL_STEPS) {
      setIsRunning(false);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, step]);

  const progress = (step / TOTAL_STEPS) * 100;
  const currentHour = 6 + (step / TOTAL_STEPS) * 6;
  const thresholdPenaltyCost =
    thresholdState.slaViolations * SLA_PENALTY_PER_VIOLATION;
  const rlPenaltyCost = rlState.slaViolations * SLA_PENALTY_PER_VIOLATION;
  const thresholdTotalCost = thresholdState.infraCost + thresholdPenaltyCost;
  const rlTotalCost = rlState.infraCost + rlPenaltyCost;
  const totalCostDelta = thresholdTotalCost - rlTotalCost;
  const rlIsCheaper = totalCostDelta > 0;

  // Calculate violation rates
  const thresholdViolationRate =
    step > 0 ? (thresholdState.slaViolations / step) * 100 : 0;
  const rlViolationRate = step > 0 ? (rlState.slaViolations / step) * 100 : 0;

  const timelineLength = Math.max(thresholdHistory.length, rlHistory.length);
  const createTimeLabel = (index: number, total: number) => {
    if (!total) {
      return "6:00";
    }
    const h = 6 + (index / total) * 6;
    return `${Math.floor(h)}:${String(Math.floor((h % 1) * 60)).padStart(2, "0")}`;
  };
  const timelineLabels =
    timelineLength > 0
      ? Array.from({ length: timelineLength }, (_, i) =>
        createTimeLabel(i, timelineLength)
      )
      : [];
  const buildSeries = (
    history: SimulationState[],
    selector: (s: SimulationState) => number
  ) => {
    if (!timelineLength) return [];
    if (!history.length) return Array(timelineLength).fill(0);
    const fallback = history[history.length - 1];
    return Array.from({ length: timelineLength }, (_, i) => {
      const point = history[i] ?? fallback;
      return selector(point);
    });
  };

  const latencyChartData = {
    labels: timelineLabels,
    datasets: [
      {
        label: "Threshold p95 latency",
        data: buildSeries(thresholdHistory, (s) => s.p95Latency),
        borderColor: "rgb(239, 68, 68)",
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        tension: 0.4,
        fill: true,
      },
      {
        label: "RL p95 latency",
        data: buildSeries(rlHistory, (s) => s.p95Latency),
        borderColor: "rgb(6, 182, 212)",
        backgroundColor: "rgba(6, 182, 212, 0.1)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const instancesChartData = {
    labels: timelineLabels,
    datasets: [
      {
        label: "Threshold instances",
        data: buildSeries(thresholdHistory, (s) => s.instances),
        borderColor: "rgb(239, 68, 68)",
        backgroundColor: "rgba(239, 68, 68, 0.2)",
        tension: 0.1,
        fill: true,
      },
      {
        label: "RL instances",
        data: buildSeries(rlHistory, (s) => s.instances),
        borderColor: "rgb(6, 182, 212)",
        backgroundColor: "rgba(6, 182, 212, 0.2)",
        tension: 0.1,
        fill: true,
      },
    ],
  };

  const workloadChartData = {
    labels: timelineLabels,
    datasets: [
      {
        label: "Simulated workload (req/s)",
        data: buildSeries(thresholdHistory, (s) => s.workload),
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.15)",
        tension: 0.35,
        fill: true,
      },
    ],
  };

  const violationsChartData = {
    labels: timelineLabels,
    datasets: [
      {
        label: "Threshold cumulative violations",
        data: buildSeries(thresholdHistory, (s) => s.slaViolations),
        borderColor: "rgb(248, 113, 113)",
        backgroundColor: "rgba(248, 113, 113, 0.15)",
        tension: 0.25,
        fill: true,
      },
      {
        label: "RL cumulative violations",
        data: buildSeries(rlHistory, (s) => s.slaViolations),
        borderColor: "rgb(6, 182, 212)",
        backgroundColor: "rgba(6, 182, 212, 0.15)",
        tension: 0.25,
        fill: true,
      },
    ],
  };

  const costChartData = {
    labels: timelineLabels,
    datasets: [
      {
        label: "Threshold blended cost ($)",
        data: buildSeries(
          thresholdHistory,
          (s) => s.infraCost + s.slaViolations * SLA_PENALTY_PER_VIOLATION
        ),
        borderColor: "rgb(248, 113, 113)",
        backgroundColor: "rgba(248, 113, 113, 0.1)",
        tension: 0.35,
        fill: true,
      },
      {
        label: "RL blended cost ($)",
        data: buildSeries(
          rlHistory,
          (s) => s.infraCost + s.slaViolations * SLA_PENALTY_PER_VIOLATION
        ),
        borderColor: "rgb(34, 211, 238)",
        backgroundColor: "rgba(34, 211, 238, 0.1)",
        tension: 0.35,
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: { color: "#e2e8f0" },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: "rgba(255, 255, 255, 0.1)" },
        ticks: { color: "#94a3b8" },
      },
      x: {
        grid: { color: "rgba(255, 255, 255, 0.1)" },
        ticks: { color: "#94a3b8" },
      },
    },
  };

  const viewTabs: { id: ViewMode; label: string }[] = [
    { id: "simulation", label: "Live Simulation" },
    { id: "results", label: "Results Dashboard" },
  ];

  return (
    <div className="app-shell w-full min-h-screen overflow-x-hidden bg-gradient-to-br from-background to-card px-4 py-6 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto mb-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl sm:text-4xl font-bold text-primary">
                Auto-Scaling Comparison: Threshold vs RL
              </h1>
              {isRunning && (
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
              )}
            </div>
            <p className="text-muted-foreground text-base sm:text-lg">
              Interactive 6h scenario (6AM → 12PM) using metrics from
              “Autonomous Cloud Resource Management”.
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              SLA p95 = 200ms • Costs: m5.large ($0.096/h) & n1-standard-2
              ($0.089/h) • Decision interval ≈ 30s.
            </p>
          </div>
          {fromPresentation && (
            <button
              onClick={() => {
                // @ts-ignore
                if (window.electron) {
                  // @ts-ignore
                  window.electron.navigate(fromPresentation + "#slide-10");
                } else {
                  try {
                    window.location.replace(fromPresentation + "#slide-10");
                  } catch (err) {
                    window.location.href = fromPresentation + "#slide-10";
                  }
                }
              }}
              className="rounded-md bg-secondary px-3 py-2 text-sm font-semibold text-secondary-foreground border border-border/60 shadow-sm hover:bg-secondary/90"
            >
              Back to presentation
            </button>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto mb-6 flex flex-wrap items-center gap-3">
        <div className="inline-flex rounded-lg border border-border/40 bg-card/40 p-1">
          {viewTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setViewMode(tab.id)}
              className={`rounded-md px-4 py-2 text-sm font-semibold transition 
                ${viewMode === tab.id ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <span className="text-xs text-muted-foreground">
          Split views keep the 1280×800 desktop experience scroll-free.
        </span>
      </div>

      {viewMode === "simulation" ? (
        <>
          <div className="max-w-7xl mx-auto mb-5 space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button
                onClick={() => setIsRunning(!isRunning)}
                disabled={step >= TOTAL_STEPS}
                size="lg"
                className="w-full sm:w-auto shadow-lg hover:shadow-primary/25 transition-all duration-300 hover:scale-105 active:scale-95"
              >
                {isRunning ? (
                  <Pause className="mr-2" />
                ) : (
                  <Play className="mr-2" />
                )}
                {isRunning ? "Pause" : "Start"}
              </Button>
              <Button
                onClick={handleReset}
                variant="outline"
                size="lg"
                className="w-full sm:w-auto"
              >
                <RotateCcw className="mr-2" />
                Reset
              </Button>
            </div>
            <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
              <div className="bg-muted rounded-full h-3 sm:h-4 overflow-hidden w-full">
                <motion.div
                  className="h-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-muted-foreground font-mono text-sm sm:text-base justify-self-end">
                {currentHour.toFixed(1)}h / 12.0h
              </span>
            </div>
          </div>

          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-card/30 backdrop-blur-md border border-red-500/30 p-6 rounded-xl shadow-lg hover:shadow-red-500/10 transition-shadow duration-300"
            >
              <h2 className="text-2xl font-bold text-red-400 mb-4 flex items-center gap-2">
                <span className="w-2 h-8 bg-red-500 rounded-full inline-block"></span>
                Threshold-Based (Reactive)
              </h2>
              <div className="mb-4">
                <p className="text-sm text-muted-foreground mb-2">
                  Active capacity per provider
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-md border border-red-500/20 bg-red-500/5 p-3">
                    <ServerGrid
                      count={thresholdState.awsInstances}
                      color="bg-red-500/20 text-red-400"
                      label="AWS"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      Estimated utilization:{" "}
                      {thresholdState.awsUtilization.toFixed(0)}%
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Accumulated cost: $
                      {thresholdState.providerCost.aws.toFixed(2)}
                    </p>
                  </div>
                  <div className="rounded-md border border-red-500/20 bg-red-500/5 p-3">
                    <ServerGrid
                      count={thresholdState.gcpInstances}
                      color="bg-red-500/10 text-red-300"
                      label="GCP"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      Estimated utilization:{" "}
                      {thresholdState.gcpUtilization.toFixed(0)}%
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Accumulated cost: $
                      {thresholdState.providerCost.gcp.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Total instances:
                  </span>
                  <span className="font-bold text-foreground">
                    {thresholdState.instances}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">p95 latency:</span>
                  <span
                    className={`font-bold ${thresholdState.p95Latency > SLA_THRESHOLD ? "text-red-400" : "text-foreground"}`}
                  >
                    {thresholdState.p95Latency.toFixed(0)}ms
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">SLA Violations:</span>
                  <span className="font-bold text-red-400">
                    {thresholdState.slaViolations}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Violation rate:</span>
                  <span className="font-bold text-red-400">
                    {thresholdViolationRate.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Scaling actions:
                  </span>
                  <span className="font-bold text-foreground">
                    {thresholdState.scalingActions}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Infrastructure cost:
                  </span>
                  <span className="font-bold text-foreground">
                    ${thresholdState.infraCost.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">SLA penalty:</span>
                  <span className="font-bold text-red-300">
                    ${thresholdPenaltyCost.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between border-t border-muted-foreground/20 pt-2 mt-2">
                  <span className="text-muted-foreground font-semibold">
                    Total cost:
                  </span>
                  <span className="font-bold text-foreground">
                    ${thresholdTotalCost.toFixed(2)}
                  </span>
                </div>
              </div>
            </motion.div>



            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-card/30 backdrop-blur-md border border-cyan-500/30 p-6 rounded-xl shadow-lg hover:shadow-cyan-500/10 transition-shadow duration-300"
            >
              <h2 className="text-2xl font-bold text-cyan-400 mb-4 flex items-center gap-2">
                <span className="w-2 h-8 bg-cyan-500 rounded-full inline-block"></span>
                RL-Based (Proactive)
              </h2>
              <div className="mb-4">
                <p className="text-sm text-muted-foreground mb-2">
                  Active capacity per provider
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-md border border-cyan-500/20 bg-cyan-500/5 p-3">
                    <ServerGrid
                      count={rlState.awsInstances}
                      color="bg-cyan-500/20 text-cyan-400"
                      label="AWS"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      Estimated utilization: {rlState.awsUtilization.toFixed(0)}
                      %
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Accumulated cost: ${rlState.providerCost.aws.toFixed(2)}
                    </p>
                  </div>
                  <div className="rounded-md border border-cyan-500/20 bg-cyan-500/5 p-3">
                    <ServerGrid
                      count={rlState.gcpInstances}
                      color="bg-cyan-500/10 text-cyan-300"
                      label="GCP"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      Estimated utilization: {rlState.gcpUtilization.toFixed(0)}
                      %
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Accumulated cost: ${rlState.providerCost.gcp.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Total instances:
                  </span>
                  <span className="font-bold text-foreground">
                    {rlState.instances}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">p95 latency:</span>
                  <span
                    className={`font-bold ${rlState.p95Latency > SLA_THRESHOLD ? "text-red-400" : "text-cyan-400"}`}
                  >
                    {rlState.p95Latency.toFixed(0)}ms
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">SLA Violations:</span>
                  <span className="font-bold text-cyan-400">
                    {rlState.slaViolations}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Violation rate:</span>
                  <span className="font-bold text-cyan-400">
                    {rlViolationRate.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Scaling actions:
                  </span>
                  <span className="font-bold text-foreground">
                    {rlState.scalingActions}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Infrastructure cost:
                  </span>
                  <span className="font-bold text-foreground">
                    ${rlState.infraCost.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">SLA penalty:</span>
                  <span className="font-bold text-cyan-300">
                    ${rlPenaltyCost.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between border-t border-muted-foreground/20 pt-2 mt-2">
                  <span className="text-muted-foreground font-semibold">
                    Total cost:
                  </span>
                  <span className="font-bold text-cyan-400">
                    ${rlTotalCost.toFixed(2)}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      ) : (
        <div className="max-w-7xl mx-auto space-y-6">
          {!timelineLength && (
            <div className="rounded-lg border border-dashed border-border/60 bg-card/40 p-4 text-sm text-muted-foreground">
              Start the simulation to populate this dashboard.
            </div>
          )}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-card/50 p-4 rounded-lg h-[300px]">
              <h3 className="text-lg font-bold text-foreground mb-2">
                p95 latency over time (SLA = 200ms)
              </h3>
              <div className="h-[220px]">
                <Line data={latencyChartData} options={chartOptions} />
              </div>
            </div>
            <div className="bg-card/50 p-4 rounded-lg h-[300px]">
              <h3 className="text-lg font-bold text-foreground mb-2">
                Instances over time
              </h3>
              <div className="h-[220px]">
                <Line data={instancesChartData} options={chartOptions} />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-card/50 p-4 rounded-lg h-[300px]">
              <h3 className="text-lg font-bold text-foreground mb-2">
                Simulated workload (req/s)
              </h3>
              <div className="h-[220px]">
                <Line data={workloadChartData} options={chartOptions} />
              </div>
            </div>
            <div className="bg-card/50 p-4 rounded-lg h-[300px]">
              <h3 className="text-lg font-bold text-foreground mb-2">
                Cumulative SLA violations
              </h3>
              <div className="h-[220px]">
                <Line data={violationsChartData} options={chartOptions} />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-xl border border-border/40 bg-card/50 p-6">
              <h3 className="text-lg font-semibold text-foreground">
                Total cost (infrastructure + SLA penalties)
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                We add ${SLA_PENALTY_PER_VIOLATION.toFixed(2)} per violation to
                represent credits/rebates owed to customers.
              </p>
              <div className="grid gap-3 sm:grid-cols-2 mt-4">
                <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4">
                  <p className="text-xs uppercase text-muted-foreground tracking-wide">
                    Threshold total
                  </p>
                  <p className="text-2xl font-mono text-red-300 mt-1">
                    ${thresholdTotalCost.toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Infra ${thresholdState.infraCost.toFixed(2)} + penalties $
                    {thresholdPenaltyCost.toFixed(2)}
                  </p>
                </div>
                <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-4">
                  <p className="text-xs uppercase text-muted-foreground tracking-wide">
                    RL total
                  </p>
                  <p className="text-2xl font-mono text-cyan-300 mt-1">
                    ${rlTotalCost.toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Infra ${rlState.infraCost.toFixed(2)} + penalties $
                    {rlPenaltyCost.toFixed(2)}
                  </p>
                </div>
              </div>
              <div className="mt-4 rounded-lg bg-muted/20 p-4 text-sm text-muted-foreground">
                {rlIsCheaper ? (
                  <span>
                    RL is currently{" "}
                    <span className="text-cyan-300 font-semibold">
                      ${Math.abs(totalCostDelta).toFixed(2)}
                    </span>{" "}
                    cheaper overall thanks to fewer SLA penalties.
                  </span>
                ) : (
                  <span>
                    To break even, increase SLA penalties or consider longer
                    horizons—RL is spending{" "}
                    <span className="text-red-300 font-semibold">
                      ${Math.abs(totalCostDelta).toFixed(2)}
                    </span>{" "}
                    more right now.
                  </span>
                )}
              </div>
            </div>
            <div className="rounded-xl border border-border/40 bg-card/50 p-6">
              <h3 className="text-lg font-semibold text-foreground">
                Cost trajectory
              </h3>
              <div className="h-[220px]">
                <Line data={costChartData} options={chartOptions} />
              </div>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground list-disc list-inside">
                <li>
                  Only ~25% of the SLA penalties relative to the reactive
                  baseline.
                </li>
                <li>
                  −54% scaling actions, reducing thrashing and incident toil.
                </li>
                <li>
                  Reward tuning can bias toward cheaper mixes (spot, multi-cloud
                  arbitrage).
                </li>
                <li>
                  Customer experience gains (p95 latency halved) often outweigh
                  pure infra spend.
                </li>
              </ul>
            </div>
          </div>
          <div className="space-y-3">
            <h3 className="text-xl font-semibold text-foreground">
              Research connection
            </h3>
            <p className="text-sm text-muted-foreground">
              Benchmarks from Table 1 help contextualize what you see in the
              dashboard.
            </p>
            <div className="grid gap-4 md:grid-cols-3">
              {RESEARCH_BENCHMARKS.map((item) => (
                <div
                  key={item.label}
                  className="rounded-lg border border-border/40 bg-card/40 p-4"
                >
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    {item.label}
                  </p>
                  <div className="flex justify-between text-lg font-mono mt-3">
                    <span className="text-red-300">
                      Threshold {item.threshold}
                    </span>
                    <span className="text-cyan-300">RL {item.rl}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    {item.insight}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )
      }
    </div >
  );
}
