// src/App.jsx
import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';

// Import all our pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import StudentDashboard from './pages/StudentDashboard';
import AdminDashboard from './pages/AdminDashboard';

// This component now checks the loading state before protecting a route
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  // If the app is still checking for a user, show a loading message
  if (loading) {
    return <div>Loading...</div>;
  }

  // If loading is finished, check if there is a user
  return user ? children : <Navigate to="/login" />;
};

// This component also checks the loading state for admin routes
const AdminRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  // If the app is still checking, show a loading message
  if (loading) {
    return <div>Loading...</div>;
  }

  // If loading is finished, check for an admin user
  return user && user.role === 'admin' ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected Student Route */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />

        {/* Protected Admin Route */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />

        {/* Default route redirects to login */}
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;