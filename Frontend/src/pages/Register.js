import React, { useState } from "react";
import { registerUser } from "../api/api";
import { useNavigate, Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Register() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    name: "",
    email: "",
    role: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.username || !formData.password || !formData.name || !formData.email) {
          toast.error("Please fill in all required fields.", { autoClose: 3000 });
          setLoading(false);
          return;
      }

      const dataToSend = { ...formData };
      await registerUser(dataToSend); 
      
      toast.success("Registration successful! Redirecting to login...", {
        position: "top-right",
        autoClose: 2000,
      });
      setTimeout(() => navigate("/login"), 2500);

    } catch (err) {
      const message = err.response?.data?.message || "Registration failed. Please try again.";
      toast.error(message, { position: "top-right", autoClose: 3000 });
    } finally {
      setLoading(false);
    }
  };

  const RoleOptions = [
    "Backend Developer", "Frontend Developer", "Full Stack Developer", 
    "DevOps Engineer", "QA Engineer", "Project Manager", "Other"
  ];

  const FormLabel = ({ htmlFor, label }) => (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
  );

  return (
    <div className="flex min-h-screen bg-gray-100 text-gray-900">
      <ToastContainer />

      <div className="hidden md:grid md:w-7/12 lg:w-8/12 bg-gray-50 p-12 lg:p-20 relative overflow-hidden place-items-center">
  <div className="absolute inset-0 opacity-30"> {/* Increased opacity from 0.1 to 0.3 */}
      <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle cx="20" cy="80" r="15" fill="#007bff"/>
          <circle cx="80" cy="20" r="25" fill="#d1d5db" stroke="#007bff" strokeWidth="1"/>
          <rect x="50" y="50" width="30" height="30" fill="#007bff" opacity="0.3"/>
      </svg>
  </div>

  <div className="relative z-10 max-w-lg text-center">
    <h1 className="text-5xl font-extrabold text-blue-800 mb-6 animate-pulse">EchoTrace</h1> {/* Changed from gray-900 to blue-600 */}
    <blockquote className="italic text-2xl text-gray-700 border-l-4 border-blue-500 pl-4">
      “The computer programmer is a creator of universes for which he alone is the lawgiver.”
      <footer className="mt-4 text-lg font-semibold text-blue-600">— Joseph Weizenbaum</footer>
    </blockquote>
    <p className="mt-8 text-sm text-gray-600">
      Track your solutions, grow your expertise, and never solve the same problem twice.
    </p>
  </div>
</div>


      <div className="w-full md:w-5/12 lg:w-4/12 flex items-center justify-center p-8 md:p-10">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-bold mb-2 text-blue-600">Join EchoTrace</h2>
          <p className="text-gray-700 mb-8 text-sm">
            Please fill out your professional profile to register.
          </p>

          <form onSubmit={handleRegister} className="space-y-6">
            <div>
              <FormLabel htmlFor="name" label="Name" />
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors duration-200"
                required
              />
            </div>

            <div>
              <FormLabel htmlFor="email" label="Email" />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors duration-200"
                required
              />
            </div>

            <div>
              <FormLabel htmlFor="username" label="Username" />
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors duration-200"
                required
              />
            </div>

            <div className="relative">
              <FormLabel htmlFor="password" label="Password" />
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors duration-200 pr-12"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 mt-1.5 transform -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors duration-200"
              >
                {showPassword ? (
                  <svg className="w-5 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 10"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.22 0-8.03-2.14-9.5-5.5a10.02 10.02 0 016.3-5.3m2.57-2.02A10.05 10.05 0 0112 5c4.22 0 8.03 2.14 9.5 5.5a10.02 10.02 0 01-4.75 4.31m-3.25-1.99a3 3 0 11-3-3m3 3l-3-3"></path></svg>
                ) : (
                  <svg className="w-5 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 10"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                )}
              </button>
            </div>

            <div className="relative">
              <FormLabel htmlFor="role" label="Developer Role" />
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors duration-200 appearance-none"
                required
              >
                  <option value="" disabled>Select your primary role</option>
                  {RoleOptions.map(role => (
                      <option key={role} value={role}>{role}</option>
                  ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none" style={{ top: '1.75rem' }}>
                  <svg className="w-4 h-4 fill-current text-gray-400" viewBox="0 0 20 20"><path d="M7 10l5 5 5-5H7z"/></svg>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg text-lg transition-all duration-200 disabled:bg-gray-500 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                "Register"
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-gray-700 text-sm">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-600 hover:underline">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
