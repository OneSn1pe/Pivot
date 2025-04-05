const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Import routes
const authRoutes = require('./routes/authRoute');
const candidateRoutes = require('./routes/candidates');
const recruiterRoutes = require('./routes/recruiters');
const roadmapRoutes = require('./routes/roadmaps');

// Import middleware
const errorMiddleware = require('./middleware/error');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Connect to MongoDB
console.log('Attempting to connect to MongoDB...');
console.log(`Connection string: ${process.env.MONGODB_URI.replace(/mongodb\+srv:\/\/([^:]+):[^@]+@/, 'mongodb+srv://$1:****@')}`);

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Connected to MongoDB successfully'))
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    console.error('Please check your MongoDB connection string and credentials.');
    console.error('For local development, you can use: mongodb://localhost:27017/pivotai');
  });

// Simplified CORS for testing
app.use(cors({
  origin: '*',  // Allow all origins for testing
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/recruiters', recruiterRoutes);
app.use('/api/roadmaps', roadmapRoutes);

// Test route for connectivity check
app.get('/api/test', (req, res) => {
  res.status(200).json({ message: 'Server is working correctly!' });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Error handling middleware
app.use(errorMiddleware);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;