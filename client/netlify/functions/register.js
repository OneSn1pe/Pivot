/**
 * User registration function for Netlify
 * 
 * This is a starting point that you'll need to customize with your MongoDB connection
 * and registration logic from your server code.
 */

exports.handler = async (event, context) => {
  // Set up CORS headers for all responses
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Content-Type": "application/json"
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: ""
    };
  }

  try {
    // Parse the incoming request body
    const data = JSON.parse(event.body || "{}");
    const { email, password, name, role, company, position } = data;

    // Basic validation
    if (!email || !password || !name || !role) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          message: "Missing required fields (email, password, name, role)"
        })
      };
    }

    // Additional validation for recruiters
    if (role === 'recruiter' && (!company || !position)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          message: "Company and position are required for recruiters"
        })
      };
    }

    // Placeholder for registration logic
    // In a real implementation, you'd:
    // 1. Connect to MongoDB
    // 2. Check if user already exists
    // 3. Hash the password
    // 4. Create user in the database
    // 5. Generate a JWT token
    
    // This is a mock response to ensure the function works
    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({
        message: "Registration successful",
        token: "mock-jwt-token-for-testing-replace-with-real-jwt",
        user: {
          id: "mock-user-id-" + Date.now(),
          email,
          name,
          role
        }
      })
    };
  } catch (error) {
    console.error("Registration error:", error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        message: "Server error",
        error: error.message
      })
    };
  }
};
