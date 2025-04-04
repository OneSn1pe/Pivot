import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '../../contexts/AuthContext';

/**
 * Component for protecting routes based on authentication and role
 * @param {Object} props - Component props
 * @param {Array} props.allowedRoles - Roles allowed to access the route
 * @param {React.ReactNode} props.children - Child components
 * @returns {React.ReactNode} - Protected route or redirect
 */
const PrivateRoute = ({ allowedRoles, children }) => {
  const { currentUser, loading } = useContext(AuthContext);

  // Show loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-8rem)]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  // Check if user has required role
  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    // Redirect based on role
    if (currentUser.role === 'candidate') {
      return <Navigate to="/candidate/dashboard" />;
    } else if (currentUser.role === 'recruiter') {
      return <Navigate to="/recruiter/dashboard" />;
    } else {
      return <Navigate to="/" />;
    }
  }

  // If authenticated and has required role, render children
  return children;
};

export default PrivateRoute;