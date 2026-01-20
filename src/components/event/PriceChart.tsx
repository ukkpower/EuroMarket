'use client';

import { useState, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeftRight } from 'lucide-react';
import type { ParsedMarket } from '@/types/market';
import { cn, formatPrice } from '@/lib/utils';
import { usePriceHistory, type PriceHistoryInterval } from '@/hooks/usePriceHistory';

type PriceChartProps = {
  market: ParsedMarket;
};

type Timeframe = '1H' | '6H' | '1D' | '1W' | '1M' | 'All';

const TIMEFRAMES: Timeframe[] = ['1H', '6H', '1D', '1W', '1M', 'All'];

// Map UI timeframe to API interval
function timeframeToInterval(timeframe: Timeframe): PriceHistoryInterval {
  const map: Record<Timeframe, PriceHistoryInterval> = {
    '1H': '1h',
    '6H': '6h',
    '1D': '1d',
    '1W': '1w',
    '1M': '1m', // API supports 1m for month
    'All': 'max',
  };
  return map[timeframe];
}

// Convert price history to chart data format
function convertPriceHistory(
  history: { t: number; p: number }[],
  outcome: 'yes' | 'no'
): { time: number; price: number }[] {
  return history.map((point) => ({
    time: point.t * 1000, // Convert to milliseconds
    price: point.p,
  })).sort((a, b) => a.time - b.time);
}

// Format time label based on timeframe
function formatTimeLabel(timestamp: number, timeframe: Timeframe): string {
  const date = new Date(timestamp);
  
  switch (timeframe) {
    case '1H':
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    case '6H':
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    case '1D':
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    case '1W':
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    case '1M':
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    case 'All':
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
    default:
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
  }
}

// Get time interval step in milliseconds based on timeframe
function getTimeIntervalStep(timeframe: Timeframe): number {
  switch (timeframe) {
    case '1H':
      return 10 * 60 * 1000; // 10 minutes
    case '6H':
      return 60 * 60 * 1000; // 1 hour
    case '1D':
      return 4 * 60 * 60 * 1000; // 4 hours
    case '1W':
      return 24 * 60 * 60 * 1000; // 1 day
    case '1M':
      return 7 * 24 * 60 * 60 * 1000; // 1 week
    case 'All':
      return 7 * 24 * 60 * 60 * 1000; // 1 week (default for All)
    default:
      return 60 * 60 * 1000; // 1 hour default
  }
}

