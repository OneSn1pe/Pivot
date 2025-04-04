import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../contexts/AuthContext';

const Home = () => {
  const { currentUser } = useContext(AuthContext);

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Chart Your Path to Success with PivotAI
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            AI-powered career roadmaps for software engineers tailored to your dream companies
          </p>

          {currentUser ? (
            <Link
              to={`/${currentUser.role}/dashboard`}
              className="bg-white text-blue-600 font-semibold px-6 py-3 rounded-lg shadow-md hover:bg-gray-100 transition"
            >
              Go to Dashboard
            </Link>
          ) : (
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="bg-white text-blue-600 font-semibold px-6 py-3 rounded-lg shadow-md hover:bg-gray-100 transition"
              >
                Get Started
              </Link>
              <Link
                to="/login"
                className="bg-transparent border-2 border-white text-white font-semibold px-6 py-3 rounded-lg hover:bg-white/10 transition"
              >
                Login
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How PivotAI Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-gray-50 p-6 rounded-lg shadow-md">
              <div className="bg-blue-100 text-blue-800 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Upload Your Resume</h3>
              <p className="text-gray-600">
                Our AI analyzes your skills, experience, and education to understand your current position.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-gray-50 p-6 rounded-lg shadow-md">
              <div className="bg-green-100 text-green-800 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Select Target Companies</h3>
              <p className="text-gray-600">
                Identify your dream companies and positions, and our system will tailor recommendations to their specific requirements.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-gray-50 p-6 rounded-lg shadow-md">
              <div className="bg-purple-100 text-purple-800 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Get Your AI Roadmap</h3>
              <p className="text-gray-600">
                Receive a personalized career roadmap with specific projects, skills, and milestones to help you reach your goals.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* For Recruiters Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-8 md:mb-0 md:pr-8">
              <h2 className="text-3xl font-bold mb-4">For Recruiters</h2>
              <p className="text-lg text-gray-600 mb-6">
                Find and nurture promising candidates who are specifically targeting your company and positions.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Access candidates specifically interested in your company</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Monitor candidate development and progress</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Provide incentives and sponsorships to promising talent</span>
                </li>
              </ul>
              <Link
                to="/register"
                className="inline-block mt-6 bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg shadow-md hover:bg-blue-700 transition"
              >
                Join as a Recruiter
              </Link>
            </div>
            <div className="md:w-1/2">
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <div className="bg-blue-50 p-4 rounded-md mb-4">
                  <h3 className="text-xl font-semibold mb-2">Talent Pipeline Dashboard</h3>
                  <p className="text-gray-600 mb-4">
                    Monitor and engage with candidates at various stages of preparation for your company.
                  </p>
                  <div className="space-y-2">
                    <div className="bg-white p-3 rounded border border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Alex Johnson</span>
                        <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">75% Match</span>
                      </div>
                      <div className="text-sm text-gray-500">Full-Stack Developer | 3 years experience</div>
                      <div className="mt-2 h-2 bg-gray-200 rounded-full">
                        <div className="h-2 bg-green-500 rounded-full" style={{ width: '75%' }}></div>
                      </div>
                    </div>
                    <div className="bg-white p-3 rounded border border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Sarah Miller</span>
                        <span className="text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded">45% Match</span>
                      </div>
                      <div className="text-sm text-gray-500">Frontend Developer | 1 year experience</div>
                      <div className="mt-2 h-2 bg-gray-200 rounded-full">
                        <div className="h-2 bg-yellow-500 rounded-full" style={{ width: '45%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Accelerate Your Career?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join PivotAI today and get a personalized roadmap to your dream tech job.
          </p>
          {currentUser ? (
            <Link
              to={`/${currentUser.role}/dashboard`}
              className="bg-white text-blue-600 font-semibold px-6 py-3 rounded-lg shadow-md hover:bg-gray-100 transition"
            >
              Go to Dashboard
            </Link>
          ) : (
            <Link
              to="/register"
              className="bg-white text-blue-600 font-semibold px-6 py-3 rounded-lg shadow-md hover:bg-gray-100 transition"
            >
              Sign Up Now
            </Link>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;