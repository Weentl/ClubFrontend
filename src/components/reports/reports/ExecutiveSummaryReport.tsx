// reports/ExecutiveSummaryReport.tsx
import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Package, DollarSign, Store } from 'lucide-react';
import ClubSelector from './ClubSelector';
import SalesExpenseChart from './SalesExpenseChart';
import { useAuthFetch } from '../../utils/authFetch';

interface ExecutiveSummaryData {
  netProfit: number;
  netProfitChange: number;
  topProduct: {
    name: string;
    sales: number;
    percentage: number;
  };
  topExpense: {
    name: string;
    amount: number;
    percentage: number;
  };
  topClub: {
    name: string;
    sales: number;
    percentage: number;
  };
  recommendations: {
    id: number;
    text: string;
    type: 'positive' | 'negative' | 'neutral';
  }[];
  totalSales: number;
  totalExpenses: number;
  period: string;
}

interface ExecutiveSummaryReportProps {
  period: 'weekly' | 'monthly' | 'yearly';
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function ExecutiveSummaryReport({ period }: ExecutiveSummaryReportProps) {
  const [data, setData] = useState<ExecutiveSummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [clubId, setClubId] = useState<string | null>('global');
  const authFetch = useAuthFetch();
  useEffect(() => {
    setLoading(true);
    let url = `${API_BASE_URL}/api/reports?type=executive-summary&period=${period}`;
    if (clubId) {
      url += `&club=${clubId}`;
    }
    authFetch(url)
      .then(res => res.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error al obtener los datos del reporte:', err);
        setLoading(false);
      });
  }, [period, clubId]);

  if (loading) {
    return <p>Cargando datos...</p>;
  }

  if (!data) {
    return <p>No se pudo obtener la información.</p>;
  }

  const periodLabel = data.period;

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Resumen Ejecutivo</h2>
        <ClubSelector onClubChange={setClubId} />
        <span className="text-sm text-gray-500">{periodLabel}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Ganancia Neta */}
        <div className="bg-white border rounded-lg shadow-sm p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Ganancia Neta</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">${data.netProfit.toLocaleString()}</p>
            </div>
            <div className={`p-2 rounded-full ${data.netProfitChange > 0 ? 'bg-green-100' : 'bg-red-100'}`}>
              {data.netProfitChange > 0 ? (
                <TrendingUp className="h-5 w-5 text-green-600" />
              ) : (
                <TrendingDown className="h-5 w-5 text-red-600" />
              )}
            </div>
          </div>
          <div className="mt-2">
            <span className={`inline-flex items-center text-sm ${data.netProfitChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {data.netProfitChange > 0 ? '↑' : '↓'} {Math.abs(data.netProfitChange).toFixed(2)}%
            </span>
            <span className="text-sm text-gray-500 ml-1">vs. período anterior</span>
          </div>
        </div>

        {/* Producto Estrella */}
        <div className="bg-white border rounded-lg shadow-sm p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Producto Estrella</p>
              <p className="mt-1 text-lg font-semibold text-gray-900">{data.topProduct.name}</p>
            </div>
            <div className="p-2 rounded-full bg-blue-100">
              <Package className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-500">
            {data.topProduct.sales} en ventas (${data.topProduct.sales.toLocaleString()}) ({data.topProduct.percentage.toFixed(2)}% del total)
          </div>
        </div>

        {/* Mayor Gasto */}
        <div className="bg-white border rounded-lg shadow-sm p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Mayor Gasto</p>
              <p className="mt-1 text-lg font-semibold text-gray-900">{data.topExpense.name}</p>
            </div>
            <div className="p-2 rounded-full bg-red-100">
              <DollarSign className="h-5 w-5 text-red-600" />
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-500">
            ${data.topExpense.amount.toLocaleString()} ({data.topExpense.percentage.toFixed(2)}% del total)
          </div>
        </div>

        {/* Club Líder */}
        <div className="bg-white border rounded-lg shadow-sm p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Club Líder</p>
              <p className="mt-1 text-lg font-semibold text-gray-900">{data.topClub.name}</p>
            </div>
            <div className="p-2 rounded-full bg-purple-100">
              <Store className="h-5 w-5 text-purple-600" />
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-500">
            ${data.topClub.sales.toLocaleString()} en ventas ({data.topClub.percentage.toFixed(2)}% del total)
          </div>
        </div>
      </div>

      {/* Gráfica Resumen de Ventas vs Gastos */}
      <div className="bg-white border rounded-lg shadow-sm p-4 mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Resumen de Ventas vs Gastos</h3>
        <SalesExpenseChart period={period} clubId={clubId} />
      </div>

      {/* Recomendaciones */}
      <div className="bg-white border rounded-lg shadow-sm p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recomendaciones</h3>
        <div className="space-y-3">
          {data.recommendations.map(rec => (
            <div key={rec.id} className={`p-3 rounded-lg ${rec.type === 'positive' ? 'bg-green-50 border-l-4 border-green-400' : rec.type === 'negative' ? 'bg-red-50 border-l-4 border-red-400' : 'bg-blue-50 border-l-4 border-blue-400'}`}>
              <p className="text-sm">{rec.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

