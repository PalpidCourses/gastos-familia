import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    tenantSlug: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(formData.email, formData.password, formData.tenantSlug);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-accent-warm dark:bg-background-dark px-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-white/5 rounded-xl shadow-lg p-8 border border-primary/10">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary mb-2">Gastos Familia</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">Inicia sesión para gestionar tus gastos</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 rounded-btn border border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-2 focus:ring-primary/50 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="david@gastos-familia.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Contraseña
              </label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 rounded-btn border border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-2 focus:ring-primary/50 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Familia (opcional)
              </label>
              <input
                type="text"
                value={formData.tenantSlug}
                onChange={(e) => setFormData({ ...formData, tenantSlug: e.target.value })}
                className="w-full px-4 py-3 rounded-btn border border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-2 focus:ring-primary/50 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="familia-prueba"
              />
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                Deja vacío si no conoces tu slug de familia
              </p>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8 0 4 8 0 008 4z"></path>
                  </svg>
                  Iniciando...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <Lock className="h-5 w-5 mr-2" />
                  Iniciar sesión
                </span>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-gray-500 dark:text-gray-500 mt-6">
            Usuario de prueba: david@gastos-familia.com / password123
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
