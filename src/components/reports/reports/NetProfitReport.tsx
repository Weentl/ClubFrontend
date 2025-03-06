import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import ClubSelector from './ClubSelector';
import NetProfitChart from './NetProfitChart';
import { useAuthFetch } from '../../utils/authFetch';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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
  // Añadimos estos campos opcionales para el rango de fechas
  startDate?: string;
  endDate?: string;
}

interface NetProfitReportProps {
  period: 'weekly' | 'monthly' | 'yearly';
}

export default function NetProfitReport({ period }: NetProfitReportProps) {
  const [data, setData] = useState<NetProfitData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clubId, setClubId] = useState<string | null>("global");
  const authFetch = useAuthFetch();
  // Función para formatear el período en un formato más legible
  const formatPeriodRange = (periodStr: string, periodType: string) => {
    // Si ya tenemos fechas específicas en los datos, las usamos directamente
    if (data?.startDate && data?.endDate) {
      return `${formatDate(data.startDate)} - ${formatDate(data.endDate)}`;
    }
    
    // Para semanas (ej. "Semana 9, 2025")
    if (periodType === 'weekly' && periodStr.startsWith('Semana')) {
      // Aquí calculamos las fechas basándonos en el número de semana
      // Formato: "DD/MM/YYYY - DD/MM/YYYY"
      const matches = periodStr.match(/Semana (\d+), (\d+)/);
      if (matches && matches.length === 3) {
        const weekNum = parseInt(matches[1], 10);
        const year = parseInt(matches[2], 10);
        
        // Calcular fecha inicial (primer día de la semana)
        const firstDayOfYear = new Date(year, 0, 1);
        const daysOffset = (weekNum - 1) * 7;
        const startDate = new Date(firstDayOfYear);
        startDate.setDate(firstDayOfYear.getDate() + daysOffset - firstDayOfYear.getDay() + 1); // Ajustar al lunes
        
        // Calcular fecha final (último día de la semana)
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6); // Domingo
        
        return `${formatDate(startDate)} - ${formatDate(endDate)}`;
      }
    }
    
    // Para meses (ej. "Febrero 2025")
    if (periodType === 'monthly' && periodStr.includes('mes')) {
      const monthNum = periodStr.match(/mes (\d+)/)?.[1];
      if (monthNum) {
        const monthNames = [
          "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
          "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
        ];
        const year = new Date().getFullYear(); // Asumimos el año actual si no está en el string
        const month = parseInt(monthNum, 10) - 1; // Meses en JS son 0-indexed
        
        return monthNames[month] + " " + year;
      }
    }
    
    // Si no podemos formatear, devolvemos el string original
    return periodStr;
  };
  
  // Función para formatear una fecha como DD/MM/YYYY
  const formatDate = (date: Date | string) => {
    const d = date instanceof Date ? date : new Date(date);
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
  };

  useEffect(() => {
    setLoading(true);
    setError(null);
    
    let url = `${API_BASE_URL}/api/reports?type=net-profit&period=${period}`;
    if (clubId) {
      url += `&club=${clubId}`;
    }
    
    authFetch(url)
      .then(async (res) => {
        if (!res.ok) {
          // Capturar errores HTTP
          const errorText = await res.text();
          throw new Error(`Error ${res.status}: ${errorText}`);
        }
        return res.json();
      })
      .then((fetchedData: NetProfitData) => {
        setData(fetchedData);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching net profit data:', err);
        setError(err.message || 'Error al obtener datos');
        setLoading(false);
      });
  }, [period, clubId]);

  if (loading) return <p className="p-6">Cargando datos...</p>;
  if (error) return <p className="p-6 text-red-600">Error: {error}</p>;
  if (!data) return <p className="p-6">No se encontraron datos.</p>;

  // Formatear el período para mostrarlo de manera más clara
  const formattedPeriod = formatPeriodRange(data.period, period);

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Reporte de Ganancias Netas</h2>
        {/* Selector de clubes */}
        <ClubSelector onClubChange={setClubId} />
        <span className="text-sm text-gray-500">{formattedPeriod}</span>
      </div>

      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border rounded-lg shadow-sm p-4">
          <p className="text-sm font-medium text-gray-500">Ventas Totales</p>
          <p className="mt-1 text-2xl font-semibold text-green-600">
            ${data.totalSales.toLocaleString()}
          </p>
        </div>
        <div className="bg-white border rounded-lg shadow-sm p-4">
          <p className="text-sm font-medium text-gray-500">Gastos Totales</p>
          <p className="mt-1 text-2xl font-semibold text-red-600">
            ${data.totalExpenses.toLocaleString()}
          </p>
        </div>
        <div className="bg-white border rounded-lg shadow-sm p-4">
          <div className="flex justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Ganancia Neta</p>
              <p className="mt-1 text-2xl font-semibold text-blue-600">
                ${data.netProfit.toLocaleString()}
              </p>
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

      {/* Componente de gráfico */}
      <NetProfitChart monthlySummary={data.monthlySummary} />

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