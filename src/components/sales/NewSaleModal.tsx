// NewSaleModal.tsx
import React, { useState, useEffect } from 'react';
import { X, Search, Package, Coffee } from 'lucide-react';
import type { Product } from '../types/products';
import type { SaleItem } from '../types/sales';

interface Props {
  onClose: () => void;
}
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function NewSaleModal({ onClose }: Props) {
  const [step, setStep] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedItems, setSelectedItems] = useState<SaleItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Recupera el club activo desde el localStorage
  const storedClub = localStorage.getItem("mainClub");
  const mainClub = storedClub ? JSON.parse(storedClub) : null;

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      // Se envía el club como query parameter para filtrar los productos
      const clubQuery = mainClub && mainClub.id ? `?club=${mainClub.id}` : '';
      const response = await fetch(`${API_BASE_URL}/api/products${clubQuery}`);
      if (!response.ok) throw new Error('Error fetching products');
      const data = await response.json();
      // Mapea _id a id para cada producto
      const mappedProducts = data.map((prod: any) => ({
        ...prod,
        id: prod._id,
      }));
      setProducts(mappedProducts);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addItem = (product: Product) => {
    const existingItem = selectedItems.find(
      (item) => item.product_id === product.id
    );
    if (existingItem) {
      setSelectedItems(
        selectedItems.map((item) =>
          item.product_id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setSelectedItems([
        ...selectedItems,
        {
          id: crypto.randomUUID(),
          product_id: product.id,
          quantity: 1,
          unit_price: product.sale_price,
          type: product.type as 'sealed' | 'prepared',
          custom_price: false,
        },
      ]);
    }
  };

  const removeItem = (itemId: string) => {
    setSelectedItems(selectedItems.filter((item) => item.id !== itemId));
  };

  const updateItemQuantity = (itemId: string, quantity: number) => {
    setSelectedItems(
      selectedItems.map((item) =>
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  };

  const updateItemPrice = (itemId: string, price: number, custom: boolean) => {
    setSelectedItems(
      selectedItems.map((item) =>
        item.id === itemId
          ? { ...item, unit_price: price, custom_price: custom }
          : item
      )
    );
  };

  const total = selectedItems.reduce(
    (sum, item) => sum + item.quantity * item.unit_price,
    0
  );

  const handleSubmit = async () => {
    if (!mainClub || !mainClub.id) {
      console.error('No se encontró el club activo.');
      return;
    }
    try {
      const saleData = {
        items: selectedItems,
        total,
        status: 'completed',
        club: mainClub.id, // Se asocia la venta al club activo
      };

      const response = await fetch(`${API_BASE_URL}/api/sales`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(saleData),
      });

      if (!response.ok) throw new Error('Error creating sale');

      onClose();
    } catch (error) {
      console.error('Error creating sale:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-medium">
            {step === 1 ? 'Seleccionar Productos' : 'Confirmar Venta'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="h-6 w-6" />
          </button>
        </div>

        {step === 1 && (
          <div className="p-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="border rounded-lg p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer"
                  onClick={() => addItem(product)}
                >
                  <div className="flex items-center">
                    {product.type === 'sealed' ? (
                      <Package className="h-6 w-6 text-gray-400 mr-3" />
                    ) : (
                      <Coffee className="h-6 w-6 text-gray-400 mr-3" />
                    )}
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">
                        {product.name}
                      </h4>
                      <p className="text-sm text-gray-500">
                        ${product.sale_price}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">
                    {product.type === 'sealed' ? '📦' : '🍳'}
                  </span>
                </div>
              ))}
            </div>

            {selectedItems.length > 0 && (
              <div className="mt-6 border-t pt-4">
                <h4 className="text-lg font-medium mb-4">
                  Productos Seleccionados
                </h4>
                <div className="space-y-4">
                  {selectedItems.map((item) => {
                    const product = products.find(
                      (p) => p.id === item.product_id
                    );
                    return (
                      <div
                        key={item.id}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center">
                          {product?.type === 'sealed' ? (
                            <Package className="h-5 w-5 text-gray-400 mr-2" />
                          ) : (
                            <Coffee className="h-5 w-5 text-gray-400 mr-2" />
                          )}
                          <span className="text-sm font-medium">
                            {product?.name}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) =>
                              updateItemQuantity(
                                item.id,
                                parseInt(e.target.value)
                              )
                            }
                            className="w-20 px-2 py-1 border rounded"
                          />
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-red-500 hover:text-red-600"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {selectedItems.length > 0 && (
              <div className="mt-4 flex justify-end">
                <button
                  onClick={handleSubmit}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Confirmar Venta (${total.toFixed(2)})
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}


