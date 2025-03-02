// src/components/products/ProductList.tsx
import { useEffect, useState } from 'react';
import { Package, Edit, Trash2 } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function ProductList() {
  const [products, setProducts] = useState<any[]>([]);

  // Recupera el club principal desde el localStorage
  const storedClub = localStorage.getItem("mainClub");
  const mainClub = storedClub ? JSON.parse(storedClub) : null;

  useEffect(() => {
    if (mainClub && mainClub.id) {
      loadProducts();
    }
  }, [mainClub]);

  const loadProducts = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/products?club=${mainClub.id}`);
      if (!res.ok) {
        throw new Error('Error al cargar los productos');
      }
      const data = await res.json();
      setProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <ul className="divide-y divide-gray-200">
        {products.map((product: any) => (
          <li key={product.id}>
            <div className="px-4 py-4 flex items-center sm:px-6">
              <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                <div className="flex items-center">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="h-12 w-12 rounded-md object-cover"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-md bg-gray-100 flex items-center justify-center">
                      <Package className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">{product.name}</h3>
                    <div className="mt-1 flex items-center">
                      <span className="text-sm text-gray-500">{product.category}</span>
                      <span className="mx-2 text-gray-500">•</span>
                      <span className="text-sm text-gray-500">
                        {product.type === 'sealed' ? 'Cerrado' : 'Preparado'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex-shrink-0 sm:mt-0 sm:ml-5">
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        Precio de venta: ${product.sale_price}
                      </p>
                      <p className="text-sm text-gray-500">
                        Costo: ${product.purchase_price}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        className="p-2 text-gray-400 hover:text-blue-600"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        type="button"
                        className="p-2 text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
