import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { LocalDb, RANKS, WORKOUT_OPTS, ACHIEVEMENTS, getRankByPoints } from '../mockDb';
import { Submission, SubscriptionStatus } from '../types';
import { SubmissionCard } from './SubmissionCard';
import { UploadForm } from './UploadForm';
import { LeaderboardTable } from './LeaderboardTable';
import { RankBadge } from './RankBadge';
import { SubscriptionPlanCard } from './SubscriptionPlanCard';
import { AchievementCard } from './AchievementCard';
import { 
  Flame, Award, Trophy, Users, ShieldCheck, Video, 
  Cpu, Zap, Send, Edit3, UserCheck, Star, Sparkles, CheckCircle2, CreditCard
} from 'lucide-react';

/* ==========================================================================
   1. LANDING VIEW
   ========================================================================== */
export const LandingView: React.FC<{ onGetStarted: () => void }> = ({ onGetStarted }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-lime-400/15 text-lime-400 border border-lime-400/25 text-xs font-black uppercase tracking-widest rounded-full">
          ⚡ Эра Честного Фитнеса
        </span>
        <h2 className="text-3xl sm:text-5xl font-black text-slate-100 uppercase tracking-tight leading-none">
          Подтверждай свои результаты по <span className="text-gradient bg-gradient-to-r from-lime-450 from-lime-400 to-emerald-400 bg-clip-text text-transparent">видео-доказательствам</span>
        </h2>
        <p className="max-w-xl mx-auto text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
          Первая в России социальная платформа, где каждый присед, отжимание и километр верифицируются нашей нейросетью. Зарабатывай XP, открывай ранги и докажи свое лидерство!
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
          <h3 className="font-bold text-slate-200 text-sm uppercase">2. ИИ-Верификация</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Запатентованная нейросеть PoseNet автоматически считает амплитуду, касание пола и подлинность записи.
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
export const AuthView: React.FC = () => {
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

        <div className="text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            type="button"
            className="text-[11px] font-bold text-lime-400 hover:text-lime-300 cursor-pointer"
          >
            {isLogin ? 'Ещё нет аккаунта? Зарегистрироваться' : 'Уже зарегистрированы? Войти'}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ==========================================================================
   3. DASHBOARD VIEW
   ========================================================================== */
export const DashboardView: React.FC<{ setTab: (tab: string) => void }> = ({ setTab }) => {
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
          <span className="text-[10px] uppercase font-black tracking-wider text-slate-500 block mt-1">Подтверждено ИИ</span>
        </div>
        <div className="bg-slate-900/30 p-3.5 rounded-2xl border border-slate-800/60 font-medium">
          <span className="text-lg sm:text-xl font-bold font-mono text-amber-500 block">{pendingCount}</span>
          <span className="text-[10px] uppercase font-black tracking-wider text-slate-500 block mt-1">В очереди ИИ</span>
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
            <SubmissionCard key={sub.id} submission={sub} />
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
  return (
    <div className="max-w-md mx-auto px-4 py-4 sm:py-6">
      <UploadForm onSuccess={() => setTab('dashboard')} />
    </div>
  );
};

/* ==========================================================================
   5. LEADERBOARD VIEW
   ========================================================================== */
export const LeaderboardView: React.FC = () => {
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
      <LeaderboardTable users={users} currentUserUid={user?.uid} />
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
  
  const [showEdit, setShowEdit] = useState(false);
  const [updatedOk, setUpdatedOk] = useState(false);

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
    await updateProfileData(displayName, bio, avatarUrl);
    setShowEdit(false);
    setUpdatedOk(true);
    setTimeout(() => setUpdatedOk(false), 2000);
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-4 sm:py-6 space-y-6">
      
      {/* Карточка Пользователя */}
      <div className="bg-slate-900/40 p-5 rounded-3xl border border-slate-800 flex flex-col items-center text-center space-y-4">
        
        {/* Аватар */}
        <div className="relative">
          <img
            src={user?.avatarUrl}
            alt={user?.displayName}
            className="w-20 h-20 rounded-full object-cover border-2 border-lime-400/80 shadow-md shadow-lime-400/25"
            referrerPolicy="no-referrer"
          />
          <span className="absolute -bottom-1 -right-1 bg-lime-400 text-[11px] p-1.5 rounded-full border border-slate-950 text-slate-950 font-bold">
            <UserCheck className="w-3.5 h-3.5" />
          </span>
        </div>

        {/* Имя и Ранг */}
        <div className="space-y-1">
          <h3 className="text-lg font-black text-slate-100 flex items-center justify-center gap-1">
            {user?.displayName}
          </h3>
          <p className="text-xs text-lime-400 font-bold font-mono">{user?.email}</p>
          {user?.bio && (
            <p className="max-w-sm text-xs text-slate-400 italic">«{user.bio}»</p>
          )}
        </div>

        {/* Бейджи подписки и ранга */}
        <div className="flex gap-2">
          <RankBadge rankTitle={user?.currentRank || 'Новичок'} />
          <span className="inline-flex px-3 py-1 font-black text-[10px] uppercase tracking-wider rounded-full border border-rose-500/30 text-rose-400 bg-rose-500/10">
            ТАРИФ: {user?.subscriptionStatus}
          </span>
        </div>

        {/* Прогресс-бар XP */}
        {nextRank && (
          <div className="w-full text-left space-y-1 bg-slate-950 p-4 rounded-xl border border-slate-800 pb-4">
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
            className="flex items-center gap-1.5 bg-slate-850 hover:bg-slate-850/80 text-white font-black text-xs px-4 py-2.5 rounded-xl border border-slate-700 cursor-pointer transition-colors w-full justify-center"
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
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Аватар</label>
            <div className="flex gap-2">
              {AVATAR_OPTIONS.map((av, index) => {
                const isSelected = avatarUrl === av;
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setAvatarUrl(av)}
                    className={`relative w-10 h-10 rounded-full overflow-hidden border-2 transition-all cursor-pointer ${
                      isSelected ? 'border-lime-400 scale-105 shadow-inner' : 'border-slate-800 grayscale opacity-60'
                    }`}
                  >
                    <img src={av} alt="option" className="w-full h-full object-cover" />
                  </button>
                );
              })}
            </div>
          </div>

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

      {/* Список ачивок (Achievements) */}
      <div className="space-y-3.5">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 pt-2">
          <Star className="w-4 h-4 text-lime-400" /> Спортивные достижения ({ACHIEVEMENTS.length})
        </h3>
        <div className="grid grid-cols-1 gap-3">
          {ACHIEVEMENTS.map(ach => {
            // Элементарное условие разблокировки для MVP
            let unlocked = false;
            let progress = 0;

            if (ach.id === 'ach_1') {
              // Иметь хотя бы 1 запись
              const userSubmissions = LocalDb.getSubmissions().filter(s => s.userId === user?.uid);
              const hasApproved = userSubmissions.some(s => s.status === 'approved');
              unlocked = hasApproved;
              progress = hasApproved ? 100 : (userSubmissions.length > 0 ? 50 : 0);
            } else if (ach.id === 'ach_2') {
              // Интенсивность (иметь push-ups > 50)
              const userSubmissions = LocalDb.getSubmissions().filter(s => s.userId === user?.uid);
              const maxPushups = Math.max(...userSubmissions.filter(s => s.workoutType === 'push-ups').map(s => s.countOrDistance), 0);
              unlocked = maxPushups >= 50;
              progress = Math.min(100, Math.floor((maxPushups / 50) * 100));
            } else if (ach.id === 'ach_3') {
              // Бег марафон
              const userSubmissions = LocalDb.getSubmissions().filter(s => s.userId === user?.uid);
              const maxRun = Math.max(...userSubmissions.filter(s => s.workoutType === 'running').map(s => s.countOrDistance), 0);
              unlocked = maxRun >= 10;
              progress = Math.min(100, Math.floor((maxRun / 10) * 100));
            } else if (ach.id === 'ach_4') {
              // Тариф elite
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
    name: 'Начальный (Free)',
    price: '0 ₽',
    duration: 'всегда',
    features: [
      'Верификация до 3 тренировок в сутки',
      'Стандартная очередь нейросети (до 10 минут)',
      'Базовый ранг "Новичок"',
      'Доступ во всероссийский лидерборд'
    ]
  },
  {
    id: 'pro' as SubscriptionStatus,
    name: 'Прокачанный (Pro)',
    price: '349 ₽',
    duration: 'месяц',
    features: [
      'Безлимитное добавление тренировок',
      'Ускоренная обработка (до 1 минуты)',
      'Отображение специальной ленты PRO',
      'Дополнительный бонусный множитель XP (+15%)'
    ]
  },
  {
    id: 'elite' as SubscriptionStatus,
    name: 'Мастер-Класс (Elite)',
    price: '799 ₽',
    duration: 'месяц',
    features: [
      'Приоритет ИИ №1 (анализ за 5 секунд)',
      'Установка эмблемы и статуса Elite в РФ',
      'Ручной разбор спорных видео тренером',
      'Множитель XP (+30%) на все повторения',
      'Индивидуальный план тренировок от ИИ'
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
        <p className="text-xs text-slate-400">Повысьте лимиты обработки видео и увеличьте начисление XP с Pro и Elite тарифами</p>
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
