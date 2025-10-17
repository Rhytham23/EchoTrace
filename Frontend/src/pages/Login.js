import React, { useState } from "react";
import { loginUser } from "../api/api";
import { useNavigate, Link } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const FormLabel = ({ htmlFor, label }) => (
    <label
      htmlFor={htmlFor}
      className="block text-sm font-medium text-gray-700 mb-1"
    >
      {label}
    </label>
  );

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    if (!username.trim() || !password.trim()) {
      setErrorMessage("Username and password cannot be empty.");
      setLoading(false);
      return;
    }

    try {
      await loginUser({ username, password });
      setTimeout(() => navigate("/"), 50);
    } catch (err) {
      const message =
        err.response?.data?.body ||
        err.response?.data?.message ||
        "Login failed: Invalid credentials or server issue.";
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 text-gray-900 p-4">
      <div className="p-8 md:p-10 rounded-xl shadow-2xl w-full max-w-sm border bg-white border-gray-200 transform hover:scale-105 transition-transform duration-300">
        <h2 className="text-3xl font-bold mb-6 text-center text-blue-600">
          Welcome Back
        </h2>
        <p className="mb-6 text-center text-gray-600">
          Sign in to track your development progress.
        </p>

        {errorMessage && (
          <div className="border p-3 rounded-lg mb-4 text-center text-sm font-medium bg-red-100 text-red-800 border-red-300">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <FormLabel htmlFor="username" label="Username" />
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border bg-gray-100 text-gray-900 border-gray-300 focus:outline-none focus:border-blue-500 transition-colors duration-200"
              required
            />
          </div>

          <div className="relative">
            <FormLabel htmlFor="password" label="Password" />
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border bg-gray-100 text-gray-900 border-gray-300 focus:outline-none focus:border-blue-500 transition-colors duration-200 pr-12"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 mt-3 transform -translate-y-1/2 text-gray-500 hover:text-blue-600 transition-colors duration-200"
            >
              {showPassword ? (
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
          </div>

          <button
            type="submit"
            className="w-full font-bold py-3 px-4 rounded-lg text-lg bg-blue-500 hover:bg-blue-600 text-white disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200"
            disabled={loading}
          >
            {loading ? (
              <svg
                className="animate-spin h-5 w-5 text-white inline-block"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : (
              "Login"
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <Link to="/register" className="font-medium text-blue-600 hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
