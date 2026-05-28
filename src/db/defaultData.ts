import { ExerciseTemplate } from '../types';

export const DEFAULT_EXERCISES: Omit<ExerciseTemplate, 'id' | 'userId'>[] = [
  { name: 'Жим лежа', defaultReps: 10 },
  { name: 'Приседания', defaultReps: 15 },
  { name: 'Становая тяга', defaultReps: 8 },
  { name: 'Подтягивания', defaultReps: 8 },
  { name: 'Отжимания', defaultReps: 20 },
  { name: 'Планка', defaultReps: 1 },
  { name: 'Бег', defaultReps: 1 },
  { name: 'Велосипед', defaultReps: 1 },
  { name: 'Жим гантелей', defaultReps: 12 },
  { name: 'Махи гантелями', defaultReps: 15 },
  { name: 'Разгибания рук', defaultReps: 12 },
  { name: 'Сгибания рук (бицепс)', defaultReps: 12 },
  { name: 'Пресс (скручивания)', defaultReps: 20 },
  { name: 'Выпады', defaultReps: 12 },
  { name: 'Берпи', defaultReps: 10 },
];
