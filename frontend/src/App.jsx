import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Categories from './pages/Categories';
import FamilyMembers from './pages/FamilyMembers';
import NewExpense from './pages/NewExpense';
import { useAuth } from './contexts/AuthContext';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

function App() {
  return (
    <div className="min-h-screen bg-accent-warm dark:bg-background-dark">
      <Routes>
        <Route
          path="/"
          element={<Navigate to="/dashboard" replace />}
        />
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/categories"
          element={
            <ProtectedRoute>
              <Categories />
            </ProtectedRoute>
          }
        />
        <Route
          path="/family-members"
          element={
            <ProtectedRoute>
              <FamilyMembers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/expenses/new"
          element={
            <ProtectedRoute>
              <NewExpense />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
