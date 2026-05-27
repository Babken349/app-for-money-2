import React, { useState } from 'react';
import { Submission } from '../types';
import { StatusBadge } from './StatusBadge';
import { WORKOUT_OPTS, LocalDb } from '../mockDb';
import { Play, Calendar, Video, FileText, Cpu, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SubmissionCardProps {
  submission: Submission;
}

export const SubmissionCard: React.FC<SubmissionCardProps> = ({ submission }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showMlDetails, setShowMlDetails] = useState(false);

  const workoutOpt = WORKOUT_OPTS.find(o => o.value === submission.workoutType);
  const formatValue = (type: string, val: number) => {
    if (type === 'running') return `${val} км`;
    return `${val} раз`;
  };

  // Найдем джобу для этой заявки, чтобы выгрузить подробности ML-вердикта
  const allJobs = LocalDb.getJobs();
  const matchedJob = allJobs.find(j => j.submissionId === submission.id);

  // Форматирование даты
  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden hover:border-slate-700 transition-all duration-300 shadow-xl group">
      {/* Видео превью */}
      <div className="relative aspect-video bg-slate-950 overflow-hidden flex items-center justify-center">
        {isPlaying ? (
          <video
            src={submission.videoUrl}
            className="w-full h-full object-cover"
            controls
            autoPlay
            playsInline
            loop
            muted
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-t from-slate-950/90 to-slate-900/40 cursor-pointer" onClick={() => setIsPlaying(true)}>
            {/* Настоящий атлетический постер */}
            <div className="absolute inset-0 bg-slate-950 opacity-20 bg-[radial-gradient(#a3e635_1px,transparent_1px)] [background-size:16px_16px]" />
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="z-10 w-14 h-14 flex items-center justify-center bg-lime-400 hover:bg-lime-300 rounded-full text-slate-950 shadow-lg shadow-lime-400/20 transition-all"
            >
              <Play className="w-6 h-6 fill-current translate-x-0.5" />
            </motion.div>
            <span className="z-10 mt-2.5 text-xs text-slate-300 font-medium tracking-wide flex items-center gap-1 bg-slate-950/80 px-3 py-1 rounded-full border border-slate-800">
              <Video className="w-3.5 h-3.5 text-lime-400" />
              Воспроизвести доказательство
            </span>
          </div>
        )}

        {/* Ярлык типа тренировки */}
        <div className="absolute top-3 left-3 z-10 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800/60 flex items-center gap-1.5 shadow-md">
          <span className="text-sm select-none">{workoutOpt?.icon}</span>
          <span className="text-xs font-bold text-slate-200">
            {workoutOpt?.label.split(' ')[0]}
          </span>
        </div>
      </div>

      {/* Тело карточки */}
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          {/* Инфо автора */}
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src={submission.userAvatar}
              alt={submission.userName}
              className="w-9 h-9 rounded-full object-cover border border-slate-700 shadow-sm"
              referrerPolicy="no-referrer"
            />
            <div className="min-w-0">
              <h4 className="text-sm font-bold text-slate-100 truncate">{submission.userName}</h4>
              <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                <Calendar className="w-3 h-3 text-slate-500" />
                {formatDate(submission.createdAt)}
              </p>
            </div>
          </div>

          {/* Статус бар */}
          <StatusBadge status={submission.status} confidence={matchedJob?.mlConfidence} />
        </div>

        {/* Значение рекорда */}
        <div className="mt-4 py-2 px-3 rounded-xl bg-slate-950/40 border border-slate-800/40 flex justify-between items-center">
          <span className="text-xs text-slate-400 font-medium">Результат зафиксирован:</span>
          <span className="text-base font-bold text-lime-400">
            {formatValue(submission.workoutType, submission.countOrDistance)}
          </span>
        </div>

        {/* Описание */}
        {submission.description && (
          <p className="mt-3 text-xs text-slate-300 font-normal leading-relaxed italic bg-slate-950/20 p-2.5 rounded-lg border border-slate-800/20 flex gap-1.5">
            <FileText className="w-4 h-4 text-slate-500 shrink-0" />
            <span>«{submission.description}»</span>
          </p>
        )}

        {/* Бонусные баллы */}
        {submission.pointsAwarded > 0 && (
          <div className="mt-3.5 flex items-center justify-between text-xs font-mono py-1 rounded-md border-t border-slate-800/60 pt-3">
            <span className="text-slate-500 flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Начислено в профиль
            </span>
            <span className="font-bold text-emerald-400">+{submission.pointsAwarded} XP</span>
          </div>
        )}

        {/* Показать детали ИИ (запуск джобы) */}
        {matchedJob && (
          <div className="mt-3">
            <button
              onClick={() => setShowMlDetails(!showMlDetails)}
              className="w-full flex items-center justify-between text-[11px] font-semibold text-lime-400 hover:text-lime-300 transition-colors uppercase tracking-wider py-1.5 px-2 bg-lime-400/5 hover:bg-lime-400/10 rounded-lg border border-lime-400/10"
            >
              <span className="flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5" /> Спецификация нейросети (ML Job)
              </span>
              <span>{showMlDetails ? '▲ Скрыть' : '▼ Подробнее'}</span>
            </button>

            <AnimatePresence>
              {showMlDetails && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="mt-2 p-3 bg-slate-950 text-[11px] font-mono rounded-xl border border-slate-800/60 leading-relaxed text-slate-400 space-y-2">
                    <div className="flex justify-between border-b border-slate-800 pb-1">
                      <span>КОД ЗАДАНИЯ (Job ID):</span>
                      <span className="text-slate-200 font-bold">{matchedJob.id}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800 pb-1">
                      <span>СТАТУС PIPELINE:</span>
                      <span className={`font-bold ${
                        matchedJob.status === 'completed' ? 'text-emerald-400' : 'text-amber-400 font-semibold'
                      }`}>
                        {matchedJob.status === 'completed' ? 'ВЫПОЛНЕНО' : 'ОБРАБОТКА'}
                      </span>
                    </div>
                    {matchedJob.feedback && (
                      <div className="text-slate-300 pt-1 leading-normal italic">
                        {matchedJob.feedback}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};
