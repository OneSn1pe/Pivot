import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <h3 className="text-lg font-semibold mb-4">About PivotAI</h3>
            <p className="text-gray-300">
              PivotAI helps software engineers and computer science professionals chart their career path with 
              AI-powered roadmaps tailored to their target companies and positions.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-gray-300 hover:text-white">
                  Sign Up
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-gray-300 hover:text-white">
                  Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <p className="text-gray-300 mb-2">
              Have questions? Contact us at:
            </p>
            <a href="mailto:support@pivotai.example.com" className="text-blue-400 hover:text-blue-300">
              support@pivotai.example.com
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-6 border-t border-gray-700 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} PivotAI. All rights reserved.</p>
          <p className="text-xs mt-1">
            This is a demonstration project for a hackathon and not a real product or service.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;