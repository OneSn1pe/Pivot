import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../contexts/AuthContext';
import UserContext from '../contexts/UserContext';

const TargetCompanies = () => {
  const { currentUser } = useContext(AuthContext);
  const { targetCompanies, updateTargetCompanies, loading, error, clearError } = useContext(UserContext);
  const navigate = useNavigate();

  const [companies, setCompanies] = useState([]);
  const [newCompany, setNewCompany] = useState({
    company: '',
    position: '',
    priority: 1
  });
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Initialize companies state with targetCompanies from context
  useEffect(() => {
    if (targetCompanies && targetCompanies.length > 0) {
      setCompanies([...targetCompanies]);
    }
  }, [targetCompanies]);

  // Clear messages when component mounts
  useEffect(() => {
    clearError();
    setFormError('');
    setSuccessMessage('');
  }, [clearError]);

  // Handle input change for new company form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCompany({
      ...newCompany,
      [name]: name === 'priority' ? parseInt(value) : value
    });
  };

  // Add new company to the list
  const handleAddCompany = (e) => {
    e.preventDefault();
    setFormError('');

    // Validate form
    if (!newCompany.company.trim()) {
      setFormError('Company name is required');
      return;
    }
    if (!newCompany.position.trim()) {
      setFormError('Position is required');
      return;
    }

    // Add new company to the list
    const updatedCompanies = [...companies, { ...newCompany }];
    setCompanies(updatedCompanies);

    // Reset form
    setNewCompany({
      company: '',
      position: '',
      priority: 1
    });

    setSuccessMessage('Company added! Remember to save your changes.');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  // Remove company from the list
  const handleRemoveCompany = (index) => {
    const updatedCompanies = [...companies];
    updatedCompanies.splice(index, 1);
    setCompanies(updatedCompanies);
  };

  // Update company priority
  const handlePriorityChange = (index, newPriority) => {
    const updatedCompanies = [...companies];
    updatedCompanies[index].priority = parseInt(newPriority);
    setCompanies(updatedCompanies);
  };

  // Save all changes to the server
  const handleSaveChanges = async () => {
    try {
      if (companies.length === 0) {
        setFormError('Please add at least one target company before saving');
        return;
      }
      
      console.log('Saving companies:', companies);
      const result = await updateTargetCompanies(companies);
      console.log('Save result:', result);
      
      setSuccessMessage('Target companies updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Failed to save target companies:', err);
      setFormError('Failed to save your target companies. Please try again.');
    }
  };

  // Navigate to roadmap generation if available
  const handleGoToRoadmap = () => {
    navigate('/candidate/roadmap');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Target Companies</h1>
        <button
          onClick={handleGoToRoadmap}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          View Roadmap
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Add Target Company</h2>

        {/* Error Message */}
        {(error || formError) && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error || formError}
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleAddCompany} className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="company" className="block text-gray-700 font-medium mb-2">
                Company Name
              </label>
              <input
                type="text"
                id="company"
                name="company"
                value={newCompany.company}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. Google"
              />
            </div>

            <div>
              <label htmlFor="position" className="block text-gray-700 font-medium mb-2">
                Target Position
              </label>
              <input
                type="text"
                id="position"
                name="position"
                value={newCompany.position}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. Software Engineer"
              />
            </div>

            <div>
              <label htmlFor="priority" className="block text-gray-700 font-medium mb-2">
                Priority (1-5)
              </label>
              <select
                id="priority"
                name="priority"
                value={newCompany.priority}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={1}>1 - Low</option>
                <option value={2}>2</option>
                <option value={3}>3 - Medium</option>
                <option value={4}>4</option>
                <option value={5}>5 - High</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add Company
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Your Target Companies</h2>
          <button
            onClick={handleSaveChanges}
            disabled={loading}
            className={`px-4 py-2 rounded-lg ${
              loading
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        {companies.length > 0 ? (
          <div className="overflow-hidden border border-gray-200 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Position
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {companies.map((company, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {company.company}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {company.position}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={company.priority || 1}
                        onChange={(e) => handlePriorityChange(index, e.target.value)}
                        className="px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value={1}>1 - Low</option>
                        <option value={2}>2</option>
                        <option value={3}>3 - Medium</option>
                        <option value={4}>4</option>
                        <option value={5}>5 - High</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => handleRemoveCompany(index)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-gray-50 p-6 rounded-lg text-center">
            <p className="text-gray-600 mb-4">
              You haven't added any target companies yet. Add companies above to start building your career roadmap.
            </p>
            <p className="text-gray-500 text-sm">
              Your roadmap will be tailored based on your target companies and positions.
            </p>
          </div>
        )}

        {companies.length > 0 && (
          <div className="mt-6 bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium text-blue-800 mb-2">What's Next?</h3>
            <p className="text-gray-700 mb-3">
              After saving your target companies, you can generate a personalized career roadmap that will guide you toward these roles.
            </p>
            <button
              onClick={handleGoToRoadmap}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Generate My Roadmap
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TargetCompanies; 