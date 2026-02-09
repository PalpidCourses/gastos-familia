import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LogOut, Home, Users, Settings, Plus, TrendingUp, TrendingDown,
  Bell, AlertTriangle, Search, Repeat, FileText, BarChart2, PieChart,
  ChevronLeft, ChevronRight, Loader2, Eye, EyeOff, Calendar, Filter, X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { expensesAPI, categoriesAPI, recurringAPI } from '../services/api';

// ── Donut Chart con interatividad ──
function DonutChart({ segments, total, formatCurrency, onCategoryClick, selectedCategory }) {
  const R = 72;
  const C = 2 * Math.PI * R;
  let cum = 0;

  return (
    <div className="relative inline-block cursor-pointer">
      <svg viewBox="0 0 180 180" width="180" height="180" className="flex-shrink-0">
        {segments.map((seg, i) => {
          const len = total > 0 ? (seg.amount / total) * C : 0;
          const off = cum;
          cum += len;
          const isSelected = selectedCategory === seg.id;
          return (
            <circle
              key={i}
              cx="90" cy="90" r={R}
              fill="none"
              stroke={seg.color || '#aaa'}
              strokeWidth={isSelected ? 28 : 22}
              strokeDasharray={`${len} ${C - len}`}
              strokeDashoffset={-off}
              transform="rotate(-90 90 90)"
              className={`transition-all duration-300 ${isSelected ? 'opacity-100' : 'opacity-80 hover:opacity-100'}`}
              onClick={() => onCategoryClick && onCategoryClick(seg)}
              style={{ cursor: onCategoryClick ? 'pointer' : 'default' }}
            />
          );
        })}
        <circle cx="90" cy="90" r={55} fill="white" />
        <text x="90" y="84" textAnchor="middle" fontSize="9" fill="#6B7280" fontFamily="Inter, sans-serif">Total</text>
        <text x="90" y="102" textAnchor="middle" fontSize="14" fontWeight="700" fill="#e17c60" fontFamily="Inter, sans-serif">
          {formatCurrency(total)}
        </text>
      </svg>
      {selectedCategory && (
        <button
          onClick={() => onCategoryClick(null)}
          className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
        >
          <X className="h-3 w-3 text-gray-600" />
        </button>
      )}
    </div>
  );
}

// ── Top Navigation mejorado con breadcrumbs ──
const NAV_LINKS = [
  { label: 'Dashboard', path: '/dashboard', icon: Home },
  { label: 'Analytics', path: '/analytics', icon: BarChart2 },
  { label: 'Receipts', path: '/receipts', icon: FileText },
  { label: 'Recurring', path: '/recurring', icon: Repeat },
];

