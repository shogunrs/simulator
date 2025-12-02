import { motion } from 'framer-motion';

export default function ThankYouSlide() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-background via-background to-card">
      <div className="text-center">
        <motion.h1
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent"
        >
          Thank You
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-2xl text-accent mb-12"
        >
          Questions & Discussion
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-muted-foreground"
        >
          <p className="text-lg mb-2">[Student Name 1] • [Student Name 2]</p>
          <p className="text-lg mb-6">[Student Name 3] • [Student Name 4]</p>
          <p className="text-sm uppercase tracking-wider text-primary">
            Advanced Topics in Prescriptive Analytics
          </p>
        </motion.div>
      </div>
    </div>
  );
}
