import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { UserProfile } from '../types';
import { RankBadge } from './RankBadge';
import { Trophy, Star, ShieldCheck, Flame } from 'lucide-react';
import { getAvatarClasses } from '../utils/avatar';

interface LeaderboardTableProps {
  currentUserUid?: string;
  onUserClick?: (userId: string) => void;
}

export const LeaderboardTable: React.FC<LeaderboardTableProps> = ({ currentUserUid, onUserClick }) => {
  const [users, setUsers] = useState<UserProfile[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'users'), orderBy('points', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      })) as UserProfile[];
      setUsers(usersData);
    });
    return () => unsubscribe();
  }, []);

  const getMedalEmoji = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="w-5 h-5 text-amber-400 shrink-0" />;
      case 1:
        return <Star className="w-5 h-5 text-slate-300 shrink-0" />;
      case 2:
        return <Star className="w-5 h-5 text-amber-600 shrink-0" />;
      default:
        return <span className="text-slate-500 font-mono font-bold text-sm">{index + 1}</span>;
    }
  };

  return (
    <div className="bg-slate-900/40 rounded-2xl border border-slate-800/80 overflow-hidden shadow-xl">
      <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/40 flex justify-between items-center">
        <div>
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Всероссийский лидерборд</h3>
          <p className="text-xs text-slate-400">Рейтинг обновляется автоматически после одобрения видео</p>
        </div>
        <div className="flex gap-1.5 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800 text-[10px] font-mono text-lime-400 uppercase tracking-widest font-bold">
          <Flame className="w-3.5 h-3.5 text-orange-400" /> Топ Сверки
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800/60 text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-950/20">
              <th className="py-3 px-4 w-12 text-center">Место</th>
              <th className="py-3 px-4">Атлет</th>
              <th className="py-3 px-4 text-center">Ранг</th>
              <th className="py-3 px-4">Премиум</th>
              <th className="py-3 px-4 text-right">Вериф. XP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/40">
            {users.map((user, idx) => {
              const isMe = user.uid === currentUserUid;
              return (
                <tr
                  key={user.uid}
                  onClick={() => onUserClick && onUserClick(user.uid)}
                  className={`transition-colors text-xs sm:text-sm ${onUserClick ? 'cursor-pointer' : ''} ${
                    isMe
                      ? 'bg-lime-400/10 hover:bg-lime-400/15 font-semibold border-l-2 border-lime-400'
                      : 'hover:bg-slate-900/30'
                  }`}
                >
                  {/* Место */}
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center h-7 w-7 mx-auto rounded-full bg-slate-950/40 border border-slate-800/50">
                      {getMedalEmoji(idx)}
                    </div>
                  </td>

                  {/* Атлет */}
                  <td className="py-3.5 px-4 bg">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="relative shrink-0 select-none">
                        <img
                          src={user.avatarUrl}
                          alt={user.displayName}
                          className={`w-8 h-8 rounded-full object-cover shrink-0 transition-all ${getAvatarClasses(user, 'small')}`}
                          referrerPolicy="no-referrer"
                        />
                        {user.subscriptionStatus === 'elite' && (
                          <span className="absolute -top-1.5 -left-1.5 text-[10px] drop-shadow">👑</span>
                        )}
                        {user.subscriptionStatus === 'pro' && (
                          <span className="absolute -top-1.5 -left-1.5 text-[10px] drop-shadow">⭐️</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className={`font-bold truncate ${
                            user.subscriptionStatus === 'elite'
                              ? 'bg-gradient-to-r from-rose-400 via-amber-300 to-rose-400 bg-clip-text text-transparent font-black drop-shadow-[0_1px_4px_rgba(244,63,94,0.35)]'
                              : user.subscriptionStatus === 'pro'
                              ? 'text-lime-400 font-extrabold drop-shadow-[0_0_4px_rgba(163,230,53,0.3)]'
                              : 'text-slate-200'
                          }`}>{user.displayName}</span>
                          {isMe && (
                            <span className="text-[9px] uppercase font-bold bg-lime-400/20 text-lime-400 px-1.5 py-0.5 rounded">
                              Вы
                            </span>
                          )}
                        </div>
                        {user.bio && (
                          <p className="text-[10px] text-slate-400 truncate max-w-[150px] sm:max-w-[240px]">
                            {user.bio}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Ранг */}
                  <td className="py-3.5 px-4 text-center">
                    <RankBadge rankTitle={user.currentRank} className="transform scale-90" showIcon={false} />
                  </td>

                  {/* Премиум / Подписка */}
                  <td className="py-3.5 px-4">
                    <span
                      className={`text-[9px] tracking-widest px-2.5 py-1 rounded-lg font-black inline-flex items-center gap-1 shadow-md uppercase ${
                        user.subscriptionStatus === 'elite'
                          ? 'bg-rose-500/15 text-rose-350 text-rose-400 border border-rose-500/30'
                          : user.subscriptionStatus === 'pro'
                          ? 'bg-amber-400/15 text-amber-300 border border-amber-400/30'
                          : user.subscriptionStatus === 'member'
                          ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                          : 'bg-slate-950 text-slate-500 border border-slate-900/60'
                      }`}
                    >
                      {user.subscriptionStatus === 'elite' ? (
                        <>💎 Elite</>
                      ) : user.subscriptionStatus === 'pro' ? (
                        <>⚡ Pro</>
                      ) : user.subscriptionStatus === 'member' ? (
                        <>🎖 Member</>
                      ) : (
                        'Free'
                      )}
                    </span>
                  </td>

                  {/* Очки верифицированные */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="font-mono font-bold text-slate-200 flex items-center justify-end gap-1">
                      <ShieldCheck className="w-4 h-4 text-lime-400 inline" />
                      <span>{user.points.toLocaleString('ru-RU')} XP</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
