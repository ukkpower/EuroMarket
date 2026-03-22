'use client';

import { motion } from 'framer-motion';
import { Twitter, MessageCircle, FileText, Lock, Code } from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { formatCompactCurrency, formatInteger } from '@/lib/intl';

export function Footer() {
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage || i18n.language;

  const totalVolumeLocked = formatCompactCurrency(24_700_000, language, 'EUR');
  const activeTraders = formatInteger(12_847, language);
  const activeMarkets = formatInteger(156, language);

  return (
    <footer className="border-t border-border/50 bg-card/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-8">
        {/* Live Stats */}
        <div className="flex flex-wrap justify-center gap-8 mb-8 pb-8 border-b border-border/50">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <motion.p
              className="text-2xl font-bold text-primary pulse-glow inline-block px-4 py-1 rounded-lg"
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {totalVolumeLocked}
            </motion.p>
            <p className="text-sm text-muted-foreground mt-1">{t('footer.stats.totalVolumeLocked')}</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-center"
          >
            <motion.p
              className="text-2xl font-bold text-euro-teal dark:text-euro-teal"
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
            >
              {activeTraders}
            </motion.p>
            <p className="text-sm text-muted-foreground mt-1">{t('footer.stats.activeTraders')}</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-center"
          >
            <p className="text-2xl font-bold text-euro-lavender dark:text-euro-lavender">
              {activeMarkets}
            </p>
            <p className="text-sm text-muted-foreground mt-1">{t('footer.stats.activeMarkets')}</p>
          </motion.div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h4 className="font-semibold text-sm mb-3">{t('footer.sections.platform')}</h4>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {t('footer.links.howItWorks')}
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {t('footer.links.markets')}
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {t('footer.links.leaderboard')}
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-sm mb-3">{t('footer.sections.resources')}</h4>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
                  <Code className="h-3 w-3" />
                  {t('footer.links.apiDocs')}
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {t('footer.links.helpCenter')}
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {t('footer.links.blog')}
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-sm mb-3">{t('footer.sections.legal')}</h4>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  {t('footer.links.terms')}
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
                  <Lock className="h-3 w-3" />
                  {t('footer.links.privacy')}
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {t('footer.links.cookie')}
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-sm mb-3">{t('footer.sections.community')}</h4>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
                  <Twitter className="h-3 w-3" />
                  {t('footer.links.twitter')}
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
                  <MessageCircle className="h-3 w-3" />
                  {t('footer.links.discord')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Compliance Notice */}
        <div className="text-center pt-6 border-t border-border/50">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 mb-4">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-xs font-medium text-muted-foreground">{t('footer.micaCompliant')}</span>
          </div>
          <p className="text-xs text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {t('footer.complianceNotice')}
          </p>
          <p className="text-xs text-muted-foreground mt-4">
            © {new Date().getFullYear()} EuroBourse. {t('footer.rightsReserved')}
          </p>
        </div>
      </div>
    </footer>
  );
}
