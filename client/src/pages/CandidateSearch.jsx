// CandidateSearch.jsx
import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { scoreCandidateCompatibility } from '../services/gpt';
import AuthContext from '../contexts/AuthContext';
import UserContext from '../contexts/UserContext';
import { FaBookmark, FaRegBookmark } from 'react-icons/fa';

const CandidateSearch = () => {
  const { currentUser } = useContext(AuthContext);
  const { jobPreferences, bookmarkedCandidates, bookmarkCandidate, removeBookmark } = useContext(UserContext);
  
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [compatibilityScores, setCompatibilityScores] = useState({});
  const [bookmarkNotes, setBookmarkNotes] = useState('');
  const [selectedJobPreference, setSelectedJobPreference] = useState('');
  const [filters, setFilters] = useState({
    skills: [],
    minExperience: '',
    maxExperience: '',
    keyword: ''
  });
  const [showTargetingOnly, setShowTargetingOnly] = useState(false);
  
  // Fetch candidates on component mount
  useEffect(() => {
    fetchCandidates();
  }, []);
  
  // Fetch candidates that match recruiter's company
  const fetchCandidates = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get('/recruiters/candidates');
      console.log('Candidate API response:', response.data);
      
      // Check if the response has the new format with a candidates array
      if (response.data && response.data.candidates) {
        setCandidates(response.data.candidates);
        // Show the message from the API if provided
        if (response.data.message) {
          console.log('API Message:', response.data.message);
        }
      } else {
        // Handle the old format for backward compatibility
        setCandidates(response.data);
      }
    } catch (err) {
      console.error('Error fetching candidates:', err);
      setError('Failed to fetch candidates. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Score candidate compatibility with selected job preference
  const scoreCandidate = async (candidateId) => {
    if (!selectedJobPreference) return;
    
    try {
      const jobPref = jobPreferences.find(jp => jp._id === selectedJobPreference);
      if (!jobPref) {
        console.error('Selected job preference not found');
        return;
      }
      
      // Format the job requirements properly for the API
      const formattedJobRequirements = {
        position: jobPref.position,
        company: jobPref.company,
        description: jobPref.description,
        requirements: {
          skills: jobPref.skills || [],
          experience: jobPref.experience || [],
          education: jobPref.education || [],
          responsibilities: jobPref.responsibilities || []
        }
      };
      
      // Provide a fallback if job preferences are missing critical data
      if (!formattedJobRequirements.position) formattedJobRequirements.position = "Unspecified Position";
      if (!formattedJobRequirements.company) formattedJobRequirements.company = "Your Company";
      if (formattedJobRequirements.requirements.skills.length === 0) {
        console.warn('Job preference is missing skills data');
      }
      
      const score = await scoreCandidateCompatibility(candidateId, formattedJobRequirements);
      
      setCompatibilityScores(prev => ({
        ...prev,
        [candidateId]: score
      }));
    } catch (err) {
      console.error('Error scoring candidate:', err);
      
      // Provide a fallback compatibility score in case of API failure
      if (err.response && err.response.status === 500) {
        // Create a fallback score based on skills matching
        const candidate = candidates.find(c => c._id === candidateId);
        const jobPref = jobPreferences.find(jp => jp._id === selectedJobPreference);
        
        if (candidate && jobPref && candidate.skills && jobPref.skills) {
          // Simple matching algorithm as fallback
          const candidateSkills = candidate.skills.map(s => s.name.toLowerCase());
          const jobSkills = jobPref.skills.map(s => s.toLowerCase());
          
          const matchingSkills = jobSkills.filter(skill => 
            candidateSkills.some(cSkill => cSkill.includes(skill))
          );
          
          const fallbackScore = {
            matchScore: Math.round((matchingSkills.length / jobSkills.length) * 100) || 50,
            matchingStrengths: matchingSkills,
            gaps: jobSkills.filter(skill => !matchingSkills.includes(skill)),
            analysis: "This is an estimated score based on skill matching due to server processing limitations."
          };
          
          setCompatibilityScores(prev => ({
            ...prev,
            [candidateId]: fallbackScore
          }));
          
          console.warn('Using fallback compatibility score due to API error');
        }
      }
    }
  };
  
  // Handle bookmark toggle
  const handleToggleBookmark = async (candidateId) => {
    // Check if candidate is already bookmarked
    const isBookmarked = bookmarkedCandidates.some(
      bookmark => bookmark.candidate._id === candidateId
    );
    
    try {
      if (isBookmarked) {
        await removeBookmark(candidateId);
      } else {
        await bookmarkCandidate(candidateId, bookmarkNotes);
        setBookmarkNotes('');
      }
    } catch (err) {
      console.error('Error toggling bookmark:', err);
    }
  };
  
  // Check if candidate is bookmarked
  const isBookmarked = (candidateId) => {
    return bookmarkedCandidates.some(
      bookmark => bookmark.candidate._id === candidateId
    );
  };
  
  // Filter candidates based on filter criteria
  const filteredCandidates = candidates.filter(candidate => {
    // Filter by keyword (name or skills)
    if (filters.keyword && filters.keyword.trim() !== '') {
      const keyword = filters.keyword.toLowerCase();
      const nameMatch = candidate.name.toLowerCase().includes(keyword);
      const skillsMatch = candidate.skills?.some(skill => 
        skill.name.toLowerCase().includes(keyword)
      );
      
      if (!nameMatch && !skillsMatch) {
        return false;
      }
    }
    
    // Filter by skills
    if (filters.skills.length > 0) {
      const candidateSkills = candidate.skills?.map(skill => skill.name.toLowerCase()) || [];
      const hasAllSkills = filters.skills.every(skill => 
        candidateSkills.includes(skill.toLowerCase())
      );
      
      if (!hasAllSkills) {
        return false;
      }
    }
    
    // Filter by experience (if provided)
    if (filters.minExperience !== '') {
      const yearsOfExperience = calculateYearsOfExperience(candidate.experience);
      if (yearsOfExperience < parseInt(filters.minExperience)) {
        return false;
      }
    }
    
    if (filters.maxExperience !== '') {
      const yearsOfExperience = calculateYearsOfExperience(candidate.experience);
      if (yearsOfExperience > parseInt(filters.maxExperience)) {
        return false;
      }
    }
    
    return true;
  });
  
  // Calculate years of experience from experience array
  const calculateYearsOfExperience = (experience) => {
    if (!experience || experience.length === 0) return 0;
    
    let totalMonths = 0;
    experience.forEach(exp => {
      const startDate = new Date(exp.startDate);
      const endDate = exp.current ? new Date() : new Date(exp.endDate);
      
      const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 +
        (endDate.getMonth() - startDate.getMonth());
      
      totalMonths += months;
    });
    
    return Math.round(totalMonths / 12);
  };
  
  // Handle filter change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle skill filter add
  const handleAddSkillFilter = (skill) => {
    if (!filters.skills.includes(skill)) {
      setFilters(prev => ({
        ...prev,
        skills: [...prev.skills, skill]
      }));
    }
  };
  
  // Handle skill filter remove
  const handleRemoveSkillFilter = (skill) => {
    setFilters(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };
  
  // Apply targeting filter if enabled
  const displayCandidates = showTargetingOnly 
    ? filteredCandidates.filter(candidate => candidate.isTargetingCompany)
    : filteredCandidates;
  
  // Render candidate details modal
  const renderCandidateDetails = () => {
    if (!selectedCandidate) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold">{selectedCandidate.name}</h2>
                <p className="text-gray-600">{selectedCandidate.email}</p>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleToggleBookmark(selectedCandidate._id)}
                  className={`p-2 rounded-full ${
                    isBookmarked(selectedCandidate._id) 
                      ? 'bg-blue-100 text-blue-600 hover:bg-blue-200' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  title={isBookmarked(selectedCandidate._id) ? "Remove bookmark" : "Add to bookmarks"}
                >
                  {isBookmarked(selectedCandidate._id) ? (
                    <FaBookmark size={18} />
                  ) : (
                    <FaRegBookmark size={18} />
                  )}
                </button>
                
                <button
                  onClick={() => setSelectedCandidate(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Compatibility Score */}
            {compatibilityScores[selectedCandidate._id] && (
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-blue-800">Compatibility Score</h3>
                  <span className="text-lg font-bold text-blue-800">
                    {compatibilityScores[selectedCandidate._id].matchScore || 0}%
                  </span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full" 
                    style={{ width: `${compatibilityScores[selectedCandidate._id].matchScore || 0}%` }}
                  ></div>
                </div>
                
                <div className="text-sm">
                  {compatibilityScores[selectedCandidate._id].matchingStrengths && 
                  compatibilityScores[selectedCandidate._id].matchingStrengths.length > 0 && (
                    <div className="mb-2">
                      <h4 className="font-medium text-blue-800">Strengths:</h4>
                      <ul className="list-disc list-inside pl-2">
                        {compatibilityScores[selectedCandidate._id].matchingStrengths.map((strength, i) => (
                          <li key={i}>{strength}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {compatibilityScores[selectedCandidate._id].gaps && 
                  compatibilityScores[selectedCandidate._id].gaps.length > 0 && (
                    <div className="mb-2">
                      <h4 className="font-medium text-blue-800">Gaps:</h4>
                      <ul className="list-disc list-inside pl-2">
                        {compatibilityScores[selectedCandidate._id].gaps.map((gap, i) => (
                          <li key={i}>{gap}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {compatibilityScores[selectedCandidate._id].analysis && (
                    <div className="mt-2 p-2 bg-blue-100 rounded">
                      <p className="text-xs italic">{compatibilityScores[selectedCandidate._id].analysis}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Career Roadmap - Prominently Featured */}
            {selectedCandidate.roadmap ? (
              <div className="mb-8 border border-blue-200 rounded-lg p-6 bg-blue-50">
                <h3 className="text-xl font-bold text-blue-800 mb-4">Career Roadmap</h3>
                
                {/* Roadmap Progress */}
                <div className="mb-6 space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-700 font-medium">Career Progress</span>
                      <span className="font-bold text-blue-800 text-lg">
                        {calculateRoadmapProgress(selectedCandidate.roadmap).milestoneProgress}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-blue-600 h-3 rounded-full" 
                        style={{ width: `${calculateRoadmapProgress(selectedCandidate.roadmap).milestoneProgress}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-700 font-medium">Skill Building Progress</span>
                      <span className="font-bold text-green-800 text-lg">
                        {calculateRoadmapProgress(selectedCandidate.roadmap).skillProgress}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-green-600 h-3 rounded-full" 
                        style={{ width: `${calculateRoadmapProgress(selectedCandidate.roadmap).skillProgress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                
                {/* Candidate Timeline */}
                <div className="mb-6">
                  <h4 className="font-semibold text-blue-800 mb-3">Career Timeline</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="font-medium text-blue-800 mb-1">Timeline Status</h3>
                      <p className="text-lg font-semibold">
                        {calculateRoadmapProgress(selectedCandidate.roadmap).milestoneProgress >= 
                          (calculateTimeProgress(selectedCandidate.roadmap) || 0) ? (
                          <span className="text-green-600">On Track</span>
                        ) : (
                          <span className="text-yellow-600">Behind Schedule</span>
                        )}
                      </p>
                      <p className="text-sm text-gray-600">
                        {calculateRemainingTime(selectedCandidate.roadmap)} months remaining
                      </p>
                    </div>
                    
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h3 className="font-medium text-green-800 mb-1">Milestones</h3>
                      <p className="text-lg font-semibold">
                        {selectedCandidate.roadmap.milestones.filter(m => m.completed).length} / {selectedCandidate.roadmap.milestones.length}
                      </p>
                      <p className="text-sm text-gray-600">
                        Milestones completed
                      </p>
                    </div>
                    
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h3 className="font-medium text-purple-800 mb-1">Estimated Completion</h3>
                      <p className="text-lg font-semibold">
                        {calculateEstimatedCompletionDate(selectedCandidate.roadmap)}
                      </p>
                      <p className="text-sm text-gray-600">
                        Based on current progress
                      </p>
                    </div>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full" 
                      style={{ width: `${calculateTimeProgress(selectedCandidate.roadmap) || 0}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Start</span>
                    <span>Current: {calculateTimeProgress(selectedCandidate.roadmap) || 0}%</span>
                    <span>Target</span>
                  </div>
                  
                  {/* Visual Timeline */}
                  <div className="mt-6 border-l-2 border-blue-200 pl-4 space-y-6">
                    {sortedMilestones(selectedCandidate.roadmap).map((milestone, index) => (
                      <div key={index} className="relative">
                        <div className={`absolute -left-6 w-4 h-4 rounded-full ${
                          milestone.completed ? 'bg-green-500' : 'bg-gray-300'
                        } border-2 border-white`}></div>
                        <div className={`pt-1 ${milestone.completed ? 'text-green-700' : 'text-gray-700'}`}>
                          <div className="flex justify-between items-center">
                            <h4 className="font-medium">{milestone.title}</h4>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              milestone.completed 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {milestone.completed ? 'Completed' : 'Pending'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{milestone.description}</p>
                          <div className="flex items-center mt-1 text-xs text-gray-500">
                            <span className={`px-2 py-1 rounded text-xs mr-2 ${
                              milestone.type === 'project' ? 'bg-blue-100 text-blue-800' :
                              milestone.type === 'skill' ? 'bg-green-100 text-green-800' :
                              milestone.type === 'certification' ? 'bg-purple-100 text-purple-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {milestone.type}
                            </span>
                            {milestone.timeEstimate && (
                              <span>{milestone.timeEstimate.amount} {milestone.timeEstimate.unit}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Milestones */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-blue-800">Milestones</h4>
                  {selectedCandidate.roadmap.milestones && selectedCandidate.roadmap.milestones.map((milestone, index) => (
                    <div key={index} className={`p-4 rounded-lg ${milestone.completed ? 'bg-green-100 border border-green-200' : 'bg-white border border-gray-200'}`}>
                      <div className="flex items-start justify-between">
                        <div>
                          <h5 className="font-medium">{milestone.title}</h5>
                          <p className="text-sm text-gray-600 mt-1">{milestone.description}</p>
                        </div>
                        <div className={`px-2 py-1 rounded text-xs ${milestone.completed ? 'bg-green-200 text-green-800' : 'bg-gray-200 text-gray-800'}`}>
                          {milestone.completed ? 'Completed' : 'In Progress'}
                        </div>
                      </div>
                      
                      {/* Resources */}
                      {milestone.resources && milestone.resources.length > 0 && (
                        <div className="mt-3">
                          <h6 className="text-xs font-medium text-gray-700">Resources:</h6>
                          <ul className="mt-1 space-y-1">
                            {milestone.resources.map((resource, i) => (
                              <li key={i} className="text-xs text-blue-600 flex items-center">
                                <span className="mr-1">•</span>
                                {resource.url ? (
                                  <a href={resource.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                    {resource.title || resource.url}
                                  </a>
                                ) : (
                                  <span>{resource.title}</span>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {/* Time Estimate */}
                      {milestone.timeEstimate && (
                        <div className="mt-2 text-xs text-gray-500">
                          Estimated time: {milestone.timeEstimate.amount} {milestone.timeEstimate.unit}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                {/* Roadmap Notes/Summary */}
                {selectedCandidate.roadmap.notes && (
                  <div className="mt-4 p-4 bg-white border border-gray-200 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-2">Career Path Notes</h4>
                    <p className="text-sm text-gray-600">{selectedCandidate.roadmap.notes}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="mb-6 p-4 bg-gray-100 rounded-lg text-center">
                <p className="text-gray-500">No career roadmap available</p>
              </div>
            )}
            
            {/* Skills - Still important for recruiters */}
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Skills</h3>
              {selectedCandidate.skills && selectedCandidate.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {selectedCandidate.skills.map((skill, index) => (
                    <span key={index} className="bg-blue-50 text-blue-800 px-3 py-1 rounded-full text-sm">
                      {skill.name} • {skill.level}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No skills listed</p>
              )}
            </div>
            
            {/* Bookmark Form */}
            <div className="border-t pt-4 mt-4">
              <h3 className="font-semibold mb-3">Bookmark Candidate</h3>
              
              {isBookmarked(selectedCandidate._id) ? (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center mb-3">
                    <FaBookmark className="text-blue-600 mr-2" size={18} />
                    <span className="font-medium text-blue-800">This candidate is bookmarked</span>
                  </div>
                  
                  {bookmarkedCandidates.find(b => b.candidate._id === selectedCandidate._id)?.notes && (
                    <div className="mb-3 bg-white p-3 rounded-md border border-blue-100">
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Your Notes:</h4>
                      <p className="text-sm text-gray-600">
                        {bookmarkedCandidates.find(b => b.candidate._id === selectedCandidate._id)?.notes}
                      </p>
                    </div>
                  )}
                  
                  <button
                    onClick={() => handleToggleBookmark(selectedCandidate._id)}
                    className="w-full px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 flex items-center justify-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Remove from Bookmarks
                  </button>
                </div>
              ) : (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center mb-3">
                    <FaRegBookmark className="text-gray-600 mr-2" size={18} />
                    <span className="font-medium text-gray-800">Save this candidate for later</span>
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="bookmarkNotes" className="block text-gray-700 text-sm font-medium mb-1">
                      Bookmark Notes (optional)
                    </label>
                    <textarea
                      id="bookmarkNotes"
                      value={bookmarkNotes}
                      onChange={(e) => setBookmarkNotes(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="2"
                      placeholder="Add notes about this candidate..."
                    ></textarea>
                  </div>
                  <button
                    onClick={() => handleToggleBookmark(selectedCandidate._id)}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center"
                  >
                    <FaBookmark className="mr-1" />
                    Add to Bookmarks
                  </button>
                </div>
              )}
              
              <div className="mt-3 text-sm text-gray-600">
                <p>Bookmarked candidates can be accessed from your <a href="/recruiter/bookmarked-candidates" className="text-blue-600 hover:underline">Bookmarked Candidates</a> page.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // Calculate roadmap progress
  const calculateRoadmapProgress = (roadmap) => {
    if (!roadmap || !roadmap.milestones || roadmap.milestones.length === 0) {
      return {
        milestoneProgress: 0,
        skillProgress: 0
      };
    }
    
    const completedMilestones = roadmap.milestones.filter(m => m.completed).length;
    const milestoneProgress = Math.round((completedMilestones / roadmap.milestones.length) * 100);
    
    // Calculate skill building progress
    const skillMilestones = roadmap.milestones.filter(m => m.type === 'skill');
    const skillProgress = skillMilestones.length > 0 
      ? Math.round((skillMilestones.filter(m => m.completed).length / skillMilestones.length) * 100)
      : 0;
    
    return {
      milestoneProgress,
      skillProgress
    };
  };
  
  // Calculate time progress
  const calculateTimeProgress = (roadmap) => {
    if (!roadmap || !roadmap.estimatedTimelineMonths <= 0) {
      return 0;
    }
    
    // Get roadmap creation date or assume it started 3 months ago if not available
    const startDate = roadmap.createdAt ? new Date(roadmap.createdAt) : new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const currentDate = new Date();
    const totalDuration = roadmap.estimatedTimelineMonths * 30 * 24 * 60 * 60 * 1000; // convert months to milliseconds
    
    const elapsedTime = currentDate - startDate;
    const timeProgress = Math.min(100, Math.round((elapsedTime / totalDuration) * 100));
    
    return timeProgress;
  };
  
  // Calculate remaining time in months
  const calculateRemainingTime = (roadmap) => {
    if (!roadmap || !roadmap.estimatedTimelineMonths) {
      return 0;
    }
    
    const startDate = roadmap.createdAt ? new Date(roadmap.createdAt) : new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const currentDate = new Date();
    const totalMonths = roadmap.estimatedTimelineMonths;
    
    // Calculate elapsed months (approximate)
    const elapsedMonths = (currentDate - startDate) / (30 * 24 * 60 * 60 * 1000);
    const remainingMonths = Math.max(0, totalMonths - elapsedMonths);
    
    return Math.round(remainingMonths);
  };
  
  // Calculate estimated completion date
  const calculateEstimatedCompletionDate = (roadmap) => {
    if (!roadmap || !roadmap.estimatedTimelineMonths) {
      return 'Not available';
    }
    
    const startDate = roadmap.createdAt ? new Date(roadmap.createdAt) : new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const currentDate = new Date();
    const totalMonths = roadmap.estimatedTimelineMonths;
    
    // Calculate completion date based on current progress and expected timeline
    const progress = calculateRoadmapProgress(roadmap).milestoneProgress / 100;
    const progressRate = progress / calculateTimeProgress(roadmap) || 1;
    
    // Adjust remaining time based on progress rate
    const remainingTime = (1 - progress) / progressRate;
    const adjustedRemainingMonths = remainingTime * totalMonths;
    
    const estimatedCompletionDate = new Date(currentDate);
    estimatedCompletionDate.setMonth(estimatedCompletionDate.getMonth() + Math.round(adjustedRemainingMonths));
    
    return estimatedCompletionDate.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short'
    });
  };
  
  // Add sortedMilestones helper function
  const sortedMilestones = (roadmap) => {
    if (!roadmap || !roadmap.milestones || roadmap.milestones.length === 0) {
      return [];
    }
    
    return [...roadmap.milestones].sort((a, b) => a.order - b.order);
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Candidate Search</h1>
      
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Filters</h2>
          <button
            onClick={() => setFilters({
              skills: [],
              minExperience: '',
              maxExperience: '',
              keyword: ''
            })}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            Clear All
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Keyword Search */}
          <div>
            <label htmlFor="keyword" className="block text-gray-700 text-sm font-medium mb-1">
              Search
            </label>
            <input
              type="text"
              id="keyword"
              name="keyword"
              value={filters.keyword}
              onChange={handleFilterChange}
              placeholder="Search by name or skill"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {/* Min Experience */}
          <div>
            <label htmlFor="minExperience" className="block text-gray-700 text-sm font-medium mb-1">
              Min Experience (years)
            </label>
            <input
              type="number"
              id="minExperience"
              name="minExperience"
              value={filters.minExperience}
              onChange={handleFilterChange}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {/* Max Experience */}
          <div>
            <label htmlFor="maxExperience" className="block text-gray-700 text-sm font-medium mb-1">
              Max Experience (years)
            </label>
            <input
              type="number"
              id="maxExperience"
              name="maxExperience"
              value={filters.maxExperience}
              onChange={handleFilterChange}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {/* Job Preference */}
          <div>
            <label htmlFor="jobPreference" className="block text-gray-700 text-sm font-medium mb-1">
              Evaluate For Position
            </label>
            <select
              id="jobPreference"
              value={selectedJobPreference}
              onChange={(e) => setSelectedJobPreference(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a job position</option>
              {jobPreferences.map(pref => (
                <option key={pref._id} value={pref._id}>
                  {pref.position}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Skill Filters */}
        <div>
          <label className="block text-gray-700 text-sm font-medium mb-1">
            Skills Filter
          </label>
          
          <div className="flex flex-wrap gap-2 mb-2">
            {filters.skills.map((skill, index) => (
              <span 
                key={index} 
                className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center"
              >
                {skill}
                <button
                  onClick={() => handleRemoveSkillFilter(skill)}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          
          <div className="flex flex-wrap gap-2">
            {['JavaScript', 'React', 'Node.js', 'Python', 'Java', 'AWS', 'SQL'].map(skill => (
              <button
                key={skill}
                onClick={() => handleAddSkillFilter(skill)}
                className={`px-3 py-1 rounded-full text-sm ${
                  filters.skills.includes(skill)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
                disabled={filters.skills.includes(skill)}
              >
                {skill}
              </button>
            ))}
          </div>
        </div>
        
        {/* Add this to the filters section */}
        <div className="mt-4 flex items-center">
          <input
            type="checkbox"
            id="targetingFilter"
            checked={showTargetingOnly}
            onChange={(e) => setShowTargetingOnly(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="targetingFilter" className="ml-2 block text-sm text-gray-700">
            Show only candidates targeting my company
          </label>
        </div>
      </div>
      
      {/* Candidates List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">
            Candidates ({displayCandidates.length})
          </h2>
        </div>
        
        {displayCandidates.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No candidates match your filters</p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayCandidates.map(candidate => (
              <div 
                key={candidate._id}
                className={`border ${candidate.isTargetingCompany ? 'border-green-300 bg-green-50' : 'border-gray-200'} rounded-lg p-4 hover:border-blue-300 transition-colors cursor-pointer`}
                onClick={() => setSelectedCandidate(candidate)}
              >
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{candidate.name}</h3>
                    
                    {candidate.isTargetingCompany && (
                      <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full inline-block mb-2">
                        Targeting Your Company
                      </div>
                    )}
                    
                    {candidate.skills && candidate.skills.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {candidate.skills.slice(0, 5).map((skill, index) => (
                          <span key={index} className="bg-gray-100 px-2 py-1 rounded text-xs">
                            {skill.name}
                          </span>
                        ))}
                        {candidate.skills.length > 5 && (
                          <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                            +{candidate.skills.length - 5} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-start">
                    {isBookmarked(candidate._id) && (
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded mr-2 text-xs">
                        Bookmarked
                      </span>
                    )}
                    
                    {compatibilityScores[candidate._id] && (
                      <span className={`px-2 py-1 rounded text-xs ${
                        (compatibilityScores[candidate._id].matchScore || 0) >= 70
                          ? 'bg-green-100 text-green-800'
                          : (compatibilityScores[candidate._id].matchScore || 0) >= 40
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                      }`}>
                        {compatibilityScores[candidate._id].matchScore || 0}% Match
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="mt-2 flex justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-4">
                    {candidate.roadmap ? (
                      <>
                        <div className="flex items-center">
                          <span className="mr-2">Career Progress:</span>
                          <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${calculateRoadmapProgress(candidate.roadmap).milestoneProgress}%` }}
                            ></div>
                          </div>
                          <span>{calculateRoadmapProgress(candidate.roadmap).milestoneProgress}%</span>
                        </div>
                        
                        <div className="flex items-center">
                          <span className="mr-2">Skills:</span>
                          <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className="bg-green-600 h-2 rounded-full" 
                              style={{ width: `${calculateRoadmapProgress(candidate.roadmap).skillProgress}%` }}
                            ></div>
                          </div>
                          <span>{calculateRoadmapProgress(candidate.roadmap).skillProgress}%</span>
                        </div>
                      </>
                    ) : (
                      <span>No roadmap available</span>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    {selectedJobPreference && !compatibilityScores[candidate._id] && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          scoreCandidate(candidate._id);
                        }}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Evaluate Fit
                      </button>
                    )}
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isBookmarked(candidate._id)) {
                          handleToggleBookmark(candidate._id);
                        } else {
                          setSelectedCandidate(candidate);
                        }
                      }}
                      className="text-blue-600 hover:text-blue-800 flex items-center"
                      title={isBookmarked(candidate._id) ? "Remove bookmark" : "Add to bookmarks"}
                    >
                      {isBookmarked(candidate._id) ? (
                        <><FaBookmark className="mr-1" /> Bookmarked</>
                      ) : (
                        <><FaRegBookmark className="mr-1" /> Bookmark</>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Render candidate details modal */}
      {renderCandidateDetails()}
    </div>
  );
};

export default CandidateSearch;