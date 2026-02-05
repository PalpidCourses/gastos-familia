import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LogOut, Home, Users, Settings, Plus, TrendingUp,
  Bell, AlertTriangle, Search, Repeat, FileText, BarChart2, PieChart
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { expensesAPI, categoriesAPI } from '../services/api';

// ── Donut Chart (pure SVG, no lib) ──
function DonutChart({ segments, total, formatCurrency }) {
  const R = 72;
  const C = 2 * Math.PI * R;
  let cum = 0;

  return (
    <svg viewBox="0 0 180 180" width="180" height="180" className="flex-shrink-0">
      {segments.map((seg, i) => {
        const len = total > 0 ? (seg.amount / total) * C : 0;
        const off = cum;
        cum += len;
        return (
          <circle
            key={i}
            cx="90" cy="90" r={R}
            fill="none"
            stroke={seg.color || '#aaa'}
            strokeWidth="22"
            strokeDasharray={`${len} ${C - len}`}
            strokeDashoffset={-off}
            transform="rotate(-90 90 90)"
          />
        );
      })}
      {/* Centro blanco */}
      <circle cx="90" cy="90" r="55" fill="white" />
      <text x="90" y="84" textAnchor="middle" fontSize="9" fill="#6B7280" fontFamily="Inter, sans-serif">Total</text>
      <text x="90" y="102" textAnchor="middle" fontSize="14" fontWeight="700" fill="#e17c60" fontFamily="Inter, sans-serif">
        {formatCurrency(total)}
      </text>
    </svg>
  );
}

// ── Top Navigation ──
const NAV_LINKS = [
  { label: 'Dashboard', path: '/dashboard', icon: Home },
  { label: 'Analytics', path: '/analytics', icon: BarChart2 },
  { label: 'Receipts',  path: '/receipts',  icon: FileText },
  { label: 'Recurring', path: '/recurring', icon: Repeat },
];

function TopNav({ user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 md:px-6 py-3 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <h1 className="text-xl font-bold" style={{ color: '#e17c60' }}>FamilyFinance</h1>

        {/* Nav links (desktop) */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({ label, path, icon: Icon }) => {
            const active = location.pathname === path;
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg transition-colors"
                style={active
                  ? { backgroundColor: '#e17c60', color: '#fff' }
                  : { color: '#6B7280' }
                }
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            );
          })}
        </nav>

        {/* Right: search · bell · avatar · logout */}
        <div className="flex items-center gap-2">
          <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <Search className="h-5 w-5" />
          </button>
          <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ backgroundColor: '#e17c60' }} />
          </button>
          {/* Avatar */}
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
            style={{ backgroundColor: '#81B29A' }}
          >
            {(user?.name || user?.email || '?')[0].toUpperCase()}
          </div>
          <button onClick={onLogout} className="p-2 text-gray-300 hover:text-gray-500">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}

