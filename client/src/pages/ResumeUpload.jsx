// ResumeUpload.jsx
import React, { useState, useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../contexts/AuthContext';
import UserContext from '../contexts/UserContext';

const ResumeUpload = () => {
  const { currentUser } = useContext(AuthContext);
  const { resume, uploadResume, loading, error, clearError } = useContext(UserContext);
  
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  
  // Clear messages when component mounts
  useEffect(() => {
    clearError();
    setUploadError(null);
    setUploadSuccess(false);
  }, [clearError]);
  
  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    validateAndSetFile(selectedFile);
  };
  
  // Handle drag events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };
  
  // Handle drop event
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };
  
  // Validate and set file
  const validateAndSetFile = (selectedFile) => {
    setUploadError(null);
    
    // Check if file exists
    if (!selectedFile) {
      setUploadError('No file selected');
      return;
    }
    
    // Check file type (PDF only)
    if (selectedFile.type !== 'application/pdf') {
      setUploadError('Only PDF files are allowed');
      return;
    }
    
    // Check file size (max 5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      setUploadError('File size must be less than 5MB');
      return;
    }
    
    setFile(selectedFile);
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setUploadError('Please select a file to upload');
      return;
    }
    
    // Clear messages
    setUploadError(null);
    setUploadSuccess(false);
    clearError();
    
    try {
      // Create form data
      const formData = new FormData();
      
      // Make sure the field name matches what the server expects (resume)
      // The file's name and content type are automatically set
      formData.append('resume', file);
      
      console.log("Uploading file:", file.name, file.type, file.size);
      
      // Upload resume
      await uploadResume(formData);
      
      // Show success message
      setUploadSuccess(true);
      setFile(null);
      
      // Reset file input
      const fileInput = document.getElementById('resume');
      if (fileInput) {
        fileInput.value = '';
      }
    } catch (err) {
      console.error('Resume upload error:', err);
      setUploadError(err.message || 'Failed to upload resume');
    }
  };
  
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Resume Upload</h1>
      
      {/* Error Message */}
      {(error || uploadError) && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error || uploadError}
        </div>
      )}
      
      {/* Success Message */}
      {uploadSuccess && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          Resume uploaded successfully! Our AI will analyze your resume and generate personalized recommendations.
        </div>
      )}
      
      {/* Upload Form */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Upload Your Resume</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Resume (PDF only, max 5MB)
            </label>
            
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-8 text-center ${
                dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
              }`}
            >
              <input
                type="file"
                id="resume"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              
              <div className="space-y-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                
                <div className="text-gray-600">
                  {file ? (
                    <span className="text-blue-600 font-medium">{file.name}</span>
                  ) : (
                    <>
                      <p>Drag and drop your PDF resume here or</p>
                      <label htmlFor="resume" className="text-blue-600 cursor-pointer hover:text-blue-800">
                        browse files
                      </label>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!file || loading}
              className={`bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg ${
                !file || loading
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
              }`}
            >
              {loading ? 'Uploading...' : 'Upload Resume'}
            </button>
          </div>
        </form>
      </div>
      
      {/* Current Resume */}
      {resume && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Current Resume</h2>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="flex items-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <div>
                <h3 className="font-medium">{resume.file?.originalName || 'Resume.pdf'}</h3>
                <p className="text-gray-600 text-sm">
                  Uploaded on {new Date(resume.file?.uploadDate || resume.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
          
          {/* Resume Analysis */}
          {resume.analysis && (
            <div>
              <h3 className="font-semibold mb-3">Resume Analysis</h3>
              
              <div className="space-y-4">
                {/* Strengths */}
                <div>
                  <h4 className="font-medium mb-2">Key Strengths</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    {resume.analysis.strengths.map((strength, index) => (
                      <li key={index}>{strength}</li>
                    ))}
                  </ul>
                </div>
                
                {/* Areas for Improvement */}
                <div>
                  <h4 className="font-medium mb-2">Areas for Improvement</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    {resume.analysis.weaknesses.map((weakness, index) => (
                      <li key={index}>{weakness}</li>
                    ))}
                  </ul>
                </div>
                
                {/* Skill Gaps */}
                <div>
                  <h4 className="font-medium mb-2">Skill Gaps</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    {resume.analysis.skillGaps.map((gap, index) => (
                      <li key={index}>{gap}</li>
                    ))}
                  </ul>
                </div>
                
                {/* Next Steps */}
                <div className="mt-6 bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2 text-blue-800">Next Steps</h4>
                  <p className="text-gray-700 mb-3">
                    Now that your resume has been analyzed, you can:
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link
                      to="/candidate/profile"
                      className="px-4 py-2 bg-white text-blue-600 border border-blue-200 rounded hover:bg-blue-50 text-center"
                    >
                      Update your profile
                    </Link>
                    <Link
                      to="/candidate/roadmap"
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-center"
                    >
                      Generate career roadmap
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ResumeUpload;