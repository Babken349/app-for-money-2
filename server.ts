import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

const PORT = 3000;

async function startServer() {
  const app = express();
  app.use(express.json());

  // ==========================================
  // BACKEND ARCHITECTURE & ENDPOINTS (PLANNED)
  // ==========================================
  
  // 1. Users & Progress API
  // `GET /api/users/:uid` - Fetch profile, ranks, points
  // `POST /api/users/:uid/points` - Atomic update of points (+XP after video verification)

  // 2. Video API (Proofs for Achievements & Competitions)
  // `POST /api/submissions` - Upload video URL, trigger background AI verification
  // `GET /api/submissions?userId=:uid` - Fetch user's video feed
  
  // 3. AI Verification Backend Pipeline
  // - When a video is submitted, a job is generated and sent to an ML service (like PoseNet/MediaPipe via Python backend or cloud proxy).
  // - The ML service calculates repetitions, ensures form (e.g. barbell touched chest, full extension in squat).
  // - The result (confident approved/rejected) is updated in the database, and webhooks notify this Node.js server.
  
  // 4. Achievements & Leaderboards
  // `GET /api/leaderboard` - Real-time leaderboard aggregation
  // `GET /api/achievements` - Check criteria for new dynamic achievements (e.g. 100kg bench press)

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', msg: 'Backend architecture scaffolding is ready.' });
  });

  // ==========================================
  // VITE DEV MIDDLEWARE / STATIC PROD SERVING
  // ==========================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
