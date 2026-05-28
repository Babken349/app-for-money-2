import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Zap } from 'lucide-react';

export const WelcomeOverlay: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="bg-white rounded-3xl p-8 max-w-sm w-full space-y-6 shadow-2xl"
        >
          <div className="text-center space-y-2">
            <Zap className="w-12 h-12 text-lime-400 mx-auto" />
            <h2 className="text-2xl font-black text-slate-900 uppercase">Добро пожаловать в Фитнес Сеть!</h2>
            <p className="text-sm text-slate-600">Это ваша персональная социальная сеть для отслеживания тренировок, прогресса и общения с атлетами.</p>
          </div>
          <button
            onClick={onClose}
            className="w-full bg-lime-400 text-slate-950 font-bold py-3 rounded-xl hover:bg-lime-500 transition-colors"
          >
            Понятно, начать!
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
