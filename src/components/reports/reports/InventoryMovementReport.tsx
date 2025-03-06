// reports/InventoryMovementReport.tsx
import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { Search, Filter, Package, ArrowUp, ArrowDown, AlertTriangle } from 'lucide-react';
import ClubSelector from './ClubSelector';
import { useAuthFetch } from '../../utils/authFetch';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface InventoryMovementReportProps {
  period: 'weekly' | 'monthly' | 'yearly';
}

export interface Movement {
  type: string;
  quantity: number;
  notes: string;
  created_at: string;
}

export interface InventoryData {
  id: string;
  name: string;
  category: string;
  initialStock: number;
  inflow: number;
  outflow: number;
  currentStock: number;
  rotationDays: number;
  rotationChange: number;
  alert?: string;
  movements: Movement[];
}

interface InventoryMovementReportData {
  inventoryData: InventoryData[];
  totalInflow: number;
  totalOutflow: number;
  totalStock: number;
  categories: string[];
}

export default function InventoryMovementReport({ period }: InventoryMovementReportProps) {
  const [data, setData] = useState<InventoryMovementReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterAlert, setFilterAlert] = useState(false);
  const [club, setClub] = useState<string | null>('global');
  const authFetch = useAuthFetch();
  // Calcular el rango de fechas según el período:
  // Para semanal se usa isoWeek (lunes a domingo)
  const now = moment();
  let startDate, endDate;
  if (period === 'weekly') {
    startDate = now.clone().startOf('isoWeek');
    endDate = now.clone().endOf('isoWeek');
  } else if (period === 'monthly') {
    startDate = now.clone().startOf('month');
    endDate = now.clone().endOf('month');
  } else {
    startDate = now.clone().startOf('year');
    endDate = now.clone().endOf('year');
  }
  const formattedRange = `${startDate.format('DD/MM/YYYY')} - ${endDate.format('DD/MM/YYYY')}`;

  useEffect(() => {
    setLoading(true);
    let url = `${API_BASE_URL}/api/reports?type=inventory-movement&period=${period}`;
    if (club) {
      url += `&club=${club}`;
    }
    authFetch(url)
      .then((res) => res.json())
      .then((fetchedData: InventoryMovementReportData) => {
        setData(fetchedData);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching inventory movement data:', err);
        setLoading(false);
      });
  }, [period, club]);

  if (loading) return <p>Cargando datos...</p>;
  if (!data) return <p>Error al cargar datos.</p>;

  // Filtrar los productos según búsqueda y categoría
  const filteredProducts = data.inventoryData.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (filterCategory === 'all' || product.category === filterCategory)
  );

  return (
    <div className="p-6">
      {/* Encabezado con rango de fechas y selector de club */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Movimientos de Inventario</h2>
        <div className="flex flex-col items-end">
          <span className="text-sm text-gray-500">{formattedRange}</span>
          <ClubSelector onClubChange={setClub} />
        </div>
      </div>

      {/* Tarjetas resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border rounded-lg shadow-sm p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Entradas</p>
              <p className="mt-1 text-2xl font-semibold text-green-600">+{data.totalInflow}</p>
            </div>
            <div className="p-2 rounded-full bg-green-100">
              <ArrowUp className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white border rounded-lg shadow-sm p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Salidas</p>
              <p className="mt-1 text-2xl font-semibold text-red-600">-{data.totalOutflow}</p>
            </div>
            <div className="p-2 rounded-full bg-red-100">
              <ArrowDown className="h-5 w-5 text-red-600" />
            </div>
          </div>
        </div>
        <div className="bg-white border rounded-lg shadow-sm p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Stock Actual</p>
              <p className="mt-1 text-2xl font-semibold text-blue-600">{data.totalStock}</p>
            </div>
            <div className="p-2 rounded-full bg-blue-100">
              <Package className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">Detalle de Inventario</h3>
        <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar producto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          </div>
          <div className="relative inline-block">
            <div className="flex items-center border border-gray-300 rounded-md shadow-sm bg-white">
              <div className="px-3 py-2 border-r border-gray-300">
                <Filter className="h-4 w-4 text-gray-400" />
              </div>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="block w-full pl-3 pr-10 py-2 text-sm border-0 focus:outline-none focus:ring-0 rounded-md"
              >
                <option value="all">Todas las categorías</option>
                {data.categories.map((cat, index) => (
                  <option key={index} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="relative inline-block">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={filterAlert}
                onChange={(e) => setFilterAlert(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Solo alertas</span>
            </label>
          </div>
        </div>
      </div>

      {/* Tabla de movimientos detallados agrupados por producto */}
      <div className="bg-white border rounded-lg shadow-sm p-4">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notas</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredProducts.map((product, idx) => {
              // Si se filtra por alertas, mostramos solo los movimientos que tengan nota (alerta)
              const movements = filterAlert
                ? product.movements.filter(m => m.notes && m.notes.trim() !== '')
                : product.movements;
              if (movements.length === 0) return null;
              // Calcular totales para este grupo basados en los movimientos mostrados
              let groupInflow = 0, groupOutflow = 0;
              movements.forEach(m => {
                if (m.type === 'restock' || m.type === 'purchase') {
                  groupInflow += m.quantity;
                } else {
                  groupOutflow += Math.abs(m.quantity);
                }
              });
              return (
                <React.Fragment key={idx}>
                  {/* Encabezado del grupo para el producto */}
                  <tr className="bg-gray-100">
                    <td colSpan={4} className="px-4 py-2">
                      <strong>{product.name}</strong> ({product.category}) | Stock Inicial: {product.initialStock} | Entradas: {groupInflow} | Salidas: {groupOutflow} | Stock Actual: {product.initialStock + (groupInflow - groupOutflow)}
                    </td>
                  </tr>
                  {/* Filas de movimientos para el producto */}
                  {movements.map((mov, i) => (
                    <tr key={i}>
                      <td className="px-4 py-2">{moment(mov.created_at).format('DD/MM/YYYY')}</td>
                      <td className="px-4 py-2 capitalize">{mov.type.replace('_', ' ')}</td>
                      <td className="px-4 py-2 text-right">{mov.quantity}</td>
                      <td className="px-4 py-2">{mov.notes}</td>
                    </tr>
                  ))}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Sección de alertas de inventario */}
      <div className="bg-white border rounded-lg shadow-sm p-4 mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Alertas de Inventario</h3>
        <div className="space-y-4">
          {data.inventoryData
            .filter(product => product.movements.some(m => m.notes && m.notes.trim() !== ''))
            .map((product, index) => (
              <div key={index} className="p-3 bg-red-50 rounded-lg flex items-start">
                <AlertTriangle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{product.name}</p>
                  <p className="text-sm text-red-700">
                    {product.movements
                      .filter(m => m.notes && m.notes.trim() !== '')
                      .map(m => m.notes)
                      .join(' | ')
                    }
                  </p>
                  <div className="mt-1 text-xs text-gray-500">
                    Stock actual: {product.initialStock + (product.inflow - product.outflow)} unidades
                  </div>
                </div>
              </div>
            ))
          }
          {data.inventoryData.filter(product => product.movements.some(m => m.notes && m.notes.trim() !== '')).length === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">No hay alertas de inventario activas</p>
          )}
        </div>
      </div>
    </div>
  );
}


