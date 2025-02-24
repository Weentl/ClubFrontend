// Dashboard.tsx
import { ShoppingCart, AlertTriangle, DollarSign, Store } from 'lucide-react';
import Header from './Header';
import Sidebar from '../global/Sidebar';
import KPICard from './KPICard';

export default function Dashboard() {
  const kpiData = [
    {
      title: 'Ventas Hoy',
      value: '$2,500',
      icon: ShoppingCart,
      trend: { value: 12, isPositive: true },
      color: 'blue'
    },
    {
      title: 'Productos Bajos en Stock',
      value: '8',
      icon: AlertTriangle,
      color: 'yellow'
    },
    {
      title: 'Ganancias Mensuales',
      value: '$45,000',
      icon: DollarSign,
      trend: { value: 8, isPositive: true },
      color: 'green'
    },
    {
      title: 'Clubs Activos',
      value: '3',
      icon: Store,
      color: 'purple'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar />
      <div className="pl-64">
        <Header userName="Juan Pérez" />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* KPIs */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {kpiData.map((kpi, index) => (
              <KPICard
                key={index}
                title={kpi.title}
                value={kpi.value}
                icon={kpi.icon}
                trend={kpi.trend}
                color={kpi.color}
              />
            ))}
          </div>

          {/* Charts Section */}
          <div className="mt-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Análisis de Ventas</h3>
                <div className="flex space-x-4">
                  <select className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm">
                    <option>Ventas vs. Gastos</option>
                    <option>Productos Más Vendidos</option>
                  </select>
                  <select className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm">
                    <option>Últimos 7 días</option>
                    <option>Último mes</option>
                    <option>Último año</option>
                  </select>
                </div>
              </div>
              <div className="h-80 flex items-center justify-center bg-gray-50 rounded">
                {/* Chart will be implemented here */}
                <p className="text-gray-500">Gráfico de análisis</p>
              </div>
            </div>
          </div>

          {/* Business Goals */}
          <div className="mt-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Meta del Negocio</h3>
                <button className="text-sm font-medium text-[#2A5C9A] hover:text-[#1e4474]">
                  Editar Meta
                </button>
              </div>
              <div>
                <p className="text-sm text-gray-600">Meta: vender $1000</p>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-[#28A745] h-2.5 rounded-full" style={{ width: '70%' }}></div>
                </div>
                <p className="mt-2 text-sm text-gray-600">70% completado</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}