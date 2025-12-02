import { motion } from 'framer-motion';

export default function ResultsMetricsSlide() {
  const results = [
    { method: 'RL Agent', cost: '$0.4071', sla: '7.1', cpu: '39.0%', latency: '76.1ms', best: true },
    { method: 'Rule-Based', cost: '$0.2730', sla: '29.1', cpu: '52.5%', latency: '85.2ms', best: false },
    { method: 'Adaptive', cost: '$0.2878', sla: '26.3', cpu: '49.5%', latency: '82.0ms', best: false },
  ];

  return (
    <div className="w-full h-full flex items-center justify-center p-12 bg-gradient-to-br from-background to-card">
      <div className="max-w-6xl w-full">
        <motion.h1 initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} className="text-4xl font-bold mb-8 text-primary border-l-4 border-accent pl-6">
          Results: Performance Comparison
        </motion.h1>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="overflow-hidden rounded-lg border border-primary/30">
          <table className="w-full">
            <thead className="bg-primary/20">
              <tr>
                <th className="p-4 text-left">Method</th>
                <th className="p-4 text-center">Cost</th>
                <th className="p-4 text-center">SLA Violations</th>
                <th className="p-4 text-center">CPU Util</th>
                <th className="p-4 text-center">Latency</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r, i) => (
                <motion.tr
                  key={i}
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className={r.best ? 'bg-accent/10' : 'bg-card/30'}
                >
                  <td className="p-4 font-bold">{r.method}</td>
                  <td className="p-4 text-center">{r.cost}</td>
                  <td className="p-4 text-center font-bold text-accent">{r.sla}</td>
                  <td className="p-4 text-center">{r.cpu}</td>
                  <td className="p-4 text-center">{r.latency}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </div>
    </div>
  );
}
