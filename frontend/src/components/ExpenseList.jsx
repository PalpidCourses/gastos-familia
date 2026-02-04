import React, { useState, useEffect } from 'react';
import { expensesAPI } from '../services/api';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

function ExpenseList() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await expensesAPI.list();
      setExpenses(response.data);
    } catch (err) {
      setError('Error al cargar gastos');
      console.error('Error loading expenses:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const formatEUR = (amount) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card animate-pulse h-16"></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="card bg-red-50 border-red-200 text-red-700">
        <p>{error}</p>
        <button onClick={loadExpenses} className="btn-ghost text-sm mt-2">
          Reintentar
        </button>
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">
          No hay gastos registrados. ¡Crea el primero!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Últimos gastos ({expenses.length})
      </h3>
      {expenses.map((expense) => (
        <div key={expense.id} className="card">
          <div
            className="flex items-center justify-between cursor-pointer py-3"
            onClick={() => toggleExpand(expense.id)}
          >
            <div className="flex-1">
              <p className="font-semibold text-gray-900 dark:text-white">
                {expense.description || 'Sin descripción'}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {expense.payment_method || 'Sin método pago'}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-lg font-bold text-primary">
                  {formatEUR(expense.amount)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {format(new Date(expense.created_at), 'd MMM, HH:mm', { locale: es })}
                </p>
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                {expandedId === expense.id ? '−' : '+'}
              </button>
            </div>
          </div>

          {/* Expanded details */}
          {expandedId === expense.id && (
            <div className="border-t border-gray-100 pt-4 pb-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 dark:text-gray-500">ID</p>
                  <p className="font-mono text-xs">{expense.id}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-500">Fecha</p>
                  <p>{format(new Date(expense.created_at), 'PPPp', { locale: es })}</p>
                </div>
                {expense.notes && (
                  <div className="col-span-2">
                    <p className="text-gray-500 dark:text-gray-500">Notas</p>
                    <p>{expense.notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default ExpenseList;
