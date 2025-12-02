import { motion } from 'framer-motion';

export default function ActionRewardSlide() {
  return (
    <div className="w-full h-full flex items-center justify-center p-12 bg-gradient-to-br from-background to-card">
      <div className="max-w-6xl w-full">
        <motion.h1 
          initial={{ opacity: 0, x: -50 }} 
          animate={{ opacity: 1, x: 0 }} 
          className="text-4xl font-bold mb-8 text-primary border-l-4 border-accent pl-6"
        >
          Problem Formulation: Actions & Rewards
        </motion.h1>

        <div className="grid grid-cols-2 gap-8">
          {/* Action Space */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold text-accent mb-4">Action Space (7 discrete actions)</h2>
            <div className="space-y-2">
              {[
                { code: '0', action: 'NO_OP (maintain current)' },
                { code: '1', action: 'SCALE_UP_AWS (+1 instance)' },
                { code: '2', action: 'SCALE_DOWN_AWS (-1 instance)' },
                { code: '3', action: 'SCALE_UP_GCP (+1 instance)' },
                { code: '4', action: 'SCALE_DOWN_GCP (-1 instance)' },
                { code: '5', action: 'SCALE_UP_BOTH (+1 each)' },
                { code: '6', action: 'SCALE_DOWN_BOTH (-1 each)' },
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + idx * 0.05 }}
                  className="bg-accent/10 border-l-4 border-accent p-3 rounded"
                >
                  <span className="font-mono text-primary font-bold">{item.code}:</span>{' '}
                  <span className="text-sm text-muted-foreground">{item.action}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Reward Function */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold text-accent mb-4">Reward Function (3 components)</h2>
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-card/50 border-t-4 border-primary p-4 rounded-lg"
              >
                <h3 className="text-lg font-bold text-primary mb-2">R_perf: Performance Penalty</h3>
                <p className="font-mono text-sm text-accent mb-1">-α × (latency - SLA_threshold)</p>
                <p className="text-xs text-muted-foreground">Penalizes SLA violations</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-card/50 border-t-4 border-primary p-4 rounded-lg"
              >
                <h3 className="text-lg font-bold text-primary mb-2">R_cost: Cost Penalty</h3>
                <p className="font-mono text-sm text-accent mb-1">-β × hourly_cost</p>
                <p className="text-xs text-muted-foreground">Minimizes infrastructure expenditure</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-card/50 border-t-4 border-primary p-4 rounded-lg"
              >
                <h3 className="text-lg font-bold text-primary mb-2">R_stability: Stability Penalty</h3>
                <p className="font-mono text-sm text-accent mb-1">-γ if excessive oscillation</p>
                <p className="text-xs text-muted-foreground">Prevents frequent scaling actions</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="bg-primary/20 p-4 rounded text-center"
              >
                <p className="text-xl font-bold text-primary">R = R_perf + R_cost + R_stability</p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
