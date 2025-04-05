// CandidateSearch.jsx
import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { scoreCandidateCompatibility } from '../services/gpt';
import AuthContext from '../contexts/AuthContext';
import UserContext from '../contexts/UserContext';

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
      if (!jobPref) return;
      
      const score = await scoreCandidateCompatibility(candidateId, jobPref);
      
      setCompatibilityScores(prev => ({
        ...prev,
        [candidateId]: score
      }));
    } catch (err) {
      console.error('Error scoring candidate:', err);
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
              
              <button
                onClick={() => setSelectedCandidate(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Compatibility Score */}
            {compatibilityScores[selectedCandidate._id] && (
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-blue-800">Compatibility Score</h3>
                  <span className="text-lg font-bold text-blue-800">
                    {compatibilityScores[selectedCandidate._id].matchScore}%
                  </span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full" 
                    style={{ width: `${compatibilityScores[selectedCandidate._id].matchScore}%` }}
                  ></div>
                </div>
                
                <div className="text-sm">
                  <div className="mb-2">
                    <h4 className="font-medium text-blue-800">Strengths:</h4>
                    <ul className="list-disc list-inside pl-2">
                      {compatibilityScores[selectedCandidate._id].matchingStrengths.map((strength, i) => (
                        <li key={i}>{strength}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="mb-2">
                    <h4 className="font-medium text-blue-800">Gaps:</h4>
                    <ul className="list-disc list-inside pl-2">
                      {compatibilityScores[selectedCandidate._id].gaps.map((gap, i) => (
                        <li key={i}>{gap}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
            
            {/* Skills */}
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
            
            {/* Experience */}
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Experience</h3>
              {selectedCandidate.experience && selectedCandidate.experience.length > 0 ? (
                <div className="space-y-4">
                  {selectedCandidate.experience.map((exp, index) => (
                    <div key={index} className="border-l-2 border-gray-200 pl-4">
                      <h4 className="font-medium">{exp.position}</h4>
                      <p className="text-gray-700">{exp.company}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(exp.startDate).toLocaleDateString()} - 
                        {exp.current ? ' Present' : new Date(exp.endDate).toLocaleDateString()}
                      </p>
                      <p className="text-gray-600 mt-1">{exp.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No experience listed</p>
              )}
            </div>
            
            {/* Education */}
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Education</h3>
              {selectedCandidate.education && selectedCandidate.education.length > 0 ? (
                <div className="space-y-4">
                  {selectedCandidate.education.map((edu, index) => (
                    <div key={index}>
                      <h4 className="font-medium">{edu.degree} in {edu.field}</h4>
                      <p className="text-gray-700">{edu.institution}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(edu.startDate).toLocaleDateString()} - 
                        {edu.current ? ' Present' : new Date(edu.endDate).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No education listed</p>
              )}
            </div>
            
            {/* Target Companies */}
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Target Companies</h3>
              {selectedCandidate.targetCompanies && selectedCandidate.targetCompanies.length > 0 ? (
                <div className="space-y-2">
                  {selectedCandidate.targetCompanies.map((target, index) => (
                    <div key={index} className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-2 ${
                        target.company.toLowerCase() === currentUser?.company?.toLowerCase() 
                          ? 'bg-green-500' 
                          : 'bg-gray-300'
                      }`}></div>
                      <span>
                        {target.company} - {target.position}
                        {target.priority && ` (Priority: ${target.priority})`}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No target companies listed</p>
              )}
            </div>
            
            {/* Roadmap Progress */}
            {selectedCandidate.roadmap && (
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Career Roadmap Progress</h3>
                <div className="bg-gray-100 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-700">Progress</span>
                    <span className="font-medium">
                      {calculateRoadmapProgress(selectedCandidate.roadmap)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-300 rounded-full h-2.5">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full" 
                      style={{ width: `${calculateRoadmapProgress(selectedCandidate.roadmap)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Bookmark Form */}
            <div className="border-t pt-4 mt-4">
              {isBookmarked(selectedCandidate._id) ? (
                <button
                  onClick={() => handleToggleBookmark(selectedCandidate._id)}
                  className="w-full px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                >
                  Remove from Bookmarks
                </button>
              ) : (
                <div>
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
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Add to Bookmarks
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // Calculate roadmap progress
  const calculateRoadmapProgress = (roadmap) => {
    if (!roadmap || !roadmap.milestones || roadmap.milestones.length === 0) {
      return 0;
    }
    
    const completedMilestones = roadmap.milestones.filter(m => m.completed).length;
    return Math.round((completedMilestones / roadmap.milestones.length) * 100);
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
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
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
      </div>
      
      {/* Candidates List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">
            Candidates ({filteredCandidates.length})
          </h2>
        </div>
        
        {filteredCandidates.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No candidates match your filters</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredCandidates.map(candidate => (
              <div 
                key={candidate._id}
                className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors cursor-pointer"
                onClick={() => setSelectedCandidate(candidate)}
              >
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{candidate.name}</h3>
                    
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
                        compatibilityScores[candidate._id].matchScore >= 70
                          ? 'bg-green-100 text-green-800'
                          : compatibilityScores[candidate._id].matchScore >= 40
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                      }`}>
                        {compatibilityScores[candidate._id].matchScore}% Match
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="mt-2 flex justify-between text-sm text-gray-500">
                  <div>
                    Experience: {calculateYearsOfExperience(candidate.experience)} years
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