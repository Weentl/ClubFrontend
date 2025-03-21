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
  const dateStrLocalTime = dateStr.endsWith('Z') ? dateStr.slice(0, -1) : dateStr;
  const date = new Date(dateStrLocalTime);
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

/**
 * Función que retorna el nombre del producto.
 * Si productId es nulo, se utiliza fallbackName (almacenado en product_name).
 */
const getProductName = (productId: string | null, fallbackName?: string) => {
  if (!productId && fallbackName) {
    return fallbackName;
  }
  const product = fallbackName ? undefined : undefined; // Evitamos acceder a fallback aquí
  // Se espera que el objeto de producto se encuentre en 'products', pero como este componente recibe
  // un record de productos, se usa el productId para acceder.
  // Si no se encuentra, se utiliza fallbackName.
  return productId && productId in product ? product[productId].name : (fallbackName || 'Producto desconocido');
};

// Dado que la función getProductName necesita el objeto "products", lo recibiremos en el componente.
// Por ello, se define la función getProductName dentro del componente SalesList.

export default function SalesList({ sales, loading, products, clients }: Props) {
  const getClientTypeIcon = (type: string) => {
    switch (type) {
      case 'occasional': return '🔵';
      case 'regular': return '🟢';
      case 'wholesale': return '🟣';
      default: return '⚪';
    }
  };

  // Función interna para obtener el nombre del producto, usando products y fallback
  const getName = (productId: string | null, fallbackName?: string) => {
    if (!productId && fallbackName) {
      return fallbackName;
    }
    const prod = productId ? products[productId] : null;
    return prod ? prod.name : (fallbackName || 'Producto desconocido');
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
                {sale.created_by_name && (
                  <p className="text-xs text-gray-500">
                    Venta realizada por: {sale.created_by_name}
                  </p>
                )}
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
                  const name = getName(item.product_id, (item as any).product_name);
                  return (
                    <div key={item.id} className="mb-2">
                      <div className="flex items-center text-sm">
                        {item.type === 'sealed' ? (
                          <Package className="h-4 w-4 text-gray-400 mr-2" />
                        ) : (
                          <Coffee className="h-4 w-4 text-gray-400 mr-2" />
                        )}
                        <span className="flex-1">
                          {name} x {item.quantity}
                        </span>
                        <span className="text-gray-500">
                          ${(item.quantity * item.unit_price).toFixed(2)}
                        </span>
                      </div>
                      {Array.isArray((item as any).extras) && (item as any).extras.length > 0 && (
                        <div className="ml-6 mt-1 space-y-1">
                          {(item as any).extras.map(extra => (
                            <div key={extra.id} className="flex items-center text-xs text-gray-600">
                              <span className="flex-1">
                                {extra.description} x {extra.quantity}
                              </span>
                              <span>
                                ${(extra.quantity * extra.cost).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}




