// ExpenseFormModal.tsx
import React, { useState, useRef, useEffect } from 'react';
import { X, Calendar, DollarSign, FileText, User, Upload } from 'lucide-react';
import { Expense, ExpenseFormData } from '../types/expenses';
import toast from 'react-hot-toast';
import { useAuthFetch } from '../utils/authFetch';

interface Props {
  expense?: Expense;
  onClose: () => void;
  onSave: (expense: Expense) => void;
}

interface Product {
  _id: string;
  name: string;
  purchase_price: number;
  sale_price: number;
}

const CATEGORIES = [
  { id: 'inventory', name: '📦 Inventario', color: 'bg-blue-100 text-blue-800' },
  { id: 'services', name: '💡 Servicios', color: 'bg-yellow-100 text-yellow-800' },
  { id: 'payroll', name: '🧑‍💼 Nómina', color: 'bg-purple-100 text-purple-800' },
  { id: 'logistics', name: '🚚 Logística', color: 'bg-green-100 text-green-800' },
  { id: 'other', name: '❔ Otros', color: 'bg-gray-100 text-gray-800' },
];

const SUPPLIERS = [
  'Suplementos S.A.',
  'Distribuidora de Alimentos',
  'Servicios Eléctricos',
  'Papelería y Empaques',
  'Transportes Rápidos',
];

