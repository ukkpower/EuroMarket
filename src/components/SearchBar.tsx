'use client';

import { useEffect, useRef, useState } from 'react';
import { Search, Command } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useMarketStore } from '@/store/marketStore';
import { motion, AnimatePresence } from 'framer-motion';

export function SearchBar() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const { searchQuery, setSearchQuery } = useMarketStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === 'Escape' && isFocused) {
        inputRef.current?.blur();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isFocused]);

  return (
    <motion.div 
      className="relative flex items-center"
      animate={{ width: isFocused ? 400 : 280 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      <Search className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
      <Input
        ref={inputRef}
        type="text"
        placeholder="Search EU elections, Football, Eurovision..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="pl-10 pr-16 h-10 bg-secondary/50 border-transparent focus:border-primary focus:bg-background transition-all duration-200"
      />
      <AnimatePresence>
        {!isFocused && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute right-3 flex items-center gap-1 text-xs text-muted-foreground pointer-events-none"
          >
            <Command className="h-3 w-3" />
            <span>K</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

