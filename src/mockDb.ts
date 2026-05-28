import { WorkoutType, SubmissionStatus, Submission, UserProfile, VerificationJob, SubscriptionStatus, WorkoutDay, WorkoutEntry, WeightEntry, HabitDay, WorkoutSetInfo } from './types';
import { collection, onSnapshot, query, orderBy, setDoc, getDoc, getDocs, doc, updateDoc, where, deleteDoc } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from './firebase';

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
export const WORKOUT_OPTS: Array<{value: string, label: string, pointsPerUnit: number, icon: string}> = [
  { value: 'push-ups', label: 'Отжимания (раз)', pointsPerUnit: 2, icon: '🏋️‍♂️' },
  { value: 'squats', label: 'Приседания (раз)', pointsPerUnit: 1, icon: '🦵' },
  { value: 'running', label: 'Бег (км)', pointsPerUnit: 50, icon: '🏃‍♂️' },
  { value: 'bench_press', label: 'Жим лежа (кг)', pointsPerUnit: 10, icon: '💪' },
  { value: 'squats_kg', label: 'Приседания со штангой (кг)', pointsPerUnit: 10, icon: '🏋️' },
  { value: 'calisthenics', label: 'Калистеника (удержания/сек)', pointsPerUnit: 5, icon: '🔥' }
];

// Список статических ачивок
export const ACHIEVEMENTS = [
  { id: 'ach_1', title: 'Первый Шаг', description: 'Сдать 1 подтвержденную тренировку любого типа', points: 30, icon: '🥉' },
  { id: 'ach_2', title: 'Стальные Плечи', description: 'Сделать более 50 отжиманий за подход', points: 70, icon: '🥈' },
  { id: 'ach_3', title: 'Марафонец', description: 'Пробежать дистанцию более 10 км', points: 100, icon: '🥇' },
  { id: 'ach_4', title: 'Постоянство', description: 'Получить статус Elite подписки для максимального доступа', points: 150, icon: '💎' },
  
  // Running achievements
  { id: 'ach_run_1', title: 'Первый 3 км', description: 'Пробежать 3 километра за раз', points: 50, icon: '👟' },
  { id: 'ach_run_2', title: 'Пятёрка без остановки', description: 'Пробежать 5 км без остановки', points: 150, icon: '🏃‍♂️' },
  { id: 'ach_run_3', title: '10 км за раз', description: 'Пробежать дистанцию более 10 км', points: 300, icon: '⚡' },
  { id: 'ach_run_4', title: 'Полумарафон', description: 'Пробежать полумарафон (21 км)', points: 1000, icon: '🏅' },
  { id: 'ach_run_5', title: 'Марафонец', description: 'Пробежать марафон (42 км)', points: 2500, icon: '🏆' },
];

// Динамически сгенерируем достижения за жим лежа и приседания со штангой (~100 ачивок)
const generateAchievements = () => {
  let counter = 5;
  // Жим лежа: 40кг до 300кг с шагом 5-10кг
  const benchWeights = [];
  for (let w = 40; w <= 150; w += 5) benchWeights.push(w);
  for (let w = 160; w <= 300; w += 10) benchWeights.push(w);
  
  benchWeights.forEach(weight => {
    ACHIEVEMENTS.push({
      id: `ach_${counter++}`,
      title: `Жим лежа: Титан ${weight} кг`,
      description: `Выложить сертифицированное видео с жимом штанги весом ${weight} кг`,
      points: weight * 2,
      icon: '💪'
    });
  });

  // Приседания (Ноги): 50кг до 350кг
  const squatWeights = [];
  for (let w = 50; w <= 200; w += 5) squatWeights.push(w);
  for (let w = 210; w <= 350; w += 10) squatWeights.push(w);

  squatWeights.forEach(weight => {
    ACHIEVEMENTS.push({
      id: `ach_${counter++}`,
      title: `Присед: Скала ${weight} кг`,
      description: `Выложить сертифицированное видео с приседанием со штангой ${weight} кг`,
      points: weight * 2,
      icon: '🦵'
    });
  });
};
generateAchievements();

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
let activeWorkoutDays: WorkoutDay[] = [];
let activeWorkoutEntries: WorkoutEntry[] = [];
let activeWeightEntries: WeightEntry[] = [];
let activeHabitDays: HabitDay[] = [];

