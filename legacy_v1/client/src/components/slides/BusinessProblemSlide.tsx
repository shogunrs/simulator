import { motion } from 'framer-motion';

export default function BusinessProblemSlide() {
  return (
    <div className="w-full h-full flex items-center justify-center p-16 bg-gradient-to-br from-background to-card">
      <div className="max-w-6xl w-full">
        <motion.h1
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="text-5xl font-bold mb-12 text-primary border-l-4 border-accent pl-6 font-['Inter']"
        >
          The Challenge: Auto-Scaling in Multicloud
        </motion.h1>

        <div className="grid grid-cols-2 gap-8">
          {/* Business Problem */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-card/50 border border-primary/30 p-8 rounded-lg"
          >
            <h2 className="text-2xl font-semibold text-accent mb-6 font-['Inter']">Business Problem</h2>
            <ul className="space-y-4 text-foreground/90 font-['Roboto_Mono'] text-lg">
              <motion.li
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="flex items-start"
              >
                <span className="text-primary mr-3">▸</span>
                <span>Dynamic workloads with unpredictable traffic patterns</span>
              </motion.li>
              <motion.li
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="flex items-start"
              >
                <span className="text-primary mr-3">▸</span>
                <span>Multicloud complexity (AWS + GCP heterogeneity)</span>
              </motion.li>
              <motion.li
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
                className="flex items-start"
              >
                <span className="text-primary mr-3">▸</span>
                <span>Performance vs cost trade-off optimization</span>
              </motion.li>
            </ul>
          </motion.div>

          {/* Traditional Limitations */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-card/50 border border-destructive/30 p-8 rounded-lg"
          >
            <h2 className="text-2xl font-semibold text-destructive mb-6 font-['Inter']">Traditional Limitations</h2>
            <ul className="space-y-4 text-foreground/90 font-['Roboto_Mono'] text-lg">
              <motion.li
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="flex items-start"
              >
                <span className="text-destructive mr-3">✗</span>
                <span><strong>Reactive:</strong> Scales after violations occur</span>
              </motion.li>
              <motion.li
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
                className="flex items-start"
              >
                <span className="text-destructive mr-3">✗</span>
                <span><strong>Manual tuning:</strong> Requires domain expertise</span>
              </motion.li>
              <motion.li
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 }}
                className="flex items-start"
              >
                <span className="text-destructive mr-3">✗</span>
                <span><strong>No anticipation:</strong> Cannot predict workload changes</span>
              </motion.li>
            </ul>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
