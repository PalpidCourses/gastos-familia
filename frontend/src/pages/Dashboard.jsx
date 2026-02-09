import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LogOut, Home, BarChart2, PieChart, FileText, Repeat,
  Bell, Search, Settings, TrendingUp, ShoppingCart, ArrowRight,
  Languages
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { expensesAPI, categoriesAPI, recurringAPI } from '../services/api';

// ── Traducciones ──
const translations = {
  es: {
    totalSpending: 'Total Spending',
    categoryBreakdown: 'Category Breakdown',
    urgentAlerts: 'Urgent Alerts',
    scanAIReceipt: 'Scan AI Receipt',
    expenseDistribution: 'Expense Distribution',
    expenseDistributionDesc: 'Real-time breakdown of your family wallet.',
    viewFullAnalytics: 'View Full Analytics',
    upcomingRecurring: 'Upcoming Recurring Expenses',
    last5Expenses: 'Last 5 Expenses',
    viewAll: 'View All',
    noExpenses: 'Sin gastos registrados',
    noRecurring: 'Sin gastos recurrentes próximos',
    date: 'Date',
    merchant: 'Merchant',
    amount: 'Amount',
    payer: 'Payer',
    status: 'Status',
    noCategory: 'Sin gastos este mes',
    vsLastMonth: 'vs last month',
    noPreviousData: 'No previous data',
    luzSpike: 'Luz +5%',
    luzUnexpected: 'Unexpected spike detected',
    rentDue: 'Rent Due',
    rentProcessing: 'Processing in 2 days',
    netflixRecurring: 'Recurring next Monday',
  },
  ca: {
    totalSpending: 'Despesa total',
    categoryBreakdown: 'Desgloss per categoria',
    urgentAlerts: 'Alertes urgents',
    scanAIReceipt: 'Escanejar rebut IA',
    expenseDistribution: 'Distribució de despeses',
    expenseDistributionDesc: 'Desglos en temps real del la teva cartera familiar.',
    viewFullAnalytics: 'Veure analítiques completes',
    upcomingRecurring: 'Despeses recurrents properes',
    last5Expenses: 'Últims 5 despeses',
    viewAll: 'Veure\'ls tots',
    noExpenses: 'Sense despeses registrades',
    noRecurring: 'Sense despeses recurrents propers',
    date: 'Data',
    merchant: 'Comerciant',
    amount: 'Quantitat',
    payer: 'Pagador',
    status: 'Estat',
    noCategory: 'Sense despeses aquest mes',
    vsLastMonth: 'vs mes passat',
    noPreviousData: 'Sense dades anteriors',
    luzSpike: 'Llum +5%',
    luzUnexpected: 'Pic inesperat detectat',
    rentDue: 'Lloguer pendient',
    rentProcessing: 'Processant en 2 dies',
    netflixRecurring: 'Recurrent el dilluns proper',
  },
};

// ── SVG Icons para los que no existen en lucide-react v0.294 ──
const IconAdd = ({ className }) => (
  <svg className={className || 'w-6 h-6'} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5v14M5 12h14" />
  </svg>
);

