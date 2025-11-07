require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const CLIENT_URL = "https://jungtongbam.vercel.app";

// Socket.IO server setup for production
const io = new Server(server, {
  cors: {
    origin: CLIENT_URL,
    methods: ["GET", "POST"]
  },
  transports: ['websocket', 'polling']
});

const PORT = process.env.PORT || 3000;

// Global game state
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

// Middleware to parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Pass io and gameState to all API routes
app.use((req, res, next) => {
  req.io = io;
  req.gameState = gameState;
  next();
});

// Define Routes with granular CORS
const corsMiddleware = cors({ origin: CLIENT_URL });
app.use('/api/auth', corsMiddleware, require('./routes/auth'));
app.use('/api/game', corsMiddleware, require('./routes/game'));
app.use('/api/admin', corsMiddleware, require('./routes/admin'));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Catch-all for HTML5 History Mode
app.get(/^(?!\/api).*$/, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Socket.io connection
io.on('connection', (socket) => {
  console.log('A user connected');
  // Send the current game state to the newly connected client
  socket.emit('gameStateUpdate', gameState);

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('MongoDB connected...'))
.catch(err => console.error(err));

// Start the server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
