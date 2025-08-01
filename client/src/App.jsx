import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';

// Import all our pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import StudentDashboard from './pages/StudentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import UserManagement from './pages/UserManagement';
import ClassAdviserDashboard from './pages/ClassAdviserDashboard';
import HODDashboard from './pages/HODDashboard';
import PrincipalDashboard from './pages/PrincipalDashboard';
import OfficeStaffDashboard from './pages/OfficeStaffDashboard';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div>Loading...</div>;
  return user ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div>Loading...</div>;
  return user && user.role === 'admin' ? children : <Navigate to="/login" />;
};

const AdviserRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  const allowedRoles = ['classAdviser', 'admin'];
  if (loading) return <div>Loading...</div>;
  return user && allowedRoles.includes(user.role) ? children : <Navigate to="/login" />;
};

const HODRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  const allowedRoles = ['hod', 'admin'];
  if (loading) return <div>Loading...</div>;
  return user && allowedRoles.includes(user.role) ? children : <Navigate to="/login" />;
};

const PrincipalRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  const allowedRoles = ['principal', 'admin'];
  if (loading) return <div>Loading...</div>;
  return user && allowedRoles.includes(user.role) ? children : <Navigate to="/login" />;
};

const OfficeStaffRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  const allowedRoles = ['officeStaff', 'admin'];
  if (loading) return <div>Loading...</div>;
  return user && allowedRoles.includes(user.role) ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

        {/* Protected Student Route */}
        <Route path="/dashboard" element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>} />

        {/* Protected Admin Routes */}
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/user-management" element={<AdminRoute><UserManagement /></AdminRoute>} />
        
        {/* Protected Staff Routes */}
        <Route path="/adviser-dashboard" element={<AdviserRoute><ClassAdviserDashboard /></AdviserRoute>} />
        <Route path="/hod-dashboard" element={<HODRoute><HODDashboard /></HODRoute>} />
        <Route path="/principal-dashboard" element={<PrincipalRoute><PrincipalDashboard /></PrincipalRoute>} />
        <Route path="/office-dashboard" element={<OfficeStaffRoute><OfficeStaffDashboard /></OfficeStaffRoute>} />

        {/* Default route redirects to login */}
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;