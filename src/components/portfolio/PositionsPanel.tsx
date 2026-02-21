'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Trophy,
  XCircle,
  Loader2,
  ExternalLink,
  Gift,
  ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import usePortfolioValue from '@/hooks/usePortfolioValue';
import useRedeemPosition from '@/hooks/useRedeemPosition';
import type { EnhancedPosition } from '@/types/trading';
import { cn } from '@/lib/utils';

function PositionCard({
  position,
  onClaim,
  isClaiming,
}: {
  position: EnhancedPosition;
  onClaim: (conditionId: string) => void;
  isClaiming: boolean;
}) {
  const pnlPercent =
    position.avgPrice > 0
      ? ((position.currentPrice - position.avgPrice) / position.avgPrice) * 100
      : 0;
  const isPositive = position.pnl >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-xl border border-border/50 p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{position.market}</p>
          <div className="flex items-center gap-2 mt-1">
            <span
              className={cn(
                'text-xs font-semibold px-2 py-0.5 rounded-full',
                position.outcome?.toUpperCase() === 'YES' ||
                  position.outcome?.toLowerCase() === 'yes'
                  ? 'bg-success/10 text-success'
                  : 'bg-danger/10 text-danger'
              )}
            >
              {position.outcome}
            </span>
            {position.resolved && (
              <span
                className={cn(
                  'text-xs font-semibold px-2 py-0.5 rounded-full',
                  position.redeemable
                    ? 'bg-success/10 text-success'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {position.redeemable ? 'Won' : 'Lost'}
              </span>
            )}
          </div>
        </div>

        {position.redeemable ? (
          <Button
            size="sm"
            onClick={() => onClaim(position.conditionId)}
            disabled={isClaiming}
            className="gap-1.5 shrink-0"
          >
            {isClaiming ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Gift className="h-3.5 w-3.5" />
            )}
            Claim ${position.claimableAmount.toFixed(2)}
          </Button>
        ) : null}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
        <div>
          <p className="text-xs text-muted-foreground">Shares</p>
          <p className="text-sm font-semibold">{position.size.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Avg Price</p>
          <p className="text-sm font-semibold">
            {(position.avgPrice * 100).toFixed(1)}¢
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">
            {position.resolved ? 'Final Price' : 'Current'}
          </p>
          <p className="text-sm font-semibold">
            {(position.currentPrice * 100).toFixed(1)}¢
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">P&L</p>
          <div className="flex items-center gap-1">
            {isPositive ? (
              <TrendingUp className="h-3 w-3 text-success" />
            ) : (
              <TrendingDown className="h-3 w-3 text-danger" />
            )}
            <p
              className={cn(
                'text-sm font-semibold',
                isPositive ? 'text-success' : 'text-danger'
              )}
            >
              {isPositive ? '+' : ''}${position.pnl.toFixed(2)}
              <span className="text-xs ml-0.5">
                ({isPositive ? '+' : ''}
                {pnlPercent.toFixed(1)}%)
              </span>
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function PositionsPanel() {
  const { portfolio, isLoading, refetch } = usePortfolioValue();
  const { redeem, isRedeeming, redeemError, lastTxHash, reset } =
    useRedeemPosition();
  const [showResolved, setShowResolved] = useState(true);
  const [claimingId, setClaimingId] = useState<string | null>(null);

  const handleClaim = async (conditionId: string) => {
    setClaimingId(conditionId);
    reset();
    const result = await redeem(conditionId);
    if (result.success) {
      refetch();
    }
    setClaimingId(null);
  };

  const handleClaimAll = async () => {
    reset();
    for (const pos of portfolio.claimablePositions) {
      setClaimingId(pos.conditionId);
      await redeem(pos.conditionId);
    }
    setClaimingId(null);
    refetch();
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-28 bg-card rounded-xl border border-border/50 animate-pulse"
          />
        ))}
      </div>
    );
  }

  const hasActive = portfolio.activePositions.length > 0;
  const hasResolved = portfolio.resolvedPositions.length > 0;
  const hasClaimable = portfolio.claimablePositions.length > 0;
  const hasAny = hasActive || hasResolved;

  if (!hasAny) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-16 text-center"
      >
        <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
          <TrendingUp className="h-7 w-7 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-1">No Positions</h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          Your open and resolved positions will appear here once you start
          trading.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Claimable banner */}
      {hasClaimable && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-success/5 border border-success/20 rounded-xl p-4 flex items-center justify-between gap-3"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center shrink-0">
              <Trophy className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-sm font-semibold">
                {portfolio.claimablePositions.length} winning position
                {portfolio.claimablePositions.length !== 1 ? 's' : ''} to claim
              </p>
              <p className="text-xs text-muted-foreground">
                $
                {portfolio.claimablePositions
                  .reduce((sum, p) => sum + p.claimableAmount, 0)
                  .toFixed(2)}{' '}
                USDC.e available
              </p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={handleClaimAll}
            disabled={isRedeeming}
            className="gap-1.5 shrink-0"
          >
            {isRedeeming ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Gift className="h-3.5 w-3.5" />
            )}
            Claim All
          </Button>
        </motion.div>
      )}

      {redeemError && (
        <div className="bg-danger/5 border border-danger/20 rounded-xl p-3 flex items-center gap-2">
          <XCircle className="h-4 w-4 text-danger shrink-0" />
          <p className="text-sm text-danger">{redeemError}</p>
        </div>
      )}

      {lastTxHash && (
        <div className="bg-success/5 border border-success/20 rounded-xl p-3 flex items-center justify-between gap-2">
          <p className="text-sm text-success">Claim successful!</p>
          <a
            href={`https://polygonscan.com/tx/${lastTxHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-primary hover:underline"
          >
            <ExternalLink className="h-3 w-3" />
            View tx
          </a>
        </div>
      )}

      {/* Active Positions */}
      {hasActive && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Active Positions ({portfolio.activePositions.length})
          </h3>
          {portfolio.activePositions.map((pos, i) => (
            <PositionCard
              key={`${pos.conditionId}-${pos.outcome}-${i}`}
              position={pos}
              onClaim={handleClaim}
              isClaiming={isRedeeming && claimingId === pos.conditionId}
            />
          ))}
        </div>
      )}

      {/* Resolved Positions */}
      {hasResolved && (
        <div className="space-y-3">
          <button
            onClick={() => setShowResolved(!showResolved)}
            className="flex items-center gap-2 w-full"
          >
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Resolved ({portfolio.resolvedPositions.length})
            </h3>
            <ChevronDown
              className={cn(
                'h-4 w-4 text-muted-foreground transition-transform',
                showResolved && 'rotate-180'
              )}
            />
          </button>
          <AnimatePresence>
            {showResolved && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="space-y-3 overflow-hidden"
              >
                {portfolio.resolvedPositions.map((pos, i) => (
                  <PositionCard
                    key={`${pos.conditionId}-${pos.outcome}-${i}`}
                    position={pos}
                    onClaim={handleClaim}
                    isClaiming={isRedeeming && claimingId === pos.conditionId}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
