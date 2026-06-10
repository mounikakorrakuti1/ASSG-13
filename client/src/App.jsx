import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import HomePage from "./pages/HomePage";
import PostJobPage from "./pages/PostJobPage";
import JobDetailPage from "./pages/JobDetailPage";
import EditJobPage from "./pages/EditJobPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import RecruiterDashboard from "./pages/RecruiterDashboard";
import CandidateDashboard from "./pages/CandidateDashboard";
import NotFoundPage from "./pages/NotFoundPage";

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("mjp-dark") === "true";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", darkMode ? "dark" : "light");
    localStorage.setItem("mjp-dark", darkMode);
  }, [darkMode]);

  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="app-wrapper">
          <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
          <main className="main-content">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/jobs/:id" element={<JobDetailPage />} />

              {/* Recruiter-only routes */}
              <Route path="/post-job" element={
                <ProtectedRoute role="recruiter"><PostJobPage /></ProtectedRoute>
              } />
              <Route path="/jobs/:id/edit" element={
                <ProtectedRoute role="recruiter"><EditJobPage /></ProtectedRoute>
              } />
              <Route path="/dashboard" element={
                <ProtectedRoute role="recruiter"><RecruiterDashboard /></ProtectedRoute>
              } />

              {/* Candidate-only routes */}
              <Route path="/candidate/dashboard" element={
                <ProtectedRoute role="jobseeker"><CandidateDashboard /></ProtectedRoute>
              } />
              <Route path="/candidate/saved-jobs" element={
                <ProtectedRoute role="jobseeker"><CandidateDashboard defaultTab="saved" /></ProtectedRoute>
              } />

              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
          <footer className="app-footer">
            <p>© 2024 MiniJobPortal · Built with React + Node.js + MongoDB · SRKR Engineering College</p>
          </footer>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
