'use client';

import { useMemo } from 'react';

type SparklineProps = {
  data: number[];
  width?: number;
  height?: number;
  strokeWidth?: number;
  className?: string;
};

export function Sparkline({
  data,
  width = 100,
  height = 32,
  strokeWidth = 1.5,
  className = '',
}: SparklineProps) {
  const path = useMemo(() => {
    if (data.length < 2) return '';
    
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    
    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      return { x, y };
    });
    
    // Create smooth curve using cubic bezier
    let d = `M ${points[0].x} ${points[0].y}`;
    
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const tension = 0.3;
      
      const cp1x = prev.x + (curr.x - prev.x) * tension;
      const cp1y = prev.y;
      const cp2x = curr.x - (curr.x - prev.x) * tension;
      const cp2y = curr.y;
      
      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`;
    }
    
    return d;
  }, [data, width, height]);

  const gradientPath = useMemo(() => {
    if (data.length < 2) return '';
    return `${path} L ${width} ${height} L 0 ${height} Z`;
  }, [path, width, height, data.length]);

  const isPositive = data.length >= 2 && data[data.length - 1] >= data[0];
  const gradientId = `sparkline-gradient-${Math.random().toString(36).slice(2)}`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop
            offset="0%"
            stopColor={isPositive ? 'rgb(16, 185, 129)' : 'rgb(239, 68, 68)'}
            stopOpacity="0.3"
          />
          <stop
            offset="100%"
            stopColor={isPositive ? 'rgb(16, 185, 129)' : 'rgb(239, 68, 68)'}
            stopOpacity="0"
          />
        </linearGradient>
      </defs>
      
      {/* Gradient fill */}
      <path
        d={gradientPath}
        fill={`url(#${gradientId})`}
      />
      
      {/* Line */}
      <path
        d={path}
        fill="none"
        stroke={isPositive ? 'rgb(16, 185, 129)' : 'rgb(239, 68, 68)'}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