function TopNav({ user, onLogout, currentDate }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showSearch, setShowSearch] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 md:px-6 py-3 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <h1 className="text-xl font-bold flex items-center gap-2" style={{ color: '#e17c60' }}>
          <PieChart className="h-6 w-6" />
          FamilyFinance
        </h1>

        {/* Breadcrumbs */}
        <div className="hidden md:flex items-center gap-1 text-sm text-gray-500">
          <span className="hover:text-gray-700 cursor-pointer" onClick={() => navigate('/')}>
            <Home className="h-4 w-4 inline" />
          </span>
          <ChevronRight className="h-3 w-3" />
          <span className="text-gray-700 font-medium">Dashboard</span>
          {currentDate && (
            <>
              <ChevronRight className="h-3 w-3" />
              <span>{currentDate}</span>
            </>
          )}
        </div>

        {/* Nav links (desktop) */}
        <nav className="hidden lg:flex items-center gap-1">
          {NAV_LINKS.map(({ label, path, icon: Icon }) => {
            const active = location.pathname === path;
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg transition-all duration-200 ${
                  active
                    ? 'shadow-md transform scale-105'
                    : 'hover:bg-gray-100'
                }`}
                style={active ? { backgroundColor: '#e17c60', color: '#fff' } : { color: '#6B7280' }}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            );
          })}
        </nav>

        {/* Right: search · bell · avatar · logout */}
        <div className="flex items-center gap-2">
          {showSearch ? (
            <input
              type="text"
              placeholder="Buscar gastos..."
              className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-200 w-48 transition-all"
              autoFocus
            />
          ) : (
            <button
              onClick={() => setShowSearch(true)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
            >
              <Search className="h-5 w-5" />
            </button>
          )}
          <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#e17c60' }} />
          </button>
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold cursor-pointer hover:opacity-80 transition-opacity shadow-sm"
            style={{ backgroundColor: '#81B29A' }}
            onClick={() => navigate('/settings')}
          >
            {(user?.name || user?.email || '?')[0].toUpperCase()}
          </div>
          <button
            onClick={onLogout}
            className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
            title="Cerrar sesión"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}

// ── Alerta mejorada con niveles de severidad ──
function AlertCard({ severity, title, description, icon, onDismiss }) {
  const severityStyles = {
    critical: { bg: 'bg-red-50', border: 'border-red-200', title: 'text-red-800', desc: 'text-red-600', dot: 'bg-red-500' },
    warning: { bg: 'bg-amber-50', border: 'border-amber-200', title: 'text-amber-800', desc: 'text-amber-600', dot: 'bg-amber-500' },
    info: { bg: 'bg-blue-50', border: 'border-blue-200', title: 'text-blue-800', desc: 'text-blue-600', dot: 'bg-blue-500' },
    success: { bg: 'bg-green-50', border: 'border-green-200', title: 'text-green-800', desc: 'text-green-600', dot: 'bg-green-500' },
  };

  const styles = severityStyles[severity] || severityStyles.info;

  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-xl border ${styles.bg} ${styles.border} relative transition-all hover:shadow-md`}
    >
      <button
        onClick={onDismiss}
        className="absolute top-2 right-2 p-1 hover:bg-black/5 rounded transition-colors"
      >
        <X className="h-3 w-3 opacity-50 hover:opacity-100" />
      </button>
      <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${styles.dot}`} />
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-bold ${styles.title} flex items-center gap-1.5`}>
          {icon}
          {title}
        </p>
        <p className={`text-xs mt-0.5 ${styles.desc}`}>{description}</p>
      </div>
    </div>
  );
}

