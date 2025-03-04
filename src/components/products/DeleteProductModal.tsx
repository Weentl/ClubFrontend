// src/components/products/DeleteProductModal.tsx
import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import toast from 'react-hot-toast';
import { useAuthFetch } from '../utils/authFetch';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface DeleteProductModalProps {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  product: any;
  onDeleteSuccess: (deletedProductId: string) => void;
}

export default function DeleteProductModal({
  isOpen,
  setIsOpen,
  product,
  onDeleteSuccess,
}: DeleteProductModalProps) {
  const authFetch = useAuthFetch();

  const handleDelete = async () => {
    try {
      const res = await authFetch(`${API_BASE_URL}/api/products/${product._id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        throw new Error('Error al eliminar el producto');
      }
      toast.success('Producto eliminado exitosamente');
      onDeleteSuccess(product.id);
      setIsOpen(false);
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Error al eliminar el producto');
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
                <Dialog.Title as="h3" className="text-lg font-medium text-gray-900">
                  Confirmar eliminación
                </Dialog.Title>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    ¿Estás seguro de eliminar "{product.name}" de tu catálogo?
                  </p>
                </div>
                <div className="mt-4 flex justify-end space-x-2">
                  <button
                    type="button"
                    className="px-4 py-2 bg-gray-200 text-gray-900 rounded-md hover:bg-gray-300"
                    onClick={() => setIsOpen(false)}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    onClick={handleDelete}
                  >
                    Eliminar
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
