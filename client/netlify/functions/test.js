/**
 * Test API function for Netlify
 * 
 * Simple endpoint to test if the API is working correctly
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
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: "PivotAI API is working correctly!",
        environment: "Netlify Functions",
        timestamp: new Date().toISOString(),
        version: "1.0.0"
      })
    };
  } catch (error) {
    console.error("API test error:", error);
    
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
