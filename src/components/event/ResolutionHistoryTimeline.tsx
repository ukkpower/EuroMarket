'use client';

import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Check, Gavel } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MarketResolutionStep } from '@/types/market';

type ResolutionHistoryTimelineProps = {
  steps: MarketResolutionStep[];
  resolutionRequestId?: string;
};

type MarketResolutionData = {
  lastUpdateTimestamp?: string;
  status?: string;
};

async function fetchMarketResolutionData(
  resolutionRequestId: string
): Promise<MarketResolutionData | null> {
  const url = `/api/polymarket/resolution/${encodeURIComponent(
    resolutionRequestId
  )}`;

  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as {
    data?: MarketResolutionData | null;
  };
  return payload.data ?? null;
}

function parseDate(value?: string): Date | null {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function getDisputedFinalReviewDeadline(lastUpdateTimestamp?: string): Date | null {
  const numericTimestamp = Number.parseFloat(lastUpdateTimestamp ?? '');
  if (!Number.isFinite(numericTimestamp)) return null;

  // Mirror Polymarket's final review window math for disputed states.
  const reviewEndTimestampSeconds =
    numericTimestamp +
    (86400 - (numericTimestamp % 86400)) +
    172800;

  return parseDate(new Date(reviewEndTimestampSeconds * 1000).toISOString());
}

function formatCountdown(diffMs: number): string {
  if (diffMs <= 0) return '0s';

  const totalSeconds = Math.floor(diffMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours}h ${minutes}m ${seconds}s`;
}

function getCurrentStepIndex(steps: MarketResolutionStep[]): number {
  const explicitCurrent = steps.findIndex((step) => step.isCurrent);
  return explicitCurrent >= 0 ? explicitCurrent : steps.length - 1;
}

function ResolutionStepIcon({
  step,
  isCurrent,
}: {
  step: MarketResolutionStep;
  isCurrent: boolean;
}) {
  if (isCurrent) {
    return (
      <div className="flex h-9 w-9 items-center justify-center rounded-full border-[3px] border-primary bg-background" />
    );
  }

  if (step.kind === 'disputed') {
    return (
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-muted-foreground">
        <Gavel className="h-4 w-4" />
      </div>
    );
  }

  return (
    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
      <Check className="h-4 w-4" />
    </div>
  );
}

export function ResolutionHistoryTimeline({
  steps,
  resolutionRequestId,
}: ResolutionHistoryTimelineProps) {
  const [now, setNow] = useState<number | null>(null);
  const { data: resolutionData } = useQuery({
    queryKey: ['market-resolution-data', resolutionRequestId],
    queryFn: () => fetchMarketResolutionData(resolutionRequestId!),
    enabled: Boolean(resolutionRequestId),
    staleTime: 60 * 1000,
  });
  const currentIndex = useMemo(() => getCurrentStepIndex(steps), [steps]);
  const currentStep = steps[currentIndex];
  const disputedFinalReviewDeadline = useMemo(() => {
    if (resolutionData?.status !== 'disputed') {
      return null;
    }
    return getDisputedFinalReviewDeadline(resolutionData.lastUpdateTimestamp);
  }, [resolutionData]);
  const currentDeadline = useMemo(() => {
    if (currentStep?.kind !== 'final_review') {
      return null;
    }
    return disputedFinalReviewDeadline || parseDate(currentStep.endsAt);
  }, [currentStep, disputedFinalReviewDeadline]);

  useEffect(() => {
    if (!currentDeadline) return;

    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(timer);
  }, [currentDeadline]);

  if (steps.length === 0) {
    return null;
  }

  return (
    <div className="pl-1">
      {steps.map((step, index) => {
        const isCurrent = index === currentIndex;
        const isPast = index < currentIndex;
        const showCountdown = isCurrent && currentDeadline && now !== null;
        const countdown = showCountdown
          ? formatCountdown(currentDeadline.getTime() - now)
          : null;

        return (
          <div key={`${step.label}-${index}`} className="flex items-start gap-3">
            <div className="flex w-10 flex-col items-center">
              <ResolutionStepIcon step={step} isCurrent={isCurrent} />
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'h-7 w-0.5',
                    isPast ? 'bg-primary' : 'bg-border'
                  )}
                />
              )}
            </div>

            <div className="flex min-h-9 items-center gap-2 pt-1">
              <p
                className={cn(
                  'text-base font-medium',
                  isCurrent ? 'text-foreground' : 'text-foreground/90'
                )}
              >
                {step.label}
              </p>
              {countdown && (
                <p className="text-base font-medium tabular-nums text-primary">
                  {countdown}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
