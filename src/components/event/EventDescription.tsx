'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, FileText, Scale, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

type EventDescriptionProps = {
  description: string;
  rules?: string;
};

export function EventDescription({ description, rules }: EventDescriptionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'description' | 'rules'>('description');

  // Check if content is long enough to warrant expansion
  const shouldTruncate = description.length > 300;
  const displayText = shouldTruncate && !isExpanded 
    ? description.slice(0, 300) + '...' 
    : description;

  return (
    <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-border/50">
        <button
          onClick={() => setActiveTab('description')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors',
            activeTab === 'description'
              ? 'text-foreground border-b-2 border-primary -mb-px'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <FileText className="h-4 w-4" />
          Description
        </button>
        {rules && (
          <button
            onClick={() => setActiveTab('rules')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors',
              activeTab === 'rules'
                ? 'text-foreground border-b-2 border-primary -mb-px'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Scale className="h-4 w-4" />
            Resolution Rules
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <AnimatePresence mode="wait">
          {activeTab === 'description' ? (
            <motion.div
              key="description"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
            >
              <div className="prose prose-sm prose-slate dark:prose-invert max-w-none">
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {displayText}
                </p>
              </div>

              {/* Expand/Collapse Button */}
              {shouldTruncate && (
                <motion.button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="flex items-center gap-1 mt-3 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                  whileHover={{ x: 2 }}
                >
                  <span>{isExpanded ? 'Show less' : 'Read more'}</span>
                  <motion.span
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </motion.span>
                </motion.button>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="rules"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
            >
              <div className="space-y-4">
                {/* Rules content */}
                <div className="prose prose-sm prose-slate dark:prose-invert max-w-none">
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {rules || 'Resolution rules not specified.'}
                  </p>
                </div>

                {/* Resolution Source */}
                <div className="p-3 rounded-xl bg-secondary/50 border border-border/30">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Scale className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-foreground mb-1">
                        Resolution Source
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        This market will be resolved based on official announcements and verified news sources.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Links */}
                <div className="flex flex-wrap gap-2">
                  <a
                    href="#"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    View on Polymarket
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Skeleton for loading state
export function EventDescriptionSkeleton() {
  return (
    <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
      {/* Tabs skeleton */}
      <div className="flex border-b border-border/50">
        <div className="flex-1 py-3 flex justify-center">
          <div className="h-5 w-24 bg-secondary animate-pulse rounded" />
        </div>
        <div className="flex-1 py-3 flex justify-center">
          <div className="h-5 w-28 bg-secondary animate-pulse rounded" />
        </div>
      </div>

      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        <div className="h-4 bg-secondary animate-pulse rounded w-full" />
        <div className="h-4 bg-secondary animate-pulse rounded w-full" />
        <div className="h-4 bg-secondary animate-pulse rounded w-3/4" />
        <div className="h-4 bg-secondary animate-pulse rounded w-5/6" />
        <div className="h-4 bg-secondary animate-pulse rounded w-1/2" />
      </div>
    </div>
  );
}
