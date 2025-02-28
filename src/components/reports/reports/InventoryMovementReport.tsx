// reports/InventoryMovementReport.tsx
import React, { useState, useEffect } from 'react';
import { Search, Filter, Package, ArrowUp, ArrowDown, AlertTriangle } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface InventoryMovementReportProps {
  period: 'weekly' | 'monthly' | 'yearly';
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

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE_URL}/api/reports?type=inventory-movement&period=${period}`)
      .then((res) => res.json())
      .then((fetchedData: InventoryMovementReportData) => {
        setData(fetchedData);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching inventory movement data:', err);
        setLoading(false);
      });
  }, [period]);

  if (loading) return <p>Cargando datos...</p>;
  if (!data) return <p>Error al cargar datos.</p>;

  const filteredInventory = data.inventoryData.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (filterCategory === 'all' || item.category === filterCategory) &&
    (!filterAlert || item.alert)
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Movimientos de Inventario</h2>
        <span className="text-sm text-gray-500">
          {period === 'weekly' ? 'Semana 20, 2024' : period === 'monthly' ? 'Mayo 2024' : '2024'}
        </span>
      </div>

      {/* Tarjetas de resumen */}
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

      {/* Filtros y tabla detallada */}
      <div className="bg-white border rounded-lg shadow-sm p-4">
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
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Producto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoría
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock Inicial
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Entradas
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Salidas
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock Actual
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rotación
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInventory.map((item, index) => (
                <tr key={index} className={item.alert ? 'bg-red-50' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Package className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-900">
                        {item.name}
                        {item.alert && <AlertTriangle className="h-4 w-4 text-red-500 inline ml-2" />}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    {item.initialStock}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 text-right">
                    +{item.inflow}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 text-right">
                    -{item.outflow}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    {item.currentStock}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm text-gray-900">{item.rotationDays} días</div>
                    {item.rotationChange !== 0 && (
                      <div className={`text-xs ${item.rotationChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {item.rotationChange > 0 ? '↑' : '↓'} {Math.abs(item.rotationChange)}%
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Alertas de inventario */}
      <div className="bg-white border rounded-lg shadow-sm p-4 mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Alertas de Inventario</h3>
        <div className="space-y-4">
          {data.inventoryData.filter(item => item.alert).map((item, index) => (
            <div key={index} className="p-3 bg-red-50 rounded-lg flex items-start">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-900">{item.name}</p>
                <p className="text-sm text-red-700">{item.alert}</p>
                <div className="mt-1 text-xs text-gray-500">
                  Stock actual: {item.currentStock} unidades | Rotación: {item.rotationDays} días
                </div>
              </div>
            </div>
          ))}
          {data.inventoryData.filter(item => item.alert).length === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">No hay alertas de inventario activas</p>
          )}
        </div>
      </div>
    </div>
  );
}
