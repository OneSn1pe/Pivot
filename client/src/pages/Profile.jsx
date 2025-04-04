// Profile.jsx
import React, { useState, useContext, useEffect } from 'react';
import AuthContext from '../contexts/AuthContext';
import UserContext from '../contexts/UserContext';

const Profile = () => {
  const { currentUser } = useContext(AuthContext);
  const { userProfile, updateProfile, loading, error, clearError } = useContext(UserContext);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    // Candidate specific fields
    skills: [],
    education: [],
    experience: [],
    socialLinks: {
      linkedin: '',
      github: '',
      portfolio: ''
    },
    // Recruiter specific fields
    company: '',
    position: '',
    companyDescription: '',
    industry: '',
    companySize: ''
  });
  
  const [newSkill, setNewSkill] = useState({ name: '', level: 'intermediate' });
  const [formErrors, setFormErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  
  // Load user profile data when available
  useEffect(() => {
    if (userProfile) {
      // Set common fields
      setFormData(prev => ({
        ...prev,
        name: userProfile.name || '',
        email: userProfile.email || '',
        socialLinks: userProfile.socialLinks || {
          linkedin: '',
          github: '',
          portfolio: ''
        },
        // Set role-specific fields
        ...(currentUser?.role === 'candidate' ? {
          skills: userProfile.skills || [],
          education: userProfile.education || [],
          experience: userProfile.experience || []
        } : {}),
        ...(currentUser?.role === 'recruiter' ? {
          company: userProfile.company || '',
          position: userProfile.position || '',
          companyDescription: userProfile.companyDescription || '',
          industry: userProfile.industry || '',
          companySize: userProfile.companySize || ''
        } : {})
      }));
    }
  }, [userProfile, currentUser]);
  
  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested socialLinks fields
    if (name.startsWith('socialLinks.')) {
      const socialField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        socialLinks: {
          ...prev.socialLinks,
          [socialField]: value
        }
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
    const { name, value } = e.target;
    setNewSkill(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Add new skill
  const addSkill = () => {
    if (newSkill.name.trim() === '') return;
    
    setFormData(prev => ({
      ...prev,
      skills: [...prev.skills, newSkill]
    }));
    
    // Reset new skill input
    setNewSkill({ name: '', level: 'intermediate' });
  };
  
  // Remove skill
  const removeSkill = (index) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
  };
  
  // Form validation
  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }
    
    // Validate recruiter fields
    if (currentUser?.role === 'recruiter') {
      if (!formData.company.trim()) {
        errors.company = 'Company name is required';
      }
      
      if (!formData.position.trim()) {
        errors.position = 'Position is required';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous messages
    setSuccessMessage('');
    clearError();
    
    if (!validateForm()) return;
    
    try {
      await updateProfile(formData);
      setSuccessMessage('Profile updated successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      console.error('Profile update error:', err);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        {currentUser?.role === 'candidate' ? 'Candidate Profile' : 'Recruiter Profile'}
      </h1>
      
      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {successMessage}
        </div>
      )}
      
      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit}>
          {/* Common Fields Section */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
            
            {/* Name */}
            <div className="mb-4">
              <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  formErrors.name ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {formErrors.name && (
                <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
              )}
            </div>
            
            {/* Email (Read-only) */}
            <div className="mb-4">
              <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                readOnly
                disabled
                className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50"
              />
              <p className="text-gray-500 text-sm mt-1">Email cannot be changed</p>
            </div>
            
            {/* Social Links */}
            <div className="mb-4">
              <h3 className="font-medium mb-2">Social Links</h3>
              
              {/* LinkedIn */}
              <div className="mb-3">
                <label htmlFor="socialLinks.linkedin" className="block text-gray-700 text-sm mb-1">
                  LinkedIn Profile
                </label>
                <input
                  type="url"
                  id="socialLinks.linkedin"
                  name="socialLinks.linkedin"
                  value={formData.socialLinks.linkedin}
                  onChange={handleChange}
                  placeholder="https://linkedin.com/in/username"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              {/* GitHub */}
              <div className="mb-3">
                <label htmlFor="socialLinks.github" className="block text-gray-700 text-sm mb-1">
                  GitHub Profile
                </label>
                <input
                  type="url"
                  id="socialLinks.github"
                  name="socialLinks.github"
                  value={formData.socialLinks.github}
                  onChange={handleChange}
                  placeholder="https://github.com/username"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              {/* Portfolio */}
              <div>
                <label htmlFor="socialLinks.portfolio" className="block text-gray-700 text-sm mb-1">
                  Portfolio Website
                </label>
                <input
                  type="url"
                  id="socialLinks.portfolio"
                  name="socialLinks.portfolio"
                  value={formData.socialLinks.portfolio}
                  onChange={handleChange}
                  placeholder="https://yourportfolio.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
          
          {/* Candidate-specific Fields */}
          {currentUser?.role === 'candidate' && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4">Skills</h2>
              
              {/* Skills List */}
              <div className="mb-4">
                {formData.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {formData.skills.map((skill, index) => (
                      <div key={index} className="flex items-center bg-blue-50 px-3 py-1 rounded-full">
                        <span>{skill.name}</span>
                        <span className="mx-1 text-gray-400">|</span>
                        <span className="text-xs text-gray-600">{skill.level}</span>
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
                ) : (
                  <p className="text-gray-500 mb-4">No skills added yet.</p>
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
                      placeholder="e.g., JavaScript, Python, React"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  
                  <button
                    type="button"
                    onClick={addSkill}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Add
                  </button>
                </div>
              </div>
              
              {/* Note: Education and Experience sections would be added here */}
              {/* These are more complex forms that would make this example too long */}
              <p className="text-gray-500 italic">
                To add education and experience entries, please visit the detailed profile editor.
              </p>
            </div>
          )}
          
          {/* Recruiter-specific Fields */}
          {currentUser?.role === 'recruiter' && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4">Company Information</h2>
              
              {/* Company Name */}
              <div className="mb-4">
                <label htmlFor="company" className="block text-gray-700 font-medium mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formErrors.company ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {formErrors.company && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.company}</p>
                )}
              </div>
              
              {/* Position */}
              <div className="mb-4">
                <label htmlFor="position" className="block text-gray-700 font-medium mb-2">
                  Your Position
                </label>
                <input
                  type="text"
                  id="position"
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formErrors.position ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {formErrors.position && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.position}</p>
                )}
              </div>
              
              {/* Company Description */}
              <div className="mb-4">
                <label htmlFor="companyDescription" className="block text-gray-700 font-medium mb-2">
                  Company Description
                </label>
                <textarea
                  id="companyDescription"
                  name="companyDescription"
                  value={formData.companyDescription}
                  onChange={handleChange}
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Tell candidates about your company..."
                ></textarea>
              </div>
              
              {/* Industry */}
              <div className="mb-4">
                <label htmlFor="industry" className="block text-gray-700 font-medium mb-2">
                  Industry
                </label>
                <input
                  type="text"
                  id="industry"
                  name="industry"
                  value={formData.industry}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Technology, Finance, Healthcare"
                />
              </div>
              
              {/* Company Size */}
              <div className="mb-4">
                <label htmlFor="companySize" className="block text-gray-700 font-medium mb-2">
                  Company Size
                </label>
                <select
                  id="companySize"
                  name="companySize"
                  value={formData.companySize}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select size</option>
                  <option value="startup">Startup (1-10 employees)</option>
                  <option value="small">Small (11-50 employees)</option>
                  <option value="medium">Medium (51-200 employees)</option>
                  <option value="large">Large (201-1000 employees)</option>
                  <option value="enterprise">Enterprise (1000+ employees)</option>
                </select>
              </div>
            </div>
          )}
          
          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className={`bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg ${
                loading 
                  ? 'opacity-70 cursor-not-allowed' 
                  : 'hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
              }`}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;