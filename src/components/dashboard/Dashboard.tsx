import { useState, useEffect, useMemo } from 'react';
import {
  ShoppingCart,
  AlertTriangle,
  DollarSign,
  Store,
  ChevronDown,
  Building2,
  Info,
  X
} from 'lucide-react';
import Header from './Header';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
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
  ArcElement,
} from 'chart.js';
import { useAuthFetch } from '../utils/authFetch';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
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

interface KPI {
  title: string;
  value: string | number;
  icon: any;
  trend?: { value: number; isPositive: boolean };
  color: string;
  description: string; // Añadida descripción para los tooltips
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Dashboard() {
  const authFetch = useAuthFetch();
  const [showClubSelector, setShowClubSelector] = useState(false);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
  const [kpiData, setKpiData] = useState<KPI[]>([]);
  const [chartData, setChartData] = useState<ChartDataVentasGastos | ChartDataProductos | null>(null);
  const [chartType, setChartType] = useState<string>('Ventas vs. Gastos');
  const [timePeriod, setTimePeriod] = useState<string>('7d');
  const [businessGoal, setBusinessGoal] = useState<BusinessGoal | null>(null);
  const [isEditingGoal, setIsEditingGoal] = useState<boolean>(false);
  const [newGoal, setNewGoal] = useState<number>(0);
  const [activeTooltip, setActiveTooltip] = useState<number | null>(null);

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
      const response = await authFetch(`${API_BASE_URL}/api/clubs?user=${userId}`);
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
      const response = await authFetch(
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
          description: 'Total de todas las ventas realizadas hoy. Una cantidad más alta que ayer indica un buen día de ventas.'
        },
        {
          title: 'Productos Bajos en Stock',
          value: data.productosBajosStock,
          icon: AlertTriangle,
          color: 'yellow',
          description: 'Número de productos que necesitan reabastecerse pronto. Un número alto indica que es necesario hacer pedidos a proveedores.'
        },
        {
          title: 'Ganancias Mensuales',
          value: `$${data.gananciasMensuales.toFixed(2)}`,
          icon: DollarSign,
          trend: { value: 8, isPositive: true },
          color: 'green',
          description: 'Dinero que queda después de restar todos los gastos a las ventas de este mes. Es lo que realmente gana su negocio.'
        },
        {
          title: 'Clubs Activos',
          value: data.clubsActivos,
          icon: Store,
          color: 'purple',
          description: 'Número total de locales o sucursales que están actualmente en operación.'
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
      const response = await authFetch(
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
      const response = await authFetch(
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
      const response = await authFetch(`${API_BASE_URL}/api/dashboard/business-goals`, {
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

  // Toggle tooltip
  const toggleTooltip = (index: number) => {
    if (activeTooltip === index) {
      setActiveTooltip(null);
    } else {
      setActiveTooltip(index);
    }
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
  let chartExplanation = "";

  if (chartData) {
    if (chartType === 'Ventas vs. Gastos') {
      chartExplanation = "Esta gráfica muestra cuánto dinero entró a su negocio (línea azul) y cuánto dinero salió (línea roja) durante el período seleccionado. Cuando la línea azul está por encima de la roja, significa que está ganando dinero.";
      
      const data = {
        labels: (chartData as ChartDataVentasGastos).labels,
        datasets: [
          {
            label: 'Ventas',
            data: (chartData as ChartDataVentasGastos).sales,
            borderColor: '#4287f5',
            backgroundColor: 'rgba(66, 135, 245, 0.1)',
            tension: 0.4,
            borderWidth: 3,
            pointRadius: 4,
            pointBackgroundColor: '#4287f5',
          },
          {
            label: 'Gastos',
            data: (chartData as ChartDataVentasGastos).expenses,
            borderColor: '#ff6666',
            backgroundColor: 'rgba(255, 102, 102, 0.1)',
            tension: 0.4,
            borderWidth: 3,
            pointRadius: 4,
            pointBackgroundColor: '#ff6666',
          },
        ],
      };
      
      const options = {
        plugins: {
          legend: {
            position: 'top' as const,
            labels: {
              font: {
                size: 14,
              },
              padding: 20,
            },
          },
          tooltip: {
            titleFont: {
              size: 16,
            },
            bodyFont: {
              size: 14,
            },
            callbacks: {
              label: function(context: any) {
                return `${context.dataset.label}: $${context.raw}`;
              }
            }
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value: any) {
                return '$' + value;
              }
            }
          }
        },
        responsive: true,
        maintainAspectRatio: false,
      };
      
      renderedChart = <Line data={data} options={options} />;
    } else if (chartType === 'Productos Más Vendidos') {
      chartExplanation = "Esta gráfica muestra qué productos se están vendiendo más en su negocio. Las barras más altas representan los productos que tienen mayor demanda.";
      
      // Usar colores más vibrantes y consistentes para el gráfico de barras
      const backgroundColors = [
        'rgba(75, 192, 192, 0.7)',
        'rgba(54, 162, 235, 0.7)',
        'rgba(153, 102, 255, 0.7)',
        'rgba(255, 159, 64, 0.7)',
        'rgba(255, 99, 132, 0.7)',
        'rgba(255, 206, 86, 0.7)',
        'rgba(75, 192, 192, 0.7)',
        'rgba(54, 162, 235, 0.7)',
        'rgba(153, 102, 255, 0.7)',
        'rgba(255, 159, 64, 0.7)',
      ];
      
      const data = {
        labels: (chartData as ChartDataProductos).labels,
        datasets: [
          {
            label: 'Cantidad Vendida',
            data: (chartData as ChartDataProductos).values,
            backgroundColor: backgroundColors.slice(0, (chartData as ChartDataProductos).labels.length),
            borderWidth: 1,
          },
        ],
      };
      
      const options = {
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            titleFont: {
              size:
              16,
            },
            bodyFont: {
              size: 14,
            }
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Cantidad Vendida',
              font: {
                size: 14,
              }
            }
          },
          x: {
            title: {
              display: true,
              text: 'Productos',
              font: {
                size: 14,
              }
            }
          }
        },
        responsive: true,
        maintainAspectRatio: false,
      };
      
      renderedChart = <Bar data={data} options={options} />;
    }
  }

  // Configurar gráfico circular para la meta de negocio
  const goalChartData = {
    labels: ['Completado', 'Pendiente'],
    datasets: [
      {
        data: [progressPercentage, 100 - progressPercentage],
        backgroundColor: [
          'rgba(40, 167, 69, 0.8)',
          'rgba(220, 220, 220, 0.8)',
        ],
        borderColor: [
          'rgba(40, 167, 69, 1)',
          'rgba(220, 220, 220, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const goalChartOptions = {
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `${context.label}: ${context.raw}%`;
          }
        }
      }
    },
    responsive: true,
    cutout: '70%',
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header userName={user ? user.fullName : 'Usuario'} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Club Selector */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center space-x-3 mb-4 sm:mb-0">
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
                className="w-full sm:w-auto inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2A5C9A]"
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
              <div key={index} className="relative">
                <div className="bg-white rounded-lg shadow p-4 h-full">
                  <div className="flex justify-between items-start">
                    <div className={`p-3 rounded-full bg-${kpi.color}-100 text-${kpi.color}-600`}>
                      <kpi.icon className="h-6 w-6" />
                    </div>
                    <button 
                      onClick={() => toggleTooltip(index)}
                      className="text-gray-400 hover:text-gray-600 focus:outline-none"
                      aria-label="Mostrar información"
                    >
                      <Info className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-500 truncate">
                      {kpi.title}
                    </p>
                    <p className="mt-1 text-3xl font-semibold text-gray-900">
                      {kpi.value}
                    </p>
                    {kpi.trend && (
                      <p className={`mt-1 text-sm ${kpi.trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                        {kpi.trend.isPositive ? '↑' : '↓'} {kpi.trend.value}%
                      </p>
                    )}
                  </div>

                  {/* Tooltip/popup con información */}
                  {activeTooltip === index && (
                    <div className="absolute z-10 top-full left-0 right-0 mt-2 p-4 bg-white rounded-lg shadow-lg border border-gray-200">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-gray-900">{kpi.title}</h4>
                        <button onClick={() => setActiveTooltip(null)} className="text-gray-400 hover:text-gray-600">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="text-sm text-gray-700">{kpi.description}</p>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full flex justify-center p-8">
              <p className="text-gray-500">Cargando información...</p>
            </div>
          )}
        </div>

        {/* Charts Section */}
        <div className="mt-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex flex-col space-y-4 mb-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-lg font-medium text-gray-900 mb-2 sm:mb-0">
                  Análisis de Ventas
                </h3>
                <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-4">
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
              
              {/* Explicación de la gráfica */}
              <div className="bg-blue-50 p-3 rounded-md text-blue-800 text-sm">
                <div className="flex items-start">
                  <Info className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                  <p>{chartExplanation}</p>
                </div>
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
                <div className="flex flex-col md:flex-row md:space-x-8 items-center">
                  <div className="w-40 h-40 mb-4 md:mb-0">
                    <Doughnut data={goalChartData} options={goalChartOptions} />
                    <div className="relative bottom-24 flex justify-center items-center">
                      <span className="text-3xl font-bold">{progressPercentage}%</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="bg-blue-50 p-3 rounded-md text-blue-800 text-sm mb-4">
                      <div className="flex items-start">
                        <Info className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                        <p>Esta es su meta de ventas del mes. El porcentaje muestra cuánto ha avanzado hacia el objetivo establecido.</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">Meta de Ventas: <span className="font-semibold">${businessGoal.target}</span></p>
                    <p className="text-sm text-gray-600 mb-1">Ventas actuales: <span className="font-semibold">${businessGoal.progress}</span></p>
                    <p className="text-sm text-gray-600">
                      Falta <span className="font-semibold">${missingAmount}</span> para alcanzar la meta
                    </p>
                    
                    {isEditingGoal && (
                      <div className="mt-4">
                        <label htmlFor="newGoal" className="block text-sm font-medium text-gray-700 mb-1">
                          Nueva meta de ventas
                        </label>
                        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                          <input
                            id="newGoal"
                            type="number"
                            className="border border-gray-300 rounded p-2"
                            value={newGoal}
                            onChange={(e) => setNewGoal(parseFloat(e.target.value))}
                          />
                          <div className="flex space-x-2">
                            <button
                              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                              onClick={updateBusinessGoal}
                            >
                              Guardar
                            </button>
                            <button
                              className="px-3 py-1 bg-gray-300 text-black rounded hover:bg-gray-400"
                              onClick={() => {
                                setIsEditingGoal(false);
                                setNewGoal(businessGoal.target);
                              }}
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
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





