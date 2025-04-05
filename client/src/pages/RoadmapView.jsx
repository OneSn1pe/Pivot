// RoadmapView.jsx
import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../contexts/AuthContext';
import UserContext from '../contexts/UserContext';
import { scoreRoadmapProgress } from '../services/gpt';

const RoadmapView = () => {
  const { currentUser } = useContext(AuthContext);
  const { roadmap, updateMilestoneStatus, generateRoadmap, loading, error } = useContext(UserContext);
  
  const [progressData, setProgressData] = useState(null);
  const [loadingProgress, setLoadingProgress] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState(null);
  
  // Fetch roadmap progress when roadmap is available
  useEffect(() => {
    const fetchProgress = async () => {
      if (roadmap?._id) {
        setLoadingProgress(true);
        try {
          const data = await scoreRoadmapProgress(roadmap._id);
          setProgressData(data);
        } catch (err) {
          console.error('Error fetching roadmap progress:', err);
        } finally {
          setLoadingProgress(false);
        }
      }
    };
    
    fetchProgress();
  }, [roadmap]);
  
  // Handle milestone status toggle
  const handleToggleMilestone = async (index, completed) => {
    try {
      await updateMilestoneStatus(index, !completed);
    } catch (err) {
      console.error('Error toggling milestone status:', err);
    }
  };
  
  // Handle roadmap generation
  const handleGenerateRoadmap = async () => {
    try {
      await generateRoadmap();
    } catch (err) {
      console.error('Error generating roadmap:', err);
    }
  };
  
  // Render milestone details modal
  const renderMilestoneDetails = () => {
    if (!selectedMilestone) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold">{selectedMilestone.title}</h3>
              <button
                onClick={() => setSelectedMilestone(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-4">
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                selectedMilestone.type === 'project' ? 'bg-blue-100 text-blue-800' :
                selectedMilestone.type === 'skill' ? 'bg-green-100 text-green-800' :
                selectedMilestone.type === 'certification' ? 'bg-purple-100 text-purple-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {selectedMilestone.type.charAt(0).toUpperCase() + selectedMilestone.type.slice(1)}
              </span>
              
              <span className="ml-2 inline-block px-3 py-1 rounded-full text-sm font-semibold bg-gray-100 text-gray-800">
                {selectedMilestone.difficulty}
              </span>
              
              {selectedMilestone.timeEstimate && (
                <span className="ml-2 inline-block px-3 py-1 rounded-full text-sm font-semibold bg-gray-100 text-gray-800">
                  {selectedMilestone.timeEstimate.amount} {selectedMilestone.timeEstimate.unit}
                </span>
              )}
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700">{selectedMilestone.description}</p>
            </div>
            
            {selectedMilestone.resources && selectedMilestone.resources.length > 0 && (
              <div className="mb-6">
                <h4 className="font-semibold mb-2">Recommended Resources</h4>
                <ul className="space-y-2">
                  {selectedMilestone.resources.map((resource, i) => (
                    <li key={i}>
                      <a 
                        href={resource.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 flex items-center"
                      >
                        <span className="mr-2">
                          {resource.type === 'article' ? '📄' :
                           resource.type === 'video' ? '🎥' :
                           resource.type === 'course' ? '🎓' :
                           resource.type === 'book' ? '📚' :
                           resource.type === 'documentation' ? '📑' :
                           resource.type === 'tool' ? '🔧' : '🔗'}
                        </span>
                        {resource.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
              <span className="text-gray-600">
                {selectedMilestone.completed ? 
                  <span className="text-green-600">✓ Completed</span> : 
                  'Not completed yet'}
              </span>
              
              <button
                onClick={() => {
                  const index = roadmap.milestones.findIndex(m => m === selectedMilestone);
                  if (index !== -1) {
                    handleToggleMilestone(index, selectedMilestone.completed);
                    setSelectedMilestone(null);
                  }
                }}
                className={`px-4 py-2 rounded-lg ${
                  selectedMilestone.completed ?
                  'bg-red-100 text-red-700 hover:bg-red-200' :// Continuing RoadmapView.jsx (from where we left off)
                  'bg-green-100 text-green-700 hover:bg-green-200'
                }`}
              >
                {selectedMilestone.completed ? 'Mark as Incomplete' : 'Mark as Complete'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  // If no roadmap exists yet
  if (!roadmap) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Create Your Career Roadmap</h1>
          <p className="text-gray-600 mb-6">
            You haven't generated a career roadmap yet. To create one, you need to:
          </p>
          
          <div className="flex flex-col items-center space-y-4 mb-8">
            <div className="flex items-center">
              <div className="bg-blue-100 text-blue-800 w-8 h-8 rounded-full flex items-center justify-center mr-3">
                1
              </div>
              <span>Upload your resume</span>
            </div>
            <div className="flex items-center">
              <div className="bg-blue-100 text-blue-800 w-8 h-8 rounded-full flex items-center justify-center mr-3">
                2
              </div>
              <span>Set your target companies</span>
            </div>
            <div className="flex items-center">
              <div className="bg-blue-100 text-blue-800 w-8 h-8 rounded-full flex items-center justify-center mr-3">
                3
              </div>
              <span>Generate your personalized roadmap</span>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Link 
              to="/candidate/resume" 
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
            >
              Upload Resume
            </Link>
            <Link 
              to="/candidate/profile" 
              className="px-6 py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300"
            >
              Edit Profile
            </Link>
            <button
              onClick={handleGenerateRoadmap}
              disabled={loading}
              className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Generate Roadmap
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold">{roadmap.title}</h1>
          <p className="text-gray-600">{roadmap.description}</p>
        </div>
        
        <div className="flex items-center space-x-3">
          {!loadingProgress && progressData && (
            <div className="bg-white rounded-lg shadow-sm p-4 flex flex-col items-center">
              <div className="text-3xl font-bold text-blue-600 mb-1">
                {progressData.completionPercentage}%
              </div>
              <div className="text-sm text-gray-600">Complete</div>
            </div>
          )}
          
          <button
            onClick={handleGenerateRoadmap}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Only regenerate if you've made significant changes to your resume or target companies"
          >
            Regenerate Roadmap
          </button>
        </div>
      </div>
      
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              Roadmaps are now persistent and won't be regenerated automatically when you update your target companies. 
              Click "Regenerate Roadmap" when you want to create a new roadmap based on your current information.
            </p>
          </div>
        </div>
      </div>
      
      {/* Progress Overview */}
      {progressData && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Roadmap Progress</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-800 mb-1">Timeline</h3>
              <p className="text-lg font-semibold">
                {progressData.isOnTrack ? (
                  <span className="text-green-600">On Track</span>
                ) : (
                  <span className="text-yellow-600">Falling Behind</span>
                )}
              </p>
              <p className="text-sm text-gray-600">
                {progressData.remainingTime.months} months remaining
              </p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-medium text-green-800 mb-1">Milestones</h3>
              <p className="text-lg font-semibold">
                {progressData.completedMilestones} / {progressData.totalMilestones}
              </p>
              <p className="text-sm text-gray-600">
                Milestones completed
              </p>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-medium text-purple-800 mb-1">Skill Improvement</h3>
              <p className="text-lg font-semibold">
                {progressData.skillImprovementScore}%
              </p>
              <p className="text-sm text-gray-600">
                Skills and courses completed
              </p>
            </div>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
            <div 
              className="bg-blue-600 h-2.5 rounded-full" 
              style={{ width: `${progressData.completionPercentage}%` }}
            ></div>
          </div>
          
          <div className="flex justify-between text-xs text-gray-500">
            <span>Start</span>
            <span>Current: {progressData.timeProgress}%</span>
            <span>Target</span>
          </div>
        </div>
      )}
      
      {/* Target Companies */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Target Companies</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {roadmap.targetCompanies.map((target, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-lg">{target.company}</h3>
              <p className="text-gray-600">{target.position}</p>
            </div>
          ))}
        </div>
      </div>
      
      {/* Milestones */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Roadmap Milestones</h2>
        
        <div className="space-y-4">
          {roadmap.milestones.sort((a, b) => a.order - b.order).map((milestone, index) => (
            <div 
              key={index}
              className={`border rounded-lg p-4 transition-all cursor-pointer hover:border-blue-300 ${
                milestone.completed ? 'bg-green-50 border-green-200' : 'border-gray-200'
              }`}
              onClick={() => setSelectedMilestone(milestone)}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-start">
                  <div
                    className={`w-6 h-6 rounded-full mr-3 flex items-center justify-center flex-shrink-0 ${
                      milestone.completed ? 'bg-green-500 text-white' : 'bg-gray-200'
                    }`}
                  >
                    {milestone.completed ? '✓' : (index + 1)}
                  </div>
                  
                  <div>
                    <h3 className="font-medium">{milestone.title}</h3>
                    <p className="text-gray-600 text-sm line-clamp-2">{milestone.description}</p>
                  </div>
                </div>
                
                <span className={`px-2 py-1 rounded text-xs ${
                  milestone.type === 'project' ? 'bg-blue-100 text-blue-800' :
                  milestone.type === 'skill' ? 'bg-green-100 text-green-800' :
                  milestone.type === 'certification' ? 'bg-purple-100 text-purple-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {milestone.type}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Alternative Routes (if any) */}
      {roadmap.alternativeRoutes && roadmap.alternativeRoutes.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Alternative Routes</h2>
          
          <div className="space-y-4">
            {roadmap.alternativeRoutes.map((route, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-2">{route.title}</h3>
                <p className="text-gray-600 mb-3">{route.description}</p>
                
                {route.milestones && route.milestones.length > 0 && (
                  <div className="text-sm">
                    <h4 className="font-medium mb-2">Key Milestones:</h4>
                    <ul className="list-disc list-inside space-y-1 text-gray-600">
                      {route.milestones.map((milestone, idx) => (
                        <li key={idx}>{milestone.title}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Render milestone details modal */}
      {renderMilestoneDetails()}
    </div>
  );
};

export default RoadmapView;