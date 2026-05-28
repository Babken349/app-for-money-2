import React, { useState } from 'react';
import { AuthProvider, useAuth } from './AuthContext';
import { ThemeProvider, useTheme } from './themeContext';
import { Navigation } from './components/Navigation';
import {
  LandingView,
  AuthView,
  ForgotPasswordView,
  DashboardView,
  SubmitView,
  LeaderboardView,
  ProfileView,
  SubscriptionView,
  DiaryView,
  ProgressView,
  PublicProfileView,
  SupplementsView,
  LegalInfoView
} from './components/Views';
import { ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

function FitnessAppContent() {
  const { user, loading } = useAuth();
  const { theme } = useTheme();
  const [currentTab, setTab] = useState<string>('landing');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const handleUserClick = (userId: string) => {
    setSelectedUserId(userId);
    setTab('public_profile');
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-slate-950' : 'bg-white'} flex flex-col items-center justify-center p-6 text-center space-y-4`}>
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-lime-400/15 border-t-lime-400 rounded-full animate-spin" />
          <div className="absolute w-10 h-10 bg-lime-400/10 rounded-full flex items-center justify-center text-lime-400 font-black animate-pulse">
            ФС
          </div>
        </div>
        <div className="space-y-1">
          <p className={`text-sm font-black uppercase tracking-widest ${theme === 'dark' ? 'text-slate-200' : 'text-slate-900'}`}>Фитнес Сеть</p>
          <p className="text-xs text-slate-500 animate-pulse">Загружаем профиль, синхронизируем дневник...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-slate-950' : 'bg-white'} flex flex-col justify-between`}>
        {/* Хедер для гостей */}
        <header className={`w-full ${theme === 'dark' ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-100 border-slate-200'} border-b px-4 py-4`}>
          <div className="max-w-4xl mx-auto flex justify-between items-center gap-4">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setTab('landing')}>
              <div className="w-8 h-8 rounded-lg bg-lime-400 flex items-center justify-center shadow-lg shadow-lime-400/20 text-slate-950 font-black text-xs leading-none">
                ФС
              </div>
              <h1 className={`text-xs font-black tracking-wider ${theme === 'dark' ? 'text-slate-200' : 'text-slate-900'} uppercase`}>
                Фитнес Сеть
              </h1>
            </div>
            {currentTab === 'auth' ? (
              <button
                onClick={() => setTab('landing')}
                className={`text-xs font-bold ${theme === 'dark' ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'} transition-colors uppercase tracking-wider cursor-pointer`}
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

        <main className="flex-1 overflow-y-auto pb-12">
          {currentTab === 'auth' ? (
            <AuthView setTab={setTab} />
          ) : currentTab === 'forgot_password' ? (
             <ForgotPasswordView setTab={setTab} />
          ) : (
            <LandingView onGetStarted={() => setTab('auth')} />
          )}
        </main>

        <footer className={`w-full ${theme === 'dark' ? 'bg-slate-900/30' : 'bg-slate-100/50'} border-t ${theme === 'dark' ? 'border-slate-800 text-slate-600' : 'border-slate-200 text-slate-400'} py-6 text-center text-[10px] space-y-1`}>
          <p>© 2026 Фитнес Социальная Сеть & Дневник. Все права защищены.</p>
          <p className="flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-lime-400/60" /> Защищенный MVP-контур данных
          </p>
        </footer>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (currentTab) {
      case 'landing':
        setTab('diary');
        return <DiaryView setTab={setTab} />;
      case 'diary':
        return <DiaryView setTab={setTab} />;
      case 'progress':
        return <ProgressView />;
      case 'dashboard':
        return <DashboardView setTab={setTab} onUserClick={handleUserClick} />;
      case 'submit':
        return <SubmitView setTab={setTab} />;
      case 'leaderboard':
        return <LeaderboardView onUserClick={handleUserClick} />;
      case 'profile':
        return <ProfileView />;
      case 'public_profile':
        return <PublicProfileView userId={selectedUserId} setTab={setTab} onUserClick={handleUserClick} />;
      case 'subscription':
        return <SubscriptionView />;
      case 'supplements':
        return <SupplementsView />;
      default:
        return <DiaryView setTab={setTab} />;
    }
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-slate-950' : 'bg-white'} flex flex-col justify-between`}>
      <Navigation currentTab={currentTab} setTab={setTab} />

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
      <ThemeProvider>
        <FitnessAppContent />
      </ThemeProvider>
    </AuthProvider>
  );
}
