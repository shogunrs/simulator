import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  delay?: number;
  variant?: 'default' | 'accent' | 'destructive' | 'primary';
}

export default function GlassCard({ 
  children, 
  className, 
  hover = true, 
  delay = 0,
  variant = 'default'
}: GlassCardProps) {
  const variantStyles = {
    default: 'bg-card/40 border-border hover:border-primary/50',
    accent: 'bg-accent/10 border-accent/30 hover:border-accent',
    destructive: 'bg-destructive/10 border-destructive/30 hover:border-destructive',
    primary: 'bg-primary/10 border-primary/30 hover:border-primary',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={hover ? { scale: 1.02, y: -5 } : {}}
      className={cn(
        'backdrop-blur-md border-2 rounded-xl p-6 transition-all duration-300',
        'shadow-lg hover:shadow-2xl',
        variantStyles[variant],
        className
      )}
    >
      {children}
    </motion.div>
  );
}
