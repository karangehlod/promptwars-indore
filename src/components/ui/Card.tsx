import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '../../lib/utils';
import { CheckCircle2 } from 'lucide-react';

interface CardProps extends HTMLMotionProps<"div"> {
  selected?: boolean;
  onSelect?: () => void;
  children: React.ReactNode;
}

export function Card({ selected, onSelect, className, children, ...props }: CardProps) {
  return (
    <motion.div
      onClick={onSelect}
      className={cn(
        "relative rounded-2xl bg-surface border border-border shadow-sm p-5",
        "transition-all duration-200 ease-out",
        onSelect && "cursor-pointer hover:shadow-lg hover:-translate-y-1 hover:border-primary-500/40",
        selected && "border-primary-500 bg-primary-50/20 dark:bg-primary-950/10 ring-2 ring-primary-500/30",
        className
      )}
      {...props}
    >
      {selected && (
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-3 -right-3 bg-surface rounded-full"
        >
          <CheckCircle2 className="w-6 h-6 text-primary-600 fill-primary-600/20" />
        </motion.div>
      )}
      {children}
    </motion.div>
  );
}
