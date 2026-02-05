import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authAPI } from '../services/api';

export default function Invite() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const code = searchParams.get('code');
  const [formData, setFormData] = useState({ email: '', password: '', name: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Si no hay código, redirigir al login
  useEffect(() => {
    if (!code) {
      navigate('/login');
    }
  }, [code, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authAPI.register({
        email: formData.email,
        password: formData.password,
        invitationCode: code,
      });

      // Guardar token y usuario
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      // Guardar nombre en localStorage si se proporcionó
      if (formData.name) {
        localStorage.setItem('userName', formData.name);
      }

      navigate('/dashboard');
    } catch (err) {
      console.error('Error registering with invitation:', err);
      setError(err.response?.data?.error || 'Error al aceptar invitación');
      setLoading(false);
    }
  };

  if (!code) return null;

  return (
    <div className="min-h-screen bg-accent-warm dark:bg-background-dark px-4 py-8 flex items-center justify-center">
      <div className="max-w-md w-full">
        <div className="card">
          <h1 className="text-2xl font-bold text-primary mb-2">Te han invitado</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Crea tu cuenta para unirte a la familia de gastos.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input-base"
                placeholder="tu@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tu nombre (opcional)
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input-base"
                placeholder="Nombre"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Contraseña *
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="input-base"
                placeholder="Mínimo 6 caracteres"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="flex-1 btn-ghost"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 btn-primary"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8 0 4 8 0 008 4"></path>
                    </svg>
                    Aceptar...
                  </span>
                ) : (
                  'Crear cuenta'
                )}
              </button>
            </div>
          </form>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            Código de invitación: <span className="font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{code}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
