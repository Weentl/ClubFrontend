// InventoryAdjustmentModal.tsx
import React, { useState } from 'react';
import { X } from 'lucide-react';
import type { InventoryAdjustmentData } from '../types/inventory';
import type { CombinedInventoryItem } from './InventoryList';

interface Props {
  item: CombinedInventoryItem;
  onClose: () => void;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const ADJUSTMENT_TYPES = [
  { value: 'use_in_prepared', label: '👨‍🍳 Uso en preparados' },
  { value: 'gift', label: '🎁 Regalo' },
  { value: 'damaged', label: '❌ Dañado' },
  { value: 'restock', label: '📦 Restock' },
  { value: 'purchase', label: '💰 Compra' },
  { value: 'other', label: '📝 Otro' },
];

export default function InventoryAdjustmentModal({ item, onClose }: Props) {
  // Recupera el club principal desde el localStorage
  const storedClub = localStorage.getItem("mainClub");
  const mainClub = storedClub ? JSON.parse(storedClub) : null;

  const [adjustment, setAdjustment] = useState<InventoryAdjustmentData>({
    quantity: 0,
    type: 'restock',
    notes: '',
    purchase_price: item.purchase_price,
    sale_price: item.sale_price,
    update_catalog_price: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mainClub || !mainClub.id) {
      console.error('No se encontró el club activo.');
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/api/inventory/adjust`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: item._id, // Asegúrate de usar el identificador correcto
          type: adjustment.type,
          quantity: adjustment.quantity,
          notes: adjustment.notes,
          purchase_price: adjustment.purchase_price,
          sale_price: adjustment.sale_price,
          update_catalog_price: adjustment.update_catalog_price,
          club: mainClub.id, // Se asocia el ajuste al club activo
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al ajustar inventario');
      }

      const data = await response.json();
      console.log('Inventario ajustado:', data);
      onClose();
    } catch (error) {
      console.error('Error al ajustar inventario:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-medium">Ajustar Stock: {item.name}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Cantidad (+ para agregar, - para restar)
            </label>
            <input
              type="number"
              value={adjustment.quantity}
              onChange={(e) =>
                setAdjustment({
                  ...adjustment,
                  quantity: parseInt(e.target.value),
                })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Motivo</label>
            <select
              value={adjustment.type}
              onChange={(e) =>
                setAdjustment({
                  ...adjustment,
                  type: e.target.value as InventoryAdjustmentData['type'],
                })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              {ADJUSTMENT_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {(adjustment.type === 'restock' || adjustment.type === 'purchase') && (
            <>
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  id="updatePrices"
                  checked={adjustment.update_catalog_price}
                  onChange={(e) =>
                    setAdjustment({
                      ...adjustment,
                      update_catalog_price: e.target.checked,
                    })
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="updatePrices" className="ml-2 block text-sm text-gray-900">
                  Actualizar precios en catálogo
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Precio de Compra
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={adjustment.purchase_price}
                  onChange={(e) =>
                    setAdjustment({
                      ...adjustment,
                      purchase_price: parseFloat(e.target.value),
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Precio de Venta
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={adjustment.sale_price}
                  onChange={(e) =>
                    setAdjustment({
                      ...adjustment,
                      sale_price: parseFloat(e.target.value),
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">Notas (opcional)</label>
            <textarea
              value={adjustment.notes}
              onChange={(e) => setAdjustment({ ...adjustment, notes: e.target.value })}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Ej: Se usaron 2 bolsas para waffles"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


