import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, SubscriptionStatus } from './types';
import { isFirebaseMock, auth, db } from './firebase';
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
    if (isFirebaseMock) {
      // Имитация загрузки из localStorage
      const cachedSession = localStorage.getItem('fit_current_session_uid');
      if (cachedSession) {
        const users = LocalDb.getUsers();
        const found = users.find(u => u.uid === cachedSession);
        if (found) {
          setUser(found);
        } else {
          localStorage.removeItem('fit_current_session_uid');
        }
      }
      setLoading(false);
    } else {
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
                await setDoc(userDocRef, defaultProfile);
                LocalDb.syncUser(defaultProfile);
                setUser(defaultProfile);
              }

              // Запуск слушателей Firestore для ленты и рейтинга
              LocalDb.initFirestoreSync();
              
            } catch (err) {
              handleFirestoreError(err, OperationType.GET, `users/${firebaseUser.uid}`);
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
    
    if (isFirebaseMock) {
      // Эмуляция входа
      const users = LocalDb.getUsers();
      // Ищем юзера по email, либо берем кого-то из демо, либо создаем нового
      let found = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (!found) {
        // Создаем дефолтного
        const randomAv = RANDOM_AVATARS[Math.floor(Math.random() * RANDOM_AVATARS.length)];
        found = {
          uid: 'uid_' + Math.random().toString(36).substr(2, 9),
          displayName: email.split('@')[0],
          avatarUrl: randomAv,
          bio: 'Привет! Я новый пользователь.',
          currentRank: 'Новичок',
          points: 0,
          subscriptionStatus: 'free',
          email: email.toLowerCase()
        };
        LocalDb.syncUser(found);
      }
      
      setUser(found);
      localStorage.setItem('fit_current_session_uid', found.uid);
      return true;
    } else {
      // Реальный вход Firebase Auth
      // Внимание: поскольку реальные пользователи могут входить, мы симулируем успех если credentials не подходят
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
        setError(err.message || 'Ошибка входа');
        return false;
      }
    }
  };

  const signUp = async (email: string, name: string, pass: string): Promise<boolean> => {
    setError(null);
    if (!email || !name || !pass) {
      setError('Заполните все обязательные поля.');
      return false;
    }

    if (isFirebaseMock) {
      const users = LocalDb.getUsers();
      const exists = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (exists) {
        setError('Пользователь с таким email уже зарегистрирован.');
        return false;
      }

      const randomAv = RANDOM_AVATARS[Math.floor(Math.random() * RANDOM_AVATARS.length)];
      const newUser: UserProfile = {
        uid: 'uid_' + Math.random().toString(36).substr(2, 9),
        displayName: name,
        avatarUrl: randomAv,
        bio: 'Занимаюсь спортом и делюсь результатами!',
        currentRank: 'Новичок',
        points: 0,
        subscriptionStatus: 'free',
        email: email.toLowerCase()
      };

      LocalDb.syncUser(newUser);
      setUser(newUser);
      localStorage.setItem('fit_current_session_uid', newUser.uid);
      return true;
    } else {
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
        setError(err.message || 'Ошибка при регистрации');
        return false;
      }
    }
  };

  const logout = async () => {
    LocalDb.stopFirestoreSync();
    if (isFirebaseMock) {
      localStorage.removeItem('fit_current_session_uid');
      setUser(null);
    } else {
      try {
        await auth.signOut();
        setUser(null);
      } catch (err) {
        console.error('Logout error:', err);
      }
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
