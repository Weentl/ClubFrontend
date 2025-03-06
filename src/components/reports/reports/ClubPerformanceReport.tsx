// reports/ClubPerformanceReport.tsx
import { useState, useEffect } from 'react';
import { Search, Filter, Store } from 'lucide-react';
import ClubSelector from './ClubSelector';
import { useAuthFetch } from '../../utils/authFetch';

interface ClubData {
  id: string;
  name: string;
  address: string;
  sales: number;
  expenses: number;
  profit: number;
  employees: number; // Aunque se mantiene en la data, no se muestra
  customers: number;
  inventory: number;
  salesChange: number;
  isActive: boolean;
}

interface ClubPerformanceReportData {
  clubsData: ClubData[];
}

interface ClubPerformanceReportProps {
  period: 'weekly' | 'monthly' | 'yearly';
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function ClubPerformanceReport({ period }: ClubPerformanceReportProps) {
  const [data, setData] = useState<ClubPerformanceReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');
  const [selectedClub, setSelectedClub] = useState<string | null>('global');
  const authFetch = useAuthFetch();

  useEffect(() => {
    setLoading(true);
    let url = `${API_BASE_URL}/api/reports?type=club-performance&period=${period}`;
    if (selectedClub) {
      url += `&club=${selectedClub}`;
    }
    authFetch(url)
      .then((res) => res.json())
      .then((fetchedData: ClubPerformanceReportData) => {
        setData(fetchedData);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching club performance data:', err);
        setLoading(false);
      });
  }, [period, selectedClub]);

  if (loading) return <p>Cargando datos...</p>;
  if (!data) return <p>Error al cargar datos.</p>;

  const clubsData = data.clubsData;

  // Filtrar datos según búsqueda y estado
  const filteredClubs = clubsData.filter((club) =>
    club.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (filterActive === 'all' ||
      (filterActive === 'active' && club.isActive) ||
      (filterActive === 'inactive' && !club.isActive))
  );

  // Indicadores globales
  const totalSales = clubsData.reduce((sum, club) => sum + club.sales, 0);
  const totalProfit = clubsData.reduce((sum, club) => sum + club.profit, 0);

  // Club con mayores ventas
  const topClub = clubsData.length > 0 
    ? clubsData.reduce((prev, current) => (prev.sales > current.sales ? prev : current))
    : null;

  return (
    <div className="p-6">
      {/* Encabezado */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Desempeño por Club</h2>
        <div className="flex flex-col items-end">
          <span className="text-sm text-gray-500">
            {period === 'weekly'
              ? 'Semana actual'
              : period === 'monthly'
              ? 'Mes actual'
              : 'Año actual'}
          </span>
          <ClubSelector onClubChange={setSelectedClub} />
        </div>
      </div>

      {/* Tarjetas de indicadores */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border rounded-lg shadow-sm p-4">
          <p className="text-sm font-medium text-gray-500">Ventas Totales</p>
          <p className="mt-1 text-2xl font-semibold text-green-600">${totalSales.toLocaleString()}</p>
        </div>
        <div className="bg-white border rounded-lg shadow-sm p-4">
          <p className="text-sm font-medium text-gray-500">Ganancias Totales</p>
          <p className="mt-1 text-2xl font-semibold text-blue-600">${totalProfit.toLocaleString()}</p>
        </div>
        <div className="bg-white border rounded-lg shadow-sm p-4">
          <p className="text-sm font-medium text-gray-500">Club Líder</p>
          {topClub ? (
            <>
              <p className="mt-1 text-lg font-semibold text-gray-900">{topClub.name}</p>
              <p className="text-sm text-gray-500">${topClub.sales.toLocaleString()} en ventas</p>
            </>
          ) : (
            <p className="mt-1 text-sm text-gray-500">Sin datos</p>
          )}
        </div>
      </div>

      {/* Comparativa de Clubs */}
      <div className="bg-white border rounded-lg shadow-sm p-4 mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Comparativa de Clubs</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Club
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ventas
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gastos
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ganancia
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {clubsData.filter(club => club.isActive).map((club, index) => (
                <tr key={index}>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Store className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-900">{club.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    ${club.sales.toLocaleString()}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    ${club.expenses.toLocaleString()}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-right">
                    <span className={`text-sm ${club.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ${club.profit.toLocaleString()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detalle de Clubs */}
      <div className="bg-white border rounded-lg shadow-sm p-4">
        <div className="flex flex-wrap justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Detalle de Clubs</h3>
          <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar club..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
            <div className="relative inline-block">
              <div className="flex items-center border border-gray-300 rounded-md shadow-sm bg-white">
                <div className="px-3 py-2 border-r border-gray-300">
                  <Filter className="h-4 w-4 text-gray-400" />
                </div>
                <select
                  value={filterActive}
                  onChange={(e) => setFilterActive(e.target.value as 'all' | 'active' | 'inactive')}
                  className="block w-full pl-3 pr-10 py-2 text-sm border-0 focus:outline-none focus:ring-0 rounded-md"
                >
                  <option value="all">Todos los Clubs</option>
                  <option value="active">Solo activos</option>
                  <option value="inactive">Solo inactivos</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Club
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dirección
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ventas
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gastos
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ganancia
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredClubs.map((club, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Store className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-900">{club.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {club.address}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    ${club.sales.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    ${club.expenses.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className={`text-sm ${club.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ${club.profit.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      club.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {club.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}





