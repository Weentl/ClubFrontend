// ExpensesList.tsx
import { useState } from 'react';
import { Search, Edit2, Trash2, AlertTriangle } from 'lucide-react';
import { Expense } from '../types/expenses';

interface Props {
  expenses: Expense[];
  loading: boolean;
  onEdit: (expense: Expense) => void;
  onDelete: (expenseId: string) => void;
}

// Función auxiliar: Convierte una cadena ISO (o "YYYY-MM-DD") a Date en horario local
function parseLocalDate(dateStr: string): Date {
  // Si viene en formato ISO con 'T', extraer solo la parte de fecha
  const pureDate = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
  const parts = pureDate.split('-').map(Number);
  return new Date(parts[0], parts[1] - 1, parts[2]);
}

const CATEGORY_ICONS: Record<string, string> = {
  inventory: '📦',
  services: '💡',
  payroll: '🧑‍💼',
  logistics: '🚚',
  other: '❔',
};

const CATEGORY_COLORS: Record<string, string> = {
  inventory: 'bg-blue-100 text-blue-800',
  services: 'bg-yellow-100 text-yellow-800',
  payroll: 'bg-purple-100 text-purple-800',
  logistics: 'bg-green-100 text-green-800',
  other: 'bg-gray-100 text-gray-800',
};

export default function ExpensesList({ expenses, loading, onEdit, onDelete }: Props) {
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const filteredExpenses = expenses.filter(expense =>
    expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    expense.supplier?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const averageAmount = expenses.length > 0
    ? expenses.reduce((sum, expense) => sum + expense.amount, 0) / expenses.length
    : 0;

  const highExpenseThreshold = averageAmount * 1.2;

  const handleDeleteClick = (expenseId: string) => {
    setConfirmDelete(expenseId);
  };

  const confirmDeleteExpense = () => {
    if (confirmDelete) {
      onDelete(confirmDelete);
      setConfirmDelete(null);
    }
  };

  const formatDate = (dateString: string) => {
    const localDate = parseLocalDate(dateString);
    return localDate.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar por descripción o proveedor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="mt-2 text-gray-500">Cargando gastos...</p>
        </div>
      ) : filteredExpenses.length === 0 ? (
        <div className="p-8 text-center">
          <p className="text-gray-500">No hay gastos registrados en este período</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoría
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Descripción
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Monto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Proveedor
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredExpenses.map((expense) => {
                const expenseId = expense.id || expense._id; // Usar el id correcto
                const isHighExpense = expense.amount > highExpenseThreshold;
                return (
                  <tr key={expenseId} className={isHighExpense ? 'bg-red-50' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(expense.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${CATEGORY_COLORS[expense.category]}`}>
                        {CATEGORY_ICONS[expense.category]} {expense.category.charAt(0).toUpperCase() + expense.category.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        {expense.description}
                        {expense.is_recurring && (
                          <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800">
                            🔁 Mensual
                          </span>
                        )}
                        {isHighExpense && (
                          <span className="ml-2 text-red-500" title="Gasto inusualmente alto">
                            <AlertTriangle className="h-4 w-4" />
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      ${expense.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {expense.supplier || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => onEdit(expense)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                        title="Editar gasto"
                      >
                        <Edit2 className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(expenseId)}
                        className="text-red-600 hover:text-red-900"
                        title="Eliminar gasto"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirmar eliminación</h3>
            <p className="text-sm text-gray-500 mb-4">
              ¿Estás seguro de que deseas eliminar este gasto? Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDeleteExpense}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

