import { motion } from 'framer-motion';

export default function ImplementationArchSlide() {
  const hyperparams = [
    { name: 'Learning Rate', value: '3e-4' },
    { name: 'N Steps', value: '2048' },
    { name: 'Batch Size', value: '64' },
    { name: 'N Epochs', value: '10' },
    { name: 'Discount (γ)', value: '0.99' },
    { name: 'GAE Lambda', value: '0.95' },
    { name: 'Clip Range', value: '0.2' },
    { name: 'Total Steps', value: '100k' },
  ];

  return (
    <div className="w-full h-full flex items-center justify-center p-12 bg-gradient-to-br from-background to-card">
      <div className="max-w-6xl w-full">
        <motion.h1 initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} className="text-4xl font-bold mb-8 text-primary border-l-4 border-accent pl-6">
          Implementation: Architecture & Hyperparameters
        </motion.h1>
        <div className="grid grid-cols-4 gap-4">
          {hyperparams.map((param, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 * i }}
              className="bg-card/50 border border-primary/30 p-4 rounded-lg text-center"
            >
              <div className="text-xs text-primary uppercase mb-2">{param.name}</div>
              <div className="text-2xl font-bold text-accent">{param.value}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