// ── Main Dashboard mejorado ──
export default function DashboardImproved() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Estados
  const [totalMonth, setTotalMonth] = useState(0);
  const [totalLastMonth, setTotalLastMonth] = useState(0);
  const [byCategory, setByCategory] = useState([]);
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [recurringExpenses, setRecurringExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [alerts, setAlerts] = useState([]);
  const [dismissedAlerts, setDismissedAlerts] = useState([]);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [expRes, catRes, recRes] = await Promise.all([
        expensesAPI.list(),
        categoriesAPI.list(),
        recurringAPI.list(),
      ]);

      const expenses = expRes.data || [];
      const categories = catRes.data || [];
      const recurring = recRes.data || [];

      const now = new Date();
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1);

      // Gastos del mes actual
      const monthExps = expenses.filter(e => {
        const d = new Date(e.created_at);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      });

      // Gastos del mes anterior
      const lastMonthExps = expenses.filter(e => {
        const d = new Date(e.created_at);
        return d.getMonth() === lastMonth.getMonth() && d.getFullYear() === lastMonth.getFullYear();
      });

      setTotalMonth(monthExps.reduce((s, e) => s + parseFloat(e.amount), 0));
      setTotalLastMonth(lastMonthExps.reduce((s, e) => s + parseFloat(e.amount), 0));

      // Map categorías
      const catMap = {};
      categories.forEach(c => { catMap[c.id] = c; });

      // Agrupar por categoría
      const grouped = {};
      monthExps.forEach(e => {
        const cid = e.category_id || '__none__';
        grouped[cid] = (grouped[cid] || 0) + parseFloat(e.amount);
      });

      setByCategory(
        Object.entries(grouped)
          .map(([id, amount]) => {
            const c = catMap[id] || { name: 'Sin categoría', icon: '📝', color: '#6B7280' };
            return { id, name: c.name, icon: c.icon, color: c.color || '#6B7280', amount };
          })
          .sort((a, b) => b.amount - a.amount)
      );

      // Últimos 10 gastos
      const sorted = [...expenses].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setRecentExpenses(
        sorted.slice(0, 10).map(e => ({
          ...e,
          categoryName: catMap[e.category_id]?.name || 'Sin categoría',
          categoryIcon: catMap[e.category_id]?.icon || '📝',
          categoryColor: catMap[e.category_id]?.color || '#6B7280',
        }))
      );

      // Gastos recurrentes próximos (próximos 30 días)
      const upcomingRecurring = recurring
        .filter(r => {
          const nextDate = new Date(r.next_date);
          const daysUntil = Math.ceil((nextDate - now) / (1000 * 60 * 60 * 24));
          return r.is_active && daysUntil >= 0 && daysUntil <= 30;
        })
        .sort((a, b) => new Date(a.next_date) - new Date(b.next_date));

      setRecurringExpenses(upcomingRecurring);

      // Generar alertas dinámicas
      const newAlerts = [];
      const percentChange = lastMonthExps.length > 0
        ? ((totalMonth - totalLastMonth) / totalLastMonth) * 100
        : 0;

      if (Math.abs(percentChange) > 15) {
        newAlerts.push({
          id: 'budget-over',
          severity: percentChange > 0 ? 'critical' : 'warning',
          icon: percentChange > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />,
          title: percentChange > 0 ? 'Gastos por encima del presupuesto' : 'Gastos por debajo del presupuesto',
          description: `${Math.abs(percentChange).toFixed(0)}% vs mes anterior`,
        });
      }

      if (byCategory.length === 0) {
        newAlerts.push({
          id: 'no-categories',
          severity: 'warning',
          icon: <AlertTriangle className="h-4 w-4" />,
          title: 'Sin categorías asignadas',
          description: 'Asigna categorías a tus gastos para mejor seguimiento',
        });
      }

      // Alertas de gastos recurrentes
      upcomingRecurring.slice(0, 3).forEach((r, i) => {
        const daysUntil = Math.ceil((new Date(r.next_date) - now) / (1000 * 60 * 60 * 24));
        newAlerts.push({
          id: `recurring-${i}`,
          severity: daysUntil <= 2 ? 'critical' : daysUntil <= 7 ? 'warning' : 'info',
          icon: <Repeat className="h-4 w-4" />,
          title: r.description || r.category_id,
          description: `Próximo pago en ${daysUntil} días (${new Date(r.next_date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })})`,
        });
      });

      setAlerts(newAlerts);
    } catch (err) {
      console.error('Error cargando datos:', err);
    } finally {
      setLoading(false);
    }
  };

  const fmt = n => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(n);
  const handleLogout = () => { logout(); navigate('/login'); };
  const maxCat = byCategory.length ? byCategory[0].amount : 1;
  const monthName = currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  const percentChange = totalLastMonth > 0 ? ((totalMonth - totalLastMonth) / totalLastMonth) * 100 : 0;
  const filteredExpenses = selectedCategory
    ? recentExpenses.filter(e => e.category_id === selectedCategory || (!selectedCategory && !e.category_id))
    : recentExpenses;

  const activeAlerts = alerts.filter(a => !dismissedAlerts.includes(a.id));

  const handleCategoryClick = (category) => {
    setSelectedCategory(category?.id || null);
  };

  const handleMonthChange = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
    // Recargar datos para el nuevo mes
    setTimeout(loadData, 100);
  };

  const handleDismissAlert = (alertId) => {
    setDismissedAlerts([...dismissedAlerts, alertId]);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F4F1DE' }}>
      <TopNav user={user} onLogout={handleLogout} currentDate={monthName} />

      <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col lg:flex-row gap-6">
        {loading ? (
          <div className="flex items-center justify-center w-full h-64">
            <Loader2 className="h-8 w-8 animate-spin" style={{ color: '#e17c60' }} />
            <span className="ml-3 text-gray-500">Cargando datos...</span>
          </div>
        ) : (
          <>
            {/* ─── LEFT SIDEBAR mejorada ─── */}
            <aside className="w-full lg:w-1/4 flex flex-col gap-5">
              {/* Gasto Total con contexto temporal */}
              <div className="bg-white rounded-[16px] shadow-[0_4px_16px_rgba(0,0,0,0.1)] p-6 border-2 border-white transition-all hover:shadow-[0_6px_24px_rgba(0,0,0,0.12)]">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Gasto Total</p>
                  <button
                    onClick={() => handleMonthChange(-1)}
                    className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Mes anterior"
                  >
                    <ChevronLeft className="h-4 w-4 text-gray-400" />
                  </button>
                </div>
                <h2 className="text-4xl font-bold mb-1" style={{ color: '#e17c60' }}>
                  {fmt(totalMonth)}
                </h2>
                <p className="text-sm text-gray-500 mb-2">{monthName}</p>
                <div className={`flex items-center gap-2 text-sm font-medium ${
                  percentChange > 0 ? 'text-green-600' : percentChange < 0 ? 'text-red-600' : 'text-gray-500'
                }`}>
                  {percentChange > 0 ? <TrendingUp className="h-4 w-4" /> : percentChange < 0 ? <TrendingDown className="h-4 w-4" /> : null}
                  <span>
                    {Math.abs(percentChange) > 0
                      ? `${percentChange > 0 ? '+' : ''}${percentChange.toFixed(1)}% vs mes anterior`
                      : 'Sin datos de comparación'
                    }
                  </span>
                </div>
              </div>

              {/* Por Categoría con barras de progreso */}
              <div className="bg-white rounded-[16px] shadow-[0_4px_16px_rgba(0,0,0,0.1)] p-6 border-2 border-white">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <PieChart className="h-4 w-4" style={{ color: '#e17c60' }} />
                  Por Categoría
                </h3>
                <div className="space-y-3">
                  {byCategory.slice(0, 7).map(cat => (
                    <div key={cat.id} className="group cursor-pointer" onClick={() => handleCategoryClick(cat)}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-lg">{cat.icon}</span>
                          <span className="text-sm text-gray-700 font-medium truncate">{cat.name}</span>
                        </div>
                        <span className="text-sm font-bold text-gray-800">{fmt(cat.amount)}</span>
                      </div>
                      <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500 group-hover:brightness-110"
                          style={{ width: `${(cat.amount / maxCat) * 100}%`, backgroundColor: cat.color }}
                        />
                      </div>
                    </div>
                  ))}
                  {byCategory.length === 0 && (
                    <p className="text-sm text-gray-400 text-center py-4">
                      Sin gastos este mes
                    </p>
                  )}
                </div>
              </div>

              {/* Alertas mejoradas */}
              {activeAlerts.length > 0 && (
                <div className="bg-white rounded-[16px] shadow-[0_4px_16px_rgba(0,0,0,0.1)] p-6 border-2 border-white">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Bell className="h-4 w-4 text-amber-500" /> Alertas ({activeAlerts.length})
                  </h3>
                  <div className="space-y-3">
                    {activeAlerts.map(alert => (
                      <AlertCard
                        key={alert.id}
                        severity={alert.severity}
                        title={alert.title}
                        description={alert.description}
                        icon={alert.icon}
                        onDismiss={() => handleDismissAlert(alert.id)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Scan AI Receipt CTA mejorado */}
              <button
                onClick={() => navigate('/receipts/scan')}
                className="w-full text-left p-5 rounded-[16px] text-white flex items-center gap-4 transition-all hover:scale-[1.02] active:scale-[0.98] hover:shadow-xl"
                style={{ background: 'linear-gradient(135deg, #e17c60 0%, #c66a4e 100%)' }}
              >
                <span className="text-3xl">📸</span>
                <div className="flex-1">
                  <p className="font-bold text-base">Scan AI Receipt</p>
                  <p className="text-xs opacity-90 mt-0.5">Añadir gasto desde foto con IA</p>
                </div>
                <ChevronRight className="h-5 w-5 opacity-70" />
              </button>

              {/* Link de ayuda */}
              <button
                onClick={() => window.open('https://github.com/aretaslabtech/gastos-familia', '_blank')}
                className="text-xs text-gray-400 hover:text-gray-600 text-left p-2 transition-colors"
              >
                ¿Necesitas ayuda?
              </button>
            </aside>

            {/* ─── RIGHT MAIN mejorado ─── */}
            <main className="w-full lg:w-3/4 flex flex-col gap-6">
              {/* Donut chart interactivo + CTA destacado */}
              <div className="bg-white rounded-[16px] shadow-[0_4px_16px_rgba(0,0,0,0.1)] p-6 border-2 border-white">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                      <PieChart className="h-4 w-4" style={{ color: '#e17c60' }} />
                      Distribución de gastos
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">
                      {selectedCategory
                        ? `Filtrado: ${byCategory.find(c => c.id === selectedCategory)?.name || 'Todos'}`
                        : 'Clic en una categoría para filtrar'
                      }
                    </p>
                  </div>
                  <button
                    onClick={() => navigate('/expenses/new')}
                    className="flex items-center gap-2 text-sm font-semibold text-white px-5 py-2.5 rounded-xl transition-all hover:shadow-lg hover:scale-105 active:scale-95"
                    style={{ backgroundColor: '#e17c60' }}
                  >
                    <Plus className="h-4 w-4" /> Nuevo Gasto
                  </button>
                </div>
                <div className="flex items-center gap-8 flex-wrap">
                  <DonutChart
                    segments={byCategory}
                    total={totalMonth}
                    formatCurrency={fmt}
                    onCategoryClick={handleCategoryClick}
                    selectedCategory={selectedCategory}
                  />
                  <div className="flex-1 min-w-0 space-y-2">
                    {byCategory.slice(0, 7).map(cat => (
                      <div
                        key={cat.id}
                        className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all ${
                          selectedCategory === cat.id ? 'bg-orange-50 ring-2 ring-orange-200' : 'hover:bg-gray-50'
                        }`}
                        onClick={() => handleCategoryClick(cat)}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div
                            className="w-3 h-3 rounded-full flex-shrink-0 transition-all"
                            style={{ backgroundColor: cat.color }}
                          />
                          <span className="text-sm text-gray-700 truncate">{cat.icon} {cat.name}</span>
                        </div>
                        <span className="text-sm font-semibold text-gray-800 ml-2">{fmt(cat.amount)}</span>
                      </div>
                    ))}
                    {byCategory.length === 0 && (
                      <p className="text-sm text-gray-400 text-center py-4">Sin datos</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Gastos recurrentes próximos mejorados */}
              {recurringExpenses.length > 0 && (
                <div className="bg-white rounded-[16px] shadow-[0_4px_16px_rgba(0,0,0,0.1)] p-6 border-2 border-white">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                      <Repeat className="h-4 w-4" style={{ color: '#81B29A' }} />
                      Gastos recurrentes próximos
                    </h3>
                    <button onClick={() => navigate('/recurring')} className="text-xs font-semibold px-3 py-1 rounded-lg hover:bg-gray-100 transition-colors" style={{ color: '#e17c60' }}>
                      Ver todos ({recurringExpenses.length}) →
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {recurringExpenses.slice(0, 6).map((exp, i) => {
                      const daysUntil = Math.ceil((new Date(exp.next_date) - new Date()) / (1000 * 60 * 60 * 24));
                      const isUrgent = daysUntil <= 3;
                      return (
                        <div
                          key={i}
                          className={`p-4 rounded-xl border-2 transition-all hover:shadow-md cursor-pointer ${
                            isUrgent ? 'border-red-200 bg-red-50' : 'border-gray-100 bg-gray-50'
                          }`}
                          onClick={() => navigate(`/recurring/${exp.id}`)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-lg">{exp.category_id || exp.description}</span>
                            {isUrgent && <AlertTriangle className="h-4 w-4 text-red-500" />}
                          </div>
                          <p className={`text-lg font-bold mb-1 ${isUrgent ? 'text-red-700' : ''}`}>
                            {fmt(exp.amount)}
                          </p>
                          <p className={`text-xs mt-0.5 ${isUrgent ? 'text-red-600' : 'text-gray-500'}`}>
                            {new Date(exp.next_date).toLocaleDateString('es-ES', {
                              weekday: 'short',
                              day: 'numeric',
                              month: 'short',
                            })}
                            {' · '}{daysUntil} días restantes
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Últimos gastos con tabla mejorada */}
              <div className="bg-white rounded-[16px] shadow-[0_4px_16px_rgba(0,0,0,0.1)] p-6 border-2 border-white">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-gray-700">Últimos gastos</h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {filteredExpenses.length} de {recentExpenses.length} {selectedCategory && `filtrados por categoría`}
                    </p>
                  </div>
                  <button onClick={() => navigate('/expenses')} className="text-xs font-semibold px-3 py-1 rounded-lg hover:bg-gray-100 transition-colors" style={{ color: '#e17c60' }}>
                    Ver todos ({recentExpenses.length}) →
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b-2 border-gray-100">
                        <th className="text-xs font-semibold text-gray-400 uppercase pb-3 pl-3">Fecha</th>
                        <th className="text-xs font-semibold text-gray-400 uppercase pb-3">Descripción</th>
                        <th className="text-xs font-semibold text-gray-400 uppercase pb-3 text-right pr-3">Importe</th>
                        <th className="text-xs font-semibold text-gray-400 uppercase pb-3">Pagador</th>
                        <th className="text-xs font-semibold text-gray-400 uppercase pb-3 pr-3">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredExpenses.slice(0, 10).map((exp, i) => (
                        <tr key={i} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => navigate(`/expenses/${exp.id}`)}>
                          <td className="py-3 text-sm text-gray-500 pl-3">
                            {new Date(exp.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                          </td>
                          <td className="py-3">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-base">{exp.categoryIcon}</span>
                              <div className="min-w-0">
                                <span className={`text-sm font-medium ${!exp.description || exp.description?.length < 2 ? 'text-gray-400 italic' : 'text-gray-800'}`}>
                                  {exp.description?.trim() || 'Sin descripción'}
                                </span>
                                <div
                                  className="h-1 w-8 rounded-full mt-0.5"
                                  style={{ backgroundColor: exp.categoryColor || '#6B7280' }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="py-3 text-sm font-bold text-right pr-3" style={{ color: '#e17c60' }}>
                            {fmt(exp.amount)}
                          </td>
                          <td className="py-3 text-sm text-gray-500">
                            <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
                              {exp.payer_name || user?.name || '—'}
                            </span>
                          </td>
                          <td className="py-3 pr-3">
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-green-100 text-green-700">
                              Completado
                            </span>
                          </td>
                        </tr>
                      ))}
                      {filteredExpenses.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-8 text-center">
                            <div className="flex flex-col items-center gap-2">
                              <PieChart className="h-8 w-8 text-gray-300" />
                              <p className="text-sm text-gray-400">
                                {selectedCategory ? 'Sin gastos en esta categoría' : 'Sin gastos registrados'}
                              </p>
                              <button
                                onClick={() => navigate('/expenses/new')}
                                className="text-sm font-semibold mt-2 px-4 py-2 rounded-lg transition-all"
                                style={{ color: '#e17c60', backgroundColor: '#FFF7ED' }}
                              >
                                Añadir primer gasto
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </main>
          </>
        )}

        {/* ── Mobile FAB mejorado ── */}
        <button
          onClick={() => navigate('/expenses/new')}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-white lg:hidden transition-all hover:scale-110 hover:shadow-xl active:scale-95"
          style={{ backgroundColor: '#e17c60' }}
        >
          <Plus className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
}
