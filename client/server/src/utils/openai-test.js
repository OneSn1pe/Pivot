const { OpenAI } = require('openai');
const dotenv = require('dotenv');

dotenv.config();

const API_KEY = process.env.OPENAI_API_KEY;

// Check if API key is provided
if (!API_KEY || API_KEY.trim() === '') {
  console.error('OpenAI API key is missing or empty. Please check your .env file.');
  process.exit(1);
}

// Log API key format info without exposing the full key
console.log(`OpenAI API key starts with: ${API_KEY.substring(0, 5)}...`);
console.log(`Key length: ${API_KEY.length} characters`);

// Check for placeholder key
if (API_KEY.includes('xxxxxxx')) {
  console.error('ERROR: You are using a placeholder API key. Please replace it with a valid OpenAI API key in your .env file.');
  console.log('You can get an API key from: https://platform.openai.com/api-keys');
  process.exit(1);
}

// Initialize OpenAI API
const openai = new OpenAI({
  apiKey: API_KEY,
});

async function testOpenAIConnection() {
  try {
    console.log('Testing OpenAI API connection...');
    
    // Make a simple API call to validate the key
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // Using 3.5 turbo for a cheaper test
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: "Say 'OpenAI connection successful!' as your entire response." }
      ],
      max_tokens: 20
    });
    
    console.log('OpenAI API Response:', response.choices[0].message.content);
    console.log('✅ OpenAI API connection successful!');
    
  } catch (error) {
    console.error('❌ OpenAI API connection failed:', error.message);
    
    if (error.response) {
      console.error('Error details:', {
        status: error.response.status,
        statusText: error.response.statusText,
        headers: error.response.headers,
        data: error.response.data
      });
      
      // Authentication error handling
      if (error.response.status === 401) {
        console.error('\nThis is an authentication error. Your API key is invalid or revoked.');
        console.log('\nPlease check the following:');
        console.log('1. Your API key is entered correctly in the .env file');
        console.log('2. Your API key is active (not expired or revoked)');
        console.log('3. You have billing set up in your OpenAI account');
        console.log('\nYou can get a new API key from: https://platform.openai.com/api-keys');
      }
    }
    
    process.exit(1);
  }
}

testOpenAIConnection(); 