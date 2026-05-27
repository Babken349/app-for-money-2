import React from 'react';
import { RANKS } from '../mockDb';

interface RankBadgeProps {
  rankTitle: string;
  className?: string;
  showIcon?: boolean;
}

export const RankBadge: React.FC<RankBadgeProps> = ({ rankTitle, className = '', showIcon = true }) => {
  const meta = RANKS.find(r => r.title === rankTitle) || RANKS[0];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold tracking-wide border rounded-full shadow-sm transition-all duration-300 ${meta.color} ${className}`}
    >
      {showIcon && <span className="text-sm select-none animate-pulse">{meta.badge}</span>}
      <span>{meta.title}</span>
    </span>
  );
};
