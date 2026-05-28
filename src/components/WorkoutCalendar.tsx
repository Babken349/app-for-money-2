import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface WorkoutCalendarProps {
  workoutDays: any[];
  onDateSelect: (date: string) => void;
  selectedDate: string;
}

export const WorkoutCalendar: React.FC<WorkoutCalendarProps> = ({ workoutDays, onDateSelect, selectedDate }) => {
  const currentDate = new Date(selectedDate);
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = useMemo(() => {
    const days = [];
    const date = new Date(year, month, 1);
    while (date.getMonth() === month) {
      days.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    return days;
  }, [year, month]);

  const completedDays = useMemo(() => {
    return workoutDays.map(d => d.date);
  }, [workoutDays]);

  return (
    <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-black text-slate-100 uppercase tracking-tight">
          {currentDate.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}
        </h4>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(day => (
          <div key={day} className="text-[10px] font-bold text-slate-500 text-center uppercase">
            {day}
          </div>
        ))}
        {daysInMonth.map((date, i) => {
          const dateStr = date.toISOString().split('T')[0];
          const isSelected = dateStr === selectedDate;
          const hasCompletedTraining = completedDays.includes(dateStr);
          const isToday = dateStr === new Date().toISOString().split('T')[0];

          return (
            <motion.button
              key={dateStr}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onDateSelect(dateStr)}
              className={`
                aspect-square flex items-center justify-center text-xs font-bold rounded-xl border transition-all
                ${isSelected 
                  ? 'bg-lime-400 text-slate-950 border-lime-400' 
                  : hasCompletedTraining
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600'
                }
                ${isToday && !isSelected ? 'border-lime-400/50' : ''}
              `}
            >
              {date.getDate()}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
