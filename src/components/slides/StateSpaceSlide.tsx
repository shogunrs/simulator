import { motion } from 'framer-motion';

export default function StateSpaceSlide() {
  return (
    <div className="w-full h-full flex items-center justify-center p-12 bg-gradient-to-br from-background to-card">
      <div className="max-w-6xl w-full">
        <motion.h1 
          initial={{ opacity: 0, x: -50 }} 
          animate={{ opacity: 1, x: 0 }} 
          className="text-4xl font-bold mb-6 text-primary border-l-4 border-accent pl-6"
        >
          Problem Formulation: State Space
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ delay: 0.2 }}
          className="text-lg mb-8 text-muted-foreground"
        >
          The agent observes an <span className="text-primary font-bold">18-dimensional state vector</span> providing 
          comprehensive situational awareness across performance, infrastructure, temporal context, and cost dimensions.
        </motion.p>

        <div className="grid grid-cols-2 gap-6">
          {/* Performance Metrics */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.3 }}
            className="bg-card/50 border-t-4 border-primary p-5 rounded-lg"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="text-3xl">📊</div>
              <div>
                <h3 className="text-xl font-bold text-foreground">Performance Metrics</h3>
                <p className="text-sm text-muted-foreground">5 dimensions</p>
              </div>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• avg_latency</li>
              <li>• p95_latency</li>
              <li>• p99_latency</li>
              <li>• request_rate</li>
              <li>• error_rate</li>
            </ul>
          </motion.div>

          {/* Infrastructure Metrics */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.4 }}
            className="bg-card/50 border-t-4 border-primary p-5 rounded-lg"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="text-3xl">🖥️</div>
              <div>
                <h3 className="text-xl font-bold text-foreground">Infrastructure Metrics</h3>
                <p className="text-sm text-muted-foreground">6 dimensions</p>
              </div>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• aws_cpu_util, aws_mem_util, aws_instance_count</li>
              <li>• gcp_cpu_util, gcp_mem_util, gcp_instance_count</li>
            </ul>
          </motion.div>

          {/* Temporal Context */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.5 }}
            className="bg-card/50 border-t-4 border-primary p-5 rounded-lg"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="text-3xl">🕐</div>
              <div>
                <h3 className="text-xl font-bold text-foreground">Temporal Context</h3>
                <p className="text-sm text-muted-foreground">4 dimensions</p>
              </div>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• time_of_day_sin, time_of_day_cos</li>
              <li>• day_of_week_sin, day_of_week_cos</li>
            </ul>
          </motion.div>

          {/* Cost Information */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.6 }}
            className="bg-card/50 border-t-4 border-primary p-5 rounded-lg"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="text-3xl">💰</div>
              <div>
                <h3 className="text-xl font-bold text-foreground">Cost Information</h3>
                <p className="text-sm text-muted-foreground">2 dimensions</p>
              </div>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• aws_hourly_cost</li>
              <li>• gcp_hourly_cost</li>
            </ul>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
