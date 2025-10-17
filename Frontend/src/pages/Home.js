import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getMyProfile } from "../api/api";

function Home() {
  const [name, setName] = useState("Developer");
  const fullMessage = "Your journey of knowledge, captured.";

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getMyProfile();
        setName(res.data.name || "Developer");
      } catch (error) {
        console.error("Failed to fetch profile", error);
      }
    };
    fetchProfile();
  }, []);

  return (
    <div className="relative min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 overflow-hidden">
      {/* Background gradient waves */}
      <div className="absolute inset-0 z-0">
        <svg
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 320"
        >
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: "#007bff", stopOpacity: 0.7 }} />
              <stop offset="100%" style={{ stopColor: "#1f2937", stopOpacity: 0.7 }} />
            </linearGradient>
          </defs>
          <path
            d="M0,160L48,165.3C96,171,192,181,288,181.3C384,181,480,171,576,154.7C672,139,768,117,864,128C960,139,1056,181,1152,181.3C1248,181,1344,139,1392,117.3L1440,96L1440,0L0,0Z"
            fill="url(#gradient)"
            className="animate-slow-wave opacity-80"
          />
        </svg>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 pt-24 md:pt-32 lg:pt-40">
        {/* Greeting */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 animate-fade-in-up">
          Welcome,{" "}
          <span className="text-blue-600 dark:text-blue-400">{name}</span>!
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-12 animate-fade-in-slow">
          {fullMessage}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row gap-6 md:gap-8">
          <Link
            to="/create-log"
            className="flex items-center justify-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-lg shadow-lg transform transition-all duration-300 hover:scale-105 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            ➕ Create New Log
          </Link>
          <Link
            to="/logs"
            className="flex items-center justify-center px-8 py-4 bg-gray-300 hover:bg-gray-400 text-gray-900 font-semibold rounded-lg text-lg shadow-lg transform transition-all duration-300 hover:scale-105 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
          >
            📑 View All Logs
          </Link>
        </div>

        {/* Footer / quick hint */}
        <p className="mt-12 text-sm text-gray-500 dark:text-gray-400 max-w-md animate-fade-in-slow">
          Start documenting your solutions, problems, and ideas in a structured way.
        </p>
      </div>

      {/* Custom animations */}
      <style>
        {`
          .animate-fade-in-up {
            animation: fadeInUp 1s ease forwards;
          }
          .animate-fade-in-slow {
            animation: fadeIn 2s ease forwards;
          }
          .animate-slow-wave {
            animation: wave 12s linear infinite;
          }

          @keyframes fadeInUp {
            0% { opacity: 0; transform: translateY(30px); }
            100% { opacity: 1; transform: translateY(0); }
          }

          @keyframes fadeIn {
            0% { opacity: 0; }
            100% { opacity: 1; }
          }

          @keyframes wave {
            0% { transform: translateX(0); }
            100% { transform: translateX(-20px); }
          }
        `}
      </style>
    </div>
  );
}

export default Home;
