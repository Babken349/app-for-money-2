
export type SubscriptionStatus = 'free' | 'premium';

export interface User {
  uid: string;
  email: string;
  displayName: string;
  points: number;
  earnedAchievements: string[];
  rank: string;
  subscriptionStatus: SubscriptionStatus;
}

export interface WorkoutEntry {
  id: string;
  userId: string;
  templateId: string;
  date: string;
  sets: { reps: number; weight: number }[];
  comment: string;
  createdAt: number;
}

export interface ExerciseTemplate {
  id: string;
  userId: string;
  name: string;
  defaultReps: number;
}

export interface Supplement {
  id: string;
  userId: string;
  name: string;
  time: string;
  notificationsEnabled: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  points: number;
  icon: string;
}
