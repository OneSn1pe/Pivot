const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Candidate = require('../models/Candidate');
const Recruiter = require('../models/Recruiter');

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// Register a new user
exports.register = async (req, res) => {
  try {
    const { email, password, name, role, company, position } = req.body;
    
    console.log(`Registration attempt: ${email} as ${role}`);

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log(`Registration failed: Email ${email} already exists as ${existingUser.role}`);
      return res.status(400).json({ 
        message: 'User already exists', 
        details: `This email is already registered as a ${existingUser.role}`
      });
    }

    let user;

    // Create user based on role
    if (role === 'candidate') {
      user = await Candidate.create({
        email,
        password,
        name,
        role,
      });
      console.log(`Created candidate: ${email}`);
    } else if (role === 'recruiter') {
      // Validate recruiter-specific fields
      if (!company || !position) {
        console.log('Registration failed: Missing company or position for recruiter');
        return res.status(400).json({ message: 'Company and position are required for recruiters' });
      }

      user = await Recruiter.create({
        email,
        password,
        name,
        role,
        company,
        position,
      });
      console.log(`Created recruiter: ${email}, Company: ${company}`);
    } else {
      console.log(`Registration failed: Invalid role ${role}`);
      return res.status(400).json({ message: 'Invalid role' });
    }

    // Generate token
    const token = generateToken(user._id);

    // Return user data and token
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Update last active timestamp
    user.lastActive = Date.now();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    // Return user data and token
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get current user profile
exports.getCurrentUser = async (req, res) => {
  try {
    // User is attached to req by auth middleware
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Logout user (for future token blacklisting)
exports.logout = async (req, res) => {
  // In a more advanced implementation, you might want to blacklist the token
  res.status(200).json({ message: 'Logged out successfully' });
};