// ── Main Dashboard ──
export default function Dashboard() {
  const navigate   = useNavigate();
  const { user, logout } = useAuth();
  const [totalMonth,     setTotalMonth]     = useState(0);
  const [byCategory,     setByCategory]     = useState([]);   // [{id,name,icon,color,amount}]
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [loading,        setLoading]        = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [expRes, catRes] = await Promise.all([
        expensesAPI.list(),
        categoriesAPI.list(),
      ]);
      const expenses  = expRes.data  || [];
      const categories = catRes.data || [];

      const now = new Date();
      const monthExps = expenses.filter(e => {
        const d = new Date(e.created_at);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      });

      setTotalMonth(monthExps.reduce((s, e) => s + parseFloat(e.amount), 0));

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

      // Últimos 5 gastos
      const sorted = [...expenses].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setRecentExpenses(
        sorted.slice(0, 5).map(e => ({
          ...e,
          categoryName: catMap[e.category_id]?.name || 'Sin categoría',
          categoryIcon: catMap[e.category_id]?.icon || '📝',
        }))
      );
    } catch (err) {
      console.error('Error cargando datos:', err);
    } finally {
      setLoading(false);
    }
  };

  const fmt = n => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(n);
  const handleLogout = () => { logout(); navigate('/login'); };
  const maxCat = byCategory.length ? byCategory[0].amount : 1;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F4F1DE' }}>
      <TopNav user={user} onLogout={handleLogout} />

      <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col lg:flex-row gap-6">

        {/* ─── LEFT SIDEBAR ─── */}
        <aside className="w-full lg:w-1/4 flex flex-col gap-4">

          {/* Spending summary */}
          <div className="bg-white rounded-[12px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Gasto total mes</p>
            <h2 className="text-3xl font-bold" style={{ color: '#e17c60' }}>
              {loading ? '…' : fmt(totalMonth)}
            </h2>
            <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-green-500" /> Este mes
            </p>
          </div>

          {/* Category breakdown con progress bars */}
          <div className="bg-white rounded-[12px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-5">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Por categoría</h3>
            <div className="space-y-3">
              {byCategory.slice(0, 6).map(cat => (
                <div key={cat.id}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{cat.icon}</span>
                      <span className="text-sm text-gray-700">{cat.name}</span>
                    </div>
                    <span className="text-sm font-bold text-gray-800">{fmt(cat.amount)}</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${(cat.amount / maxCat) * 100}%`, backgroundColor: cat.color }}
                    />
                  </div>
                </div>
              ))}
              {byCategory.length === 0 && !loading && (
                <p className="text-sm text-gray-400">Sin gastos este mes</p>
              )}
            </div>
          </div>

          {/* Urgent Alerts */}
          <div className="bg-white rounded-[12px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-5">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" /> Alertas
            </h3>
            <div className="space-y-2">
              <div className="flex items-start gap-2 p-2 rounded-lg bg-red-50">
                <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-bold text-red-700">Luz +5%</p>
                  <p className="text-xs text-red-500">Variación vs mes anterior</p>
                </div>
              </div>
              <div className="flex items-start gap-2 p-2 rounded-lg bg-amber-50">
                <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-bold text-amber-700">Alquiler due</p>
                  <p className="text-xs text-amber-500">Pago pendiente esta semana</p>
                </div>
              </div>
              <div className="flex items-start gap-2 p-2 rounded-lg bg-blue-50">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-bold text-blue-700">Netflix</p>
                  <p className="text-xs text-blue-500">Recurrente próximo lunes</p>
                </div>
              </div>
            </div>
          </div>

          {/* Scan AI Receipt CTA */}
          <button
            className="w-full text-left p-4 rounded-[12px] text-white flex items-center gap-3 transition-opacity hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #e17c60, #c66a4e)' }}
          >
            <span className="text-2xl">📸</span>
            <div>
              <p className="font-bold text-sm">Scan AI Receipt</p>
              <p className="text-xs opacity-75">Añadir gasto desde foto</p>
            </div>
          </button>
        </aside>

        {/* ─── RIGHT MAIN ─── */}
        <main className="w-full lg:w-3/4 flex flex-col gap-6">

          {/* Donut chart + legend */}
          <div className="bg-white rounded-[12px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <PieChart className="h-4 w-4" style={{ color: '#e17c60' }} /> Distribución de gastos
              </h3>
              <button
                onClick={() => navigate('/expenses/new')}
                className="flex items-center gap-1.5 text-sm font-semibold text-white px-4 py-1.5 rounded-lg transition-opacity hover:opacity-90"
                style={{ backgroundColor: '#e17c60' }}
              >
                <Plus className="h-4 w-4" /> Nuevo Gasto
              </button>
            </div>
            <div className="flex items-center gap-6 flex-wrap">
              <DonutChart segments={byCategory} total={totalMonth} formatCurrency={fmt} />
              {/* Leyenda */}
              <div className="flex-1 min-w-0 space-y-2">
                {byCategory.slice(0, 6).map(cat => (
                  <div key={cat.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                      <span className="text-sm text-gray-600 truncate">{cat.icon} {cat.name}</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-800 ml-2">{fmt(cat.amount)}</span>
                  </div>
                ))}
                {byCategory.length === 0 && !loading && (
                  <p className="text-sm text-gray-400">Sin datos</p>
                )}
              </div>
            </div>
          </div>

          {/* Upcoming Recurring Expenses — horizontal scroll cards */}
          <div className="bg-white rounded-[12px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <Repeat className="h-4 w-4" style={{ color: '#81B29A' }} /> Gastos recurrentes próximos
              </h3>
              <button onClick={() => navigate('/recurring')} className="text-xs font-semibold" style={{ color: '#e17c60' }}>
                Ver todos →
              </button>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {[
                { name: 'Netflix',       amount: 17.99, date: 'Lun 10 feb', color: '#e17c60', icon: '📺' },
                { name: 'Spotify',       amount: 10.99, date: 'Mar 11 feb', color: '#81B29A', icon: '🎵' },
                { name: 'Electricidad',  amount: 85.00, date: 'Jue 13 feb', color: '#6B7280', icon: '💡' },
                { name: 'Internet',      amount: 45.50, date: 'Vie 14 feb', color: '#3B82F6', icon: '🌐' },
              ].map((item, i) => (
                <div key={i} className="flex-shrink-0 w-44 bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <div className="flex items-center gap-2 mb-2">
                    <span>{item.icon}</span>
                    <span className="text-sm font-semibold text-gray-800">{item.name}</span>
                  </div>
                  <p className="text-base font-bold" style={{ color: item.color }}>{fmt(item.amount)}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{item.date}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Last 5 Expenses table */}
          <div className="bg-white rounded-[12px] shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-700">Últimos gastos</h3>
              <button onClick={() => navigate('/expenses')} className="text-xs font-semibold" style={{ color: '#e17c60' }}>
                Ver todos →
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-xs font-semibold text-gray-400 uppercase pb-2">Fecha</th>
                    <th className="text-xs font-semibold text-gray-400 uppercase pb-2">Descripción</th>
                    <th className="text-xs font-semibold text-gray-400 uppercase pb-2 text-right">Importe</th>
                    <th className="text-xs font-semibold text-gray-400 uppercase pb-2">Pagador</th>
                    <th className="text-xs font-semibold text-gray-400 uppercase pb-2">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {recentExpenses.map((exp, i) => (
                    <tr key={i} className="border-b border-gray-50 last:border-0">
                      <td className="py-3 text-sm text-gray-500">
                        {new Date(exp.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <span>{exp.categoryIcon}</span>
                          <span className="text-sm font-medium text-gray-800">
                            {exp.description || exp.categoryName}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 text-sm font-bold text-right" style={{ color: '#e17c60' }}>
                        {fmt(exp.amount)}
                      </td>
                      <td className="py-3 text-sm text-gray-500">
                        {exp.payer_name || user?.name || '—'}
                      </td>
                      <td className="py-3">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                          Completado
                        </span>
                      </td>
                    </tr>
                  ))}
                  {recentExpenses.length === 0 && !loading && (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-sm text-gray-400">Sin gastos registrados</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* ── Mobile FAB ── */}
      <button
        onClick={() => navigate('/expenses/new')}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-white lg:hidden transition-transform hover:scale-105 active:scale-95"
        style={{ backgroundColor: '#e17c60' }}
      >
        <Plus className="h-7 w-7" />
      </button>
    </div>
  );
}
