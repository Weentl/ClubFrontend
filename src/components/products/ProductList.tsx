// src/components/products/ProductList.tsx
import { useEffect, useState } from 'react';
import { Package, Edit, Trash2 } from 'lucide-react';
import { useAuthFetch } from '../utils/authFetch';
import DeleteProductModal from './DeleteProductModal';
import EditProductModal from './EditProductModal';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function ProductList() {
  const [products, setProducts] = useState<any[]>([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const authFetch = useAuthFetch();

  // Recupera el club principal desde el localStorage
  const storedClub = localStorage.getItem('mainClub');
  const mainClub = storedClub ? JSON.parse(storedClub) : null;

  useEffect(() => {
    if (mainClub && mainClub.id) {
      loadProducts();
    }
  }, [mainClub]);

  const loadProducts = async () => {
    try {
      const res = await authFetch(`${API_BASE_URL}/api/products?club=${mainClub.id}`);
      if (!res.ok) {
        throw new Error('Error al cargar los productos');
      }
      const data = await res.json();
      setProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  // Abre el modal de eliminación
  const handleDelete = (product: any) => {
    setSelectedProduct(product);
    setDeleteModalOpen(true);
  };

  // Abre el modal de edición
  const handleEdit = (product: any) => {
    setSelectedProduct(product);
    setEditModalOpen(true);
  };

  // Callbacks para actualizar la lista tras eliminar o editar
  const onDeleteSuccess = (deletedProductId: string) => {
    setProducts(products.filter((p) => p.id !== deletedProductId));
  };

  const onEditSuccess = (updatedProduct: any) => {
    setProducts(products.map((p) => (p.id === updatedProduct.id ? updatedProduct : p)));
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
                      <p className="text-sm text-gray-500">Costo: ${product.purchase_price}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        className="p-2 text-gray-400 hover:text-blue-600"
                        onClick={() => handleEdit(product)}
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        type="button"
                        className="p-2 text-gray-400 hover:text-red-600"
                        onClick={() => handleDelete(product)}
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

      {deleteModalOpen && selectedProduct && (
        <DeleteProductModal
          isOpen={deleteModalOpen}
          setIsOpen={setDeleteModalOpen}
          product={selectedProduct}
          onDeleteSuccess={onDeleteSuccess}
        />
      )}

      {editModalOpen && selectedProduct && (
        <EditProductModal
          isOpen={editModalOpen}
          setIsOpen={setEditModalOpen}
          product={selectedProduct}
          onEditSuccess={onEditSuccess}
        />
      )}
    </div>
  );
}

