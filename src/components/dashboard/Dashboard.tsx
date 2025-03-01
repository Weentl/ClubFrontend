// dashboard.tsx
import { useState, useEffect, useMemo } from 'react';
import {
  ShoppingCart,
  AlertTriangle,
  DollarSign,
  Store,
  ChevronDown,
  Building2,
} from 'lucide-react';
import Header from './Header';
import KPICard from './KPICard';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface Club {
  _id: string;
  clubName: string;
  address: string;
  isMain?: boolean;
}

interface User {
  id: string;
  fullName: string;
}

interface ChartDataVentasGastos {
  labels: string[];
  sales: number[];
  expenses: number[];
}

interface ChartDataProductos {
  labels: string[];
  values: number[];
}

interface BusinessGoal {
  description: string;
  target: number;
  progress: number;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Dashboard() {
  const [showClubSelector, setShowClubSelector] = useState(false);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
  const [kpiData, setKpiData] = useState<any[]>([]);
  const [chartData, setChartData] = useState<ChartDataVentasGastos | ChartDataProductos | null>(null);
  const [chartType, setChartType] = useState<string>('Ventas vs. Gastos');
  const [timePeriod, setTimePeriod] = useState<string>('7d'); // 7d, 1m, 1y
  const [businessGoal, setBusinessGoal] = useState<BusinessGoal | null>(null);
  const [isEditingGoal, setIsEditingGoal] = useState<boolean>(false);
  const [newGoal, setNewGoal] = useState<number>(0);

  // Se obtiene la información del usuario del localStorage.
  const user: User | null = useMemo(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  }, []);

  // Cargar club seleccionado desde localStorage (si existe)
  useEffect(() => {
    const storedClub = localStorage.getItem('mainClub');
    if (storedClub) {
      setSelectedClub(JSON.parse(storedClub));
    }
  }, []);

  useEffect(() => {
    if (user && user.id) {
      fetchClubs(user.id);
    } else {
      console.error('No se encontró el usuario en localStorage.');
    }
  }, [user?.id]);

  // Seleccionar club principal (o el primero) si aún no se ha seleccionado
  useEffect(() => {
    if (clubs.length > 0 && !selectedClub) {
      const main = clubs.find((c) => c.isMain) || clubs[0];
      setSelectedClub(main);
    }
  }, [clubs, selectedClub]);

  // Al cambiar el club, se actualizan KPIs, gráficos y meta
  useEffect(() => {
    if (selectedClub?._id) {
      localStorage.setItem('mainClub', JSON.stringify(selectedClub));
      fetchKPIs(selectedClub._id);
      fetchChartData();
      fetchBusinessGoal();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClub?._id]);

  // Actualizar gráfico si cambia chartType o timePeriod
  useEffect(() => {
    if (selectedClub?._id) {
      fetchChartData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chartType, timePeriod]);

  const fetchClubs = async (userId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/clubs?user=${userId}`);
      if (!response.ok) throw new Error('Error al obtener los clubs');
      const data = await response.json();
      setClubs(data);
    } catch (error) {
      console.error('Error fetching clubs:', error);
    }
  };

  const fetchKPIs = async (clubId: string) => {
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const response = await fetch(
        `${API_BASE_URL}/api/dashboard/kpis?club=${clubId}&timezone=${timezone}&user=${user?.id}`
      );
      if (!response.ok) throw new Error('No hay suficientes datos');
      const data = await response.json();
      const kpis = [
        {
          title: 'Ventas Hoy',
          value: `$${data.ventasHoy.toFixed(2)}`,
          icon: ShoppingCart,
          trend: { value: 12, isPositive: true },
          color: 'blue',
        },
        {
          title: 'Productos Bajos en Stock',
          value: data.productosBajosStock,
          icon: AlertTriangle,
          color: 'yellow',
        },
        {
          title: 'Ganancias Mensuales',
          value: `$${data.gananciasMensuales.toFixed(2)}`,
          icon: DollarSign,
          trend: { value: 8, isPositive: true },
          color: 'green',
        },
        {
          title: 'Clubs Activos',
          value: data.clubsActivos,
          icon: Store,
          color: 'purple',
        },
      ];
      setKpiData(kpis);
    } catch (error) {
      console.error('Error fetching KPIs:', error);
      setKpiData([]);
    }
  };

  // Endpoint para obtener datos de la gráfica
  const fetchChartData = async () => {
    if (!selectedClub?._id) return;
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/dashboard/chart-data?club=${selectedClub._id}&chartType=${encodeURIComponent(
          chartType
        )}&timePeriod=${timePeriod}`
      );
      if (!response.ok) throw new Error('Error al obtener datos del gráfico');
      const data = await response.json();
      setChartData(data);
    } catch (error) {
      console.error('Error fetching chart data:', error);
      setChartData(null);
    }
  };

