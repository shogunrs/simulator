import { motion } from 'framer-motion';
import ServerScalingAnimation from '../ServerScalingAnimation';

export default function ServerAnimationSlide() {
  return (
    <div className="w-full h-full flex flex-col">
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="p-6 bg-gradient-to-r from-primary/20 to-accent/20 border-b border-primary/30"
      >
        <h1 className="text-3xl font-bold text-primary">
          Live Demonstration: Proactive vs Reactive Auto-Scaling
        </h1>
        <p className="text-sm text-muted-foreground mt-2">
          Watch how RL anticipates workload changes and scales <strong>before</strong> performance degrades
        </p>
      </motion.div>
      
      <div className="flex-1 overflow-auto">
        <ServerScalingAnimation />
      </div>
    </div>
  );
}
