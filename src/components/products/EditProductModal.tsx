// src/components/products/EditProductModal.tsx
import { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import toast from 'react-hot-toast';
import { useAuthFetch } from '../utils/authFetch';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface EditProductModalProps {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  product: any;
  onEditSuccess: (updatedProduct: any) => void;
}

export default function EditProductModal({
  isOpen,
  setIsOpen,
  product,
  onEditSuccess,
}: EditProductModalProps) {
  const [formData, setFormData] = useState({
    name: product.name,
    category: product.category,
    type: product.type, // 'sealed' o 'prepared'
    description: product.description,
    purchasePrice: product.purchase_price,
    salePrice: product.sale_price,
    image: null as File | null,
  });
  const [imagePreview, setImagePreview] = useState(product.image_url || '');
  const authFetch = useAuthFetch();
  // Recupera el club principal desde el localStorage
  const storedClub = localStorage.getItem('mainClub');
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
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('type', formData.type);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('purchase_price', formData.purchasePrice.toString());
      formDataToSend.append('sale_price', formData.salePrice.toString());

      // Agrega el id del club (obtenido desde localStorage)
      if (mainClub && mainClub.id) {
        formDataToSend.append('club', mainClub.id);
      } else {
        toast.error('No se encontró el club activo');
        return;
      }

      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      const res = await authFetch(`${API_BASE_URL}/api/products/${product._id}`, {
        method: 'PUT',
        body: formDataToSend,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Error al actualizar el producto');
      }

      toast.success('Producto actualizado exitosamente');
      const updatedProduct = await res.json();
      onEditSuccess(updatedProduct);
      setIsOpen(false);
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Error al actualizar el producto');
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={() => setIsOpen(false)}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                  Editar Producto
                </Dialog.Title>
                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nombre del Producto</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Categoría</label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tipo</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                    >
                      <option value="sealed">Cerrado</option>
                      <option value="prepared">Preparado</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Descripción</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Precio de Compra</label>
                    <input
                      type="number"
                      value={formData.purchasePrice}
                      onChange={(e) =>
                        setFormData({ ...formData, purchasePrice: parseFloat(e.target.value) })
                      }
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Precio de Venta</label>
                    <input
                      type="number"
                      value={formData.salePrice}
                      onChange={(e) =>
                        setFormData({ ...formData, salePrice: parseFloat(e.target.value) })
                      }
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Imagen (Opcional)</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="mt-1 block w-full"
                    />
                    {imagePreview && (
                      <img src={imagePreview} alt="preview" className="mt-2 h-20 w-20 object-cover" />
                    )}
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setIsOpen(false)}
                      className="px-4 py-2 bg-gray-200 rounded-md"
                    >
                      Cancelar
                    </button>
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md">
                      Guardar cambios
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
