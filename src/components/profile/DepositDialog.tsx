'use client';

import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Check, ArrowDownToLine, AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useTrading } from '@/providers/TradingProvider';
import useUsdcBalance from '@/hooks/useUsdcBalance';

interface DepositDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function DepositDialog({ open, onOpenChange }: DepositDialogProps) {
  const { safeAddress } = useTrading();
  const { balance } = useUsdcBalance();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!safeAddress) return;
    await navigator.clipboard.writeText(safeAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowDownToLine className="h-5 w-5 text-success" />
            Deposit Crypto
          </DialogTitle>
          <DialogDescription>
            Send USDC.e to your Safe wallet on the Polygon network.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          {/* QR Code */}
          {safeAddress && (
            <div className="flex justify-center">
              <div className="bg-white p-4 rounded-xl">
                <QRCodeSVG
                  value={safeAddress}
                  size={180}
                  level="H"
                  includeMargin={false}
                />
              </div>
            </div>
          )}

          {/* Address */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Your Deposit Address
            </label>
            <div className="flex items-center gap-2 bg-secondary/50 rounded-xl p-3">
              <code className="text-xs font-mono flex-1 break-all select-all">
                {safeAddress}
              </code>
              <button
                onClick={handleCopy}
                className="shrink-0 p-2 hover:bg-secondary rounded-lg transition-colors"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-success" />
                ) : (
                  <Copy className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
            </div>
          </div>

          {/* Network Badge */}
          <div className="flex items-center gap-2 bg-primary/5 border border-primary/10 rounded-xl p-3">
            <div className="w-6 h-6 rounded-full bg-[#8247E5] flex items-center justify-center shrink-0">
              <span className="text-white text-xs font-bold">P</span>
            </div>
            <div className="text-sm">
              <span className="font-medium">Polygon Network</span>
              <span className="text-muted-foreground"> &middot; USDC.e only</span>
            </div>
          </div>

          {/* Warning */}
          <div className="flex gap-2 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
            <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700 dark:text-amber-400">
              Only send <strong>USDC.e</strong> on the <strong>Polygon</strong> network to this address.
              Sending other tokens or using a different network may result in permanent loss of funds.
            </p>
          </div>

          {/* Current Balance */}
          <div className="flex items-center justify-between text-sm pt-2 border-t border-border/30">
            <span className="text-muted-foreground">Current Balance</span>
            <span className="font-medium">${balance.formatted} USDC</span>
          </div>
        </div>

        <div className="mt-2">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => onOpenChange(false)}
          >
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
