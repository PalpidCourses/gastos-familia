import { useState, useEffect } from 'react';
import { familyMembersAPI } from '../services/api';

export default function FamilyMembers() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingMember, setEditingMember] = useState(null);
  const [formData, setFormData] = useState({ user_id: '', role: 'parent', allocation_percentage: 50 });

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    setLoading(true);
    try {
      const response = await familyMembersAPI.list();
      setMembers(response.data);
    } catch (error) {
      console.error('Error loading family members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingMember) {
        await familyMembersAPI.update(editingMember.id, {
          role: formData.role,
          allocation_percentage: formData.allocation_percentage,
        });
        setEditingMember(null);
      } else {
        await familyMembersAPI.create({
          user_id: formData.user_id,
          role: formData.role,
          allocation_percentage: formData.allocation_percentage,
        });
      }
      setFormData({ user_id: '', role: 'parent', allocation_percentage: 50 });
      loadMembers();
    } catch (error) {
      console.error('Error saving family member:', error);
      alert('Error al guardar miembro de familia');
    }
  };

  const handleEdit = (member) => {
    setEditingMember(member);
    setFormData({
      user_id: member.user_id,
      role: member.role,
      allocation_percentage: member.allocation_percentage,
    });
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este miembro de familia?')) return;
    try {
      await familyMembersAPI.delete(id);
      loadMembers();
    } catch (error) {
      console.error('Error deleting family member:', error);
      alert('Error al eliminar miembro de familia');
    }
  };

  const cancelEdit = () => {
    setEditingMember(null);
    setFormData({ user_id: '', role: 'parent', allocation_percentage: 50 });
  };

  if (loading) return <div className="p-6">Cargando...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Miembros de Familia</h1>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">
          {editingMember ? 'Editar Miembro' : 'Nuevo Miembro'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email del Usuario</label>
            <input
              type="email"
              value={formData.user_id}
              onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="usuario@ejemplo.com"
              required
              disabled={!!editingMember}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Rol</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="parent">Padre/Madre</option>
              <option value="child">Hijo/Hija</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Asignación (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={formData.allocation_percentage}
              onChange={(e) => setFormData({ ...formData, allocation_percentage: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <button
            type="submit"
            className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
          >
            {editingMember ? 'Actualizar' : 'Añadir'}
          </button>
          {editingMember && (
            <button
              type="button"
              onClick={cancelEdit}
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      {/* Lista de miembros */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {members.map((member) => (
          <div key={member.id} className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-2">{member.name || member.email}</h3>
            <p className="text-sm text-gray-600 mb-2">{member.email}</p>
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 text-sm rounded-full bg-orange-100 text-orange-800">
                {member.role}
              </span>
              <span className="text-sm text-gray-600">{member.allocation_percentage}%</span>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => handleEdit(member)}
                className="flex-1 px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm hover:bg-blue-200"
              >
                Editar
              </button>
              <button
                onClick={() => handleDelete(member.id)}
                className="flex-1 px-3 py-1 bg-red-100 text-red-800 rounded text-sm hover:bg-red-200"
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      {members.length === 0 && (
        <div className="text-center text-gray-500 py-12">
          No hay miembros de familia aún.
        </div>
      )}
    </div>
  );
}
