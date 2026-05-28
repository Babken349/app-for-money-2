
import { User, WorkoutEntry, ExerciseTemplate, Supplement } from '../types';
import { DEFAULT_EXERCISES } from './defaultData';

const saveKey = (key: string, data: any) => localStorage.setItem(key, JSON.stringify(data));
const loadKey = <T>(key: string, defaultValue: T): T => {
  const item = localStorage.getItem(key);
  return item ? JSON.parse(item) : defaultValue;
};

export class LocalDb {
  
  static initTemplates(userId: string) {
    const templates = loadKey<ExerciseTemplate[]>('fit_templates', []);
    if (templates.length === 0) {
      const initialTemplates = DEFAULT_EXERCISES.map((ex, index) => ({
        ...ex,
        id: 'temp_default_' + index,
        userId: userId
      }));
      saveKey('fit_templates', initialTemplates);
      window.dispatchEvent(new Event('fit_db_updated'));
    }
  }

  // Базовые методы сохранения/загрузки
  static getTemplates(userId: string): ExerciseTemplate[] {
    return loadKey<ExerciseTemplate[]>('fit_templates', []).filter(t => t.userId === userId);
  }

  static addTemplate(userId: string, name: string, defaultReps: number): ExerciseTemplate {
    const templates = loadKey<ExerciseTemplate[]>('fit_templates', []);
    const newTemplate = { id: 'temp_' + Date.now(), userId, name, defaultReps };
    templates.push(newTemplate);
    saveKey('fit_templates', templates);
    window.dispatchEvent(new Event('fit_db_updated'));
    return newTemplate;
  }

  static deleteTemplate(id: string) {
    const templates = loadKey<ExerciseTemplate[]>('fit_templates', []).filter(t => t.id !== id);
    saveKey('fit_templates', templates);
    window.dispatchEvent(new Event('fit_db_updated'));
  }

  // Здесь будут реализовываться остальные методы (WorkoutEntry, User и т.д.)
  // по мере миграции компонентов.
}
