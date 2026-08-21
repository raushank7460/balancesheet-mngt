const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const accountRoutes = require('./routes/accountRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const incomeRoutes = require('./routes/incomeRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const reportRoutes = require('./routes/reportRoutes');
const userRoutes = require('./routes/userRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

dotenv.config();

const app = express();

// ── Serverless-safe DB connection (cached so Vercel doesn't reconnect every request) ──
let isConnected = false;
const connectDB = async () => {
  if (isConnected && mongoose.connection.readyState === 1) return;
  try {
    await mongoose.connect(process.env.MONGO_URI);
    isConnected = true;
    console.log('MongoDB Connected');
    // Seed on first connection
    const { seedInitialData } = require('./utils/seedData');
    await seedInitialData();
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
  }
};

// Body Parser & CORS
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman, server-to-server)
    if (!origin) return callback(null, true);
    
    // Check configured CLIENT_URL (supports comma-separated origins)
    if (process.env.CLIENT_URL) {
      const configured = process.env.CLIENT_URL.split(',').map(url => url.trim().replace(/\/$/, ''));
      if (configured.includes(origin)) {
        return callback(null, true);
      }
    }
    
    // Allow local development and any vercel preview / production domain
    if (
      allowedOrigins.includes(origin) ||
      origin.startsWith('http://localhost:') ||
      origin.startsWith('http://127.0.0.1:') ||
      origin.endsWith('.vercel.app')
    ) {
      return callback(null, true);
    }

    // Default fallback: allow origin
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Root Route & API Health Check for Render
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'EquiBalance Backend API is running on Render',
    healthCheck: '/api/health',
    timestamp: new Date(),
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'EquiBalance API is operational',
    timestamp: new Date(),
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

// Middleware: ensure DB is connected before any request
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/income', incomeRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);

// Error Handler Middleware
app.use(errorHandler);

module.exports = app;
module.exports.connectDB = connectDB;

