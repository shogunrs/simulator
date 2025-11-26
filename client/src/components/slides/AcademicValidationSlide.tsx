import { motion } from 'framer-motion';

export default function AcademicValidationSlide() {
  return (
    <div className="w-full h-full flex items-center justify-center p-12 bg-gradient-to-br from-background to-card">
      <div className="max-w-6xl w-full">
        <motion.h1 
          initial={{ opacity: 0, x: -50 }} 
          animate={{ opacity: 1, x: 0 }} 
          className="text-4xl font-bold mb-8 text-primary border-l-4 border-accent pl-6"
        >
          Statistical Validation & Academic Benchmarks
        </motion.h1>

        <div className="grid grid-cols-2 gap-6">
          {/* Statistical Testing */}
          <motion.div 
            initial={{ opacity: 0, y: 50 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.2 }}
            className="bg-card/50 border border-primary/30 p-6 rounded-lg"
          >
            <h2 className="text-2xl font-bold text-accent mb-4">Hypothesis Testing</h2>
            <div className="space-y-3 text-sm">
              <div className="bg-primary/10 p-3 rounded">
                <p className="font-semibold text-primary">H₀: RL = Threshold-based</p>
                <p className="text-muted-foreground">H₁: RL &lt; Threshold-based SLA violations</p>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="bg-accent/10 p-3 rounded text-center">
                  <p className="text-xs text-muted-foreground">RL Performance</p>
                  <p className="text-xl font-bold text-accent">2.1% ± 0.3%</p>
                </div>
                <div className="bg-accent/10 p-3 rounded text-center">
                  <p className="text-xs text-muted-foreground">Threshold</p>
                  <p className="text-xl font-bold text-accent">8.7% ± 0.9%</p>
                </div>
                <div className="bg-primary/10 p-3 rounded text-center">
                  <p className="text-xs text-muted-foreground">t-statistic</p>
                  <p className="text-xl font-bold text-primary">15.73</p>
                </div>
                <div className="bg-primary/10 p-3 rounded text-center">
                  <p className="text-xs text-muted-foreground">p-value</p>
                  <p className="text-xl font-bold text-primary">&lt; 0.001</p>
                </div>
              </div>
              <div className="bg-accent/20 p-3 rounded mt-3 text-center">
                <p className="font-semibold text-accent">✓ Statistically significant improvement</p>
              </div>
            </div>
          </motion.div>

          {/* Academic Validation */}
          <motion.div 
            initial={{ opacity: 0, y: 50 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.4 }}
            className="bg-card/50 border border-primary/30 p-6 rounded-lg"
          >
            <h2 className="text-2xl font-bold text-accent mb-4">Academic Validation</h2>
            <div className="space-y-4 text-sm">
              <div className="bg-primary/10 p-4 rounded">
                <p className="font-semibold text-primary mb-2">USENIX ATC 2023: AWARE Paper</p>
                <p className="text-xs text-muted-foreground mb-2">
                  Qiu et al. (2023) - Microsoft Azure Production
                </p>
                <p className="text-sm">
                  Production deployment achieved <span className="font-bold text-accent">16.9x SLA reduction</span> in real-world workloads
                </p>
              </div>
              <div className="bg-accent/10 p-4 rounded">
                <p className="font-semibold text-accent mb-2">Our Work (Offline Evaluation)</p>
                <p className="text-sm">
                  Achieved <span className="font-bold text-primary">4.1x SLA reduction</span> (75.6% improvement) 
                  in simulated multicloud environment
                </p>
              </div>
              <div className="bg-primary/20 p-3 rounded text-center mt-4">
                <p className="font-semibold text-primary">✓ Results align with academic benchmarks</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Citation */}
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ delay: 0.6 }}
          className="mt-6 text-xs text-muted-foreground italic text-center"
        >
          Reference: Qiu, H., et al. (2023). AWARE: Automate workload autoscaling with reinforcement learning 
          in production cloud systems. USENIX ATC '23.
        </motion.div>
      </div>
    </div>
  );
}
