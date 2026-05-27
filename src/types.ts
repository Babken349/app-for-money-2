/**
 * TypeScript definitions for Fitness Verification PWA.
 * Conforms to our Firestore database blueprint.
 */

export type SubscriptionStatus = 'free' | 'member' | 'pro' | 'elite';

export type WorkoutType = 'push-ups' | 'squats' | 'running';

export type SubmissionStatus = 'pending' | 'approved' | 'rejected' | 'suspicious';

export interface UserProfile {
  uid: string;
  displayName: string;
  avatarUrl: string;
  bio: string;
  currentRank: string;
  points: number;
  subscriptionStatus: SubscriptionStatus;
  email: string;
}

export interface WorkoutDay {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  title: string; // e.g. "Грудь+Трицепс", "Ноги"
  createdAt?: string;
}

export interface WorkoutSetInfo {
  setNumber: number;
  reps: number;
  weight: number;
}

export interface WorkoutEntry {
  id: string;
  userId: string;
  dayId: string;
  exerciseName: string;
  sets: number;
  repsPerSet?: number; // fallback/summary
  weight?: number; // fallback/summary
  setsDetails?: WorkoutSetInfo[]; // detailed set lists
  comment?: string;
  createdAt: string;
}

export interface WeightEntry {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  weight: number; // kg
  createdAt: string;
}

export interface HabitDay {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  habitType: 'no_sugar' | string;
  status: 'clean' | 'failed';
}


export interface Submission {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  workoutType: WorkoutType;
  countOrDistance: number;
  description: string;
  videoUrl: string;
  status: SubmissionStatus;
  pointsAwarded: number;
  createdAt: string; // ISO String or Firestore timestamp serialized
}

export interface Rank {
  id: string;
  title: string;
  minPoints: number;
  badge: string; // Tailwind color or icon/emoji description
}

export interface SubscriptionPlan {
  id: SubscriptionStatus;
  name: string;
  price: string;
  features: string[];
  duration: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  points: number;
  icon: string; // Emoji
}

export interface VerificationJob {
  id: string;
  submissionId: string;
  videoUrl: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  mlConfidence: number;
  feedback?: string;
  createdAt: string;
}