  // Endpoint para obtener la meta del negocio
  const fetchBusinessGoal = async () => {
    if (!selectedClub?._id) return;
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/dashboard/business-goals?club=${selectedClub._id}`
      );
      if (!response.ok) throw new Error('Error al obtener la meta del negocio');
      const data = await response.json();
      setBusinessGoal(data);
      setNewGoal(data.target); // Inicializamos el valor editable con el target actual
    } catch (error) {
      console.error('Error fetching business goal:', error);
      setBusinessGoal(null);
    }
  };

  // Función para actualizar la meta del negocio
  const updateBusinessGoal = async () => {
    if (!selectedClub?._id) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/dashboard/business-goals`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ club: selectedClub._id, sales_goal: newGoal }),
      });
      if (!response.ok) throw new Error('Error al actualizar la meta');
      const data = await response.json();
      // Actualizamos la meta en el estado
      setBusinessGoal((prev) =>
        prev ? { ...prev, target: data.sales_goal } : prev
      );
      setIsEditingGoal(false);
    } catch (error) {
      console.error('Error updating business goal:', error);
    }
  };

  const handleClubChange = (club: Club) => {
    setSelectedClub(club);
    setShowClubSelector(false);
  };

  // Calcular el porcentaje completado de la meta
  const progressPercentage = businessGoal && businessGoal.target > 0
    ? Math.min(100, Math.round((businessGoal.progress / businessGoal.target) * 100))
    : 0;
  const missingAmount = businessGoal
    ? Math.max(businessGoal.target - businessGoal.progress, 0)
    : 0;

  // Configurar datos del gráfico según chartType
  let renderedChart = null;
  if (chartData) {
    if (chartType === 'Ventas vs. Gastos') {
      const data = {
        labels: (chartData as ChartDataVentasGastos).labels,
        datasets: [
          {
            label: 'Ventas',
            data: (chartData as ChartDataVentasGastos).sales,
            borderColor: 'blue',
            backgroundColor: 'rgba(0, 0, 255, 0.1)',
            tension: 0.4,
          },
          {
            label: 'Gastos',
            data: (chartData as ChartDataVentasGastos).expenses,
            borderColor: 'red',
            backgroundColor: 'rgba(255, 0, 0, 0.1)',
            tension: 0.4,
          },
        ],
      };
      renderedChart = <Line data={data} />;
    } else if (chartType === 'Productos Más Vendidos') {
      const data = {
        labels: (chartData as ChartDataProductos).labels,
        datasets: [
          {
            label: 'Cantidad Vendida',
            data: (chartData as ChartDataProductos).values,
            backgroundColor: 'rgba(75,192,192,0.6)',
          },
        ],
      };
      renderedChart = <Bar data={data} />;
    }
  }

  return (
    <div>
      <Header userName={user ? user.fullName : 'Usuario'} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Club Selector */}
        <div className="mb-8">
          <div className="flex items-center justify-between bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center space-x-3">
              <Building2 className="h-6 w-6 text-[#2A5C9A]" />
              <div>
                <p className="text-sm text-gray-500">Club Actual</p>
                <h2 className="text-xl font-semibold text-gray-900">
                  {selectedClub ? selectedClub.clubName : ''}
                </h2>
                <p className="text-sm text-gray-500">
                  {selectedClub ? selectedClub.address : ''}
                </p>
              </div>
            </div>
            <div className="relative">
              <button
                onClick={() => setShowClubSelector(!showClubSelector)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2A5C9A]"
              >
                Cambiar Club
                <ChevronDown className="ml-2 h-4 w-4" />
              </button>

              {showClubSelector && (
                <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                  <div className="py-1" role="menu">
                    {clubs.map((club) => (
                      <button
                        key={club._id}
                        onClick={() => handleClubChange(club)}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                        role="menuitem"
                      >
                        <div className="font-medium">{club.clubName}</div>
                        <div className="text-xs text-gray-500">{club.address}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* KPIs Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {kpiData.length > 0 ? (
            kpiData.map((kpi, index) => (
              <KPICard
                key={index}
                title={kpi.title}
                value={kpi.value}
                icon={kpi.icon}
                trend={kpi.trend}
                color={kpi.color}
              />
            ))
          ) : (
            <p>Cargando KPIs...</p>
          )}
        </div>

        {/* Charts Section */}
        <div className="mt-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Análisis de Ventas
              </h3>
              <div className="flex space-x-4">
                <select
                  value={chartType}
                  onChange={(e) => setChartType(e.target.value)}
                  className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  <option value="Ventas vs. Gastos">Ventas vs. Gastos</option>
                  <option value="Productos Más Vendidos">Productos Más Vendidos</option>
                </select>
                <select
                  value={timePeriod}
                  onChange={(e) => setTimePeriod(e.target.value)}
                  className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  <option value="7d">Últimos 7 días</option>
                  <option value="1m">Último mes</option>
                  <option value="1y">Último año</option>
                </select>
              </div>
            </div>
            <div className="h-80 flex items-center justify-center bg-gray-50 rounded">
              {chartData ? (
                renderedChart
              ) : (
                <p className="text-gray-500">Cargando gráfico...</p>
              )}
            </div>
          </div>
        </div>

        {/* Business Goals Section */}
        <div className="mt-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
          Meta del Negocio
              </h3>
              {isEditingGoal ? null : (
          <button
            className="text-sm font-medium text-[#2A5C9A] hover:text-[#1e4474]"
            onClick={() => setIsEditingGoal(true)}
          >
            Editar Meta
          </button>
              )}
            </div>
            <div>
              {businessGoal ? (
          <>
            <p className="text-sm text-gray-600">Meta de Ventas: ${businessGoal.target}</p>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-[#28A745] h-2.5 rounded-full"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <p className="mt-2 text-sm text-gray-600">
              {progressPercentage}% completado - Falta ${missingAmount}
            </p>
            {isEditingGoal && (
              <div className="mt-4">
                <input
            type="number"
            className="border border-gray-300 rounded p-2 mr-2"
            value={newGoal}
            onChange={(e) => setNewGoal(parseFloat(e.target.value))}
                />
                <button
            className="px-3 py-1 bg-blue-500 text-white rounded mr-2"
            onClick={updateBusinessGoal}
                >
            Guardar
                </button>
                <button
            className="px-3 py-1 bg-gray-300 text-black rounded"
            onClick={() => {
              setIsEditingGoal(false);
              setNewGoal(businessGoal.target);
            }}
                >
            Cancelar
                </button>
              </div>
            )}
          </>
              ) : (
          <p className="text-sm text-gray-600">Cargando meta del negocio...</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}





