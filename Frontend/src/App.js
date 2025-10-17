import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import CreateLog from "./pages/CreateLog";
import LogsList from "./pages/LogsList";
import LogDetails from "./pages/LogDetails";
import UpdateLog from "./pages/UpdateLog";
import Navbar from "./components/Navbar";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import ChangePasswordPage from "./pages/ChangePasswordPage";

// Helper to check if token expired
function isTokenExpired(token) {
  try {
    const { exp } = jwtDecode(token);
    if (!exp) return true;
    return Date.now() >= exp * 1000;
  } catch (e) {
    return true;
  }
}

// ProtectedRoute component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  if (!token || isTokenExpired(token)) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function AppContent({ isDarkMode }) {
  const location = useLocation();
  const token = localStorage.getItem("token");
  const isUserAuthenticated = !!token && !isTokenExpired(token);
  const isPublicPath =
    location.pathname === "/login" || location.pathname === "/register";

  return (
    <>
      {isUserAuthenticated && !isPublicPath && <Navbar isDarkMode={isDarkMode} />}
      <div className={!isPublicPath ? "pt-16" : ""}>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/settings/password"
            element={
              <ProtectedRoute>
                <ChangePasswordPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/create-log"
            element={
              <ProtectedRoute>
                <CreateLog />
              </ProtectedRoute>
            }
          />

          <Route
            path="/logs"
            element={
              <ProtectedRoute>
                <LogsList />
              </ProtectedRoute>
            }
          />

          <Route
            path="/logs/:id"
            element={
              <ProtectedRoute>
                <LogDetails />
              </ProtectedRoute>
            }
          />

          <Route
            path="/logs/update/:id"
            element={
              <ProtectedRoute>
                <UpdateLog />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </>
  );
}

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && isTokenExpired(token)) {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      window.location.href = "/login";
    }
  }, []);

  return (
    <div className={isDarkMode ? "dark" : ""}>
      <Router>
        <AppContent isDarkMode={isDarkMode} />

      </Router>
    </div>
  );
}

export default App;
