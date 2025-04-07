# PivotAI

## AI-Powered Career Roadmaps for Software Engineers

PivotAI is a platform that uses AI to create personalized career roadmaps for software engineers and CS professionals, tailored to their specific target companies and positions. It also allows recruiters to discover and nurture promising talent who are specifically interested in their companies.

## Features

### For Candidates:
- Create a profile linked with GitHub, LinkedIn, or Google accounts
- Upload and analyze your resume with GPT-4o
- Identify target companies and positions
- Receive personalized roadmaps with timelines and milestones
- Track progress and update milestones as you go

### For Recruiters:
- Create a company profile
- Access candidates who have listed your company as a target
- Define job positions and requirements
- Bookmark and monitor candidate progress

## Tech Stack

- **Frontend**: React, React Router, Tailwind CSS
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **AI**: OpenAI GPT-4o for resume analysis and roadmap generation
- **Authentication**: JWT-based auth
- **File Storage**: Local storage (could be extended to S3 or similar)

## Getting Started

### Prerequisites

- Node.js 16+
- MongoDB
- Docker and Docker Compose (optional, for containerized setup)
- OpenAI API key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/pivotai.git
   cd pivotai
   ```

2. Set up the environment variables:
   ```bash
   cp server/.env.example server/.env
   ```
   Edit the `.env` file and fill in the required values, especially the `OPENAI_API_KEY`.

3. Install dependencies:
   ```bash
   # Install server dependencies
   cd server
   npm install

   # Install client dependencies
   cd ../client
   npm install
   ```

4. Start the development servers:
   ```bash
   # Start the backend server
   cd ../server
   npm run dev

   # Start the frontend client
   cd ../client
   npm run dev
   ```

5. Alternatively, use Docker Compose:
   ```bash
   # Make sure to set up the OPENAI_API_KEY in your environment first
   export OPENAI_API_KEY=your_api_key_here
   
   # Start all services
   docker-compose up
   ```

6. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - MongoDB: localhost:27017

## Acknowledgments

- OpenAI for GPT-4o API
- All the open source libraries used in this project
