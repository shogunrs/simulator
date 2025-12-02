import { motion } from 'framer-motion';

export default function ConclusionSlide() {
  return (
    <div className="w-full h-full flex items-center justify-center p-12 bg-gradient-to-br from-background to-card">
      <div className="max-w-6xl w-full">
        <motion.h1 initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} className="text-4xl font-bold mb-8 text-primary border-l-4 border-accent pl-6">
          Conclusion
        </motion.h1>
        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-accent/10 border-t-4 border-accent p-8 rounded-lg mb-6">
          <p className="text-2xl font-bold text-accent mb-4">
            Reinforcement Learning demonstrates superior decision-making for multicloud auto-scaling
          </p>
          <p className="text-lg">
            through proactive, adaptive policies that anticipate workload changes instead of reacting to them.
          </p>
        </motion.div>
        <div className="grid grid-cols-3 gap-6">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="bg-card/50 border border-primary/30 p-6 rounded-lg text-center">
            <div className="text-4xl mb-2">✓</div>
            <div className="text-2xl font-bold text-accent">75.6%</div>
            <div className="text-sm">SLA Reduction</div>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="bg-card/50 border border-primary/30 p-6 rounded-lg text-center">
            <div className="text-4xl mb-2">⚡</div>
            <div className="text-2xl font-bold text-accent">10.7%</div>
            <div className="text-sm">Lower Latency</div>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="bg-card/50 border border-primary/30 p-6 rounded-lg text-center">
            <div className="text-4xl mb-2">🎯</div>
            <div className="text-2xl font-bold text-accent">Validated</div>
            <div className="text-sm">Production Ready</div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
