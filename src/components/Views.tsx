import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { useTheme } from '../themeContext';
import { auth } from '../firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { LocalDb, RANKS, WORKOUT_OPTS, ACHIEVEMENTS, getRankByPoints } from '../mockDb';
import { Submission, SubscriptionStatus } from '../types';
import { SubmissionCard } from './SubmissionCard';
import { UploadForm } from './UploadForm';
import { LeaderboardTable } from './LeaderboardTable';
import { RankBadge } from './RankBadge';
import { WorkoutCalendar } from './WorkoutCalendar';
import { SubscriptionPlanCard } from './SubscriptionPlanCard';
import { AchievementCard } from './AchievementCard';
import { getAvatarClasses } from '../utils/avatar';
import { AVATAR_FRAMES } from '../data/frames';
import { 
  Flame, Award, Trophy, Users, ShieldCheck, Video, 
  Cpu, Zap, Send, Edit3, UserCheck, Star, Sparkles, CheckCircle2, CreditCard,
  Calendar, PlusCircle, Trash, Dumbbell, TrendingUp, Heart, Ban, AlertCircle, Sliders, Pill
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

/* ==========================================================================
   1. LANDING VIEW
   ========================================================================== */
export const LandingView: React.FC<{ onGetStarted: () => void }> = ({ onGetStarted }) => {
  const { theme } = useTheme();
  return (
    <div className={`max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-12 ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-lime-400/15 text-lime-400 border border-lime-400/25 text-xs font-black uppercase tracking-widest rounded-full">
          ⚡ Эра Честного Фитнеса
        </span>
        <h2 className="text-3xl sm:text-5xl font-black text-slate-100 uppercase tracking-tight leading-none">
          Подтверждай свои результаты по <span className="text-gradient bg-gradient-to-r from-lime-450 from-lime-400 to-emerald-400 bg-clip-text text-transparent">видео</span>
        </h2>
        <p className="max-w-xl mx-auto text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
          Социальная платформа, где каждый присед, отжимание и километр приносят результат. Выкладывай видео, зарабатывай XP, открывай ранги и докажи свое лидерство!
        </p>
        <div className="pt-4 flex flex-col sm:flex-row justify-center gap-3">
          <button
            onClick={onGetStarted}
            className="px-8 py-4 bg-lime-400 hover:bg-lime-300 text-slate-950 font-black text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-lime-400/20 cursor-pointer transition-all"
          >
            Начать тренировки бесплатно
          </button>
        </div>
      </div>

      {/* Bento Grid Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-800 space-y-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-lime-400 to-emerald-500 flex items-center justify-center text-slate-950 font-black">
            <Video className="w-5 h-5 font-black stroke-[2.5px]" />
          </div>
          <h3 className="font-bold text-slate-200 text-sm uppercase">1. Запись попытки</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Снимите короткое видео выполнения норматива: отжиманий, приседаний или бега, и загрузите в систему.
          </p>
        </div>

        <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-800 space-y-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 to-rose-600 flex items-center justify-center text-white">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-200 text-sm uppercase">2. Публикация</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Выкладывайте видеоролики с упражнениями, они автоматически сохраняются в вашем профиле.
          </p>
        </div>

        <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-800 space-y-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-white">
            <Trophy className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-200 text-sm uppercase">3. Получение рангов</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Получайте честные баллы (XP), разблокируйте уникальные ачивки и занимайте верхние позиции в РФ.
          </p>
        </div>
      </div>

      {/* Workout Rules */}
      <div className="bg-slate-950/60 p-6 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="font-black text-slate-200 text-xs sm:text-sm uppercase tracking-wider flex items-center gap-1.5">
          <Zap className="w-4 h-4 text-amber-400" /> Поддерживаемые активности в MVP
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {WORKOUT_OPTS.map(opt => (
            <div key={opt.value} className="bg-slate-900/50 p-4 rounded-xl border border-slate-800/50 flex items-center gap-3">
              <span className="text-2xl select-none">{opt.icon}</span>
              <div>
                <h4 className="font-bold text-slate-300 text-xs">{opt.label.split(' ')[0]}</h4>
                <p className="text-[10px] text-slate-500 font-mono">+{opt.pointsPerUnit} XP за повторение</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ==========================================================================
   2. AUTH VIEW
   ========================================================================== */
export const AuthView: React.FC<{ setTab: (tab: string) => void }> = ({ setTab }) => {
  const { login, signUp, error } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  
  const [submitLoading, setSubmitLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    
    if (isLogin) {
      await login(email, password);
    } else {
      await signUp(email, name, password);
    }
    
    setSubmitLoading(false);
  };

  return (
    <div className="max-w-sm mx-auto px-4 py-12">
      <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800 space-y-6 shadow-2xl">
        <div className="text-center space-y-1.5">
          <h3 className="text-xl font-black text-slate-100 uppercase tracking-tight">
            {isLogin ? 'Вход на платформу' : 'Регистрация атлета'}
          </h3>
          <p className="text-xs text-slate-500">
            {isLogin ? 'Введите свои учетные данные для доступа к ленте' : 'Создайте новый аккаунт для старта'}
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/5 border border-rose-500/10 rounded-xl text-xs text-rose-400 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ФИО / Псевдоним</label>
              <input
                type="text"
                placeholder="Иван Иванов"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-slate-950 text-slate-200 placeholder-slate-700 border border-slate-800 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-lime-400"
                required={!isLogin}
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Электронная почта</label>
            <input
              type="email"
              placeholder="athlete@domain.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-slate-950 text-slate-200 placeholder-slate-700 border border-slate-800 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-lime-400"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Пароль</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-slate-950 text-slate-200 placeholder-slate-700 border border-slate-800 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-lime-400"
              required
            />
          </div>

          <button
            type="submit"
            disabled={submitLoading}
            className="w-full py-3 px-4 bg-lime-400 hover:bg-lime-300 text-slate-950 font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
          >
            {submitLoading ? (
              <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
            ) : isLogin ? (
              'Войти'
            ) : (
              'Зарегистрироваться'
            )}
          </button>
        </form>

        <div className="flex flex-col gap-2 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            type="button"
            className="text-[11px] font-bold text-lime-400 hover:text-lime-300 cursor-pointer"
          >
            {isLogin ? 'Ещё нет аккаунта? Зарегистрироваться' : 'Уже зарегистрированы? Войти'}
          </button>
          {isLogin && (
            <button
              onClick={() => setTab('forgot_password')}
              type="button"
              className="text-[10px] text-slate-500 hover:text-slate-300 cursor-pointer"
            >
              Забыли пароль?
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export const ForgotPasswordView: React.FC<{ setTab: (tab: string) => void }> = ({ setTab }) => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('Письмо для сброса пароля отправлено. Проверьте почту.');
    } catch (err: any) {
      setError('Ошибка при отправке письма: ' + err.message);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-sm mx-auto px-4 py-12">
      <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800 space-y-6 shadow-2xl">
        <h3 className="text-lg font-black text-slate-100 text-center uppercase tracking-tight">Восстановление пароля</h3>
        {message ? (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-400 text-center">
            {message}
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
             {error && <div className="text-xs text-rose-400 text-center">{error}</div>}
             <input
               type="email"
               placeholder="Ваш Email"
               value={email}
               onChange={e => setEmail(e.target.value)}
               className="w-full bg-slate-950 text-slate-200 placeholder-slate-700 border border-slate-800 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-lime-400"
               required
             />
             <button
               type="submit"
               disabled={loading}
               className="w-full py-3 bg-lime-400 hover:bg-lime-300 text-slate-950 font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
             >
               {loading ? (
                 <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
               ) : 'Сбросить пароль'}
             </button>
          </form>
        )}
        <button onClick={() => setTab('auth')} className="w-full text-center text-xs text-slate-500 hover:text-slate-300 underline">Назад ко входу</button>
      </div>
    </div>
  );
};

/* ==========================================================================
   3. DASHBOARD VIEW
   ========================================================================== */
export const DashboardView: React.FC<{ setTab: (tab: string) => void, onUserClick?: (uid: string) => void }> = ({ setTab, onUserClick }) => {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  const loadSubmissions = () => {
    setSubmissions(LocalDb.getSubmissions());
  };

  useEffect(() => {
    loadSubmissions();
    window.addEventListener('fit_db_updated', loadSubmissions);
    return () => window.removeEventListener('fit_db_updated', loadSubmissions);
  }, []);

  const pendingCount = submissions.filter(s => s.status === 'pending').length;
  const approvedCount = submissions.filter(s => s.status === 'approved').length;

  return (
    <div className="max-w-xl mx-auto px-4 py-4 sm:py-6 space-y-6">
      
      {/* Главный дашборд-кристалл */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-5 rounded-3xl border border-slate-800 shadow-xl flex items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[10px] font-black uppercase text-lime-400 tracking-wider">Фитнес-статус</span>
          <h3 className="text-base sm:text-lg font-black text-slate-100 flex items-center gap-1.5 leading-tight">
            Привет, {user?.displayName}!
          </h3>
          <p className="text-xs text-slate-400">
            У вас <span className="text-lime-400 font-bold">{user?.points} XP</span> • <span className="italic">{user?.currentRank}</span>
          </p>
        </div>
        <RankBadge rankTitle={user?.currentRank || 'Новичок'} className="py-1.5 px-4 text-xs shadow-md shadow-lime-400/10" />
      </div>

      {/* Краткие счетчики */}
      <div className="grid grid-cols-2 gap-3 text-center">
        <div className="bg-slate-900/30 p-3.5 rounded-2xl border border-slate-800/60 font-medium">
          <span className="text-lg sm:text-xl font-bold font-mono text-emerald-450 text-emerald-450 text-emerald-400 block">{approvedCount}</span>
          <span className="text-[10px] uppercase font-black tracking-wider text-slate-500 block mt-1">Опубликовано</span>
        </div>
        <div className="bg-slate-900/30 p-3.5 rounded-2xl border border-slate-800/60 font-medium">
          <span className="text-lg sm:text-xl font-bold font-mono text-amber-500 block">{pendingCount}</span>
          <span className="text-[10px] uppercase font-black tracking-wider text-slate-500 block mt-1">Обрабатывается</span>
        </div>
      </div>

      {/* Ссылка на отправку норматива */}
      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex justify-between items-center gap-4">
        <div className="min-w-0">
          <h4 className="text-xs sm:text-sm font-bold text-slate-200">Провели тренировку?</h4>
          <p className="text-[10px] text-slate-500 truncate">Отправьте короткий клип для зачисления XP</p>
        </div>
        <button
          onClick={() => setTab('submit')}
          className="px-4 py-2 bg-lime-400 hover:bg-lime-300 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer shrink-0"
        >
          Загрузить видео
        </button>
      </div>

      {/* Заголовок Ленты */}
      <div className="flex justify-between items-center pt-2">
        <h3 className="text-xs sm:text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
          <Flame className="w-4 h-4 text-rose-500 animate-pulse" /> Свежие доказательства в РФ
        </h3>
        <span className="text-[10px] font-mono font-bold text-slate-500">Всего клипов: {submissions.length}</span>
      </div>

      {/* Лента заявок */}
      <div className="space-y-4">
        {submissions.length === 0 ? (
          <div className="text-center py-12 text-slate-600 space-y-2 bg-slate-900/10 rounded-2xl border border-dashed border-slate-800">
            <Video className="w-8 h-8 mx-auto opacity-50" />
            <p className="text-xs">Заявок пока нет. Будьте первыми!</p>
          </div>
        ) : (
          submissions.map(sub => (
            <SubmissionCard key={sub.id} submission={sub} onUserClick={onUserClick} />
          ))
        )}
      </div>
    </div>
  );
};

/* ==========================================================================
   4. SUBMIT ACHIEVEMENT VIEW
   ========================================================================== */
export const SubmitView: React.FC<{ setTab: (tab: string) => void }> = ({ setTab }) => {
  const { user } = useAuth();
  const [activeMode, setActiveMode] = useState<'upload' | 'manage'>('upload');
  const [mySubmissions, setMySubmissions] = useState<Submission[]>([]);

  const loadMySubmissions = () => {
    if (user) {
      setMySubmissions(LocalDb.getSubmissions().filter(s => s.userId === user.uid));
    }
  };

  useEffect(() => {
    loadMySubmissions();
    window.addEventListener('fit_db_updated', loadMySubmissions);
    return () => window.removeEventListener('fit_db_updated', loadMySubmissions);
  }, [user]);

  const handleDeleteSub = (id: string) => {
    if (window.confirm('Вы действительно хотите удалить эту запись и видеодоказательство?')) {
      LocalDb.deleteSubmission(id);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-4 sm:py-6 space-y-6">
      
      {/* Заголовок Студии */}
      <div className="text-center space-y-1.5">
        <h2 className="text-xl sm:text-2xl font-black text-slate-100 uppercase tracking-tight flex items-center justify-center gap-2">
          <Video className="w-5.5 h-5.5 text-lime-400" /> Творческая студия
        </h2>
        <p className="text-xs text-slate-400">Публикуйте фитнес-контент и управляйте своими видео</p>
      </div>

      {/* Переключатель табов на Tailwind */}
      <div className="grid grid-cols-2 p-1 bg-slate-900 border border-slate-800 rounded-2xl">
        <button
          onClick={() => setActiveMode('upload')}
          className={`py-2.5 px-4 font-black text-[11px] uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeMode === 'upload'
              ? 'bg-lime-400 text-slate-950 font-black'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <PlusCircle className="w-4 h-4 shrink-0" />
          Выложить контент
        </button>
        <button
          onClick={() => setActiveMode('manage')}
          className={`py-2.5 px-4 font-black text-[11px] uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeMode === 'manage'
              ? 'bg-lime-400 text-slate-950 font-black'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Video className="w-4 h-4 shrink-0" />
          Управление видео
          {mySubmissions.length > 0 && (
            <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-mono font-black ${
              activeMode === 'manage' ? 'bg-slate-950 text-lime-400' : 'bg-slate-800 text-slate-350'
            }`}>
              {mySubmissions.length}
            </span>
          )}
        </button>
      </div>

      {activeMode === 'upload' ? (
        <UploadForm onSuccess={() => {
          setActiveMode('manage');
        }} />
      ) : (
        <div className="space-y-4">
          {mySubmissions.length === 0 ? (
            <div className="text-center py-14 text-slate-600 bg-slate-900/10 rounded-2xl border border-dashed border-slate-800 space-y-3">
              <Video className="w-10 h-10 mx-auto opacity-45 text-slate-500" />
              <p className="text-xs max-w-xs mx-auto">У вас пока нет добавленных видеозаписей или тренировок.</p>
              <button
                onClick={() => setActiveMode('upload')}
                className="mt-1 bg-lime-400/10 hover:bg-lime-400/20 text-lime-400 font-bold text-xs uppercase tracking-wider px-4 py-2 border border-lime-400/20 rounded-xl transition-all cursor-pointer"
              >
                Создать первую запись
              </button>
            </div>
          ) : (
            mySubmissions.map(sub => {
              const workoutOpt = WORKOUT_OPTS.find(o => o.value === sub.workoutType);
              
              // Найдём джобу верификации
              const allJobs = LocalDb.getJobs();
              const matchedJob = allJobs.find(j => j.submissionId === sub.id);

              return (
                <div key={sub.id} className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 flex flex-col gap-3 relative overflow-hidden group">
                  
                  {/* Верхняя строка с типом тренировки и кнопкой удаления */}
                  <div className="flex justify-between items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{workoutOpt?.icon}</span>
                      <div>
                        <h4 className="text-xs font-black text-slate-100 uppercase tracking-wide">
                          {workoutOpt?.label.split(' ')[0]}
                        </h4>
                        <span className="text-[9px] text-slate-500 font-mono">
                          {new Date(sub.createdAt).toLocaleDateString('ru-RU', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteSub(sub.id)}
                      className="p-2 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white rounded-xl transition-all cursor-pointer border border-rose-500/20"
                      title="Удалить это видео"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Дополнительная карточка значения и превью видео */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    
                    {/* Текстовые данные */}
                    <div className="space-y-2 flex flex-col justify-between">
                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-550 text-slate-500 block">Размер результата:</span>
                        <span className="text-base font-black text-lime-400 leading-none">
                          {sub.workoutType === 'running' ? `${sub.countOrDistance} км` : `${sub.countOrDistance} раз`}
                        </span>
                        {sub.description && (
                          <p className="text-[10px] text-slate-400 italic leading-snug font-medium line-clamp-2 mt-1">
                            «{sub.description}»
                          </p>
                        )}
                      </div>
                      
                      {/* Очки/Статус */}
                      <span className="text-[10px] font-mono font-bold text-emerald-450 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg w-max flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Начислено +{sub.pointsAwarded} XP
                      </span>
                    </div>

                    {/* Маленький видео-плеер/превью */}
                    <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center">
                      <video
                        src={sub.videoUrl}
                        className="w-full h-full object-cover"
                        controls
                        muted
                        playsInline
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>

                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

/* ==========================================================================
   5. LEADERBOARD VIEW
   ========================================================================== */
export const LeaderboardView: React.FC<{ onUserClick?: (uid: string) => void }> = ({ onUserClick }) => {
  const { user } = useAuth();
  const [users, setUsers] = useState<any[]>([]);

  const loadData = () => {
    setUsers(LocalDb.getUsers());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('fit_db_updated', loadData);
    return () => window.removeEventListener('fit_db_updated', loadData);
  }, []);

  return (
    <div className="max-w-xl mx-auto px-4 py-4 sm:py-6 space-y-5">
      <LeaderboardTable currentUserUid={user?.uid} onUserClick={onUserClick} />
    </div>
  );
};

/* ==========================================================================
   6. PROFILE VIEW
   ========================================================================== */
const AVATAR_OPTIONS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
  'https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=150',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'
];

export const ProfileView: React.FC = () => {
  const { user, updateProfileData } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || AVATAR_OPTIONS[0]);
  const [frameId, setFrameId] = useState(user?.frameId || '');
  
  const [showEdit, setShowEdit] = useState(false);
  const [updatedOk, setUpdatedOk] = useState(false);

  // Sugar habit tracker logic inside ProfileView
  const [habitDays, setHabitDays] = useState<any[]>([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
  };

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const loadHabitDays = () => {
    if (!user) return;
    let items = LocalDb.getHabitDays().filter(h => h.userId === user.uid && h.habitType === 'no_sugar');
    
    const pDates = getPastDates();
    if (pDates.length > 0) {
      const lastDateStr = pDates[pDates.length - 1].dateStr;
      const hasLastDay = items.some(h => h.date === lastDateStr);
      if (items.length === 0 && !hasLastDay) {
        // Подставим последний день как пройденный («прошел») для красивой наглядности,
        // а остальные дни сетки будут чистыми и готовыми к заполнению
        LocalDb.toggleHabitDay(user.uid, lastDateStr, 'no_sugar', 'clean');
        items = LocalDb.getHabitDays().filter(h => h.userId === user.uid && h.habitType === 'no_sugar');
      }
    }
    setHabitDays(items);
  };

  useEffect(() => {
    loadHabitDays();
    window.addEventListener('fit_db_updated', loadHabitDays);
    return () => window.removeEventListener('fit_db_updated', loadHabitDays);
  }, [user]);

  const handleToggleSugar = (dateStr: string) => {
    if (!user) return;
    const existing = habitDays.find(h => h.date === dateStr);
    if (!existing) {
      LocalDb.toggleHabitDay(user.uid, dateStr, 'no_sugar', 'clean');
    } else if (existing.status === 'clean') {
      LocalDb.toggleHabitDay(user.uid, dateStr, 'no_sugar', 'failed');
      const motivationalMessages = [
        "Срывы — это неотъемлемая часть пути к успеху! Главная победа — это умение подняться после падения и упорно продолжить начатое. Сделайте выводы и продолжайте путь! 💪✨",
        "Один промах абсолютно не перечеркивает ваши предыдущие чистые дни и колоссальный прогресс. Расправьте плечи и начните чистый день прямо сейчас! 🚫🍰",
        "Развитие силы воли — это марафон, а не спринт. Ошиблись? Ничего страшного. Важен не мгновенный результат, а ваша настойчивость сегодня. Продолжаем! 🔥"
      ];
      const randomMsg = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
      triggerToast(randomMsg);
    } else {
      LocalDb.toggleHabitDay(user.uid, dateStr, 'no_sugar', 'failed'); // repeats failed to delete it
    }
  };

  // Past 14 dates
  const getPastDates = () => {
    const dates = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const dateStr = `${yyyy}-${mm}-${dd}`;
      dates.push({
        dateStr,
        dayName: d.toLocaleDateString('ru-RU', { weekday: 'short' }),
        dayNum: d.getDate(),
        monthName: d.toLocaleDateString('ru-RU', { month: 'short' })
      });
    }
    return dates;
  };

  const datesList = getPastDates();
  const cleanCount = habitDays.filter(h => h.status === 'clean').length;
  const failedCount = habitDays.filter(h => h.status === 'failed').length;

  // Подсчитаем прогресс до следующего ранга
  const points = user?.points || 0;
  const currentRankIndex = RANKS.findIndex(r => r.title === user?.currentRank);
  const nextRank = currentRankIndex >= 0 && currentRankIndex < RANKS.length - 1 ? RANKS[currentRankIndex + 1] : null;
  const currentRank = currentRankIndex >= 0 ? RANKS[currentRankIndex] : RANKS[0];

  let pointsProgress = 100;
  if (nextRank) {
    const range = nextRank.minPoints - currentRank.minPoints;
    const currentDiff = points - currentRank.minPoints;
    pointsProgress = Math.min(100, Math.max(0, Math.floor((currentDiff / range) * 100)));
  }

  // Обновление профиля
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfileData(displayName, bio, avatarUrl, frameId);
    setShowEdit(false);
    setUpdatedOk(true);
    setTimeout(() => setUpdatedOk(false), 2000);
  };

  const subStatus = user?.subscriptionStatus || 'free';

  return (
    <div className="max-w-xl mx-auto px-4 py-4 sm:py-6 space-y-6 relative">
      
      {/* Toast Notification for Sweet sugar relapse */}
      {showToast && (
        <div className="fixed bottom-6 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50 bg-slate-900/95 border border-amber-500/40 text-slate-100 p-4 rounded-2xl shadow-2xl flex items-start gap-3 transition-all animate-in fade-in slide-in-from-bottom-5 duration-300 backdrop-blur-md">
          <div className="p-2 bg-amber-500/15 rounded-xl text-amber-400 shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div className="space-y-1 flex-1 text-left">
            <h5 className="text-[11px] font-black text-amber-400 uppercase tracking-widest leading-none">
              Дневник Силы Воли
            </h5>
            <p className="text-[10px] text-slate-300 leading-relaxed font-semibold">
              {toastMessage}
            </p>
          </div>
          <button 
            type="button"
            onClick={() => setShowToast(false)}
            className="text-slate-500 hover:text-slate-300 transition-colors p-1"
          >
            <span className="text-xs">✕</span>
          </button>
        </div>
      )}
      
      {/* Карточка Пользователя */}
      <div className={`p-5 rounded-3xl border flex flex-col items-center text-center space-y-4 relative overflow-hidden transition-all ${
        subStatus === 'elite'
          ? 'bg-gradient-to-br from-slate-900 via-rose-950/20 to-amber-955/10 border-rose-500/40 shadow-2xl shadow-rose-500/10'
          : subStatus === 'pro'
          ? 'bg-gradient-to-br from-slate-900 via-slate-900/40 to-lime-955/10 border-lime-500/40 shadow-xl shadow-lime-500/5'
          : subStatus === 'member'
          ? 'bg-slate-900/60 border-cyan-500/30 shadow-md shadow-cyan-500/5'
          : 'bg-slate-900/40 border-slate-800'
      }`}>
        
        {/* Аватар */}
        <div className="relative select-none">
          <img
            src={user?.avatarUrl}
            alt={user?.displayName}
            className={`w-20 h-20 rounded-full object-cover transition-all flex items-center justify-center shrink-0 ${getAvatarClasses(user, 'large')}`}
            referrerPolicy="no-referrer"
          />
          {subStatus === 'elite' && (
            <span className="absolute -top-2.5 -left-2.5 text-2xl drop-shadow">👑</span>
          )}
          {subStatus === 'pro' && (
            <span className="absolute -top-2.5 -left-2.5 text-2xl drop-shadow">⭐️</span>
          )}
          <span className="absolute -bottom-1 -right-1 bg-lime-400 text-[11px] p-1.5 rounded-full border border-slate-950 text-slate-950 font-bold">
            <UserCheck className="w-3.5 h-3.5" />
          </span>
        </div>

        {/* Имя и Ранг с роскошными цветами ТГ-Премиум и игровых статусов */}
        <div className="space-y-1 w-full text-center">
          <h3 className="text-lg font-black flex items-center justify-center gap-1.5">
            {subStatus === 'elite' ? (
              <span className="bg-gradient-to-r from-rose-450 via-amber-400 to-rose-400 bg-clip-text text-transparent font-black text-xl tracking-tight drop-shadow-[0_2px_8px_rgba(244,63,94,0.4)] select-none flex items-center gap-1">
                {user?.displayName} <span className="text-base">👑</span>
              </span>
            ) : subStatus === 'pro' ? (
              <span className="text-lime-400 font-extrabold text-lg tracking-wide drop-shadow-[0_0_6px_rgba(163,230,53,0.35)] select-none flex items-center gap-1">
                {user?.displayName} <span className="text-xs">⭐️</span>
              </span>
            ) : subStatus === 'member' ? (
              <span className="text-cyan-400 font-bold text-base flex items-center gap-1">
                {user?.displayName} <span className="text-[10px]">⚡</span>
              </span>
            ) : (
              <span className="text-slate-100 font-bold">{user?.displayName}</span>
            )}
          </h3>
          <p className="text-[10px] text-slate-500 font-semibold font-mono tracking-wider">{user?.email}</p>
          {user?.bio ? (
            <p className="max-w-xs mx-auto text-xs text-slate-400 italic leading-snug">«{user.bio}»</p>
          ) : (
            <p className="text-[10px] text-slate-600 italic">Подпись профиля пуста</p>
          )}
        </div>

        {/* Бейджи подписки и ранга */}
        <div className="flex gap-2">
          <RankBadge rankTitle={user?.currentRank || 'Новичок'} />
          <span className={`inline-flex px-3 py-1 font-black text-[10px] uppercase tracking-wider rounded-full border ${
            subStatus === 'elite'
              ? 'border-rose-500/30 text-rose-400 bg-rose-500/10'
              : subStatus === 'pro'
              ? 'border-lime-400/30 text-lime-400 bg-lime-400/10'
              : subStatus === 'member'
              ? 'border-cyan-400/30 text-cyan-400 bg-cyan-400/10'
              : 'border-slate-800 text-slate-400'
          }`}>
            ТАРИФ: {subStatus}
          </span>
        </div>

        {/* Прогресс-бар XP */}
        {nextRank && (
          <div className="w-full text-left space-y-1 bg-slate-950/85 p-4 rounded-xl border border-slate-800/80 pb-4">
            <div className="flex justify-between text-[11px] font-bold text-slate-400">
              <span>До ранга {nextRank.title}</span>
              <span>
                {points} / {nextRank.minPoints} XP
              </span>
            </div>
            <div className="h-2 bg-slate-900 rounded-full overflow-hidden">
              <div
                className="h-full bg-lime-400 rounded-full transition-all duration-500"
                style={{ width: `${pointsProgress}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex justify-center gap-2 w-full pt-1">
          <button
            onClick={() => setShowEdit(!showEdit)}
            className="flex items-center gap-1.5 bg-slate-850 hover:bg-slate-855 text-white font-black text-xs px-4 py-2.5 rounded-xl border border-slate-700 cursor-pointer transition-colors w-full justify-center"
          >
            <Edit3 className="w-4 h-4 text-lime-400" /> Редактировать профиль
          </button>
        </div>
      </div>

      {updatedOk && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs text-center rounded-xl flex items-center justify-center gap-1.5">
          <CheckCircle2 className="w-4 h-4" /> Профиль успешно сохранен!
        </div>
      )}

      {/* Редактирование Формы */}
      {showEdit && (
        <form onSubmit={handleSave} className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="text-left space-y-1">
            <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">Настройки карточки</h4>
            <p className="text-[10px] text-slate-500">Измените имя, аватарку и подпись профиля</p>
          </div>

          {/* Слайдер Аватаров */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-450 text-slate-400 uppercase tracking-widest block mb-1">
              Выберите быстрый аватар
            </label>
            <div className="flex flex-wrap gap-2.5">
              {AVATAR_OPTIONS.map((av, index) => {
                const isSelected = avatarUrl === av;
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setAvatarUrl(av)}
                    className={`relative w-11 h-11 rounded-full overflow-hidden border-2 transition-all cursor-pointer ${
                      isSelected ? 'border-lime-400 scale-105 shadow-inner' : 'border-slate-800 grayscale opacity-60 hover:opacity-100 hover:grayscale-0'
                    }`}
                  >
                    <img src={av} alt="option" className="w-full h-full object-cover" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Загрузка фото профиля */}
          <div className="space-y-2 bg-slate-900/40 p-3.5 rounded-2xl border border-slate-850/70">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block">Загрузить фото профиля</label>
              <span className="text-[8px] bg-lime-400/10 text-lime-400 font-extrabold px-1.5 py-0.5 rounded border border-lime-400/15 uppercase font-mono">Доступно всем</span>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Превью текущей/новой аватарки */}
              <div className="w-12 h-12 rounded-full border border-slate-750 bg-slate-950 overflow-hidden shrink-0">
                <img src={avatarUrl} alt="avatar preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              
              <label className="flex-1 flex flex-col items-center justify-center border border-dashed border-slate-800 hover:border-lime-400/50 bg-slate-950 hover:bg-slate-950/80 p-3 rounded-xl cursor-pointer transition-all group relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (file.size > 3 * 1024 * 1024) {
                        triggerToast("Размер изображения не должен превышать 3 МБ! 🚫");
                        return;
                      }
                      const reader = new FileReader();
                      reader.onload = () => {
                        if (typeof reader.result === 'string') {
                          setAvatarUrl(reader.result);
                          triggerToast("Фото успешно прочитано! Нажмите 'Сохранить' ниже. ✨");
                        }
                      };
                      reader.onerror = () => {
                        triggerToast("Не удалось прочитать файл изображения.");
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="hidden"
                />
                <div className="flex items-center gap-1.5">
                  <div className="p-1 min-w-[20px] bg-slate-900 text-slate-400 group-hover:text-lime-400 rounded-lg group-hover:bg-lime-400/10 transition-colors">
                    <PlusCircle className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-400 group-hover:text-lime-400 tracking-wide transition-colors">Выбрать изображение</span>
                </div>
                <span className="text-[8px] text-slate-600 block mt-1">PNG, JPG, WebP до 3 МБ</span>
              </label>
            </div>
            
            {avatarUrl.startsWith('data:image') && (
              <p className="text-[9px] text-lime-400 font-medium leading-none flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Файл готов к сохранению в базу устройств!
              </p>
            )}
          </div>

          {/* Слайдер Кастомных Рамок (PRO / ELITE) */}
          {(subStatus === 'pro' || subStatus === 'elite') && (
            <div className="space-y-2 bg-slate-900/40 p-3.5 rounded-2xl border border-slate-850/70">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block">Премиальная рамка</label>
                <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded uppercase font-mono ${
                  subStatus === 'elite' ? 'bg-rose-500/10 text-rose-400 border-rose-500/15' : 'bg-lime-400/10 text-lime-400 border-lime-400/15'
                }`}>{subStatus} Доступ</span>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-4 snap-x hide-scrollbar">
                <button
                  type="button"
                  onClick={() => setFrameId('')}
                  className={`snap-center shrink-0 w-14 h-14 rounded-full flex items-center justify-center border-2 transition-all ${
                    !frameId ? 'border-lime-400 bg-lime-400/10' : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                  }`}
                >
                  <Ban className="w-5 h-5 text-slate-500" />
                </button>
                {AVATAR_FRAMES.map((frame) => {
                  if (frame.tier === 'elite' && subStatus !== 'elite') return null;
                  const isSelected = frameId === frame.id;
                  
                  return (
                    <button
                      key={frame.id}
                      type="button"
                      onClick={() => setFrameId(frame.id)}
                      className={`snap-center shrink-0 relative transition-transform ${isSelected ? 'scale-110 z-10' : 'hover:scale-105'}`}
                      title={frame.name}
                    >
                      <div className={`w-14 h-14 rounded-full flex items-center justify-center border-4 border-transparent ${frame.classes} ${
                        isSelected ? 'ring-offset-2 ring-offset-lime-400 shadow-[0_0_15px_rgba(163,230,53,0.3)]' : ''
                      }`}>
                        {/* Показательный аватар внутри рамки */}
                         <img src={avatarUrl} alt="avatar preview" className="w-full h-full rounded-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      {frame.tier === 'elite' && (
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-rose-500 text-[6px] font-black uppercase px-1 rounded text-white shadow-lg">
                          Elite
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Псевдоним</label>
            <input
              type="text"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              className="w-full bg-slate-900 text-slate-200 border border-slate-800 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-lime-400"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Био (О себе)</label>
            <input
              type="text"
              value={bio}
              onChange={e => setBio(e.target.value)}
              className="w-full bg-slate-900 text-slate-200 border border-slate-800 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-lime-400"
            />
          </div>

          <div className="flex gap-2 pt-1.5">
            <button
              type="submit"
              className="flex-1 py-2.5 px-4 bg-lime-400 hover:bg-lime-300 text-slate-950 font-black text-xs rounded-xl cursor-pointer"
            >
              Сохранить
            </button>
            <button
              type="button"
              onClick={() => setShowEdit(false)}
              className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-400 font-bold text-xs rounded-xl cursor-pointer"
            >
              Отмена
            </button>
          </div>
        </form>
      )}

      {/* Sugar Habit Tracker - Дневник отказа от сахара */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="space-y-1">
            <h3 className="text-xs font-black text-lime-400 uppercase tracking-widest flex items-center gap-1.5">
              🚫 Трекер отказа от сахара
            </h3>
            <p className="text-[10px] text-slate-500 font-medium">
              Каждый день вашей силы воли. Жмите на квадрат для отметки!
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-[9px] font-mono font-black shrink-0">
            <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">✔️ Чистых дней: {cleanCount} из 14</span>
            <span className="bg-red-500/10 text-red-400 px-2 py-0.5 rounded border border-red-500/20">❌ Срыв: {failedCount}</span>
          </div>
        </div>

        {/* Календарная сетка за последние 14 дней */}
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 pt-1">
          {datesList.map((dt) => {
            const recorded = habitDays.find(h => h.date === dt.dateStr);
            const status = recorded?.status;

            return (
              <div
                key={dt.dateStr}
                onClick={() => handleToggleSugar(dt.dateStr)}
                className={`relative rounded-xl py-2 px-1 flex flex-col items-center justify-between min-h-[64px] transition-all cursor-pointer border select-none group focus:outline-none ${
                  status === 'clean'
                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 hover:bg-emerald-500/25 shadow-md shadow-emerald-500/5'
                    : status === 'failed'
                    ? 'bg-red-500/10 border-red-500 text-red-400 hover:bg-red-500/25 shadow-md shadow-red-500/5'
                    : 'bg-slate-950 border-slate-850 hover:border-slate-800 text-slate-400 hover:bg-slate-900'
                }`}
              >
                {/* Visual day indicators */}
                <span className="text-[9px] font-bold text-slate-500 uppercase font-mono tracking-tight leading-none">{dt.dayName}</span>
                
                <div className="my-1.5 flex items-center justify-center">
                  {status === 'clean' ? (
                    <span className="text-sm">✔️</span>
                  ) : status === 'failed' ? (
                    <span className="text-sm">❌</span>
                  ) : (
                    <span className="text-xs font-mono font-black text-slate-400 leading-none">{dt.dayNum}</span>
                  )}
                </div>

                <span className="text-[8px] font-bold uppercase tracking-wider scale-90 leading-none opacity-80">
                  {status === 'clean' ? 'Пресс!' : status === 'failed' ? 'Срыв' : 'Отметить'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Список спортивных достижений */}
      <div className="space-y-3.5">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 pt-2">
          <Star className="w-4 h-4 text-lime-400" /> Спортивные достижения ({ACHIEVEMENTS.length})
        </h3>
        <div className="grid grid-cols-1 gap-3">
          {ACHIEVEMENTS.map(ach => {
            let unlocked = false;
            let progress = 0;

            if (ach.id === 'ach_1') {
              const userSubmissions = LocalDb.getSubmissions().filter(s => s.userId === user?.uid);
              const hasApproved = userSubmissions.some(s => s.status === 'approved');
              unlocked = hasApproved;
              progress = hasApproved ? 100 : (userSubmissions.length > 0 ? 50 : 0);
            } else if (ach.id === 'ach_2') {
              const userSubmissions = LocalDb.getSubmissions().filter(s => s.userId === user?.uid);
              const maxPushups = Math.max(...userSubmissions.filter(s => s.workoutType === 'push-ups').map(s => s.countOrDistance), 0);
              unlocked = maxPushups >= 50;
              progress = Math.min(100, Math.floor((maxPushups / 50) * 100));
            } else if (ach.id === 'ach_3') {
              const userSubmissions = LocalDb.getSubmissions().filter(s => s.userId === user?.uid);
              const maxRun = Math.max(...userSubmissions.filter(s => s.workoutType === 'running').map(s => s.countOrDistance), 0);
              unlocked = maxRun >= 10;
              progress = Math.min(100, Math.floor((maxRun / 10) * 100));
            } else if (ach.id === 'ach_4') {
              unlocked = user?.subscriptionStatus === 'elite';
              progress = unlocked ? 100 : (user?.subscriptionStatus === 'pro' ? 50 : 10);
            }

            return (
              <AchievementCard
                key={ach.id}
                achievement={ach}
                unlocked={unlocked}
                progress={progress}
              />
            );
          })}
        </div>
      </div>

    </div>
  );
};

/* ==========================================================================
   7. SUBSCRIPTIONS VIEW
   ========================================================================== */
const TIER_PLANS = [
  {
    id: 'free' as SubscriptionStatus,
    name: 'Фитнес-старт',
    price: '500 ₽',
    duration: 'всегда',
    features: [
      'Участие в общем фитнес-лидерборде',
      'Ежедневная активность',
      'Базовая аналитика тренировок',
      'Добавление до 3 видео-отчетов в день'
    ]
  },
  {
    id: 'pro' as SubscriptionStatus,
    name: 'Фитнес-профи',
    price: '500 ₽',
    duration: 'месяц',
    features: [
      '⚡️ Безлимитная загрузка видео-отчетов',
      '⭐️ Приоритетное участие в челленджах',
      '📊 Продвинутая аналитика прогресса',
      '🛡 Статус подтвержденного атлета'
    ]
  },
  {
    id: 'elite' as SubscriptionStatus,
    name: 'Фитнес-элита',
    price: '999 ₽',
    duration: 'месяц',
    features: [
      '👑 Пожизненный статус "Elite-спортсмен"',
      '🖼 Персональный брендинг на видео',
      '🌈 Индивидуальный анализ техники',
      '🤝 Прямой доступ к фитнес-комьюнити'
    ]
  }
];

export const SubscriptionView: React.FC = () => {
  const { user, updateSubscription } = useAuth();
  const [showPayoutModal, setShowPayoutModal] = useState<string | null>(null);

  const handleUpgrade = (tier: SubscriptionStatus) => {
    // Показать кастомный красивый поп-ап оплаты
    setShowPayoutModal(tier);
  };

  const confirmPay = async () => {
    if (!showPayoutModal) return;
    await updateSubscription(showPayoutModal as SubscriptionStatus);
    setShowRecall(true);
    setShowPayoutModal(null);
    setTimeout(() => setShowRecall(false), 2500);
  };

  const [showRecall, setShowRecall] = useState(false);

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 sm:py-6 space-y-6">
      
      <div className="text-center space-y-1.5 mb-2">
        <h2 className="text-xl sm:text-2xl font-black text-slate-100 uppercase tracking-tight">Подписка и Квоты</h2>
        <p className="text-xs text-slate-400">Повысьте лимиты обработки видео и разблокируйте уникальные элементы кастомизации с Pro и Elite тарифами</p>
      </div>

      {/* Основные плюсы преимуществ */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 sm:p-5 grid grid-cols-1 md:grid-cols-3 gap-4 text-left shadow-lg">
        <div className="space-y-1 p-3 rounded-xl bg-slate-950/50 border border-slate-900 flex flex-col justify-between">
          <div className="space-y-1">
            <h4 className="text-[11px] font-black text-lime-400 uppercase tracking-wider flex items-center gap-1.5">
              ⚡️ Молниеносная публикация
            </h4>
            <p className="text-[10px] text-slate-400 leading-normal">
              Приоритетная очередь обработки медиа-файлов публикует видео за секунды.
            </p>
          </div>
          <span className="text-[9px] font-mono text-lime-500/80 mt-2 font-black">Скорость: до 5 сек</span>
        </div>
        <div className="space-y-1 p-3 rounded-xl bg-slate-950/50 border border-slate-900 flex flex-col justify-between">
          <div className="space-y-1">
            <h4 className="text-[11px] font-black text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
              🎨 Кастомизация Профиля
            </h4>
            <p className="text-[10px] text-slate-400 leading-normal">
              Эксклюзивные рамки, цветные или градиентные никнеймы и уникальные статус-значки.
            </p>
          </div>
          <span className="text-[9px] font-mono text-rose-400 mt-2 font-black">Стиль: Pro & Elite статусы</span>
        </div>
        <div className="space-y-1 p-3 rounded-xl bg-slate-950/50 border border-slate-900 flex flex-col justify-between">
          <div className="space-y-1">
            <h4 className="text-[11px] font-black text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
              📋 Лимиты и Поддержка
            </h4>
            <p className="text-[10px] text-slate-400 leading-normal">
              Безлимитные программы тренировок и разбор спорных моментов тренером.
            </p>
          </div>
          <span className="text-[9px] font-mono text-cyan-400 mt-2 font-black">Доступ: Полный анлим</span>
        </div>
      </div>

      {/* Интерактивная Панель Текущих Лимитов Аккаунта */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-slate-800/85 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-850">
          <div>
            <h4 className="text-xs font-black text-slate-200 uppercase tracking-widest flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-lime-400" /> Текущие лимиты и статус вашего аккаунта
            </h4>
            <p className="text-[10px] text-slate-400">Вся информация по ограничениям вашей учетной записи: {user?.email}</p>
          </div>
          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            <span className="text-[10px] text-slate-500 font-mono">Ваш статус:</span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase font-mono ${
              user?.subscriptionStatus === 'elite'
                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                : user?.subscriptionStatus === 'pro'
                ? 'bg-lime-400/10 text-lime-400 border border-lime-400/20'
                : user?.subscriptionStatus === 'member'
                ? 'bg-cyan-400/10 text-cyan-400 border border-cyan-400/20'
                : 'bg-slate-950 text-slate-400 border border-slate-800'
            }`}>
              {user?.subscriptionStatus || 'free'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {/* Лимит на Свои Фото Профиля */}
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-900 space-y-1.5">
            <div className="flex justify-between items-center text-[10px]">
              <span className="font-bold text-slate-300">Загрузка фото профиля</span>
              <span className="text-lime-400 font-extrabold text-[9px] uppercase font-mono">БЕЗ ЛИМИТОВ ✅</span>
            </div>
            <div className="h-1 w-full bg-slate-900 rounded-full overflow-hidden">
              <div className="h-full bg-lime-400 w-full rounded-full" />
            </div>
            <p className="text-[9px] text-slate-500 leading-normal">
              По вашему запросу лимит на аватары снят! Вы можете загружать любые JPEG/PNG с устройства.
            </p>
          </div>

          {/* Лимит на видео */}
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-900 space-y-1.5">
            <div className="flex justify-between items-center text-[10px]">
              <span className="font-bold text-slate-300">Публикации видео в день</span>
              {user?.subscriptionStatus === 'free' ? (
                <span className="text-amber-400 font-bold text-[9px] font-mono">3 в сутки ⏳</span>
              ) : (
                <span className="text-lime-400 font-extrabold text-[9px] uppercase font-mono">БЕЗЛИМИТНО 🚀</span>
              )}
            </div>
            <div className="h-1 w-full bg-slate-900 rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${user?.subscriptionStatus === 'free' ? 'bg-amber-400 w-1/3' : 'bg-lime-400 w-full'}`} />
            </div>
            <p className="text-[9px] text-slate-500 leading-normal">
              {user?.subscriptionStatus === 'free' 
                ? 'Для бесплатного тарифа. Обновите тариф до PRO / ELITE для снятия лимитов.' 
                : 'У вас активен полный доступ! Публикуйте видео без ограничений.'}
            </p>
          </div>

          {/* Раздел Дневника */}
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-900 space-y-1.5">
            <div className="flex justify-between items-center text-[10px]">
              <span className="font-bold text-slate-300">Дневник тренировок</span>
              {user?.subscriptionStatus === 'free' ? (
                <span className="text-rose-400 font-bold text-[9px] font-mono">ЗАКРЫТО 🔒</span>
              ) : (
                <span className="text-lime-400 font-extrabold text-[9px] uppercase font-mono">ДОСТУПНО ✅</span>
              )}
            </div>
            <div className="h-1 w-full bg-slate-900 rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${user?.subscriptionStatus === 'free' ? 'bg-rose-500 w-0' : 'bg-lime-400 w-full'}`} />
            </div>
            <p className="text-[9px] text-slate-500 leading-normal">
              {user?.subscriptionStatus === 'free'
                ? 'Дневник и трекеры заблокированы. Приобретите PRO тариф или Elite, чтобы разблокировать.'
                : 'Доступ полностью открыт! Записывайте подходы, веса и ведите детальный учет прогресса.'}
            </p>
          </div>

          {/* Кастомизация Профиля */}
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-900 space-y-1.5">
            <div className="flex justify-between items-center text-[10px]">
              <span className="font-bold text-slate-300">Кастомизация стиля</span>
              {user?.subscriptionStatus === 'free' ? (
                <span className="text-slate-500 font-bold text-[9px] font-mono">СТАНДАРТ ⚪</span>
              ) : user?.subscriptionStatus === 'pro' ? (
                <span className="text-amber-400 font-bold text-[9px] font-mono">PRO СТИЛЬ ⭐️</span>
              ) : (
                <span className="text-rose-400 font-extrabold text-[9px] uppercase font-mono">ELITE СТИЛЬ 👑</span>
              )}
            </div>
            <div className="h-1 w-full bg-slate-900 rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${
                user?.subscriptionStatus === 'free' ? 'bg-slate-700 w-1/4' : user?.subscriptionStatus === 'pro' ? 'bg-amber-400 w-2/3' : 'bg-rose-400 w-full'
              }`} />
            </div>
            <p className="text-[9px] text-slate-500 leading-normal">
              {user?.subscriptionStatus === 'free'
                ? 'Никнейм базового цвета и стандартная аватарка. Элитные рамки и градиенты закрыты.'
                : 'Вам доступны расширенные кастомизации имени, рамка аватара и премиум статус-значки!'}
            </p>
          </div>

          {/* Длина Клипа */}
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-900 space-y-1.5 col-span-1 sm:col-span-2">
            <div className="flex justify-between items-center text-[10px]">
              <span className="font-bold text-slate-300">Длина видеофайлов (видеоподтверждение)</span>
              <span className="text-lime-400 font-extrabold text-[9px] uppercase font-mono">До 30 секунд (MVP) 📹</span>
            </div>
            <div className="h-1 w-full bg-slate-900 rounded-full overflow-hidden">
              <div className="h-full bg-lime-400 w-3/4 rounded-full" />
            </div>
            <p className="text-[9px] text-slate-500 leading-normal">
              Для удобного просмотра на мобильных устройствах мы рекомендуем отправлять короткие ролики упражнений. Лимит одинаков для всех тарифов в демо-контуре.
            </p>
          </div>
        </div>
      </div>

      {showRecall && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold text-center rounded-xl flex items-center justify-center gap-1.5 animate-pulse">
          <Sparkles className="w-5 h-5 text-amber-400" /> Подписка успешно обновлена! Привилегии вступили в силу.
        </div>
      )}

      {/* Сетка тарифов */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {TIER_PLANS.map(plan => (
          <SubscriptionPlanCard
            key={plan.id}
            id={plan.id}
            name={plan.name}
            price={plan.price}
            duration={plan.duration}
            features={plan.features}
            isActive={user?.subscriptionStatus === plan.id}
            onSelect={handleUpgrade}
          />
        ))}
      </div>

      {/* Косметический Paywall Модал Оплаты */}
      {showPayoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl max-w-sm w-full space-y-5 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="text-center space-y-1.5">
              <div className="w-12 h-12 rounded-full bg-lime-400/15 text-lime-400 flex items-center justify-center mx-auto mb-1">
                <CreditCard className="w-6 h-6 animate-pulse" />
              </div>
              <h3 className="text-base font-black text-slate-100 uppercase tracking-tight">Эмулированный шлюз оплаты</h3>
              <p className="text-xs text-slate-500">Вы подключаете тариф <span className="text-lime-400 font-bold uppercase">{showPayoutModal}</span></p>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs space-y-2 font-mono text-slate-400">
              <div className="flex justify-between pb-1.5 border-b border-slate-900">
                <span>Получатель:</span>
                <span className="text-slate-200 font-bold">Fitness PWA Russia</span>
              </div>
              <div className="flex justify-between pb-1.5 border-b border-slate-900">
                <span>Стоимость:</span>
                <span className="text-lime-400 font-bold">
                  {TIER_PLANS.find(p => p.id === showPayoutModal)?.price}
                </span>
              </div>
              <div className="text-[10px] text-slate-500 text-center leading-normal pt-1 italic">
                Для MVP оплаты нет. Нажмите «Оплатить», чтобы мгновенно протестировать зачисление тарифа флагом!
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={confirmPay}
                className="flex-1 py-3 bg-lime-400 hover:bg-lime-300 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer"
              >
                Оплатить (Эмуляция)
              </button>
              <button
                onClick={() => setShowPayoutModal(null)}
                className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-400 font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


/* ==========================================================================
   8. PAYWALL OVERLAY
   ========================================================================== */
const PaywallOverlay: React.FC<{ tabName: string }> = ({ tabName }) => {
  const { updateSubscription } = useAuth();
  const handleActivate = async () => {
    await updateSubscription('member');
  };

  return (
    <div className="absolute inset-x-0 top-0 bottom-0 z-30 flex flex-col items-center justify-start pt-16 sm:pt-24 px-4 bg-slate-950/75 backdrop-blur-md rounded-3xl select-none">
      <div className="max-w-md w-full text-center space-y-5 bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="w-14 h-14 rounded-full bg-lime-400/10 text-lime-400 flex items-center justify-center mx-auto shadow-lg shadow-lime-400/10">
          <CreditCard className="w-7 h-7 animate-pulse" />
        </div>
        <div className="space-y-2">
          <span className="text-[10px] font-black tracking-widest text-lime-400 uppercase bg-lime-400/10 px-2.5 py-1 rounded-full">
            Закрытая Fitness Сеть
          </span>
          <h3 className="text-lg sm:text-l font-black text-slate-100 uppercase tracking-tight">
            Доступ заблокирован
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Раздел <span className="text-slate-200 font-bold">«{tabName}»</span> доступен только членам клуба. Активируйте членство прямо сейчас бесплатно в рамках демонстрационного MVP контура!
          </p>
        </div>
        <div className="pt-2 font-mono text-[9px] text-slate-500 bg-slate-950 py-2.5 px-4 rounded-xl border border-slate-800/50 leading-relaxed">
          ⚡ Статус изменится на <span className="text-lime-400">member</span>. Все ограничения мгновенно снимутся.
        </div>
        <button
          onClick={handleActivate}
          className="w-full py-3 bg-lime-400 hover:bg-lime-300 text-slate-950 font-black text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-lime-400/20 active:scale-95 transition-all cursor-pointer"
        >
          Активировать членство (0 ₽)
        </button>
      </div>
    </div>
  );
};


/* ==========================================================================
   9. DIARY VIEW
   ========================================================================== */
export const DiaryView: React.FC<{ setTab: (tab: string) => void }> = ({ setTab }) => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const d = new Date();
    const offset = d.getTimezoneOffset();
    const local = new Date(d.getTime() - offset * 60 * 1000);
    return local.toISOString().split('T')[0];
  });

  const [workoutDays, setWorkoutDays] = useState<any[]>([]);
  const [workoutEntries, setWorkoutEntries] = useState<any[]>([]);
  
  const [newDayTitle, setNewDayTitle] = useState('');
  const [showAddDayForm, setShowAddDayForm] = useState(false);

  const [exerciseName, setExerciseName] = useState('');
  const [exerciseType, setExerciseType] = useState<WorkoutType | 'other'>('push-ups');
  const [sets, setSets] = useState<number>(3);
  const [comment, setComment] = useState('');

  // Weekly planner
  const [weeklyTarget, setWeeklyTarget] = useState<number>(() => {
    return parseInt(localStorage.getItem('fit_weekly_training_target') || '3');
  });

  const handleWeeklyTargetChange = (val: number) => {
    const lim = Math.max(1, Math.min(7, val));
    setWeeklyTarget(lim);
    localStorage.setItem('fit_weekly_training_target', String(lim));
  };

  // State structure for individual set inputs
  const [setsList, setSetsList] = useState<{ reps: number; weight: number }[]>([
    { reps: 10, weight: 0 },
    { reps: 10, weight: 0 },
    { reps: 10, weight: 0 }
  ]);

  const handleSetsChange = (numSets: number) => {
    const val = Math.min(50, Math.max(1, numSets));
    setSets(val);
    const newList = [...setsList];
    if (val > newList.length) {
      for (let i = newList.length; i < val; i++) {
        newList.push({
          reps: newList[newList.length - 1]?.reps || 10,
          weight: newList[newList.length - 1]?.weight || 0
        });
      }
    } else {
      newList.splice(val);
    }
    setSetsList(newList);
  };

  useEffect(() => {
    const handleUpdate = () => {
      setWorkoutDays(LocalDb.getWorkoutDays());
      setWorkoutEntries(LocalDb.getWorkoutEntries());
    };

    handleUpdate();
    window.addEventListener('fit_db_updated', handleUpdate);
    return () => window.removeEventListener('fit_db_updated', handleUpdate);
  }, []);

  if (!user) return null;

  const activeDay = workoutDays.find(d => d.date === selectedDate && d.userId === user.uid);
  const activeEntries = activeDay ? workoutEntries.filter(e => e.dayId === activeDay.id) : [];

  // Completed days over latest 7 day window
  const completedThisWeek = workoutDays.filter(day => {
    const dayDate = new Date(day.date);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - dayDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && day.userId === user.uid;
  }).length;

  const handleCreateDay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDayTitle.trim()) return;
    LocalDb.addWorkoutDay(user.uid, selectedDate, newDayTitle.trim());
    setNewDayTitle('');
    setShowAddDayForm(false);
  };

  const handleAddEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!exerciseName.trim() || !activeDay) return;
    
    // Convert current setsList to matching WorkoutSetInfo list
    const formattedSets = setsList.map((st, index) => ({
      setNumber: index + 1,
      reps: st.reps,
      weight: st.weight
    }));

    LocalDb.addWorkoutEntry(
      user.uid, 
      activeDay.id, 
      exerciseName.trim(), 
      exerciseType,
      sets, 
      setsList[0]?.reps || 10, 
      setsList[0]?.weight || 0, 
      comment.trim(),
      formattedSets
    );

    setExerciseName('');
    setSets(3);
    setSetsList([
      { reps: 10, weight: 0 },
      { reps: 10, weight: 0 },
      { reps: 10, weight: 0 }
    ]);
    setComment('');
  };

  const handleDeleteDay = (id: string) => {
    if (window.confirm('Удалить тренировочный день и все упражнения?')) {
      LocalDb.deleteWorkoutDay(id);
    }
  };

  // Членство проверяется по статусу ('member', 'pro', 'elite' имеют доступ. 'free' блокируется.)
  const isBlocked = user.subscriptionStatus === 'free';

  // Уникальные имена для подсказок
  const suggestionNames = Array.from(new Set(workoutEntries.map(e => String(e.exerciseName || '')))).slice(0, 5) as string[];

  return (
    <div className="relative min-h-[550px] max-w-4xl mx-auto px-4 py-4 sm:py-6 space-y-6">
      {isBlocked && <PaywallOverlay tabName="Дневник тренировок" />}

      <div className={`space-y-6 transition-all duration-300 ${isBlocked ? 'opacity-10 pointer-events-none blur-[4px]' : ''}`}>
        
        {/* Date Chooser Bar */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="space-y-1 text-center md:text-left">
            <h2 className="text-lg font-black text-slate-100 uppercase tracking-tight flex items-center justify-center md:justify-start gap-2">
              <Calendar className="w-5 h-5 text-lime-400" /> Дневник тренировок
            </h2>
            <p className="text-xs text-slate-400 font-medium">Календарь ваших спортивных дневных нормативов и достижений</p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={() => {
                const prev = new Date(selectedDate);
                prev.setDate(prev.getDate() - 1);
                setSelectedDate(prev.toISOString().split('T')[0]);
              }}
              className="py-1.5 px-3 bg-slate-950 hover:bg-slate-800 text-slate-300 text-xs font-bold rounded-xl border border-slate-800 cursor-pointer transition-colors"
            >
              ← Пред
            </button>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-xs font-mono py-1.5 px-2.5 focus:ring-1 focus:ring-lime-400 outline-none text-center"
            />
            <button
              onClick={() => {
                const next = new Date(selectedDate);
                next.setDate(next.getDate() + 1);
                setSelectedDate(next.toISOString().split('T')[0]);
              }}
              className="py-1.5 px-3 bg-slate-950 hover:bg-slate-800 text-slate-300 text-xs font-bold rounded-xl border border-slate-800 cursor-pointer transition-colors"
            >
              След →
            </button>
            <button
              onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
              className="py-1.5 px-3.5 bg-lime-400 hover:bg-lime-300 text-slate-950 text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer transition-all shadow-md shadow-lime-400/15"
            >
              Сегодня
            </button>
          </div>
        </div>

        {/* Weekly Planner Target Panel */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-slate-800/80 p-4 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center gap-1.5 justify-center sm:justify-start">
              🎯 Тренировочный план
            </h3>
            <p className="text-[10px] text-slate-500 leading-relaxed max-w-sm">
              Укажите сколько дней тренировок вам необходимо в неделю, чтобы сопоставить свои планы с реальностью.
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-[10px] uppercase font-black text-slate-400">План в неделю:</label>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleWeeklyTargetChange(weeklyTarget - 1)}
                  className="w-7 h-7 bg-slate-900 hover:bg-slate-850 rounded-lg text-slate-300 font-bold border border-slate-800 flex items-center justify-center text-xs"
                >
                  -
                </button>
                <span className="w-8 text-center text-xs font-mono font-black text-lime-400 bg-slate-950 py-1 rounded-md border border-slate-850">
                  {weeklyTarget}
                </span>
                <button
                  type="button"
                  onClick={() => handleWeeklyTargetChange(weeklyTarget + 1)}
                  className="w-7 h-7 bg-slate-900 hover:bg-slate-850 rounded-lg text-slate-300 font-bold border border-slate-800 flex items-center justify-center text-xs"
                >
                  +
                </button>
              </div>
            </div>
            
            <div className="bg-slate-950 py-1.5 px-3.5 rounded-xl border border-slate-850 flex flex-col items-center">
              <span className="text-[9px] font-bold text-slate-500 uppercase">Готово за 7 дней</span>
              <span className={`text-xs font-mono font-black ${completedThisWeek >= weeklyTarget ? 'text-emerald-400' : 'text-amber-400'}`}>
                {completedThisWeek} из {weeklyTarget}
              </span>
            </div>
          </div>
        </div>

        {/* Workout Calendar */}
        <WorkoutCalendar 
          workoutDays={workoutDays} 
          selectedDate={selectedDate} 
          onDateSelect={setSelectedDate} 
        />

        {/* Dynamic Panel */}
        {!activeDay ? (
          <div className="bg-slate-900/40 border border-dashed border-slate-800 rounded-3xl p-10 text-center space-y-4 shadow-lg">
            <div className="w-12 h-12 bg-slate-900 border border-slate-850 rounded-full flex items-center justify-center mx-auto text-slate-500 shadow-inner">
              <Dumbbell className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wide">Тренировочный день пуст</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">Вы еще не вели учет активностей за этот день ({selectedDate}). Нажмите ниже, чтобы начать.</p>
            </div>
            {!showAddDayForm ? (
              <button
                onClick={() => setShowAddDayForm(true)}
                className="py-2.5 px-5 bg-gradient-to-r from-lime-500 to-lime-400 hover:from-lime-400 hover:to-lime-300 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer hover:scale-105 active:scale-95 transition-all text-center flex items-center gap-1.5 mx-auto shadow-md shadow-lime-500/10"
              >
                <PlusCircle className="w-4 h-4" /> Начать день
              </button>
            ) : (
              <form onSubmit={handleCreateDay} className="max-w-xs mx-auto space-y-3.5 bg-slate-950 p-4 rounded-2xl border border-slate-800 text-left">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Название тренировки</label>
                  <input
                    type="text"
                    required
                    placeholder="Например: Спина и Бицепс"
                    value={newDayTitle}
                    onChange={(e) => setNewDayTitle(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl text-xs py-2 px-3 text-slate-200 focus:outline-none focus:border-lime-400/80"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddDayForm(false);
                      setNewDayTitle('');
                    }}
                    className="flex-1 py-2 bg-slate-900 hover:bg-slate-850 text-slate-400 font-bold text-[11px] uppercase tracking-wider rounded-lg border border-slate-800 transition-colors"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-lime-400 hover:bg-lime-300 text-slate-950 font-black text-[11px] uppercase tracking-wider rounded-lg shadow-md transition-colors"
                  >
                    Создать
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Add Exercise Column */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
                  <PlusCircle className="w-4 h-4 text-lime-400" /> Записать упражнение
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Вы действительно хотите удалить тренировочный день? Упражнения останутся.')) {
                      LocalDb.deleteWorkoutDay(activeDay.id);
                    }
                  }}
                  className="text-[10px] font-black uppercase text-red-400 hover:bg-red-500/10 px-2 py-1 rounded-lg border border-red-500/10 cursor-pointer"
                >
                  Удалить день
                </button>
              </div>

              <form onSubmit={handleAddEntry} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Категория</label>
                  <select
                    value={exerciseType}
                    onChange={(e) => setExerciseType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl text-xs py-2 px-3 text-slate-200 outline-none focus:ring-1 focus:ring-lime-400/30"
                  >
                    <option value="other">Другое (Смешанное)</option>
                    <option value="push-ups">Отжимания</option>
                    <option value="squats">Приседания</option>
                    <option value="bench_press">Жим лежа</option>
                    <option value="running">Бег / Кардио</option>
                    <option value="calisthenics">Калистеника</option>
                  </select>
                </div>
                
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Название упражнения</label>
                  <input
                    type="text"
                    required
                    placeholder="Например: Жим лежа, Подтягивания"
                    value={exerciseName}
                    onChange={(e) => setExerciseName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl text-xs py-2 px-3 text-slate-200 outline-none focus:ring-1 focus:ring-lime-400/30"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Количество подходов (введите число)</label>
                    <span className="text-[10px] font-mono font-bold text-lime-400">{sets} подх.</span>
                  </div>
                  <input
                    type="number"
                    min={1}
                    max={24}
                    value={sets || ''}
                    placeholder="1"
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 1;
                      handleSetsChange(val);
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl text-xs py-2 px-3 text-slate-200 outline-none font-mono focus:ring-1 focus:ring-lime-400/30 text-center font-bold"
                  />
                </div>

                {/* Individual, Set-by-Set Input Form Blocks! */}
                <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Детализация по подходам:</span>
                  {setsList.map((st, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-850/60 shadow-inner">
                      <span className="text-[9px] font-bold text-slate-500 font-mono w-14 text-center shrink-0">Сет {idx + 1}:</span>
                      <div className="flex-1 flex gap-1 items-center">
                        <input
                          type="number"
                          min={0}
                          value={st.weight || ''}
                          placeholder="0"
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            const updated = [...setsList];
                            updated[idx].weight = val;
                            setSetsList(updated);
                          }}
                          className="w-full bg-slate-900 text-slate-200 border border-slate-800 rounded-lg text-xs py-1 px-1.5 text-center font-mono focus:border-lime-400 outline-none"
                        />
                        <span className="text-[8px] text-slate-500 font-bold uppercase shrink-0">кг</span>
                      </div>
                      <div className="flex-1 flex gap-1 items-center">
                        <input
                          type="number"
                          min={1}
                          value={st.reps || ''}
                          placeholder="10"
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 1;
                            const updated = [...setsList];
                            updated[idx].reps = val;
                            setSetsList(updated);
                          }}
                          className="w-full bg-slate-900 text-slate-200 border border-slate-800 rounded-lg text-xs py-1 px-1.5 text-center font-mono focus:border-lime-400 outline-none"
                        />
                        <span className="text-[8px] text-slate-500 font-bold uppercase shrink-0">повт</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Заметка / Тонкость подхода</label>
                  <input
                    type="text"
                    placeholder="Например: С паузой 2 сек"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl text-xs py-2 px-3 text-slate-200 outline-none focus:ring-1 focus:ring-lime-400/30"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-lime-400 hover:bg-lime-300 text-slate-950 font-black text-xs uppercase tracking-widest rounded-xl shadow-lg transition-transform active:scale-95 cursor-pointer"
                >
                  Записать в день
                </button>
              </form>
            </div>

            {/* List of Exercises Column */}
            <div className="md:col-span-2 bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-lime-400" /> Выполненные упражнения
                </h3>
                <span className="text-[10px] font-bold text-slate-500 font-mono">Всего упражнений: {activeEntries.length}</span>
              </div>

              {activeEntries.length === 0 ? (
                <div className="text-center py-16 text-slate-500 text-xs italic">
                  Тренировка еще абсолютно пуста. Запишите первый спортивный подход в форму слева!
                </div>
              ) : (
                <div className="space-y-3.5 max-h-[520px] overflow-y-auto pr-1">
                  <AnimatePresence initial={false}>
                    {activeEntries.map(entry => {
                      const volumeSum = entry.setsDetails?.reduce((acc: number, cur: any) => acc + (cur.weight * cur.reps), 0) || 0;

                      return (
                        <motion.div
                          key={entry.id}
                          layout
                          initial={{ opacity: 0, y: 15, scale: 0.97 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ type: "spring", stiffness: 350, damping: 25 }}
                          className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800/60 flex flex-col gap-3 group hover:border-slate-800 hover:bg-slate-950 transition-all shadow-md"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="space-y-1">
                              <h4 className="text-xs font-black text-slate-200 uppercase tracking-wider">{entry.exerciseName}</h4>
                              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">
                                Всего: <span className="text-lime-400">{entry.sets} подходов</span>
                                {volumeSum > 0 ? (
                                  <span className="text-slate-400"> • Объём: <span className="text-rose-450 font-mono font-black">{volumeSum} кг</span></span>
                                ) : null}
                              </p>
                            </div>

                            <button
                              onClick={() => LocalDb.deleteWorkoutEntry(entry.id)}
                              className="p-1 px-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg border border-transparent hover:border-red-500/10 transition-colors cursor-pointer"
                            >
                              <Trash className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Beautiful vertical list of sets with sharp dividers */}
                          {entry.setsDetails && entry.setsDetails.length > 0 ? (
                            <div className="bg-slate-950/90 rounded-xl border border-slate-850/70 divide-y divide-slate-850/60 overflow-hidden shadow-inner font-mono">
                              {entry.setsDetails.map((det: any) => (
                                <div key={det.setNumber} className="py-2 px-3 flex justify-between items-center text-[11px] font-mono hover:bg-slate-900/20 transition-all">
                                  <div className="flex items-center gap-2">
                                    <span className="w-5 h-5 flex items-center justify-center text-[9px] font-black font-mono bg-slate-900 text-lime-400 rounded-full border border-slate-800/60">
                                      {det.setNumber}
                                    </span>
                                    <span className="text-[9px] uppercase font-bold tracking-wider text-slate-500 font-sans">Сет {det.setNumber}</span>
                                  </div>
                                  <span className="text-slate-200 font-bold">
                                    {det.weight > 0 ? (
                                      <>
                                        <span className="text-rose-400 font-extrabold">{det.weight}</span> кг <span className="text-slate-600 font-sans">×</span> <span className="text-lime-400 font-black">{det.reps}</span> <span className="text-[10px] text-slate-500 font-sans font-bold">повт.</span>
                                      </>
                                    ) : (
                                      <><span className="text-lime-400 font-black">{det.reps}</span> <span className="text-slate-500 font-sans">раз</span></>
                                    )}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="flex items-center gap-3 text-[10px] font-mono font-bold text-slate-400">
                              <span className="bg-slate-900 border border-slate-850/60 py-0.5 px-2 rounded-lg text-lime-400 uppercase text-[9px]">
                                {entry.sets} подх.
                              </span>
                              <span>• {entry.repsPerSet || 10} повт.</span>
                              {entry.weight && entry.weight > 0 ? (
                                <span className="text-rose-400 font-black">{entry.weight} кг</span>
                              ) : null}
                            </div>
                          )}

                          {entry.comment && (
                            <p className="text-[10px] text-slate-500 italic leading-snug bg-slate-900/30 px-2 py-1.5 rounded-lg border border-slate-900/20">
                              Заметка: «{entry.comment}»
                            </p>
                          )}
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  );
};


/* ==========================================================================
   10. PROGRESS VIEW (Combined Strength, Weight and Habits)
   ========================================================================== */
export const ProgressView: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'strength' | 'weight' | 'habits'>('strength');

  const [workoutEntries, setWorkoutEntries] = useState<any[]>([]);
  const [weightEntries, setWeightEntries] = useState<any[]>([]);
  const [habitDays, setHabitDays] = useState<any[]>([]);

  // Состояния для веса
  const [weightInput, setWeightInput] = useState('');
  const [weightDate, setWeightDate] = useState(() => {
    const d = new Date();
    const offset = d.getTimezoneOffset();
    const local = new Date(d.getTime() - offset * 60 * 1000);
    return local.toISOString().split('T')[0];
  });

  // Сила: Состояние выбранного упражнения
  const [selectedExName, setSelectedExName] = useState('');

  useEffect(() => {
    const handleUpdate = () => {
      setWorkoutEntries(LocalDb.getWorkoutEntries());
      setWeightEntries(LocalDb.getWeightEntries());
      setHabitDays(LocalDb.getHabitDays());
    };

    handleUpdate();
    window.addEventListener('fit_db_updated', handleUpdate);
    return () => window.removeEventListener('fit_db_updated', handleUpdate);
  }, []);

  if (!user) return null;

  const isBlocked = user.subscriptionStatus === 'free';

  // --- ЛОГИКА СИЛЫ (График по упражнениям) ---
  const myWorkoutEntries = workoutEntries.filter(e => e.userId === user.uid);
  const exerciseNames = Array.from(new Set(myWorkoutEntries.map(e => e.exerciseName)));

  // Автоматический выбор первого упражнения
  if (exerciseNames.length > 0 && !selectedExName) {
    setSelectedExName(exerciseNames[0]);
  }

  // Расчет прогресса объема за дни для выбранного упражнения
  const exTargetEntries = myWorkoutEntries.filter(e => e.exerciseName === selectedExName);
  
  // Достанем дни тренировок, чтобы узнать дату по dayId
  const workoutDays = LocalDb.getWorkoutDays();
  const dateToVolMap: { [date: string]: number } = {};

  exTargetEntries.forEach(entry => {
    const day = workoutDays.find(d => d.id === entry.dayId);
    if (!day) return;
    const vol = entry.sets * (entry.repsPerSet || 1) * (entry.weight || 1);
    dateToVolMap[day.date] = (dateToVolMap[day.date] || 0) + vol;
  });

  const strengthPoints = Object.keys(dateToVolMap)
    .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
    .map(date => ({
      date,
      volume: dateToVolMap[date]
    }));

  // --- ЛОГИКА ВЕСА ---
  const myWeightEntries = weightEntries.filter(w => w.userId === user.uid);
  
  const handleAddWeight = (e: React.FormEvent) => {
    e.preventDefault();
    const wVal = parseFloat(weightInput);
    if (isNaN(wVal) || wVal <= 10 || wVal > 500) return;
    LocalDb.addWeightEntry(user.uid, weightDate, wVal);
    setWeightInput('');
  };

  // --- ЛОГИКА ПРИВЫЧЕК ---
  // Получаем календарь из 14 последних дней
  const habitType = 'no_sugar';
  const getPast14Days = () => {
    const list = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const offset = d.getTimezoneOffset();
      const local = new Date(d.getTime() - offset * 60 * 1000);
      list.push(local.toISOString().split('T')[0]);
    }
    return list;
  };
  const past14DaysList = getPast14Days();
  const myHabitDays = habitDays.filter(h => h.userId === user.uid && h.habitType === habitType);

  const toggleHabit = (date: string, status: 'clean' | 'failed') => {
    LocalDb.toggleHabitDay(user.uid, date, habitType, status);
  };

  // Расчет стрик (streak) "без сахара"
  const getStreak = () => {
    let currentStreak = 0;
    // Идем с сегодняшнего дня и назад
    const reversedDays = past14DaysList.slice().reverse();
    for (const d of reversedDays) {
      const mark = myHabitDays.find(h => h.date === d);
      if (mark && mark.status === 'clean') {
        currentStreak++;
      } else {
        // Если день еще не заполнен или провален — стрик прерывается (если не сегодня, которое может быть еще не заполнено)
        if (d === reversedDays[0]) {
          // Если сегодня еще не заполнено, просто пропускаем
          continue;
        }
        break;
      }
    }
    return currentStreak;
  };

  const currentStreak = getStreak();
  const cleanDaysCount = myHabitDays.filter(h => h.status === 'clean').length;
  const failDaysCount = myHabitDays.filter(h => h.status === 'failed').length;

  // --- SVG Меппинг для графиков ---
  const renderSVGGraph = (points: { xLabel: string; yValue: number }[], strokeColor: string, isWeight = false) => {
    if (points.length < 2) {
      return (
        <div className="h-44 flex items-center justify-center text-xs font-mono text-slate-500 italic bg-slate-950 border border-slate-850 rounded-2xl">
          Слишком мало точек для графика. Добавьте замеры веса или записей! (Минимум 2 точки)
        </div>
      );
    }

    const width = 500;
    const height = 180;
    const paddingLeft = 45;
    const paddingRight = 15;
    const paddingTop = 15;
    const paddingBottom = 25;

    const values = points.map(p => p.yValue);
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    const valRange = maxVal - minVal === 0 ? 10 : maxVal - minVal;

    // Границы осей
    const yMin = minVal - valRange * 0.1;
    const yMax = maxVal + valRange * 0.1;
    const yRange = yMax - yMin;

    const getX = (index: number) => {
      const step = (width - paddingLeft - paddingRight) / (points.length - 1);
      return paddingLeft + index * step;
    };

    const getY = (val: number) => {
      const scale = (height - paddingTop - paddingBottom) / yRange;
      return height - paddingBottom - (val - yMin) * scale;
    };

    // Опорные координаты полилинии
    const polylinePoints = points.map((p, i) => `${getX(i)},${getY(p.yValue)}`).join(' ');

    return (
      <div className="bg-slate-950 p-3.5 border border-slate-850 rounded-3xl shadow-inner relative overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto select-none overflow-visible">
          {/* Горизонтальные фоновые сетки */}
          {[0.25, 0.5, 0.75].map((ratio, idx) => {
            const val = yMin + yRange * ratio;
            const yCoord = getY(val);
            return (
              <line
                key={idx}
                x1={paddingLeft}
                y1={yCoord}
                x2={width - paddingRight}
                y2={yCoord}
                className="stroke-slate-800/50 stroke-[0.7px]"
                strokeDasharray="3 3"
              />
            );
          })}

          {/* Сама ломаная линия графика */}
          <polyline
            fill="none"
            stroke={strokeColor}
            strokeWidth="2.5"
            points={polylinePoints}
            className="drop-shadow-[0_4px_10px_rgba(132,204,22,0.15)] animate-in fade-in duration-300"
          />

          {/* Интерактивные точки данных */}
          {points.map((p, i) => (
            <g key={i} className="group cursor-pointer">
              <circle
                cx={getX(i)}
                cy={getY(p.yValue)}
                r="4.5"
                className={`fill-slate-950 ${isWeight ? 'stroke-rose-400' : 'stroke-lime-400'} stroke-[2.5px] transition-all group-hover:r-[6px]`}
              />
              <text
                x={getX(i)}
                y={getY(p.yValue) - 10}
                className="fill-slate-100 font-mono text-[8px] font-bold text-center opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900"
                textAnchor="middle"
              >
                {p.yValue.toFixed(1)} {isWeight ? 'кг' : ''}
              </text>
            </g>
          ))}

          {/* Подписи оси X (Даты у точек) */}
          {points.map((p, i) => (
            <text
              key={i}
              x={getX(i)}
              y={height - 8}
              className="fill-slate-550 fill-slate-500 font-mono text-[7px] text-center"
              textAnchor="middle"
            >
              {p.xLabel.split('-').slice(1).join('/')}
            </text>
          ))}

          {/* Левые подписи оси Y */}
          <text x={10} y={getY(yMax)} className="fill-slate-500 font-mono text-[7px]">
            {Math.round(yMax)}
          </text>
          <text x={10} y={getY((yMin + yMax) / 2)} className="fill-slate-500 font-mono text-[7px]">
            {Math.round((yMin + yMax) / 2)}
          </text>
          <text x={10} y={getY(yMin)} className="fill-slate-500 font-mono text-[7px]">
            {Math.round(yMin)}
          </text>
        </svg>
      </div>
    );
  };

  return (
    <div className="relative min-h-[550px] max-w-4xl mx-auto px-4 py-4 sm:py-6">
      {isBlocked && <PaywallOverlay tabName="Прогресс и Трекеры" />}

      <div className={`space-y-6 transition-all duration-300 ${isBlocked ? 'opacity-10 pointer-events-none blur-[4px]' : ''}`}>
        
        {/* Horizontal Navigation Sub-tabs */}
        <div className="bg-slate-900 border border-slate-800 p-1.5 rounded-2xl flex max-w-md mx-auto shadow-xl">
          <button
            onClick={() => setActiveTab('strength')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'strength'
                ? 'bg-lime-400 text-slate-950 shadow-md shadow-lime-400/10'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingUp className="w-4 h-4" /> 💪 Сила
          </button>
          <button
            onClick={() => setActiveTab('weight')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'weight'
                ? 'bg-lime-400 text-slate-950 shadow-md shadow-lime-400/10'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Heart className="w-4 h-4" /> ⚖️ Вес тела
          </button>
          <button
            onClick={() => setActiveTab('habits')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'habits'
                ? 'bg-lime-400 text-slate-950 shadow-md shadow-lime-400/10'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Ban className="w-4 h-4" /> 🍏 Без Сахара
          </button>
        </div>

        {/* --- VIEW: STRENGTH --- */}
        {activeTab === 'strength' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-6">
            <div className="space-y-2">
              <h2 className="text-base font-black text-slate-100 uppercase tracking-tight flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-lime-400" /> График изменения силы объема
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                Анализируйте тоннаж тренировок (Общий объем = Подходы * Повторения * Вес) для регулярного внедрения прогрессивной перегрузки мышц.
              </p>
            </div>

            {exerciseNames.length === 0 ? (
              <div className="text-center py-16 bg-slate-950/40 rounded-3xl border border-dashed border-slate-800 text-slate-500 text-xs italic space-y-3">
                <p>База занятий еще не наполнена.</p>
                <p className="text-[10px] text-slate-600">Перейдите в Дневник, создайте тренировочный день и зафиксируйте хотя бы одно упражнение!</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-850">
                  <span className="text-xs font-black text-slate-300 uppercase tracking-wider">Выберите упражнение из списка:</span>
                  <select
                    value={selectedExName}
                    onChange={(e) => setSelectedExName(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-xl text-slate-200 py-1.5 px-3.5 text-xs font-bold font-sans outline-none focus:ring-1 focus:ring-lime-450"
                  >
                    {exerciseNames.map(name => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-[11px] font-mono text-slate-400 font-bold">
                    <span>ПРОГРЕСС ПО: <span className="text-lime-400 uppercase font-black">{selectedExName}</span></span>
                    <span>Точек на графике: {strengthPoints.length}</span>
                  </div>

                  {renderSVGGraph(
                    strengthPoints.map(p => ({ xLabel: p.date, yValue: p.volume })),
                    '#a3e635' // lime-400
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- VIEW: WEIGHT --- */}
        {activeTab === 'weight' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-200">
            {/* Форма ввода текущего веса */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-4 shadow-xl h-fit">
              <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest border-b border-slate-800 pb-3 flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-rose-500" /> Замер веса тела
              </h3>

              <form onSubmit={handleAddWeight} className="space-y-4 pt-1">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Значение веса (кг)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    min={20}
                    max={300}
                    placeholder="75.4"
                    value={weightInput}
                    onChange={(e) => setWeightInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl text-xs py-2 px-3 text-slate-200 outline-none font-mono focus:border-rose-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Дата замера</label>
                  <input
                    type="date"
                    required
                    value={weightDate}
                    onChange={(e) => setWeightDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl text-xs py-2 px-3 text-slate-200 outline-none font-mono focus:border-rose-400 text-center"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-lime-400 hover:bg-lime-300 text-slate-950 font-black text-xs uppercase tracking-widest rounded-xl shadow-lg transition-transform active:scale-95 cursor-pointer"
                >
                  Зафиксировать вес
                </button>
              </form>
            </div>

            {/* График и история замеров веса */}
            <div className="md:col-span-2 bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-xl space-y-4">
              <h3 className="text-xs font-black text-slate-300 uppercase tracking-widest border-b border-slate-800 pb-3 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-rose-450" /> Динамика массы веса тела
              </h3>

              {myWeightEntries.length === 0 ? (
                <div className="text-center py-16 text-slate-500 text-xs italic">
                  История взвешиваний пуста. Сделайте замер веса в левой колонке!
                </div>
              ) : (
                <div className="space-y-4">
                  {renderSVGGraph(
                    myWeightEntries.map(w => ({ xLabel: w.date, yValue: w.weight })),
                    '#f43f5e', // rose-500
                    true
                  )}

                  {/* History Logs Scroll */}
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-wider">История взвешиваний</p>
                    {myWeightEntries.slice().reverse().map(w => (
                      <div key={w.id} className="bg-slate-950/60 border border-slate-800/40 p-2.5 rounded-xl flex items-center justify-between text-xs font-mono">
                        <span className="text-slate-400">{w.date}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-rose-450 font-black">{w.weight} кг</span>
                          <button
                            onClick={() => LocalDb.deleteWeightEntry(w.id)}
                            className="p-1 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all cursor-pointer"
                          >
                            <Trash className="w-3.5 h-3.5 text-slate-600 hover:text-red-400" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- VIEW: HABITS (Days Without Sugar) --- */}
        {activeTab === 'habits' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-6 animate-in fade-in duration-200">
            <div className="space-y-2">
              <h2 className="text-base font-black text-slate-100 uppercase tracking-tight flex items-center gap-2">
                <Ban className="w-5 h-5 text-lime-400 animate-pulse" /> Трекер «Дни без сахара»
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                Поддерживайте «чистый» образ жизни и исключайте вредный сахар. Отмечайте каждый прошедший день как чистый 🟢 или проваленный 🔴.
              </p>
            </div>

            {/* Стрик Карточки и Статы */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-950 p-4 border border-slate-850 rounded-2xl text-center space-y-1">
                <span className="text-2xl">🔥</span>
                <p className="text-[9px] font-black text-amber-400 uppercase tracking-widest">Текущий Стрик</p>
                <p className="text-lg font-mono font-black text-slate-100">{currentStreak} дн. подряд</p>
              </div>
              <div className="bg-slate-950 p-4 border border-slate-850 rounded-2xl text-center space-y-1">
                <span className="text-2xl">🟢</span>
                <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Чистые дни</p>
                <p className="text-lg font-mono font-black text-slate-100">{cleanDaysCount} дн.</p>
              </div>
              <div className="bg-slate-950 p-4 border border-slate-850 rounded-2xl text-center space-y-1">
                <span className="text-2xl">🔴</span>
                <p className="text-[9px] font-black text-rose-400 uppercase tracking-widest">Дни со срывом</p>
                <p className="text-lg font-mono font-black text-slate-100">{failDaysCount} дн.</p>
              </div>
            </div>

            {/* Сетка за 14 дней */}
            <div className="space-y-3">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Календарная сетка за 14 дней</p>
              
              <div className="grid grid-cols-2 sm:grid-cols-7 gap-3">
                {past14DaysList.map(date => {
                  const dayMark = myHabitDays.find(h => h.date === date);
                  const isToday = date === new Date().toISOString().split('T')[0];
                  
                  return (
                    <div
                      key={date}
                      className={`p-3.5 rounded-2xl border flex flex-col items-center justify-between text-center gap-2 relative shadow-md transition-all ${
                        isToday ? 'border-lime-500/40 bg-lime-400/5' : 'border-slate-800 bg-slate-950/55'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <p className="text-[9px] font-bold text-slate-500">
                          {new Date(date).toLocaleDateString('ru-RU', { weekday: 'short' })}
                        </p>
                        <p className="text-[11px] font-mono font-black text-slate-350">
                          {date.split('-')[2]}
                        </p>
                      </div>

                      {/* Текстовый лейбл стейта */}
                      {dayMark ? (
                        <div className="flex flex-col items-center">
                          {dayMark.status === 'clean' ? (
                            <span className="text-emerald-400 text-xs font-black uppercase tracking-wider">Чисто</span>
                          ) : (
                            <span className="text-red-400 text-xs font-black uppercase tracking-wider">Срыв</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-650 text-[10px] text-slate-500 italic">не заполнено</span>
                      )}

                      {/* Кнопки выбора */}
                      <div className="flex gap-1.5 w-full pt-1">
                        <button
                          onClick={() => toggleHabit(date, 'clean')}
                          title="Держал чистый день"
                          className={`flex-1 py-1 rounded-lg border text-center transition-all cursor-pointer flex items-center justify-center ${
                            dayMark?.status === 'clean'
                              ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 font-bold'
                              : 'border-slate-800 hover:border-emerald-600 text-slate-500'
                          }`}
                        >
                          🟢
                        </button>
                        <button
                          onClick={() => toggleHabit(date, 'failed')}
                          title="Был сахарный срыв"
                          className={`flex-1 py-1 rounded-lg border text-center transition-all cursor-pointer flex items-center justify-center ${
                            dayMark?.status === 'failed'
                              ? 'bg-red-500/10 border-red-500 text-red-400 font-bold'
                              : 'border-slate-800 hover:border-red-600 text-slate-500'
                          }`}
                        >
                          🔴
                        </button>
                      </div>

                      {isToday && (
                        <span className="absolute -top-1.5 px-1 bg-lime-450 bg-lime-400 text-slate-950 font-black text-[7px] uppercase tracking-wider rounded border border-lime-400/20">
                          Сегодня
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};


/* ==========================================================================
   12. PUBLIC PROFILE VIEW
   ========================================================================== */
export const PublicProfileView: React.FC<{
  userId: string | null;
  setTab: (tab: string) => void;
  onUserClick?: (uid: string) => void;
}> = ({ userId, setTab, onUserClick }) => {
  const [profileUser, setProfileUser] = useState<any>(null);
  const [userSubmissions, setUserSubmissions] = useState<any[]>([]);
  const [habitDays, setHabitDays] = useState<any[]>([]);

  useEffect(() => {
    if (!userId) return;
    const users = LocalDb.getUsers();
    const found = users.find(u => u.uid === userId);
    setProfileUser(found || null);

    const subs = LocalDb.getSubmissions().filter(s => s.userId === userId && s.status === 'approved');
    setUserSubmissions(subs);

    const habits = LocalDb.getHabitDays().filter(h => h.userId === userId && h.habitType === 'no_sugar');
    setHabitDays(habits);
  }, [userId]);

  if (!userId || !profileUser) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4 px-4 text-center">
        <UserCheck className="w-12 h-12 text-slate-600" />
        <h2 className="text-xl font-bold text-slate-300">Пользователь не найден</h2>
        <button 
          onClick={() => setTab('leaderboard')}
          className="text-xs bg-lime-400 text-slate-950 px-4 py-2 rounded-xl font-bold uppercase cursor-pointer"
        >
          Вернуться в лидерборд
        </button>
      </div>
    );
  }

  const subStatus = profileUser.subscriptionStatus || 'free';
  const cleanCount = habitDays.filter(h => h.status === 'clean').length;

  // Recent 7 days tracker
  const getRecent7Days = () => {
    const list = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const offset = d.getTimezoneOffset();
      const local = new Date(d.getTime() - offset * 60 * 1000);
      list.push(local.toISOString().split('T')[0]);
    }
    return list;
  };
  const recent7 = getRecent7Days();

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 sm:py-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Шапка профиля */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 p-6 flex flex-col items-center text-center shadow-2xl">
        {/* Декоративный фон профиля */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900 to-lime-900/10 opacity-50"></div>
        {subStatus === 'elite' && (
          <div className="absolute inset-0 bg-gradient-to-br from-rose-900/10 via-slate-900 to-rose-900/10 opacity-60"></div>
        )}
        
        <div className="relative space-y-4 w-full flex flex-col items-center z-10">
          {/* Аватар с красивой рамкой */}
          <div className="relative">
            <img 
              src={profileUser.avatarUrl} 
              alt={profileUser.displayName}
              className={`w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover shadow-2xl transition-all flex items-center justify-center shrink-0 ${getAvatarClasses(profileUser, 'large')}`}
              referrerPolicy="no-referrer"
            />
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2">
              <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider whitespace-nowrap shadow-xl border ${
                subStatus === 'elite' ? 'bg-rose-500 text-slate-950 border-rose-400' 
                : subStatus === 'pro' ? 'bg-lime-400 text-slate-950 border-lime-300'
                : subStatus === 'member' ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                : 'bg-slate-800 text-slate-300 border-slate-700'
              }`}>
                {subStatus === 'elite' ? '👑 Elite' : subStatus === 'pro' ? '⭐️ Pro' : subStatus === 'member' ? '🎖 Member' : 'Free'}
              </span>
            </div>
          </div>

          <div className="space-y-1.5 mt-3">
            <h1 className={`text-2xl sm:text-3xl font-black tracking-tight flex items-center justify-center gap-2 ${
                subStatus === 'elite' ? 'bg-gradient-to-r from-rose-400 via-amber-300 to-rose-400 bg-clip-text text-transparent drop-shadow-[0_2px_10px_rgba(244,63,94,0.4)]'
                : subStatus === 'pro' ? 'text-lime-400 drop-shadow-[0_0_10px_rgba(163,230,53,0.3)]'
                : 'text-slate-100'
              }`}>
              {profileUser.displayName} 
              <ShieldCheck className="w-5 h-5 text-emerald-400 inline" />
            </h1>
            <p className="text-sm font-medium text-slate-400 max-w-md mx-auto leading-relaxed">
              {profileUser.bio || 'Атлет Фитнес Сети'}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2 select-none shadow-inner flex flex-col justify-center my-0 max-h-none h-auto">
              <p className="text-[10px] font-mono font-bold text-slate-500 uppercase">Опыт (XP)</p>
              <p className="text-lg font-black text-slate-200">{profileUser.points}</p>
            </div>
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2 select-none min-w-[110px] shadow-inner flex flex-col justify-center my-0 max-h-none h-auto">
              <p className="text-[10px] font-mono font-bold text-slate-500 uppercase">Ранг</p>
              <p className="text-sm font-black text-lime-400 mt-0.5 truncate">{profileUser.currentRank}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Отказ от сахара */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-100 flex items-center gap-2 uppercase tracking-tight">
              <Ban className="w-5 h-5 flex-shrink-0 text-emerald-400" /> 
              Отказ от сахара
            </h3>
            <p className="text-[10px] sm:text-xs text-slate-400 mt-1 font-medium">Мотивационный трекер полезной привычки</p>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl font-mono text-[10px] text-emerald-400 font-bold whitespace-nowrap text-center">
            Успешных дней: {cleanCount}
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 pt-2">
          {recent7.map(date => {
            const h = habitDays.find(d => d.date === date);
            const isClean = h?.status === 'clean';
            const isFailed = h?.status === 'failed';
            const dObj = new Date(date);
            const dayStr = dObj.toLocaleDateString('ru-RU', { weekday: 'short' });
            
            return (
              <div key={date} className="flex flex-col items-center gap-1.5 group">
                <div className={`w-full aspect-square rounded-xl sm:rounded-2xl flex items-center justify-center border shadow-sm transition-all duration-300 ${
                  isClean ? 'bg-emerald-500/10 border-emerald-500/50 shadow-emerald-500/10' :
                  isFailed ? 'bg-amber-500/10 border-amber-500/50 shadow-amber-500/10' :
                  'bg-slate-950 border-slate-800'
                }`}>
                  {isClean ? <CheckCircle2 className="w-4 h-4 sm:w-6 sm:h-6 text-emerald-400" /> :
                   isFailed ? <AlertCircle className="w-4 h-4 sm:w-6 sm:h-6 text-amber-500" /> :
                   <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />}
                </div>
                <span className={`text-[8px] sm:text-[10px] font-black uppercase tracking-wider font-mono ${isClean ? 'text-emerald-400' : isFailed ? 'text-amber-500' : 'text-slate-500'}`}>
                  {dayStr}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Верифицированные достижения */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-widest pl-2 border-l-2 border-lime-400 flex justify-between items-center">
          Недавние достижения
          <span className="text-[10px] font-mono text-slate-500 tracking-normal">{userSubmissions.length} записей</span>
        </h3>
        
        {userSubmissions.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6 text-center shadow-lg">
            <Trophy className="w-8 h-8 text-slate-700 mx-auto mb-3" />
            <p className="text-xs font-medium text-slate-500">Пользователь пока не выкладывал контент.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {userSubmissions.slice().sort((a,b)=> new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 6).map(sub => (
              <div 
                key={sub.id} 
                className="bg-slate-900 border border-slate-800/80 p-4 rounded-2xl flex flex-col gap-3 shadow-lg hover:border-slate-700 transition-colors cursor-pointer group/vid"
                onClick={() => {
                  window.open(sub.videoUrl, '_blank');
                }}
                title="Нажмите, чтобы открыть ролик"
              >
                <div className="flex gap-3">
                  <div className="w-12 h-12 bg-slate-950 rounded-xl border border-slate-800 overflow-hidden flex-shrink-0 flex items-center justify-center relative">
                    <Video className="w-5 h-5 text-slate-700" />
                    <video src={sub.videoUrl} className="absolute inset-0 w-full h-full object-cover opacity-60" />
                    <div className="absolute inset-0 bg-slate-950/20 group-hover/vid:bg-transparent transition-colors"></div>
                  </div>
                  <div className="flex-1 flex flex-col justify-center min-w-0">
                    <div className="text-xs font-black text-slate-200 uppercase tracking-wide truncate">
                      {WORKOUT_OPTS.find(o => o.value === sub.workoutType)?.label || sub.workoutType}
                    </div>
                    <div className="text-sm font-black text-lime-400">
                      {sub.workoutType === 'running' ? `${sub.countOrDistance} км` : `${sub.countOrDistance} раз`}
                    </div>
                    {sub.pointsAwarded > 0 && (
                      <div className="text-[9px] text-emerald-400 font-mono font-bold mt-0.5">
                        +{sub.pointsAwarded} XP
                      </div>
                    )}
                  </div>
                </div>
                {sub.description && (
                  <div className="text-[10px] text-slate-400 italic line-clamp-2 leading-relaxed bg-slate-950/40 p-2 rounded-lg border border-slate-800/40">
                    "{sub.description}"
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

/* ==========================================================================
   7. SUPPLEMENTS VIEW
   ========================================================================== */
interface Supplement {
  id: string;
  name: string;
  time: string;
}

export const SupplementsView: React.FC = () => {
  const { theme } = useTheme();
  const [supplements, setSupplements] = useState<Supplement[]>([]);
  const [name, setName] = useState('');
  const [time, setTime] = useState('');

  const addSupplement = () => {
    if (name && time) {
      setSupplements([...supplements, { id: Date.now().toString(), name, time }]);
      setName('');
      setTime('');
      alert(`Напоминание для "${name}" установлено на ${time}!`);
    }
  };

  const removeSupplement = (id: string) => {
    setSupplements(supplements.filter(s => s.id !== id));
  };

  return (
    <div className={`p-4 max-w-md mx-auto space-y-6 ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>
      <div className="flex items-center gap-3">
        <div className={`p-3 rounded-2xl ${theme === 'dark' ? 'bg-indigo-900/30' : 'bg-indigo-100'}`}>
          <Pill className="w-6 h-6 text-indigo-500" />
        </div>
        <h2 className="text-xl font-black uppercase tracking-tight">Мои Добавки</h2>
      </div>

      <div className={`p-4 rounded-2xl ${theme === 'dark' ? 'bg-slate-900' : 'bg-white border'}`}>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Название (напр. Витамин D)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`w-full p-3 rounded-xl border ${theme === 'dark' ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-200'} focus:ring-2 focus:ring-lime-400 outline-none`}
          />
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className={`w-full p-3 rounded-xl border ${theme === 'dark' ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-200'} focus:ring-2 focus:ring-lime-400 outline-none`}
          />
          <button
            onClick={addSupplement}
            className="w-full flex items-center justify-center gap-2 bg-lime-400 text-slate-950 font-bold py-3 rounded-xl hover:bg-lime-500 transition-colors"
          >
            <PlusCircle className="w-5 h-5" /> Добавить
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {supplements.map(s => (
          <div key={s.id} className={`p-4 rounded-xl flex items-center justify-between ${theme === 'dark' ? 'bg-slate-900' : 'bg-white border'}`}>
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-lime-400" />
              <div>
                <p className="font-bold text-sm tracking-wide">{s.name}</p>
                <p className="text-xs text-slate-400">{s.time}</p>
              </div>
            </div>
            <button onClick={() => removeSupplement(s.id)} className="text-red-400 hover:text-red-300">
              <Trash className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