// La URL base de la API se obtiene desde las variables de entorno o se usa el localhost
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function ExpenseFormModal({ expense, onClose, onSave }: Props) {
  // Estado general del gasto
  const [formData, setFormData] = useState<ExpenseFormData>({
    amount: expense?.amount || 0,
    // Se inicia la categoría (por defecto se usa "services" para gastos no inventario)
    category: expense?.category || 'services',
    date: expense?.date || new Date().toISOString().split('T')[0],
    description: expense?.description || '',
    supplier: expense?.supplier || '',
    is_recurring: expense?.is_recurring || false,
    receipt_url: expense?.receipt_url || '',
  });
  const authFetch = useAuthFetch();
  const [receiptPreview, setReceiptPreview] = useState<string | null>(expense?.receipt_url || null);
  const [supplierSuggestions, setSupplierSuggestions] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estados para campos específicos de inventario
  const [productQuery, setProductQuery] = useState('');
  const [productSuggestions, setProductSuggestions] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productPurchasePrice, setProductPurchasePrice] = useState<number>(0);
  const [useAutoPrice, setUseAutoPrice] = useState<boolean>(true);
  const [productQuantity, setProductQuantity] = useState<number>(0);

  // Se obtiene el club activo del localStorage (necesario para filtrar productos y asociar gastos)
  const mainClubStr = localStorage.getItem('mainClub');
  const clubId = mainClubStr ? JSON.parse(mainClubStr).id : null;

  // Manejo de subida de comprobante
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptPreview(reader.result as string);
        setFormData({ ...formData, receipt_url: 'https://example.com/receipt.jpg' });
      };
      reader.readAsDataURL(file);
    }
  };

  // Autocomplete para proveedor
  const handleSupplierChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData({ ...formData, supplier: value });
    if (value.length > 0) {
      const filtered = SUPPLIERS.filter(supplier =>
        supplier.toLowerCase().includes(value.toLowerCase())
      );
      setSupplierSuggestions(filtered);
    } else {
      setSupplierSuggestions([]);
    }
  };

  const selectSupplier = (supplier: string) => {
    setFormData({ ...formData, supplier });
    setSupplierSuggestions([]);
  };

  // Buscar productos según el club y el query ingresado (se asume que existe este endpoint)
  const fetchProductSuggestions = async (query: string) => {
    try {
      const response = await authFetch(`${API_BASE_URL}/api/products?club=${clubId}&q=${query}`);
      if (response.ok) {
        const products = await response.json();
        setProductSuggestions(products);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  useEffect(() => {
    if (productQuery.length > 2) {
      fetchProductSuggestions(productQuery);
    } else {
      setProductSuggestions([]);
    }
  }, [productQuery]);

  const selectProduct = (product: Product) => {
    setSelectedProduct(product);
    setProductQuery(product.name);
    setProductSuggestions([]);
    setProductPurchasePrice(product.purchase_price);
    setUseAutoPrice(true);
  };

  // Manejo del envío del formulario
  const handleSubmit = async (e: React.FormEvent, saveAndRepeat: boolean = false) => {
    e.preventDefault();

    if (!clubId) {
      toast.error('Club no encontrado en localStorage');
      return;
    }

    // Si es gasto de inventario se valida que se haya seleccionado un producto y una cantidad válida.
    if (formData.category === 'inventory') {
      if (!selectedProduct) {
        toast.error('Debe seleccionar un producto');
        return;
      }
      if (productQuantity <= 0) {
        toast.error('La cantidad debe ser mayor a 0');
        return;
      }
      // Se calcula el monto y se autogenera la descripción
      formData.amount = productPurchasePrice * productQuantity;
      formData.description = `Compra de ${selectedProduct.name} - cantidad ${productQuantity}`;
    } else {
      if (formData.amount <= 0) {
        toast.error('El monto debe ser mayor a 0');
        return;
      }
    }

    try {
      // Crear o actualizar el gasto en la base de datos
      const expensePayload = { ...formData, club: clubId };
      let savedExpense;
      if (expense) {
        const id = expense.id || expense._id;
        if (!id) throw new Error('ID del gasto no definido');
        const response = await authFetch(`${API_BASE_URL}/api/expenses/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(expensePayload),
        });
        if (!response.ok) throw new Error('Error al actualizar el gasto');
        savedExpense = await response.json();
      } else {
        const response = await authFetch(`${API_BASE_URL}/api/expenses`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(expensePayload),
        });
        if (!response.ok) throw new Error('Error al crear el gasto');
        savedExpense = await response.json();
      }

      // Si el gasto es de inventario, se realiza el ajuste en el inventario
      if (formData.category === 'inventory' && selectedProduct && productQuantity > 0) {
        const adjustPayload = {
          product_id: selectedProduct._id,
          type: 'purchase',
          quantity: productQuantity,
          notes: formData.description,
          purchase_price: productPurchasePrice,
          // Se utiliza el precio de venta del producto; ajustar según necesidad
          sale_price: selectedProduct.sale_price,
          update_catalog_price: false,
          club: clubId,
        };
        const adjustResponse = await authFetch(`${API_BASE_URL}/api/inventory/adjust`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(adjustPayload),
        });
        if (!adjustResponse.ok) {
          throw new Error('Error al ajustar el inventario');
        }
      }

      onSave(savedExpense);

      if (!expense && saveAndRepeat) {
        // Reiniciar el formulario; para inventario se limpian los datos específicos
        setFormData({
          amount: 0,
          category: formData.category,
          date: new Date().toISOString().split('T')[0],
          description: '',
          supplier: formData.supplier,
          is_recurring: formData.is_recurring,
          receipt_url: '',
        });
        setReceiptPreview(null);
        setSelectedProduct(null);
        setProductQuery('');
        setProductSuggestions([]);
        setProductQuantity(0);
        setProductPurchasePrice(0);
        setUseAutoPrice(true);
        toast.success('Gasto guardado. Puede registrar otro similar.');
      }
    } catch (error) {
      console.error('Error saving expense:', error);
      toast.error('Error al guardar el gasto');
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md sm:max-w-lg mx-4 sm:mx-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-medium">
            {expense ? 'Editar Gasto' : 'Registrar Nuevo Gasto'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="h-6 w-6" />
          </button>
        </div>
        <form onSubmit={(e) => handleSubmit(e)} className="p-4 space-y-4">
          {/* 1. Categoría */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
              Categoría*
            </label>
            <select
              id="category"
              required
              className="mt-1 block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Si es Inventario, se muestran los campos de producto */}
          {formData.category === 'inventory' ? (
            <div className="p-3 bg-blue-50 rounded-md">
              <h4 className="text-sm font-medium text-blue-800 mb-2">Detalles de Inventario</h4>
              {/* Buscador de producto */}
              <div className="mb-4 relative">
                <label htmlFor="product" className="block text-sm font-medium text-gray-700">
                  Producto*
                </label>
                <input
                  type="text"
                  id="product"
                  className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 sm:text-sm"
                  placeholder="Buscar producto..."
                  value={productQuery}
                  onChange={(e) => {
                    setProductQuery(e.target.value);
                    setSelectedProduct(null);
                  }}
                  required
                />
                {productSuggestions.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md py-1 text-sm">
                    {productSuggestions.map((product) => (
                      <div
                        key={product._id}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => selectProduct(product)}
                      >
                        {product.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {/* Precio del producto con checkbox para usar precio automático */}
              {selectedProduct && (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="purchasePrice" className="block text-sm font-medium text-gray-700">
                      Precio del Producto*
                    </label>
                    <div className="flex items-center">
                      <input
                        type="number"
                        id="purchasePrice"
                        min="0"
                        step="0.01"
                        className={`mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 sm:text-sm ${
                          useAutoPrice ? 'bg-gray-100 cursor-not-allowed' : ''
                        }`}
                        placeholder="Precio de compra"
                        value={productPurchasePrice || ''}
                        onChange={(e) =>
                          setProductPurchasePrice(parseFloat(e.target.value) || 0)
                        }
                        disabled={useAutoPrice}
                        required
                      />
                      <div className="ml-2 flex items-center">
                        <input
                          type="checkbox"
                          id="autoPrice"
                          checked={useAutoPrice}
                          onChange={(e) => {
                            setUseAutoPrice(e.target.checked);
                            if (e.target.checked && selectedProduct) {
                              setProductPurchasePrice(selectedProduct.purchase_price);
                            }
                          }}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="autoPrice" className="ml-1 text-sm text-gray-700">
                          Automático
                        </label>
                      </div>
                    </div>
                  </div>
                  {/* Cantidad de producto */}
                  <div>
                    <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                      Cantidad*
                    </label>
                    <input
                      type="number"
                      id="quantity"
                      min="1"
                      className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 sm:text-sm"
                      placeholder="Cantidad"
                      value={productQuantity || ''}
                      onChange={(e) => setProductQuantity(parseInt(e.target.value) || 0)}
                      required
                    />
                  </div>
                </div>
              )}
            </div>
          ) : (
            // Si no es inventario, se muestra el campo de descripción
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Descripción*
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FileText className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="description"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Ej: Pago de internet para el local"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>
            </div>
          )}

          {/* 3. Campo Monto (solo para gastos que no sean de inventario; en inventario se calcula automáticamente) */}
          {formData.category !== 'inventory' && (
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                Monto*
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <DollarSign className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="number"
                  id="amount"
                  min="1"
                  step="0.01"
                  required
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="0.00"
                  value={formData.amount || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>
            </div>
          )}

          {/* 4. Fecha */}
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700">
              Fecha*
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="date"
                id="date"
                required
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
          </div>

          {/* 5. Proveedor */}
          <div>
            <label htmlFor="supplier" className="block text-sm font-medium text-gray-700">
              Proveedor
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="supplier"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Nombre del proveedor"
                value={formData.supplier}
                onChange={handleSupplierChange}
              />
              {supplierSuggestions.length > 0 && (
                <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md py-1 text-sm">
                  {supplierSuggestions.map((supplier) => (
                    <div
                      key={supplier}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => selectSupplier(supplier)}
                    >
                      {supplier}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <p className="mt-1 text-xs text-gray-500">
              ¿Vas a comprarle a un proveedor frecuente?
            </p>
          </div>

          {/* 6. Subida de Comprobante */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Comprobante (opcional)
            </label>
            <div
              className="mt-1 flex flex-col items-center justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:border-gray-400"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="space-y-1 text-center">
                {receiptPreview ? (
                  <img
                    src={receiptPreview}
                    alt="Receipt preview"
                    className="mx-auto h-32 w-auto object-contain"
                  />
                ) : (
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                )}
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
                  >
                    <span>Subir un archivo</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*,.pdf"
                    />
                  </label>
                  <p className="pl-1">o arrastra y suelta</p>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, PDF hasta 10MB</p>
              </div>
            </div>
          </div>

          {/* 7. Gasto recurrente */}
          <div className="flex items-center">
            <input
              id="is_recurring"
              name="is_recurring"
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              checked={formData.is_recurring}
              onChange={(e) => setFormData({ ...formData, is_recurring: e.target.checked })}
            />
            <label htmlFor="is_recurring" className="ml-2 block text-sm text-gray-900">
              Este es un gasto recurrente (mensual)
            </label>
          </div>

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancelar
            </button>
            {!expense && (
              <button
                type="button"
                onClick={(e) => handleSubmit(e, true)}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Guardar y Repetir
              </button>
            )}
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#28A745] hover:bg-[#218838]"
            >
              {expense ? 'Actualizar' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}





