import { motion } from 'framer-motion';

export default function PracticalApplicationSlide() {
  const roadmap = ['Validate Simulation', 'Train on Real Data', 'Shadow Mode', 'Gradual Rollout'];

  return (
    <div className="w-full h-full flex items-center justify-center p-12 bg-gradient-to-br from-background to-card">
      <div className="max-w-6xl w-full">
        <motion.h1 initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} className="text-4xl font-bold mb-8 text-primary border-l-4 border-accent pl-6">
          Practical Application: From PoC to Production
        </motion.h1>
        <div className="grid grid-cols-4 gap-4 mb-8">
          {roadmap.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="bg-card/50 border border-accent/30 p-6 rounded-lg text-center"
            >
              <div className="text-3xl font-bold text-accent mb-2">{i + 1}</div>
              <div className="text-sm">{step}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
