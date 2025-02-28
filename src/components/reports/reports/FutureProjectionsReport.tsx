// reports/FutureProjectionsReport.tsx
import React, { useState, useEffect } from 'react';
import { Calendar, Target, TrendingUp, TrendingDown } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface FutureProjectionsReportProps {
  period: 'weekly' | 'monthly' | 'yearly';
}

export interface ProjectionData {
  month: string;
  sales: number;
  expenses: number;
  profit: number;
  isProjection: boolean;
}

export interface GoalData {
  id: string;
  name: string;
  target: number;
  current: number;
  unit: string;
  endDate: string;
  category: 'sales' | 'profit' | 'customers' | 'inventory';
}

interface FutureProjectionsReportData {
  projectionData: ProjectionData[];
  goalsData: GoalData[];
}

export default function FutureProjectionsReport({ period }: FutureProjectionsReportProps) {
  const [projectionPeriod, setProjectionPeriod] = useState<'3months' | '6months' | '12months'>('3months');
  const [data, setData] = useState<FutureProjectionsReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE_URL}/api/reports?type=future-projections&period=${period}`)
      .then((res) => res.json())
      .then((fetchedData: FutureProjectionsReportData) => {
        setData(fetchedData);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching future projections data:', err);
        setLoading(false);
      });
  }, [period]);

  if (loading) return <p>Cargando datos...</p>;
  if (!data) return <p>Error al cargar datos.</p>;

  const { projectionData, goalsData } = data;

  // Filtrar datos según el período seleccionado (filtrado local)
  const currentMonthIndex = 4; // Suponiendo que mayo es el índice 4
  const getFilteredData = () => {
    if (projectionPeriod === '3months') {
      return projectionData.slice(currentMonthIndex - 2, currentMonthIndex + 4);
    } else if (projectionPeriod === '6months') {
      return projectionData.slice(currentMonthIndex - 2, currentMonthIndex + 7);
    } else {
      return projectionData;
    }
  };

  const filteredData = getFilteredData();
  const maxValue = Math.max(...filteredData.map(d => Math.max(d.sales, d.expenses, d.profit)));

  // Calcular tendencias a partir de los datos reales (no proyectados)
  const calculateTrend = (data: ProjectionData[], key: 'sales' | 'expenses' | 'profit') => {
    const realData = data.filter(d => !d.isProjection);
    if (realData.length < 2) return { percentage: 0, isPositive: true };
    const lastMonth = realData[realData.length - 1][key];
    const previousMonth = realData[realData.length - 2][key];
    const change = ((lastMonth - previousMonth) / previousMonth) * 100;
    return {
      percentage: Math.abs(Math.round(change)),
      isPositive: change >= 0
    };
  };

  const salesTrend = calculateTrend(projectionData, 'sales');
  const profitTrend = calculateTrend(projectionData, 'profit');

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Proyecciones Futuras</h2>
        <span className="text-sm text-gray-500">
          {period === 'weekly' ? 'Semana 20, 2024' : period === 'monthly' ? 'Mayo 2024' : '2024'}
        </span>
      </div>

      {/* Tarjetas de resumen de tendencias */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-white border rounded-lg shadow-sm p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Tendencia de Ventas</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">
                {projectionData[4].sales.toLocaleString()} → {projectionData[7].sales.toLocaleString()}
              </p>
            </div>
            <div className={`p-2 rounded-full ${salesTrend.isPositive ? 'bg-green-100' : 'bg-red-100'}`}>
              {salesTrend.isPositive ? (
                <TrendingUp className="h-5 w-5 text-green-600" />
              ) : (
                <TrendingDown className="h-5 w-5 text-red-600" />
              )}
            </div>
          </div>
          <div className="mt-2">
            <span className={`inline-flex items-center text-sm ${salesTrend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {salesTrend.isPositive ? '↑' : '↓'} {salesTrend.percentage}%
            </span>
            <span className="text-sm text-gray-500 ml-1">vs. mes anterior</span>
          </div>
        </div>

        <div className="bg-white border rounded-lg shadow-sm p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Tendencia de Ganancias</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">
                {projectionData[4].profit.toLocaleString()} → {projectionData[7].profit.toLocaleString()}
              </p>
            </div>
            <div className={`p-2 rounded-full ${profitTrend.isPositive ? 'bg-green-100' : 'bg-red-100'}`}>
              {profitTrend.isPositive ? (
                <TrendingUp className="h-5 w-5 text-green-600" />
              ) : (
                <TrendingDown className="h-5 w-5 text-red-600" />
              )}
            </div>
          </div>
          <div className="mt-2">
            <span className={`inline-flex items-center text-sm ${profitTrend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {profitTrend.isPositive ? '↑' : '↓'} {profitTrend.percentage}%
            </span>
            <span className="text-sm text-gray-500 ml-1">vs. mes anterior</span>
          </div>
        </div>
      </div>

      {/* Gráfico de proyección */}
      <div className="bg-white border rounded-lg shadow-sm p-4 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Proyección Financiera</h3>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Mostrar:</span>
            <select
              value={projectionPeriod}
              onChange={(e) => setProjectionPeriod(e.target.value as '3months' | '6months' | '12months')}
              className="border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
            >
              <option value="3months">3 meses</option>
              <option value="6months">6 meses</option>
              <option value="12months">12 meses</option>
            </select>
          </div>
        </div>

        <div className="h-80">
          <div className="relative h-64">
            {/* Líneas de referencia horizontales */}
            {[0.25, 0.5, 0.75, 1].map((ratio, index) => (
              <div 
                key={index}
                className="absolute w-full border-t border-gray-200"
                style={{ top: `${(1 - ratio) * 100}%` }}
              >
                <span className="absolute -left-8 -top-2 text-xs text-gray-500">
                  ${Math.round(maxValue * ratio).toLocaleString()}
                </span>
              </div>
            ))}
            {/* Líneas de tendencia */}
            <div className="absolute inset-0 flex items-end">
              <div className="flex-1 flex items-end space-x-1">
                {filteredData.map((d, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div className="relative w-full">
                      {/* Línea de ventas */}
                      <div 
                        className={`absolute bottom-0 left-1/2 w-1 ${d.isProjection ? 'bg-blue-300' : 'bg-blue-500'}`}
                        style={{ 
                          height: `${(d.sales / maxValue) * 100}%`,
                          transform: 'translateX(-50%)'
                        }}
                      ></div>
                      {/* Línea de gastos */}
                      <div 
                        className={`absolute bottom-0 left-1/2 w-1 ${d.isProjection ? 'bg-red-300' : 'bg-red-500'}`}
                        style={{ 
                          height: `${(d.expenses / maxValue) * 100}%`,
                          transform: 'translateX(-1.5px)'
                        }}
                      ></div>
                      {/* Línea de ganancias */}
                      <div 
                        className={`absolute bottom-0 left-1/2 w-1 ${d.isProjection ? 'bg-green-300' : 'bg-green-500'}`}
                        style={{ 
                          height: `${(d.profit / maxValue) * 100}%`,
                          transform: 'translateX(1.5px)'
                        }}
                      ></div>
                    </div>
                    <div className="text-xs mt-2 text-gray-600">
                      {d.month}
                      {d.isProjection && <span className="text-gray-400">*</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Línea divisoria entre datos reales y proyecciones */}
            <div 
              className="absolute h-full border-l-2 border-dashed border-gray-300"
              style={{ left: `${(filteredData.findIndex(d => d.isProjection) / filteredData.length) * 100}%` }}
            ></div>
          </div>
          {/* Leyenda */}
          <div className="flex justify-center mt-4 space-x-6">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
              <span className="text-xs text-gray-600">Ventas</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded mr-2"></div>
              <span className="text-xs text-gray-600">Gastos</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
              <span className="text-xs text-gray-600">Ganancias</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-gray-300 rounded mr-2"></div>
              <span className="text-xs text-gray-600">Proyección*</span>
            </div>
          </div>
        </div>
      </div>

      {/* Metas vs. Real */}
      <div className="bg-white border rounded-lg shadow-sm p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Metas vs. Real</h3>
        <div className="space-y-6">
          {goalsData.map((goal, index) => {
            const percentage = Math.round((goal.current / goal.target) * 100);
            const daysLeft = Math.ceil((new Date(goal.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
            return (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">{goal.name}</h4>
                    <p className="text-xs text-gray-500">
                      Fecha límite: {new Date(goal.endDate).toLocaleDateString()} ({daysLeft} días restantes)
                    </p>
                  </div>
                  <div className={`p-2 rounded-full ${
                    goal.category === 'sales' ? 'bg-blue-100' : 
                    goal.category === 'profit' ? 'bg-green-100' : 
                    goal.category === 'customers' ? 'bg-purple-100' : 
                    'bg-yellow-100'
                  }`}>
                    <Target className={`h-5 w-5 ${
                      goal.category === 'sales' ? 'text-blue-600' : 
                      goal.category === 'profit' ? 'text-green-600' : 
                      goal.category === 'customers' ? 'text-purple-600' : 
                      'text-yellow-600'
                    }`} />
                  </div>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <div className="text-sm">
                    Meta: {goal.target.toLocaleString()} {goal.unit}
                  </div>
                  <div className="text-sm">
                    Actual: {goal.current.toLocaleString()} {goal.unit}
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className={`h-2.5 rounded-full ${
                      percentage >= 90 ? 'bg-green-500' : 
                      percentage >= 60 ? 'bg-yellow-500' : 
                      'bg-red-500'
                    }`} 
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  ></div>
                </div>
                <div className="mt-2 text-xs text-gray-500 text-right">
                  {percentage}% completado
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
