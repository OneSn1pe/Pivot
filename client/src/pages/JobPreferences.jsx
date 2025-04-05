// JobPreferences.jsx
import React, { useState, useEffect, useContext } from 'react';
import AuthContext from '../contexts/AuthContext';
import UserContext from '../contexts/UserContext';
import { analyzeJobDescription } from '../services/gpt';

const JobPreferences = () => {
  const { currentUser } = useContext(AuthContext);
  const { 
    jobPreferences, 
    createJobPreference, 
    updateJobPreference,
    deleteJobPreference,
    loading, 
    error, 
    clearError 
  } = useContext(UserContext);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingPreferenceId, setEditingPreferenceId] = useState(null);
  const [selectedPreference, setSelectedPreference] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [formData, setFormData] = useState({
    position: '',
    department: '',
    experience: {
      min: '',
      max: ''
    },
    keySkills: [],
    educationRequirements: [],
    certifications: [],
    jobDescription: '',
    responsibilities: [],
    location: '',
    remote: false,
    salaryRange: {
      min: '',
      max: '',
      currency: 'USD'
    }
  });
  
  const [newSkill, setNewSkill] = useState({ name: '', level: 'intermediate', required: true });
  const [newEducation, setNewEducation] = useState({ degree: '', field: '', required: true });
  const [newCertification, setNewCertification] = useState({ name: '', required: false });
  const [newResponsibility, setNewResponsibility] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Handle edit preference
  const handleEditPreference = (preference) => {
    setFormData({
      position: preference.position || '',
      department: preference.department || '',
      experience: {
        min: preference.experience?.min || '',
        max: preference.experience?.max || ''
      },
      keySkills: preference.keySkills || [],
      educationRequirements: preference.educationRequirements || [],
      certifications: preference.certifications || [],
      jobDescription: preference.jobDescription || '',
      responsibilities: preference.responsibilities || [],
      location: preference.location || '',
      remote: preference.remote || false,
      salaryRange: {
        min: preference.salaryRange?.min || '',
        max: preference.salaryRange?.max || '',
        currency: preference.salaryRange?.currency || 'USD'
      }
    });
    setEditingPreferenceId(preference._id);
    setIsEditMode(true);
    setIsFormOpen(true);
  };

  // Handle view details
  const handleViewDetails = (preference) => {
    setSelectedPreference(preference);
    setShowDetailsModal(true);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = (id) => {
    setDeleteId(id);
    setShowDeleteConfirm(true);
  };

  // Handle actual delete
  const handleDelete = async () => {
    try {
      await deleteJobPreference(deleteId);
      setSuccessMessage('Candidate preference deleted successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
      setShowDeleteConfirm(false);
      setDeleteId(null);
    } catch (err) {
      console.error('Failed to delete preference:', err);
    }
  };
  
  // Clear form data
  const clearForm = () => {
    setFormData({
      position: '',
      department: '',
      experience: {
        min: '',
        max: ''
      },
      keySkills: [],
      educationRequirements: [],
      certifications: [],
      jobDescription: '',
      responsibilities: [],
      location: '',
      remote: false,
      salaryRange: {
        min: '',
        max: '',
        currency: 'USD'
      }
    });
    setIsEditMode(false);
    setEditingPreferenceId(null);
  };
  
  // Handle form input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      // Handle nested fields (e.g., experience.min)
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'number' ? (value === '' ? '' : Number(value)) : value
        }
      }));
    } else if (type === 'checkbox') {
      // Handle checkbox
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      // Handle regular fields
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  // Handle skill input change
  const handleSkillChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewSkill(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  // Add new skill
  const addSkill = () => {
    if (newSkill.name.trim() === '') return;
    
    setFormData(prev => ({
      ...prev,
      keySkills: [...prev.keySkills, newSkill]
    }));
    
    // Reset new skill input
    setNewSkill({ name: '', level: 'intermediate', required: true });
  };
  
  // Remove skill
  const removeSkill = (index) => {
    setFormData(prev => ({
      ...prev,
      keySkills: prev.keySkills.filter((_, i) => i !== index)
    }));
  };
  
  // Handle education input change
  const handleEducationChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewEducation(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  // Add new education requirement
  const addEducation = () => {
    if (newEducation.degree.trim() === '') return;
    
    setFormData(prev => ({
      ...prev,
      educationRequirements: [...prev.educationRequirements, newEducation]
    }));
    
    // Reset new education input
    setNewEducation({ degree: '', field: '', required: true });
  };
  
  // Remove education
  const removeEducation = (index) => {
    setFormData(prev => ({
      ...prev,
      educationRequirements: prev.educationRequirements.filter((_, i) => i !== index)
    }));
  };
  
  // Handle certification input change
  const handleCertificationChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewCertification(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  // Add new certification
  const addCertification = () => {
    if (newCertification.name.trim() === '') return;
    
    setFormData(prev => ({
      ...prev,
      certifications: [...prev.certifications, newCertification]
    }));
    
    // Reset new certification input
    setNewCertification({ name: '', required: false });
  };
  
  // Remove certification
  const removeCertification = (index) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index)
    }));
  };
  
  // Add new responsibility
  const addResponsibility = () => {
    if (newResponsibility.trim() === '') return;
    
    setFormData(prev => ({
      ...prev,
      responsibilities: [...prev.responsibilities, newResponsibility]
    }));
    
    // Reset new responsibility input
    setNewResponsibility('');
  };
  
  // Remove responsibility
  const removeResponsibility = (index) => {
    setFormData(prev => ({
      ...prev,
      responsibilities: prev.responsibilities.filter((_, i) => i !== index)
    }));
  };
  
  // Analyze job description with AI
  const handleAnalyzeDescription = async () => {
    if (!formData.jobDescription.trim()) return;
    
    setIsAnalyzing(true);
    clearError();
    
    try {
      // Call GPT service to analyze job description
      const analysis = await analyzeJobDescription(formData.jobDescription);
      
      // Update form with analyzed data
      setFormData(prev => ({
        ...prev,
        keySkills: [
          ...prev.keySkills,
          ...analysis.requiredSkills.filter(skill => 
            !prev.keySkills.some(s => s.name.toLowerCase() === skill.name.toLowerCase())
          ),
          ...analysis.preferredSkills.filter(skill => 
            !prev.keySkills.some(s => s.name.toLowerCase() === skill.name.toLowerCase())
          )
        ],
        educationRequirements: [
          ...prev.educationRequirements,
          ...analysis.educationRequirements.filter(edu => 
            !prev.educationRequirements.some(e => 
              e.degree.toLowerCase() === edu.degree.toLowerCase() && 
              e.field.toLowerCase() === edu.field.toLowerCase()
            )
          )
        ],
        responsibilities: [
          ...prev.responsibilities,
          ...analysis.responsibilities.filter(resp => 
            !prev.responsibilities.includes(resp)
          )
        ],
        experience: {
          min: prev.experience.min || analysis.experienceRequired?.min || '',
          max: prev.experience.max || analysis.experienceRequired?.max || ''
        }
      }));
      
    } catch (err) {
      console.error('Job description analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  // Update the handleSubmit function to support both create and update
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Prepare the data for submission
      const preferenceData = {
        ...formData,
        // Convert string numbers to actual numbers
        experience: {
          min: formData.experience.min !== '' ? Number(formData.experience.min) : undefined,
          max: formData.experience.max !== '' ? Number(formData.experience.max) : undefined
        },
        salaryRange: {
          min: formData.salaryRange.min !== '' ? Number(formData.salaryRange.min) : undefined,
          max: formData.salaryRange.max !== '' ? Number(formData.salaryRange.max) : undefined,
          currency: formData.salaryRange.currency
        }
      };
      
      if (isEditMode) {
        await updateJobPreference(editingPreferenceId, preferenceData);
        setSuccessMessage('Candidate preference updated successfully');
      } else {
        await createJobPreference(preferenceData);
        setSuccessMessage('Candidate preference created successfully');
      }
      
      // Close form and reset state
      setIsFormOpen(false);
      clearForm();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Failed to save preference:', err);
    }
  };
  
  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Candidate Preferences</h1>
      
      {/* Show success message if present */}
      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 text-green-800 rounded">
          {successMessage}
        </div>
      )}
      
      {/* Show error if present */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-800 rounded">
          {error}
          <button 
            onClick={clearError}
            className="ml-2 text-red-700 hover:text-red-900"
          >
            ✕
          </button>
        </div>
      )}
      
      {/* Main content */}
      <div className="flex justify-between items-center mb-4">
        <p className="text-gray-600">
          Define the qualities you're looking for in candidates to improve your talent search.
        </p>
        <button
          onClick={() => {
            setIsFormOpen(true);
            clearForm();
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          disabled={loading}
        >
          Add New Preference
        </button>
      </div>
      
      {/* Create/Edit Form */}
      {isFormOpen && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-semibold">
              {isEditMode ? 'Edit Candidate Preference' : 'Create Candidate Preference'}
            </h2>
            <button
              onClick={() => {
                setIsFormOpen(false);
                clearForm();
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <form onSubmit={handleSubmit}>
            {/* Basic Information */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Position */}
                <div>
                  <label htmlFor="position" className="block text-gray-700 font-medium mb-2">
                    Position <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="position"
                    name="position"
                    value={formData.position}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Senior Software Engineer"
                    required
                  />
                </div>
                
                {/* Department */}
                <div>
                  <label htmlFor="department" className="block text-gray-700 font-medium mb-2">
                    Department
                  </label>
                  <input
                    type="text"
                    id="department"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Engineering"
                  />
                </div>
              </div>
            </div>
            
            {/* Experience */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Experience</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Min Experience */}
                <div>
                  <label htmlFor="experience.min" className="block text-gray-700 font-medium mb-2">
                    Minimum Years
                  </label>
                  <input
                    type="number"
                    id="experience.min"
                    name="experience.min"
                    value={formData.experience.min}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                    min="0"
                  />
                </div>
                
                {/* Max Experience */}
                <div>
                  <label htmlFor="experience.max" className="block text-gray-700 font-medium mb-2">
                    Maximum Years
                  </label>
                  <input
                    type="number"
                    id="experience.max"
                    name="experience.max"
                    value={formData.experience.max}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="10+"
                    min="0"
                  />
                </div>
              </div>
            </div>
            
            {/* Location */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Location</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Location */}
                <div>
                  <label htmlFor="location" className="block text-gray-700 font-medium mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., San Francisco, CA"
                  />
                </div>
                
                {/* Remote */}
                <div className="flex items-center h-full mt-8">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="remote"
                      checked={formData.remote}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 rounded"
                    />
                    <span className="ml-2">Remote work available</span>
                  </label>
                </div>
              </div>
            </div>
            
            {/* Salary Range */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Salary Range</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Min Salary */}
                <div>
                  <label htmlFor="salaryRange.min" className="block text-gray-700 font-medium mb-2">
                    Minimum Salary
                  </label>
                  <input
                    type="number"
                    id="salaryRange.min"
                    name="salaryRange.min"
                    value={formData.salaryRange.min}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="80000"
                    min="0"
                  />
                </div>
                
                {/* Max Salary */}
                <div>
                  <label htmlFor="salaryRange.max" className="block text-gray-700 font-medium mb-2">
                    Maximum Salary
                  </label>
                  <input
                    type="number"
                    id="salaryRange.max"
                    name="salaryRange.max"
                    value={formData.salaryRange.max}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="120000"
                    min="0"
                  />
                </div>
                
                {/* Currency */}
                <div>
                  <label htmlFor="salaryRange.currency" className="block text-gray-700 font-medium mb-2">
                    Currency
                  </label>
                  <select
                    id="salaryRange.currency"
                    name="salaryRange.currency"
                    value={formData.salaryRange.currency}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="CAD">CAD</option>
                    <option value="AUD">AUD</option>
                  </select>
                </div>
              </div>
            </div>
            
            {/* Job Description */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold">Job Description</h3>
                <button
                  type="button"
                  onClick={handleAnalyzeDescription}
                  disabled={!formData.jobDescription.trim() || isAnalyzing}
                  className={`text-sm px-3 py-1 rounded ${
                    !formData.jobDescription.trim() || isAnalyzing
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  }`}
                >
                  {isAnalyzing ? 'Analyzing...' : 'Analyze with AI'}
                </button>
              </div>
              <textarea
                id="jobDescription"
                name="jobDescription"
                value={formData.jobDescription}
                onChange={handleChange}
                rows="6"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Paste your job description here to automatically extract skills, education, and responsibilities using AI..."
              ></textarea>
            </div>
            
            {/* Skills */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Skills</h3>
              
              {/* Skills List */}
              {formData.keySkills.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm text-gray-600 mb-2">Added Skills:</h4>
                  <div className="flex flex-wrap gap-2">
                    {formData.keySkills.map((skill, index) => (
                      <div key={index} className="flex items-center bg-blue-50 px-3 py-1 rounded-full">
                        <span>{skill.name}</span>
                        <span className="mx-1 text-gray-400">|</span>
                        <span className="text-xs text-gray-600">{skill.level}</span>
                        {skill.required && (
                          <span className="ml-1 text-xs text-red-600">*</span>
                        )}
                        <button
                          type="button"
                          onClick={() => removeSkill(index)}
                          className="ml-2 text-red-500 hover:text-red-700"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Add New Skill */}
              <div className="flex items-end space-x-2">
                <div className="flex-1">
                  <label htmlFor="skillName" className="block text-gray-700 text-sm mb-1">
                    Skill Name
                  </label>
                  <input
                    type="text"
                    id="skillName"
                    name="name"
                    value={newSkill.name}
                    onChange={handleSkillChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., JavaScript, React, Python"
                  />
                </div>
                
                <div className="w-40">
                  <label htmlFor="skillLevel" className="block text-gray-700 text-sm mb-1">
                    Level
                  </label>
                  <select
                    id="skillLevel"
                    name="level"
                    value={newSkill.level}
                    onChange={handleSkillChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="expert">Expert</option>
                  </select>
                </div>
                
                <div className="w-24">
                  <label className="flex items-center text-gray-700 text-sm mb-1">
                    <input
                      type="checkbox"
                      name="required"
                      checked={newSkill.required}
                      onChange={handleSkillChange}
                      className="h-4 w-4 text-blue-600 rounded"
                    />
                    <span className="ml-2">Required</span>
                  </label>
                </div>
                
                <button
                  type="button"
                  onClick={addSkill}
                  disabled={!newSkill.name.trim()}
                  className={`px-4 py-2 rounded-lg ${
                    !newSkill.name.trim()
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  Add
                </button>
              </div>
            </div>
            
            {/* Education Requirements */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Education Requirements</h3>
              
              {/* Education List */}
              {formData.educationRequirements.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm text-gray-600 mb-2">Added Education Requirements:</h4>
                  <div className="space-y-2">
                    {formData.educationRequirements.map((edu, index) => (
                      <div key={index} className="flex items-center bg-blue-50 px-3 py-2 rounded">
                        <div>
                          <span className="font-medium">{edu.degree}</span>
                          {edu.field && (
                            <span> in {edu.field}</span>
                          )}
                          {edu.required && (
                            <span className="ml-1 text-xs text-red-600">*</span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeEducation(index)}
                          className="ml-auto text-red-500 hover:text-red-700"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Add New Education */}
              <div className="flex items-end space-x-2">
                <div className="flex-1">
                  <label htmlFor="degree" className="block text-gray-700 text-sm mb-1">
                    Degree
                  </label>
                  <input
                    type="text"
                    id="degree"
                    name="degree"
                    value={newEducation.degree}
                    onChange={handleEducationChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Bachelor's, Master's, PhD"
                  />
                </div>
                
                <div className="flex-1">
                  <label htmlFor="field" className="block text-gray-700 text-sm mb-1">
                    Field
                  </label>
                  <input
                    type="text"
                    id="field"
                    name="field"
                    value={newEducation.field}
                    onChange={handleEducationChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Computer Science, Engineering"
                  />
                </div>
                
                <div className="w-24">
                  <label className="flex items-center text-gray-700 text-sm mb-1">
                    <input
                      type="checkbox"
                      name="required"
                      checked={newEducation.required}
                      onChange={handleEducationChange}
                      className="h-4 w-4 text-blue-600 rounded"
                    />
                    <span className="ml-2">Required</span>
                  </label>
                </div>
                
                <button
                  type="button"
                  onClick={addEducation}
                  disabled={!newEducation.degree.trim()}
                  className={`px-4 py-2 rounded-lg ${
                    !newEducation.degree.trim()
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  Add
                </button>
              </div>
            </div>
            
            {/* Certifications */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Certifications</h3>
              
              {/* Certifications List */}
              {formData.certifications.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm text-gray-600 mb-2">Added Certifications:</h4>
                  <div className="flex flex-wrap gap-2">
                    {formData.certifications.map((cert, index) => (
                      <div key={index} className="flex items-center bg-purple-50 px-3 py-1 rounded-full">
                        <span>{cert.name}</span>
                        {cert.required && (
                          <span className="ml-1 text-xs text-red-600">*</span>
                        )}
                        <button
                          type="button"
                          onClick={() => removeCertification(index)}
                          className="ml-2 text-red-500 hover:text-red-700"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Add New Certification */}
              <div className="flex items-end space-x-2">
                <div className="flex-1">
                  <label htmlFor="certName" className="block text-gray-700 text-sm mb-1">
                    Certification Name
                  </label>
                  <input
                    type="text"
                    id="certName"
                    name="name"
                    value={newCertification.name}
                    onChange={handleCertificationChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., AWS Certified Solutions Architect"
                  />
                </div>
                
                <div className="w-24">
                  <label className="flex items-center text-gray-700 text-sm mb-1">
                    <input
                      type="checkbox"
                      name="required"
                      checked={newCertification.required}
                      onChange={handleCertificationChange}
                      className="h-4 w-4 text-blue-600 rounded"
                    />
                    <span className="ml-2">Required</span>
                  </label>
                </div>
                
                <button
                  type="button"
                  onClick={addCertification}
                  disabled={!newCertification.name.trim()}
                  className={`px-4 py-2 rounded-lg ${
                    !newCertification.name.trim()
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  Add
                </button>
              </div>
            </div>
            
            {/* Responsibilities */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Responsibilities</h3>
              
              {/* Responsibilities List */}
              {formData.responsibilities.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm text-gray-600 mb-2">Added Responsibilities:</h4>
                  <div className="space-y-2">
                    {formData.responsibilities.map((resp, index) => (
                      <div key={index} className="flex items-center bg-gray-100 px-3 py-2 rounded">
                        <span>{resp}</span>
                        <button
                          type="button"
                          onClick={() => removeResponsibility(index)}
                          className="ml-auto text-red-500 hover:text-red-700"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Add New Responsibility */}
              <div className="flex items-end space-x-2">
                <div className="flex-1">
                  <label htmlFor="responsibility" className="block text-gray-700 text-sm mb-1">
                    Responsibility
                  </label>
                  <input
                    type="text"
                    id="responsibility"
                    value={newResponsibility}
                    onChange={(e) => setNewResponsibility(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Design and implement new features"
                  />
                </div>
                
                <button
                  type="button"
                  onClick={addResponsibility}
                  disabled={!newResponsibility.trim()}
                  className={`px-4 py-2 rounded-lg ${
                    !newResponsibility.trim()
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  Add
                </button>
              </div>
            </div>
            
            {/* Form Buttons */}
            <div className="flex justify-end space-x-4 mt-8">
              <button
                type="button"
                onClick={() => {
                  setIsFormOpen(false);
                  clearForm();
                }}
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!formData.position.trim() || loading}
                className={`px-6 py-2 rounded-lg ${
                  !formData.position.trim() || loading
                    ? 'bg-blue-300 text-white cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {loading ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Preference' : 'Create Preference')}
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Preferences List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Your Candidate Preferences</h2>
        
        {jobPreferences && jobPreferences.length > 0 ? (
          <div className="space-y-4">
            {jobPreferences.map((preference, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{preference.position}</h3>
                    <p className="text-gray-600">
                      {preference.department && `${preference.department} • `}
                      {preference.location && `${preference.location} • `}
                      {preference.remote ? 'Remote • ' : ''}
                      {preference.experience?.min && preference.experience?.max
                        ? `${preference.experience.min}-${preference.experience.max} years`
                        : preference.experience?.min
                        ? `${preference.experience.min}+ years`
                        : preference.experience?.max
                        ? `Up to ${preference.experience.max} years`
                        : ''}
                    </p>
                  </div>
                  <div>
                    <span className={`px-2 py-1 rounded text-xs ${
                      preference.status === 'active' ? 'bg-green-100 text-green-800' : 
                      preference.status === 'filled' ? 'bg-blue-100 text-blue-800' : 
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {preference.status}
                    </span>
                  </div>
                </div>
                
                {/* Skills */}
                {preference.keySkills && preference.keySkills.length > 0 && (
                  <div className="mt-3">
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Skills:</h4>
                    <div className="flex flex-wrap gap-2">
                      {preference.keySkills.map((skill, skillIndex) => (
                        <span 
                          key={skillIndex} 
                          className={`text-xs px-2 py-1 rounded-full ${
                            skill.required 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {skill.name} 
                          {skill.level && `(${skill.level})`}
                          {skill.required && '*'}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Salary Range */}
                {preference.salaryRange?.min || preference.salaryRange?.max ? (
                  <div className="mt-3">
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Salary Range:</h4>
                    <p className="text-sm">
                      {preference.salaryRange.min && preference.salaryRange.max
                        ? `${preference.salaryRange.currency} ${preference.salaryRange.min.toLocaleString()} - ${preference.salaryRange.max.toLocaleString()}`
                        : preference.salaryRange.min
                        ? `${preference.salaryRange.currency} ${preference.salaryRange.min.toLocaleString()}+`
                        : `Up to ${preference.salaryRange.currency} ${preference.salaryRange.max.toLocaleString()}`}
                    </p>
                  </div>
                ) : null}
                
                {/* Actions */}
                <div className="mt-4 flex justify-end space-x-2">
                  <button 
                    onClick={() => handleEditPreference(preference)}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleViewDetails(preference)}
                    className="text-sm text-gray-600 hover:text-gray-800"
                  >
                    View Details
                  </button>
                  <button 
                    onClick={() => handleDeleteConfirm(preference._id)}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">You haven't created any candidate preferences yet.</p>
            <button
              onClick={() => setIsFormOpen(true)}
              className="px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
            >
              Create Your First Candidate Preference
            </button>
          </div>
        )}
      </div>

      {/* View Details Modal */}
      {showDetailsModal && selectedPreference && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold">{selectedPreference.position}</h3>
              <button 
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-700">Basic Information</h4>
                <div className="mt-2 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Department</p>
                    <p>{selectedPreference.department || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p>{selectedPreference.location || 'Not specified'} {selectedPreference.remote ? '(Remote)' : ''}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Experience</p>
                    <p>
                      {selectedPreference.experience?.min && selectedPreference.experience?.max
                        ? `${selectedPreference.experience.min}-${selectedPreference.experience.max} years`
                        : selectedPreference.experience?.min
                        ? `${selectedPreference.experience.min}+ years`
                        : selectedPreference.experience?.max
                        ? `Up to ${selectedPreference.experience.max} years`
                        : 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Salary Range</p>
                    <p>
                      {selectedPreference.salaryRange?.min && selectedPreference.salaryRange?.max
                        ? `${selectedPreference.salaryRange.currency} ${selectedPreference.salaryRange.min.toLocaleString()} - ${selectedPreference.salaryRange.max.toLocaleString()}`
                        : selectedPreference.salaryRange?.min
                        ? `${selectedPreference.salaryRange.currency} ${selectedPreference.salaryRange.min.toLocaleString()}+`
                        : selectedPreference.salaryRange?.max
                        ? `Up to ${selectedPreference.salaryRange.currency} ${selectedPreference.salaryRange.max.toLocaleString()}`
                        : 'Not specified'}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Skills */}
              {selectedPreference.keySkills && selectedPreference.keySkills.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-700">Required Skills</h4>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedPreference.keySkills.map((skill, index) => (
                      <span 
                        key={index} 
                        className={`text-sm px-2 py-1 rounded-full ${
                          skill.required 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {skill.name} 
                        {skill.level && `(${skill.level})`}
                        {skill.required && ' *'}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Education */}
              {selectedPreference.educationRequirements && selectedPreference.educationRequirements.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-700">Education Requirements</h4>
                  <div className="mt-2">
                    {selectedPreference.educationRequirements.map((edu, index) => (
                      <div key={index} className="mb-2">
                        <p>
                          {edu.degree} in {edu.field}
                          {edu.required && ' (Required)'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Responsibilities */}
              {selectedPreference.responsibilities && selectedPreference.responsibilities.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-700">Responsibilities</h4>
                  <ul className="mt-2 list-disc list-inside">
                    {selectedPreference.responsibilities.map((resp, index) => (
                      <li key={index}>{resp}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Job Description */}
              {selectedPreference.jobDescription && (
                <div>
                  <h4 className="font-medium text-gray-700">Job Description</h4>
                  <p className="mt-2 whitespace-pre-line">{selectedPreference.jobDescription}</p>
                </div>
              )}
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  handleEditPreference(selectedPreference);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Edit
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Confirm Deletion</h3>
            <p>Are you sure you want to delete this candidate preference? This action cannot be undone.</p>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobPreferences;