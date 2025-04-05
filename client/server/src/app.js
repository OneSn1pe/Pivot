const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

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
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB successfully'))
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    console.error('Please check your MongoDB connection string and credentials.');
    console.error('For local development, you can use: mongodb://localhost:27017/pivotai');
  });

// Explicitly register all models in the correct order to avoid circular dependencies
const modelsDir = path.join(__dirname, 'models');
const modelFiles = fs.readdirSync(modelsDir);

// First, require base models
console.log('Registering base models...');
// User should be loaded first as it's the parent model
if (modelFiles.includes('User.js')) {
  require('./models/User');
  console.log('- Registered User model');
}

// Then load the rest of the models in a specific order
const modelOrder = [
  'Candidate.js',
  'Recruiter.js',
  'Resume.js',
  'Roadmap.js', 
  'JobPreference.js'
];

// Register models in the specified order
console.log('Registering models in order...');
modelOrder.forEach(modelFile => {
  if (modelFiles.includes(modelFile)) {
    require(`./models/${modelFile}`);
    console.log(`- Registered ${modelFile} model`);
  }
});

// Register any remaining models
console.log('Registering remaining models...');
modelFiles.forEach(file => {
  if (file.endsWith('.js') && 
      file !== 'User.js' && 
      !modelOrder.includes(file)) {
    require(path.join(modelsDir, file));
    console.log(`- Registered ${file} model`);
  }
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

// Import routes after models are registered
const authRoutes = require('./routes/authRoute');
const candidateRoutes = require('./routes/candidates');
const recruiterRoutes = require('./routes/recruiters');
const roadmapRoutes = require('./routes/roadmaps');

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
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please use a different port or stop the process using this port.`);
    process.exit(1);
  } else {
    console.error('Server error:', err);
  }
});

module.exports = app;