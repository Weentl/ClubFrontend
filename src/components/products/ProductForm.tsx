import React, { useState } from 'react';
import { Package, Upload, DollarSign, HelpCircle, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthFetch } from '../utils/authFetch';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface ProductFormData {
  name: string;
  flavor: string;
  category: string;
  customCategory?: string;
  type: 'prepared' | 'sealed';
  description: string;
  purchasePrice: number;
  salePrice: number;
  image?: File;
}

const CATEGORIES = ['Suplementos', 'Alimentos', 'Bebidas', 'Snacks', 'Otro'];

interface TooltipProps {
  text: string;
}

const Tooltip: React.FC<TooltipProps> = ({ text }) => {
  return (
    <div className="group relative ml-1 inline-block">
      <button type="button" className="text-gray-400 hover:text-gray-600 focus:outline-none">
        <HelpCircle className="h-4 w-4" />
      </button>
      <div className="absolute left-0 top-full mt-2 w-64 p-2 bg-black text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-10">
        {text}
      </div>
    </div>
  );
};

export default function ProductForm() {
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    flavor: '',
    category: '',
    type: 'sealed',
    description: '',
    purchasePrice: 0,
    salePrice: 0,
  });
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const authFetch = useAuthFetch();
  
  // Recupera el club principal desde el localStorage
  const storedClub = localStorage.getItem("mainClub");
  const mainClub = storedClub ? JSON.parse(storedClub) : null;

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
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      // Preparamos los datos en un FormData para soportar la subida de archivos
      const formDataToSend = new FormData();
      
      // Si hay sabor, lo concatenamos con el nombre entre paréntesis
      const fullProductName = formData.flavor 
        ? `${formData.name} (${formData.flavor})`
        : formData.name;
        
      formDataToSend.append('name', fullProductName);
      
      const categoryToSend =
        formData.category === 'Otro' ? formData.customCategory || '' : formData.category;
      formDataToSend.append('category', categoryToSend);
      formDataToSend.append('type', formData.type);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('purchase_price', formData.purchasePrice.toString());
      formDataToSend.append('sale_price', formData.salePrice.toString());
      
      // Agrega el id del club (del mainClub obtenido desde localStorage)
      if (mainClub && mainClub.id) {
        formDataToSend.append('club', mainClub.id);
      } else {
        toast.error('No se encontró el club activo');
        return;
      }

      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      const res = await authFetch(`${API_BASE_URL}/api/products`, {
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
        flavor: '',
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
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Agregar Nuevo Producto</h2>
        <div className="group relative">
          <button className="text-gray-400 hover:text-gray-600">
            <Info className="h-5 w-5" />
          </button>
          <div className="absolute right-0 w-72 p-3 bg-white shadow-lg rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-10 text-sm">
            <p className="text-gray-600 mb-2">
              Complete este formulario para agregar un nuevo producto a su inventario.
            </p>
            <p className="text-gray-600">
              Los campos marcados con <span className="text-red-500">*</span> son obligatorios.
            </p>
          </div>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Nombre del Producto */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              Nombre del Producto <span className="text-red-500">*</span>
              <Tooltip text="Ingrese el nombre principal del producto, por ejemplo: Proteína, Barra, Bebida, etc." />
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Package className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="name"
                required
                placeholder="Ejemplo: Proteína Whey"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
          </div>

          {/* Sabor del Producto (Nuevo) */}
          <div>
            <label htmlFor="flavor" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              Sabor (Opcional)
              <Tooltip text="Especifique el sabor del producto si aplica, por ejemplo: Chocolate, Vainilla, Fresa, etc." />
            </label>
            <div className="relative rounded-md shadow-sm">
              <input
                type="text"
                id="flavor"
                placeholder="Ejemplo: Chocolate"
                className="block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={formData.flavor}
                onChange={(e) => setFormData({ ...formData, flavor: e.target.value })}
              />
            </div>
          </div>

          {/* Categoría */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              Categoría <span className="text-red-500">*</span>
              <Tooltip text="Seleccione la categoría que mejor describa su producto." />
            </label>
            <select
              id="category"
              required
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
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
              <label htmlFor="customCategory" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                Especifica la categoría <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="customCategory"
                required
                placeholder="Ingrese categoría personalizada"
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={formData.customCategory}
                onChange={(e) =>
                  setFormData({ ...formData, customCategory: e.target.value })
                }
              />
            </div>
          )}

          {/* Tipo de Producto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              Tipo de Producto <span className="text-red-500">*</span>
              <Tooltip text="'Cerrado' significa un producto empacado o en su envase original. 'Preparado' es para productos que se sirven o preparan en el momento." />
            </label>
            <div className="mt-2 space-x-4 flex">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio text-blue-600 h-4 w-4"
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
                  className="form-radio text-blue-600 h-4 w-4"
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

          {/* Precio de Compra */}
          <div>
            <label htmlFor="purchasePrice" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              Precio de Compra <span className="text-red-500">*</span>
              <Tooltip text="Cuánto le costó adquirir este producto. Usado para calcular ganancias." />
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <DollarSign className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="number"
                id="purchasePrice"
                required
                min="0"
                step="0.01"
                placeholder="0.00"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={formData.purchasePrice || ''}
                onChange={(e) =>
                  setFormData({ ...formData, purchasePrice: parseFloat(e.target.value) || 0 })
                }
              />
            </div>
          </div>

          {/* Precio de Venta */}
          <div>
            <label htmlFor="salePrice" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              Precio de Venta <span className="text-red-500">*</span>
              <Tooltip text="Precio al que venderá este producto a sus clientes." />
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <DollarSign className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="number"
                id="salePrice"
                required
                min="0"
                step="0.01"
                placeholder="0.00"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={formData.salePrice || ''}
                onChange={(e) =>
                  setFormData({ ...formData, salePrice: parseFloat(e.target.value) || 0 })
                }
              />
            </div>
          </div>

          {/* Descripción */}
          <div className="md:col-span-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              Descripción (Opcional)
              <Tooltip text="Proporcione detalles adicionales sobre el producto, como ingredientes, beneficios, etc." />
            </label>
            <textarea
              id="description"
              rows={3}
              placeholder="Información adicional sobre el producto..."
              className="block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          {/* Imagen del Producto */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              Imagen del Producto (Opcional)
              <Tooltip text="Una foto del producto ayuda a identificarlo fácilmente. Formatos aceptados: JPG, PNG." />
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                {imagePreview ? (
                  <div className="flex flex-col items-center">
                    <img
                      src={imagePreview}
                      alt="Vista previa"
                      className="mx-auto h-32 w-32 object-cover rounded-md"
                    />
                    <button 
                      type="button"
                      className="mt-2 text-xs text-red-500 hover:text-red-700"
                      onClick={() => {
                        setImagePreview('');
                        setFormData({...formData, image: undefined});
                      }}
                    >
                      Eliminar imagen
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600 mt-2">
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
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG hasta 5MB</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Botón para enviar el formulario */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#2A5C9A] hover:bg-[#1e4474] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Procesando...
              </>
            ) : 'Agregar Producto'}
          </button>
        </div>
      </form>
    </div>
  );
}

