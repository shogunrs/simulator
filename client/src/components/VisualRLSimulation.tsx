import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';
import { Play, Pause, RotateCcw, Server, Zap, Brain, AlertTriangle, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ServerInstance {
  id: string;
  cpu: number;
}

interface SimulationState {
  time: number;
  workload: number;
  servers: ServerInstance[];
  avgCpu: number;
  status: 'healthy' | 'warning' | 'critical';
  prediction?: number; // Only for RL
}

export default function VisualRLSimulation() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [time, setTime] = useState(0);
  
  // Use refs to track previous instance counts to detect actual changes
  const prevTraditionalCount = useRef(2);
  const prevRLCount = useRef(3);
  
  const [traditionalState, setTraditionalState] = useState<SimulationState>({
    time: 0,
    workload: 100,
    servers: [
      { id: 'trad-1', cpu: 50 },
      { id: 'trad-2', cpu: 50 },
    ],
    avgCpu: 50,
    status: 'healthy',
  });
  
  const [rlState, setRlState] = useState<SimulationState>({
    time: 0,
    workload: 100,
    servers: [
      { id: 'rl-1', cpu: 33 },
      { id: 'rl-2', cpu: 33 },
      { id: 'rl-3', cpu: 33 },
    ],
    avgCpu: 33,
    status: 'healthy',
    prediction: 120,
  });

  // Workload pattern with spikes
  const getWorkload = (t: number) => {
    return Math.max(50, 100 + Math.sin(t / 5) * 80 + Math.cos(t / 3) * 40);
  };

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setTime((t) => {
        const newTime = t + 1;
        const workload = Math.round(getWorkload(newTime));

        // Traditional (Reactive) Logic
        setTraditionalState((prev) => {
          const currentCount = prev.servers.length;
          const cpu = Math.min(100, (workload / currentCount) * 0.6);
          let newCount = currentCount;

          // React AFTER threshold (80%)
          if (cpu > 80 && currentCount < 6) {
            newCount = currentCount + 1;
          } else if (cpu < 30 && currentCount > 2) {
            newCount = currentCount - 1;
          }

          // Only update servers array if count changed
          let newServers = prev.servers;
          if (newCount !== currentCount) {
            if (newCount > currentCount) {
              // Add server
              newServers = [...prev.servers, { id: `trad-${Date.now()}`, cpu }];
            } else {
              // Remove last server
              newServers = prev.servers.slice(0, -1);
            }
            prevTraditionalCount.current = newCount;
          } else {
            // Just update CPU values
            const newCpu = Math.min(100, (workload / newCount) * 0.6);
            newServers = prev.servers.map(s => ({ ...s, cpu: Math.round(newCpu) }));
          }

          const avgCpu = Math.round(newServers.reduce((sum, s) => sum + s.cpu, 0) / newServers.length);
          const status = avgCpu > 70 ? 'critical' : avgCpu > 40 ? 'warning' : 'healthy';

          return {
            time: newTime,
            workload,
            servers: newServers,
            avgCpu,
            status,
          };
        });

        // RL (Proactive) Logic
        setRlState((prev) => {
          const currentCount = prev.servers.length;
          
          // Predict future workload (look ahead 3 steps)
          const futureWorkload = Math.round(getWorkload(newTime + 3));
          const futureCpu = (futureWorkload / currentCount) * 0.6;
          
          let newCount = currentCount;

          // Act BEFORE threshold (60% predicted)
          if (futureCpu > 60 && currentCount < 6) {
            newCount = currentCount + 1;
          } else if (futureCpu < 35 && currentCount > 2) {
            newCount = currentCount - 1;
          }

          // Only update servers array if count changed
          let newServers = prev.servers;
          if (newCount !== currentCount) {
            if (newCount > currentCount) {
              // Add server
              newServers = [...prev.servers, { id: `rl-${Date.now()}`, cpu: Math.round((workload / newCount) * 0.6) }];
            } else {
              // Remove last server
              newServers = prev.servers.slice(0, -1);
            }
            prevRLCount.current = newCount;
          } else {
            // Just update CPU values
            const currentCpu = Math.min(100, (workload / newCount) * 0.6);
            newServers = prev.servers.map(s => ({ ...s, cpu: Math.round(currentCpu) }));
          }

          const avgCpu = Math.round(newServers.reduce((sum, s) => sum + s.cpu, 0) / newServers.length);
          const status = avgCpu > 70 ? 'critical' : avgCpu > 40 ? 'warning' : 'healthy';

          return {
            time: newTime,
            workload,
            servers: newServers,
            avgCpu,
            status,
            prediction: futureWorkload,
          };
        });

        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying]);

  const handleReset = () => {
    setTime(0);
    setIsPlaying(false);
    prevTraditionalCount.current = 2;
    prevRLCount.current = 3;
    setTraditionalState({
      time: 0,
      workload: 100,
      servers: [
        { id: 'trad-1', cpu: 50 },
        { id: 'trad-2', cpu: 50 },
      ],
      avgCpu: 50,
      status: 'healthy',
    });
    setRlState({
      time: 0,
      workload: 100,
      servers: [
        { id: 'rl-1', cpu: 33 },
        { id: 'rl-2', cpu: 33 },
        { id: 'rl-3', cpu: 33 },
      ],
      avgCpu: 33,
      status: 'healthy',
      prediction: 120,
    });
  };

  const getCpuColor = (cpu: number) => {
    if (cpu > 70) return 'text-destructive';
    if (cpu > 40) return 'text-yellow-500';
    return 'text-accent';
  };

  const getCpuBarColor = (cpu: number) => {
    if (cpu > 70) return 'bg-destructive';
    if (cpu > 40) return 'bg-yellow-500';
    return 'bg-accent';
  };

  const ServerGrid = ({ state, isTraditional }: { state: SimulationState; isTraditional: boolean }) => {
    const borderColor = isTraditional ? 'border-destructive' : 'border-accent';
    const bgColor = isTraditional ? 'bg-destructive/10' : 'bg-accent/10';
    const iconColor = isTraditional ? 'text-destructive' : 'text-accent';
    
    return (
      <div className="grid grid-cols-3 gap-4 min-h-[300px]">
        <AnimatePresence mode="popLayout">
          {state.servers.map((server) => (
            <motion.div
              key={server.id}
              layout
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ 
                type: "spring",
                stiffness: 300,
                damping: 25,
                layout: { duration: 0.3 }
              }}
              className={`relative p-6 rounded-lg border-2 ${borderColor} ${bgColor}`}
            >
              <Server className={`w-12 h-12 mx-auto ${iconColor}`} />
              
              {/* CPU Bar */}
              <div className="mt-3 h-2 bg-background rounded-full overflow-hidden">
                <motion.div
                  className={getCpuBarColor(server.cpu)}
                  animate={{ width: `${server.cpu}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <div className={`text-sm text-center mt-1 font-mono font-bold ${getCpuColor(server.cpu)}`}>
                {server.cpu}%
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="w-full h-full p-8 bg-gradient-to-br from-background to-card">
      <div className="max-w-7xl mx-auto h-full flex flex-col">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-primary mb-2">
              Proactive vs Reactive Auto-Scaling
            </h2>
            <p className="text-sm text-muted-foreground">
              Watch how RL <strong className="text-accent">predicts and scales before</strong> problems occur
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={() => setIsPlaying(!isPlaying)} size="lg" className="gap-2">
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              {isPlaying ? 'Pause' : 'Play'}
            </Button>
            <Button onClick={handleReset} variant="outline" size="lg">
              <RotateCcw className="w-5 h-5" />
            </Button>
            <div className="text-sm font-mono text-muted-foreground px-4 py-2 bg-card rounded">
              Time: {time}s
            </div>
          </div>
        </div>

        {/* Comparison Grid */}
        <div className="flex-1 grid grid-cols-2 gap-8">
          {/* Traditional (Reactive) - RED */}
          <div className="flex flex-col">
            <div className="mb-4 p-4 bg-destructive/10 border-l-4 border-destructive rounded">
              <div className="flex items-center gap-3 mb-2">
                <AlertTriangle className="w-6 h-6 text-destructive" />
                <h3 className="text-2xl font-bold text-destructive">Traditional (Reactive)</h3>
              </div>
              <p className="text-xs text-foreground/80">
                Scales when CPU &gt; 80% → <strong>AFTER</strong> problems occur
              </p>
            </div>

            <div className="space-y-4 flex-1">
              <div className="p-4 bg-card rounded-lg border border-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Workload</span>
                  <Zap className="w-4 h-4 text-primary" />
                </div>
                <div className="text-2xl font-bold text-foreground">{traditionalState.workload} req/s</div>
              </div>

              <div>
                <div className="text-sm font-semibold text-muted-foreground mb-2">
                  Servers ({traditionalState.servers.length})
                </div>
                <ServerGrid state={traditionalState} isTraditional={true} />
              </div>
            </div>

            <div className="mt-4 p-4 rounded-lg border-2 border-destructive bg-destructive/10">
              <div className="text-sm text-muted-foreground">Status</div>
              <div className="text-2xl font-bold mt-1 text-destructive">
                {traditionalState.status === 'critical' && '🔴 OVERLOADED'}
                {traditionalState.status === 'warning' && '⚠️ WARNING'}
                {traditionalState.status === 'healthy' && '✅ HEALTHY'}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Avg CPU: <span className={`font-bold ${getCpuColor(traditionalState.avgCpu)}`}>{traditionalState.avgCpu}%</span>
              </div>
            </div>
          </div>

          {/* RL (Proactive) - GREEN */}
          <div className="flex flex-col">
            <div className="mb-4 p-4 bg-accent/10 border-l-4 border-accent rounded">
              <div className="flex items-center gap-3 mb-2">
                <Brain className="w-6 h-6 text-accent" />
                <h3 className="text-2xl font-bold text-accent">RL Agent (Proactive)</h3>
              </div>
              <p className="text-xs text-foreground/80">
                Predicts future load → Scales <strong>BEFORE</strong> threshold
              </p>
            </div>

            <div className="space-y-4 flex-1">
              <div className="grid grid-cols-2 gap-2">
                <div className="p-4 bg-card rounded-lg border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Current</span>
                    <Zap className="w-4 h-4 text-primary" />
                  </div>
                  <div className="text-2xl font-bold text-foreground">{rlState.workload} req/s</div>
                </div>
                <div className="p-4 bg-accent/10 rounded-lg border border-accent">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-accent">Predicted</span>
                    <TrendingUp className="w-4 h-4 text-accent" />
                  </div>
                  <div className="text-2xl font-bold text-accent">{rlState.prediction} req/s</div>
                </div>
              </div>

              <div>
                <div className="text-sm font-semibold text-muted-foreground mb-2">
                  Servers ({rlState.servers.length})
                </div>
                <ServerGrid state={rlState} isTraditional={false} />
              </div>
            </div>

            <div className="mt-4 p-4 rounded-lg border-2 border-accent bg-accent/10">
              <div className="text-sm text-muted-foreground">Status</div>
              <div className="text-2xl font-bold mt-1 text-accent">
                {rlState.status === 'critical' && '🔴 OVERLOADED'}
                {rlState.status === 'warning' && '⚠️ WARNING'}
                {rlState.status === 'healthy' && '✅ HEALTHY'}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Avg CPU: <span className={`font-bold ${getCpuColor(rlState.avgCpu)}`}>{rlState.avgCpu}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
