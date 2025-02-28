// reports/ExpensesReport.tsx
import React, { useState, useEffect } from 'react';
import { Search, Filter, AlertTriangle } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface ExpensesReportProps {
  period: 'weekly' | 'monthly' | 'yearly';
}

export interface ExpenseData {
  category: string;
  subcategory: string;
  amount: number;
  date: string;
  description: string;
}

interface CategoryPercentage {
  category: string;
  amount: number;
  percentage: number;
}

interface ExpensesReportData {
  expensesData: ExpenseData[];
  categoryTotals: Record<string, number>;
  totalExpenses: number;
  categoryPercentages: CategoryPercentage[];
  criticalExpenses: (ExpenseData & { percentage: number })[];
  alerts: { id: number; message: string; category: string }[];
}

export default function ExpensesReport({ period }: ExpensesReportProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [data, setData] = useState<ExpensesReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE_URL}/api/reports?type=expenses&period=${period}`)
      .then((res) => res.json())
      .then((fetchedData: ExpensesReportData) => {
        setData(fetchedData);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching expenses data:', err);
        setLoading(false);
      });
  }, [period]);

  if (loading) return <p>Cargando datos...</p>;
  if (!data) return <p>Error al cargar datos.</p>;

  const { expensesData, totalExpenses, categoryPercentages, criticalExpenses, alerts } = data;

  // Filtrar datos según búsqueda y categoría
  const filteredExpenses = expensesData.filter(item =>
    item.description.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (filterCategory === 'all' || item.category === filterCategory)
  );

  // Colores para las categorías (puedes ajustarlos según tu diseño)
  const categoryColors: Record<string, string> = {
    'Inventario': 'bg-blue-500',
    'Nómina': 'bg-green-500',
    'Servicios': 'bg-yellow-500',
    'Otros': 'bg-purple-500'
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Reporte de Gastos</h2>
        <span className="text-sm text-gray-500">
          {period === 'weekly' ? 'Semana 20, 2024' : period === 'monthly' ? 'Mayo 2024' : '2024'}
        </span>
      </div>

      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-white border rounded-lg shadow-sm p-4">
          <p className="text-sm font-medium text-gray-500">Gastos Totales</p>
          <p className="mt-1 text-2xl font-semibold text-red-600">${totalExpenses.toLocaleString()}</p>
        </div>

        <div className="bg-white border rounded-lg shadow-sm p-4">
          <p className="text-sm font-medium text-gray-500">Mayor Categoría de Gasto</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">
            {categoryPercentages.sort((a, b) => b.amount - a.amount)[0]?.category || 'N/A'}
          </p>
          <p className="text-sm text-gray-500">
            ${categoryPercentages.sort((a, b) => b.amount - a.amount)[0]?.amount.toLocaleString() || 0} 
            ({categoryPercentages.sort((a, b) => b.amount - a.amount)[0]?.percentage || 0}% del total)
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Gráfico de árbol (simulado) */}
        <div className="bg-white border rounded-lg shadow-sm p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Distribución de Gastos</h3>
          <div className="space-y-4">
            {categoryPercentages.sort((a, b) => b.amount - a.amount).map((cat, index) => (
              <div key={index}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700">{cat.category}</span>
                  <span className="text-sm text-gray-500">
                    ${cat.amount} ({cat.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className={`h-2.5 rounded-full ${categoryColors[cat.category] || 'bg-gray-500'}`} 
                    style={{ width: `${cat.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gastos críticos y alertas */}
        <div className="bg-white border rounded-lg shadow-sm p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Gastos Críticos</h3>
          <div className="space-y-4">
            {criticalExpenses.map((expense, index) => (
              <div key={index} className="p-3 bg-yellow-50 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{expense.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {expense.category} &gt; {expense.subcategory}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">${expense.amount}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {expense.percentage}% del gasto total
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {alerts.length > 0 && (
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Alertas</h4>
                {alerts.map((alert, index) => (
                  <div key={index} className="p-3 bg-red-50 rounded-lg flex items-start">
                    <AlertTriangle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
                    <p className="text-sm text-red-700">{alert.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabla de gastos */}
      <div className="bg-white border rounded-lg shadow-sm p-4">
        <div className="flex flex-wrap justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Detalle de Gastos</h3>
          <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar descripción..."
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
                  <option value="all">Todas las Categorías</option>
                  <option value="Inventario">Inventario</option>
                  <option value="Nómina">Nómina</option>
                  <option value="Servicios">Servicios</option>
                  <option value="Otros">Otros</option>
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
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Descripción
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoría
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subcategoría
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Monto
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredExpenses.map((expense, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(expense.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {expense.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {expense.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {expense.subcategory}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    ${expense.amount}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td colSpan={4} className="px-6 py-3 text-right text-sm font-medium text-gray-900">
                  Total
                </td>
                <td className="px-6 py-3 text-right text-sm font-medium text-gray-900">
                  ${filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0).toLocaleString()}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