export class LocalDb {
  static unsubscribeUsers: any = null;
  static unsubscribeSubmissions: any = null;
  static unsubscribeWorkoutDays: any = null;
  static unsubscribeWorkoutEntries: any = null;
  static unsubscribeWeightEntries: any = null;
  static unsubscribeHabitDays: any = null;

  static initFirestoreSync() {
    if (!db) return;

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

    // 3. Listen to Workout Days of authorized user
    try {
      if (auth.currentUser) {
        const uid = auth.currentUser.uid;
        const qDays = query(collection(db, 'workout_days'), where('userId', '==', uid));
        this.unsubscribeWorkoutDays = onSnapshot(qDays, (snapshot) => {
          const list: WorkoutDay[] = [];
          snapshot.forEach((docRef) => list.push(docRef.data() as WorkoutDay));
          activeWorkoutDays = list;
          saveKey('fit_workout_days', list);
          window.dispatchEvent(new Event('fit_db_updated'));
        }, (error) => {
          console.warn("[Firebase Sync] workout_days listener error:", error.message);
        });
      }
    } catch (err) {
      console.error("[Firebase Sync] Failed to attach workout_days listener:", err);
    }

    // 4. Listen to Workout Entries of authorized user
    try {
      if (auth.currentUser) {
        const uid = auth.currentUser.uid;
        const qEntries = query(collection(db, 'workout_entries'), where('userId', '==', uid));
        this.unsubscribeWorkoutEntries = onSnapshot(qEntries, (snapshot) => {
          const list: WorkoutEntry[] = [];
          snapshot.forEach((docRef) => list.push(docRef.data() as WorkoutEntry));
          activeWorkoutEntries = list;
          saveKey('fit_workout_entries', list);
          window.dispatchEvent(new Event('fit_db_updated'));
        }, (error) => {
          console.warn("[Firebase Sync] workout_entries listener error:", error.message);
        });
      }
    } catch (err) {
      console.error("[Firebase Sync] Failed to attach workout_entries listener:", err);
    }

    // 5. Listen to Weight Entries of authorized user
    try {
      if (auth.currentUser) {
        const uid = auth.currentUser.uid;
        const qWeight = query(collection(db, 'weight_entries'), where('userId', '==', uid));
        this.unsubscribeWeightEntries = onSnapshot(qWeight, (snapshot) => {
          const list: WeightEntry[] = [];
          snapshot.forEach((docRef) => list.push(docRef.data() as WeightEntry));
          activeWeightEntries = list;
          saveKey('fit_weight_entries', list);
          window.dispatchEvent(new Event('fit_db_updated'));
        }, (error) => {
          console.warn("[Firebase Sync] weight_entries listener error:", error.message);
        });
      }
    } catch (err) {
      console.error("[Firebase Sync] Failed to attach weight_entries listener:", err);
    }

    // 6. Listen to Habit Days of authorized user
    try {
      if (auth.currentUser) {
        const uid = auth.currentUser.uid;
        const qHabits = query(collection(db, 'habit_days'), where('userId', '==', uid));
        this.unsubscribeHabitDays = onSnapshot(qHabits, (snapshot) => {
          const list: HabitDay[] = [];
          snapshot.forEach((docRef) => list.push(docRef.data() as HabitDay));
          activeHabitDays = list;
          saveKey('fit_habit_days', list);
          window.dispatchEvent(new Event('fit_db_updated'));
        }, (error) => {
          console.warn("[Firebase Sync] habit_days listener error:", error.message);
        });
      }
    } catch (err) {
      console.error("[Firebase Sync] Failed to attach habit_days listener:", err);
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
    if (this.unsubscribeWorkoutDays) {
      this.unsubscribeWorkoutDays();
      this.unsubscribeWorkoutDays = null;
    }
    if (this.unsubscribeWorkoutEntries) {
      this.unsubscribeWorkoutEntries();
      this.unsubscribeWorkoutEntries = null;
    }
    if (this.unsubscribeWeightEntries) {
      this.unsubscribeWeightEntries();
      this.unsubscribeWeightEntries = null;
    }
    if (this.unsubscribeHabitDays) {
      this.unsubscribeHabitDays();
      this.unsubscribeHabitDays = null;
    }
  }

  static getUsers(): UserProfile[] {
    if (activeUsers.length > 0) {
      return activeUsers;
    }
    return loadKey('fit_users', INITIAL_USERS);
  }

  static getSubmissions(): Submission[] {
    const list = (activeSubmissions.length > 0)
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

    if (db) {
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
      status: 'approved',
      pointsAwarded: Math.floor(countOrDistance * (workoutType === 'running' ? 20 : 2)),
      createdAt: new Date().toISOString()
    };

    const submissions = this.getSubmissions();
    submissions.push(newSubmission);
    this.saveSubmissions(submissions);

    if (user) {
      if (typeof user.points !== 'number') user.points = 0;
      user.points += newSubmission.pointsAwarded;
      this.saveUsers(users); // Update points inline
    }

    if (db) {
      try {
        setDoc(doc(db, 'submissions', newSubmission.id), newSubmission).catch(err => {
          handleFirestoreError(err, OperationType.WRITE, `submissions/${newSubmission.id}`);
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `submissions/${newSubmission.id}`);
      }
    }

    return newSubmission;
  }

  static toggleLike(submissionId: string, userId: string) {
    const submissions = this.getSubmissions();
    const subIndex = submissions.findIndex(s => s.id === submissionId);
    if (subIndex === -1) return;

    const sub = submissions[subIndex];
    if (!sub.likes) sub.likes = [];
    
    if (sub.likes.includes(userId)) {
      sub.likes = sub.likes.filter(id => id !== userId);
    } else {
      sub.likes.push(userId);
    }

    this.saveSubmissions(submissions);

    if (db) {
      try {
        setDoc(doc(db, 'submissions', sub.id), sub, { merge: true }).catch(err => {
          console.error("Failed to update likes in Firestore:", err);
        });
      } catch (err) {
        console.error("Failed to update likes in Firestore:", err);
      }
    }
  }

  static addComment(submissionId: string, comment: Comment) {
    const submissions = this.getSubmissions();
    const subIndex = submissions.findIndex(s => s.id === submissionId);
    if (subIndex === -1) return;

    const sub = submissions[subIndex];
    if (!sub.comments) sub.comments = [];
    
    sub.comments.push(comment);

    this.saveSubmissions(submissions);

    if (db) {
      try {
        setDoc(doc(db, 'submissions', sub.id), sub, { merge: true }).catch(err => {
          console.error("Failed to add comment in Firestore:", err);
        });
      } catch (err) {
        console.error("Failed to add comment in Firestore:", err);
      }
    }
  }

  // Удалить submission
  static deleteSubmission(subId: string) {
    activeSubmissions = activeSubmissions.filter(s => s.id !== subId);
    saveKey('fit_submissions', activeSubmissions);
    
    // Также очистим связанные джобы верстки AI
    activeJobs = loadKey<any[]>('fit_verification_jobs', []).filter(j => j.submissionId !== subId);
    saveKey('fit_verification_jobs', activeJobs);

    if (db) {
      try {
        deleteDoc(doc(db, 'submissions', subId)).catch(err => {
          handleFirestoreError(err, OperationType.DELETE, `submissions/${subId}`);
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `submissions/${subId}`);
      }
    }
    window.dispatchEvent(new Event('fit_db_updated'));
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

    if (db) {
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

      if (db) {
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

          if (db) {
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

  // ==========================================================================
  // 8. WORKOUT DAYS AND ENTRIES
  // ==========================================================================
  static getWorkoutDays(): WorkoutDay[] {
    const list = (activeWorkoutDays.length > 0)
      ? activeWorkoutDays
      : loadKey<WorkoutDay[]>('fit_workout_days', []);
    return list.slice().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  static addWorkoutDay(userId: string, date: string, title: string): WorkoutDay {
    const newDay: WorkoutDay = {
      id: 'day_' + Math.random().toString(36).substr(2, 9),
      userId,
      date,
      title,
      createdAt: new Date().toISOString()
    };
    
    activeWorkoutDays.push(newDay);
    saveKey('fit_workout_days', activeWorkoutDays);
    
    if (db) {
      setDoc(doc(db, 'workout_days', newDay.id), newDay).catch(err => {
        handleFirestoreError(err, OperationType.WRITE, `workout_days/${newDay.id}`);
      });
    }
    window.dispatchEvent(new Event('fit_db_updated'));
    return newDay;
  }

  static deleteWorkoutDay(dayId: string) {
    activeWorkoutDays = activeWorkoutDays.filter(d => d.id !== dayId);
    saveKey('fit_workout_days', activeWorkoutDays);
    
    activeWorkoutEntries = activeWorkoutEntries.filter(e => e.dayId !== dayId);
    saveKey('fit_workout_entries', activeWorkoutEntries);
    
    if (db) {
      deleteDoc(doc(db, 'workout_days', dayId)).catch(err => {
        handleFirestoreError(err, OperationType.DELETE, `workout_days/${dayId}`);
      });
    }
    window.dispatchEvent(new Event('fit_db_updated'));
  }

  static getWorkoutEntries(): WorkoutEntry[] {
    return (activeWorkoutEntries.length > 0)
      ? activeWorkoutEntries
      : loadKey<WorkoutEntry[]>('fit_workout_entries', []);
  }

  static addWorkoutEntry(
    userId: string, 
    dayId: string, 
    exerciseName: string, 
    workoutType: WorkoutType | 'other',
    sets: number, 
    repsPerSet?: number, 
    weight?: number, 
    comment?: string,
    setsDetails?: WorkoutSetInfo[]
  ): WorkoutEntry {
    const newEntry: WorkoutEntry = {
      id: 'entry_' + Math.random().toString(36).substr(2, 9),
      userId,
      dayId,
      exerciseName,
      workoutType,
      sets,
      repsPerSet,
      weight,
      comment,
      setsDetails,
      createdAt: new Date().toISOString()
    };
    
    activeWorkoutEntries.push(newEntry);
    saveKey('fit_workout_entries', activeWorkoutEntries);
    
    // Add points & check achievements
    const users = this.getUsers();
    const user = users.find(u => u.uid === userId);
    if (user) {
      // Calculate points
      const opt = WORKOUT_OPTS.find(o => o.value === workoutType);
      const pointsToAward = opt ? (opt.pointsPerUnit * (weight || 1)) : 10;
      user.points += pointsToAward;
      
      // Update achievements
      const { checkAchievements } = require('./achievements');
      const { updatedAchievementsList } = checkAchievements(activeWorkoutEntries.filter(e => e.userId === userId), user.earnedAchievements || []);
      user.earnedAchievements = updatedAchievementsList;
      
      this.saveUsers(users);
    }

    if (db) {
      setDoc(doc(db, 'workout_entries', newEntry.id), newEntry).catch(err => {
        handleFirestoreError(err, OperationType.WRITE, `workout_entries/${newEntry.id}`);
      });
      if(user) {
        updateDoc(doc(db, 'users', userId), { points: user.points, earnedAchievements: user.earnedAchievements }).catch(console.error);
      }
    }
    window.dispatchEvent(new Event('fit_db_updated'));
    return newEntry;
  }

  static deleteWorkoutEntry(entryId: string) {
    activeWorkoutEntries = activeWorkoutEntries.filter(e => e.id !== entryId);
    saveKey('fit_workout_entries', activeWorkoutEntries);
    if (db) {
      deleteDoc(doc(db, 'workout_entries', entryId)).catch(err => {
        handleFirestoreError(err, OperationType.DELETE, `workout_entries/${entryId}`);
      });
    }
    window.dispatchEvent(new Event('fit_db_updated'));
  }

  // ==========================================================================
  // 9. WEIGHT ENTRIES
  // ==========================================================================
  static getWeightEntries(): WeightEntry[] {
    const list = (activeWeightEntries.length > 0)
      ? activeWeightEntries
      : loadKey<WeightEntry[]>('fit_weight_entries', []);
    return list.slice().sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  static addWeightEntry(userId: string, date: string, weight: number): WeightEntry {
    const existingIdx = activeWeightEntries.findIndex(e => e.userId === userId && e.date === date);
    const id = existingIdx >= 0 ? activeWeightEntries[existingIdx].id : 'weight_' + Math.random().toString(36).substr(2, 9);
    
    const newEntry: WeightEntry = {
      id,
      userId,
      date,
      weight,
      createdAt: new Date().toISOString()
    };
    
    if (existingIdx >= 0) {
      activeWeightEntries[existingIdx] = newEntry;
    } else {
      activeWeightEntries.push(newEntry);
    }
    saveKey('fit_weight_entries', activeWeightEntries);
    
    if (db) {
      setDoc(doc(db, 'weight_entries', newEntry.id), newEntry).catch(err => {
        handleFirestoreError(err, OperationType.WRITE, `weight_entries/${newEntry.id}`);
      });
    }
    window.dispatchEvent(new Event('fit_db_updated'));
    return newEntry;
  }

  static deleteWeightEntry(entryId: string) {
    activeWeightEntries = activeWeightEntries.filter(e => e.id !== entryId);
    saveKey('fit_weight_entries', activeWeightEntries);
    if (db) {
      deleteDoc(doc(db, 'weight_entries', entryId)).catch(err => {
        handleFirestoreError(err, OperationType.DELETE, `weight_entries/${entryId}`);
      });
    }
    window.dispatchEvent(new Event('fit_db_updated'));
  }

  // ==========================================================================
  // 10. HABIT DAYS
  // ==========================================================================
  static getHabitDays(): HabitDay[] {
    return (activeHabitDays.length > 0)
      ? activeHabitDays
      : loadKey<HabitDay[]>('fit_habit_days', []);
  }

  static toggleHabitDay(userId: string, date: string, habitType: string, status: 'clean' | 'failed'): HabitDay | null {
    const existing = activeHabitDays.find(h => h.userId === userId && h.date === date && h.habitType === habitType);
    
    if (existing) {
      if (existing.status === status) {
        activeHabitDays = activeHabitDays.filter(h => h.id !== existing.id);
        saveKey('fit_habit_days', activeHabitDays);
        if (db) {
          deleteDoc(doc(db, 'habit_days', existing.id)).catch(err => {
            handleFirestoreError(err, OperationType.DELETE, `habit_days/${existing.id}`);
          });
        }
        window.dispatchEvent(new Event('fit_db_updated'));
        return null;
      } else {
        existing.status = status;
        saveKey('fit_habit_days', activeHabitDays);
        if (db) {
          setDoc(doc(db, 'habit_days', existing.id), existing).catch(err => {
            handleFirestoreError(err, OperationType.WRITE, `habit_days/${existing.id}`);
          });
        }
        window.dispatchEvent(new Event('fit_db_updated'));
        return existing;
      }
    } else {
      const newHabit: HabitDay = {
        id: 'habit_' + Math.random().toString(36).substr(2, 9),
        userId,
        date,
        habitType,
        status
      };
      activeHabitDays.push(newHabit);
      saveKey('fit_habit_days', activeHabitDays);
      if (db) {
        setDoc(doc(db, 'habit_days', newHabit.id), newHabit).catch(err => {
          handleFirestoreError(err, OperationType.WRITE, `habit_days/${newHabit.id}`);
        });
      }
      window.dispatchEvent(new Event('fit_db_updated'));
      return newHabit;
    }
  }
}
