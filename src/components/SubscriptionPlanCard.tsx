import React from 'react';
import { SubscriptionStatus } from '../types';
import { Check, ShieldCheck, Sparkles, Flame } from 'lucide-react';
import { motion } from 'motion/react';

interface SubscriptionPlanCardProps {
  id: SubscriptionStatus;
  name: string;
  price: string;
  features: string[];
  duration: string;
  isActive: boolean;
  onSelect: (tier: SubscriptionStatus) => void;
}

export const SubscriptionPlanCard: React.FC<SubscriptionPlanCardProps> = ({
  id,
  name,
  price,
  features,
  duration,
  isActive,
  onSelect
}) => {
  const isElite = id === 'elite';
  const isPro = id === 'pro';

  let borderStyle = 'border-slate-800 bg-slate-900/40';
  let headerBg = 'bg-slate-950/40 text-slate-300';
  let buttonStyle = 'bg-slate-800 hover:bg-slate-700 text-slate-200';
  let badgeText = '';

  if (isElite) {
    borderStyle = 'border-rose-500 bg-gradient-to-br from-slate-900 via-slate-900 to-rose-950/20 shadow-2xl shadow-rose-500/15 relative overflow-hidden ring-1 ring-rose-500/25';
    headerBg = 'bg-rose-500/15 text-rose-300 border-b border-rose-500/20';
    buttonStyle = 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/20';
    badgeText = '🔥 МАКСИМАЛЬНЫЙ XP';
  } else if (isPro) {
    borderStyle = 'border-lime-450 border-lime-400 bg-gradient-to-br from-slate-900 via-slate-900 to-lime-950/10 shadow-xl shadow-lime-400/10 relative overflow-hidden ring-1 ring-lime-400/20';
    headerBg = 'bg-lime-400/15 text-lime-400 border-b border-lime-400/20';
    buttonStyle = 'bg-lime-400 hover:bg-lime-300 text-slate-950 font-black shadow-lg shadow-lime-400/20';
    badgeText = '⭐ ПОПУЛЯРНОЕ';
  }

  return (
    <div className={`p-5 sm:p-6 rounded-2xl border flex flex-col justify-between transition-all duration-300 ${borderStyle}`}>
      {badgeText && (
        <span className="absolute top-3 right-3 text-[9px] font-black tracking-widest uppercase bg-slate-950 px-2 py-1 rounded border border-slate-800 text-amber-400">
          {badgeText}
        </span>
      )}

      <div>
        <div className={`-mx-5 -mt-5 p-4 rounded-t-2xl mb-4 ${headerBg}`}>
          <h3 className="text-sm font-black uppercase tracking-wider">{name}</h3>
        </div>

        {/* Стоимость */}
        <div className="mb-5">
          <span className="text-3xl font-black text-slate-100">{price}</span>
          <span className="text-xs text-slate-400 ml-1">/ {duration}</span>
        </div>

        {/* Возможности */}
        <ul className="space-y-3 mb-6">
          {features.map((feat, i) => (
            <li key={i} className="flex gap-2.5 items-start text-xs text-slate-300 leading-snug">
              <Check className={`w-4 h-4 shrink-0 mt-0.5 ${isPro ? 'text-lime-400' : isElite ? 'text-rose-400' : 'text-slate-550 text-slate-400'}`} />
              <span>{feat}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Кнопка оформления */}
      {isActive ? (
        <div className="w-full text-center py-2.5 px-4 font-bold text-xs uppercase tracking-widest bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20 flex items-center justify-center gap-1.5 cursor-default mt-auto">
          <ShieldCheck className="w-4 h-4" /> Активный план
        </div>
      ) : (
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => onSelect(id)}
          className={`w-full py-3.5 px-4 font-extrabold text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer mt-auto ${buttonStyle}`}
        >
          Подключить тариф
        </motion.button>
      )}
    </div>
  );
};
