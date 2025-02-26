// SalesList.tsx
import React, { useEffect, useState } from 'react';
import { Package, Coffee } from 'lucide-react';
import type { Sale } from '../types/sales';
import type { Product } from '../types/products';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function SalesList() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Record<string, Product>>({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'sealed' | 'prepared'>('all');

  // Recupera el club activo desde el localStorage
  const storedClub = localStorage.getItem("mainClub");
  const mainClub = storedClub ? JSON.parse(storedClub) : null;

  useEffect(() => {
    loadSales();
    loadProducts();
  }, []);

  const loadSales = async () => {
    try {
      // Se agrega el club como query parameter para filtrar las ventas
      const clubQuery = mainClub && mainClub.id ? `?club=${mainClub.id}` : '';
      const response = await fetch(`${API_BASE_URL}/api/sales${clubQuery}`);
      if (!response.ok) throw new Error('Error fetching sales');
      const data = await response.json();
      // Mapea cada venta para asignar 'id' desde '_id'
      const mappedSales = data.map((sale: any) => ({
        ...sale,
        id: sale._id,
      }));
      setSales(mappedSales);
    } catch (error) {
      console.error('Error loading sales:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      // También filtramos productos por club
      const clubQuery = mainClub && mainClub.id ? `?club=${mainClub.id}` : '';
      const response = await fetch(`${API_BASE_URL}/api/products${clubQuery}`);
      if (!response.ok) throw new Error('Error fetching products');
      const data = await response.json();
      const productsMap: Record<string, Product> = {};
      data.forEach((product: any) => {
        productsMap[product._id] = { ...product, id: product._id };
      });
      setProducts(productsMap);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const filteredSales = sales.filter((sale) => {
    if (filter === 'all') return true;
    return sale.items.some((item) => item.type === filter);
  });

  if (loading) return <p>Cargando ventas...</p>;

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Historial de Ventas
          </h3>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as typeof filter)}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="all">Todas las ventas</option>
            <option value="sealed">Solo productos sellados</option>
            <option value="prepared">Solo preparados</option>
          </select>
        </div>
      </div>
      <ul className="divide-y divide-gray-200">
        {filteredSales.map((sale) => (
          <li key={sale.id} className="px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Venta #{sale.id.slice(0, 8)}
                </p>
                <p className="text-sm text-gray-500">
                    {new Date(sale.created_at).toLocaleDateString('es-ES', { timeZone: 'UTC' })} {new Date(sale.created_at).toLocaleTimeString('es-ES', { timeZone: 'UTC' })}
                </p>
              </div>
              <div className="text-sm font-medium text-gray-900">
                ${sale.total.toFixed(2)}
              </div>
            </div>
            <div className="mt-2">
              <div className="space-y-2">
                {sale.items.map((item) => {
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
        ))}
      </ul>
    </div>
  );
}


