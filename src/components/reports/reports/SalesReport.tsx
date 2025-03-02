// reports/SalesReport.tsx
import React from 'react';
import moment from 'moment-timezone';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Search, Filter, Package, Coffee } from 'lucide-react';
import ClubSelector from './ClubSelector';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

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

export interface SalesReportData {
  salesData: SaleData[];
  totalRevenue: number;
  totalQuantity: number;
  topProducts: SaleData[];
  dailySales: { day: string; sales: number }[];
  categoryData: CategoryData[];
}

interface SalesReportProps {
  period: 'weekly' | 'monthly' | 'yearly';
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function SalesReport({ period }: SalesReportProps) {
  const [data, setData] = React.useState<SalesReportData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filterClub, setFilterClub] = React.useState('all');
  const [selectedClub, setSelectedClub] = React.useState<string | null>(null);
  const [currentPage, setCurrentPage] = React.useState(1);
  const pageSize = 10;

  // Calcular el período dinámicamente usando moment-timezone
  let periodLabel = '';
  const tz = "America/Mexico_City";
  const now = moment.tz(tz);
  if (period === 'monthly') {
    const start = now.clone().startOf('month');
    const end = now.clone().endOf('month');
    periodLabel = `${start.format('DD/MM/YYYY')} - ${end.format('DD/MM/YYYY')}`;
  } else if (period === 'weekly') {
    const start = now.clone().startOf('isoWeek');
    const end = now.clone().endOf('isoWeek');
    periodLabel = `${start.format('DD/MM/YYYY')} - ${end.format('DD/MM/YYYY')}`;
  } else if (period === 'yearly') {
    const start = now.clone().startOf('year');
    const end = now.clone().endOf('year');
    periodLabel = `${start.format('DD/MM/YYYY')} - ${end.format('DD/MM/YYYY')}`;
  }

  React.useEffect(() => {
    setLoading(true);
    let url = `${API_BASE_URL}/api/reports?type=sales&period=${period}`;
    if (selectedClub) {
      url += `&club=${selectedClub}`;
    }
    fetch(url)
      .then(res => res.json())
      .then((fetchedData: SalesReportData) => {
        setData(fetchedData);
        setLoading(false);
        setCurrentPage(1);
      })
      .catch(err => {
        console.error('Error fetching sales data:', err);
        setLoading(false);
      });
  }, [period, selectedClub]);

  if (loading) return <p>Cargando datos...</p>;
  if (!data) return <p>Error al cargar datos.</p>;

  const filteredSales = data.salesData.filter(item =>
    item.product.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (filterClub === 'all' || item.club === filterClub)
  );

  const totalPages = Math.ceil(filteredSales.length / pageSize);
  const paginatedSales = filteredSales.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Para el gráfico de ventas diarias
  const maxDailySales = data.dailySales.length > 0 ? Math.max(...data.dailySales.map(d => d.sales)) : 0;
  const formattedDailySales = data.dailySales.map(day => ({
    ...day,
    formattedSales: `$${day.sales.toLocaleString()}`
  }));

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Reporte de Ventas</h2>
        <ClubSelector onClubChange={setSelectedClub} />
        <span className="text-sm text-gray-500">{periodLabel}</span>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border rounded-lg shadow-sm p-4">
          <p className="text-sm font-medium text-gray-500">Ventas Totales</p>
          <p className="mt-1 text-2xl font-semibold text-green-600">
            ${data.totalRevenue.toLocaleString()}
          </p>
        </div>
        <div className="bg-white border rounded-lg shadow-sm p-4">
          <p className="text-sm font-medium text-gray-500">Unidades Vendidas</p>
          <p className="mt-1 text-2xl font-semibold text-blue-600">
            {data.totalQuantity.toLocaleString()}
          </p>
        </div>
        <div className="bg-white border rounded-lg shadow-sm p-4">
          <p className="text-sm font-medium text-gray-500">Ticket Promedio</p>
          <p className="mt-1 text-2xl font-semibold text-purple-600">
            ${(data.totalRevenue / (data.salesData.length || 1)).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Daily Sales Chart */}
      <div className="bg-white border rounded-lg shadow-sm p-4 mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Ventas Diarias</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={formattedDailySales} margin={{ top: 10, right: 30, left: 20, bottom: 30 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tickFormatter={(value) => `$${value}`} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Ventas']} labelFormatter={(value) => `Día: ${value}`} />
              <Bar dataKey="sales" fill="#3b82f6" name="Ventas" label={{ position: 'top', formatter: (value: any) => `$${value}`, fontSize: 11, fill: '#4b5563' }} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Category Distribution (Pie Chart) */}
        <div className="bg-white border rounded-lg shadow-sm p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Distribución por Categoría</h3>
          <div className="flex items-center justify-center h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {data.categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Valor']} />
                <Legend formatter={(value, entry, index) => (
                  <span style={{ color: '#4b5563', fontSize: '12px' }}>
                    {value} ({data.categoryData[index].percentage}%)
                  </span>
                )} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top 5 Products */}
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
                    {product.quantity.toLocaleString()} unidades
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    ${product.revenue.toLocaleString()}
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

      {/* Sales Detail Table with Pagination */}
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
              {paginatedSales.map((item, index) => (
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
                    {item.quantity.toLocaleString()} unidades
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${item.revenue.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.club}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex justify-between items-center mt-4">
          <button 
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          >
            Anterior
          </button>
          <span className="text-sm text-gray-600">
            Página {currentPage} de {totalPages}
          </span>
          <button 
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
}

