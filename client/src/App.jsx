import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { UserProvider } from './contexts/UserContext';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CandidateDashboard from './pages/CandidateDashboard';
import RecruiterDashboard from './pages/RecruiterDashboard';
import Profile from './pages/Profile';
import RoadmapView from './pages/RoadmapView';
import CandidateSearch from './pages/CandidateSearch';
import ResumeUpload from './pages/ResumeUpload';
import JobPreferences from './pages/JobPreferences';
import TargetCompanies from './pages/TargetCompanies';
import NotFound from './pages/NotFound';

// Components
import PrivateRoute from './components/common/PrivateRoute';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';

import './styles/main.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <UserProvider>
          <div className="min-h-screen flex flex-col bg-slate-50">
            <Navbar />
            <main className="flex-grow container mx-auto px-4 py-8">
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                {/* Protected routes - Candidate */}
                <Route path="/candidate/*" element={
                  <PrivateRoute allowedRoles={['candidate']}>
                    <Routes>
                      <Route path="dashboard" element={<CandidateDashboard />} />
                      <Route path="profile" element={<Profile />} />
                      <Route path="roadmap" element={<RoadmapView />} />
                      <Route path="resume" element={<ResumeUpload />} />
                      <Route path="target-companies" element={<TargetCompanies />} />
                      <Route path="*" element={<Navigate to="/candidate/dashboard" replace />} />
                    </Routes>
                  </PrivateRoute>
                } />
                
                {/* Protected routes - Recruiter */}
                <Route path="/recruiter/*" element={
                  <PrivateRoute allowedRoles={['recruiter']}>
                    <Routes>
                      <Route path="dashboard" element={<RecruiterDashboard />} />
                      <Route path="profile" element={<Profile />} />
                      <Route path="candidates" element={<CandidateSearch />} />
                      <Route path="job-preferences" element={<JobPreferences />} />
                      <Route path="*" element={<Navigate to="/recruiter/dashboard" replace />} />
                    </Routes>
                  </PrivateRoute>
                } />
                
                {/* 404 Not Found */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </UserProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;