import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import UploadRecord from './pages/UploadRecord';
import Appointments from './pages/Appointments';
import ProtectedRoute from './components/ProtectedRoute';
import SharedRecordView from './pages/SharedRecordView';
import ErrorBoundary from './components/ErrorBoundary';


const App = () => {
  return (
    <Router>
      <Navbar />
      <ErrorBoundary>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/upload" element={<ProtectedRoute><UploadRecord /></ProtectedRoute>} />
        <Route path="/appointments" element={<ProtectedRoute><Appointments /></ProtectedRoute>} />
        <Route path="/shared/:token" element={<SharedRecordView />} />
      </Routes>
      </ErrorBoundary>
    </Router>
  );
};

export default App;
