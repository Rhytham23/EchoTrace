import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {jwtDecode} from "jwt-decode";
import { FaUserCircle, FaCog, FaSignOutAlt } from "react-icons/fa";

function Navbar({ isDarkMode }) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setUsername(decodedToken.sub || "");
      } catch (err) {
        console.error("JWT decode failed", err);
      }
    }
  }, []);

  // Confirm Logout function
  const confirmLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    navigate("/login");
  };

  return (
    <nav className="bg-gray-800 border-b border-gray-600 shadow-lg fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Logo */}
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-blue-400">
              EchoTrace
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex flex-grow justify-between items-center ml-10">
            <div className="flex items-baseline space-x-4">
              <Link
                to="/create-log"
                className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                Create Log
              </Link>
              <Link
                to="/logs"
                className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                View Logs
              </Link>
            </div>

            {/* Right: Profile + Settings + Logout */}
            <div className="flex items-center space-x-4">
              <Link
                to="/profile"
                className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-700 transition-colors duration-200"
              >
                <FaUserCircle className="w-6 h-6 text-blue-400" />
                <span className="text-gray-200 font-medium">{username}</span>
              </Link>

              <Link
                to="/settings"
                className="p-2 rounded-md text-gray-200 hover:bg-gray-700 transition-colors duration-200"
              >
                <FaCog />
              </Link>

              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="flex items-center space-x-1 text-gray-200 hover:text-white px-3 py-2 rounded-md transition-colors duration-200"
              >
                <FaSignOutAlt />
                <span className="text-sm font-medium">Logout</span>
              </button>
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className={`${isOpen ? "hidden" : "block"} h-6 w-6`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              <svg
                className={`${isOpen ? "block" : "hidden"} h-6 w-6`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`${isOpen ? "block" : "hidden"} md:hidden`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <Link to="/profile" className="mobile-link" onClick={() => setIsOpen(false)}>
            Profile
          </Link>
          <Link to="/settings" className="mobile-link" onClick={() => setIsOpen(false)}>
            Settings
          </Link>
          <Link to="/create-log" className="mobile-link" onClick={() => setIsOpen(false)}>
            Create Log
          </Link>
          <Link to="/logs" className="mobile-link" onClick={() => setIsOpen(false)}>
            View Logs
          </Link>
          <button
            onClick={() => {
              setShowLogoutConfirm(true);
              setIsOpen(false);
            }}
            className="mobile-link w-full text-left"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Logout Confirmation Modal (Theme-aware) */}
      {/* Logout Confirmation Modal (Theme-aware) */}
{showLogoutConfirm && (
  <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
    <div
      className={`p-8 rounded-xl shadow-2xl max-w-sm w-full text-center transition-colors duration-300 ${
        isDarkMode
          ? "bg-gray-700 text-white"
          : "bg-white text-gray-900"
      }`}
    >
      <h3 className="text-xl font-bold mb-4">Confirm Logout</h3>
      <p className="mb-6">Are you sure you want to end your session?</p>
      <div className="flex justify-center space-x-4">
        <button
          onClick={() => setShowLogoutConfirm(false)}
          className={`px-4 py-2 rounded-lg transition ${
            isDarkMode
              ? "bg-gray-500 text-white hover:bg-gray-400"
              : "bg-gray-200 text-gray-900 hover:bg-gray-300"
          }`}
        >
          Cancel
        </button>
        <button
          onClick={confirmLogout}
          className={`px-4 py-2 rounded-lg transition ${
            isDarkMode
              ? "bg-red-600 text-white hover:bg-red-700"
              : "bg-red-500 text-white hover:bg-red-600"
          }`}
        >
          Yes, Logout
        </button>
      </div>
    </div>
  </div>
)}

    </nav>
  );
}

export default Navbar;
