import { motion } from 'framer-motion';

export default function ResultsTemporalSlide() {
  return (
    <div className="w-full h-full flex items-center justify-center p-12 bg-gradient-to-br from-background to-card">
      <div className="max-w-6xl w-full">
        <motion.h1 initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} className="text-4xl font-bold mb-8 text-primary border-l-4 border-accent pl-6">
          Results: Proactive vs Reactive
        </motion.h1>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}>
          <img src="/images/comparison_detailed.png" alt="Temporal Analysis" className="w-full h-auto rounded-lg border border-primary/30" />
        </motion.div>
      </div>
    </div>
  );
}
