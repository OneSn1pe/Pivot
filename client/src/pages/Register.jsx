import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../contexts/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'candidate',
    company: '',
    position: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register, error, clearError, currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  
  // Redirect if already logged in
  useEffect(() => {
    if (currentUser) {
      const redirectPath = currentUser.role === 'candidate' 
        ? '/candidate/dashboard' 
        : '/recruiter/dashboard';
      navigate(redirectPath);
    }
  }, [currentUser, navigate]);

  // Clear auth errors when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear field-specific error when user types
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    // Recruiter specific validations
    if (formData.role === 'recruiter') {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      await register(formData);
      // No need to redirect - AuthContext will handle it
    } catch (err) {
      console.error('Registration error:', err);
      // Form errors are handled by AuthContext
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 mb-8">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold text-center mb-6">Create Your PivotAI Account</h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          {/* Account Type Selection */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Account Type
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="role"
                  value="candidate"
                  checked={formData.role === 'candidate'}
                  onChange={handleChange}
                  className="mr-2"
                />
                <span>Candidate</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="role"
                  value="recruiter"
                  checked={formData.role === 'recruiter'}
                  onChange={handleChange}
                  className="mr-2"
                />
                <span>Recruiter</span>
              </label>
            </div>
          </div>
          
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
              placeholder="Enter your full name"
            />
            {formErrors.name && (
              <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
            )}
          </div>
          
          {/* Email */}
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                formErrors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your email"
            />
            {formErrors.email && (
              <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>
            )}
          </div>
          
          {/* Password */}
          <div className="mb-4">
            <label htmlFor="password" className="block text-gray-700 font-medium mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                formErrors.password ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Create a password (min. 6 characters)"
            />
            {formErrors.password && (
              <p className="text-red-500 text-sm mt-1">{formErrors.password}</p>
            )}
          </div>
          
          {/* Confirm Password */}
          <div className="mb-4">
            <label htmlFor="confirmPassword" className="block text-gray-700 font-medium mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                formErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Confirm your password"
            />
            {formErrors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">{formErrors.confirmPassword}</p>
            )}
          </div>
          
          {/* Recruiter-specific fields */}
          {formData.role === 'recruiter' && (
            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <h3 className="font-medium text-blue-800 mb-3">Recruiter Information</h3>
              
              {/* Company */}
              <div className="mb-3">
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
                  placeholder="Enter your company name"
                />
                {formErrors.company && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.company}</p>
                )}
              </div>
              
              {/* Position */}
              <div>
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
                  placeholder="e.g. Technical Recruiter, Hiring Manager"
                />
                {formErrors.position && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.position}</p>
                )}
              </div>
            </div>
          )}
          
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg ${
              isSubmitting 
                ? 'opacity-70 cursor-not-allowed' 
                : 'hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50'
            }`}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Account...
              </span>
            ) : (
              'Create Account'
            )}
          </button>
        </form>
        
        <div className="text-center mt-4">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-800">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;