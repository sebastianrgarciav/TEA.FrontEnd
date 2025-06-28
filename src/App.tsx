import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Login from './auth/Login';
import Register from './auth/Register';
import PrivateRoute from './auth/PrivateRoute';
import Users from './pages/Users';
import Profile from './pages/Profile';
import Children from './pages/Children';
import AutismoTest from './pages/AutismoTest';
import Dashboard from './pages/Dashboard';
const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/register" element={<Register />} />
        <Route path="/autismotest" element={<AutismoTest />} />
        <Route path="*" element={<AuthenticatedRoutes />} />
      </Routes>
    </Router>
  );
};

const AuthenticatedRoutes: React.FC = () => {
  return (
    <div>
      <Sidebar />
      <div>
        <Navbar />
        <Routes>
          <Route
            path="/users"
            element={
              <PrivateRoute>
                <Users />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />
          <Route
            path="/children"
            element={
              <PrivateRoute>
                <Children />
              </PrivateRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/*"
            element={
              <Navigate to="/login" />
            }
          />
        </Routes>
      </div>
    </div>
  );
};

export default App;
