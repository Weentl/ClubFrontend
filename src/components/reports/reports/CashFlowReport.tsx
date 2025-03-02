import { useState, useEffect } from 'react';
import moment from 'moment-timezone';
import 'moment/locale/es'; // Configuramos moment en español
import { ChevronLeft, ChevronRight, DollarSign, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import ClubSelector from './ClubSelector';

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
  // Configuramos el locale en español y la zona horaria de México
  moment.locale('es');
  const mexicoTz = "America/Mexico_City";

  // Estado para la fecha actual (usado para la navegación en el tiempo)
  const [currentDate, setCurrentDate] = useState(() => moment.tz(mexicoTz));
  const [data, setData] = useState<CashFlowReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<CashFlowDay | null>(null);
  const [clubId, setClubId] = useState<string | null>(null);

  // Cálculo de fechas según el período y currentDate
  let startDate, endDate;
  if (period === 'weekly') {
    startDate = currentDate.clone().startOf('isoWeek');
    endDate = currentDate.clone().endOf('isoWeek');
  } else if (period === 'monthly') {
    startDate = currentDate.clone().startOf('month');
    endDate = currentDate.clone().endOf('month');
  } else {
    startDate = currentDate.clone().startOf('year');
    endDate = currentDate.clone().endOf('year');
  }

  // Etiqueta del período en el encabezado:
  // Semanal: rango completo, Mensual: nombre del mes y año, Anual: año.
  const periodLabel =
    period === 'weekly'
      ? `${startDate.format('DD/MM/YYYY')} - ${endDate.format('DD/MM/YYYY')}`
      : period === 'monthly'
      ? currentDate.format('MMMM YYYY')
      : currentDate.format('YYYY');

  // Funciones de navegación (retroceder/avanzar en el tiempo)
  const handlePrev = () => {
    if (period === 'weekly') {
      setCurrentDate(currentDate.clone().subtract(1, 'week'));
    } else if (period === 'monthly') {
      setCurrentDate(currentDate.clone().subtract(1, 'month'));
    } else {
      setCurrentDate(currentDate.clone().subtract(1, 'year'));
    }
  };

  const handleNext = () => {
    if (period === 'weekly') {
      setCurrentDate(currentDate.clone().add(1, 'week'));
    } else if (period === 'monthly') {
      setCurrentDate(currentDate.clone().add(1, 'month'));
    } else {
      setCurrentDate(currentDate.clone().add(1, 'year'));
    }
  };

  // Función que recibe el club seleccionado desde ClubSelector
  const handleClubChange = (selectedClub: string | null) => {
    setClubId(selectedClub);
  };

  // Consulta a la API, enviando además el parámetro "date" para que el backend sepa el rango a analizar
  useEffect(() => {
    setLoading(true);
    const clubParam = clubId ? `&club=${clubId}` : '';
    const dateParam = `&date=${currentDate.toISOString()}`;
    fetch(`${API_BASE_URL}/api/reports?type=cash-flow&period=${period}${clubParam}${dateParam}`)
      .then((res) => res.json())
      .then((fetchedData: CashFlowReportData) => {
        setData(fetchedData);
        setLoading(false);
        // Al cambiar de período o navegar, se resetea el día seleccionado
        setSelectedDay(null);
      })
      .catch((err) => {
        console.error('Error fetching cash flow data:', err);
        setLoading(false);
      });
  }, [period, clubId, currentDate]);

  if (loading) return <p>Cargando datos...</p>;
  if (!data) return <p>Error al cargar datos.</p>;

  // Crear un mapa de datos para acceder rápidamente por fecha
  const dayDataMap: { [key: string]: CashFlowDay } = {};
  data.cashFlowData.forEach(day => {
    // Se asume que el backend devuelve la fecha en formato "YYYY-MM-DD" o ISO,
    // por lo que se normaliza con moment.tz usando la zona de México.
    const key = moment.tz(day.date, mexicoTz).format('YYYY-MM-DD');
    dayDataMap[key] = day;
  });

  // Filtrar los datos para el período actual usando moment.tz para que coincida la zona
  const currentPeriodData = data.cashFlowData.filter(day => {
    const dayDate = moment.tz(day.date, 'YYYY-MM-DD', mexicoTz);
    return dayDate.isBetween(startDate, endDate, 'day', '[]');
  });

  const totalInflow = currentPeriodData.reduce((sum, day) => sum + day.inflow, 0);
  const totalOutflow = currentPeriodData.reduce((sum, day) => sum + day.outflow, 0);
  const netCashFlow = totalInflow - totalOutflow;

  // Renderizado del calendario:
  let calendarContent;
  if (period === 'yearly') {
    // Resumen mensual: agrupar datos solo del año actual
    const monthlyMap: { [key: string]: { inflow: number; outflow: number; balance: number } } = {};
    data.cashFlowData.forEach(day => {
      const dayDate = moment.tz(day.date, 'YYYY-MM-DD', mexicoTz);
      if (dayDate.year() === currentDate.year()) {
        const m = dayDate.format('MM');
        if (!monthlyMap[m]) {
          monthlyMap[m] = { inflow: 0, outflow: 0, balance: 0 };
        }
        monthlyMap[m].inflow += day.inflow;
        monthlyMap[m].outflow += day.outflow;
        monthlyMap[m].balance += day.balance;
      }
    });
    
    const monthlySummary = [];
    for (let i = 1; i <= 12; i++) {
      const monthNum = i.toString().padStart(2, '0');
      const summary = monthlyMap[monthNum] || { inflow: 0, outflow: 0, balance: 0 };
      monthlySummary.push({
        month: moment(monthNum, 'MM').format('MMMM').toUpperCase(),
        ...summary
      });
    }
    
    calendarContent = (
      <div className="grid grid-cols-3 gap-4">
        {monthlySummary.map((m, index) => (
          <div key={index} className="bg-white border rounded-lg shadow-sm p-4">
            <h4 className="text-md font-semibold text-gray-900">{m.month}</h4>
            <p className="text-sm text-green-600">Entradas: ${m.inflow.toLocaleString()}</p>
            <p className="text-sm text-red-600">Salidas: ${m.outflow.toLocaleString()}</p>
            <p className={`text-sm font-semibold ${m.balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
              Flujo: ${m.balance.toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    );
  } else {
    // Para semanal y mensual: calendario diario
    const daysOfWeek = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    
    const weeks: CashFlowDay[][] = [];
    let currentWeek: CashFlowDay[] = [];
    
    // En la vista mensual, iniciar desde el primer día del mes y alinear según el día de la semana
    if (period === 'monthly') {
      const firstDay = startDate.clone();
      const dayOfWeek = (firstDay.day() + 6) % 7; // lunes=0
      for (let i = 0; i < dayOfWeek; i++) {
        currentWeek.push({ date: '', inflow: 0, outflow: 0, balance: 0 });
      }
    }
    
    let iterDate = startDate.clone();
    while (iterDate.isSameOrBefore(endDate, 'day')) {
      const dateStr = iterDate.format('YYYY-MM-DD');
      const dayData = dayDataMap[dateStr] || { date: dateStr, inflow: 0, outflow: 0, balance: 0 };
      currentWeek.push(dayData);
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
      iterDate.add(1, 'day');
    }
    
    // Completar la última semana con celdas vacías si es necesario
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push({ date: '', inflow: 0, outflow: 0, balance: 0 });
      }
      weeks.push(currentWeek);
    }

    calendarContent = (
      <div>
        <div className="grid grid-cols-7 gap-1 mb-2">
          {daysOfWeek.map((day, index) => (
            <div key={index} className="text-center text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {weeks.flatMap((week, weekIndex) =>
            week.map((day, dayIndex) => {
              if (!day.date) {
                return (
                  <div key={`${weekIndex}-${dayIndex}`} className="h-20 bg-gray-50 rounded p-1"></div>
                );
              }
              
              const dayDate = moment.tz(day.date, 'YYYY-MM-DD', mexicoTz);
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
                    <span className="text-xs font-medium">{dayDate.date()}</span>
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
              {moment.tz(selectedDay.date, 'YYYY-MM-DD', mexicoTz).format('dddd, D [de] MMMM [de] YYYY')}
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
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Flujo de Caja</h2>
        {/* Se integra el selector de clubes sin modificar su código */}
        <ClubSelector onClubChange={handleClubChange} />
        <span className="text-sm text-gray-500">{periodLabel}</span>
      </div>

      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border rounded-lg shadow-sm p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Entradas</p>
              <p className="mt-1 text-2xl font-semibold text-green-600">
                ${totalInflow.toLocaleString()}
              </p>
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
              <p className="mt-1 text-2xl font-semibold text-red-600">
                ${totalOutflow.toLocaleString()}
              </p>
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

      {/* Sección de Saldo Actual y Proyección (con datos reales provenientes del backend) */}
      <div className="bg-white border rounded-lg shadow-sm p-4 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Saldo Actual</h3>
            <p className="text-3xl font-bold text-blue-600">
              ${data.currentBalance.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500 mt-1">Disponible hoy</p>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Proyección</h3>
            <p className="text-3xl font-bold text-red-600">
              -${data.next7DaysOutflow.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500 mt-1">Salidas estimadas próximos 7 días</p>
          </div>
        </div>
      </div>

      {/* Calendario visual / Resumen mensual según el período */}
      <div className="bg-white border rounded-lg shadow-sm p-4">
        <div className="flex items-center justify-between mb-4">
          <button onClick={handlePrev} className="p-1 rounded-full hover:bg-gray-100">
            <ChevronLeft className="h-5 w-5 text-gray-500" />
          </button>
          <h3 className="text-lg font-medium text-gray-900">{periodLabel}</h3>
          <button onClick={handleNext} className="p-1 rounded-full hover:bg-gray-100">
            <ChevronRight className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        {calendarContent}
      </div>
    </div>
  );
}


