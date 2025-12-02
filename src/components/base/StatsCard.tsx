import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import GlassCard from './GlassCard';

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  delay?: number;
  variant?: 'default' | 'accent' | 'destructive' | 'primary';
}

export default function StatsCard({
  icon: Icon,
  label,
  value,
  trend,
  trendValue,
  delay = 0,
  variant = 'default',
}: StatsCardProps) {
  const trendColors = {
    up: 'text-accent',
    down: 'text-destructive',
    neutral: 'text-muted-foreground',
  };

  return (
    <GlassCard delay={delay} variant={variant} className="relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-50" />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className={cn(
            'p-3 rounded-lg',
            variant === 'accent' && 'bg-accent/20',
            variant === 'destructive' && 'bg-destructive/20',
            variant === 'primary' && 'bg-primary/20',
            variant === 'default' && 'bg-primary/10'
          )}>
            <Icon className={cn(
              'w-6 h-6',
              variant === 'accent' && 'text-accent',
              variant === 'destructive' && 'text-destructive',
              variant === 'primary' && 'text-primary',
              variant === 'default' && 'text-foreground'
            )} />
          </div>
          {trend && trendValue && (
            <div className={cn('text-sm font-semibold', trendColors[trend])}>
              {trend === 'up' && '↑'} {trend === 'down' && '↓'} {trendValue}
            </div>
          )}
        </div>

        <div className="space-y-1">
          <div className="text-sm text-muted-foreground">{label}</div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: delay + 0.2, type: 'spring' }}
            className="text-3xl font-bold text-foreground"
          >
            {value}
          </motion.div>
        </div>
      </div>
    </GlassCard>
  );
}
