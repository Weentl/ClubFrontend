// reports/TransactionHistoryReport.tsx
import React, { useState, useEffect } from 'react';
import { Search, Filter, Calendar, ArrowUp, ArrowDown } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface TransactionHistoryReportProps {
  period: 'weekly' | 'monthly' | 'yearly';
}

export interface Transaction {
  id: string;
  date: string;
  type: 'sale' | 'expense' | 'adjustment';
  description: string;
  amount: number;
  category: string;
  reference?: string;
}

interface TransactionHistoryReportData {
  transactionsData: Transaction[];
}

export default function TransactionHistoryReport({ period }: TransactionHistoryReportProps) {
  const [data, setData] = useState<TransactionHistoryReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'sale' | 'expense' | 'adjustment'>('all');
  const [filterAmount, setFilterAmount] = useState<'all' | 'small' | 'medium' | 'large'>('all');
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: '2024-05-01',
    end: '2024-05-31'
  });

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE_URL}/api/reports?type=transaction-history&period=${period}`)
      .then((res) => res.json())
      .then((fetchedData: TransactionHistoryReportData) => {
        setData(fetchedData);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching transaction history data:', err);
        setLoading(false);
      });
  }, [period]);

  if (loading) return <p>Cargando datos...</p>;
  if (!data) return <p>Error al cargar datos.</p>;

  const transactionsData = data.transactionsData;

  // Filtrar transacciones
  const filteredTransactions = transactionsData.filter(transaction => {
    const lowerSearch = searchTerm.toLowerCase();
    const matchesSearch =
      transaction.description.toLowerCase().includes(lowerSearch) ||
      transaction.category.toLowerCase().includes(lowerSearch) ||
      (transaction.reference && transaction.reference.toLowerCase().includes(lowerSearch));

    const matchesType = filterType === 'all' || transaction.type === filterType;

    const absAmount = Math.abs(transaction.amount);
    const matchesAmount =
      filterAmount === 'all' ||
      (filterAmount === 'small' && absAmount < 500) ||
      (filterAmount === 'medium' && absAmount >= 500 && absAmount < 1000) ||
      (filterAmount === 'large' && absAmount >= 1000);

    const transactionDate = new Date(transaction.date);
    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);
    endDate.setHours(23, 59, 59);
    const matchesDate = transactionDate >= startDate && transactionDate <= endDate;

    return matchesSearch && matchesType && matchesAmount && matchesDate;
  });

  // Calcular totales
  const totalInflow = filteredTransactions
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);
  const totalOutflow = filteredTransactions
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const netFlow = totalInflow - totalOutflow;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Historial de Movimientos</h2>
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
              <p className="mt-1 text-2xl font-semibold text-green-600">+${totalInflow.toLocaleString()}</p>
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
              <p className="mt-1 text-2xl font-semibold text-red-600">-${totalOutflow.toLocaleString()}</p>
            </div>
            <div className="p-2 rounded-full bg-red-100">
              <ArrowDown className="h-5 w-5 text-red-600" />
            </div>
          </div>
        </div>
        <div className="bg-white border rounded-lg shadow-sm p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Balance Neto</p>
              <p className={`mt-1 text-2xl font-semibold ${netFlow >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                ${netFlow.toLocaleString()}
              </p>
            </div>
            <div className={`p-2 rounded-full ${netFlow >= 0 ? 'bg-blue-100' : 'bg-red-100'}`}>
              {netFlow >= 0 ? (
                <ArrowUp className="h-5 w-5 text-blue-600" />
              ) : (
                <ArrowDown className="h-5 w-5 text-red-600" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white border rounded-lg shadow-sm p-4 mb-8">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar descripción, categoría..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Movimiento</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as 'all' | 'sale' | 'expense' | 'adjustment')}
              className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="all">Todos los tipos</option>
              <option value="sale">Ventas</option>
              <option value="expense">Gastos</option>
              <option value="adjustment">Ajustes</option>
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Monto</label>
            <select
              value={filterAmount}
              onChange={(e) => setFilterAmount(e.target.value as 'all' | 'small' | 'medium' | 'large')}
              className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="all">Todos los montos</option>
              <option value="small">Pequeños (&lt; $500)</option>
              <option value="medium">Medianos ($500 - $1,000)</option>
              <option value="large">Grandes (&gt; $1,000)</option>
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Rango de Fechas</label>
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
              <span className="text-gray-500">a</span>
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de transacciones */}
      <div className="bg-white border rounded-lg shadow-sm p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Detalle de Movimientos</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Referencia</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(transaction.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      transaction.type === 'sale' 
                        ? 'bg-green-100 text-green-800' 
                        : transaction.type === 'expense'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {transaction.type === 'sale' ? 'Venta' : transaction.type === 'expense' ? 'Gasto' : 'Ajuste'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transaction.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transaction.reference || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className={`text-sm font-medium ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.amount > 0 ? '+' : ''}${transaction.amount.toLocaleString()}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                    No se encontraron transacciones con los filtros seleccionados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
