import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Play, Pause, RotateCcw, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface State {
  cpu: number;
  requests: number;
  instances: number;
}

interface Action {
  type: 'scale_up' | 'scale_down' | 'maintain';
  label: string;
}

interface Step {
  state: State;
  action: Action;
  reward: number;
  nextState: State;
}

export default function RLSimulation() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<Step[]>([]);

  // Generate simulation steps
  useEffect(() => {
    const simulationSteps: Step[] = [];
    let state: State = { cpu: 45, requests: 150, instances: 2 };

    for (let i = 0; i < 10; i++) {
      // Simulate workload changes
      const requestIncrease = Math.sin(i / 2) * 100 + 50;
      const nextRequests = Math.max(100, Math.min(400, state.requests + requestIncrease));
      const nextCpu = (nextRequests / state.instances) * 0.4;

      // RL Agent decision
      let action: Action;
      let nextInstances = state.instances;
      let reward = 0;

      if (nextCpu > 70 && state.instances < 6) {
        action = { type: 'scale_up', label: 'Scale Up (+1 instance)' };
        nextInstances = state.instances + 1;
        reward = 10; // Proactive scaling
      } else if (nextCpu < 30 && state.instances > 2) {
        action = { type: 'scale_down', label: 'Scale Down (-1 instance)' };
        nextInstances = state.instances - 1;
        reward = 5; // Cost optimization
      } else {
        action = { type: 'maintain', label: 'Maintain (no change)' };
        reward = nextCpu > 80 ? -20 : 2; // Penalty for overload
      }

      const nextState: State = {
        cpu: Math.round((nextRequests / nextInstances) * 0.4),
        requests: Math.round(nextRequests),
        instances: nextInstances,
      };

      simulationSteps.push({
        state,
        action,
        reward,
        nextState,
      });

      state = nextState;
    }

    setSteps(simulationSteps);
  }, []);

  useEffect(() => {
    if (!isPlaying || currentStep >= steps.length - 1) {
      setIsPlaying(false);
      return;
    }

    const timer = setTimeout(() => {
      setCurrentStep((s) => s + 1);
    }, 2000);

    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, steps.length]);

  const handleReset = () => {
    setCurrentStep(0);
    setIsPlaying(false);
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((s) => s + 1);
    }
  };

  if (steps.length === 0) return <div>Loading...</div>;

  const step = steps[currentStep];

  const getActionColor = (type: Action['type']) => {
    switch (type) {
      case 'scale_up':
        return 'text-accent border-accent bg-accent/20';
      case 'scale_down':
        return 'text-primary border-primary bg-primary/20';
      case 'maintain':
        return 'text-muted-foreground border-muted-foreground bg-muted/20';
    }
  };

  const getRewardColor = (reward: number) => {
    if (reward > 5) return 'text-accent';
    if (reward < 0) return 'text-destructive';
    return 'text-muted-foreground';
  };

  return (
    <div className="w-full h-full p-8 bg-gradient-to-br from-background to-card">
      <div className="max-w-7xl mx-auto h-full flex flex-col">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-primary mb-2">
            Interactive RL Simulation: Step-by-Step Decision Making
          </h2>
          <p className="text-sm text-muted-foreground">
            Watch the RL agent observe state, choose actions, and receive rewards
          </p>
        </div>

        {/* Controls */}
        <div className="mb-6 flex items-center gap-4">
          <Button
            onClick={() => setIsPlaying(!isPlaying)}
            variant="default"
            size="lg"
            className="gap-2"
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            {isPlaying ? 'Pause' : 'Play'}
          </Button>
          <Button onClick={handleNext} variant="outline" size="lg" disabled={currentStep >= steps.length - 1}>
            <ChevronRight className="w-5 h-5" />
            Next Step
          </Button>
          <Button onClick={handleReset} variant="outline" size="lg">
            <RotateCcw className="w-5 h-5" />
            Reset
          </Button>
          <div className="ml-auto text-sm font-mono text-muted-foreground">
            Step {currentStep + 1} / {steps.length}
          </div>
        </div>

        {/* RL Cycle Visualization */}
        <div className="flex-1 grid grid-cols-4 gap-6">
          {/* 1. State (Observation) */}
          <motion.div
            key={`state-${currentStep}`}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-card border-2 border-primary rounded-lg p-6 flex flex-col"
          >
            <div className="mb-4">
              <div className="text-xs text-primary font-bold uppercase tracking-wide mb-2">Step 1</div>
              <h3 className="text-xl font-bold text-foreground">State (s<sub>t</sub>)</h3>
              <p className="text-xs text-muted-foreground mt-1">Current environment observation</p>
            </div>
            
            <div className="flex-1 space-y-4">
              <div className="bg-background/50 rounded p-3">
                <div className="text-xs text-muted-foreground">CPU Utilization</div>
                <div className="text-2xl font-bold text-foreground">{step.state.cpu}%</div>
                <div className="h-2 bg-background rounded-full mt-2 overflow-hidden">
                  <motion.div
                    className={`h-full ${step.state.cpu > 80 ? 'bg-destructive' : step.state.cpu > 60 ? 'bg-yellow-500' : 'bg-accent'}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${step.state.cpu}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>

              <div className="bg-background/50 rounded p-3">
                <div className="text-xs text-muted-foreground">Requests/sec</div>
                <div className="text-2xl font-bold text-foreground">{step.state.requests}</div>
              </div>

              <div className="bg-background/50 rounded p-3">
                <div className="text-xs text-muted-foreground">Instances</div>
                <div className="text-2xl font-bold text-foreground">{step.state.instances}</div>
              </div>
            </div>
          </motion.div>

          {/* 2. Action */}
          <motion.div
            key={`action-${currentStep}`}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className={`bg-card border-2 rounded-lg p-6 flex flex-col ${getActionColor(step.action.type)}`}
          >
            <div className="mb-4">
              <div className="text-xs font-bold uppercase tracking-wide mb-2">Step 2</div>
              <h3 className="text-xl font-bold">Action (a<sub>t</sub>)</h3>
              <p className="text-xs opacity-80 mt-1">Agent's decision</p>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3, delay: 0.7 }}
                className="text-6xl mb-4"
              >
                {step.action.type === 'scale_up' && '⬆️'}
                {step.action.type === 'scale_down' && '⬇️'}
                {step.action.type === 'maintain' && '➡️'}
              </motion.div>
              <div className="text-lg font-bold text-center">{step.action.label}</div>
              <div className="text-xs opacity-80 mt-2 text-center">
                {step.action.type === 'scale_up' && 'Proactive scaling to handle upcoming load'}
                {step.action.type === 'scale_down' && 'Cost optimization by reducing capacity'}
                {step.action.type === 'maintain' && 'Current capacity is optimal'}
              </div>
            </div>
          </motion.div>

          {/* 3. Reward */}
          <motion.div
            key={`reward-${currentStep}`}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.0 }}
            className="bg-card border-2 border-accent rounded-lg p-6 flex flex-col"
          >
            <div className="mb-4">
              <div className="text-xs text-accent font-bold uppercase tracking-wide mb-2">Step 3</div>
              <h3 className="text-xl font-bold text-foreground">Reward (r<sub>t</sub>)</h3>
              <p className="text-xs text-muted-foreground mt-1">Feedback signal</p>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.5, delay: 1.2 }}
                className={`text-6xl font-bold ${getRewardColor(step.reward)}`}
              >
                {step.reward > 0 ? '+' : ''}{step.reward}
              </motion.div>
              <div className="text-sm text-muted-foreground mt-4 text-center">
                {step.reward > 5 && '✅ Excellent decision!'}
                {step.reward > 0 && step.reward <= 5 && '👍 Good choice'}
                {step.reward < 0 && '❌ Performance degraded'}
              </div>
            </div>

            <div className="mt-4 text-xs text-muted-foreground bg-background/50 rounded p-3">
              <strong>Reward Function:</strong><br />
              r = -w<sub>perf</sub> × SLA_violations - w<sub>cost</sub> × cost
            </div>
          </motion.div>

          {/* 4. Next State */}
          <motion.div
            key={`next-state-${currentStep}`}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.5 }}
            className="bg-card border-2 border-primary/50 rounded-lg p-6 flex flex-col"
          >
            <div className="mb-4">
              <div className="text-xs text-primary font-bold uppercase tracking-wide mb-2">Step 4</div>
              <h3 className="text-xl font-bold text-foreground">Next State (s<sub>t+1</sub>)</h3>
              <p className="text-xs text-muted-foreground mt-1">New environment state</p>
            </div>

            <div className="flex-1 space-y-4">
              <div className="bg-background/50 rounded p-3">
                <div className="text-xs text-muted-foreground">CPU Utilization</div>
                <div className="text-2xl font-bold text-foreground">{step.nextState.cpu}%</div>
                <div className="h-2 bg-background rounded-full mt-2 overflow-hidden">
                  <motion.div
                    className={`h-full ${step.nextState.cpu > 80 ? 'bg-destructive' : step.nextState.cpu > 60 ? 'bg-yellow-500' : 'bg-accent'}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${step.nextState.cpu}%` }}
                    transition={{ duration: 0.5, delay: 1.7 }}
                  />
                </div>
              </div>

              <div className="bg-background/50 rounded p-3">
                <div className="text-xs text-muted-foreground">Requests/sec</div>
                <div className="text-2xl font-bold text-foreground">{step.nextState.requests}</div>
              </div>

              <div className="bg-background/50 rounded p-3">
                <div className="text-xs text-muted-foreground">Instances</div>
                <div className="text-2xl font-bold text-foreground flex items-center gap-2">
                  {step.nextState.instances}
                  {step.nextState.instances > step.state.instances && (
                    <span className="text-accent text-sm">↑</span>
                  )}
                  {step.nextState.instances < step.state.instances && (
                    <span className="text-primary text-sm">↓</span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6 bg-background/50 rounded-full h-2 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-accent"
            animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>
    </div>
  );
}
