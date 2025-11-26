import { motion } from 'framer-motion';

export default function ExperimentalSetupSlide() {
  return (
    <div className="w-full h-full flex items-center justify-center p-12 bg-gradient-to-br from-background to-card">
      <div className="max-w-6xl w-full">
        <motion.h1 initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} className="text-4xl font-bold mb-8 text-primary border-l-4 border-accent pl-6">
          Experimental Setup
        </motion.h1>
        <div className="grid grid-cols-3 gap-6">
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card/50 border border-primary/30 p-6 rounded-lg">
            <h3 className="text-xl font-bold text-accent mb-4">Simulation</h3>
            <ul className="space-y-2 text-sm">
              <li>• 200 timesteps/episode</li>
              <li>• 10 evaluation episodes</li>
              <li>• 100k training steps</li>
            </ul>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-card/50 border border-primary/30 p-6 rounded-lg">
            <h3 className="text-xl font-bold text-accent mb-4">Methods</h3>
            <ul className="space-y-2 text-sm">
              <li>• RL Agent (PPO)</li>
              <li>• Rule-Based</li>
              <li>• Adaptive Rule-Based</li>
            </ul>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-card/50 border border-primary/30 p-6 rounded-lg">
            <h3 className="text-xl font-bold text-accent mb-4">Metrics</h3>
            <ul className="space-y-2 text-sm">
              <li>• Cost</li>
              <li>• SLA Violations</li>
              <li>• CPU Utilization</li>
              <li>• Latency</li>
            </ul>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
