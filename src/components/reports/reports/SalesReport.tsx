// reports/SalesReport.tsx
import React, { useState, useEffect } from 'react';
import { Search, Filter, Package, Coffee } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface SalesReportProps {
  period: 'weekly' | 'monthly' | 'yearly';
}

export interface SaleData {
  product: string;
  quantity: number;
  revenue: number;
  club: string;
  type: 'sealed' | 'prepared';
}

export interface CategoryData {
  name: string;
  percentage: number;
  value: number;
}

interface SalesReportData {
  salesData: SaleData[];
  totalRevenue: number;
  totalQuantity: number;
  topProducts: SaleData[];
  dailySales: { day: string; sales: number }[];
  categoryData: CategoryData[];
}

export default function SalesReport({ period }: SalesReportProps) {
  const [data, setData] = useState<SalesReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClub, setFilterClub] = useState('all');

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE_URL}/api/reports?type=sales&period=${period}`)
      .then(res => res.json())
      .then((fetchedData: SalesReportData) => {
        setData(fetchedData);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching sales data:', err);
        setLoading(false);
      });
  }, [period]);

  if (loading) return <p>Cargando datos...</p>;
  if (!data) return <p>Error al cargar datos.</p>;

  const filteredSales = data.salesData.filter(item =>
    item.product.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (filterClub === 'all' || item.club === filterClub)
  );

  const maxDailySales = Math.max(...data.dailySales.map(d => d.sales));

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Reporte de Ventas</h2>
        <span className="text-sm text-gray-500">
          {period === 'weekly' ? 'Semana 20, 2024' : period === 'monthly' ? 'Mayo 2024' : '2024'}
        </span>
      </div>

      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border rounded-lg shadow-sm p-4">
          <p className="text-sm font-medium text-gray-500">Ventas Totales</p>
          <p className="mt-1 text-2xl font-semibold text-green-600">${data.totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-white border rounded-lg shadow-sm p-4">
          <p className="text-sm font-medium text-gray-500">Unidades Vendidas</p>
          <p className="mt-1 text-2xl font-semibold text-blue-600">{data.totalQuantity}</p>
        </div>
        <div className="bg-white border rounded-lg shadow-sm p-4">
          <p className="text-sm font-medium text-gray-500">Ticket Promedio</p>
          <p className="mt-1 text-2xl font-semibold text-purple-600">
            ${(data.totalRevenue / (data.salesData.length || 1)).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Gráfico de ventas diarias */}
      <div className="bg-white border rounded-lg shadow-sm p-4 mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Ventas Diarias</h3>
        <div className="h-64">
          <div className="flex h-52 items-end space-x-2">
            {data.dailySales.map((ds, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-full bg-blue-500 rounded-t"
                  style={{ 
                    height: `${(ds.sales / maxDailySales) * 100}%`,
                    minHeight: ds.sales > 0 ? '4px' : '0'
                  }}
                ></div>
                <div className="text-xs mt-2 text-gray-600">{ds.day}</div>
                <div className="text-xs font-medium">${ds.sales}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Distribución por categoría */}
        <div className="bg-white border rounded-lg shadow-sm p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Distribución por Categoría</h3>
          <div className="flex items-center justify-center h-52">
            <div className="w-40 h-40 rounded-full border-8 border-gray-100 relative">
              {data.categoryData.map((category, index) => {
                const previousAngles = data.categoryData
                  .slice(0, index)
                  .reduce((sum, cat) => sum + (cat.percentage * 3.6), 0);
                return (
                  <div 
                    key={index}
                    className={`absolute inset-0 ${index === 0 ? 'bg-blue-500' : 'bg-green-500'}`}
                    style={{
                      clipPath: `conic-gradient(from ${previousAngles}deg, transparent 0deg, currentColor ${category.percentage * 3.6}deg, transparent ${category.percentage * 3.6}deg)`
                    }}
                  ></div>
                );
              })}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-24 h-24 bg-white rounded-full"></div>
              </div>
            </div>
          </div>
          <div className="flex justify-center mt-4 space-x-6">
            {data.categoryData.map((category, index) => (
              <div key={index} className="flex items-center">
                <div className={`w-3 h-3 rounded mr-2 ${index === 0 ? 'bg-blue-500' : 'bg-green-500'}`}></div>
                <span className="text-xs text-gray-600">
                  {category.name} ({category.percentage}%)
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top 5 productos */}
        <div className="bg-white border rounded-lg shadow-sm p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Top 5 Productos</h3>
          <div className="space-y-4">
            {data.topProducts.map((product, index) => (
              <div key={index} className="flex items-center">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                  {product.type === 'sealed' ? (
                    <Package className="h-5 w-5 text-gray-500" />
                  ) : (
                    <Coffee className="h-5 w-5 text-gray-500" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {product.product}
                  </p>
                  <p className="text-sm text-gray-500">
                    {product.quantity} unidades
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    ${product.revenue}
                  </p>
                  <p className="text-xs text-gray-500">
                    {((product.revenue / data.totalRevenue) * 100).toFixed(1)}% del total
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabla de ventas */}
      <div className="bg-white border rounded-lg shadow-sm p-4">
        <div className="flex flex-wrap justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Detalle de Ventas</h3>
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
                  value={filterClub}
                  onChange={(e) => setFilterClub(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 text-sm border-0 focus:outline-none focus:ring-0 rounded-md"
                >
                  <option value="all">Todos los Clubs</option>
                  <option value="ProteHouse Central">ProteHouse Central</option>
                  <option value="ProteHouse Polanco">ProteHouse Polanco</option>
                </select>
              </div>
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
                  Cantidad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ingresos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Club
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSales.map((item, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {item.type === 'sealed' ? (
                        <Package className="h-5 w-5 text-gray-400 mr-2" />
                      ) : (
                        <Coffee className="h-5 w-5 text-gray-400 mr-2" />
                      )}
                      <span className="text-sm font-medium text-gray-900">
                        {item.product}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.quantity} unidades
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${item.revenue}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.club}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
