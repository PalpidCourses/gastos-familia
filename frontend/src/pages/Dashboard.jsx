import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Home, FileText, Users, Settings, Plus, TrendingUp, TrendingDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { expensesAPI, categoriesAPI } from '../services/api';
import ExpenseList from '../components/ExpenseList';

function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [totalMonth, setTotalMonth] = useState(0);
  const [byCategory, setByCategory] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      const [expensesRes, categoriesRes] = await Promise.all([
        expensesAPI.list(),
        categoriesAPI.list(),
      ]);

      const expenses = expensesRes.data || [];
      const categories = categoriesRes.data || [];

      // Gastos del mes actual
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      const monthExpenses = expenses.filter((exp) => {
        const expDate = new Date(exp.created_at);
        return expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear;
      });

      const total = monthExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
      setTotalMonth(total);

      // Total por categoría
      const categoryTotals = {};
      monthExpenses.forEach((exp) => {
        const categoryId = exp.category_id || 'uncategorized';
        if (!categoryTotals[categoryId]) {
          categoryTotals[categoryId] = 0;
        }
        categoryTotals[categoryId] += parseFloat(exp.amount);
      });

      // Mapear nombres de categorías
      const categoryMap = {};
      categories.forEach((cat) => {
        categoryMap[cat.id] = { name: cat.name, icon: cat.icon, color: cat.color };
      });
      categoryMap['uncategorized'] = { name: 'Sin categoría', icon: '📝', color: '#6B7280' };

      const formatted = {};
      Object.entries(categoryTotals).forEach(([id, amount]) => {
        const cat = categoryMap[id] || categoryMap['uncategorized'];
        formatted[id] = { ...cat, amount };
      });

      setByCategory(formatted);
    } catch (err) {
      console.error('Error loading metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };
  
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
            {loading ? (
              <h2 className="text-4xl font-bold text-primary mb-2">...</h2>
            ) : (
              <h2 className="text-4xl font-bold text-primary mb-2">{formatCurrency(totalMonth)}</h2>
            )}
            <p className="text-sm font-semibold text-gray-500">Este mes</p>

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

          <button
            onClick={() => navigate('/categories')}
            className="card text-left hover:shadow-md transition-shadow cursor-pointer"
          >
            <p className="font-semibold text-gray-900 dark:text-white">Categorías</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Gestionar categorías de gastos
            </p>
          </button>
          <button
            onClick={() => navigate('/family-members')}
            className="card text-left hover:shadow-md transition-shadow cursor-pointer"
          >
            <p className="font-semibold text-gray-900 dark:text-white">Miembros de Familia</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Gestionar miembros de familia
            </p>
          </button>

          {/* Gastos por categoría */}
          {!loading && Object.keys(byCategory).length > 0 && (
            <div className="card">
              <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-4">Por categoría</h3>
              <div className="space-y-3">
                {Object.entries(byCategory)
                  .sort(([, a], [, b]) => b.amount - a.amount)
                  .map(([id, cat]) => (
                    <div key={id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{cat.icon}</span>
                        <span className="text-sm text-gray-700 dark:text-gray-300">{cat.name}</span>
                      </div>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">
                        {formatCurrency(cat.amount)}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </aside>

        {/* Main Content */}
        <main className="w-full lg:w-3/4 flex flex-col gap-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
            <button
              onClick={() => navigate('/expenses/new')}
              className="btn-primary"
            >
              <Plus className="h-5 w-5 mr-2" />
              Nuevo Gasto
            </button>
          </div>

          <ExpenseList />
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
          <button
            onClick={() => navigate('/family-members')}
            className="flex flex-col items-center text-gray-600 dark:text-gray-400 text-xs font-medium"
          >
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
