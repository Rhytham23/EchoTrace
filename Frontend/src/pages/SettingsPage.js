import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaLock, FaPalette, FaBell, FaSignOutAlt, FaSun, FaMoon } from "react-icons/fa";
import { getMyProfile, updateMyProfile } from "../api/api";
import { useTheme } from "../context/ThemeContext";

// Helper component for styled links
const SettingsListItem = ({ label, icon, onClick, isDestructive = false, isDarkMode }) => (
  <div
    onClick={onClick}
    className={`flex items-center justify-between p-4 w-full text-left transition-colors duration-200 cursor-pointer ${
      isDestructive
        ? isDarkMode
          ? "bg-gray-800 hover:bg-gray-700 text-red-400"
          : "bg-red-100 hover:bg-red-200 text-red-600"
        : isDarkMode
        ? "bg-gray-700 hover:bg-gray-600 text-gray-200"
        : "bg-gray-50 hover:bg-gray-100 text-gray-800"
    } rounded-lg`}
  >
    <div className="flex items-center space-x-3">
      {icon}
      <span className="font-medium">{label}</span>
    </div>
    <svg
      className={`w-5 h-5 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
    </svg>
  </div>
);

function SettingsPage() {
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getMyProfile();
        setNotificationsEnabled(res.data.remindersEnabled ?? true);
      } catch (err) {
        console.error("Failed to fetch user profile", err);
        setErrorMessage("Failed to load settings. Check connection.");
      }
    };
    fetchProfile();
  }, []);

  const handleNotificationToggle = async () => {
    setLoading(true);
    setErrorMessage("");
    const newValue = !notificationsEnabled;

    try {
      const currentProfile = (await getMyProfile()).data;
      const updatedProfile = { ...currentProfile, remindersEnabled: newValue };
      await updateMyProfile(updatedProfile);
      setNotificationsEnabled(newValue);
    } catch (err) {
      console.error("Failed to update notifications", err);
      setErrorMessage("Failed to update notification setting.");
      setNotificationsEnabled(!newValue);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => setShowLogoutConfirm(true);
  const confirmLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    if (isDarkMode) toggleTheme();
    navigate("/login");
  };

  return (
    <div
      className={`min-h-screen p-6 pt-24 transition-colors duration-300 ${
        isDarkMode ? "bg-gray-900 text-gray-100" : "bg-gray-100 text-gray-900"
      }`}
    >
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Settings</h1>

        {errorMessage && (
          <div
            className={`border p-3 rounded-lg mb-4 text-center text-sm font-medium ${
              isDarkMode
                ? "bg-red-900 text-red-300 border-red-700"
                : "bg-red-100 text-red-700 border-red-300"
            }`}
          >
            {errorMessage}
          </div>
        )}

        {/* Account Section */}
        <section className="mb-10">
          <h2
            className={`text-sm font-semibold uppercase mb-3 ${
              isDarkMode ? "text-gray-500" : "text-gray-600"
            }`}
          >
            Account
          </h2>
          <div
            className={`rounded-xl shadow border overflow-hidden space-y-1 ${
              isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
            }`}
          >
            <Link
              to="/settings/password"
              className={`flex items-center justify-between p-4 transition-colors duration-200 rounded-lg ${
                isDarkMode
                  ? "hover:bg-gray-600 text-gray-200"
                  : "hover:bg-gray-100 text-gray-800"
              }`}
            >
              <div className="flex items-center space-x-3">
                <FaLock className="w-5 h-5" />
                <span className="font-medium">Change Password</span>
              </div>
              <svg
                className={`w-5 h-5 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5l7 7-7 7"
                ></path>
              </svg>
            </Link>
          </div>
        </section>

        {/* App Preferences */}
        <section className="mb-10">
          <h2
            className={`text-sm font-semibold uppercase mb-3 ${
              isDarkMode ? "text-gray-500" : "text-gray-600"
            }`}
          >
            App Preferences
          </h2>
          <div
            className={`rounded-xl shadow border overflow-hidden space-y-1 ${
              isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
            }`}
          >
            {/* Theme Toggle */}
            <div
              className={`flex items-center justify-between p-4 transition-colors duration-200 ${
                isDarkMode ? "hover:bg-gray-600" : "hover:bg-gray-100"
              }`}
            >
              <div className="flex items-center space-x-3">
                <FaPalette className="w-5 h-5" />
                <span className="font-medium">Theme</span>
              </div>

             {/* 🌓 Updated Toggle with Brighter, High-Contrast Icons */}
<label
  htmlFor="theme-toggle"
  className="relative inline-flex items-center cursor-pointer"
>
  <input
    type="checkbox"
    id="theme-toggle"
    className="sr-only"
    checked={isDarkMode}
    onChange={toggleTheme}
  />

  {/* Background + Icons */}
  <div
    className={`flex items-center justify-between w-16 h-8 rounded-full px-2 transition-colors duration-300 ${
      isDarkMode ? "bg-blue-700" : "bg-gray-500"
    }`}
  >
    <FaSun
      className={`w-4 h-4 transition-all duration-300 ${
        isDarkMode
          ? "text-yellow-300 opacity-40"
          : "text-yellow-400 opacity-100 drop-shadow-[0_0_4px_rgba(255,255,0,0.6)]"
      }`}
    />
    <FaMoon
      className={`w-4 h-4 transition-all duration-300 ${
        isDarkMode
          ? "text-indigo-200 opacity-100 drop-shadow-[0_0_6px_rgba(140,160,255,0.8)]"
          : "text-gray-200 opacity-40"
      }`}
    />
  </div>

  {/* Moving Knob */}
  <div
    className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
      isDarkMode ? "translate-x-8" : "translate-x-0"
    }`}
  ></div>
</label>
</div>

            {/* Notification Toggle */}
            <div
              className={`flex items-center justify-between p-4 transition-colors duration-200 ${
                isDarkMode ? "hover:bg-gray-600" : "hover:bg-gray-100"
              }`}
            >
              <div className="flex items-center space-x-3">
                <FaBell className="w-5 h-5" />
                <span className="font-medium">Daily Reminders</span>
              </div>
              <label htmlFor="notif-toggle" className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  id="notif-toggle"
                  className="sr-only"
                  checked={notificationsEnabled}
                  onChange={handleNotificationToggle}
                  disabled={loading}
                />
                <div
                  className={`block w-14 h-8 rounded-full transition duration-300 ${
                    notificationsEnabled ? "bg-blue-600" : "bg-gray-600"
                  }`}
                ></div>
                <div
                  className={`absolute left-1 top-1 w-6 h-6 bg-white rounded-full transition-transform duration-300 transform ${
                    notificationsEnabled ? "translate-x-6" : "translate-x-0"
                  }`}
                ></div>
              </label>
            </div>
          </div>
        </section>

        {/* Danger / Logout */}
        <section>
          <h2
            className={`text-sm font-semibold uppercase mb-3 ${
              isDarkMode ? "text-gray-500" : "text-gray-600"
            }`}
          >
            Danger Zone
          </h2>
          <div
            className={`rounded-xl shadow border overflow-hidden space-y-1 ${
              isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
            }`}
          >
            <SettingsListItem
              onClick={handleLogout}
              label="Logout"
              icon={<FaSignOutAlt className="w-5 h-5" />}
              isDestructive
              isDarkMode={isDarkMode}
            />
          </div>
        </section>
      </div>

      {/* Logout Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
          <div
            className={`p-8 rounded-xl shadow-2xl max-w-sm w-full text-center transition-colors ${
              isDarkMode ? "bg-gray-700 text-white" : "bg-white text-gray-800"
            }`}
          >
            <h3 className="text-xl font-bold mb-4">Confirm Logout</h3>
            <p className="mb-6">Are you sure you want to end your session?</p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className={`px-4 py-2 rounded-lg transition ${
                  isDarkMode
                    ? "bg-gray-500 hover:bg-gray-400 text-white"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                }`}
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SettingsPage;
