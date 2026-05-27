import React, { useState } from 'react';
import { AuthProvider, useAuth } from './AuthContext';
import { Navigation } from './components/Navigation';
import {
  LandingView,
  AuthView,
  DashboardView,
  SubmitView,
  LeaderboardView,
  ProfileView,
  SubscriptionView
} from './components/Views';
import { Sparkles, Compass, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

function FitnessAppContent() {
  const { user, loading } = useAuth();
  const [currentTab, setTab] = useState<string>('landing');

  // Красивый индикатор загрузки
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-lime-400/15 border-t-lime-400 rounded-full animate-spin" />
          <div className="absolute w-10 h-10 bg-lime-400/10 rounded-full flex items-center justify-center text-lime-400 font-black animate-pulse">
            ФВ
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-black uppercase tracking-widest text-slate-200">ИИ-Верификатор</p>
          <p className="text-xs text-slate-500 animate-pulse">Соберите инвентарь, загружаем нормативы...</p>
        </div>
      </div>
    );
  }

  // Роутинг для гостей
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-between">
        {/* Хедер для гостей */}
        <header className="w-full bg-slate-900/50 border-b border-slate-800 px-4 py-4">
          <div className="max-w-4xl mx-auto flex justify-between items-center gap-4">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setTab('landing')}>
              <div className="w-8 h-8 rounded-lg bg-lime-400 flex items-center justify-center shadow-lg shadow-lime-400/20 text-slate-950 font-black text-xs leading-none">
                ФВ
              </div>
              <h1 className="text-xs font-black tracking-wider text-slate-200 uppercase">
                Фитнес Вериф
              </h1>
            </div>
            {currentTab === 'auth' ? (
              <button
                onClick={() => setTab('landing')}
                className="text-xs font-bold text-slate-400 hover:text-slate-200 transition-colors uppercase tracking-wider cursor-pointer"
              >
                ← На главную
              </button>
            ) : (
              <button
                onClick={() => setTab('auth')}
                className="bg-lime-400 hover:bg-lime-300 text-slate-950 font-bold text-xs uppercase tracking-wider px-4 py-2 rounded-xl transition-all cursor-pointer shadow-lg shadow-lime-400/20"
              >
                Войти
              </button>
            )}
          </div>
        </header>

        {/* Тело гостевой страницы */}
        <main className="flex-1 overflow-y-auto pb-12">
          {currentTab === 'auth' ? (
            <AuthView />
          ) : (
            <LandingView onGetStarted={() => setTab('auth')} />
          )}
        </main>

        {/* Футер для гостей */}
        <footer className="w-full bg-slate-900/30 border-t border-slate-800 py-6 text-center text-slate-600 text-[10px] space-y-1">
          <p>© 2026 Фитнес Верификация PWA РФ. Все права защищены.</p>
          <p className="flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-lime-400/60" /> Эмулированный MVP контур безопасности
          </p>
        </footer>
      </div>
    );
  }

  // Роутинг для авторизованных пользователей
  const renderTabContent = () => {
    switch (currentTab) {
      case 'landing':
        // Если залогинился - автоматически переводим на ленту
        setTab('dashboard');
        return <DashboardView setTab={setTab} />;
      case 'dashboard':
        return <DashboardView setTab={setTab} />;
      case 'submit':
        return <SubmitView setTab={setTab} />;
      case 'leaderboard':
        return <LeaderboardView />;
      case 'profile':
        return <ProfileView />;
      case 'subscription':
        return <SubscriptionView />;
      default:
        return <DashboardView setTab={setTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between">
      {/* Шапка и меню */}
      <Navigation currentTab={currentTab} setTab={setTab} />

      {/* Основной контейнер с эффектами затухания путей */}
      <main className="flex-1 pb-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTab}
            initial={{ opacity: 0, y: 7 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -7 }}
            transition={{ duration: 0.15 }}
          >
            {renderTabContent()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <FitnessAppContent />
    </AuthProvider>
  );
}
