'use client';

import { useState } from 'react';
import { HelpCircle, ChevronDown, type LucideIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useMarketStore } from '@/store/marketStore';
import type { SportsTopFilter } from '@/types/market';
import {
  subFilters as subFilterData,
  isDynamicCategory,
} from '@/data/categories';
import { useRelatedTags } from '@/hooks/useRelatedTags';
import {
  getSidebarLayout,
  SPORTS_TOP_FILTERS,
  SPORTS_SECTION,
  CRYPTO_TIME_FILTERS,
  FINANCE_TIME_FILTERS,
  FINANCE_SECTION,
  type SidebarMenuItem,
  type SidebarIconFilter,
  type SidebarSection,
} from '@/data/sidebarConfig';
import { cn } from '@/lib/utils';
import { LanguageSwitcher } from './LanguageSwitcher';

const toTranslationKey = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[&]/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

// ---------------------------------------------------------------------------
// Shared primitives
// ---------------------------------------------------------------------------

function SidebarButton({
  isActive,
  onClick,
  icon: Icon,
  children,
  layoutId,
}: {
  isActive: boolean;
  onClick?: () => void;
  icon?: LucideIcon;
  children: React.ReactNode;
  layoutId?: string;
}) {
  return (
    <motion.button
      whileHover={{ x: 2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        'relative w-full flex items-center justify-start gap-3 px-3 py-2 rounded-lg text-sm font-medium text-left transition-colors',
        isActive
          ? 'text-primary bg-accent'
          : 'text-muted-foreground hover:text-foreground hover:bg-secondary/40',
      )}
    >
      {isActive && layoutId && (
        <motion.div
          layoutId={layoutId}
          className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-r-full"
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      )}
      {Icon && <Icon className={cn('h-4 w-4', isActive && 'text-primary')} />}
      <span className="flex-1 text-left leading-tight">{children}</span>
    </motion.button>
  );
}

function IconFilterList({
  filters,
  activeId,
  onSelect,
}: {
  filters: SidebarIconFilter[];
  activeId: string | null;
  onSelect: (id: string) => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="space-y-0.5">
      {filters.map((f) => {
        const isActive = activeId === f.id;
        return (
          <SidebarButton
            key={f.id}
            isActive={isActive}
            onClick={() => onSelect(f.id)}
            icon={f.icon}
          >
            {t(`sidebar.items.${f.id}`, { defaultValue: f.label })}
          </SidebarButton>
        );
      })}
    </div>
  );
}

function Divider() {
  return <div className="border-t border-border/50 my-1" />;
}

// ---------------------------------------------------------------------------
// Dropdown item (Sports / Finance)
// ---------------------------------------------------------------------------

