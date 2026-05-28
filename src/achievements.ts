import { Achievement } from './types';

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_workout', title: 'Первый шаг', description: 'Завершите первую тренировку', points: 10, icon: '🚀' },
  { id: 'bench_40', title: 'Жим 40', description: 'Покорите рубеж в 40 кг', points: 20, icon: '💪' },
  { id: 'bench_100', title: 'Мастер жима', description: 'Покорите рубеж в 100 кг', points: 100, icon: '🏆' },
];

export const checkAchievements = (workoutEntries: any[], existingAchievements: string[]): { newAchievements: Achievement[], updatedAchievementsList: string[] } => {
  const newAchievements: Achievement[] = [];
  const updatedAchievementsList = [...existingAchievements];

  const maxBench = workoutEntries
    .filter(e => e.workoutType === 'bench_press')
    .reduce((max, e) => Math.max(max, e.weight || 0), 0);

  if (maxBench >= 40 && !updatedAchievementsList.includes('bench_40')) {
    newAchievements.push(ACHIEVEMENTS.find(a => a.id === 'bench_40')!);
    updatedAchievementsList.push('bench_40');
  }
  
  if (maxBench >= 100) {
    if (!updatedAchievementsList.includes('bench_40')) {
      newAchievements.push(ACHIEVEMENTS.find(a => a.id === 'bench_40')!);
      updatedAchievementsList.push('bench_40');
    }
    if (!updatedAchievementsList.includes('bench_100')) {
      newAchievements.push(ACHIEVEMENTS.find(a => a.id === 'bench_100')!);
      updatedAchievementsList.push('bench_100');
    }
  }

  // Example: simple check for any workout for 'first_workout'
  if (workoutEntries.length > 0 && !updatedAchievementsList.includes('first_workout')) {
      newAchievements.push(ACHIEVEMENTS.find(a => a.id === 'first_workout')!);
      updatedAchievementsList.push('first_workout');
  }

  return { newAchievements, updatedAchievementsList };
};
