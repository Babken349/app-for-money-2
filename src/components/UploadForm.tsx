import React, { useState } from 'react';
import { WorkoutType } from '../types';
import { WORKOUT_OPTS, LocalDb } from '../mockDb';
import { useAuth } from '../AuthContext';
import { FileVideo, Compass, Upload, AlertCircle, Sparkles, Check } from 'lucide-react';
import { motion } from 'motion/react';

// Популярные открытые фитнес-клипы для эмуляции
const EMBEDDED_VIDEOS = [
  {
    label: 'Синхронные отжимания',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-pushups-in-gym-43026-large.mp4',
    icon: '🏋️‍♂️'
  },
  {
    label: 'Кардио на дорожке',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-woman-running-on-treadmill-41718-large.mp4',
    icon: '🏃‍♀️'
  },
  {
    label: 'Приседания на траве',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-man-exercising-in-a-sunny-park-41619-large.mp4',
    icon: '🦵'
  }
];

interface UploadFormProps {
  onSuccess: () => void;
}

export const UploadForm: React.FC<UploadFormProps> = ({ onSuccess }) => {
  const { user } = useAuth();
  
  const [workoutType, setWorkoutType] = useState<WorkoutType>('push-ups');
  const [countOrDistance, setCountOrDistance] = useState<number>(30);
  const [description, setDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState(EMBEDDED_VIDEOS[0].url);
  const [isUploading, setIsUploading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  // Выбор предустановленного видео
  const handleSelectPreloaded = (url: string) => {
    setVideoUrl(url);
  };

  const currentOption = WORKOUT_OPTS.find(o => o.value === workoutType);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (countOrDistance <= 0) {
      setMsg('Пожалуйста, введите корректный результат.');
      return;
    }

    setIsUploading(true);
    setMsg(null);

    // Добавляем искусственную небольшую задержку загрузки "Видео-доказательства на сервер"
    setTimeout(() => {
      try {
        LocalDb.submitWorkout(
          user.uid,
          workoutType,
          Number(countOrDistance),
          description,
          videoUrl
        );
        
        setIsUploading(false);
        setDescription('');
        setCountOrDistance(30);
        onSuccess();
      } catch (err) {
        setIsUploading(false);
        setMsg('При отправке возникла техническая ошибка.');
      }
    }, 1200);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-slate-900/40 p-5 sm:p-6 rounded-2xl border border-slate-800 space-y-5">
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 bg-lime-400/15 text-lime-400 rounded-lg">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-100">Новое видео</h3>
          <p className="text-xs text-slate-400">Поделитесь своим результатом в ленте</p>
        </div>
      </div>

      {msg && (
        <div className="flex gap-2 items-center text-xs text-rose-400 bg-rose-500/5 p-3 rounded-xl border border-rose-500/10">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      {/* Выбор упражнения */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Тип тренировки</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {WORKOUT_OPTS.map(opt => {
            const isSelected = workoutType === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  setWorkoutType(opt.value as WorkoutType);
                  // Ставим логичные дефолты
                  if (opt.value === 'running') {
                    setCountOrDistance(5);
                  } else {
                    setCountOrDistance(30);
                  }
                }}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-lime-400/10 border-lime-400/40 text-lime-450 text-lime-400'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <span className="text-xl mb-1 select-none">{opt.icon}</span>
                <span className="text-[11px] font-bold leading-tight">{opt.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Числовой показатель */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Результат ({currentOption?.label.split('(')[1].replace(')', '')})
        </label>
        <div className="relative">
          <input
            type="number"
            step={workoutType === 'running' ? '0.1' : '1'}
            value={countOrDistance}
            onChange={e => setCountOrDistance(parseFloat(e.target.value) || 0)}
            className="w-full bg-slate-950 text-slate-100 placeholder-slate-600 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-lime-400 text-center font-bold text-base"
            required
          />
        </div>
      </div>

      {/* Описание */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Описание (необязательно)</label>
        <textarea
          placeholder="Сделал чистые повторения с касанием пола..."
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={3}
          className="w-full bg-slate-950 text-slate-100 placeholder-slate-600 border border-slate-800 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-lime-400 leading-relaxed resize-none"
        />
      </div>

      {/* Триггер видео-пруфа */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
          <span>Опубликовать видео</span>
        </label>
        
        {/* Панель выбора HD пресетов */}
        <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 space-y-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">
            🎁 Выберите фитнес-клип для мгновенного теста:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
            {EMBEDDED_VIDEOS.map(vid => {
              const isSelected = videoUrl === vid.url;
              return (
                <button
                  key={vid.label}
                  type="button"
                  onClick={() => handleSelectPreloaded(vid.url)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-left text-[11px] font-medium transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-lime-400/10 border-lime-400/35 text-lime-400'
                      : 'bg-slate-900 border-slate-800/50 text-slate-400 hover:bg-slate-800/30'
                  }`}
                >
                  <span className="select-none">{vid.icon}</span>
                  <span className="truncate flex-1">{vid.label}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-lime-400 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Выбор своего видеофайла */}
        <div className="space-y-1.5 p-3 rounded-xl bg-slate-950 border border-slate-850/70">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
            Загрузить свой видеофайл
          </span>
          <label className="flex flex-col items-center justify-center p-3.5 border border-dashed border-slate-800 hover:border-lime-400/50 bg-slate-900/40 hover:bg-slate-900/70 rounded-xl cursor-pointer transition-all gap-1.5 text-center group">
            <input
              type="file"
              accept="video/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const objectUrl = URL.createObjectURL(file);
                  setVideoUrl(objectUrl);
                }
              }}
              className="hidden"
            />
            <div className="flex items-center gap-1.5 text-lime-400">
              <FileVideo className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold tracking-wide">Выбрать видеофайл с устройства</span>
            </div>
            <span className="text-[9px] text-slate-500 font-medium font-sans">MP4, WebM, MOV, AVI и др.</span>
          </label>
        </div>

        {/* Пользовательское текстовое поле URL */}
        <div className="space-y-1">
          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Или введите ссылку вручную:</span>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
              <Compass className="w-4 h-4" />
            </div>
            <input
              type="url"
              placeholder="https://example.com/fitness-video.mp4"
              value={videoUrl}
              onChange={e => setVideoUrl(e.target.value)}
              className="w-full bg-slate-950 text-slate-200 placeholder-slate-700 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs focus:outline-none focus:border-lime-400 text-mono truncate"
            />
          </div>
        </div>
      </div>

      {/* Кнопка отправки */}
      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        type="submit"
        disabled={isUploading}
        className={`w-full py-3.5 px-4 font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
          isUploading
            ? 'bg-lime-400/40 text-lime-450 text-lime-400/70 cursor-not-allowed'
            : 'bg-lime-400 hover:bg-lime-300 text-slate-950 shadow-lime-400/20'
        }`}
      >
        {isUploading ? (
          <>
            <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
            Публикация...
          </>
        ) : (
          <>
            <Upload className="w-4 h-4" /> Опубликовать видео
          </>
        )}
      </motion.button>
    </form>
  );
};
