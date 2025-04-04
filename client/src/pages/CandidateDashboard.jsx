import React, { useContext, useEffect, useState } from 'react';
import AuthContext from '../contexts/AuthContext';
import UserContext from '../contexts/UserContext';

const CandidateDashboard = () => {
  const { currentUser } = useContext(AuthContext);
  const { userProfile, resume, roadmap, loading, error } = useContext(UserContext);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Welcome, {currentUser?.name}</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Dashboard Overview</h2>
        
        {/* Display progress summary if roadmap exists */}
        {roadmap ? (
          <div className="mb-4">
            <p className="mb-2">Your career roadmap is {calculateProgress(roadmap)}% complete.</p>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full" 
                style={{ width: `${calculateProgress(roadmap)}%` }}
              ></div>
            </div>
          </div>
        ) : (
          <p className="text-gray-600">
            You haven't created a roadmap yet. Upload your resume and set your target companies to get started.
          </p>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-4">
            <a href="/candidate/resume" className="block px-4 py-2 bg-blue-50 text-blue-700 rounded hover:bg-blue-100">
              Upload or Update Resume
            </a>
            <a href="/candidate/roadmap" className="block px-4 py-2 bg-blue-50 text-blue-700 rounded hover:bg-blue-100">
              View Career Roadmap
            </a>
            <a href="/candidate/profile" className="block px-4 py-2 bg-blue-50 text-blue-700 rounded hover:bg-blue-100">
              Edit Profile
            </a>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Target Companies</h2>
          {userProfile?.targetCompanies?.length > 0 ? (
            <ul className="space-y-2">
              {userProfile.targetCompanies.map((target, index) => (
                <li key={index} className="p-2 bg-gray-50 rounded flex justify-between items-center">
                  <span>{target.company} - {target.position}</span>
                  <span className="text-sm bg-blue-100 text-blue-800 py-1 px-2 rounded">
                    Priority: {target.priority || 1}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600">
              You haven't added any target companies yet. Add them in your profile.
            </p>
          )}
        </div>
      </div>

      {/* Recent Activity or Next Steps */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Next Steps</h2>
        {roadmap ? (
          <div>
            <p className="mb-4">Here are your next milestones:</p>
            <ul className="space-y-4">
              {getNextMilestones(roadmap).map((milestone, index) => (
                <li key={index} className="flex items-start">
                  <div className="bg-blue-100 text-blue-800 p-2 rounded-full mr-3">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="font-medium">{milestone.title}</h3>
                    <p className="text-gray-600 text-sm">{milestone.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-gray-600">
            Generate your roadmap to see recommended next steps.
          </p>
        )}
      </div>
    </div>
  );
};

// Helper function to calculate roadmap progress
const calculateProgress = (roadmap) => {
  if (!roadmap || !roadmap.milestones || roadmap.milestones.length === 0) {
    return 0;
  }
  
  const completedMilestones = roadmap.milestones.filter(m => m.completed).length;
  return Math.round((completedMilestones / roadmap.milestones.length) * 100);
};

// Helper function to get next uncompleted milestones
const getNextMilestones = (roadmap) => {
  if (!roadmap || !roadmap.milestones) {
    return [];
  }
  
  return roadmap.milestones
    .filter(m => !m.completed)
    .sort((a, b) => a.order - b.order)
    .slice(0, 3);
};

export default CandidateDashboard;