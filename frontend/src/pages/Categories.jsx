import React, { useState, useEffect } from 'react';
import { categoriesAPI } from '../services/api';
import { Plus, Edit2, Trash2, X } from 'lucide-react';

function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', color: '#e17c60', icon: '📦' });
  const [error, setError] = useState('');

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await categoriesAPI.list();
      setCategories(response.data);
    } catch (err) {
      setError('Error al cargar categorías');
      console.error('Error loading categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (editingId) {
        await categoriesAPI.update(editingId, formData);
      } else {
        await categoriesAPI.create(formData);
      }
      await loadCategories();
      resetForm();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar categoría');
    }
  };

  const handleEdit = (category) => {
    setEditingId(category.id);
    setFormData({ name: category.name, color: category.color, icon: category.icon });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar esta categoría?')) return;

    try {
      await categoriesAPI.delete(id);
      await loadCategories();
    } catch (err) {
      setError('Error al eliminar categoría');
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ name: '', color: '#e17c60', icon: '📦' });
    setShowForm(false);
    setError('');
  };

  const icons = ['📦', '🍔', '🏠', '🚗', '💊', '🛒', '👗', '🎬', '📚', '⚽', '🎮', '💻', '📱', '🚗', '✈️', '🏖️', '🚀'];

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="card animate-pulse h-20"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Categorías</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary"
        >
          {showForm ? <X className="h-5 w-5 mr-2" /> : <Plus className="h-5 w-5 mr-2" />}
          {showForm ? 'Cancelar' : 'Nueva'}
        </button>
      </div>

      {showForm && (
        <div className="card mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {editingId ? 'Editar Categoría' : 'Nueva Categoría'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nombre *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input-base"
                placeholder="Comida, Transporte, etc."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-16 h-10 rounded border border-gray-300 cursor-pointer"
                />
                <span className="font-mono text-sm text-gray-600">{formData.color}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Icono
              </label>
              <div className="flex flex-wrap gap-2">
                {icons.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setFormData({ ...formData, icon })}
                    className={`w-10 h-10 rounded-lg text-2xl transition-colors ${
                      formData.icon === icon
                        ? 'ring-2 ring-primary ring-offset-2'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-4">
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 btn-ghost"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 btn-primary"
              >
                {editingId ? (
                  <span className="flex items-center justify-center">
                    <Edit2 className="h-5 w-5 mr-2" />
                    Actualizar
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <Plus className="h-5 w-5 mr-2" />
                    Crear
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {categories.length === 0 && !loading ? (
        <div className="card text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">
            No hay categorías. ¡Crea la primera!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <div
              key={category.id}
              className="card"
              style={{ borderLeftColor: category.color, borderLeftWidth: '4px' }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <span className="text-2xl mr-2">{category.icon}</span>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {category.name}
                  </h3>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(category)}
                    className="text-gray-400 hover:text-primary transition-colors"
                  >
                    <Edit2 className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Categories;
