import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, SubscriptionStatus } from './types';
import { auth, db } from './firebase';
import { LocalDb, getRankByPoints } from './mockDb';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
  login: (email: string, pass: string) => Promise<boolean>;
  signUp: (email: string, name: string, pass: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfileData: (displayName: string, bio: string, avatarUrl: string) => Promise<void>;
  updateSubscription: (tier: SubscriptionStatus) => Promise<void>;
  refreshPoints: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const RANDOM_AVATARS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
  'https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=150',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load user session on start
  useEffect(() => {
    // Реальный Firebase Auth слушатель
    if (auth) {
      const unsubscribe = auth.onAuthStateChanged(async (firebaseUser: any) => {
        if (firebaseUser) {
          // Загрузить профиль из Firestore
          const { doc, getDoc, setDoc } = await import('firebase/firestore');
          const { handleFirestoreError, OperationType } = await import('./firebase');
          
          try {
            const userDocRef = doc(db, 'users', firebaseUser.uid);
            const userSnapshot = await getDoc(userDocRef);
            
            if (userSnapshot.exists()) {
              const userData = userSnapshot.data() as UserProfile;
              setUser(userData);
              LocalDb.syncUser(userData);
            } else {
              const defaultProfile: UserProfile = {
                uid: firebaseUser.uid,
                displayName: firebaseUser.displayName || 'Атлет ' + firebaseUser.uid.substring(0, 4),
                avatarUrl: firebaseUser.photoURL || RANDOM_AVATARS[0],
                bio: 'Я тренируюсь с реальным Firebase!',
                currentRank: 'Новичок',
                points: 0,
                subscriptionStatus: 'free',
                email: firebaseUser.email || 'user@example.com'
              };
              try {
                await setDoc(userDocRef, defaultProfile);
              } catch (writeErr) {
                console.warn("[AuthContext] Failed to write default profile to Firestore, probably offline:", writeErr);
              }
              LocalDb.syncUser(defaultProfile);
              setUser(defaultProfile);
            }

            // Запуск слушателей Firestore для ленты и рейтинга
            LocalDb.initFirestoreSync();
            
          } catch (err: any) {
            const errMsg = err instanceof Error ? err.message : String(err);
            const isOffline = errMsg.toLowerCase().includes('offline') || errMsg.toLowerCase().includes('failed to get document');
            
            if (isOffline) {
              console.warn("[AuthContext] Firestore is offline. Falling back to local cache profile.");
              const users = LocalDb.getUsers();
              const matched = users.find(u => u.uid === firebaseUser.uid);
              if (matched) {
                setUser(matched);
              } else {
                const defaultProfile: UserProfile = {
                  uid: firebaseUser.uid,
                  displayName: firebaseUser.displayName || 'Атлет ' + firebaseUser.uid.substring(0, 4),
                  avatarUrl: firebaseUser.photoURL || RANDOM_AVATARS[0],
                  bio: 'Я тренируюсь (Автономный режим)!',
                  currentRank: 'Новичок',
                  points: 0,
                  subscriptionStatus: 'free',
                  email: firebaseUser.email || 'user@example.com'
                };
                LocalDb.syncUser(defaultProfile);
                setUser(defaultProfile);
              }
              // Still trigger listeners so if we go online they activate
              try {
                LocalDb.initFirestoreSync();
              } catch (syncErr) {
                console.warn("[AuthContext] Failed to init Firestore sync (offline):", syncErr);
              }
            } else {
              handleFirestoreError(err, OperationType.GET, `users/${firebaseUser.uid}`);
            }
          }
        } else {
          LocalDb.stopFirestoreSync();
          setUser(null);
        }
        setLoading(false);
      });
      return unsubscribe;
    } else {
      setLoading(false);
    }
  }, []);

  // Слушатель событий обновления базы данных (например, когда ML начисляет очки)
  useEffect(() => {
    const handleDbUpdate = () => {
      if (user) {
        const users = LocalDb.getUsers();
        const latest = users.find(u => u.uid === user.uid);
        if (latest) {
          setUser({ ...latest });
        }
      }
    };
    window.addEventListener('fit_db_updated', handleDbUpdate);
    return () => window.removeEventListener('fit_db_updated', handleDbUpdate);
  }, [user]);

  const refreshPoints = () => {
    if (user) {
      const users = LocalDb.getUsers();
      const latest = users.find(u => u.uid === user.uid);
      if (latest) setUser({ ...latest });
    }
  };

  const login = async (email: string, pass: string): Promise<boolean> => {
    setError(null);
    if (!email || !pass) {
      setError('Пожалуйста, введите корректный email и пароль.');
      return false;
    }
    
    // Реальный вход Firebase Auth
    try {
      const { signInWithEmailAndPassword } = await import('firebase/auth');
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      const firebaseUser = userCredential.user;
      const users = LocalDb.getUsers();
      let matched = users.find(u => u.uid === firebaseUser.uid);
      if (!matched) {
        matched = {
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName || email.split('@')[0],
          avatarUrl: RANDOM_AVATARS[0],
          bio: 'Я новый атлет в клубе.',
          currentRank: 'Новичок',
          points: 0,
          subscriptionStatus: 'free',
          email: email
        };
        LocalDb.syncUser(matched);
      }
      setUser(matched);
      return true;
    } catch (err: any) {
      let friendlyError = err.message || 'Ошибка входа';
      if (err.code === 'auth/configuration-not-found' || (err.message && err.message.includes('configuration-not-found'))) {
        friendlyError = 'В вашем Firebase-проекте не включен вход по Email/Паролю! Пожалуйста, перейдите в консоль Firebase -> Authentication -> Sign-in Method и включите этот способ.';
      }
      setError(friendlyError);
      return false;
    }
  };

  const signUp = async (email: string, name: string, pass: string): Promise<boolean> => {
    setError(null);
    if (!email || !name || !pass) {
      setError('Заполните все обязательные поля.');
      return false;
    }

    try {
      const { createUserWithEmailAndPassword, updateProfile } = await import('firebase/auth');
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      const firebaseUser = userCredential.user;
      
      await updateProfile(firebaseUser, { displayName: name });
      
      const newUser: UserProfile = {
        uid: firebaseUser.uid,
        displayName: name,
        avatarUrl: RANDOM_AVATARS[0],
        bio: 'Занимаюсь спортом на реальном бэкенде.',
        currentRank: 'Новичок',
        points: 0,
        subscriptionStatus: 'free',
        email: email
      };

      LocalDb.syncUser(newUser);
      setUser(newUser);
      return true;
    } catch (err: any) {
      let friendlyError = err.message || 'Ошибка при регистрации';
      if (err.code === 'auth/configuration-not-found' || (err.message && err.message.includes('configuration-not-found'))) {
        friendlyError = 'В вашем Firebase-проекте не включен вход по Email/Паролю! Пожалуйста, перейдите в консоль Firebase -> Authentication -> Sign-in Method и включите этот способ.';
      }
      setError(friendlyError);
      return false;
    }
  };

  const logout = async () => {
    LocalDb.stopFirestoreSync();
    try {
      await auth.signOut();
      setUser(null);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const updateProfileData = async (displayName: string, bio: string, avatarUrl: string) => {
    if (!user) return;
    const updated = {
      ...user,
      displayName,
      bio,
      avatarUrl
    };
    LocalDb.syncUser(updated);
    setUser(updated);
  };

  const updateSubscription = async (tier: SubscriptionStatus) => {
    if (!user) return;
    const updated = {
      ...user,
      subscriptionStatus: tier
    };
    LocalDb.syncUser(updated);
    setUser(updated);
    console.log(`[SUBSCRIPTION] Тариф успешно изменен на ${tier}`);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        signUp,
        logout,
        updateProfileData,
        updateSubscription,
        refreshPoints
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