function DropdownMenuItem({
  item,
  activeSubFilterId,
  onSelect,
}: {
  item: SidebarMenuItem & { type: 'dropdown' };
  activeSubFilterId: string | null;
  onSelect: (id: string) => void;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const hasActiveChild = item.children.some((c) => c.id === activeSubFilterId);

  return (
    <div>
      <motion.button
        whileHover={{ x: 2 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'relative w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-sm font-medium text-left transition-colors',
          hasActiveChild
            ? 'text-primary bg-accent'
            : 'text-muted-foreground hover:text-foreground hover:bg-secondary/40',
        )}
      >
        <span className="flex-1 text-left leading-tight">
          {t(`sidebar.items.${item.id}`, { defaultValue: item.label })}
        </span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-3.5 w-3.5" />
        </motion.span>
      </motion.button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pl-4 space-y-0.5 pt-0.5">
              {item.children.map((child) => {
                const isActive = activeSubFilterId === child.id;
                return (
                  <SidebarButton
                    key={child.id}
                    isActive={isActive}
                    onClick={() => onSelect(child.id)}
                    layoutId="sidebar-sub-indicator"
                  >
                    {t(`sidebar.items.${child.id}`, { defaultValue: child.label })}
                  </SidebarButton>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Menu item list renderer (flat + dropdown)
// ---------------------------------------------------------------------------

function MenuItemList({
  items,
  activeSubFilterId,
  onSelect,
}: {
  items: SidebarMenuItem[];
  activeSubFilterId: string | null;
  onSelect: (id: string) => void;
}) {
  const { t } = useTranslation();

  return (
    <>
      {items.map((item) => {
        if (item.type === 'dropdown') {
          return (
            <DropdownMenuItem
              key={item.id}
              item={item}
              activeSubFilterId={activeSubFilterId}
              onSelect={onSelect}
            />
          );
        }
        const isActive = activeSubFilterId === item.id;
        return (
          <SidebarButton
            key={item.id}
            isActive={isActive}
            onClick={() => onSelect(item.id)}
            layoutId="sidebar-sub-indicator"
          >
            {t(`sidebar.items.${item.id}`, { defaultValue: item.label })}
          </SidebarButton>
        );
      })}
    </>
  );
}

function SectionBlock({
  section,
  activeSubFilterId,
  onSelect,
}: {
  section: SidebarSection;
  activeSubFilterId: string | null;
  onSelect: (id: string) => void;
}) {
  const { t } = useTranslation();
  const sectionKey = section.title ? toTranslationKey(section.title) : null;

  return (
    <div className="space-y-0.5">
      {section.title && (
        <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          {sectionKey
            ? t(`sidebar.sections.${sectionKey}`, { defaultValue: section.title })
            : section.title}
        </p>
      )}
      <MenuItemList
        items={section.items}
        activeSubFilterId={activeSubFilterId}
        onSelect={onSelect}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Layout: General
// ---------------------------------------------------------------------------

function GeneralSidebar({
  activeSubFilterId,
  setActiveSubFilterId,
}: {
  activeSubFilterId: string | null;
  setActiveSubFilterId: (id: string | null) => void;
}) {
  const { t } = useTranslation();
  const { activeCategory } = useMarketStore();
  const { subFilters: dynamicSubFilters, isLoading: dynamicLoading } =
    useRelatedTags(activeCategory);

  const availableSubFilters = isDynamicCategory(activeCategory)
    ? dynamicSubFilters
    : (subFilterData[activeCategory] || []);
  const showDynamicLoading =
    isDynamicCategory(activeCategory) &&
    dynamicLoading &&
    dynamicSubFilters.length === 0;

  return (
    <div className="space-y-0.5">
      <SidebarButton
        isActive={activeSubFilterId === null}
        onClick={() => setActiveSubFilterId(null)}
        layoutId="sidebar-sub-indicator"
      >
        {t('sidebar.all')}
      </SidebarButton>

      {showDynamicLoading ? (
        <p className="px-3 py-2 text-sm text-muted-foreground">{t('sidebar.loading')}</p>
      ) : (
        availableSubFilters.map((filter) => {
          const isActive = activeSubFilterId === filter.id;
          return (
            <SidebarButton
              key={filter.id}
              isActive={isActive}
              onClick={() =>
                setActiveSubFilterId(isActive ? null : filter.id)
              }
              layoutId="sidebar-sub-indicator"
            >
              {t(`sidebar.items.${filter.id}`, { defaultValue: filter.label })}
            </SidebarButton>
          );
        })
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Layout: Sports
// ---------------------------------------------------------------------------

function SportsSidebar({
  activeSubFilterId,
  activeSportsTopFilter,
  setActiveSubFilterId,
  setActiveSportsTopFilter,
  onInteraction,
}: {
  activeSubFilterId: string | null;
  activeSportsTopFilter: SportsTopFilter | null;
  setActiveSubFilterId: (id: string | null) => void;
  setActiveSportsTopFilter: (filter: SportsTopFilter | null) => void;
  onInteraction: () => void;
}) {
  const handleSectionSelect = (id: string) => {
    if (id === 'all') {
      setActiveSubFilterId(null);
    } else {
      setActiveSubFilterId(activeSubFilterId === id ? null : id);
    }
    onInteraction();
  };

  return (
    <>
      <IconFilterList
        filters={SPORTS_TOP_FILTERS}
        activeId={activeSportsTopFilter}
        onSelect={(id) => {
          const nextFilter = id as SportsTopFilter;
          setActiveSportsTopFilter(
            activeSportsTopFilter === nextFilter ? null : nextFilter
          );
          onInteraction();
        }}
      />
      <Divider />
      <SectionBlock
        section={SPORTS_SECTION}
        activeSubFilterId={
          activeSubFilterId === null ? 'all' : activeSubFilterId
        }
        onSelect={handleSectionSelect}
      />
    </>
  );
}

// ---------------------------------------------------------------------------
// Layout: Crypto
// ---------------------------------------------------------------------------

function CryptoSidebar({
  activeSubFilterId,
  setActiveSubFilterId,
}: {
  activeSubFilterId: string | null;
  setActiveSubFilterId: (id: string | null) => void;
}) {
  const cryptoSubFilters = subFilterData['crypto'] || [];
  const hasActiveTimeFilter = !!activeSubFilterId
    && CRYPTO_TIME_FILTERS.some((f) => f.id === activeSubFilterId);

  const activeTimeFilterId = activeSubFilterId === null
    ? 'all'
    : hasActiveTimeFilter
      ? activeSubFilterId
      : null;

  const handleTimeFilterSelect = (id: string) => {
    if (id === 'all') {
      setActiveSubFilterId(null);
      return;
    }
    setActiveSubFilterId(activeSubFilterId === id ? null : id);
  };

  return (
    <>
      <IconFilterList
        filters={CRYPTO_TIME_FILTERS}
        activeId={activeTimeFilterId}
        onSelect={handleTimeFilterSelect}
      />
      <Divider />
      <div className="space-y-0.5">
        {cryptoSubFilters.map((filter) => {
          const isActive = activeSubFilterId === filter.id;
          return (
            <SidebarButton
              key={filter.id}
              isActive={isActive}
              onClick={() =>
                setActiveSubFilterId(isActive ? null : filter.id)
              }
              layoutId="sidebar-sub-indicator"
            >
              {filter.label}
            </SidebarButton>
          );
        })}
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Layout: Finance
// ---------------------------------------------------------------------------

function FinanceSidebar({
  activeSubFilterId,
  setActiveSubFilterId,
}: {
  activeSubFilterId: string | null;
  setActiveSubFilterId: (id: string | null) => void;
}) {
  const hasActiveTimeFilter = !!activeSubFilterId
    && FINANCE_TIME_FILTERS.some((f) => f.id === activeSubFilterId);

  const activeTimeFilterId = activeSubFilterId === null
    ? 'all'
    : hasActiveTimeFilter
      ? activeSubFilterId
      : null;

  const handleTimeFilterSelect = (id: string) => {
    if (id === 'all') {
      setActiveSubFilterId(null);
      return;
    }
    setActiveSubFilterId(activeSubFilterId === id ? null : id);
  };

  const handleSectionSelect = (id: string) => {
    setActiveSubFilterId(activeSubFilterId === id ? null : id);
  };

  return (
    <>
      <IconFilterList
        filters={FINANCE_TIME_FILTERS}
        activeId={activeTimeFilterId}
        onSelect={handleTimeFilterSelect}
      />
      <Divider />
      <SectionBlock
        section={FINANCE_SECTION}
        activeSubFilterId={activeSubFilterId}
        onSelect={handleSectionSelect}
      />
    </>
  );
}

// ---------------------------------------------------------------------------
// Main Sidebar
// ---------------------------------------------------------------------------

type SidebarProps = {
  isMobile?: boolean;
};

export function Sidebar({ isMobile = false }: SidebarProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const {
    activeCategory,
    activeSubFilterId,
    activeSportsTopFilter,
    setActiveSubFilterId,
    setActiveSportsTopFilter,
  } = useMarketStore();

  const handleFilterInteraction = () => {
    if (!pathname.startsWith('/markets')) {
      router.push(`/markets/${activeCategory}`);
    }
  };

  const layout = getSidebarLayout(activeCategory);

  const renderContent = () => {
    switch (layout) {
      case 'sports':
        return (
          <SportsSidebar
            activeSubFilterId={activeSubFilterId}
            activeSportsTopFilter={activeSportsTopFilter}
            setActiveSubFilterId={setActiveSubFilterId}
            setActiveSportsTopFilter={setActiveSportsTopFilter}
            onInteraction={handleFilterInteraction}
          />
        );
      case 'crypto':
        return (
          <CryptoSidebar
            activeSubFilterId={activeSubFilterId}
            setActiveSubFilterId={setActiveSubFilterId}
          />
        );
      case 'finance':
        return (
          <FinanceSidebar
            activeSubFilterId={activeSubFilterId}
            setActiveSubFilterId={setActiveSubFilterId}
          />
        );
      default:
        return (
          <GeneralSidebar
            activeSubFilterId={activeSubFilterId}
            setActiveSubFilterId={setActiveSubFilterId}
          />
        );
    }
  };

  return (
    <aside
      className={cn(
        'flex flex-col h-full',
        isMobile
          ? 'w-full bg-background pt-6'
          : 'w-56 glass border-r border-border/50',
      )}
    >
      {isMobile && (
        <div className="px-4 pb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">
                €
              </span>
            </div>
            <span className="font-bold text-xl">
              Euro<span className="text-primary">Bourse</span>
            </span>
          </div>
          <LanguageSwitcher mobile className="mt-4" />
        </div>
      )}

      <div className="flex-1 px-3 py-4 space-y-5 overflow-y-auto scrollbar-hide">
        {renderContent()}
      </div>

      <div className="px-3 py-3 border-t border-border/50">
        <motion.button
          whileHover={{ x: 2 }}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/40 transition-colors"
        >
          <HelpCircle className="h-4 w-4" />
          <span>{t('sidebar.helpSupport')}</span>
        </motion.button>
      </div>
    </aside>
  );
}
