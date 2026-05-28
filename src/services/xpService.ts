import { doc, updateDoc, increment, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Service to handle experience points (XP) and ranking logic.
 * In a production scenario, this logic should be moved to Cloud Functions
 * to prevent client-side manipulation.
 */

export const addXPForAction = async (userId: string, xpAmount: number) => {
  if (!userId || xpAmount <= 0) return;

  const userRef = doc(db, 'users', userId);
  
  // Update XP directly in Firestore.
  // Note: For future Cloud Function migration, this will be 
  // replaced by an HTTP call to a secure function.
  await updateDoc(userRef, {
    points: increment(xpAmount)
  });
  
  // TODO: Logic for updating rank based on new total points
  // could also be handled here, but is better suited for a 
  // Cloud Function trigger on user document change.
};

export const addXPForWorkout = async (userId: string, points: number) => {
  return addXPForAction(userId, points);
};

export const addXPForHabit = async (userId: string, points: number) => {
  return addXPForAction(userId, points);
};
