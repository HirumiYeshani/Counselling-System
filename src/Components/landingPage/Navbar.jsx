import React, { useState } from "react";
import { Link } from "react-router-dom";
import logo from "../../assets/Images/logo.png";


const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-lg border-b border-sky-100 sticky top-0 z-30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-24">
          {/* Left Side - Logo and Brand */}
          <div className="flex items-center space-x-3">
            {/* Logo */}
          <img
                  src={logo}
                  alt="MindEase Logo"
                  className="w-16 h-16 mb-3"
                />
            
            {/* Brand Name */}
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold bg-sky-600 bg-clip-text text-transparent">
                MindEase
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-8 text-lg">
            <Link 
              to="/" 
              className="text-gray-700 hover:text-sky-600 font-medium transition-colors duration-200"
            >
              Home
            </Link>
            <Link 
              to="/features" 
              className="text-gray-700 hover:text-sky-600 font-medium transition-colors duration-200"
            >
              Features
            </Link>
            <Link 
              to="/pricing" 
              className="text-gray-700 hover:text-sky-600 font-medium transition-colors duration-200"
            >
              Pricing
            </Link>
            <Link 
              to="/about" 
              className="text-gray-700 hover:text-sky-600 font-medium transition-colors duration-200"
            >
              About
            </Link>
            <Link 
              to="/contact" 
              className="text-gray-700 hover:text-sky-600 font-medium transition-colors duration-200"
            >
              Contact
            </Link>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4 text-lg">
            <Link 
              to="/login" 
              className="text-sky-600 hover:text-sky-700 font-medium "
            >
              Login
            </Link>
            <Link 
              to="/register" 
              className="bg-sky-500 text-white px-6 py-2 rounded-xl hover:bg-sky-600 font-medium shadow-lg hover:shadow-xl"
            >
              Sign In
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-sky-600 focus:outline-none focus:text-sky-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 py-4">
            <div className="flex flex-col space-y-4">
              <Link 
                to="/" 
                className="text-gray-700 hover:text-sky-600 font-medium transition-colors duration-200 px-4 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/features" 
                className="text-gray-700 hover:text-sky-600 font-medium transition-colors duration-200 px-4 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Features
              </Link>
              <Link 
                to="/pricing" 
                className="text-gray-700 hover:text-sky-600 font-medium transition-colors duration-200 px-4 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Pricing
              </Link>
              <Link 
                to="/about" 
                className="text-gray-700 hover:text-sky-600 font-medium transition-colors duration-200 px-4 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              <Link 
                to="/contact" 
                className="text-gray-700 hover:text-sky-600 font-medium transition-colors duration-200 px-4 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
              <div className="border-t border-gray-200 pt-4 mt-2">
                <Link 
                  to="/login" 
                  className="text-sky-600 hover:text-sky-700 font-medium transition-colors duration-200 px-4 py-2 block"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="bg-sky-500 text-white px-6 py-2 rounded-xl hover:bg-sky-600 transition-colors duration-200 font-medium mx-4 mt-2 inline-block"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;