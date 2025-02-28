// reports/CashFlowReport.tsx
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, DollarSign, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface CashFlowDay {
  date: string;
  inflow: number;
  outflow: number;
  balance: number;
}

interface CashFlowReportData {
  currentMonth: string;
  cashFlowData: CashFlowDay[];
  currentBalance: number;
  next7DaysOutflow: number;
}

interface CashFlowReportProps {
  period: 'weekly' | 'monthly' | 'yearly';
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function CashFlowReport({ period }: CashFlowReportProps) {
  const [data, setData] = useState<CashFlowReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<CashFlowDay | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE_URL}/api/reports?type=cash-flow&period=${period}`)
      .then((res) => res.json())
      .then((fetchedData: CashFlowReportData) => {
        setData(fetchedData);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching cash flow data:', err);
        setLoading(false);
      });
  }, [period]);

  if (loading) return <p>Cargando datos...</p>;
  if (!data) return <p>Error al cargar datos.</p>;

  const cashFlowData = data.cashFlowData;

  // Calcular totales
  const totalInflow = cashFlowData.reduce((sum, day) => sum + day.inflow, 0);
  const totalOutflow = cashFlowData.reduce((sum, day) => sum + day.outflow, 0);
  const netCashFlow = totalInflow - totalOutflow;

  // Generar calendario: agrupar días en semanas
  const daysOfWeek = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  const getDayOfWeek = (dateString: string) => {
    const date = new Date(dateString);
    return (date.getDay() + 6) % 7;
  };

  const weeks: CashFlowDay[][] = [];
  let currentWeek: CashFlowDay[] = [];
  for (let i = 0; i < getDayOfWeek(cashFlowData[0].date); i++) {
    currentWeek.push({ date: '', inflow: 0, outflow: 0, balance: 0 });
  }
  cashFlowData.forEach((day) => {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push({ date: '', inflow: 0, outflow: 0, balance: 0 });
    }
    weeks.push(currentWeek);
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Flujo de Caja</h2>
        <span className="text-sm text-gray-500">
          {period === 'weekly' ? 'Semana 20, 2024' : period === 'monthly' ? data.currentMonth : '2024'}
        </span>
      </div>

      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border rounded-lg shadow-sm p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Entradas</p>
              <p className="mt-1 text-2xl font-semibold text-green-600">${totalInflow.toLocaleString()}</p>
            </div>
            <div className="p-2 rounded-full bg-green-100">
              <ArrowUpRight className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white border rounded-lg shadow-sm p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Salidas</p>
              <p className="mt-1 text-2xl font-semibold text-red-600">${totalOutflow.toLocaleString()}</p>
            </div>
            <div className="p-2 rounded-full bg-red-100">
              <ArrowDownRight className="h-5 w-5 text-red-600" />
            </div>
          </div>
        </div>
        <div className="bg-white border rounded-lg shadow-sm p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Flujo Neto</p>
              <p className={`mt-1 text-2xl font-semibold ${netCashFlow >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                ${netCashFlow.toLocaleString()}
              </p>
            </div>
            <div className={`p-2 rounded-full ${netCashFlow >= 0 ? 'bg-blue-100' : 'bg-red-100'}`}>
              <DollarSign className={`h-5 w-5 ${netCashFlow >= 0 ? 'text-blue-600' : 'text-red-600'}`} />
            </div>
          </div>
        </div>
      </div>

      {/* Saldo actual y proyección */}
      <div className="bg-white border rounded-lg shadow-sm p-4 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Saldo Actual</h3>
            <p className="text-3xl font-bold text-blue-600">${data.currentBalance.toLocaleString()}</p>
            <p className="text-sm text-gray-500 mt-1">Disponible hoy</p>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Proyección</h3>
            <p className="text-3xl font-bold text-red-600">-${data.next7DaysOutflow.toLocaleString()}</p>
            <p className="text-sm text-gray-500 mt-1">Salidas estimadas próximos 7 días</p>
          </div>
        </div>
      </div>

      {/* Calendario visual */}
      <div className="bg-white border rounded-lg shadow-sm p-4">
        <div className="flex items-center justify-between mb-4">
          <button className="p-1 rounded-full hover:bg-gray-100">
            <ChevronLeft className="h-5 w-5 text-gray-500" />
          </button>
          <h3 className="text-lg font-medium text-gray-900">{data.currentMonth}</h3>
          <button className="p-1 rounded-full hover:bg-gray-100">
            <ChevronRight className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 mb-2">
          {daysOfWeek.map((day, index) => (
            <div key={index} className="text-center text-sm font-medium text-gray-500">{day}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {weeks.flatMap((week, weekIndex) =>
            week.map((day, dayIndex) => {
              if (!day.date) {
                return <div key={`${weekIndex}-${dayIndex}`} className="h-20 bg-gray-50 rounded p-1"></div>;
              }
              const bgColor =
                day.balance > 0
                  ? 'bg-green-50 hover:bg-green-100'
                  : day.balance < 0
                  ? 'bg-red-50 hover:bg-red-100'
                  : 'bg-gray-50 hover:bg-gray-100';
              const isSelected = selectedDay?.date === day.date;
              const borderStyle = isSelected ? 'border-2 border-blue-500' : '';
              return (
                <div
                  key={`${weekIndex}-${dayIndex}`}
                  className={`h-20 ${bgColor} ${borderStyle} rounded p-1 cursor-pointer transition-colors`}
                  onClick={() => setSelectedDay(day)}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-medium">{new Date(day.date).getDate()}</span>
                    <span className={`text-xs font-medium ${day.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ${day.balance}
                    </span>
                  </div>
                  {day.inflow > 0 && <div className="mt-1 text-xs text-green-600">+${day.inflow}</div>}
                  {day.outflow > 0 && <div className="text-xs text-red-600">-${day.outflow}</div>}
                </div>
              );
            })
          )}
        </div>
        {selectedDay && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 mb-2">
              {new Date(selectedDay.date).toLocaleDateString('es-MX', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </h4>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <p className="text-xs text-gray-500">Entradas</p>
                <p className="text-sm font-medium text-green-600">+${selectedDay.inflow}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Salidas</p>
                <p className="text-sm font-medium text-red-600">-${selectedDay.outflow}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Balance</p>
                <p className={`text-sm font-medium ${selectedDay.balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                  ${selectedDay.balance}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
