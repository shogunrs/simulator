import { motion } from 'framer-motion';

export default function PPOAlgorithmSlide() {
  return (
    <div className="w-full h-full flex items-center justify-center p-12 bg-gradient-to-br from-background to-card">
      <div className="max-w-6xl w-full">
        <motion.h1 
          initial={{ opacity: 0, x: -50 }} 
          animate={{ opacity: 1, x: 0 }} 
          className="text-4xl font-bold mb-8 text-primary border-l-4 border-accent pl-6"
        >
          Proximal Policy Optimization (PPO)
        </motion.h1>

        <div className="grid grid-cols-3 gap-6 mb-6">
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.2 }}
            className="bg-accent/10 border border-accent/30 p-6 rounded-lg text-center"
          >
            <div className="text-4xl mb-3">🏆</div>
            <h3 className="text-lg font-bold text-accent mb-2">State-of-the-art</h3>
            <p className="text-sm text-muted-foreground">Actor-critic algorithm</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.3 }}
            className="bg-accent/10 border border-accent/30 p-6 rounded-lg text-center"
          >
            <div className="text-4xl mb-3">⚖️</div>
            <h3 className="text-lg font-bold text-accent mb-2">Excellent Stability</h3>
            <p className="text-sm text-muted-foreground">Sample efficiency</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.4 }}
            className="bg-accent/10 border border-accent/30 p-6 rounded-lg text-center"
          >
            <div className="text-4xl mb-3">🏭</div>
            <h3 className="text-lg font-bold text-accent mb-2">Production-ready</h3>
            <p className="text-sm text-muted-foreground">OpenAI, DeepMind</p>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 50 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.5 }}
          className="bg-card/50 border border-primary/30 p-6 rounded-lg mb-6"
        >
          <h2 className="text-2xl font-bold text-primary mb-4">Key Innovation: Clipped Objective</h2>
          <div className="bg-primary/10 p-4 rounded mb-3">
            <p className="text-center font-mono text-lg text-accent mb-2">
              L<sup>CLIP</sup>(θ) = E[min(r<sub>t</sub>(θ)·Â<sub>t</sub>, clip(r<sub>t</sub>(θ), 1-ε, 1+ε)·Â<sub>t</sub>)]
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            Prevents catastrophic policy updates by clipping the probability ratio r<sub>t</sub>(θ) 
            within [1-ε, 1+ε], ensuring conservative and stable learning without excessive policy changes.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ delay: 0.7 }}
          className="grid grid-cols-3 gap-4"
        >
          <div className="bg-accent/10 p-4 rounded text-center">
            <p className="text-xs text-muted-foreground mb-1">Total Timesteps</p>
            <p className="text-2xl font-bold text-accent">1,000,000</p>
          </div>
          <div className="bg-accent/10 p-4 rounded text-center">
            <p className="text-xs text-muted-foreground mb-1">Training Time</p>
            <p className="text-2xl font-bold text-accent">6-24 hours</p>
          </div>
          <div className="bg-accent/10 p-4 rounded text-center">
            <p className="text-xs text-muted-foreground mb-1">Framework</p>
            <p className="text-2xl font-bold text-accent">Stable-Baselines3</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
