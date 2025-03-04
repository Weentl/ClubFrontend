// InventoryList.tsx
import { useEffect, useState } from 'react';
import { AlertTriangle, Package, History, Edit3 } from 'lucide-react';
import InventoryAdjustmentModal from './InventoryAdjustmentModal';
import InventoryHistoryModal from './InventoryHistoryModal';
import { useAuthFetch } from '../utils/authFetch';


interface Product {
  _id: string;
  name: string;
  category: string;
  purchase_price: number;
  sale_price: number;
  type: string;
}

interface InventoryItem {
  _id: string;
  product_id: string;
  quantity: number;
}

export interface CombinedInventoryItem extends Product {
  stock: number;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function InventoryList() {
  const [inventory, setInventory] = useState<CombinedInventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'low_stock' | 'out_of_stock'>('all');
  const [category, setCategory] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<CombinedInventoryItem | null>(null);
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const authFetch = useAuthFetch();
  // Recupera el club principal desde el localStorage
  const storedClub = localStorage.getItem("mainClub");
  const mainClub = storedClub ? JSON.parse(storedClub) : null;

  const loadInventory = async () => {
    if (!mainClub || !mainClub.id) {
      console.error('No se encontró el club activo.');
      setLoading(false);
      return;
    }
    try {
      // Obtener los productos filtrados por club
      const productsResponse = await authFetch(`${API_BASE_URL}/api/products?club=${mainClub.id}`);
      const products: Product[] = await productsResponse.json();

      // Obtener el inventario filtrado por club
      const inventoryResponse = await authFetch(`${API_BASE_URL}/api/inventory?club=${mainClub.id}`);
      const inventoryData: InventoryItem[] = await inventoryResponse.json();

      const combined = products
        .filter(p => p.type === 'sealed')
        .map(product => ({
          ...product,
          stock: inventoryData.find(inv => inv.product_id === product._id)?.quantity || 0,
        }));

      setInventory(combined);
    } catch (error) {
      console.error('Error loading inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredInventory = inventory.filter(item => {
    if (filter === 'low_stock') return item.stock < 5;
    if (filter === 'out_of_stock') return item.stock === 0;
    if (category !== 'all') return item.category === category;
    return true;
  });

  const categories = Array.from(new Set(inventory.map(item => item.category)));

  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-4">
            <select
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
            >
              <option value="all">Todos los productos</option>
              <option value="low_stock">Stock bajo (&lt;5)</option>
              <option value="out_of_stock">Sin stock</option>
            </select>
            <select
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="all">Todas las categorías</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
  
      <div className="overflow-x-auto">
        {loading ? (
          <div className="p-4">Cargando...</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoría
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock Actual
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInventory.map((item) => (
                <tr
                  key={item._id}
                  className={`${item.stock < 5 ? 'border-l-4 border-red-500' : ''}`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Package className="h-5 w-5 text-gray-400 mr-2" />
                      <div className="text-sm font-medium text-gray-900">
                        {item.name}
                        {item.stock < 5 && (
                          <AlertTriangle className="h-4 w-4 text-red-500 inline ml-2" />
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{item.category}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{item.stock}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => {
                        setSelectedItem(item);
                        setShowAdjustmentModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      <Edit3 className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedItem(item);
                        setShowHistoryModal(true);
                      }}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      <History className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
  
      {selectedItem && showAdjustmentModal && (
        <InventoryAdjustmentModal
          item={selectedItem}
          onClose={() => {
            setShowAdjustmentModal(false);
            setSelectedItem(null);
            loadInventory();
          }}
        />
      )}
  
      {selectedItem && showHistoryModal && (
        <InventoryHistoryModal
          item={selectedItem}
          onClose={() => {
            setShowHistoryModal(false);
            setSelectedItem(null);
          }}
        />
      )}
    </div>
  );
}


