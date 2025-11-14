'use client';

import { motion } from 'framer-motion';
import type * as React from 'react';

interface ArenaLayoutProps {
  children: React.ReactNode;
}

export function ArenaLayout({ children }: ArenaLayoutProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Arena Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      >
        <div>
          <h1 className="text-2xl font-semibold gradient-text">Arena</h1>
          <p className="text-sm text-muted-foreground mt-1">Compare AI models side by side</p>
        </div>
      </motion.div>

      {/* Arena Content */}
      <div className="flex-1 overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="h-full overflow-x-auto overflow-y-hidden custom-scrollbar"
        >
          <div className="flex gap-4 p-4 h-full min-w-max">{children}</div>
        </motion.div>
      </div>
    </div>
  );
}
