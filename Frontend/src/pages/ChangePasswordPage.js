import React, { useState } from "react";
import { updatePassword } from "../api/api";
import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext"; // ✅ Added

function ChangePasswordPage() {
  const { isDarkMode } = useTheme(); // ✅ Access theme state

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [passwordFeedback, setPasswordFeedback] = useState({
    message: "",
    type: "",
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const handlePasswordChange = (e) => {
    setPasswordForm({
      ...passwordForm,
      [e.target.name]: e.target.value,
    });
    setPasswordFeedback({ message: "", type: "" });
  };

  const handleSubmitPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setPasswordFeedback({ message: "", type: "" });

    if (passwordForm.newPassword.length < 6) {
      setPasswordFeedback({
        message: "New password must be at least 6 characters.",
        type: "error",
      });
      setLoading(false);
      return;
    }

    if (passwordForm.newPassword === passwordForm.currentPassword) {
      setPasswordFeedback({
        message: "New password must be different from the current one.",
        type: "error",
      });
      setLoading(false);
      return;
    }

    try {
      await updatePassword(passwordForm);
      setPasswordForm({ currentPassword: "", newPassword: "" });
      setPasswordFeedback({
        message: "Password updated successfully!",
        type: "success",
      });
    } catch (err) {
      const status = err.response?.status;
      let message =
        "Failed to update password. Please check your current password.";
      if (status === 401 || status === 403) {
        message = "Current password is incorrect.";
      } else if (err.response?.data?.message) {
        message = err.response.data.message;
      }
      setPasswordFeedback({ message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const PasswordToggleButton = ({ show, toggle, inputName }) => (
    <button
      type="button"
      onClick={toggle}
      className="absolute right-3 top-1/2 mt-3 transform -translate-y-1/2 text-gray-400 hover:text-blue-400 transition-colors duration-200"
      aria-label={`Toggle visibility for ${inputName}`}
    >
      {show ? (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.22 0-8.03-2.14-9.5-5.5a10.02 10.02 0 016.3-5.3m2.57-2.02A10.05 10.05 0 0112 5c4.22 0 8.03 2.14 9.5 5.5a10.02 10.02 0 01-4.75 4.31m-3.25-1.99a3 3 0 11-3-3m3 3l-3-3"
          ></path>
        </svg>
      ) : (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          ></path>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
          ></path>
        </svg>
      )}
    </button>
  );

  return (
    <div
      className={`min-h-screen p-4 pt-20 flex justify-center transition-colors duration-300 ${
        isDarkMode
          ? "bg-gray-900 text-gray-100"
          : "bg-gray-100 text-gray-900"
      }`}
    >
      <div
        className={`w-full max-w-lg p-8 rounded-xl shadow-lg border h-fit transition-colors duration-300 ${
          isDarkMode
            ? "bg-gray-800 border-gray-700"
            : "bg-white border-gray-200"
        }`}
      >
        <div
          className={`flex justify-between items-center mb-6 border-b pb-3 ${
            isDarkMode ? "border-gray-700" : "border-gray-300"
          }`}
        >
          <h1
            className={`text-3xl font-bold ${
              isDarkMode ? "text-blue-400" : "text-blue-600"
            }`}
          >
            Change Password
          </h1>
          <Link
            to="/settings"
            className={`text-sm flex items-center space-x-1 transition-colors duration-200 ${
              isDarkMode
                ? "text-gray-400 hover:text-white"
                : "text-gray-600 hover:text-black"
            }`}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 19l-7-7 7-7"
              ></path>
            </svg>
            <span>Back to Settings</span>
          </Link>
        </div>

        <form onSubmit={handleSubmitPassword} className="space-y-6">
          {passwordFeedback.message && (
            <div
              className={`p-3 rounded-lg text-sm font-medium text-center border ${
                passwordFeedback.type === "success"
                  ? isDarkMode
                    ? "bg-green-900 text-green-300 border-green-700"
                    : "bg-green-100 text-green-700 border-green-400"
                  : isDarkMode
                  ? "bg-red-900 text-red-300 border-red-700"
                  : "bg-red-100 text-red-700 border-red-400"
              }`}
            >
              {passwordFeedback.message}
            </div>
          )}

          {/* Current Password */}
          <div className="relative">
            <label
              htmlFor="currentPassword"
              className={`block text-sm font-medium mb-1 ${
                isDarkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Current Password
            </label>
            <input
              type={showCurrentPassword ? "text" : "password"}
              name="currentPassword"
              id="currentPassword"
              value={passwordForm.currentPassword}
              onChange={handlePasswordChange}
              required
              className={`w-full px-4 py-3 rounded pr-12 focus:outline-none focus:border-blue-500 transition-colors duration-300 ${
                isDarkMode
                  ? "bg-gray-700 text-gray-100 border border-gray-600"
                  : "bg-gray-100 text-gray-900 border border-gray-300"
              }`}
            />
            <PasswordToggleButton
              show={showCurrentPassword}
              toggle={() => setShowCurrentPassword(!showCurrentPassword)}
              inputName="Current Password"
            />
          </div>

          {/* New Password */}
          <div className="relative">
            <label
              htmlFor="newPassword"
              className={`block text-sm font-medium mb-1 ${
                isDarkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              New Password
            </label>
            <input
              type={showNewPassword ? "text" : "password"}
              name="newPassword"
              id="newPassword"
              value={passwordForm.newPassword}
              onChange={handlePasswordChange}
              required
              className={`w-full px-4 py-3 rounded pr-12 focus:outline-none focus:border-blue-500 transition-colors duration-300 ${
                isDarkMode
                  ? "bg-gray-700 text-gray-100 border border-gray-600"
                  : "bg-gray-100 text-gray-900 border border-gray-300"
              }`}
            />
            <PasswordToggleButton
              show={showNewPassword}
              toggle={() => setShowNewPassword(!showNewPassword)}
              inputName="New Password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full px-4 py-3 font-bold rounded-lg text-lg mt-6 transition-colors duration-300 ${
              loading
                ? "bg-gray-500 cursor-not-allowed"
                : isDarkMode
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            {loading ? "Processing..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ChangePasswordPage;
