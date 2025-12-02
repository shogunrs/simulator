import { motion } from 'framer-motion';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

export default function ImplementationEnvSlide() {
  const code = `import gymnasium as gym

class MulticloudEnv(gym.Env):
    def __init__(self):
        # State: CPU, memory, requests, latency, instances
        self.observation_space = gym.spaces.Box(
            low=0, high=1, shape=(5,), dtype=np.float32
        )
        # Action: Scale -2 to +2 instances
        self.action_space = gym.spaces.Discrete(5)
        
    def _calculate_reward(self):
        perf_penalty = -self.sla_violations * 10
        cost_penalty = -self.total_cost * 0.5
        return perf_penalty + cost_penalty`;

  return (
    <div className="w-full h-full flex items-center justify-center p-12 bg-gradient-to-br from-background to-card">
      <div className="max-w-6xl w-full">
        <motion.h1
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-4xl font-bold mb-8 text-primary border-l-4 border-accent pl-6"
        >
          Implementation: Environment & Reward
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
