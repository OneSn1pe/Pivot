import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import UserContext from '../contexts/UserContext';
import { FaTrash, FaEye, FaRegStar, FaStar } from 'react-icons/fa';
import Spinner from '../components/common/Spinner';

const BookmarkedCandidates = () => {
  const { bookmarkedCandidates, removeBookmark, loading } = useContext(UserContext);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateRoadmapProgress = (roadmap) => {
    if (!roadmap || !roadmap.milestones || roadmap.milestones.length === 0) {
      return 0;
    }

    const completedMilestones = roadmap.milestones.filter(milestone => milestone.completed).length;
    return Math.round((completedMilestones / roadmap.milestones.length) * 100);
  };

  const handleRemoveBookmark = async (candidateId, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to remove this bookmark?')) {
      await removeBookmark(candidateId);
    }
  };

  const openCandidateDetails = (candidate) => {
    setSelectedCandidate(candidate);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCandidate(null);
  };

  useEffect(() => {
    document.title = 'Bookmarked Candidates | PivotAI';
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner size="large" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Bookmarked Candidates</h1>
      
      {bookmarkedCandidates.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-600 mb-4">You haven't bookmarked any candidates yet.</p>
          <button 
            onClick={() => navigate('/recruiter/candidates')}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Find Candidates
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {bookmarkedCandidates.map((bookmark) => {
            const candidate = bookmark.candidate;
            const progress = calculateRoadmapProgress(candidate.roadmap);
            
            return (
              <div 
                key={bookmark._id} 
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => openCandidateDetails(bookmark)}
              >
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h2 className="font-bold text-lg">{candidate.name}</h2>
                    <button
                      onClick={(e) => handleRemoveBookmark(candidate._id, e)}
                      className="text-red-500 hover:text-red-700"
                      title="Remove bookmark"
                    >
                      <FaTrash />
                    </button>
                  </div>
                  
                  <p className="text-gray-600 mb-3">{candidate.email}</p>
                  
                  <div className="mb-4">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Career Progress</span>
                      <span className="text-sm font-medium">{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  {candidate.skills && candidate.skills.length > 0 && (
                    <div className="mb-3">
                      <p className="text-sm font-medium mb-1">Skills:</p>
                      <div className="flex flex-wrap gap-1">
                        {candidate.skills.slice(0, 5).map((skill, index) => (
                          <span 
                            key={index}
                            className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded"
                          >
                            {skill}
                          </span>
                        ))}
                        {candidate.skills.length > 5 && (
                          <span className="text-xs text-gray-500">+{candidate.skills.length - 5} more</span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {bookmark.notes && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-sm font-medium mb-1">Your Notes:</p>
                      <p className="text-sm text-gray-600">{bookmark.notes}</p>
                    </div>
                  )}

                  <div className="mt-4 flex justify-end">
                    <button
                      className="flex items-center text-blue-600 hover:text-blue-800"
                      onClick={(e) => {
                        e.stopPropagation();
                        openCandidateDetails(bookmark);
                      }}
                    >
                      <FaEye className="mr-1" /> View Details
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Candidate Details Modal */}
      {isModalOpen && selectedCandidate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold">{selectedCandidate.candidate.name}</h2>
                <button
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>

              <div className="mb-6">
                <p className="text-gray-600">{selectedCandidate.candidate.email}</p>
              </div>

              {/* Career Roadmap */}
              <div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="text-lg font-semibold mb-3">Career Roadmap</h3>
                
                {selectedCandidate.candidate.roadmap ? (
                  <>
                    <div className="mb-4">
                      <div className="flex justify-between mb-1">
                        <span className="font-medium">Overall Progress</span>
                        <span className="font-medium">
                          {calculateRoadmapProgress(selectedCandidate.candidate.roadmap)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-blue-600 h-2.5 rounded-full" 
                          style={{ width: `${calculateRoadmapProgress(selectedCandidate.candidate.roadmap)}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    {selectedCandidate.candidate.roadmap.summary && (
                      <div className="mb-4">
                        <p className="font-medium mb-1">Roadmap Summary:</p>
                        <p className="text-gray-700">{selectedCandidate.candidate.roadmap.summary}</p>
                      </div>
                    )}
                    
                    {selectedCandidate.candidate.roadmap.milestones && 
                     selectedCandidate.candidate.roadmap.milestones.length > 0 && (
                      <div>
                        <p className="font-medium mb-2">Milestones:</p>
                        <div className="space-y-3">
                          {selectedCandidate.candidate.roadmap.milestones.map((milestone, index) => (
                            <div key={index} className="border border-gray-200 rounded-md p-3 bg-white">
                              <div className="flex items-start justify-between">
                                <div className="flex items-center">
                                  <div className={`w-4 h-4 rounded-full mr-2 ${milestone.completed ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                  <h4 className="font-medium">{milestone.title}</h4>
                                </div>
                                <span className="text-sm text-gray-500">
                                  {milestone.estimated_time || 'Unknown'} {milestone.time_unit || 'time'}
                                </span>
                              </div>
                              {milestone.description && (
                                <p className="mt-2 text-sm text-gray-600">{milestone.description}</p>
                              )}
                              {milestone.resources && milestone.resources.length > 0 && (
                                <div className="mt-2">
                                  <p className="text-xs font-medium text-gray-500">Resources:</p>
                                  <ul className="text-xs text-blue-600">
                                    {milestone.resources.slice(0, 2).map((resource, idx) => (
                                      <li key={idx} className="truncate">
                                        <a href={resource.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                          {resource.title || resource.url}
                                        </a>
                                      </li>
                                    ))}
                                    {milestone.resources.length > 2 && (
                                      <li className="text-gray-500">+{milestone.resources.length - 2} more resources</li>
                                    )}
                                  </ul>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-gray-600">No roadmap information available.</p>
                )}
              </div>

              {/* Skills */}
              {selectedCandidate.candidate.skills && selectedCandidate.candidate.skills.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedCandidate.candidate.skills.map((skill, index) => (
                      <span 
                        key={index}
                        className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Bookmark Notes */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Your Notes</h3>
                {selectedCandidate.notes ? (
                  <p className="text-gray-700 whitespace-pre-line">{selectedCandidate.notes}</p>
                ) : (
                  <p className="text-gray-500 italic">No notes added.</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 border-t pt-4">
                <button
                  onClick={() => navigate(`/recruiter/candidates?search=${selectedCandidate.candidate.name}`)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                >
                  View in Candidates
                </button>
                <button
                  onClick={(e) => {
                    handleRemoveBookmark(selectedCandidate.candidate._id, e);
                    closeModal();
                  }}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 flex items-center"
                >
                  <FaTrash className="mr-1" /> Remove Bookmark
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookmarkedCandidates; 