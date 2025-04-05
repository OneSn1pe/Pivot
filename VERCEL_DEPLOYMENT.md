# Deploying PivotAI to Vercel

## The Warning About "builds"

When deploying to Vercel, you may see this warning:



This is **normal** and not an error. It means your vercel.json configuration takes precedence over the Vercel dashboard settings.

## Deployment Instructions

### 1. Deploy the Backend (Server)

1. Navigate to your server directory:
   

2. Run the Vercel deployment command:
   

3. Follow the prompts and select appropriate options:
   - Set up and deploy
   - When asked which scope to use, select your preferred account
   - Link to existing project or create a new one
   - Confirm the deployment

4. **Important**: After deployment, go to the Vercel dashboard and add these environment variables:
   - MONGODB_URI: Your MongoDB connection string
   - JWT_SECRET: Your JWT secret key
   - OPENAI_API_KEY: Your OpenAI API key

5. Note the deployed URL for your backend (e.g., https://pivotai-server.vercel.app)

### 2. Deploy the Frontend (Client)

1. Update the .env.production file with your backend URL:
   

2. Navigate to your client directory:
   

3. Run the Vercel deployment command:
   

4. Follow the prompts similar to the backend deployment.

5. After deployment, your app will be available at the Vercel URL.

## Troubleshooting

1. **If you encounter errors during deployment:**
   - Check the Vercel deployment logs in the dashboard
   - Verify all environment variables are set correctly
   - Make sure your MongoDB Atlas allows connections from any IP (or from Vercel's IP range)

2. **If your API requests fail:**
   - Check that the VITE_API_URL in your frontend points to the correct backend URL
   - Verify that your backend is properly processing API requests
   - Check CORS settings if you're seeing CORS errors

3. **For file upload issues:**
   - Remember that Vercel has a read-only filesystem
   - Consider using an external storage solution like AWS S3