const IconArrowForward = ({ className }) => (
  <svg className={className || 'w-6 h-6'} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

const IconVerified = ({ className }) => (
  <svg className={className || 'w-6 h-6'} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const IconAlertTriangle = ({ className }) => (
  <svg className={className || 'w-6 h-6'} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3z" />
    <path d="M12 9v4" />
    <path d="M12 17h.01" />
  </svg>
);

const IconZap = ({ className }) => (
  <svg className={className || 'w-6 h-6'} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const IconShoppingBag = ({ className }) => (
  <svg className={className || 'w-6 h-6'} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
    <path d="M3 6h18" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
);

const IconShoppingCart = ({ className }) => (
  <svg className={className || 'w-6 h-6'} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="8" cy="21" r="1" />
    <circle cx="19" cy="21" r="1" />
    <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
  </svg>
);

// ── Donut Chart exacto del mockup ──
function DonutChart({ segments, total, formatCurrency }) {
  const R = 100;
  const C = 2 * Math.PI * R;
  let cum = 0;

  return (
    <svg viewBox="0 0 256 256" width="256" height="256" className="transform -rotate-90">
      <circle cx="128" cy="128" r="100" fill="transparent" stroke="#e17c60/10" strokeWidth="24" />
      {segments.map((seg, i) => {
        const len = total > 0 ? (seg.amount / total) * C : 0;
        const off = cum;
        cum += len;
        return (
          <circle
            key={i}
            cx="128" cy="128" r="100"
            fill="transparent"
            stroke={seg.color}
            strokeWidth="24"
            strokeDasharray={`${len} ${C - len}`}
            strokeDashoffset={-off}
          />
        );
      })}
    </svg>
  );
}

// ── Mini Progress Bar del mockup ──
function MiniProgressBar({ percentage, color }) {
  return (
    <div className="h-2 text-xs flex rounded-full overflow-hidden">
      <div
        className="h-full rounded-full text-white justify-center"
        style={{ width: `${percentage}%`, backgroundColor: color }}
      />
    </div>
  );
}

const NAV_LINKS = [
  { label: 'Dashboard', path: '/dashboard', icon: Home },
  { label: 'Analytics', path: '/analytics', icon: BarChart2 },
  {label: 'Receipts', path: '/receipts', icon: FileText },
  { label: 'Recurrent', path: '/recurring', icon: Repeat },
];

function TopNav({ user, onLogout, lang, setLang }) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 border-b border-[#e17c60]/10 bg-white px-10 py-3">
      <div className="flex items-center justify-between gap-8">
        {/* Logo */}
        <div className="flex items-center gap-4 text-[#e17c60]">
          <PieChart className="w-6 h-6" />
          <h2 className="text-lg font-bold leading-tight tracking-tight text-[#171312]">FamilyFinance</h2>
        </div>

        {/* Nav links (desktop) */}
        <nav className="hidden md:flex items-center gap-9">
          {NAV_LINKS.map(({ label, path }) => {
            const active = location.pathname === path;
            return (
              <a
                key={path}
                onClick={() => navigate(path)}
                className={`text-sm font-medium leading-normal transition-colors cursor-pointer ${
                  active
                    ? 'text-[#e17c60]'
                    : 'text-[#171312]/70 hover:text-[#e17c60]'
                }`}
              >
                {label}
              </a>
            );
          })}
        </nav>

        {/* Right: search · notifications · settings · avatar · logout */}
        <div className="flex items-center gap-4">
          <label className="hidden sm:flex flex-col min-w-40 max-w-64">
            <div className="flex w-full items-stretch rounded-lg bg-[#e17c60]/5">
              <Search className="w-4 h-4 text-[#171312] flex-none pl-4" />
            </div>
            <input
              type="text"
              placeholder="Search expenses..."
              className="flex-1 resize-none overflow-hidden rounded-lg bg-[#e17c60]/5 border-none h-10 px-4 text-base font-normal text-[#171312] placeholder:text-[#866c65] focus:outline-0 focus:ring-0"
            />
          </label>
          <button className="flex items-center justify-center rounded-lg h-10 w-10 bg-[#e17c60]/5 text-[#171312] dark:bg-white/5">
            <Settings className="w-5 h-5" />
          </button>
          <button className="flex items-center justify-center rounded-lg h-10 w-10 bg-[#e17c60]/5 text-[#171312] dark:bg-white/5">
            <Bell className="w-5 h-5" />
          </button>
          <select
            value={lang}
            onChange={(e) => updateLanguage(e.target.value)}
            className="flex items-center justify-center rounded-lg h-10 w-16 bg-[#e17c60]/5 text-[#171312] text-sm font-medium focus:outline-0 cursor-pointer"
          >
            <option value="en" className={lang === 'en' ? 'font-bold' : ''}>EN</option>
            <option value="es" className={lang === 'es' ? 'font-bold' : ''}>ES</option>
            <option value="ca" className={lang === 'ca' ? 'font-bold' : ''}>CA</option>
          </select>
          <div
            className="w-10 h-10 rounded-full bg-center bg-no-repeat bg-cover border-2 border-[#e17c60]/20"
            style={{ backgroundImage: 'url(https://lh3.googleusercontent.com/a-' }}
          />
          <button onClick={onLogout} className="text-[#171312]/70 hover:text-[#171312] transition-colors">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout, updateLanguage } = useAuth();

  // ── Idioma ──
  const [lang, setLang] = useState(() => {
    // Usar idioma del perfil si existe, si no detectar del navegador
    const userLang = user?.preferredLanguage || null;
    
    if (userLang) {
      return userLang; // Usar idioma del perfil
    }
    
    const browserLang = navigator.language || navigator.userLanguage || 'en-US';
    const cleanLang = browserLang.split('-')[0].toLowerCase();
    console.log('Idioma del perfil:', userLang, '| Browser:', browserLang, '→', cleanLang);
    
    if (cleanLang === 'ca') return 'ca';
    if (cleanLang === 'es') return 'es';
    if (cleanLang === 'en') return 'en';
    return 'es'; // Por defecto español
  });

  const t = translations[lang] || translations.es;

  const handleLangChange = async (newLang) => {
    try {
      const result = await updateLanguage(newLang);
      if (result.success) {
        console.log('✓ Idioma actualizado a', newLang);
        setLang(newLang);
        // Actualizar idioma en el usuario
        if (user) {
          const updatedUser = { ...user, preferredLanguage: newLang };
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
      } else {
        console.error('✗ Error al actualizar idioma:', result.error);
      }
    } catch (error) {
      console.error('✗ Excepción al actualizar idioma:', error);
    }
  };

  const [totalMonth, setTotalMonth] = useState(0);
  const [totalLastMonth, setTotalLastMonth] = useState(0);
  const [byCategory, setByCategory] = useState([]);
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [recurringExpenses, setRecurringExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
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

      const monthExps = expenses.filter(e => {
        const d = new Date(e.created_at);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      });

      const lastMonthExps = expenses.filter(e => {
        const d = new Date(e.created_at);
        return d.getMonth() === lastMonth.getMonth() && d.getFullYear() === lastMonth.getFullYear();
      });

      setTotalMonth(monthExps.reduce((s, e) => s + parseFloat(e.amount), 0));
      setTotalLastMonth(lastMonthExps.reduce((s, e) => s + parseFloat(e.amount), 0));

      const catMap = {};
      categories.forEach(c => { catMap[c.id] = c; });

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

      const sorted = [...expenses].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setRecentExpenses(
        sorted.slice(0, 5).map(e => ({
          ...e,
          categoryName: catMap[e.category_id]?.name || 'Sin categoría',
          categoryIcon: catMap[e.category_id]?.icon || '📝',
        }))
      );

      const upcomingRecurring = recurring
        .filter(r => r.is_active)
        .sort((a, b) => new Date(a.next_date) - new Date(b.next_date));

      setRecurringExpenses(upcomingRecurring.slice(0, 4));
    } catch (err) {
      console.error('Error cargando datos:', err);
    } finally {
      setLoading(false);
    }
  };

  const fmt = n => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(n);
  const handleLogout = () => { logout(); navigate('/login'); };

  const maxCat = byCategory.length ? byCategory[0].amount : 1;
  const percentChange = totalLastMonth > 0 ? ((totalMonth - totalLastMonth) / totalLastMonth) * 100 : 0;

  return (
    <div className="bg-[#F4F1DE] min-h-screen text-[#171312]">
      <TopNav user={user} onLogout={handleLogout} lang={lang} setLang={setLang} />

      <main className="max-w-full mx-auto px-4 sm:px-10 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* ─── SIDEBAR (25%) ─── */}
          <aside className="w-full lg:w-1/4 flex flex-col gap-6">
            {/* Spending Summary Card */}
            <div className="bg-white dark:bg-white/5 rounded-xl p-6 border border-[#e17c60]/10 shadow-sm">
              <p className="text-[#866c65] dark:text-white/60 text-sm font-medium mb-1">{t.totalSpending}</p>
              <div className="flex items-baseline gap-2">
                <h1 className="text-4xl font-bold tracking-tight text-[#171312] dark:text-white">
                  {loading ? '…' : fmt(totalMonth)}
                </h1>
              </div>
              <p className="text-[#e17c60] text-sm font-semibold flex items-center gap-1 mt-2">
                <TrendingUp className="w-4 h-4" />
                {Math.abs(percentChange) > 0 ? `+${percentChange.toFixed(0)}% ${t.vsLastMonth}` : t.noPreviousData}
              </p>
            </div>

            {/* Mini Category Breakdown con progress bars */}
            <div className="bg-white dark:bg-white/5 rounded-xl p-6 border border-[#e17c60]/10 shadow-sm">
              <p className="text-[#171312] dark:text-white text-base font-bold mb-4">{t.categoryBreakdown}</p>
              <div className="flex flex-col gap-4">
                {byCategory.slice(0, 3).map(cat => {
                  const pct = (cat.amount / maxCat) * 100;
                  return (
                    <div key={cat.id} className="relative pt-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full" style={{ backgroundColor: cat.color, color: '#fff' }}>
                          {cat.name}
                        </span>
                        <span className="text-xs font-semibold" style={{ color: cat.color }}>{fmt(cat.amount)}</span>
                      </div>
                      <MiniProgressBar percentage={pct} color={cat.color} />
                    </div>
                  );
                })}
                {byCategory.length === 0 && !loading && <p className="text-sm text-[#866c65]">{t.noCategory}</p>}
              </div>
            </div>

            {/* Urgent Alerts */}
            <div className="bg-white dark:bg-white/5 rounded-xl p-6 border border-[#e17c60]/10 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[#171312] dark:text-white text-base font-bold">{t.urgentAlerts}</h3>
                <span className="flex h-2 w-2 rounded-full bg-[#e17c60]"></span>
              </div>
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/20">
                  <IconAlertTriangle className="text-red-500" />
                  <div>
                    <p className="text-sm font-bold text-red-700 dark:text-red-400">{t.luzSpike}</p>
                    <p className="text-xs text-red-600/80 dark:text-red-400/60">{t.luzUnexpected}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-orange-50 dark:bg-orange-900/10 rounded-lg border border-orange-100 dark:border-orange-900/20">
                  <IconZap className="w-6 h-6 text-orange-500" />
                  <div>
                    <p className="text-sm font-bold text-orange-700 dark:text-orange-400">{t.rentDue}</p>
                    <p className="text-xs text-orange-600/80 dark:text-orange-400/60">{t.rentProcessing}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/20">
                  <ShoppingCart className="text-blue-500" />
                  <div>
                    <p className="text-sm font-bold text-blue-700 dark:text-blue-400">Netflix</p>
                    <p className="text-xs text-blue-600/80 dark:text-blue-400/60">{t.netflixRecurring}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Scan AI Receipt CTA */}
            <button
              onClick={() => navigate('/receipts/scan')}
              className="w-full flex items-center justify-center gap-2 bg-[#e17c60] hover:bg-[#e17c60]/90 text-white font-bold py-4 rounded-xl shadow-[#e17c60]/20 transition-all"
            >
              <IconAdd className="w-6 h-6" />
              {t.scanAIReceipt}
            </button>
          </aside>

          {/* ─── MAIN (75%) ─── */}
          <section className="w-full lg:w-3/4 flex flex-col gap-8">
            {/* Donut Chart + Summary */}
            <div className="bg-white dark:bg-white/5 rounded-xl p-8 border border-[#e17c60]/10 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="relative flex justify-center">
                <DonutChart segments={byCategory} total={totalMonth} formatCurrency={fmt} />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[#866c65] dark:text-white/60 text-sm font-medium">{lang === 'ca' ? 'Total mensual' : 'Monthly Total'}</span>
                  <span className="text-3xl font-bold text-[#171312] dark:text-white">
                    {loading ? '…' : fmt(totalMonth)}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-6">
                <div>
                  <h2 className="text-2xl font-bold text-[#171312] dark:text-white">{t.expenseDistribution}</h2>
                  <p className="text-[#866c65] dark:text-white/60">{t.expenseDistributionDesc}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {byCategory.slice(0, 4).map(cat => (
                    <div key={cat.id} className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }}></span>
                      <span className="text-sm font-medium">{t.rentUtilities}</span>
                    </div>
                  ))}
                  {byCategory.length > 4 && (
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-gray-300"></span>
                      <span className="text-sm font-medium">{t.others}</span>
                    </div>
                  )}
                </div>
                <div className="pt-4 border-t border-[#e17c60]/10">
                  <button className="text-[#e17c60] font-bold text-sm flex items-center gap-2">
                    {t.viewFullAnalytics}
                    <IconArrowForward className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Upcoming Recurring Expenses */}
            <div>
              <h3 className="text-[#171312] dark:text-white text-lg font-bold mb-4 px-2">{t.upcomingRecurring}</h3>
              <div className="flex gap-4 overflow-x-auto pb-4">
                {recurringExpenses.map((exp, i) => {
                  const daysUntil = Math.ceil((new Date(exp.next_date) - new Date()) / (1000 * 60 * 60 * 24));
                  const isUrgent = daysUntil <= 3;
                  return (
                    <div
                      key={i}
                      className="min-w-[220px] bg-white dark:bg-white/5 p-5 rounded-xl border border-[#e17c60]/10 shadow-sm"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isUrgent ? 'bg-red-100 text-red-600' : daysUntil <= 7 ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                          <IconZap className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-bold text-[#e17c60]">{isUrgent ? (lang === 'ca' ? 'En 3 dies' : 'En 3 días') : daysUntil <= 7 ? (lang === 'ca' ? daysUntil + ' dies restants' : daysUntil + ' días restantes') : new Date(exp.next_date).toLocaleDateString(lang === 'ca' ? 'ca-ES' : 'es-ES', { day: 'numeric', month: 'short' })}</span>
                      </div>
                      <p className="font-bold text-[#171312] dark:text-white">{exp.description || exp.category_id}</p>
                      <p className="text-xl font-bold mt-1">{fmt(exp.amount)}</p>
                    </div>
                  );
                })}
                {recurringExpenses.length === 0 && !loading && (
                  <div className="w-full text-center py-8 text-[#866c65]">{t.noRecurring}</div>
                )}
              </div>
            </div>

            {/* Last 5 Expenses Table */}
            <div className="bg-white dark:bg-white/5 rounded-xl border border-[#e17c60]/10 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-[#e17c60]/10 flex justify-between items-center">
                <h3 className="text-[#171312] dark:text-white text-lg font-bold">{t.last5Expenses}</h3>
                <button onClick={() => navigate('/expenses')} className="text-[#e17c60] text-sm font-bold">{t.viewAll}</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-[#e17c60]/5 dark:bg-white/5 text-[#866c65] dark:text-white/60 text-sm font-medium">
                    <tr>
                      <th className="px-6 py-4">{t.date}</th>
                      <th className="px-6 py-4">{t.merchant}</th>
                      <th className="px-6 py-4">{t.amount}</th>
                      <th className="px-6 py-4">{t.payer}</th>
                      <th className="px-6 py-4">{t.status}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e17c60]/5 dark:divide-white/5">
                    {recentExpenses.map((exp, i) => (
                      <tr key={i} className="hover:bg-[#e17c60]/5 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium">
                          {new Date(exp.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-gray-100 dark:bg-white/10 flex items-center justify-center">
                              <IconShoppingCart className="w-4 h-4 text-[#866c65]" />
                            </div>
                            <span className="font-bold">{exp.description || exp.categoryName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-bold text-red-500">{fmt(exp.amount)}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-blue-200" />
                            <span className="text-sm">{exp.payer_name || user?.name || '—'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-[#81B29A]">
                          <IconVerified className="w-4 h-4 text-[#81B29A]" />
                        </td>
                      </tr>
                    ))}
                    {recentExpenses.length === 0 && !loading && (
                      <tr>
                        <td colSpan={5} className="px-6 py-6 text-center text-sm text-[#866c65]">{t.noExpenses}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Mobile FAB */}
      <div className="fixed bottom-6 right-6 lg:hidden">
        <button
          onClick={() => navigate('/expenses/new')}
          className="bg-[#e17c60] w-14 h-14 rounded-full flex items-center justify-center text-white shadow-[#e17c60]/40"
        >
          <IconAdd className="w-8 h-8" />
        </button>
      </div>
    </div>
  );
}
