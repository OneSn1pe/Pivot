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
- Connect with recruiters who can provide incentives/sponsorships

### For Recruiters:
- Create a company profile
- Access candidates who have listed your company as a target
- Define job positions and requirements
- Bookmark and monitor candidate progress
- Provide incentives to promising candidates

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

## Project Structure

```
pivot-ai/
│
├── client/                      # Frontend code
│   ├── public/                  # Static files
│   └── src/
│       ├── components/          # React components
│       ├── contexts/            # React contexts
│       ├── pages/               # Page components
│       ├── services/            # API service functions
│       └── ...
│
├── server/                      # Backend code
│   ├── src/
│   │   ├── controllers/         # Route controllers
│   │   ├── models/              # Database models
│   │   ├── middleware/          # Custom middleware
│   │   ├── services/            # Business logic
│   │   ├── routes/              # API routes
│   │   └── ...
│   └── ...
│
└── ...
```

## API Routes

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user
- `GET /api/auth/me` - Get current user

### Candidates
- `GET /api/candidates/profile` - Get candidate profile
- `PUT /api/candidates/profile` - Update candidate profile
- `POST /api/candidates/resume` - Upload resume
- `GET /api/candidates/resume` - Get resume
- `PUT /api/candidates/target-companies` - Update target companies
- `POST /api/candidates/roadmap` - Generate roadmap
- `GET /api/candidates/roadmap` - Get roadmap
- `PUT /api/candidates/roadmap/milestone` - Update milestone status

### Recruiters
- `GET /api/recruiters/profile` - Get recruiter profile
- `PUT /api/recruiters/profile` - Update recruiter profile
- `POST /api/recruiters/job-preferences` - Create job preference
- `GET /api/recruiters/job-preferences` - Get job preferences
- `GET /api/recruiters/candidates` - Get matching candidates
- `POST /api/recruiters/bookmark` - Bookmark a candidate
- `POST /api/recruiters/incentives` - Offer incentive

### Roadmaps
- `GET /api/roadmaps/:roadmapId` - Get roadmap by ID
- `GET /api/roadmaps/:roadmapId/progress` - Score roadmap progress
- `POST /api/roadmaps/compatibility/:candidateId` - Check candidate compatibility

## Contributing

This is a hackathon project. If you'd like to contribute, please fork the repository and create a pull request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- OpenAI for GPT-4o API
- All the open source libraries used in this project