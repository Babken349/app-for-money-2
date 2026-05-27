import { WorkoutType, SubmissionStatus, Submission, UserProfile, VerificationJob, SubscriptionStatus } from './types';
import { collection, onSnapshot, query, orderBy, setDoc, getDoc, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db, auth, isFirebaseMock, handleFirestoreError, OperationType } from './firebase';

// Пределы для Рангов (5 Рангов по требованию)
export const RANKS = [
  { title: 'Новичок', minPoints: 0, badge: '🟢', color: 'text-green-400 bg-green-500/10 border-green-500/20' },
  { title: 'Любитель', minPoints: 100, badge: '🔵', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  { title: 'Атлет', minPoints: 250, badge: '🟣', color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
  { title: 'Эксперт', minPoints: 500, badge: '🟡', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  { title: 'Мастер', minPoints: 1000, badge: '🔥', color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' }
];

export const getRankByPoints = (points: number) => {
  let matched = RANKS[0];
  for (const rank of RANKS) {
    if (points >= rank.minPoints) {
      matched = rank;
    }
  }
  return matched;
};

// Пресеты упражнений
export const WORKOUT_OPTS = [
  { value: 'push-ups', label: 'Отжимания (раз)', pointsPerUnit: 2, icon: '🏋️‍♂️' },
  { value: 'squats', label: 'Приседания (раз)', pointsPerUnit: 1, icon: '🦵' },
  { value: 'running', label: 'Бег (км)', pointsPerUnit: 50, icon: '🏃‍♂️' }
];

// Список статических ачивок
export const ACHIEVEMENTS = [
  { id: 'ach_1', title: 'Первый Шаг', description: 'Сдать 1 подтвержденную тренировку любого типа', points: 30, icon: '🥉' },
  { id: 'ach_2', title: 'Стальные Плечи', description: 'Сделать более 50 отжиманий за подход', points: 70, icon: '🥈' },
  { id: 'ach_3', title: 'Марафонец', description: 'Пробежать дистанцию более 10 км', points: 100, icon: '🥇' },
  { id: 'ach_4', title: 'Постоянство', description: 'Получить статус Elite подписки для максимального доступа', points: 150, icon: '💎' }
];

// Предопределенные пользователи для яркого лидерборда
const INITIAL_USERS: UserProfile[] = [
  {
    uid: 'user_alex',
    displayName: 'Александр Петров',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    bio: 'Тренируюсь каждый день. Цель - 1000 отжиманий за раз!',
    currentRank: 'Мастер',
    points: 1250,
    subscriptionStatus: 'elite',
    email: 'alex@fitverif.ru'
  },
  {
    uid: 'user_elena',
    displayName: 'Елена Смирнова',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    bio: 'Движение - это жизнь. Обожаю бег и приседания.',
    currentRank: 'Эксперт',
    points: 620,
    subscriptionStatus: 'pro',
    email: 'elena@fitverif.ru'
  },
  {
    uid: 'user_dmitry',
    displayName: 'Дмитрий Козлов',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    bio: 'Начинающий кроссфитер.',
    currentRank: 'Атлет',
    points: 340,
    subscriptionStatus: 'free',
    email: 'dima@fitverif.ru'
  }
];

// Предопределенныеsubmissions для фида тренировок
const INITIAL_SUBMISSIONS: Submission[] = [
  {
    id: 'sub_1',
    userId: 'user_alex',
    userName: 'Александр Петров',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    workoutType: 'push-ups',
    countOrDistance: 60,
    description: 'Утренний максимальный подход отжиманий у стены.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-pushups-in-gym-43026-large.mp4',
    status: 'approved',
    pointsAwarded: 120,
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString()
  },
  {
    id: 'sub_2',
    userId: 'user_elena',
    userName: 'Елена Смирнова',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    workoutType: 'running',
    countOrDistance: 12,
    description: 'Вечерний забег вдоль набережной. Пульс 145.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-running-on-treadmill-41718-large.mp4',
    status: 'approved',
    pointsAwarded: 600,
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString()
  },
  {
    id: 'sub_3',
    userId: 'user_dmitry',
    userName: 'Дмитрий Козлов',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    workoutType: 'squats',
    countOrDistance: 100,
    description: 'Приседания без отягощений на скорость.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-exercising-in-a-sunny-park-41619-large.mp4',
    status: 'suspicious',
    pointsAwarded: 0,
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
  }
];

// Helper to load/save state
const loadKey = <T>(key: string, backup: T): T => {
  const value = localStorage.getItem(key);
  if (!value) return backup;
  try {
    return JSON.parse(value) as T;
  } catch {
    return backup;
  }
};

const saveKey = (key: string, value: any) => {
  localStorage.setItem(key, JSON.stringify(value));
};

let activeUsers: UserProfile[] = [];
let activeSubmissions: Submission[] = [];
let activeJobs: VerificationJob[] = [];

export class LocalDb {
  static unsubscribeUsers: any = null;
  static unsubscribeSubmissions: any = null;

  static initFirestoreSync() {
    if (isFirebaseMock || !db) return;

    this.stopFirestoreSync();

    console.log("[Firebase Sync] Initializing Firestore real-time listeners...");

    // 1. Listen to Users
    try {
      const usersRef = collection(db, 'users');
      this.unsubscribeUsers = onSnapshot(usersRef, (snapshot) => {
        const usersList: UserProfile[] = [];
        snapshot.forEach((doc) => {
          usersList.push(doc.data() as UserProfile);
        });
        
        if (usersList.length === 0) {
          console.log("[Firebase Sync] Seeding initial users...");
          INITIAL_USERS.forEach(async (u) => {
            try {
              await setDoc(doc(db, 'users', u.uid), u);
            } catch (err) {
              console.error("[Firebase Sync] Seeding user failed:", err);
            }
          });
        } else {
          activeUsers = usersList;
          saveKey('fit_users', usersList);
          window.dispatchEvent(new Event('fit_db_updated'));
        }
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, 'users');
      });
    } catch (err) {
      console.error("[Firebase Sync] Failed to attach users snapshot listener:", err);
    }

    // 2. Listen to Submissions
    try {
      const subsRef = collection(db, 'submissions');
      this.unsubscribeSubmissions = onSnapshot(subsRef, (snapshot) => {
        const subsList: Submission[] = [];
        snapshot.forEach((doc) => {
          subsList.push(doc.data() as Submission);
        });

        if (subsList.length === 0) {
          console.log("[Firebase Sync] Seeding initial submissions...");
          INITIAL_SUBMISSIONS.forEach(async (s) => {
            try {
              await setDoc(doc(db, 'submissions', s.id), s);
            } catch (err) {
              console.error("[Firebase Sync] Seeding submission failed:", err);
            }
          });
        } else {
          activeSubmissions = subsList;
          saveKey('fit_submissions', subsList);
          window.dispatchEvent(new Event('fit_db_updated'));
        }
      }, (error) => {
        handleFirestoreError(error, OperationType.GET, 'submissions');
      });
    } catch (err) {
      console.error("[Firebase Sync] Failed to attach submissions snapshot listener:", err);
    }
  }

  static stopFirestoreSync() {
    if (this.unsubscribeUsers) {
      this.unsubscribeUsers();
      this.unsubscribeUsers = null;
    }
    if (this.unsubscribeSubmissions) {
      this.unsubscribeSubmissions();
      this.unsubscribeSubmissions = null;
    }
  }

  static getUsers(): UserProfile[] {
    if (!isFirebaseMock && activeUsers.length > 0) {
      return activeUsers;
    }
    return loadKey('fit_users', INITIAL_USERS);
  }

  static getSubmissions(): Submission[] {
    const list = (!isFirebaseMock && activeSubmissions.length > 0)
      ? activeSubmissions
      : loadKey('fit_submissions', INITIAL_SUBMISSIONS);
    return list.slice().sort(
      (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  static getJobs(): VerificationJob[] {
    return loadKey('fit_verification_jobs', []);
  }

  static saveUsers(users: UserProfile[]) {
    saveKey('fit_users', users);
  }

  static saveSubmissions(submissions: Submission[]) {
    saveKey('fit_submissions', submissions);
  }

  static saveJobs(jobs: VerificationJob[]) {
    saveKey('fit_verification_jobs', jobs);
  }

  // Обновление или создание юзера
  static syncUser(profile: UserProfile) {
    const users = this.getUsers();
    const idx = users.findIndex(u => u.uid === profile.uid);
    if (idx >= 0) {
      users[idx] = profile;
    } else {
      users.push(profile);
    }
    this.saveUsers(users);

    if (!isFirebaseMock && db) {
      try {
        setDoc(doc(db, 'users', profile.uid), profile).catch(err => {
          handleFirestoreError(err, OperationType.WRITE, `users/${profile.uid}`);
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${profile.uid}`);
      }
    }
  }

  // Создать submission
  static submitWorkout(
    userId: string,
    workoutType: WorkoutType,
    countOrDistance: number,
    description: string,
    videoUrl: string
  ): Submission {
    const users = this.getUsers();
    const user = users.find(u => u.uid === userId);
    
    const newSubmission: Submission = {
      id: 'sub_' + Math.random().toString(36).substr(2, 9),
      userId,
      userName: user ? user.displayName : 'Атлет',
      userAvatar: user ? user.avatarUrl : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      workoutType,
      countOrDistance,
      description,
      videoUrl: videoUrl || 'https://assets.mixkit.co/videos/preview/mixkit-man-doing-pushups-in-gym-43026-large.mp4',
      status: 'pending',
      pointsAwarded: 0,
      createdAt: new Date().toISOString()
    };

    const submissions = this.getSubmissions();
    submissions.push(newSubmission);
    this.saveSubmissions(submissions);

    if (!isFirebaseMock && db) {
      try {
        setDoc(doc(db, 'submissions', newSubmission.id), newSubmission).catch(err => {
          handleFirestoreError(err, OperationType.WRITE, `submissions/${newSubmission.id}`);
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `submissions/${newSubmission.id}`);
      }
    }

    // Сразу инициируем фоновое верификационное задание
    this.initiateVerificationJob(newSubmission);

    return newSubmission;
  }

  // Создает запись джобы на верификацию
  static initiateVerificationJob(sub: Submission) {
    const newJob: VerificationJob = {
      id: 'job_' + Math.random().toString(36).substr(2, 9),
      submissionId: sub.id,
      videoUrl: sub.videoUrl,
      status: 'pending',
      mlConfidence: 0,
      createdAt: new Date().toISOString(),
      userId: sub.userId
    } as any;

    const jobs = this.getJobs();
    jobs.push(newJob);
    this.saveJobs(jobs);

    if (!isFirebaseMock && db) {
      try {
        setDoc(doc(db, 'verification_jobs', newJob.id), newJob).catch(err => {
          handleFirestoreError(err, OperationType.WRITE, `verification_jobs/${newJob.id}`);
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `verification_jobs/${newJob.id}`);
      }
    }

    this.verifySubmission(sub.id, newJob.id);
  }

  /**
   * ПЛЕЙСХОЛДЕР ДЛЯ ВНЕШНЕГО ML API ВЕРИФИКАЦИИ ВИДЕО (verifySubmission)
   * Симулирует запуск сверточной нейросети (YOLO/PoseNet) по детекции повторений.
   */
  static verifySubmission(subId: string, jobId: string) {
    console.log(`[ML Pipeline] Начат анализ видео для клипа на submission ${subId} через джобу ${jobId}...`);
    
    setTimeout(() => {
      const jobs = this.getJobs();
      const jobIdx = jobs.findIndex(j => j.id === jobId);
      if (jobIdx >= 0) {
        jobs[jobIdx].status = 'processing';
        this.saveJobs(jobs);
      }
    }, 1500);

    setTimeout(() => {
      const submissions = this.getSubmissions();
      const subIdx = submissions.findIndex(s => s.id === subId);
      if (subIdx === -1) return;

      const sub = submissions[subIdx];
      const jobs = this.getJobs();
      const jobIdx = jobs.findIndex(j => j.id === jobId);

      let confidence = Math.floor(Math.random() * 31) + 70; // 70% - 100%
      let finalStatus: SubmissionStatus = 'approved';
      let feedback = 'Анализ PoseNet: Скелетная модель подтвердила полное разгибание суставов. Повторения засчитаны.';

      const descLower = sub.description.toLowerCase();
      if (descLower.includes('абуз') || descLower.includes('чит') || sub.countOrDistance > 1000) {
        confidence = Math.floor(Math.random() * 30) + 20; // 20% - 50%
        finalStatus = 'rejected';
        feedback = 'Нейросеть отклонила видео: обнаружен слишком высокий темп или нарушение плоскости движения.';
      } else if (descLower.includes('тест') || descLower.includes('плохо') || sub.countOrDistance <= 2) {
        confidence = 62;
        finalStatus = 'suspicious';
        feedback = 'Внимание: Низкое разрешение видео или плохая освещенность. Требуется ручная сверка ассистентом.';
      }

      let calculatedPoints = 0;
      if (finalStatus === 'approved') {
        const opt = WORKOUT_OPTS.find(o => o.value === sub.workoutType);
        const perUnit = opt ? opt.pointsPerUnit : 1;
        calculatedPoints = sub.countOrDistance * perUnit;
      }

      submissions[subIdx].status = finalStatus;
      submissions[subIdx].pointsAwarded = calculatedPoints;
      this.saveSubmissions(submissions);

      if (!isFirebaseMock && db) {
        try {
          updateDoc(doc(db, 'submissions', subId), {
            status: finalStatus,
            pointsAwarded: calculatedPoints
          }).catch(err => {
            handleFirestoreError(err, OperationType.UPDATE, `submissions/${subId}`);
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.UPDATE, `submissions/${subId}`);
        }
      }

      if (jobIdx >= 0) {
        jobs[jobIdx].status = 'completed';
        jobs[jobIdx].mlConfidence = confidence;
        jobs[jobIdx].feedback = feedback;
        this.saveJobs(jobs);
      }

      if (calculatedPoints > 0) {
        const users = this.getUsers();
        const userIdx = users.findIndex(u => u.uid === sub.userId);
        if (userIdx >= 0) {
          const newPoints = users[userIdx].points + calculatedPoints;
          users[userIdx].points = newPoints;
          users[userIdx].currentRank = getRankByPoints(newPoints).title;
          this.saveUsers(users);

          if (!isFirebaseMock && db) {
            try {
              updateDoc(doc(db, 'users', sub.userId), {
                points: newPoints,
                currentRank: getRankByPoints(newPoints).title
              }).catch(err => {
                handleFirestoreError(err, OperationType.UPDATE, `users/${sub.userId}`);
              });
            } catch (err) {
              handleFirestoreError(err, OperationType.UPDATE, `users/${sub.userId}`);
            }
          }
        }
      }

      window.dispatchEvent(new Event('fit_db_updated'));
      console.log(`[ML Pipeline] Анализ клипа ${subId} завершен. Статус: ${finalStatus}, Очки: ${calculatedPoints}`);

    }, 4500);
  }
}