export function PriceChart({ market }: PriceChartProps) {
  const [timeframe, setTimeframe] = useState<Timeframe>('1D');
  const [selectedOutcome, setSelectedOutcome] = useState<'yes' | 'no'>('yes');
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const interval = timeframeToInterval(timeframe);

  // Fetch price history for the selected outcome only
  const { data: historyData, isLoading, isError } = usePriceHistory(
    market.id,
    selectedOutcome,
    interval
  );

  // Convert price history to chart data
  const data = useMemo(() => {
    if (!historyData?.history || historyData.history.length === 0) {
      // Fallback to current price if no history available
      return [{
        time: Date.now(),
        price: selectedOutcome === 'yes' ? market.yesPrice : market.noPrice,
      }];
    }

    return convertPriceHistory(historyData.history, selectedOutcome);
  }, [historyData, selectedOutcome, market.yesPrice, market.noPrice]);

  // Chart dimensions - using absolute pixels like Polymarket
  const chartWidthPx = 900; // Fixed pixel width
  const chartHeightPx = 200; // Fixed pixel height
  const padding = { top: 20, right: 50, bottom: 40, left: 50 };
  const plotWidth = chartWidthPx - padding.left - padding.right;
  const plotHeight = chartHeightPx - padding.top - padding.bottom;

  // Calculate time range
  const timeRange = useMemo(() => {
    if (data.length === 0) {
      const now = Date.now();
      return { min: now - 24 * 60 * 60 * 1000, max: now };
    }
    const times = data.map(d => d.time);
    return { min: Math.min(...times), max: Math.max(...times) };
  }, [data]);

  const timeSpan = timeRange.max - timeRange.min;

  // Scale functions
  const yMin = useMemo(() => {
    if (data.length === 0) return 0;
    return Math.max(0, Math.min(...data.map(d => d.price)) * 0.95);
  }, [data]);
  
  const yMax = useMemo(() => {
    if (data.length === 0) return 1;
    return Math.min(1, Math.max(...data.map(d => d.price)) * 1.05);
  }, [data]);
  
  const yRange = yMax - yMin;

  // Get X coordinate in pixels based on time
  const getX = (time: number): number => {
    if (timeSpan === 0) return padding.left;
    const normalized = (time - timeRange.min) / timeSpan;
    return padding.left + normalized * plotWidth;
  };
  
  // Get Y coordinate in pixels
  const getY = (price: number): number => {
    if (!isFinite(price) || !isFinite(yMin) || !isFinite(yMax) || yRange === 0) {
      return padding.top + plotHeight / 2; // Return middle if invalid
    }
    const normalized = (price - yMin) / yRange;
    return padding.top + (1 - normalized) * plotHeight;
  };

  // Generate time labels for X-axis with proper spacing to avoid overlap
  const timeLabels = useMemo(() => {
    if (timeSpan === 0) return [];
    
    const step = getTimeIntervalStep(timeframe);
    const labels: { time: number; x: number; label: string }[] = [];
    
    // Start from the minimum time, rounded down to the nearest interval
    const startTime = Math.floor(timeRange.min / step) * step;
    
    // Minimum spacing between labels in pixels to avoid overlap
    const minLabelSpacing = 80;
    let lastX = -Infinity;
    
    // Generate labels
    for (let time = startTime; time <= timeRange.max + step; time += step) {
      const x = getX(time);
      // Only add label if it's within the visible chart bounds and has enough spacing
      if (x >= padding.left && x <= padding.left + plotWidth && x - lastX >= minLabelSpacing) {
        labels.push({
          time,
          x,
          label: formatTimeLabel(time, timeframe),
        });
        lastX = x;
      }
    }
    
    return labels;
  }, [timeRange, timeframe, timeSpan, padding.left, plotWidth]);

  // Generate Y-axis labels (percentages)
  const yLabels = useMemo(() => {
    const labels: { price: number; y: number; label: string; index: number }[] = [];
    const steps = 5; // Number of labels
    
    for (let i = 0; i <= steps; i++) {
      const ratio = i / steps;
      const price = yMin + ratio * yRange;
      labels.push({
        price,
        y: getY(price),
        label: `${(price * 100).toFixed(1)}%`,
        index: i,
      });
    }
    
    return labels;
  }, [yMin, yMax, yRange, padding.top, plotHeight]);

  // Generate path string using time-based coordinates
  const pricePath = useMemo(() => {
    if (data.length === 0) return '';
    
    return data
      .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(d.time)} ${getY(d.price)}`)
      .join(' ');
  }, [data, timeRange, timeSpan, padding.left, plotWidth, padding.top, plotHeight, yMin, yMax, yRange]);

  // Generate path for line after hover point (light grey)
  const pricePathAfterHover = useMemo(() => {
    if (hoveredPoint === null || hoveredPoint < 0 || hoveredPoint >= data.length) {
      return '';
    }
    
    const hoveredTime = data[hoveredPoint].time;
    const afterData = data.filter(d => d.time > hoveredTime);
    
    if (afterData.length === 0) return '';
    
    return afterData
      .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(d.time)} ${getY(d.price)}`)
      .join(' ');
  }, [data, hoveredPoint, timeRange, timeSpan, padding.left, plotWidth, padding.top, plotHeight, yMin, yMax, yRange]);

  // Current hovered data point
  const hoveredData = hoveredPoint !== null && hoveredPoint >= 0 && hoveredPoint < data.length 
    ? data[hoveredPoint] 
    : null;

  // Find closest data point to mouse X position
  const findClosestPoint = (mouseX: number): number | null => {
    if (data.length === 0 || !svgRef.current) return null;
    
    // Convert mouse X to pixel coordinate
    const svgRect = svgRef.current.getBoundingClientRect();
    const relativeX = mouseX - svgRect.left;
    const pixelX = (relativeX / svgRect.width) * chartWidthPx;
    
    // Only consider points within the chart area
    if (pixelX < padding.left || pixelX > padding.left + plotWidth) {
      return null;
    }
    
    // Convert pixel X back to time
    const normalizedX = (pixelX - padding.left) / plotWidth;
    const hoverTime = timeRange.min + normalizedX * timeSpan;
    
    // Find closest data point by time
    let closestIndex = 0;
    let minDistance = Infinity;
    
    data.forEach((d, i) => {
      const distance = Math.abs(d.time - hoverTime);
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = i;
      }
    });
    
    return closestIndex;
  };

  // Show loading state
  if (isLoading) {
    return <PriceChartSkeleton />;
  }

  // Show error state (but still render chart with current prices)
  if (isError && data.length === 0) {
    return (
      <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
          <h3 className="font-semibold text-sm text-foreground">Price History</h3>
        </div>
        <div className="px-4 py-8 text-center text-sm text-muted-foreground">
          Unable to load price history. The market may not be CLOB-enabled.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
        <h3 className="font-semibold text-sm text-foreground">Price History</h3>
        
        <div className="flex items-center gap-2">
          {/* Outcome Toggle */}
          <button
            onClick={() => setSelectedOutcome(selectedOutcome === 'yes' ? 'no' : 'yes')}
            className={cn(
              'p-1.5 rounded-lg transition-all hover:bg-secondary',
              'text-muted-foreground hover:text-foreground'
            )}
            title={`Switch to ${selectedOutcome === 'yes' ? 'No' : 'Yes'}`}
          >
            <ArrowLeftRight className="h-4 w-4" />
          </button>
          
          {/* Timeframe Selector */}
          <div className="flex items-center gap-1 bg-secondary rounded-lg p-1">
            {TIMEFRAMES.map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={cn(
                  'px-2 py-1 text-xs font-medium rounded transition-all',
                  timeframe === tf
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Price Display */}
      <div className="flex items-center justify-between px-4 py-2 text-sm">
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-3 h-3 rounded-full",
            selectedOutcome === 'yes' ? 'bg-success' : 'bg-danger'
          )} />
          <span className="text-muted-foreground capitalize">{selectedOutcome}:</span>
          <span className={cn(
            "font-semibold",
            selectedOutcome === 'yes' ? 'text-success' : 'text-danger'
          )}>
            {hoveredData 
              ? formatPrice(hoveredData.price) 
              : formatPrice(selectedOutcome === 'yes' ? market.yesPrice : market.noPrice)}¢
          </span>
        </div>
        {hoveredData && (
          <span className="text-xs text-muted-foreground">
            {new Date(hoveredData.time).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}{' '}
            {new Date(hoveredData.time).toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true,
            })}
          </span>
        )}
      </div>

      {/* Chart */}
      <div 
        className="relative px-4 pb-4"
        onMouseLeave={() => setHoveredPoint(null)}
      >
        <svg
          ref={svgRef}
          width={chartWidthPx}
          height={chartHeightPx}
          className="w-full"
          style={{ height: `${chartHeightPx}px` }}
          viewBox={`0 0 ${chartWidthPx} ${chartHeightPx}`}
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Grid lines - horizontal */}
          {yLabels.map((label) => (
            <line
              key={`grid-${label.index}`}
              x1={padding.left}
              y1={label.y}
              x2={padding.left + plotWidth}
              y2={label.y}
              stroke="currentColor"
              strokeOpacity={0.1}
              strokeDasharray="4 4"
              vectorEffect="non-scaling-stroke"
            />
          ))}

          {/* Price line - full color (before hover point) */}
          {hoveredPoint !== null && hoveredPoint >= 0 && hoveredPoint < data.length ? (
            <>
              <path
                d={data
                  .filter(d => d.time <= data[hoveredPoint].time)
                  .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(d.time)} ${getY(d.price)}`)
                  .join(' ')}
                fill="none"
                stroke={selectedOutcome === 'yes' ? 'var(--color-success)' : 'var(--color-danger)'}
                strokeWidth={2}
                vectorEffect="non-scaling-stroke"
              />
              {/* Price line - light grey (after hover point) */}
              {pricePathAfterHover && (
                <path
                  d={pricePathAfterHover}
                  fill="none"
                  stroke={selectedOutcome === 'yes' ? 'var(--color-success)' : 'var(--color-danger)'}
                  strokeWidth={2}
                  strokeOpacity={0.3}
                  vectorEffect="non-scaling-stroke"
                />
              )}
            </>
          ) : (
            <motion.path
              d={pricePath}
              fill="none"
              stroke={selectedOutcome === 'yes' ? 'var(--color-success)' : 'var(--color-danger)'}
              strokeWidth={2}
              vectorEffect="non-scaling-stroke"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5 }}
            />
          )}

          {/* Y-axis labels (percentages on the right) */}
          {yLabels.map((label) => (
            <text
              key={`y-label-${label.index}`}
              x={padding.left + plotWidth + 8}
              y={label.y + 4}
              fontSize="12"
              fill="currentColor"
              fillOpacity={0.6}
              textAnchor="start"
              fontFamily="Arial"
            >
              {label.label}
            </text>
          ))}

          {/* X-axis labels (time intervals at bottom) */}
          {timeLabels.map((label) => (
            <text
              key={label.time}
              x={label.x}
              y={chartHeightPx - padding.bottom + 15}
              fontSize="12"
              fill="currentColor"
              fillOpacity={0.6}
              textAnchor="middle"
              fontFamily="Arial"
            >
              {label.label}
            </text>
          ))}

          {/* Invisible hover area covering entire chart */}
          <rect
            x={padding.left}
            y={padding.top}
            width={plotWidth}
            height={plotHeight}
            fill="transparent"
            onMouseMove={(e) => {
              const point = findClosestPoint(e.clientX);
              setHoveredPoint(point);
            }}
          />

          {/* Hover indicator */}
          {hoveredPoint !== null && 
           hoveredPoint >= 0 && 
           hoveredPoint < data.length && 
           data[hoveredPoint] && (
            <>
              {/* Vertical hover line */}
              <line
                x1={getX(data[hoveredPoint].time)}
                y1={padding.top}
                x2={getX(data[hoveredPoint].time)}
                y2={padding.top + plotHeight}
                stroke="currentColor"
                strokeOpacity={0.3}
                strokeWidth={1}
                vectorEffect="non-scaling-stroke"
              />
              {/* Small hover dot - fixed pixel size like Polymarket */}
              <circle
                cx={getX(data[hoveredPoint].time)}
                cy={getY(data[hoveredPoint].price)}
                r={4}
                fill={selectedOutcome === 'yes' ? 'var(--color-success)' : 'var(--color-danger)'}
                stroke="white"
                strokeWidth={2}
                style={{ transform: 'none', transformOrigin: '50% 50%' }}
              />
              {/* Tooltip at top */}
              <text
                x={getX(data[hoveredPoint].time)}
                y={padding.top - 8}
                fontSize="11"
                fill="currentColor"
                fillOpacity={0.7}
                textAnchor="middle"
                fontFamily="Arial"
              >
                {new Date(data[hoveredPoint].time).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}{' '}
                {new Date(data[hoveredPoint].time).toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true,
                })}
              </text>
              {/* Tooltip next to dot */}
              <rect
                x={getX(data[hoveredPoint].time) + 8}
                y={getY(data[hoveredPoint].price) - 10}
                width={50}
                height={20}
                fill={selectedOutcome === 'yes' ? 'var(--color-success)' : 'var(--color-danger)'}
                rx={4}
              />
              <text
                x={getX(data[hoveredPoint].time) + 33}
                y={getY(data[hoveredPoint].price) + 5}
                fontSize="11"
                fill="white"
                textAnchor="middle"
                fontWeight="500"
                fontFamily="Arial"
              >
                {selectedOutcome === 'yes' ? 'Yes' : 'No'} {formatPrice(data[hoveredPoint].price)}%
              </text>
            </>
          )}
        </svg>
      </div>
    </div>
  );
}

// Skeleton for loading state
export function PriceChartSkeleton() {
  return (
    <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
      {/* Header skeleton */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
        <div className="h-5 w-24 bg-secondary animate-pulse rounded" />
        <div className="h-8 w-48 bg-secondary animate-pulse rounded-lg" />
      </div>

      {/* Price display skeleton */}
      <div className="flex items-center gap-6 px-4 py-2">
        <div className="h-5 w-24 bg-secondary animate-pulse rounded" />
        <div className="h-5 w-24 bg-secondary animate-pulse rounded" />
      </div>

      {/* Chart skeleton */}
      <div className="px-4 pb-4">
        <div className="h-[200px] bg-secondary/30 animate-pulse rounded-lg" />
      </div>
    </div>
  );
}
