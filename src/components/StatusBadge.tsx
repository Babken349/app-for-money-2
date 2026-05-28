import React from 'react';
import { SubmissionStatus } from '../types';

interface StatusBadgeProps {
  status: SubmissionStatus;
  confidence?: number;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, confidence }) => {
  let styles = '';
  let text = '';
  let ringColor = '';

  switch (status) {
    case 'pending':
      styles = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      text = 'Проверка ML';
      ringColor = 'border-amber-400';
      break;
    case 'approved':
      styles = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      text = 'Опубликовано';
      ringColor = 'border-emerald-400';
      break;
    case 'rejected':
      styles = 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      text = 'Отклонено';
      ringColor = 'border-rose-400';
      break;
    case 'suspicious':
      styles = 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      text = 'Подозрительно';
      ringColor = 'border-orange-400';
      break;
    default:
      styles = 'bg-slate-500/10 text-slate-400 border-slate-500/20';
      text = 'Неизвестно';
      break;
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider border rounded-md shadow-inner ${styles}`}
      >
        {status === 'pending' && (
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          </span>
        )}
        <span>{text}</span>
      </span>
      {confidence !== undefined && confidence > 0 && (
        <span className="text-[10px] font-mono text-slate-400">
          Точность AI: <span className="font-bold text-slate-200">{confidence}%</span>
        </span>
      )}
    </div>
  );
};
