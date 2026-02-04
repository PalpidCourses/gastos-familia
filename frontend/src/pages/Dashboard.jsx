import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Home, FileText, Users, Settings, Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-accent-warm dark:bg-background-dark">
      {/* Header */}
      <header className="bg-white dark:bg-white/5 border-b border-primary/10 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">Gastos Familia</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {user?.name || user?.email}
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-primary transition-colors"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8 flex gap-8">
        {/* Sidebar */}
        <aside className="w-full lg:w-1/4 flex flex-col gap-6">
          <div className="card">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-4">Gasto total del mes</p>
            <h2 className="text-4xl font-bold text-primary mb-2">€1.234</h2>
            <p className="text-sm font-semibold text-primary">+12% vs mes anterior</p>

            <div className="border-t border-primary/10 pt-4 mt-4">
              <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">Alertas</h3>
              <div className="space-y-2">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-bold text-red-700 dark:text-red-400">Luz +5%</p>
                    <p className="text-xs text-red-600 dark:text-red-400/70">Variación detectada</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="w-full lg:w-3/4 flex flex-col gap-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Resumen</h1>
            <button
              onClick={() => navigate('/expenses/new')}
              className="btn-primary"
            >
              <Plus className="h-5 w-5 mr-2" />
              Nuevo Gasto
            </button>
          </div>

          <div className="card">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Bienvenido, {user?.name || 'amigo'} 👋
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Autenticación conectada al backend real. Usuario: <span className="font-mono text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{user?.email}</span>
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                <h3 className="text-lg font-semibold text-primary mb-2">Backend</h3>
                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <li>✅ Conectado</li>
                  <li>✅ Auth JWT funcionando</li>
                  <li>✅ PostgreSQL RLS</li>
                </ul>
              </div>
              <div className="p-4 bg-secondary/10 rounded-lg border border-secondary/20">
                <h3 className="text-lg font-semibold text-secondary-dark mb-2">Sprint 2</h3>
                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <li>⏳ CRUD Categorías</li>
                  <li>⏳ Formulario Gastos</li>
                  <li>⏳ Dashboard real</li>
                </ul>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-background-dark border-t border-primary/10 px-4 py-2 lg:hidden">
        <div className="flex justify-around">
          <button className="flex flex-col items-center text-primary text-xs font-medium">
            <Home className="h-6 w-6 mb-1" />
            Inicio
          </button>
          <button className="flex flex-col items-center text-gray-600 dark:text-gray-400 text-xs font-medium">
            <FileText className="h-6 w-6 mb-1" />
            Gastos
          </button>
          <button className="flex flex-col items-center text-gray-600 dark:text-gray-400 text-xs font-medium">
            <Users className="h-6 w-6 mb-1" />
            Familia
          </button>
          <button className="flex flex-col items-center text-gray-600 dark:text-gray-400 text-xs font-medium">
            <Settings className="h-6 w-6 mb-1" />
            Config
          </button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
