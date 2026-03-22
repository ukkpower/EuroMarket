'use client';

import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { Search, Command, History, X } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import {
  addSearchHistory,
  clearSearchHistory,
  loadSearchHistory,
} from '@/utils/searchHistory';

export function SearchBar() {
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const containerRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const urlQuery = pathname === '/search-results'
    ? (searchParams.get('q') ?? '')
    : '';

  const [query, setQuery] = useState('');
  const [history, setHistory] = useState<string[]>(() => loadSearchHistory());
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === 'Escape' && isFocused) {
        setIsFocused(false);
        inputRef.current?.blur();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isFocused]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredHistory = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return history;
    return history.filter((item) => item.toLowerCase().includes(trimmed));
  }, [history, query]);

  const showHistoryDropdown = isFocused && filteredHistory.length > 0;

  const executeSearch = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;

    const nextHistory = addSearchHistory(trimmed);
    setHistory(nextHistory);
    setQuery(trimmed);
    setIsFocused(false);
    router.push(`/search-results?q=${encodeURIComponent(trimmed)}`);
  };

  const handleClearHistory = () => {
    clearSearchHistory();
    setHistory([]);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    executeSearch(query);
  };

  const inputValue = isFocused
    ? query
    : (pathname === '/search-results' ? urlQuery : query);

  const handleFocus = () => {
    if (pathname === '/search-results') {
      setQuery(urlQuery);
    }
    setIsFocused(true);
  };

  return (
    <motion.form
      ref={containerRef}
      onSubmit={handleSubmit}
      className="relative flex items-center"
      animate={{ width: isFocused ? 400 : 280 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      <Search className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
      <Input
        ref={inputRef}
        type="text"
        placeholder={t('search.placeholder')}
        value={inputValue}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={handleFocus}
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

      <AnimatePresence>
        {showHistoryDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full mt-2 z-50 w-full rounded-xl border border-border bg-card shadow-lg overflow-hidden"
          >
            <div className="flex items-center justify-between px-3 py-2 border-b border-border/50">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <History className="h-3.5 w-3.5" />
                {t('search.recentSearches')}
              </div>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={handleClearHistory}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {t('search.clear')}
              </button>
            </div>

            <div className="max-h-64 overflow-y-auto py-1">
              {filteredHistory.map((item) => (
                <button
                  key={item}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => executeSearch(item)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-secondary/50 transition-colors"
                >
                  <History className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className="truncate flex-1">{item}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isFocused && query && (
        <button
          type="button"
          onClick={() => setQuery('')}
          className="absolute right-3 p-0.5 text-muted-foreground hover:text-foreground transition-colors"
          aria-label={t('search.clearInput')}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </motion.form>
  );
}
