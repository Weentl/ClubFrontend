// reports/NetProfitReport.tsx
import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Info } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface NetProfitReportProps {
  period: 'weekly' | 'monthly' | 'yearly';
}

interface MonthlySummary {
  month: string;
  sales: number;
  expenses: number;
  profit: number;
}

interface NetProfitData {
  period: string;
  previousPeriod: string;
  totalSales: number;
  totalExpenses: number;
  netProfit: number;
  changePercentage: number;
  isPositive: boolean;
  monthlySummary: MonthlySummary[];
}

export default function NetProfitReport({ period }: NetProfitReportProps) {
  const [data, setData] = useState<NetProfitData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE_URL}/api/reports?type=net-profit&period=${period}`)
      .then((res) => res.json())
      .then((fetchedData: NetProfitData) => {
        setData(fetchedData);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching net profit data:', err);
        setLoading(false);
      });
  }, [period]);

  if (loading) return <p>Cargando datos...</p>;
  if (!data) return <p>Error al cargar datos.</p>;

  const maxValue = Math.max(...data.monthlySummary.map(m => Math.max(m.sales, m.expenses, m.profit)));

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Reporte de Ganancias Netas</h2>
        <span className="text-sm text-gray-500">{data.period}</span>
      </div>

      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border rounded-lg shadow-sm p-4">
          <p className="text-sm font-medium text-gray-500">Ventas Totales</p>
          <p className="mt-1 text-2xl font-semibold text-green-600">${data.totalSales.toLocaleString()}</p>
        </div>
        <div className="bg-white border rounded-lg shadow-sm p-4">
          <p className="text-sm font-medium text-gray-500">Gastos Totales</p>
          <p className="mt-1 text-2xl font-semibold text-red-600">${data.totalExpenses.toLocaleString()}</p>
        </div>
        <div className="bg-white border rounded-lg shadow-sm p-4">
          <div className="flex justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Ganancia Neta</p>
              <p className="mt-1 text-2xl font-semibold text-blue-600">${data.netProfit.toLocaleString()}</p>
            </div>
            <div className={`p-2 rounded-full ${data.isPositive ? 'bg-green-100' : 'bg-red-100'}`}>
              {data.isPositive ? (
                <TrendingUp className="h-5 w-5 text-green-600" />
              ) : (
                <TrendingDown className="h-5 w-5 text-red-600" />
              )}
            </div>
          </div>
          <div className="mt-2">
            <span className={`inline-flex items-center text-sm ${data.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {data.isPositive ? '↑' : '↓'} {Math.abs(data.changePercentage)}%
            </span>
            <span className="text-sm text-gray-500 ml-1">vs. {data.previousPeriod}</span>
          </div>
        </div>
      </div>

      {/* Gráfico de barras */}
      <div className="bg-white border rounded-lg shadow-sm p-4 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Ventas vs Gastos vs Ganancias</h3>
          <button className="text-gray-400 hover:text-gray-500">
            <Info className="h-5 w-5" />
          </button>
        </div>
        <div className="h-80">
          <div className="flex h-64 items-end space-x-2">
            {data.monthlySummary.map((m, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div className="w-full flex flex-col-reverse">
                  {/* Barra de ganancia */}
                  <div 
                    className="w-full bg-blue-500 rounded-t"
                    style={{ 
                      height: `${(m.profit / maxValue) * 100}%`,
                      minHeight: m.profit > 0 ? '4px' : '0'
                    }}
                  ></div>
                  {/* Barra de gastos */}
                  <div 
                    className="w-full bg-red-500 rounded-t"
                    style={{ 
                      height: `${(m.expenses / maxValue) * 100}%`,
                      minHeight: m.expenses > 0 ? '4px' : '0'
                    }}
                  ></div>
                  {/* Barra de ventas */}
                  <div 
                    className="w-full bg-green-500 rounded-t"
                    style={{ 
                      height: `${(m.sales / maxValue) * 100}%`,
                      minHeight: m.sales > 0 ? '4px' : '0'
                    }}
                  ></div>
                </div>
                <div className="text-xs mt-2 text-gray-600">{m.month}</div>
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-4 space-x-6">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
              <span className="text-xs text-gray-600">Ventas</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded mr-2"></div>
              <span className="text-xs text-gray-600">Gastos</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
              <span className="text-xs text-gray-600">Ganancias</span>
            </div>
          </div>
        </div>
      </div>

      {/* Análisis de tendencia */}
      <div className="bg-white border rounded-lg shadow-sm p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Análisis de Tendencia</h3>
        <div className="space-y-4">
          <div className="flex items-center">
            <div className={`p-2 rounded-full ${data.isPositive ? 'bg-green-100' : 'bg-red-100'} mr-3`}>
              {data.isPositive ? (
                <TrendingUp className="h-5 w-5 text-green-600" />
              ) : (
                <TrendingDown className="h-5 w-5 text-red-600" />
              )}
            </div>
            <div>
              <p className="text-sm text-gray-900">
                <span className="font-medium">Ganaste ${data.netProfit.toLocaleString()}</span> {period === 'weekly' ? 'esta semana' : period === 'monthly' ? 'este mes' : 'este año'}, 
                un <span className={data.isPositive ? 'text-green-600' : 'text-red-600'}>
                  {data.isPositive ? '+' : '-'}{Math.abs(data.changePercentage)}%
                </span> que {period === 'weekly' ? 'la semana pasada' : period === 'monthly' ? 'el mes pasado' : 'el año pasado'}.
              </p>
            </div>
          </div>
          <div className="pl-12">
            <p className="text-sm text-gray-500">
              Tus ventas han aumentado constantemente en los últimos 3 meses, mientras que tus gastos se han mantenido estables.
            </p>
          </div>
          <div className="pl-12">
            <p className="text-sm text-gray-900 font-medium">Recomendación:</p>
            <p className="text-sm text-gray-500">
              Mantén esta tendencia positiva controlando tus gastos y enfocándote en los productos más rentables.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
