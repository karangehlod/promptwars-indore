import React from 'react';
import { motion, type Variants } from 'framer-motion';

interface StaggeredGridProps {
  children: React.ReactNode;
  dataFetchId: string | number; // Used to re-trigger animation only on new data
  className?: string;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, x: 40 },
  visible: { 
    opacity: 1, 
    x: 0, 
    transition: { type: 'spring', stiffness: 120, damping: 16 }
  }
};

export function StaggeredGrid({ children, dataFetchId, className = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" }: StaggeredGridProps) {
  return (
    <motion.div
      key={dataFetchId}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {React.Children.map(children, child => (
        <motion.div variants={itemVariants}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}
