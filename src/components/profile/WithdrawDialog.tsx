'use client';

import { useState, useCallback } from 'react';
import {
  ArrowUpFromLine,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import useUsdcBalance from '@/hooks/useUsdcBalance';
import useWithdraw from '@/hooks/useWithdraw';

interface WithdrawDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type WithdrawStep = 'form' | 'confirming' | 'success' | 'error';

export default function WithdrawDialog({ open, onOpenChange }: WithdrawDialogProps) {
  const { balance, refetch: refetchBalance } = useUsdcBalance();
  const { withdraw, isWithdrawing, withdrawError, lastTxHash, reset } = useWithdraw();

  const [toAddress, setToAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [step, setStep] = useState<WithdrawStep>('form');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleClose = useCallback((isOpen: boolean) => {
    if (!isOpen) {
      // Reset state when closing
      setToAddress('');
      setAmount('');
      setStep('form');
      setLocalError(null);
      reset();
    }
    onOpenChange(isOpen);
  }, [onOpenChange, reset]);

  const handleMaxAmount = () => {
    setAmount(balance.value.toString());
  };

  const validateInputs = (): boolean => {
    setLocalError(null);

    if (!toAddress.trim()) {
      setLocalError('Please enter a destination address');
      return false;
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(toAddress.trim())) {
      setLocalError('Invalid Ethereum address format');
      return false;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setLocalError('Please enter a valid amount greater than 0');
      return false;
    }

    if (numAmount > balance.value) {
      setLocalError(`Insufficient balance. Available: $${balance.formatted} USDC`);
      return false;
    }

    return true;
  };

  const handleWithdraw = async () => {
    if (!validateInputs()) return;

    setStep('confirming');
    const result = await withdraw(toAddress.trim(), parseFloat(amount));

    if (result.success) {
      setStep('success');
      refetchBalance();
    } else {
      setStep('error');
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowUpFromLine className="h-5 w-5 text-danger" />
            Withdraw Crypto
          </DialogTitle>
          <DialogDescription>
            Send USDC.e from your Safe wallet to an external address.
          </DialogDescription>
        </DialogHeader>

        {step === 'form' && (
          <div className="space-y-4 mt-2">
            {/* Destination Address */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Destination Address
              </label>
              <Input
                placeholder="0x..."
                value={toAddress}
                onChange={(e) => setToAddress(e.target.value)}
                className="font-mono text-sm"
              />
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">
                  Amount (USDC)
                </label>
                <button
                  onClick={handleMaxAmount}
                  className="text-xs text-primary hover:underline font-medium"
                >
                  Max: ${balance.formatted}
                </button>
              </div>
              <div className="relative">
                <Input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="0"
                  step="0.01"
                  className="pr-16"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">
                  USDC
                </div>
              </div>
            </div>

            {/* Available Balance */}
            <div className="flex items-center justify-between text-sm py-2 border-t border-border/30">
              <span className="text-muted-foreground">Available Balance</span>
              <span className="font-medium">${balance.formatted} USDC</span>
            </div>

            {/* Fee Note */}
            <p className="text-xs text-muted-foreground">
              Withdrawals are processed as meta-transactions through your Safe wallet. 
              Network fees are subsidized by the relayer.
            </p>

            {/* Error */}
            {(localError || withdrawError) && (
              <div className="flex gap-2 bg-danger/10 border border-danger/20 rounded-xl p-3">
                <AlertCircle className="h-4 w-4 text-danger shrink-0 mt-0.5" />
                <p className="text-xs text-danger">
                  {localError || withdrawError}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => handleClose(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleWithdraw}
                disabled={!toAddress || !amount}
              >
                Withdraw
              </Button>
            </div>
          </div>
        )}

        {step === 'confirming' && (
          <div className="flex flex-col items-center justify-center py-10 space-y-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <div className="text-center">
              <p className="font-medium">Processing Withdrawal</p>
              <p className="text-sm text-muted-foreground mt-1">
                Sending {parseFloat(amount).toFixed(2)} USDC to {toAddress.slice(0, 6)}...{toAddress.slice(-4)}
              </p>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="flex flex-col items-center justify-center py-10 space-y-4">
            <CheckCircle2 className="h-12 w-12 text-success" />
            <div className="text-center">
              <p className="font-medium text-success">Withdrawal Successful</p>
              <p className="text-sm text-muted-foreground mt-1">
                {parseFloat(amount).toFixed(2)} USDC sent successfully.
              </p>
            </div>
            {lastTxHash && (
              <a
                href={`https://polygonscan.com/tx/${lastTxHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-primary hover:underline"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                View on Polygonscan
              </a>
            )}
            <Button
              variant="outline"
              className="w-full mt-2"
              onClick={() => handleClose(false)}
            >
              Done
            </Button>
          </div>
        )}

        {step === 'error' && (
          <div className="flex flex-col items-center justify-center py-10 space-y-4">
            <AlertCircle className="h-12 w-12 text-danger" />
            <div className="text-center">
              <p className="font-medium text-danger">Withdrawal Failed</p>
              <p className="text-sm text-muted-foreground mt-1">
                {withdrawError || 'An unexpected error occurred.'}
              </p>
            </div>
            <div className="flex gap-3 w-full mt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => handleClose(false)}
              >
                Close
              </Button>
              <Button
                className="flex-1"
                onClick={() => {
                  reset();
                  setStep('form');
                }}
              >
                Try Again
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
