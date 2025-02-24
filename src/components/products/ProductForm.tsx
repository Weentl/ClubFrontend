// src/components/products/ProductForm.tsx
import React, { useState } from 'react';
import { Package, Upload, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface ProductFormData {
  name: string;
  category: string;
  customCategory?: string;
  type: 'prepared' | 'sealed';
  description: string;
  purchasePrice: number;
  salePrice: number;
  image?: File;
}

const CATEGORIES = ['Suplementos', 'Alimentos', 'Bebidas', 'Snacks', 'Otro'];

export default function ProductForm() {
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    category: '',
    type: 'sealed',
    description: '',
    purchasePrice: 0,
    salePrice: 0,
  });

  const [imagePreview, setImagePreview] = useState<string>('');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, image: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Preparamos los datos en un FormData para soportar subida de archivos
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      const categoryToSend =
        formData.category === 'Otro' ? formData.customCategory || '' : formData.category;
      formDataToSend.append('category', categoryToSend);
      formDataToSend.append('type', formData.type);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('purchase_price', formData.purchasePrice.toString());
      formDataToSend.append('sale_price', formData.salePrice.toString());
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      const res = await fetch(`${API_BASE_URL}/api/products`, {
        method: 'POST',
        body: formDataToSend,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Error al agregar el producto');
      }

      toast.success('Producto agregado exitosamente');
      // Reiniciamos el formulario
      setFormData({
        name: '',
        category: '',
        type: 'sealed',
        description: '',
        purchasePrice: 0,
        salePrice: 0,
      });
      setImagePreview('');
    } catch (error: any) {
      toast.error('Error al agregar el producto');
      console.error('Error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Nombre del Producto */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Nombre del Producto
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Package className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              id="name"
              required
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
        </div>

        {/* Categoría */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">
            Categoría
          </label>
          <select
            id="category"
            required
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          >
            <option value="">Selecciona una categoría</option>
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Especificar categoría si es "Otro" */}
        {formData.category === 'Otro' && (
          <div>
            <label htmlFor="customCategory" className="block text-sm font-medium text-gray-700">
              Especifica la categoría
            </label>
            <input
              type="text"
              id="customCategory"
              required
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              value={formData.customCategory}
              onChange={(e) =>
                setFormData({ ...formData, customCategory: e.target.value })
              }
            />
          </div>
        )}

        {/* Tipo de Producto */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Tipo de Producto</label>
          <div className="mt-2 space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio text-blue-600"
                name="type"
                value="sealed"
                checked={formData.type === 'sealed'}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value as 'sealed' | 'prepared' })
                }
              />
              <span className="ml-2">Cerrado</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio text-blue-600"
                name="type"
                value="prepared"
                checked={formData.type === 'prepared'}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value as 'sealed' | 'prepared' })
                }
              />
              <span className="ml-2">Preparado</span>
            </label>
          </div>
        </div>

        {/* Descripción */}
        <div className="col-span-2">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Descripción (Opcional)
          </label>
          <textarea
            id="description"
            rows={3}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        {/* Precio de Compra */}
        <div>
          <label htmlFor="purchasePrice" className="block text-sm font-medium text-gray-700">
            Precio de Compra
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <DollarSign className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="number"
              id="purchasePrice"
              required
              min="0"
              step="0.01"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={formData.purchasePrice}
              onChange={(e) =>
                setFormData({ ...formData, purchasePrice: parseFloat(e.target.value) })
              }
            />
          </div>
        </div>

        {/* Precio de Venta */}
        <div>
          <label htmlFor="salePrice" className="block text-sm font-medium text-gray-700">
            Precio de Venta
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <DollarSign className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="number"
              id="salePrice"
              required
              min="0"
              step="0.01"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={formData.salePrice}
              onChange={(e) =>
                setFormData({ ...formData, salePrice: parseFloat(e.target.value) })
              }
            />
          </div>
        </div>

        {/* Imagen del Producto */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">
            Imagen del Producto (Opcional)
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="mx-auto h-32 w-32 object-cover"
                />
              ) : (
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
              )}
              <div className="flex text-sm text-gray-600">
                <label
                  htmlFor="image"
                  className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                >
                  <span>Subir imagen</span>
                  <input
                    id="image"
                    name="image"
                    type="file"
                    className="sr-only"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </label>
              </div>
              <p className="text-xs text-gray-500">PNG, JPG hasta 5MB</p>
            </div>
          </div>
        </div>
      </div>

      {/* Botón para enviar el formulario */}
      <div className="flex justify-end">
        <button
          type="submit"
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#2A5C9A] hover:bg-[#1e4474] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Agregar Producto
        </button>
      </div>
    </form>
  );
}
