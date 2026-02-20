'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Menu, Moon, Sun, HelpCircle, LogIn, LogOut, Wallet, User, Copy, Check } from 'lucide-react';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { SearchBar } from '@/components/SearchBar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Sidebar } from './Sidebar';
import { useWallet } from '@/providers/WalletContext';
import { useTrading } from '@/providers/TradingProvider';

function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function Header() {
  const { theme, setTheme } = useTheme();
  const [currency, setCurrency] = useState<'EUR' | 'EURC'>('EUR');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const { eoaAddress, isConnected, connect, disconnect, email } = useWallet();
  const { safeAddress } = useTrading();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCopyAddress = async () => {
    const addr = safeAddress || eoaAddress;
    if (addr) {
      await navigator.clipboard.writeText(addr);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDisconnect = async () => {
    setIsUserMenuOpen(false);
    await disconnect();
  };

  return (
    <header className="sticky top-0 z-50 w-full glass border-b border-border/50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Mobile Menu */}
        <Sheet>
          <SheetTrigger asChild className="lg:hidden">
            <Button variant="ghost" size="icon" className="shrink-0">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <Sidebar isMobile />
          </SheetContent>
        </Sheet>

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2"
          >
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">€</span>
            </div>
            <span className="font-bold text-xl hidden sm:block">
              Euro<span className="text-primary">Bourse</span>
            </span>
          </motion.div>
        </Link>

        {/* Search Bar - Center */}
        <div className="hidden md:flex flex-1 justify-center max-w-xl">
          <SearchBar />
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Currency Toggle */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setCurrency(currency === 'EUR' ? 'EURC' : 'EUR')}
            className="hidden sm:flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
          >
            <span className={currency === 'EUR' ? 'text-primary' : 'text-muted-foreground'}>
              EUR
            </span>
            <span className="text-muted-foreground">/</span>
            <span className={currency === 'EURC' ? 'text-primary' : 'text-muted-foreground'}>
              EURC
            </span>
          </motion.button>

          {/* How it works */}
          <Button variant="ghost" size="sm" className="hidden md:flex gap-1">
            <HelpCircle className="h-4 w-4" />
            <span className="hidden lg:inline">How it works</span>
          </Button>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          {/* Auth Section - always visible on all screen sizes */}
          {isConnected && eoaAddress ? (
            <div className="relative shrink-0" ref={menuRef}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 hover:bg-primary/20 border border-primary/20 transition-colors shrink-0"
              >
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shrink-0">
                  <span className="text-primary-foreground text-xs font-bold">
                    {email ? email[0].toUpperCase() : eoaAddress.slice(2, 4).toUpperCase()}
                  </span>
                </div>
                <span className="hidden sm:inline text-sm font-medium truncate max-w-[100px] sm:max-w-none">
                  {truncateAddress(safeAddress || eoaAddress)}
                </span>
              </motion.button>

              <AnimatePresence>
                {isUserMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 z-50 w-64 bg-card border border-border rounded-xl shadow-lg overflow-hidden"
                  >
                    {/* User Info */}
                    <div className="p-3 border-b border-border/50">
                      {email && (
                        <p className="text-sm font-medium truncate">{email}</p>
                      )}
                      <div className="flex items-center gap-1 mt-1">
                        <Wallet className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground font-mono">
                          {truncateAddress(safeAddress || eoaAddress)}
                        </span>
                        <button
                          onClick={handleCopyAddress}
                          className="ml-auto p-0.5 hover:bg-secondary rounded transition-colors"
                        >
                          {copied ? (
                            <Check className="h-3 w-3 text-success" />
                          ) : (
                            <Copy className="h-3 w-3 text-muted-foreground" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="p-1">
                      <Link
                        href="/profile"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-secondary/50 transition-colors"
                      >
                        <User className="h-4 w-4" />
                        Profile
                      </Link>
                      <button
                        onClick={handleDisconnect}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-secondary/50 transition-colors text-danger"
                      >
                        <LogOut className="h-4 w-4" />
                        Log out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex items-center gap-2 shrink-0">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="shrink-0">
                <Button size="sm" className="gap-1 bg-primary hover:bg-primary/90 shrink-0" onClick={connect}>
                  <LogIn className="h-4 w-4" />
                  <span className="hidden md:inline">Log in</span>
                </Button>
              </motion.div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Search - Below header */}
      <div className="md:hidden px-4 pb-3">
        <SearchBar />
      </div>
    </header>
  );
}
