import { motion } from 'framer-motion';

export default function RLSolutionSlide() {
  const steps = [
    { id: 1, title: 'Observe', desc: 'Monitor system state (CPU, memory, latency, requests)', color: 'primary' },
    { id: 2, title: 'Act', desc: 'Scale resources (add/remove instances)', color: 'accent' },
    { id: 3, title: 'Reward', desc: 'Evaluate performance vs cost trade-off', color: 'chart-3' },
    { id: 4, title: 'Learn', desc: 'Update policy to improve future decisions', color: 'chart-4' },
  ];

  return (
    <div className="w-full h-full flex items-center justify-center p-16 bg-gradient-to-br from-background to-card">
      <div className="max-w-6xl w-full">
        <motion.h1
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="text-5xl font-bold mb-12 text-primary border-l-4 border-accent pl-6 font-['Inter']"
        >
          RL Solution: Learning to Anticipate
        </motion.h1>

        {/* RL Cycle */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 + index * 0.15 }}
              className={`relative bg-card/50 border border-${step.color}/30 p-8 rounded-lg`}
            >
              {/* Step number */}
              <div className={`absolute -top-4 -left-4 w-12 h-12 rounded-full bg-${step.color} flex items-center justify-center text-2xl font-bold text-background`}>
                {step.id}
              </div>

              <h3 className={`text-2xl font-bold text-${step.color} mb-3 font-['Inter']`}>
                {step.title}
              </h3>
              <p className="text-foreground/80 font-['Roboto_Mono'] text-base">
                {step.desc}
              </p>

              {/* Arrow to next step */}
              {index < 3 && (
                <motion.div
                  className="absolute -right-4 top-1/2 transform -translate-y-1/2"
                  animate={{
                    x: [0, 10, 0],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <div className="text-4xl text-primary">→</div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Key advantage */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="bg-accent/10 border-t-4 border-accent p-6 rounded-lg"
        >
          <div className="flex items-center gap-4">
            <div className="text-4xl">⚡</div>
            <div>
              <h3 className="text-xl font-bold text-accent mb-2 font-['Inter']">
                Key Advantage: Proactive vs Reactive
              </h3>
              <p className="text-foreground/90 font-['Roboto_Mono']">
                Traditional auto-scaling reacts to threshold violations. 
                <strong className="text-accent"> RL anticipates workload changes</strong> and scales 
                <strong className="text-accent"> before</strong> performance degrades.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
