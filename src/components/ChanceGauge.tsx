'use client';

import { cn } from '@/lib/utils';

type ChanceGaugeProps = {
  probability: number; // 0-100
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
};

export function ChanceGauge({ 
  probability, 
  size = 'md',
  showLabel = true,
  className 
}: ChanceGaugeProps) {
  // Size configurations
  const sizes = {
    sm: { width: 40, strokeWidth: 3, fontSize: 'text-xs' },
    md: { width: 56, strokeWidth: 4, fontSize: 'text-sm' },
    lg: { width: 72, strokeWidth: 5, fontSize: 'text-base' },
  };

  const config = sizes[size];
  const radius = (config.width - config.strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  // Calculate the arc length based on probability
  // We want a 270-degree arc (3/4 of a circle), starting from bottom-left
  const maxArc = circumference * 0.75; // 270 degrees
  const filledArc = (probability / 100) * maxArc;
  
  // Color based on probability
  const getColor = (prob: number) => {
    if (prob >= 70) return 'text-success stroke-success';
    if (prob >= 40) return 'text-amber-500 stroke-amber-500';
    return 'text-danger stroke-danger';
  };

  const colorClass = getColor(probability);

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg
        width={config.width}
        height={config.width}
        viewBox={`0 0 ${config.width} ${config.width}`}
        className="transform rotate-[135deg]"
      >
        {/* Background arc */}
        <circle
          cx={config.width / 2}
          cy={config.width / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={config.strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${maxArc} ${circumference}`}
          className="text-muted/30"
        />
        {/* Filled arc */}
        <circle
          cx={config.width / 2}
          cy={config.width / 2}
          r={radius}
          fill="none"
          strokeWidth={config.strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${filledArc} ${circumference}`}
          className={cn('transition-all duration-500', colorClass)}
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn('font-bold leading-none', config.fontSize, colorClass.split(' ')[0])}>
            {probability}%
          </span>
          <span className="text-[10px] text-muted-foreground leading-none mt-0.5">
            chance
          </span>
        </div>
      )}
    </div>
  );
}
