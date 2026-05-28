import React, { useState } from 'react';
import { Submission } from '../types';
import { StatusBadge } from './StatusBadge';
import { WORKOUT_OPTS, LocalDb } from '../mockDb';
import { Play, Calendar, Video, FileText, Cpu, CheckCircle, Heart, MessageCircle, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getAvatarClasses } from '../utils/avatar';
import { useAuth } from '../AuthContext';

interface SubmissionCardProps {
  submission: Submission;
  onUserClick?: (userId: string) => void;
}

export const SubmissionCard: React.FC<SubmissionCardProps> = ({ submission, onUserClick }) => {
  const { user: currentUser } = useAuth();
  const [isPlaying, setIsPlaying] = useState(false);
  const [showMlDetails, setShowMlDetails] = useState(false);

  const [localLikes, setLocalLikes] = useState<string[]>(submission.likes || []);
  const [localComments, setLocalComments] = useState(submission.comments || []);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');

  const hasLiked = currentUser ? localLikes.includes(currentUser.uid) : false;

  const handleToggleLike = () => {
    if (!currentUser) return;
    if (hasLiked) {
      setLocalLikes(prev => prev.filter(id => id !== currentUser.uid));
    } else {
      setLocalLikes(prev => [...prev, currentUser.uid]);
    }
    LocalDb.toggleLike(submission.id, currentUser.uid);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !commentText.trim()) return;

    const newComment = {
      id: 'cmt_' + Math.random().toString(36).substr(2, 9),
      userId: currentUser.uid,
      userName: currentUser.displayName,
      userAvatar: currentUser.avatarUrl,
      text: commentText.trim(),
      createdAt: new Date().toISOString()
    };

    setLocalComments(prev => [...prev, newComment]);
    setCommentText('');
    LocalDb.addComment(submission.id, newComment);
  };

  const workoutOpt = WORKOUT_OPTS.find(o => o.value === submission.workoutType);
  const formatValue = (type: string, val: number) => {
    if (type === 'running') return `${val} км`;
    if (type === 'bench_press' || type === 'squats_kg') return `${val} кг`;
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

  // Тело карточки
  const users = LocalDb.getUsers();
  const creator = users.find(u => u.uid === submission.userId);
  const subStatus = creator?.subscriptionStatus || 'free';

  return (
    <div className={`border rounded-2xl overflow-hidden hover:border-slate-700 transition-all duration-300 shadow-xl group ${
      subStatus === 'elite'
        ? 'bg-gradient-to-b from-slate-900 via-slate-900 to-rose-950/10 border-rose-500/20'
        : subStatus === 'pro'
        ? 'bg-gradient-to-b from-slate-900 via-slate-900 to-lime-950/10 border-lime-500/20'
        : 'bg-slate-900/60 border-slate-800/80'
    }`}>
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
          <div 
            className={`flex items-center gap-2.5 min-w-0 ${onUserClick ? 'cursor-pointer group/user' : ''}`}
            onClick={() => onUserClick && onUserClick(submission.userId)}
          >
            <div className="relative shrink-0 select-none">
              <img
                src={submission.userAvatar}
                alt={submission.userName}
                className={`w-9 h-9 rounded-full object-cover transition-all ${getAvatarClasses(creator, 'small')}`}
                referrerPolicy="no-referrer"
              />
              {subStatus === 'elite' && (
                <span className="absolute -top-1.5 -left-1.5 text-[10px]">👑</span>
              )}
              {subStatus === 'pro' && (
                <span className="absolute -top-1.5 -left-1.5 text-[10px]">⭐️</span>
              )}
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-bold text-slate-100 truncate flex items-center gap-1 group-hover/user:text-white transition-colors">
                <span className={subStatus === 'elite' ? 'text-rose-400' : subStatus === 'pro' ? 'text-amber-300' : 'text-slate-100'}>
                  {submission.userName}
                </span>
                {subStatus === 'elite' && (
                  <span className="text-[9px] bg-rose-500/10 text-rose-400 px-1.5 py-0.5 rounded border border-rose-500/25 uppercase font-black tracking-widest leading-none scale-90">Elite</span>
                )}
                {subStatus === 'pro' && (
                  <span className="text-[9px] bg-amber-400/15 text-amber-300 px-1.5 py-0.5 rounded border border-amber-400/25 uppercase font-black tracking-widest leading-none scale-90">Pro</span>
                )}
                {subStatus === 'member' && (
                  <span className="text-[9px] bg-cyan-400/10 text-cyan-400 px-1.5 py-0.5 rounded border border-cyan-400/20 uppercase font-black tracking-widest leading-none scale-90">Club</span>
                )}
              </h4>
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

        {/* Интерактивный блок (Лайки, Комментарии) */}
        <div className="mt-3 pt-3 border-t border-slate-800/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={handleToggleLike}
              className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-full transition-colors ${
                hasLiked ? 'text-rose-400 bg-rose-500/10' : 'text-slate-400 bg-slate-800 hover:bg-slate-700'
              }`}
            >
              <Heart className={`w-4 h-4 ${hasLiked ? 'fill-current text-rose-500 hover:text-rose-400 cursor-pointer transition-transform hover:scale-110 active:scale-95' : 'text-slate-400 hover:text-slate-300 transition-transform active:scale-95'}`} />
              {localLikes.length > 0 && <span>{localLikes.length}</span>}
            </button>
            <button 
              onClick={() => setShowComments(!showComments)}
              className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-full transition-colors ${
                showComments ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-400 bg-slate-800 hover:bg-slate-700'
              }`}
            >
              <MessageCircle className="w-4 h-4" />
              {localComments.length > 0 && <span>{localComments.length}</span>}
            </button>
          </div>
        </div>

        {/* Область комментариев */}
        <AnimatePresence>
          {showComments && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-4 space-y-3 bg-slate-950/30 p-3 rounded-xl border border-slate-800/40">
                {localComments.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-2">Нет комментариев. Стань первым!</p>
                ) : (
                  <div className="space-y-3 max-h-48 overflow-y-auto pr-1 stylish-scroll">
                    {localComments.map(c => (
                      <div key={c.id} className="flex gap-2.5">
                        <img 
                          src={c.userAvatar} 
                          alt={c.userName} 
                          className="w-6 h-6 rounded-full object-cover shrink-0 border border-slate-700"
                        />
                        <div className="flex-1 min-w-0 bg-slate-900 border border-slate-800 p-2 rounded-lg rounded-tl-none">
                          <p className="text-[10px] font-bold text-slate-300 truncate">{c.userName}</p>
                          <p className="text-xs text-slate-200 mt-0.5 leading-snug">{c.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {currentUser ? (
                  <form onSubmit={handleAddComment} className="flex gap-2 pt-2 border-t border-slate-800/40">
                    <input
                      type="text"
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                      placeholder="Оставить комментарий..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                    />
                    <button
                      type="submit"
                      disabled={!commentText.trim()}
                      className="bg-emerald-500 text-slate-950 p-2 rounded-xl disabled:opacity-50 transition-colors"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                ) : (
                  <p className="text-[10px] text-center text-slate-500 pt-2 border-t border-slate-800/40">Войдите, чтобы оставить комментарий</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Бонусные баллы */}
        {submission.pointsAwarded > 0 && (
          <div className="mt-3.5 flex items-center justify-between text-xs font-mono py-1 rounded-md border-t border-slate-800/60 pt-3">
            <span className="text-slate-500 flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Начислено в профиль
            </span>
            <span className="font-bold text-emerald-400">+{submission.pointsAwarded} XP</span>
          </div>
        )}
      </div>
    </div>
  );
};
