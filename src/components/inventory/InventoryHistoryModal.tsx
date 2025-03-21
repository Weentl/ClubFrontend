// InventoryHistoryModal.tsx
import { useEffect, useState } from 'react';
import { X, Edit, Trash2 } from 'lucide-react';
import type { InventoryMovement } from '../types/inventory';
import type { CombinedInventoryItem } from './InventoryList';
import { useAuthFetch } from '../utils/authFetch';

interface Props {
  item: CombinedInventoryItem;
  onClose: () => void;
}

const MOVEMENT_TYPES: Record<string, string> = {
  use_in_prepared: '👨‍🍳 Uso en preparados',
  gift: '🎁 Regalo',
  damaged: '❌ Dañado',
  restock: '📦 Restock',
  purchase: '💰 Compra',
  other: '📝 Otro',
};

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function InventoryHistoryModal({ item, onClose }: Props) {
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingMovement, setEditingMovement] = useState<InventoryMovement | null>(null);
  const [editForm, setEditForm] = useState({ type: '', quantity: 0, notes: '' });
  const authFetch = useAuthFetch();

  // Recupera el club principal desde el localStorage
  const storedClub = localStorage.getItem("mainClub");
  const mainClub = storedClub ? JSON.parse(storedClub) : null;

  useEffect(() => {
    loadMovements();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item._id]);

  const loadMovements = async () => {
    try {
      const clubQuery = mainClub && mainClub.id ? `?club=${mainClub.id}` : '';
      const res = await authFetch(`${API_BASE_URL}/api/inventory/movements/${item._id}${clubQuery}`);
      if (!res.ok) {
        throw new Error('Error al cargar movimientos');
      }
      const data = await res.json();
      setMovements(data);
    } catch (error) {
      console.error('Error loading movements:', error);
    } finally {
      setLoading(false);
    }
  };

  // Eliminar movimiento
  const handleDelete = async (movement: InventoryMovement) => {
    if (!window.confirm(`Está a punto de eliminar el movimiento (${MOVEMENT_TYPES[movement.type]} ${movement.quantity}). ¿Desea continuar?`)) return;
    try {
      const clubQuery = mainClub && mainClub.id ? `?club=${mainClub.id}` : '';
      const res = await authFetch(`${API_BASE_URL}/api/inventory/movements/${movement._id}${clubQuery}`, {
        method: 'DELETE'
      });
      if (!res.ok) {
        throw new Error('Error al eliminar movimiento');
      }
      await res.json();
      loadMovements();
    } catch (error) {
      console.error('Error deleting movement:', error);
    }
  };

  // Preparar edición
  const handleEditInit = (movement: InventoryMovement) => {
    setEditingMovement(movement);
    setEditForm({
      type: movement.type,
      quantity: movement.quantity,
      notes: movement.notes || ''
    });
  };

  // Enviar edición
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!window.confirm('Está a punto de editar este movimiento. ¿Desea continuar?')) return;
    try {
      if (!editingMovement) return;
      // Enviar club en el body en lugar de la query string
      const body = {
        ...editForm,
        club: mainClub.id,
      };
      const res = await authFetch(`${API_BASE_URL}/api/inventory/movements/${editingMovement._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (!res.ok) {
        throw new Error('Error al editar movimiento');
      }
      await res.json();
      setEditingMovement(null);
      loadMovements();
    } catch (error) {
      console.error('Error updating movement:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-medium">Historial de Movimientos: {item.name}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-4">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Motivo</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {movements.map((movement) => (
                  <tr key={movement._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(movement.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {MOVEMENT_TYPES[movement.type]}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={movement.quantity < 0 ? 'text-red-600' : 'text-green-600'}>
                        {movement.quantity > 0 ? '+' : ''}{movement.quantity}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {movement.notes || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                      <button onClick={() => handleEditInit(movement)} className="mr-2 text-blue-600 hover:text-blue-800">
                        <Edit className="h-5 w-5 inline" /> Editar
                      </button>
                      <button onClick={() => handleDelete(movement)} className="text-red-600 hover:text-red-800">
                        <Trash2 className="h-5 w-5 inline" /> Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {loading && <p className="text-center py-4">Cargando...</p>}
          </div>
        </div>

        {/* Modal de edición */}
        {editingMovement && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h4 className="text-lg font-medium mb-4">Editar Movimiento</h4>
              <form onSubmit={handleEditSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Tipo</label>
                  <select
                    value={editForm.type}
                    onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                  >
                    {Object.entries(MOVEMENT_TYPES).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Cantidad</label>
                  <input
                    type="number"
                    value={editForm.quantity}
                    onChange={(e) => setEditForm({ ...editForm, quantity: Number(e.target.value) })}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Motivo</label>
                  <textarea
                    value={editForm.notes}
                    onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
                <div className="flex justify-end space-x-4">
                  <button type="button" onClick={() => setEditingMovement(null)} className="px-4 py-2 text-gray-700 hover:underline">
                    Cancelar
                  </button>
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                    Guardar cambios
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}




