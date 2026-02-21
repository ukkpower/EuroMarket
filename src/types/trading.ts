import type { Position } from "@/hooks/usePortfolioValue";

// Open order from CLOB API
export interface OpenOrder {
  id: string;
  status: string;
  market: string;
  assetId: string;
  side: "BUY" | "SELL";
  price: string;
  originalSize: string;
  sizeMatched: string;
  outcome: string;
  orderType: string;
  expiration: string;
  createdAt: number;
  associateTrades: string[];
}

// Trade (fill) from CLOB API
export interface Trade {
  id: string;
  market: string;
  assetId: string;
  side: "BUY" | "SELL";
  price: string;
  size: string;
  outcome: string;
  timestamp: number;
  feeRateBps: string;
  status: string;
  matchOrderId: string;
  takerOrderId: string;
  transactionHash: string;
}

// Enhanced position with resolution/redemption info
export interface EnhancedPosition extends Position {
  tokenId: string;
  negRisk: boolean;
  resolved: boolean;
  redeemable: boolean;
  claimableAmount: number;
}

// Portfolio data with enhanced positions
export interface EnhancedPortfolioData {
  totalValue: number;
  totalPnl: number;
  positions: EnhancedPosition[];
  positionCount: number;
  activePositions: EnhancedPosition[];
  resolvedPositions: EnhancedPosition[];
  claimablePositions: EnhancedPosition[];
}

export type PortfolioTab = "positions" | "orders" | "history";
