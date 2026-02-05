import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link, Copy, Check, X, Plus, Trash2 } from 'lucide-react';
import { invitationsAPI } from '../services/api';

export default function Invitations() {
  const navigate = useNavigate();
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({ email: '', role: 'parent' });
  const [copied, setCopied] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    loadInvitations();
  }, []);

  const loadInvitations = async () => {
    setLoading(true);
    try {
      const response = await invitationsAPI.list();
      setInvitations(response.data);
    } catch (err) {
      console.error('Error loading invitations:', err);
      setError('Error al cargar invitaciones');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError('');

    try {
      const response = await invitationsAPI.create(formData);
      setInvitations([...invitations, response.data]);
      setFormData({ email: '', role: 'parent' });
    } catch (err) {
      console.error('Error creating invitation:', err);
      setError(err.response?.data?.error || 'Error al crear invitación');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar esta invitación?')) return;
    try {
      await invitationsAPI.delete(id);
      setInvitations(invitations.filter(inv => inv.id !== id));
    } catch (err) {
      console.error('Error deleting invitation:', err);
      alert('Error al eliminar invitación');
    }
  };

  const handleCopyLink = (code) => {
    const link = `https://nono.aretaslab.tech/invite/${code}`;
    navigator.clipboard.writeText(link);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('es-ES');
  };

  const isExpired = (expiresAt) => {
    return new Date(expiresAt) < new Date();
  };

  if (loading) return <div className="p-6">Cargando...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Invitaciones</h1>

      {/* Formulario de invitación */}
      <form onSubmit={handleCreate} className="card mb-8">
        <h2 className="text-xl font-semibold mb-4">Nueva invitación</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Email del invitado *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="persona@ejemplo.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Rol</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="parent">Padre/Madre</option>
              <option value="child">Hijo/Hija</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={creating}
          className="w-full btn-primary"
        >
          {creating ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8 0 4 8 0 008 4"></path>
              </svg>
              Creando invitación...
            </span>
          ) : (
            <span className="flex items-center justify-center">
              <Plus className="h-5 w-5 mr-2" />
              Enviar invitación
            </span>
          )}
        </button>
      </form>

      {/* Lista de invitaciones */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold mb-4">Invitaciones enviadas</h2>
        {invitations.length === 0 ? (
          <div className="text-center text-gray-500 py-12">
            No hay invitaciones pendientes.
          </div>
        ) : (
          invitations.map((inv) => (
            <div key={inv.id} className={`card ${isExpired(inv.expires_at) ? 'opacity-60' : ''}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {inv.email}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-800">
                      {inv.role}
                    </span>
                    <span className="text-xs text-gray-500">
                      {inv.accepted_at ? (
                        <span className="flex items-center text-green-600">
                          <Check className="h-3 w-3 mr-1" />
                          Aceptada el {formatDate(inv.accepted_at)}
                        </span>
                      ) : isExpired(inv.expires_at) ? (
                        <span className="text-red-600">Expirada</span>
                      ) : (
                        <span className="text-yellow-600">
                          Expira el {formatDate(inv.expires_at)}
                        </span>
                      )}
                    </span>
                  </div>
                </div>

                {/* Link de invitación */}
                {!inv.accepted_at && !isExpired(inv.expires_at) && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopyLink(inv.code)}
                      className="p-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200"
                      title="Copiar enlace de invitación"
                    >
                      {copied === inv.code ? (
                        <span className="flex items-center text-sm">
                          <Check className="h-4 w-4 mr-1" />
                          Copiado
                        </span>
                      ) : (
                        <span className="flex items-center text-sm">
                          <Copy className="h-4 w-4 mr-1" />
                          Copiar link
                        </span>
                      )}
                    </button>

                    <Link
                      to={`/invite/${inv.code}`}
                      className="p-2 bg-orange-100 text-orange-800 rounded-lg hover:bg-orange-200"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Plus className="h-4 w-4" />
                    </Link>

                    <button
                      onClick={() => handleDelete(inv.id)}
                      className="p-2 bg-red-100 text-red-800 rounded-lg hover:bg-red-200"
                      title="Eliminar invitación"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
