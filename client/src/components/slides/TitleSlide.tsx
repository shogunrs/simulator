import { motion } from 'framer-motion';

export default function TitleSlide() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-background via-background to-card relative overflow-hidden">
      {/* Animated grid background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(oklch(0.70 0.15 195 / 30%) 1px, transparent 1px),
            linear-gradient(90deg, oklch(0.70 0.15 195 / 30%) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }} />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-8 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent font-['Inter']">
            Autonomous Cloud Resource Management
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <h2 className="text-3xl font-semibold text-foreground/90 mb-8 font-['Inter']">
            with Reinforcement Learning
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="h-px w-64 mx-auto bg-gradient-to-r from-transparent via-primary to-transparent mb-8"
        />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="space-y-3 text-muted-foreground font-['Roboto_Mono']"
        >
          <p className="text-lg">Grupo de Estudantes</p>
          <p className="text-sm mt-6 uppercase tracking-wider text-primary">
            Advanced Prescriptive Analytics • Master's Level
          </p>
        </motion.div>

        {/* Animated accent elements */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-primary/10 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-40 h-40 rounded-full bg-accent/10 blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
      </div>
    </div>
  );
}
