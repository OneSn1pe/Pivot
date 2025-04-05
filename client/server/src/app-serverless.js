const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");
const { connectToDatabase } = require("./serverless-mongoose");

// Import middleware
const errorMiddleware = require("./middleware/error");

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Configure CORS
app.use(cors());

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware to connect to DB before processing requests
app.use(async (req, res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (error) {
    console.error("Database connection error:", error);
    return res.status(500).json({ message: "Database connection failed" });
  }
});

// Register models (make sure they are loaded)
const loadModels = () => {
  try {
    const modelsDir = path.join(__dirname, "models");
    // User model first
    require("./models/User");
    
    // Then other models in order
    ["Candidate.js", "Recruiter.js", "Resume.js", "Roadmap.js", "JobPreference.js"].forEach(model => {
      if (fs.existsSync(path.join(modelsDir, model))) {
        require(`./models/${model}`);
      }
    });
  } catch (error) {
    console.error("Model loading error:", error);
  }
};

// Load models
loadModels();

// Import routes
const authRoutes = require("./routes/authRoute");
const candidateRoutes = require("./routes/candidates");
const recruiterRoutes = require("./routes/recruiters");
const roadmapRoutes = require("./routes/roadmaps");

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/candidates", candidateRoutes);
app.use("/api/recruiters", recruiterRoutes);
app.use("/api/roadmaps", roadmapRoutes);

// Test route for connectivity check
app.get("/api/test", (req, res) => {
  res.status(200).json({ message: "Server is working correctly!" });
});

// Root route - for vercel checking
app.get("/", (req, res) => {
  res.status(200).json({ message: "PivotAI API Server" });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Error handling middleware
app.use(errorMiddleware);

// For local development only, not used in Vercel
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export the Express app
module.exports = app;