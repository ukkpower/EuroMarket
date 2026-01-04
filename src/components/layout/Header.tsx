'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, Moon, Sun, HelpCircle, LogIn, Wallet } from 'lucide-react';
import { useTheme } from 'next-themes';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { SearchBar } from '@/components/SearchBar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Sidebar } from './Sidebar';

export function Header() {
  const { theme, setTheme } = useTheme();
  const [currency, setCurrency] = useState<'EUR' | 'EURC'>('EUR');

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

          {/* Auth Buttons */}
          <div className="hidden sm:flex items-center gap-2">
            <Button variant="ghost" size="sm" className="gap-1">
              <LogIn className="h-4 w-4" />
              <span className="hidden md:inline">Log in</span>
            </Button>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button size="sm" className="gap-1 bg-primary hover:bg-primary/90">
                <Wallet className="h-4 w-4" />
                <span className="hidden md:inline">Connect Wallet</span>
              </Button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Mobile Search - Below header */}
      <div className="md:hidden px-4 pb-3">
        <SearchBar />
      </div>
    </header>
  );
}

