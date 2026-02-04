import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

// Simulación simple de autenticación (se reemplazará con backend real)
const isAuthenticated = () => {
  return localStorage.getItem('token') !== null;
};

function App() {
  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <Routes>
        <Route
          path="/"
          element={isAuthenticated() ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />}
        />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={isAuthenticated() ? <Dashboard /> : <Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
}

export default App;
