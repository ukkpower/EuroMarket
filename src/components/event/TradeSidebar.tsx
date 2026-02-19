'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, ChevronDown, LogIn, Loader2 } from 'lucide-react';
import { OutcomeSelector } from './OutcomeSelector';
import { AmountInput } from './AmountInput';
import { OrderSummary } from './OrderSummary';
import { useEventStore, calculateTradeEstimate } from '@/store/eventStore';
import { useOrderBook } from '@/hooks/useOrderBook';
import { useWallet } from '@/providers/WalletContext';
import { useTrading } from '@/providers/TradingProvider';
import useClobOrder from '@/hooks/useClobOrder';
import type { ParsedMarket, TradeSide, OrderType } from '@/types/market';
import { cn } from '@/lib/utils';

type TradeSidebarProps = {
  market: ParsedMarket;
};

const STEP_LABELS: Record<string, string> = {
  idle: '',
  checking: 'Checking setup...',
  deploying: 'Deploying Safe wallet...',
  credentials: 'Getting API credentials...',
  approvals: 'Setting token approvals...',
  complete: 'Ready to trade!',
};

export function TradeSidebar({ market }: TradeSidebarProps) {
  const {
    tradeSide,
    selectedOutcome,
    orderType,
    limitPrice,
    amount,
    setTradeSide,
    setSelectedOutcome,
    setOrderType,
    setLimitPrice,
    setAmount,
  } = useEventStore();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { data: orderBook } = useOrderBook(market);

  const { isConnected, connect } = useWallet();
  const {
    isTradingSessionComplete,
    initializeTradingSession,
    currentStep,
    sessionError,
    clobClient,
    safeAddress,
  } = useTrading();

  const { submitOrder, isSubmitting, error: orderError } = useClobOrder(
    clobClient,
    safeAddress
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get current price based on selected outcome and trade side
  const getTradePrice = () => {
    if (!orderBook) {
      return selectedOutcome === 'yes' ? market.yesPrice : market.noPrice;
    }

    if (tradeSide === 'buy') {
      return selectedOutcome === 'yes' ? orderBook.yes.bestAsk : orderBook.no.bestAsk;
    } else {
      return selectedOutcome === 'yes' ? orderBook.yes.bestBid : orderBook.no.bestBid;
    }
  };

  const currentPrice = getTradePrice();
  const effectivePrice = orderType === 'limit' && limitPrice !== null ? limitPrice : currentPrice;

  // Calculate trade estimates
  const estimate = calculateTradeEstimate(amount, effectivePrice, selectedOutcome);

  const isValidTrade = estimate.shares > 0 && estimate.cost > 0;
  const isSessionInitializing = currentStep !== 'idle' && currentStep !== 'complete';

  const handleOrderTypeChange = (type: OrderType) => {
    setOrderType(type);
    setIsDropdownOpen(false);
  };

  const handleSubmitOrder = async () => {
    if (!isTradingSessionComplete || !isValidTrade) return;

    try {
      // We need the token ID for the market
      // The market.id from Polymarket is the condition ID
      // For CLOB orders we need the token ID which maps to the outcome
      await submitOrder({
        tokenId: market.id,
        size: estimate.shares,
        price: effectivePrice,
        side: tradeSide === 'buy' ? 'BUY' : 'SELL',
        isMarketOrder: orderType === 'market',
      });
    } catch (err) {
      console.error('Order submission failed:', err);
    }
  };

  return (
    <div className="w-full lg:w-[340px] shrink-0">
      <div className="lg:fixed lg:top-20 lg:right-6 lg:w-[340px] lg:max-h-[calc(100vh-5rem)] lg:overflow-y-auto lg:z-40">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-card rounded-2xl border border-border/50 p-5 space-y-5"
        >
          {/* Buy/Sell Toggle + Order Type Dropdown */}
          <div className="flex items-center justify-between">
            {/* Buy/Sell Toggle */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setTradeSide('buy')}
                className={cn(
                  'px-3 py-1.5 text-sm font-semibold transition-colors relative',
                  tradeSide === 'buy'
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground/70'
                )}
              >
                Buy
                {tradeSide === 'buy' && (
                  <motion.div
                    layoutId="trade-side-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </button>
              <button
                onClick={() => setTradeSide('sell')}
                className={cn(
                  'px-3 py-1.5 text-sm font-semibold transition-colors relative',
                  tradeSide === 'sell'
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground/70'
                )}
              >
                Sell
                {tradeSide === 'sell' && (
                  <motion.div
                    layoutId="trade-side-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </button>
            </div>

            {/* Order Type Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <span className="capitalize">{orderType}</span>
                <ChevronDown className={cn(
                  'h-4 w-4 transition-transform',
                  isDropdownOpen && 'rotate-180'
                )} />
              </button>

              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-1 z-50 bg-card border border-border rounded-lg shadow-lg overflow-hidden min-w-[100px]"
                  >
                    <button
                      onClick={() => handleOrderTypeChange('market')}
                      className={cn(
                        'w-full px-4 py-2 text-sm text-left hover:bg-secondary/50 transition-colors',
                        orderType === 'market' ? 'text-foreground font-medium' : 'text-muted-foreground'
                      )}
                    >
                      Market
                    </button>
                    <button
                      onClick={() => handleOrderTypeChange('limit')}
                      className={cn(
                        'w-full px-4 py-2 text-sm text-left hover:bg-secondary/50 transition-colors',
                        orderType === 'limit' ? 'text-foreground font-medium' : 'text-muted-foreground'
                      )}
                    >
                      Limit
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Outcome Selector */}
          <OutcomeSelector
            selectedOutcome={selectedOutcome}
            onSelectOutcome={setSelectedOutcome}
            yesPrice={orderBook ? (tradeSide === 'buy' ? orderBook.yes.bestAsk : orderBook.yes.bestBid) : market.yesPrice}
            noPrice={orderBook ? (tradeSide === 'buy' ? orderBook.no.bestAsk : orderBook.no.bestBid) : market.noPrice}
            tradeSide={tradeSide}
          />

          {/* Amount Input */}
          <AmountInput
            amount={amount}
            onChangeAmount={setAmount}
            orderType={orderType}
            limitPrice={limitPrice}
            onChangeLimitPrice={setLimitPrice}
            currentPrice={currentPrice}
          />

          {/* Order Summary */}
          {isValidTrade && (
            <OrderSummary
              outcome={selectedOutcome}
              orderType={orderType}
              shares={estimate.shares}
              averagePrice={effectivePrice}
              totalCost={estimate.cost}
              potentialPayout={estimate.payout}
              tradeSide={tradeSide}
            />
          )}

          {/* Submit / Auth Section */}
          {!isConnected ? (
            // Not logged in - show login button
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={connect}
              className="w-full py-4 rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <LogIn className="h-5 w-5" />
              <span>Log in to trade</span>
            </motion.button>
          ) : !isTradingSessionComplete ? (
            // Logged in but session not initialized
            <div className="space-y-3">
              <motion.button
                whileHover={{ scale: isSessionInitializing ? 1 : 1.02 }}
                whileTap={{ scale: isSessionInitializing ? 1 : 0.98 }}
                onClick={initializeTradingSession}
                disabled={isSessionInitializing}
                className={cn(
                  'w-full py-4 rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-2',
                  isSessionInitializing
                    ? 'bg-secondary text-muted-foreground cursor-wait'
                    : 'bg-primary hover:bg-primary/90 text-primary-foreground'
                )}
              >
                {isSessionInitializing ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>{STEP_LABELS[currentStep]}</span>
                  </>
                ) : (
                  <>
                    <Wallet className="h-5 w-5" />
                    <span>Initialize Trading</span>
                  </>
                )}
              </motion.button>
              {sessionError && (
                <p className="text-center text-xs text-danger">
                  {sessionError.message}
                </p>
              )}
            </div>
          ) : (
            // Trading session complete - show trade button
            <div className="space-y-3">
              <motion.button
                whileHover={{ scale: isValidTrade && !isSubmitting ? 1.02 : 1 }}
                whileTap={{ scale: isValidTrade && !isSubmitting ? 0.98 : 1 }}
                disabled={!isValidTrade || isSubmitting}
                onClick={handleSubmitOrder}
                className={cn(
                  'w-full py-4 rounded-xl font-semibold text-lg transition-all',
                  'flex items-center justify-center gap-2',
                  isSubmitting
                    ? 'bg-secondary text-muted-foreground cursor-wait'
                    : isValidTrade
                      ? selectedOutcome === 'yes'
                        ? 'bg-success hover:bg-success/90 text-success-foreground'
                        : 'bg-danger hover:bg-danger/90 text-danger-foreground'
                      : 'bg-secondary text-muted-foreground cursor-not-allowed'
                )}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Wallet className="h-5 w-5" />
                    <span>
                      {isValidTrade 
                        ? `${tradeSide === 'buy' ? 'Buy' : 'Sell'} ${selectedOutcome === 'yes' ? 'Yes' : 'No'}`
                        : 'Enter Amount'
                      }
                    </span>
                  </>
                )}
              </motion.button>
              {orderError && (
                <p className="text-center text-xs text-danger">
                  {orderError.message}
                </p>
              )}
            </div>
          )}

          {/* Wallet Address Notice */}
          {isConnected && safeAddress && (
            <p className="text-center text-xs text-muted-foreground font-mono">
              Safe: {safeAddress.slice(0, 6)}...{safeAddress.slice(-4)}
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
}

// Skeleton for loading state
export function TradeSidebarSkeleton() {
  return (
    <div className="w-full lg:w-[340px] shrink-0">
      <div className="lg:fixed lg:top-20 lg:right-6 lg:w-[340px] lg:max-h-[calc(100vh-5rem)] lg:overflow-y-auto lg:z-40">
        <div className="bg-card rounded-2xl border border-border/50 p-5 space-y-5">
          {/* Buy/Sell + Order Type skeleton */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <div className="h-6 w-10 bg-secondary animate-pulse rounded" />
              <div className="h-6 w-10 bg-secondary animate-pulse rounded" />
            </div>
            <div className="h-6 w-16 bg-secondary animate-pulse rounded" />
          </div>

          {/* Outcome selector skeleton */}
          <div className="grid grid-cols-2 gap-3">
            <div className="h-14 bg-success/10 animate-pulse rounded-xl" />
            <div className="h-14 bg-secondary animate-pulse rounded-xl" />
          </div>

          {/* Amount skeleton */}
          <div className="space-y-2">
            <div className="h-4 w-14 bg-secondary animate-pulse rounded" />
            <div className="h-14 bg-secondary animate-pulse rounded-xl" />
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex-1 h-10 bg-secondary animate-pulse rounded-lg" />
              ))}
            </div>
          </div>

          {/* Button skeleton */}
          <div className="h-14 bg-secondary animate-pulse rounded-xl" />
        </div>
      </div>
    </div>
  );
}
