// RecruiterDashboard.jsx
import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../contexts/AuthContext';
import UserContext from '../contexts/UserContext';

const RecruiterDashboard = () => {
  const { currentUser } = useContext(AuthContext);
  const { userProfile, jobPreferences, bookmarkedCandidates, loading, error } = useContext(UserContext);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Welcome, {currentUser?.name}</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Dashboard Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium text-blue-800">Bookmarked Candidates</h3>
            <p className="text-3xl font-bold">{bookmarkedCandidates?.length || 0}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-medium text-green-800">Candidate Preferences</h3>
            <p className="text-3xl font-bold">{jobPreferences?.length || 0}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-medium text-purple-800">Company Profile</h3>
            <p className="text-lg font-semibold">{userProfile?.company || 'Not set'}</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-4">
            <Link to="/recruiter/candidates" className="block px-4 py-2 bg-blue-50 text-blue-700 rounded hover:bg-blue-100">
              Browse Candidates
            </Link>
            <Link to="/recruiter/job-preferences" className="block px-4 py-2 bg-blue-50 text-blue-700 rounded hover:bg-blue-100">
              Manage Job Preferences
            </Link>
            <Link to="/recruiter/profile" className="block px-4 py-2 bg-blue-50 text-blue-700 rounded hover:bg-blue-100">
              Edit Company Profile
            </Link>
          </div>
        </div>

        {/* Bookmarked Candidates */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Bookmarked Candidates</h2>
          {bookmarkedCandidates?.length > 0 ? (
            <ul className="space-y-2">
              {bookmarkedCandidates.map((bookmark, index) => (
                <li key={index} className="p-2 bg-gray-50 rounded flex justify-between items-center">
                  <span className="font-medium">{bookmark.candidate.name}</span>
                  <span className="text-sm text-gray-500">
                    Bookmarked: {new Date(bookmark.bookmarkedAt).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600">
              You haven't bookmarked any candidates yet. Browse candidates to find promising talent.
            </p>
          )}
        </div>
      </div>

      {/* Recent Candidate Preferences */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Recent Candidate Preferences</h2>
          <Link to="/recruiter/job-preferences" className="text-blue-600 hover:text-blue-800">
            View All
          </Link>
        </div>
        
        {jobPreferences?.length > 0 ? (
          <div className="space-y-4">
            {jobPreferences.slice(0, 3).map((pref, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <h3 className="font-medium text-lg">{pref.position}</h3>
                  <span className={`px-2 py-1 rounded text-xs ${
                    pref.status === 'active' ? 'bg-green-100 text-green-800' : 
                    pref.status === 'filled' ? 'bg-blue-100 text-blue-800' : 
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {pref.status}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mt-2">
                  {pref.department ? `${pref.department} • ` : ''}
                  {pref.location ? `${pref.location} • ` : ''}
                  {pref.remote ? 'Remote • ' : ''}
                  Experience: {pref.experience?.min || 0}-{pref.experience?.max || '∞'} years
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">
            No candidate preferences created yet. Define your requirements to find matching candidates.
          </p>
        )}
      </div>
    </div>
  );
};

export default RecruiterDashboard;