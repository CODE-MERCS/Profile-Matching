// app.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const pekerjaanRoutes = require('./routes/pekerjaanRoutes');
const kriteriaRoutes = require('./routes/kriteriaRoutes');

// Load environment variables
dotenv.config();

const app = express();

// Middleware untuk mengizinkan CORS dengan credentials (cookies)
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173", // Sesuaikan dengan URL frontend Anda
  credentials: true, // Izinkan cookies dikirim dalam request
  methods: "GET,POST,PUT,DELETE,PATCH",
  allowedHeaders: "Content-Type,Authorization"
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/auth', authRoutes);
app.use('/pekerjaan', pekerjaanRoutes);
app.use('/kriteria', kriteriaRoutes);

// Basic route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Profile Matching API Server is running!',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found' 
  });
});

// Export app untuk digunakan di index.js
module.exports = app;