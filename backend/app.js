require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Define Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/game', require('./routes/game'));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Catch-all for HTML5 History Mode
app.get(/^(?!\/api).*$/, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('MongoDB connected...'))
.catch(err => console.error(err));

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
