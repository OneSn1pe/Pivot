import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../../contexts/AuthContext';

const Navbar = () => {
  const { currentUser, logout } = useContext(AuthContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="font-bold text-xl text-blue-600">PivotAI</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {currentUser ? (
              <>
                {/* Candidate Links */}
                {currentUser.role === 'candidate' && (
                  <>
                    <Link to="/candidate/dashboard" className="text-gray-700 hover:text-blue-600">
                      Dashboard
                    </Link>
                    <Link to="/candidate/roadmap" className="text-gray-700 hover:text-blue-600">
                      Roadmap
                    </Link>
                    <Link to="/candidate/resume" className="text-gray-700 hover:text-blue-600">
                      Resume
                    </Link>
                    <Link to="/candidate/target-companies" className="text-gray-700 hover:text-blue-600">
                      Target Companies
                    </Link>
                  </>
                )}

                {/* Recruiter Links */}
                {currentUser.role === 'recruiter' && (
                  <>
                    <Link to="/recruiter/dashboard" className="text-gray-700 hover:text-blue-600">
                      Dashboard
                    </Link>
                    <Link to="/recruiter/candidates" className="text-gray-700 hover:text-blue-600">
                      Candidates
                    </Link>
                    <Link to="/recruiter/bookmarked-candidates" className="text-gray-700 hover:text-blue-600">
                      Bookmarked Candidates
                    </Link>
                    <Link to="/recruiter/job-preferences" className="text-gray-700 hover:text-blue-600">
                      Job Preferences
                    </Link>
                  </>
                )}

                {/* Profile & Logout */}
                <div className="relative group">
                  <button className="flex items-center text-gray-700 hover:text-blue-600">
                    <span className="mr-1">{currentUser.name}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 hidden group-hover:block">
                    <Link
                      to={`/${currentUser.role}/profile`}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-blue-600">
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-gray-700 hover:text-blue-600 focus:outline-none"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white px-4 py-2 shadow-md">
          {currentUser ? (
            <>
              {/* Candidate Links */}
              {currentUser.role === 'candidate' && (
                <>
                  <Link
                    to="/candidate/dashboard"
                    className="block py-2 text-gray-700 hover:text-blue-600"
                    onClick={toggleMenu}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/candidate/roadmap"
                    className="block py-2 text-gray-700 hover:text-blue-600"
                    onClick={toggleMenu}
                  >
                    Roadmap
                  </Link>
                  <Link
                    to="/candidate/resume"
                    className="block py-2 text-gray-700 hover:text-blue-600"
                    onClick={toggleMenu}
                  >
                    Resume
                  </Link>
                  <Link
                    to="/candidate/target-companies"
                    className="block py-2 text-gray-700 hover:text-blue-600"
                    onClick={toggleMenu}
                  >
                    Target Companies
                  </Link>
                </>
              )}

              {/* Recruiter Links */}
              {currentUser.role === 'recruiter' && (
                <>
                  <Link
                    to="/recruiter/dashboard"
                    className="block py-2 text-gray-700 hover:text-blue-600"
                    onClick={toggleMenu}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/recruiter/candidates"
                    className="block py-2 text-gray-700 hover:text-blue-600"
                    onClick={toggleMenu}
                  >
                    Candidates
                  </Link>
                  <Link
                    to="/recruiter/bookmarked-candidates"
                    className="block py-2 text-gray-700 hover:text-blue-600"
                    onClick={toggleMenu}
                  >
                    Bookmarked Candidates
                  </Link>
                  <Link
                    to="/recruiter/job-preferences"
                    className="block py-2 text-gray-700 hover:text-blue-600"
                    onClick={toggleMenu}
                  >
                    Job Preferences
                  </Link>
                </>
              )}

              {/* Profile & Logout */}
              <Link
                to={`/${currentUser.role}/profile`}
                className="block py-2 text-gray-700 hover:text-blue-600"
                onClick={toggleMenu}
              >
                Profile
              </Link>
              <button
                onClick={() => {
                  handleLogout();
                  toggleMenu();
                }}
                className="block w-full text-left py-2 text-gray-700 hover:text-blue-600"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="block py-2 text-gray-700 hover:text-blue-600"
                onClick={toggleMenu}
              >
                Login
              </Link>
              <Link
                to="/register"
                className="block py-2 text-gray-700 hover:text-blue-600"
                onClick={toggleMenu}
              >
                Register
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;