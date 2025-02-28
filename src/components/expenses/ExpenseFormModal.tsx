// ExpenseFormModal.tsx
import React, { useState, useRef } from 'react';
import { X, Calendar, DollarSign, FileText, User, Upload } from 'lucide-react';
import { Expense, ExpenseFormData } from '../types/expenses';
import toast from 'react-hot-toast';

interface Props {
  expense?: Expense;
  onClose: () => void;
  onSave: (expense: Expense) => void;
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

// Definir API_BASE_URL localmente
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function ExpenseFormModal({ expense, onClose, onSave }: Props) {
  const [formData, setFormData] = useState<ExpenseFormData>({
    amount: expense?.amount || 0,
    category: expense?.category || 'inventory',
    date: expense?.date || new Date().toISOString().split('T')[0],
    description: expense?.description || '',
    supplier: expense?.supplier || '',
    is_recurring: expense?.is_recurring || false,
    receipt_url: expense?.receipt_url || '',
  });

  const [receiptPreview, setReceiptPreview] = useState<string | null>(expense?.receipt_url || null);
  const [supplierSuggestions, setSupplierSuggestions] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Simulación de subida de archivo (en un caso real se subiría al servidor)
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptPreview(reader.result as string);
        setFormData({ ...formData, receipt_url: 'https://example.com/receipt.jpg' });
      };
      reader.readAsDataURL(file);
    }
  };

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

  const handleSubmit = async (e: React.FormEvent, saveAndRepeat: boolean = false) => {
    e.preventDefault();

    if (formData.amount <= 0) {
      toast.error('El monto debe ser mayor a 0');
      return;
    }

    try {
      // Extraer el club activo desde el localStorage
      const mainClubStr = localStorage.getItem('mainClub');
      if (!mainClubStr) {
        throw new Error('Club no encontrado en localStorage');
      }
      const mainClub = JSON.parse(mainClubStr);
      const clubId = mainClub.id;

      // Incluir el club en el payload
      const expensePayload = { ...formData, club: clubId };

      if (expense) {
        // Para actualizar, usamos expense.id o expense._id
        const id = expense.id || expense._id;
        if (!id) {
          throw new Error('ID del gasto no definido');
        }
        const response = await fetch(`${API_BASE_URL}/api/expenses/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(expensePayload)
        });
        if (!response.ok) throw new Error('Error updating expense');
        const updatedExpense = await response.json();
        onSave(updatedExpense);
      } else {
        // Crear nuevo gasto
        const response = await fetch(`${API_BASE_URL}/api/expenses`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(expensePayload)
        });
        if (!response.ok) throw new Error('Error creating expense');
        const newExpense = await response.json();
        onSave(newExpense);

        if (saveAndRepeat) {
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
          toast.success('Gasto guardado. Puede registrar otro similar.');
        }
      }
    } catch (error) {
      console.error('Error saving expense:', error);
      toast.error('Error al guardar el gasto');
    }
  };

  const isInventoryExpense = formData.category === 'inventory';

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-medium">
            {expense ? 'Editar Gasto' : 'Registrar Nuevo Gasto'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={(e) => handleSubmit(e)} className="p-4 space-y-4">
          {/* Campo Monto */}
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

          {/* Campo Categoría */}
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
              {CATEGORIES.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Campo Fecha */}
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

          {/* Campo Descripción */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Descripción
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
              />
            </div>
          </div>

          {/* Campo Proveedor con Autocomplete */}
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

          {/* Campos para gasto de Inventario */}
          {isInventoryExpense && (
            <div className="p-3 bg-blue-50 rounded-md">
              <h4 className="text-sm font-medium text-blue-800 mb-2">
                Detalles de Inventario
              </h4>
              <p className="text-xs text-blue-600 mb-2">
                Este gasto se registrará como una compra de inventario.
              </p>
              <p className="text-xs text-blue-600">
                Recuerda actualizar tu inventario después de registrar este gasto.
              </p>
            </div>
          )}

          {/* Subida de Comprobante */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Comprobante (opcional)
            </label>
            <div
              className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:border-gray-400"
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

          {/* Checkbox para gasto recurrente */}
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

          <div className="flex justify-end space-x-3 pt-4">
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

