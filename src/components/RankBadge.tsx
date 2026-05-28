import React, { useEffect } from 'react';
import { motion, useAnimation } from 'motion/react';
import { RANKS } from '../mockDb';

interface RankBadgeProps {
  rankTitle: string;
  className?: string;
  showIcon?: boolean;
}

export const RankBadge: React.FC<RankBadgeProps> = ({ rankTitle, className = '', showIcon = true }) => {
  const meta = RANKS.find(r => r.title === rankTitle) || RANKS[0];
  const controls = useAnimation();

  useEffect(() => {
    controls.start({
      scale: [1, 1.2, 1],
      boxShadow: ['0 0 0 rgba(163, 230, 53, 0)', '0 0 20px rgba(163, 230, 53, 0.5)', '0 0 0 rgba(163, 230, 53, 0)'],
      transition: { duration: 0.8, ease: "easeInOut" }
    });
  }, [rankTitle, controls]);

  return (
    <motion.span
      animate={controls}
      className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold tracking-wide border rounded-full shadow-sm transition-all duration-300 ${meta.color} ${className}`}
    >
      {showIcon && <span className="text-sm select-none">{meta.badge}</span>}
      <span>{meta.title}</span>
    </motion.span>
  );
};
