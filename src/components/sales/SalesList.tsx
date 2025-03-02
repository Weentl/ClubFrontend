//SalesList.tsx
import { Package, Coffee, User } from 'lucide-react';
import type { Sale } from '../types/sales';
import type { Product } from '../types/products';
import type { Client } from '../types/clients';

interface Props {
  sales: Sale[];
  loading: boolean;
  products: Record<string, Product>;
  clients: Record<string, Client>;
}

function formatLocalDate(dateStr: string): string {
  console.log('dateStr', dateStr);

  // **Eliminar la 'Z' al final si existe para tratar la cadena como hora local**
  const dateStrLocalTime = dateStr.endsWith('Z') ? dateStr.slice(0, -1) : dateStr;

  const date = new Date(dateStrLocalTime);
  console.log('date', date);

  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: true,
  };

  return date.toLocaleString(undefined, options);
}

export default function SalesList({ sales, loading, products, clients }: Props) {
  const getClientTypeIcon = (type: string) => {
    switch (type) {
      case 'occasional': return '🔵';
      case 'regular': return '🟢';
      case 'wholesale': return '🟣';
      default: return '⚪';
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#2A5C9A]"></div>
        <p className="mt-2 text-gray-500">Cargando ventas...</p>
      </div>
    );
  }

  if (sales.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">
          No hay ventas que coincidan con los filtros seleccionados
        </p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-gray-200">
      {sales.map(sale => {
        const saleId = sale.id || sale._id;
        const client = sale.client_id ? clients[sale.client_id] : null;
        return (
          <li key={saleId} className="px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Venta #{saleId.slice(0, 8)}
                </p>
                <p className="text-sm text-gray-500">
                  {formatLocalDate(sale.created_at)}
                </p>
              </div>
              <div className="text-sm font-medium text-gray-900">
                ${sale.total.toFixed(2)}
              </div>
            </div>
            {client && (
              <div className="mt-2 flex items-center text-sm text-gray-500">
                <User className="h-4 w-4 text-gray-400 mr-1" />
                <span>
                  Cliente: {client.name} {getClientTypeIcon(client.type)}
                </span>
              </div>
            )}
            <div className="mt-2">
              <div className="space-y-2">
                {sale.items.map(item => {
                  const product = products[item.product_id];
                  return (
                    <div key={item.id} className="flex items-center text-sm">
                      {item.type === 'sealed' ? (
                        <Package className="h-4 w-4 text-gray-400 mr-2" />
                      ) : (
                        <Coffee className="h-4 w-4 text-gray-400 mr-2" />
                      )}
                      <span className="flex-1">
                        {product?.name} x{item.quantity}
                      </span>
                      <span className="text-gray-500">
                        ${(item.quantity * item.unit_price).toFixed(2)}
                      </span>
                    </div>
                  );
                })}
              </div>
              {sale.status === 'pending_inventory_adjustment' && (
                <div className="mt-2 text-sm text-yellow-600">
                  🍳 Ajuste de inventario pendiente
                </div>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

