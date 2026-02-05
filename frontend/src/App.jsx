import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Categories from './pages/Categories';
import Invitations from './pages/Invitations';
import Invite from './pages/Invite';
import FamilyMembers from './pages/FamilyMembers';
import NewExpense from './pages/NewExpense';
import { useAuth } from './contexts/AuthContext';

// ── Placeholder genérico para páginas en desarrollo ──
function PlaceholderPage({ title, emoji }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ backgroundColor: '#F4F1DE' }}>
      <div className="bg-white rounded-[12px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-10 max-w-sm w-full text-center">
        <div className="text-5xl mb-4">{emoji || '🧱'}</div>
        <h1 className="text-xl font-bold text-gray-800 mb-2">{title}</h1>
        <p className="text-sm text-gray-500 mb-6">Esta página está en desarrollo</p>
        <button
          onClick={() => window.history.back()}
          className="px-5 py-2 rounded-lg text-white font-semibold transition-opacity hover:opacity-90"
          style={{ backgroundColor: '#e17c60' }}
        >
          Volver
        </button>
      </div>
    </div>
  );
}

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
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<Login />} />

        <Route path="/dashboard" element={
          <ProtectedRoute><Dashboard /></ProtectedRoute>
        } />
        <Route path="/categories" element={
          <ProtectedRoute><Categories /></ProtectedRoute>
        } />
        <Route path="/family-members" element={
          <ProtectedRoute><FamilyMembers /></ProtectedRoute>
        } />
        <Route path="/invitations" element={
          <ProtectedRoute><Invitations /></ProtectedRoute>
        } />
        <Route path="/expenses/new" element={
          <ProtectedRoute><NewExpense /></ProtectedRoute>
        } />

        {/* Páginas en desarrollo (placeholder) */}
        <Route path="/analytics" element={
          <ProtectedRoute><PlaceholderPage title="Analytics" emoji="📊" /></ProtectedRoute>
        } />
        <Route path="/receipts" element={
          <ProtectedRoute><PlaceholderPage title="Receipts" emoji="🧾" /></ProtectedRoute>
        } />
        <Route path="/recurring" element={
          <ProtectedRoute><PlaceholderPage title="Gastos Recurrentes" emoji="🔁" /></ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute><PlaceholderPage title="Settings" emoji="⚙️" /></ProtectedRoute>
        } />
        <Route path="/expenses" element={
          <ProtectedRoute><PlaceholderPage title="Todos los gastos" emoji="💰" /></ProtectedRoute>
        } />

        {/* Invitaciones (público) */}
        <Route path="/invite/:code" element={<Invite />} />
      </Routes>
    </div>
  );
}

export default App;
