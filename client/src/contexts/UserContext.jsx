import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';
import AuthContext from './AuthContext';

// Create context
export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const { currentUser } = useContext(AuthContext);
  const [userProfile, setUserProfile] = useState(null);
  const [resume, setResume] = useState(null);
  const [roadmap, setRoadmap] = useState(null);
  const [targetCompanies, setTargetCompanies] = useState([]);
  const [jobPreferences, setJobPreferences] = useState([]);
  const [bookmarkedCandidates, setBookmarkedCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch user profile when currentUser changes
  useEffect(() => {
    if (currentUser) {
      fetchUserProfile();
    } else {
      // Reset state when logged out
      setUserProfile(null);
      setResume(null);
      setRoadmap(null);
      setTargetCompanies([]);
      setJobPreferences([]);
      setBookmarkedCandidates([]);
    }
  }, [currentUser]);

  // Fetch user profile based on role
  const fetchUserProfile = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    try {
      let response;
      
      if (currentUser.role === 'candidate') {
        response = await api.get('/candidates/profile');
        setUserProfile(response.data);
        setTargetCompanies(response.data.targetCompanies || []);
        
        // Fetch resume if exists
        if (response.data.resume) {
          const resumeResponse = await api.get('/candidates/resume');
          setResume(resumeResponse.data);
        }
        
        // Fetch roadmap if exists
        if (response.data.roadmap) {
          const roadmapResponse = await api.get('/candidates/roadmap');
          setRoadmap(roadmapResponse.data);
        }
      } else if (currentUser.role === 'recruiter') {
        response = await api.get('/recruiters/profile');
        setUserProfile(response.data);
        setBookmarkedCandidates(response.data.bookmarkedCandidates || []);
        
        // Fetch job preferences
        const preferencesResponse = await api.get('/recruiters/job-preferences');
        setJobPreferences(preferencesResponse.data);
      }
    } catch (err) {
      console.error('Fetch user profile error:', err);
      setError(err.response?.data?.message || 'Failed to fetch user profile');
    } finally {
      setLoading(false);
    }
  };

  // Update user profile
  const updateProfile = async (profileData) => {
    if (!currentUser) return;
    
    setLoading(true);
    try {
      let response;
      
      if (currentUser.role === 'candidate') {
        response = await api.put('/candidates/profile', profileData);
      } else if (currentUser.role === 'recruiter') {
        response = await api.put('/recruiters/profile', profileData);
      }
      
      setUserProfile(response.data);
      return response.data;
    } catch (err) {
      console.error('Update profile error:', err);
      setError(err.response?.data?.message || 'Failed to update profile');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Upload resume (candidate only)
  const uploadResume = async (formData) => {
    if (!currentUser || currentUser.role !== 'candidate') return;
    
    setLoading(true);
    try {
      // Our api.js now handles FormData content-type automatically
      const response = await api.post('/candidates/resume', formData);
      setResume(response.data);
      return response.data;
    } catch (err) {
      console.error('Resume upload error:', err);
      setError(err.response?.data?.message || 'Failed to upload resume');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update target companies (candidate only)
  const updateTargetCompanies = async (companies, regenerateRoadmap = false) => {
    if (!currentUser || currentUser.role !== 'candidate') return;
    
    setLoading(true);
    try {
      const response = await api.put('/candidates/target-companies', { 
        targetCompanies: companies,
        regenerateRoadmap
      });
      setTargetCompanies(companies || []);
      return response.data;
    } catch (err) {
      console.error('Update target companies error:', err);
      setError(err.response?.data?.message || 'Failed to update target companies');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Generate roadmap (candidate only)
  const generateRoadmap = async () => {
    if (!currentUser || currentUser.role !== 'candidate') return;
    
    setLoading(true);
    try {
      const response = await api.post('/candidates/roadmap');
      setRoadmap(response.data);
      return response.data;
    } catch (err) {
      console.error('Generate roadmap error:', err);
      setError(err.response?.data?.message || 'Failed to generate roadmap');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update milestone status (candidate only)
  const updateMilestoneStatus = async (milestoneIndex, completed) => {
    if (!currentUser || currentUser.role !== 'candidate') return;
    
    setLoading(true);
    try {
      const response = await api.put('/candidates/roadmap/milestone', {
        milestoneIndex,
        completed
      });
      setRoadmap(response.data);
      return response.data;
    } catch (err) {
      console.error('Update milestone status error:', err);
      setError(err.response?.data?.message || 'Failed to update milestone');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Create job preference (recruiter only)
  const createJobPreference = async (preferenceData) => {
    if (!currentUser || currentUser.role !== 'recruiter') return;
    
    setLoading(true);
    clearError();
    
    try {
      console.log('Creating job preference:', preferenceData);
      const response = await api.post('/recruiters/job-preferences', preferenceData);
      console.log('Job preference created:', response.data);
      
      // Update the local state
      setJobPreferences(prevPreferences => [...prevPreferences, response.data]);
      
      // Also refresh the entire profile to ensure all related data is updated
      await fetchUserProfile();
      
      return response.data;
    } catch (err) {
      console.error('Create job preference error:', err);
      setError(err.response?.data?.message || 'Failed to create job preference');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update job preference (recruiter only)
  const updateJobPreference = async (id, preferenceData) => {
    if (!currentUser || currentUser.role !== 'recruiter') return;
    
    setLoading(true);
    clearError();
    
    try {
      console.log('Updating job preference:', id, preferenceData);
      const response = await api.put(`/recruiters/job-preferences/${id}`, preferenceData);
      console.log('Job preference updated:', response.data);
      
      // Update the local state
      setJobPreferences(prevPreferences => 
        prevPreferences.map(pref => 
          pref._id === id ? response.data : pref
        )
      );
      
      return response.data;
    } catch (err) {
      console.error('Update job preference error:', err);
      setError(err.response?.data?.message || 'Failed to update job preference');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete job preference (recruiter only)
  const deleteJobPreference = async (id) => {
    if (!currentUser || currentUser.role !== 'recruiter') return;
    
    setLoading(true);
    clearError();
    
    try {
      console.log('Deleting job preference:', id);
      await api.delete(`/recruiters/job-preferences/${id}`);
      
      // Update the local state
      setJobPreferences(prevPreferences => 
        prevPreferences.filter(pref => pref._id !== id)
      );
      
      return true;
    } catch (err) {
      console.error('Delete job preference error:', err);
      setError(err.response?.data?.message || 'Failed to delete job preference');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Bookmark candidate (recruiter only)
  const bookmarkCandidate = async (candidateId, notes) => {
    if (!currentUser || currentUser.role !== 'recruiter') return;
    
    setLoading(true);
    try {
      await api.post('/recruiters/bookmark', { candidateId, notes });
      // Refresh profile to get updated bookmarks
      fetchUserProfile();
    } catch (err) {
      console.error('Bookmark candidate error:', err);
      setError(err.response?.data?.message || 'Failed to bookmark candidate');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Remove bookmark (recruiter only)
  const removeBookmark = async (candidateId) => {
    if (!currentUser || currentUser.role !== 'recruiter') return;
    
    setLoading(true);
    try {
      await api.delete(`/recruiters/bookmark/${candidateId}`);
      // Refresh profile to get updated bookmarks
      fetchUserProfile();
    } catch (err) {
      console.error('Remove bookmark error:', err);
      setError(err.response?.data?.message || 'Failed to remove bookmark');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Clear error
  const clearError = () => setError(null);

  // Refresh all data
  const refreshData = () => {
    fetchUserProfile();
  };

  // Context value
  const value = {
    userProfile,
    resume,
    roadmap,
    targetCompanies,
    jobPreferences,
    bookmarkedCandidates,
    loading,
    error,
    updateProfile,
    uploadResume,
    updateTargetCompanies,
    generateRoadmap,
    updateMilestoneStatus,
    createJobPreference,
    updateJobPreference,
    deleteJobPreference,
    bookmarkCandidate,
    removeBookmark,
    clearError,
    refreshData
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;