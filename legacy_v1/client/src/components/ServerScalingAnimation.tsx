import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Server, Activity, DollarSign, Clock } from 'lucide-react';

interface ServerInstance {
  id: number;
  cpu: number;
  status: 'healthy' | 'overloaded' | 'scaling';
}

interface Metrics {
  cpu: number;
  requests: number;
  latency: number;
  cost: number;
  slaViolations: number;
}

export default function ServerScalingAnimation() {
  const [time, setTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  
  // Traditional (reactive) servers
  const [traditionalServers, setTraditionalServers] = useState<ServerInstance[]>([
    { id: 1, cpu: 30, status: 'healthy' },
    { id: 2, cpu: 30, status: 'healthy' },
  ]);
  const [traditionalMetrics, setTraditionalMetrics] = useState<Metrics>({
    cpu: 30,
    requests: 100,
    latency: 50,
    cost: 0.20,
    slaViolations: 0,
  });

  // RL (proactive) servers
  const [rlServers, setRlServers] = useState<ServerInstance[]>([
    { id: 1, cpu: 35, status: 'healthy' },
    { id: 2, cpu: 35, status: 'healthy' },
    { id: 3, cpu: 35, status: 'healthy' },
  ]);
  const [rlMetrics, setRlMetrics] = useState<Metrics>({
    cpu: 35,
    requests: 100,
    latency: 45,
    cost: 0.30,
    slaViolations: 0,
  });

  // Workload pattern (simulates traffic spikes)
  const getWorkload = (t: number) => {
    // Sine wave with spikes
    const base = 100;
    const spike = Math.sin(t / 10) * 150 + 150;
    return Math.max(base, spike);
  };

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setTime((t) => t + 1);

      const workload = getWorkload(time);
      const requestsPerServer = workload / 2; // Assume 2 servers initially

      // === TRADITIONAL (REACTIVE) LOGIC ===
      setTraditionalServers((servers) => {
        const avgCpu = (workload / servers.length) * 0.5; // Simplified CPU calculation
        
        // Update CPU for existing servers
        const updated = servers.map((s) => ({
          ...s,
          cpu: Math.min(100, avgCpu + Math.random() * 10),
          status: (avgCpu > 80 ? 'overloaded' : 'healthy') as 'healthy' | 'overloaded' | 'scaling',
        }));

        // REACTIVE: Scale UP only AFTER CPU > 80% (threshold violated)
        if (avgCpu > 80 && servers.length < 6) {
          updated.push({
            id: servers.length + 1,
            cpu: 50,
            status: 'scaling',
          });
        }

        // Scale DOWN when CPU < 30%
        if (avgCpu < 30 && servers.length > 2) {
          updated.pop();
        }

        return updated;
      });

      setTraditionalMetrics((m) => {
        const avgCpu = (workload / traditionalServers.length) * 0.5;
        const latency = avgCpu > 80 ? 120 + Math.random() * 30 : 50 + Math.random() * 10;
        const violations = avgCpu > 80 ? m.slaViolations + 1 : m.slaViolations;

        return {
          cpu: Math.round(avgCpu),
          requests: Math.round(workload),
          latency: Math.round(latency),
          cost: traditionalServers.length * 0.10,
          slaViolations: violations,
        };
      });

      // === RL (PROACTIVE) LOGIC ===
      setRlServers((servers) => {
        const avgCpu = (workload / servers.length) * 0.5;
        
        // Update CPU
        const updated = servers.map((s) => ({
          ...s,
          cpu: Math.min(100, avgCpu + Math.random() * 5),
          status: (avgCpu > 70 ? 'scaling' : 'healthy') as 'healthy' | 'overloaded' | 'scaling',
        }));

        // PROACTIVE: Scale UP BEFORE threshold (anticipates spike)
        // RL predicts workload increase 2-3 steps ahead
        const futureWorkload = getWorkload(time + 3);
        const futureCpu = (futureWorkload / servers.length) * 0.5;

        if (futureCpu > 60 && servers.length < 6) {
          updated.push({
            id: servers.length + 1,
            cpu: 40,
            status: 'scaling',
          });
        }

        // Scale DOWN when future CPU < 40%
        if (futureCpu < 40 && servers.length > 2) {
          updated.pop();
        }

        return updated;
      });

      setRlMetrics((m) => {
        const avgCpu = (workload / rlServers.length) * 0.5;
        const latency = avgCpu > 70 ? 60 + Math.random() * 10 : 45 + Math.random() * 5;
        const violations = avgCpu > 80 ? m.slaViolations + 1 : m.slaViolations;

        return {
          cpu: Math.round(avgCpu),
          requests: Math.round(workload),
          latency: Math.round(latency),
          cost: rlServers.length * 0.10,
          slaViolations: violations,
        };
      });
    }, 500); // Update every 500ms

    return () => clearInterval(interval);
  }, [time, isPlaying, traditionalServers.length, rlServers.length]);

  const ServerIcon = ({ server }: { server: ServerInstance }) => (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ duration: 0.3 }}
      className={`relative p-4 rounded-lg border-2 ${
        server.status === 'overloaded'
          ? 'border-destructive bg-destructive/20'
          : server.status === 'scaling'
          ? 'border-accent bg-accent/20'
          : 'border-primary bg-primary/20'
      }`}
    >
      <Server className="w-8 h-8 text-foreground" />
      <div className="text-xs mt-2 font-mono">
        CPU: {Math.round(server.cpu)}%
      </div>
      {server.status === 'overloaded' && (
        <motion.div
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full"
        />
      )}
    </motion.div>
  );

  const MetricsPanel = ({ title, metrics, color }: { title: string; metrics: Metrics; color: string }) => (
    <div className="bg-card/50 border border-primary/30 p-4 rounded-lg">
      <h4 className={`text-sm font-bold mb-3 text-${color}`}>{title}</h4>
      <div className="grid grid-cols-2 gap-3 text-xs font-mono">
        <div>
          <div className="text-muted-foreground">CPU Avg</div>
          <div className="text-lg font-bold">{metrics.cpu}%</div>
        </div>
        <div>
          <div className="text-muted-foreground">Requests</div>
          <div className="text-lg font-bold">{metrics.requests}</div>
        </div>
        <div>
          <div className="text-muted-foreground">Latency</div>
          <div className="text-lg font-bold">{metrics.latency}ms</div>
        </div>
        <div>
          <div className="text-muted-foreground">Cost</div>
          <div className="text-lg font-bold">${metrics.cost.toFixed(2)}</div>
        </div>
      </div>
      <div className={`mt-3 pt-3 border-t border-${color}/30`}>
        <div className="text-muted-foreground text-xs">SLA Violations</div>
        <div className={`text-2xl font-bold text-${color}`}>{metrics.slaViolations}</div>
      </div>
    </div>
  );

  return (
    <div className="w-full h-full p-8 bg-gradient-to-br from-background to-card">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-3xl font-bold text-primary">Auto-Scaling Comparison: Traditional vs RL</h2>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-4 py-2 bg-primary text-background rounded-lg font-semibold hover:bg-primary/80 transition"
            >
              {isPlaying ? 'Pause' : 'Play'}
            </button>
            <div className="text-sm font-mono text-muted-foreground">
              Time: {time}s
            </div>
          </div>
        </div>

        {/* Workload Indicator */}
        <div className="mb-6 bg-card/50 border border-accent/30 p-4 rounded-lg">
          <div className="flex items-center gap-3 mb-2">
            <Activity className="w-5 h-5 text-accent" />
            <span className="text-sm font-semibold text-accent">Workload Pattern</span>
          </div>
          <div className="h-2 bg-background rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-accent"
              animate={{ width: `${(getWorkload(time) / 300) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Current: {Math.round(getWorkload(time))} req/s
          </div>
        </div>

        {/* Comparison Grid */}
        <div className="grid grid-cols-2 gap-8">
          {/* Traditional */}
          <div>
            <div className="mb-4">
              <h3 className="text-xl font-bold text-destructive mb-2">Traditional (Reactive)</h3>
              <p className="text-xs text-muted-foreground">Scales AFTER threshold violations</p>
            </div>
            
            <div className="mb-4 grid grid-cols-3 gap-3">
              <AnimatePresence>
                {traditionalServers.map((server) => (
                  <ServerIcon key={server.id} server={server} />
                ))}
              </AnimatePresence>
            </div>

            <MetricsPanel title="Metrics" metrics={traditionalMetrics} color="destructive" />
          </div>

          {/* RL */}
          <div>
            <div className="mb-4">
              <h3 className="text-xl font-bold text-accent mb-2">RL Agent (Proactive)</h3>
              <p className="text-xs text-muted-foreground">Anticipates and scales BEFORE violations</p>
            </div>
            
            <div className="mb-4 grid grid-cols-3 gap-3">
              <AnimatePresence>
                {rlServers.map((server) => (
                  <ServerIcon key={server.id} server={server} />
                ))}
              </AnimatePresence>
            </div>

            <MetricsPanel title="Metrics" metrics={rlMetrics} color="accent" />
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 flex items-center justify-center gap-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded border-2 border-primary bg-primary/20" />
            <span>Healthy</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded border-2 border-accent bg-accent/20" />
            <span>Scaling</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded border-2 border-destructive bg-destructive/20" />
            <span>Overloaded</span>
          </div>
        </div>
      </div>
    </div>
  );
}
