import { useState, useEffect } from 'react';
import { X, Search, Package, Coffee, DollarSign, User } from 'lucide-react';
import type { Product } from '../types/products';
import type { SaleItem } from '../types/sales';
import ClientSelector from './ClientSelector';
import { Client } from '../types/clients';
import toast from 'react-hot-toast';
import axiosInstance from '../utils/axiosInstance';


// Definimos el tipo Extra
interface Extra {
  id: string;
  description: string;
  quantity: number;
  cost: number;
}

// Extendemos SaleItem para incluir un arreglo de extras
interface ModifiedSaleItem extends Omit<SaleItem, 'extras'> {
  extras?: Extra[];
}

interface Props {
  onClose: () => void;
  onSave?: () => void;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Extraer el club activo desde el localStorage
const storedClub = localStorage.getItem("mainClub");
const mainClub = storedClub ? JSON.parse(storedClub) : null;

export default function NewSaleModal({ onClose, onSave }: Props) {
  const [step, setStep] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedItems, setSelectedItems] = useState<ModifiedSaleItem[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [, setLoading] = useState(true);

  // Estados para controlar el formulario de extras por item
  const [extraFormVisibility, setExtraFormVisibility] = useState<{ [itemId: string]: boolean }>({});
  const [extraFormFields, setExtraFormFields] = useState<{
    [itemId: string]: { description: string; quantity: number; cost: number | '' };
  }>({});

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const clubQuery = mainClub ? `?club=${mainClub}` : '';
      const response = await axiosInstance.get(`${API_BASE_URL}/api/products/${clubQuery}`);
      const data = response.data;
      const mappedProducts = data.map((prod: any) => ({
        ...prod,
        id: prod._id || prod.id,
      }));
      setProducts(mappedProducts);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrado y sugerencias de productos
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const suggestedProducts = searchTerm ? filteredProducts : filteredProducts.slice(0, 4);

  const addItem = (product: Product) => {
    const existingItem = selectedItems.find((item) => item.product_id === product.id);
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
          extras: [],
        },
      ]);
    }
  };

  const removeItem = (itemId: string) => {
    setSelectedItems(selectedItems.filter((item) => item.id !== itemId));
    // Limpiar estados del formulario extra asociados al item
    const newVisibility = { ...extraFormVisibility };
    delete newVisibility[itemId];
    setExtraFormVisibility(newVisibility);
    const newFields = { ...extraFormFields };
    delete newFields[itemId];
    setExtraFormFields(newFields);
  };

  const updateItemQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }
    setSelectedItems(
      selectedItems.map((item) =>
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  };

  const updateItemPrice = (itemId: string, price: number) => {
    if (price <= 0) return;
    setSelectedItems(
      selectedItems.map((item) =>
        item.id === itemId
          ? { ...item, unit_price: price, custom_price: true }
          : item
      )
    );
  };

  // Funciones para manejar el formulario de extras
  const toggleExtraForm = (itemId: string) => {
    setExtraFormVisibility((prev) => ({ ...prev, [itemId]: !prev[itemId] }));
    // Inicializar los campos si aún no existen
    setExtraFormFields((prev) => ({
      ...prev,
      [itemId]: prev[itemId] || { description: '', quantity: 1, cost: '' },
    }));
  };

  const getExtraField = (itemId: string, field: 'description' | 'quantity' | 'cost') => {
    return extraFormFields[itemId]?.[field] ?? (field === 'quantity' ? 1 : field === 'cost' ? '' : '');
  };

  const updateExtraField = (
    itemId: string,
    field: 'description' | 'quantity' | 'cost',
    value: string | number
  ) => {
    setExtraFormFields((prev) => ({
      ...prev,
      [itemId]: { ...prev[itemId], [field]: value },
    }));
  };

  const addExtraToItem = (itemId: string) => {
    const formFields = extraFormFields[itemId];
    if (!formFields || !formFields.description || formFields.quantity <= 0 || formFields.cost === '' || formFields.cost <= 0) {
      toast.error('Completa correctamente los datos del extra. Asegúrate de ingresar un precio mayor a 0.');
      return;
    }
    const newExtra: Extra = {
      id: crypto.randomUUID(),
      description: formFields.description,
      quantity: formFields.quantity,
      cost: Number(formFields.cost),
    };
    setSelectedItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          return { ...item, extras: [...(item.extras || []), newExtra] };
        }
        return item;
      })
    );
    // Reiniciar los campos del extra para este item
    setExtraFormFields((prev) => ({
      ...prev,
      [itemId]: { description: '', quantity: 1, cost: '' },
    }));
    toast.success('Extra agregado');
  };

  // Cálculo total incluyendo extras
  const total = selectedItems.reduce((sum, item) => {
    const productTotal = item.quantity * item.unit_price;
    const extrasTotal = item.extras?.reduce((exSum, extra) => exSum + extra.quantity * extra.cost, 0) || 0;
    return sum + productTotal + extrasTotal;
  }, 0);

  const handleNext = () => {
    if (selectedItems.length === 0) {
      toast.error('Agrega al menos un producto');
      return;
    }
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleSubmit = async () => {
    if (!mainClub) {
      toast.error('No se encontró el club activo.');
      return;
    }
    try {
      const saleData = {
        items: selectedItems,
        total,
        status: 'completed',
        club: mainClub,
        client_id: selectedClient ? (selectedClient.id || selectedClient._id) : null,
        clientTime: new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString(),
        clientTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      };

      console.log('Creating sale:', saleData);

      await axiosInstance.post(`${API_BASE_URL}/api/sales`, saleData);

      if (selectedClient && (selectedClient.id || selectedClient._id)) {
        const clientId = selectedClient.id || selectedClient._id;
        await axiosInstance.patch(`${API_BASE_URL}/api/clients/${clientId}`, {
          total_spent: selectedClient.total_spent + total,
          last_purchase: new Date().toISOString(),
        });
      }

      toast.success('Venta registrada correctamente');
      if (onSave) onSave();
      onClose();
    } catch (error) {
      console.error('Error creating sale:', error);
      toast.error('Error al registrar la venta');
    }
  };

  const getClientTypeLabel = (type: string) => {
    switch (type) {
      case 'occasional': return 'Ocasional';
      case 'regular': return 'Regular';
      case 'wholesale': return 'Mayorista';
      default: return type;
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-2 md:p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-auto my-auto">
        <div className="flex justify-between items-center p-3 sm:p-4 border-b">
          <h3 className="text-base sm:text-lg font-medium">
            {step === 1 ? 'Seleccionar Productos' : 'Confirmar Venta'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>

        {step === 1 ? (
          <div className="p-3 sm:p-4 max-h-[70vh] overflow-y-auto">
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

            {!searchTerm && products.length > 4 && (
              <p className="text-sm text-gray-500 mt-2 mb-0">
                Mostrando 4 productos sugeridos. Usa la búsqueda para encontrar más productos.
              </p>
            )}

            <div className="mt-3 grid grid-cols-1 gap-2 sm:gap-3 md:grid-cols-2">
              {suggestedProducts.map((product) => (
                <div
                  key={product.id}
                  className="border rounded-lg p-2 sm:p-3 flex items-center justify-between hover:bg-gray-50 cursor-pointer"
                  onClick={() => addItem(product)}
                >
                  <div className="flex items-center">
                    {product.type === 'sealed' ? (
                      <Package className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400 mr-2 sm:mr-3 flex-shrink-0" />
                    ) : (
                      <Coffee className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400 mr-2 sm:mr-3 flex-shrink-0" />
                    )}
                    <div className="min-w-0">
                      <h4 className="text-xs sm:text-sm font-medium text-gray-900 truncate">{product.name}</h4>
                      <p className="text-xs sm:text-sm text-gray-500">${product.sale_price}</p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500 ml-2 flex-shrink-0">
                    {product.type === 'sealed' ? '📦' : '🍳'}
                  </span>
                </div>
              ))}
            </div>

            {selectedItems.length > 0 && (
              <div className="mt-4 sm:mt-6 border-t pt-3 sm:pt-4">
                <h4 className="text-base sm:text-lg font-medium mb-2 sm:mb-4">Productos Seleccionados</h4>
                <div className="space-y-3">
                  {selectedItems.map((item) => {
                    const product = products.find((p) => p.id === item.product_id);
                    return (
                      <div key={item.id} className="border-b pb-2 mb-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            {product?.type === 'sealed' ? (
                              <Package className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 mr-2" />
                            ) : (
                              <Coffee className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 mr-2" />
                            )}
                            <span className="text-xs sm:text-sm font-medium truncate max-w-[120px] sm:max-w-full">
                              {product?.name} x {item.quantity}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateItemQuantity(item.id, item.quantity - 1);
                                }}
                                className="px-2 py-1 border rounded-l bg-gray-100 text-sm"
                              >
                                -
                              </button>
                              <input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => updateItemQuantity(item.id, parseInt(e.target.value) || 1)}
                                className="w-12 text-center border-t border-b text-sm"
                                onClick={(e) => e.stopPropagation()}
                              />
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateItemQuantity(item.id, item.quantity + 1);
                                }}
                                className="px-2 py-1 border rounded-r bg-gray-100 text-sm"
                              >
                                +
                              </button>
                            </div>
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4 text-gray-400" />
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={item.unit_price}
                                onChange={(e) => updateItemPrice(item.id, parseFloat(e.target.value) || 0)}
                                className="w-20 border rounded text-sm px-1"
                                onClick={(e) => e.stopPropagation()}
                              />
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeItem(item.id);
                              }}
                              className="text-red-500 hover:text-red-600"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        <div className="mt-2 ml-6">
                          <button
                            className="text-sm text-blue-600 underline"
                            onClick={() => toggleExtraForm(item.id)}
                          >
                            {extraFormVisibility[item.id] ? 'Ocultar formulario extra' : 'Agregar extra'}
                          </button>
                        </div>

                        {extraFormVisibility[item.id] && (
                          <div className="mt-2 ml-6 p-3 border rounded bg-gray-50">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                              <div>
                                <label className="block text-xs font-medium text-gray-700">Descripción</label>
                                <input
                                  type="text"
                                  placeholder="Ej: Salsa extra"
                                  value={getExtraField(item.id, 'description')}
                                  onChange={(e) => updateExtraField(item.id, 'description', e.target.value)}
                                  className="mt-1 block w-full border border-gray-300 rounded px-2 py-1 text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700">Cantidad</label>
                                <input
                                  type="number"
                                  min="1"
                                  value={getExtraField(item.id, 'quantity')}
                                  onChange={(e) => updateExtraField(item.id, 'quantity', e.target.value)}
                                  className="mt-1 block w-full border border-gray-300 rounded px-2 py-1 text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700">Precio</label>
                                <input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  placeholder="0.00"
                                  value={getExtraField(item.id, 'cost')}
                                  onChange={(e) => updateExtraField(item.id, 'cost', e.target.value)}
                                  className="mt-1 block w-full border border-gray-300 rounded px-2 py-1 text-sm"
                                />
                              </div>
                            </div>
                            <button
                              onClick={() => addExtraToItem(item.id)}
                              className="mt-3 bg-green-500 hover:bg-green-600 text-white px-3 py-1 text-sm rounded"
                            >
                              Agregar Extra
                            </button>
                          </div>
                        )}

                        {item.extras && item.extras.length > 0 && (
                          <div className="mt-2 ml-6">
                            {item.extras.map((extra) => (
                              <div key={extra.id} className="flex justify-between text-sm py-1 border-b">
                                <span>{extra.description} x {extra.quantity}</span>
                                <span>${(extra.quantity * extra.cost).toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="mt-3 sm:mt-4 flex justify-between items-center border-t pt-3 sm:pt-4">
                  <span className="text-base sm:text-lg font-medium">Total:</span>
                  <span className="text-lg sm:text-xl font-bold">${total.toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-3 sm:p-4 max-h-[70vh] overflow-y-auto">
            {selectedClient && (
              <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-gray-50 border rounded-lg">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <User className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 mr-2" />
                    <div className="min-w-0">
                      <div className="font-medium text-xs sm:text-sm truncate">
                        Cliente: {selectedClient.name} 🏷️ {getClientTypeLabel(selectedClient.type)}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-500">
                        Total gastado: ${selectedClient.total_spent.toFixed(2)}
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedClient(null)}
                    className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 ml-2"
                  >
                    Cambiar
                  </button>
                </div>
              </div>
            )}
            {!selectedClient && (
              <ClientSelector 
                onSelectClient={setSelectedClient} 
                selectedClient={selectedClient} 
              />
            )}
            <div className="mt-3 sm:mt-4 border rounded-lg p-3 sm:p-4">
              <h4 className="text-base sm:text-lg font-medium mb-2 sm:mb-4">Resumen de Venta</h4>
              <div className="space-y-2">
                {selectedItems.map((item) => {
                  const product = products.find(p => p.id === item.product_id);
                  return (
                    <div key={item.id} className="flex justify-between text-sm">
                      <div className="truncate max-w-[65%]">
                        {product?.name} x {item.quantity}
                        {item.extras && item.extras.length > 0 && (
                          <div className="ml-2 text-gray-600">
                            {item.extras.map((extra) => (
                              <div key={extra.id} className="flex justify-between">
                                <span className="text-xs">{extra.description} x {extra.quantity}</span>
                                <span className="text-xs">${(extra.quantity * extra.cost).toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div>
                        ${(
                          item.quantity * item.unit_price +
                          (item.extras?.reduce((acc, extra) => acc + extra.quantity * extra.cost, 0) || 0)
                        ).toFixed(2)}
                      </div>
                    </div>
                  );
                })}
                <div className="border-t pt-2 mt-2 flex justify-between font-bold text-sm sm:text-base">
                  <div>Total</div>
                  <div>${total.toFixed(2)}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-gray-50 p-3 sm:p-4 sm:flex sm:flex-row-reverse rounded-b-lg">
          {step === 1 ? (
            <button
              type="button"
              className="w-full inline-flex justify-center rounded-md shadow-sm px-3 py-2 sm:px-4 sm:py-2 bg-blue-700 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none"
              onClick={handleNext}
            >
              Continuar
            </button>
          ) : (
            <>
              <button
                type="button"
                className="w-full inline-flex justify-center rounded-md shadow-sm px-3 py-2 sm:px-4 sm:py-2 bg-green-600 text-sm font-medium text-white hover:bg-green-700 focus:outline-none mb-2 sm:mb-0 sm:ml-3"
                onClick={handleSubmit}
              >
                Completar Venta
              </button>
              <button
                type="button"
                className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-3 py-2 sm:px-4 sm:py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none mb-2 sm:mb-0 sm:ml-3"
                onClick={handleBack}
              >
                Atrás
              </button>
            </>
          )}
          <button
            type="button"
            className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-3 py-2 sm:px-4 sm:py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
            onClick={onClose}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}





