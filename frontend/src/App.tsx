import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import BudgetsAndBills from './pages/BudgetsAndBills';
import Reports from './pages/Reports';

// Inner component: reads auth from context (must be inside <AuthProvider>)
const AppRoutes: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/login"    element={!isAuthenticated ? <Login />    : <Navigate to="/dashboard" />} />
      <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" />} />
      <Route path="/dashboard" element={isAuthenticated ? <Dashboard />          : <Navigate to="/login" />} />
      <Route path="/profile"   element={isAuthenticated ? <Profile />            : <Navigate to="/login" />} />
      <Route path="/controls"  element={isAuthenticated ? <BudgetsAndBills />    : <Navigate to="/login" />} />
      <Route path="/reports"   element={isAuthenticated ? <Reports />            : <Navigate to="/login" />} />
      <Route path="*" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
