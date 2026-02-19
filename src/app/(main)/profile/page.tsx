'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  User,
  Wallet,
  Copy,
  Check,
  ExternalLink,
  LogOut,
  Shield,
  Activity,
  Mail,
  ArrowDownToLine,
  ArrowUpFromLine,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWallet } from '@/providers/WalletContext';
import { useTrading } from '@/providers/TradingProvider';
import BalanceCards from '@/components/profile/BalanceCards';
import DepositDialog from '@/components/profile/DepositDialog';
import WithdrawDialog from '@/components/profile/WithdrawDialog';
import TransactionHistory from '@/components/profile/TransactionHistory';

function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export default function ProfilePage() {
  const router = useRouter();
  const { eoaAddress, isConnected, disconnect, email } = useWallet();
  const {
    safeAddress,
    tradingSession,
    isTradingSessionComplete,
    currentStep,
    initializeTradingSession,
    endTradingSession,
  } = useTrading();

  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);

  // Redirect if not connected
  useEffect(() => {
    if (!isConnected) {
      router.push('/markets');
    }
  }, [isConnected, router]);

  const handleCopy = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleLogout = async () => {
    endTradingSession();
    await disconnect();
    router.push('/markets');
  };

  if (!isConnected || !eoaAddress) {
    return null;
  }

  const hasSafeWallet = !!safeAddress;

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Page Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
            <span className="text-primary-foreground text-xl font-bold">
              {email ? email[0].toUpperCase() : eoaAddress.slice(2, 4).toUpperCase()}
            </span>
          </div>
          <div>
            <h1 className="text-2xl font-bold">Profile</h1>
            <p className="text-sm text-muted-foreground">
              Manage your account, funds, and trading session
            </p>
          </div>
        </div>

        {/* Balance Cards */}
        {hasSafeWallet && <BalanceCards />}

        {/* Deposit / Withdraw Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="grid grid-cols-2 gap-3"
        >
          <Button
            size="lg"
            className="gap-2 h-12"
            onClick={() => setDepositOpen(true)}
            disabled={!hasSafeWallet}
          >
            <ArrowDownToLine className="h-4 w-4" />
            Deposit
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="gap-2 h-12"
            onClick={() => setWithdrawOpen(true)}
            disabled={!hasSafeWallet || !isTradingSessionComplete}
          >
            <ArrowUpFromLine className="h-4 w-4" />
            Withdraw
          </Button>
        </motion.div>

        {!hasSafeWallet && (
          <p className="text-xs text-muted-foreground text-center -mt-3">
            Initialize your trading session below to enable deposits and withdrawals.
          </p>
        )}

        {/* Transaction History */}
        {hasSafeWallet && <TransactionHistory />}

        {/* Account Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-2xl border border-border/50 p-6 space-y-4"
        >
          <div className="flex items-center gap-2 text-lg font-semibold">
            <User className="h-5 w-5 text-primary" />
            Account
          </div>

          {email && (
            <div className="flex items-center justify-between py-3 border-b border-border/30">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                Email
              </div>
              <span className="text-sm font-medium">{email}</span>
            </div>
          )}

          <div className="flex items-center justify-between py-3 border-b border-border/30">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Wallet className="h-4 w-4" />
              EOA Address
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-mono">{truncateAddress(eoaAddress)}</span>
              <button
                onClick={() => handleCopy(eoaAddress, 'eoa')}
                className="p-1 hover:bg-secondary rounded transition-colors"
              >
                {copiedField === 'eoa' ? (
                  <Check className="h-3.5 w-3.5 text-success" />
                ) : (
                  <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4" />
              Login Method
            </div>
            <span className="text-sm font-medium">Magic Link</span>
          </div>
        </motion.div>

        {/* Safe Wallet Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-2xl border border-border/50 p-6 space-y-4"
        >
          <div className="flex items-center gap-2 text-lg font-semibold">
            <Wallet className="h-5 w-5 text-primary" />
            Safe Proxy Wallet
          </div>

          {safeAddress ? (
            <>
              <div className="flex items-center justify-between py-3 border-b border-border/30">
                <div className="text-sm text-muted-foreground">Safe Address</div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono">{truncateAddress(safeAddress)}</span>
                  <button
                    onClick={() => handleCopy(safeAddress, 'safe')}
                    className="p-1 hover:bg-secondary rounded transition-colors"
                  >
                    {copiedField === 'safe' ? (
                      <Check className="h-3.5 w-3.5 text-success" />
                    ) : (
                      <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-border/30">
                <div className="text-sm text-muted-foreground">Deployment Status</div>
                <span className={`text-sm font-medium ${tradingSession?.isSafeDeployed ? 'text-success' : 'text-muted-foreground'}`}>
                  {tradingSession?.isSafeDeployed ? 'Deployed' : 'Not Deployed'}
                </span>
              </div>

              <div className="flex gap-2">
                <a
                  href={`https://polygonscan.com/address/${safeAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  View on Polygonscan
                </a>
                <span className="text-muted-foreground">|</span>
                <a
                  href={`https://polymarket.com/${safeAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Polymarket Profile
                </a>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Safe address will be derived once your trading session is initialized.
            </p>
          )}
        </motion.div>

        {/* Trading Session Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card rounded-2xl border border-border/50 p-6 space-y-4"
        >
          <div className="flex items-center gap-2 text-lg font-semibold">
            <Activity className="h-5 w-5 text-primary" />
            Trading Session
          </div>

          <div className="flex items-center justify-between py-3 border-b border-border/30">
            <div className="text-sm text-muted-foreground">Session Status</div>
            <span className={`text-sm font-medium ${isTradingSessionComplete ? 'text-success' : 'text-muted-foreground'}`}>
              {isTradingSessionComplete ? 'Active' : currentStep !== 'idle' ? 'Initializing...' : 'Not Initialized'}
            </span>
          </div>

          {tradingSession && (
            <>
              <div className="flex items-center justify-between py-3 border-b border-border/30">
                <div className="text-sm text-muted-foreground">API Credentials</div>
                <span className={`text-sm font-medium ${tradingSession.hasApiCredentials ? 'text-success' : 'text-muted-foreground'}`}>
                  {tradingSession.hasApiCredentials ? 'Active' : 'Not Set'}
                </span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-border/30">
                <div className="text-sm text-muted-foreground">Token Approvals</div>
                <span className={`text-sm font-medium ${tradingSession.hasApprovals ? 'text-success' : 'text-muted-foreground'}`}>
                  {tradingSession.hasApprovals ? 'Approved' : 'Not Set'}
                </span>
              </div>
            </>
          )}

          <div className="flex gap-3">
            {!isTradingSessionComplete ? (
              <Button
                onClick={initializeTradingSession}
                disabled={currentStep !== 'idle'}
                className="flex-1"
              >
                {currentStep !== 'idle' && currentStep !== 'complete'
                  ? 'Initializing...'
                  : 'Initialize Trading Session'
                }
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={endTradingSession}
                className="flex-1"
              >
                End Trading Session
              </Button>
            )}
          </div>
        </motion.div>

        {/* Logout */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Button
            variant="outline"
            onClick={handleLogout}
            className="w-full gap-2 text-danger border-danger/20 hover:bg-danger/10 hover:text-danger"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </Button>
        </motion.div>
      </motion.div>

      {/* Dialogs */}
      <DepositDialog open={depositOpen} onOpenChange={setDepositOpen} />
      <WithdrawDialog open={withdrawOpen} onOpenChange={setWithdrawOpen} />
    </div>
  );
}
