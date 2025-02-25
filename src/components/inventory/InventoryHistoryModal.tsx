// InventoryHistoryModal.tsx
import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import type { InventoryMovement } from '../types/inventory';
import type { CombinedInventoryItem } from './InventoryList';

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

  // Recupera el club principal desde el localStorage
  const storedClub = localStorage.getItem("mainClub");
  const mainClub = storedClub ? JSON.parse(storedClub) : null;

  useEffect(() => {
    loadMovements();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item._id]);

  const loadMovements = async () => {
    try {
      // Si el backend soporta filtrar por club, se puede enviar como query parameter
      const clubQuery = mainClub && mainClub.id ? `?club=${mainClub.id}` : '';
      const res = await fetch(`${API_BASE_URL}/api/inventory/movements/${item._id}${clubQuery}`);
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cantidad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Motivo
                  </th>
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className={movement.quantity < 0 ? 'text-red-600' : 'text-green-600'}>
                        {movement.quantity > 0 ? '+' : ''}
                        {movement.quantity}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {movement.notes || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {loading && <p className="text-center py-4">Cargando...</p>}
          </div>
        </div>
      </div>
    </div>
  );
}



