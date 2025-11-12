require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const GameScore = require('./models/GameScore');
const User = require('./models/User');

const app = express();
const server = http.createServer(app);
const ALLOWED_ORIGINS = [
  "https://jungtongbam.vercel.app",
  "https://jungtongbam-jaehoyas-projects.vercel.app",
  "http://localhost:5173",
  "https://jungtongbam.onrender.com"
];

const io = new Server(server, {
  cors: {
    origin: ALLOWED_ORIGINS,
    methods: ["GET", "POST"]
  },
  transports: ['websocket', 'polling']
});

// 웹소켓 인증 미들웨어 (디버깅 로그 추가)
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  // console.log('Socket Auth: New connection attempt.');
  // console.log('Socket Handshake:', JSON.stringify(socket.handshake, null, 2));

  if (!token) {
    // console.error('Socket Auth Error: No token provided.');
    return next(new Error('Authentication error'));
  }

  try {
    // console.log('Socket Auth: Verifying token...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded.user;
    // console.log(`Socket Auth: Success! User ${socket.user.id} authenticated.`);
    next();
  } catch (err) {
    // JWT 에러의 상세 내용을 로그로 출력
    // console.error('Socket Auth Error: Token verification failed.', {
    //   errorName: err.name,
    //   errorMessage: err.message,
    // });
    const authError = new Error('Authentication error');
    authError.data = { details: err.message };
    return next(authError);
  }
});

const PORT = process.env.PORT || 3000;

let gameState = {
  timingGame: {
    currentRound: 1,
    isVisible: false,
  },
  fastHandGame: {
    currentRound: 1,
    isVisible: false,
  },
};

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  req.io = io;
  req.gameState = gameState;
  next();
});

const corsMiddleware = cors({ origin: ALLOWED_ORIGINS });
app.use('/api/auth', corsMiddleware, require('./routes/auth'));
app.use('/api/game', corsMiddleware, require('./routes/game'));
app.use('/api/admin', corsMiddleware, require('./routes/admin'));

app.use(express.static(path.join(__dirname, 'public')));

app.get(/^(?!\/api).*$/, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

io.on('connection', (socket) => {
  // console.log('A user connected:', socket.user.id, 'isAdmin:', socket.user.isAdmin);
  socket.emit('gameStateUpdate', gameState);

  socket.on('submitScore', async ({ gameType, round, score }) => {
    try {
      const userId = socket.user.id;
      const existingScore = await GameScore.findOne({ user: userId, gameType, round });
      if (existingScore) {
        console.log(`User ${userId} already submitted score for ${gameType} round ${round}`);
        return;
      }
      const newScore = new GameScore({ user: userId, gameType, round, score });
      await newScore.save();
      console.log(`Score saved for user ${userId}`);
    } catch (err) {
      console.error('Socket submitScore error:', err);
      socket.emit('scoreSubmissionError', { message: '점수 제출 중 오류가 발생했습니다.' });
    }
  });

  // 1. 관리자용 이벤트 핸들러 추가
  socket.on('admin:updateState', (data) => {
    // 2. 관리자 권한 확인
    if (!socket.user.isAdmin) {
      console.log(`Non-admin user ${socket.user.id} attempted to update state.`);
      return;
    }

    const { action, payload } = data;
    console.log(`Admin action: ${action}`, payload);

    // 3. 요청에 따라 gameState 업데이트
    switch (action) {
      case 'SET_VISIBILITY':
        if (gameState[payload.gameType]) {
          gameState[payload.gameType].isVisible = payload.isVisible;
        }
        break;
      case 'SET_ROUND':
        if (gameState[payload.gameType] && [1, 2, 3].includes(payload.round)) {
          gameState[payload.gameType].currentRound = payload.round;
        }
        break;
      default:
        console.log(`Unknown admin action: ${action}`);
        return;
    }

    // 4. 변경된 gameState를 모든 클라이언트에게 전파
    io.emit('gameStateUpdate', gameState);
  });

  socket.on('disconnect', () => {
    // console.log('User disconnected:', socket.user.id);
  });
});

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('MongoDB connected...'))
.catch(err => console.error(err));

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});