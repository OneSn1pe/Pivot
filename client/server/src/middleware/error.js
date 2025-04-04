// Error handling middleware
const errorMiddleware = (err, req, res, next) => {
    console.error('Error:', err.message);
    
    // Default error status and message
    let statusCode = 500;
    let message = 'Server Error';
  
    // Handle specific error types
    if (err.name === 'ValidationError') {
      // Mongoose validation error
      statusCode = 400;
      message = Object.values(err.errors)
        .map(error => error.message)
        .join(', ');
    } else if (err.name === 'CastError') {
      // Invalid ID
      statusCode = 400;
      message = 'Resource not found';
    } else if (err.code === 11000) {
      // Duplicate key error (e.g., duplicate email)
      statusCode = 400;
      message = 'Duplicate field value entered';
    } else if (err.name === 'JsonWebTokenError') {
      // JWT error
      statusCode = 401;
      message = 'Invalid token';
    } else if (err.name === 'TokenExpiredError') {
      // JWT expired
      statusCode = 401;
      message = 'Token expired';
    }
  
    // Send error response
    res.status(statusCode).json({
      success: false,
      error: message,
      stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
    });
  };
  
  module.exports = errorMiddleware;