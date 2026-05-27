import React from 'react';
import { Achievement } from '../types';

interface AchievementCardProps {
  achievement: Achievement;
  unlocked: boolean;
  progress?: number; // e.g. 0 to 100
}

export const AchievementCard: React.FC<AchievementCardProps> = ({ achievement, unlocked, progress = 100 }) => {
  return (
    <div
      className={`relative overflow-hidden p-4 rounded-xl border transition-all duration-300 ${
        unlocked
          ? 'bg-slate-800/60 border-lime-400/25 shadow-md shadow-lime-400/5'
          : 'bg-slate-900/40 border-slate-800 opacity-60'
      }`}
    >
      <div className="flex gap-4 items-start">
        <div
          className={`flex items-center justify-center w-12 h-12 rounded-xl text-2xl select-none ${
            unlocked ? 'bg-lime-400/15 shadow-inner' : 'bg-slate-800'
          }`}
        >
          {achievement.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4 className="font-semibold text-slate-100 truncate text-sm sm:text-base">
              {achievement.title}
            </h4>
            <span
              className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded ${
                unlocked ? 'bg-lime-400/15 text-lime-400' : 'bg-slate-800 text-slate-500'
              }`}
            >
              +{achievement.points} XP
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400 leading-relaxed">
            {achievement.description}
          </p>

          {/* Шкала прогресса */}
          {!unlocked && progress > 0 && (
            <div className="mt-3">
              <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 mb-1">
                <span>Прогресс</span>
                <span>{progress}%</span>
              </div>
              <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-slate-600 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {unlocked && (
            <span className="absolute top-2 right-2 text-[10px] uppercase font-bold tracking-widest text-lime-400 select-none bg-lime-400/15 px-1.5 py-0.5 rounded">
              Получено
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
