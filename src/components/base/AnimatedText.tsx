import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface AnimatedTextProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  type?: 'fade' | 'slide' | 'scale';
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span' | 'div';
}

export default function AnimatedText({ 
  children, 
  className, 
  delay = 0,
  type = 'fade',
  as: Component = 'div'
}: AnimatedTextProps) {
  const animations = {
    fade: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
    },
    slide: {
      initial: { opacity: 0, x: -30 },
      animate: { opacity: 1, x: 0 },
    },
    scale: {
      initial: { opacity: 0, scale: 0.8 },
      animate: { opacity: 1, scale: 1 },
    },
  };

  const MotionComponent = motion[Component as keyof typeof motion] as any;

  return (
    <MotionComponent
      initial={animations[type].initial}
      animate={animations[type].animate}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
      className={cn(className)}
    >
      {children}
    </MotionComponent>
  );
}
