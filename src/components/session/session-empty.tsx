"use client";

import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';

export function SessionEmpty() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="col-span-full p-10 text-center border rounded-lg bg-muted/20"
    >
      <div className="rounded-full bg-muted inline-flex p-3 mx-auto">
        <Shield className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-xl font-medium">No active sessions</h3>
      <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
        You don't have any active sessions other than the current one. When you
        log in from other devices, they will appear here.
      </p>
    </motion.div>
  );
}
