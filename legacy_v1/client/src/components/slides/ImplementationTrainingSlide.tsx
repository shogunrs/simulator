import { motion } from 'framer-motion';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

export default function ImplementationTrainingSlide() {
  const code = `from stable_baselines3 import PPO

# Create environment
env = MulticloudEnv()

# Initialize PPO agent
model = PPO(
    "MlpPolicy", env,
    learning_rate=3e-4,
    n_steps=2048,
    batch_size=64,
    n_epochs=10,
    gamma=0.99
)

# Train agent
model.learn(total_timesteps=100_000)
model.save("ppo_autoscaler")`;

  return (
    <div className="w-full h-full flex items-center justify-center p-12 bg-gradient-to-br from-background to-card">
      <div className="max-w-6xl w-full">
        <motion.h1 initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} className="text-4xl font-bold mb-8 text-primary border-l-4 border-accent pl-6">
          Implementation: Training with PPO
        </motion.h1>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <SyntaxHighlighter language="python" style={vscDarkPlus} customStyle={{ fontSize: '0.9rem', padding: '1.5rem' }}>
            {code}
          </SyntaxHighlighter>
        </motion.div>
      </div>
    </div>
  );
}
