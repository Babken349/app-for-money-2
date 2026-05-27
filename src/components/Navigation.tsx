import React, { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import { RankBadge } from './RankBadge';
import { LayoutDashboard, Award, Trophy, User, CreditCard, Sparkles, LogOut, Download } from 'lucide-react';

interface NavigationProps {
  currentTab: string;
  setTab: (tab: string) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentTab, setTab }) => {
  const { user, logout } = useAuth();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  // Кастомный триггер установки PWA в браузере
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallPwa = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('User accepted PWA install');
    }
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  const menuItems = [
    { id: 'dashboard', label: 'Лента', icon: LayoutDashboard },
    { id: 'submit', label: 'Добавить', icon: Award, highlight: true },
    { id: 'leaderboard', label: 'Рейтинг', icon: Trophy },
    { id: 'profile', label: 'Кабинет', icon: User },
    { id: 'subscription', label: 'Премиум', icon: CreditCard }
  ];

  if (!user) return null;

  return (
    <>
      {/* Верхний Навбар (Десктоп и общий заголовок) */}
      <header className="sticky top-0 z-40 w-full bg-slate-950/90 backdrop-blur-md border-b border-slate-800 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          
          {/* Бренд */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setTab('dashboard')}>
            <div className="w-8 h-8 rounded-lg bg-lime-400 flex items-center justify-center shadow-lg shadow-lime-400/20 text-slate-950 font-black text-sm">
              ФВ
            </div>
            <div>
              <h1 className="text-sm font-black tracking-tight text-slate-100 uppercase flex items-center gap-1">
                Фитнес Вериф <Sparkles className="w-3.5 h-3.5 text-lime-450 text-lime-400" />
              </h1>
              <span className="text-[10px] font-semibold text-slate-500 block -mt-1 uppercase tracking-widest">
                ИИ-Анализатор доказательств
              </span>
            </div>
          </div>

          {/* Быстрые статы и Действия */}
          <div className="flex items-center gap-2.5 sm:gap-4">
            
            {/* Очки верифицированные */}
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-[10px] font-bold text-slate-400">ВАШ РЕЙТИНГ:</span>
              <span className="text-xs font-black text-lime-400 font-mono">
                {user.points} XP <RankBadge rankTitle={user.currentRank} showIcon={false} className="py-0.5 px-1 ml-1 text-[9px]" />
              </span>
            </div>

            {/* Загрузка PWA Button */}
            {isInstallable && (
              <button
                onClick={handleInstallPwa}
                className="flex items-center gap-1 bg-lime-400 hover:bg-lime-300 text-slate-950 font-bold text-[10px] sm:text-xs px-2.5 py-1.5 rounded-lg border border-lime-350 shadow-lg shadow-lime-400/20 uppercase tracking-wider cursor-pointer transition-all animate-bounce"
              >
                <Download className="w-3.5 h-3.5" /> Установить PWA
              </button>
            )}

            {/* Выйти */}
            <button
              onClick={logout}
              title="Выйти из аккаунта"
              className="p-2 text-slate-400 hover:text-slate-100 bg-slate-900/40 hover:bg-slate-800/60 rounded-lg border border-slate-800/60 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </div>
      </header>

      {/* Липкое нижнее меню навигации (Мобильное + Десктопное снизу) */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-slate-950/95 backdrop-blur-lg border-t border-slate-800 pb-safe-bottom">
        <div className="max-w-md mx-auto px-4 py-2 flex items-center justify-between gap-1">
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            
            if (item.highlight) {
              return (
                <button
                  key={item.id}
                  onClick={() => setTab(item.id)}
                  className={`flex flex-col items-center justify-center -translate-y-4 relative z-10 w-14 h-14 bg-gradient-to-tr from-lime-500 to-lime-450 bg-lime-400 rounded-full border-4 border-slate-950 text-slate-950 shadow-xl shadow-lime-400/30 font-bold transition-transform cursor-pointer hover:scale-105 active:scale-95`}
                >
                  <Icon className="w-6 h-6 stroke-[2.5px]" />
                  <span className="text-[9px] mt-0.5 absolute -bottom-5 font-bold uppercase tracking-wider text-slate-400">
                    {item.label}
                  </span>
                </button>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={`flex-1 flex flex-col items-center justify-center py-1.5 rounded-xl transition-all cursor-pointer ${
                  isActive
                    ? 'text-lime-400 bg-lime-400/5 font-bold'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-lime-400 animate-pulse' : ''}`} />
                <span className="text-[10px] mt-1 font-semibold uppercase tracking-wide">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
      {/* Компенсационный отступ снизу */}
      <div className="h-20" />
    </>
  );
};
