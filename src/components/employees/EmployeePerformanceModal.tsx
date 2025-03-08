import React, { useState, useEffect } from 'react';
import { X, Calendar, TrendingUp, DollarSign, Clock, Activity } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthFetch } from '../utils/authFetch';


interface Employee {
  id: string;
  code: string;
  name: string;
  email: string;
  phone?: string;
  role: 'cashier' | 'manager' | 'warehouse' | 'custom';
  permissions: string[];
  photo_url?: string;
  last_login?: string;
  status: 'active' | 'inactive';
  created_at: string;
}

interface SalesData {
  date: string;
  amount: number;
  count: number;
}

interface ActivityData {
  date: string;
  action: string;
  details: string;
}

interface Props {
  employee: Employee;
  onClose: () => void;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function EmployeePerformanceModal({ employee, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<'sales' | 'activity'>('sales');
  const [period, setPeriod] = useState<'week' | 'month' | 'quarter'>('week');
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [activityData, setActivityData] = useState<ActivityData[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSales: 0,
    avgTicket: 0,
    totalTransactions: 0,
    hoursWorked: 0,
  });

  const authFetch = useAuthFetch();

  useEffect(() => {
    loadPerformanceData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period, employee.id]);

  const loadPerformanceData = async () => {
    try {
      setLoading(true);
      // Se utiliza authFetch y API_BASE_URL para la conexión segura
      const response = await authFetch(`${API_BASE_URL}/api/employees/${employee.id}/performance?period=${period}`);
      const data = await response.json();
      
      setSalesData(data.sales || []);
      setActivityData(data.activity || []);
      setStats({
        totalSales: data.stats?.totalSales || 0,
        avgTicket: data.stats?.avgTicket || 0,
        totalTransactions: data.stats?.totalTransactions || 0,
        hoursWorked: data.stats?.hoursWorked || 0,
      });
    } catch (error) {
      console.error('Error loading performance data:', error);
      toast.error('Error al cargar los datos de desempeño');
    } finally {
      setLoading(false);
    }
  };

  const renderSalesChart = () => {
    const maxSales = Math.max(...salesData.map(day => day.amount));
    
    return (
      <div className="mt-4">
        <div className="flex items-end space-x-2 h-40">
          {salesData.map((day, index) => (
            <div key={index} className="flex flex-col items-center flex-1">
              <div 
                className="w-full bg-blue-500 rounded-t"
                style={{ 
                  height: `${(day.amount / maxSales) * 100}%`,
                  minHeight: day.amount > 0 ? '4px' : '0'
                }}
              ></div>
              <div className="text-xs text-gray-500 mt-1 truncate max-w-full">
                {new Date(day.date).toLocaleDateString(undefined, { weekday: 'short' })}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderActivityList = () => {
    return (
      <div className="mt-4">
        <div className="space-y-3">
          {activityData.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No hay actividad registrada en este período.</p>
          ) : (
            activityData.map((activity, index) => (
              <div key={index} className="border-l-2 border-blue-500 pl-3 py-1">
                <p className="text-sm font-medium">{activity.action}</p>
                <p className="text-xs text-gray-500">{activity.details}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(activity.date).toLocaleString()}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4">
        <div className="flex justify-between items-center p-4 border-b">
          <div className="flex items-center">
            {employee.photo_url ? (
              <img 
                src={employee.photo_url} 
                alt={employee.name} 
                className="h-10 w-10 rounded-full mr-3"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                <span className="text-gray-500 font-medium">
                  {employee.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </span>
              </div>
            )}
            <div>
              <h3 className="text-lg font-medium">{employee.name}</h3>
              <p className="text-sm text-gray-500">
                {employee.role === 'cashier'
                  ? 'Cajero'
                  : employee.role === 'manager'
                  ? 'Gerente'
                  : employee.role === 'warehouse'
                  ? 'Almacenista'
                  : 'Personalizado'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="flex items-center text-blue-500 mb-1">
                <DollarSign className="h-5 w-5 mr-1" />
                <span className="text-sm font-medium">Ventas</span>
              </div>
              <p className="text-xl font-bold">${stats.totalSales.toLocaleString()}</p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="flex items-center text-green-500 mb-1">
                <TrendingUp className="h-5 w-5 mr-1" />
                <span className="text-sm font-medium">Ticket promedio</span>
              </div>
              <p className="text-xl font-bold">${stats.avgTicket.toLocaleString()}</p>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <div className="flex items-center text-purple-500 mb-1">
                <Activity className="h-5 w-5 mr-1" />
                <span className="text-sm font-medium">Transacciones</span>
              </div>
              <p className="text-xl font-bold">{stats.totalTransactions}</p>
            </div>
            <div className="bg-amber-50 p-3 rounded-lg">
              <div className="flex items-center text-amber-500 mb-1">
                <Clock className="h-5 w-5 mr-1" />
                <span className="text-sm font-medium">Horas</span>
              </div>
              <p className="text-xl font-bold">{stats.hoursWorked}</p>
            </div>
          </div>

          {/* Selección de período */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex">
              <button
                className={`px-3 py-1 text-sm rounded-md mr-2 ${activeTab === 'sales' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}
                onClick={() => setActiveTab('sales')}
              >
                Ventas
              </button>
              <button
                className={`px-3 py-1 text-sm rounded-md ${activeTab === 'activity' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}
                onClick={() => setActiveTab('activity')}
              >
                Actividad
              </button>
            </div>
            <div className="flex items-center text-sm bg-gray-100 rounded-md">
              <button
                className={`px-3 py-1 rounded-l-md ${period === 'week' ? 'bg-blue-100 text-blue-700' : ''}`}
                onClick={() => setPeriod('week')}
              >
                Semana
              </button>
              <button
                className={`px-3 py-1 ${period === 'month' ? 'bg-blue-100 text-blue-700' : ''}`}
                onClick={() => setPeriod('month')}
              >
                Mes
              </button>
              <button
                className={`px-3 py-1 rounded-r-md ${period === 'quarter' ? 'bg-blue-100 text-blue-700' : ''}`}
                onClick={() => setPeriod('quarter')}
              >
                Trimestre
              </button>
            </div>
          </div>

          {loading ? (
            <div className="h-52 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div>
              {activeTab === 'sales' ? renderSalesChart() : renderActivityList()}
            </div>
          )}
        </div>

        <div className="bg-gray-50 px-6 py-4 rounded-b-lg border-t">
          <p className="text-sm text-gray-500">
            <Calendar className="inline h-4 w-4 mr-1" />
            Empleado desde: {new Date(employee.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}
