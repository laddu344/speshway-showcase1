// index.js
const serverless = require('serverless-http');
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// ---------------- Body parser ----------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ---------------- CORS ----------------
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','OPTIONS','PATCH'],
  allowedHeaders: ['Content-Type','Authorization','X-Requested-With'],
  exposedHeaders: ['Content-Range','X-Content-Range']
}));

// ---------------- Serve uploads ----------------
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ---------------- API Routes ----------------
app.use('/api/auth', require('./routes/auth'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/services', require('./routes/services'));
app.use('/api/portfolios', require('./routes/portfolios'));
app.use('/api/team', require('./routes/team'));
app.use('/api/gallery', require('./routes/gallery'));
app.use('/api/clients', require('./routes/clients'));
app.use('/api/sentences', require('./routes/sentences'));

// ---------------- Health check ----------------
app.get('/', (req, res) => {
  res.json({ 
    message: 'API running',
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    message: 'Backend API is healthy',
    timestamp: new Date().toISOString(),
    database: 'connected'
  });
});

// ---------------- Serve frontend SPA ----------------
const frontendPath = path.join(__dirname, 'frontend', 'dist');
app.use(express.static(frontendPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// ---------------- Error handling ----------------
app.use((error, req, res, next) => {
  console.error('Error:', error);
  if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ success: false, message: 'File too large (max 5MB)' });
  }

  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: error.message
  });
});

// ---------------- Export handler for Serverless ----------------
module.exports.handler = serverless(app);
