'use client';

import { motion } from 'framer-motion';
import { Twitter, MessageCircle, FileText, Lock, Code } from 'lucide-react';
import Link from 'next/link';

export function Footer() {
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
              €24.7M
            </motion.p>
            <p className="text-sm text-muted-foreground mt-1">Total Volume Locked</p>
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
              12,847
            </motion.p>
            <p className="text-sm text-muted-foreground mt-1">Active Traders</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-center"
          >
            <p className="text-2xl font-bold text-euro-lavender dark:text-euro-lavender">
              156
            </p>
            <p className="text-sm text-muted-foreground mt-1">Active Markets</p>
          </motion.div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h4 className="font-semibold text-sm mb-3">Platform</h4>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  How it works
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Markets
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Leaderboard
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-sm mb-3">Resources</h4>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
                  <Code className="h-3 w-3" />
                  API Docs
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Blog
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-sm mb-3">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
                  <Lock className="h-3 w-3" />
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-sm mb-3">Community</h4>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
                  <Twitter className="h-3 w-3" />
                  X (Twitter)
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
                  <MessageCircle className="h-3 w-3" />
                  Discord
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Compliance Notice */}
        <div className="text-center pt-6 border-t border-border/50">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 mb-4">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-xs font-medium text-muted-foreground">MiCA Compliant</span>
          </div>
          <p className="text-xs text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            EuroBourse is a prediction market platform operating under the Markets in Crypto-Assets (MiCA) 
            regulatory framework. Trading involves risk. Past performance does not guarantee future results. 
            Please trade responsibly.
          </p>
          <p className="text-xs text-muted-foreground mt-4">
            © {new Date().getFullYear()} EuroBourse. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

