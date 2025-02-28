// reports/ClubPerformanceReport.tsx
import { useState, useEffect } from 'react';
import { Search, Filter, Store, Users, Package, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';

interface ClubData {
  id: string;
  name: string;
  address: string;
  sales: number;
  expenses: number;
  profit: number;
  employees: number;
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

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE_URL}/api/reports?type=club-performance&period=${period}`)
      .then((res) => res.json())
      .then((fetchedData: ClubPerformanceReportData) => {
        setData(fetchedData);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching club performance data:', err);
        setLoading(false);
      });
  }, [period]);

  if (loading) return <p>Cargando datos...</p>;
  if (!data) return <p>Error al cargar datos.</p>;

  const clubsData = data.clubsData;

  // Filtrar datos
  const filteredClubs = clubsData.filter((club) =>
    club.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (filterActive === 'all' ||
      (filterActive === 'active' && club.isActive) ||
      (filterActive === 'inactive' && !club.isActive))
  );

  // Calcular totales
  const totalSales = clubsData.reduce((sum, club) => sum + club.sales, 0);
  const totalProfit = clubsData.reduce((sum, club) => sum + club.profit, 0);
  const totalCustomers = clubsData.reduce((sum, club) => sum + club.customers, 0);

  // Club con mayores ventas
  const topClub = clubsData.reduce((prev, current) => (prev.sales > current.sales ? prev : current));

  // Valores máximos para normalización en el gráfico
  const maxSales = Math.max(...clubsData.map(club => club.sales));
  const maxProfit = Math.max(...clubsData.map(club => club.profit));
  const maxCustomers = Math.max(...clubsData.map(club => club.customers));
  const maxInventory = Math.max(...clubsData.map(club => club.inventory));
  const maxEmployees = Math.max(...clubsData.map(club => club.employees));

  const normalizeValue = (value: number, max: number) => (value / max) * 100;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Desempeño por Club</h2>
        <span className="text-sm text-gray-500">
          {period === 'weekly' ? 'Semana 20, 2024' : period === 'monthly' ? 'Mayo 2024' : '2024'}
        </span>
      </div>

      {/* Tarjetas de resumen */}
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
          <p className="mt-1 text-lg font-semibold text-gray-900">{topClub.name}</p>
          <p className="text-sm text-gray-500">${topClub.sales.toLocaleString()} en ventas</p>
        </div>
      </div>

      {/* Mapa interactivo simulado */}
      <div className="bg-white border rounded-lg shadow-sm p-4 mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Distribución Geográfica</h3>
        <div className="h-64 bg-gray-100 rounded-lg relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-gray-500">Mapa interactivo de Clubs</p>
          </div>
          {clubsData.filter(club => club.isActive).map((club, index) => {
            const positions = [
              { left: '30%', top: '40%' },
              { left: '60%', top: '30%' },
              { left: '45%', top: '60%' }
            ];
            const size = (club.sales / maxSales) * 40 + 20;
            return (
              <div
                key={index}
                className="absolute bg-blue-500 rounded-full flex items-center justify-center text-white font-bold"
                style={{
                  left: positions[index % positions.length].left,
                  top: positions[index % positions.length].top,
                  width: `${size}px`,
                  height: `${size}px`,
                  transform: 'translate(-50%, -50%)',
                  opacity: 0.8,
                  zIndex: Math.floor(club.sales)
                }}
                title={`${club.name}: $${club.sales.toLocaleString()} en ventas`}
              >
                🏪
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Gráfico de radar simulado */}
        <div className="bg-white border rounded-lg shadow-sm p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Comparativa de Métricas</h3>
          <div className="h-64 relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-48 h-48 border-2 border-gray-200 rounded-full"></div>
              <div className="absolute w-36 h-36 border-2 border-gray-200 rounded-full"></div>
              <div className="absolute w-24 h-24 border-2 border-gray-200 rounded-full"></div>
              <div className="absolute h-48 w-px bg-gray-200"></div>
              <div className="absolute w-48 h-px bg-gray-200"></div>
              <div className="absolute h-48 w-px bg-gray-200 transform rotate-45"></div>
              <div className="absolute h-48 w-px bg-gray-200 transform -rotate-45"></div>
              <div className="absolute top-0 text-xs text-gray-500 transform -translate-y-6">Ventas</div>
              <div className="absolute right-0 text-xs text-gray-500 transform translate-x-6">Clientes</div>
              <div className="absolute bottom-0 text-xs text-gray-500 transform translate-y-6">Inventario</div>
              <div className="absolute left-0 text-xs text-gray-500 transform -translate-x-6">Empleados</div>
              <div className="absolute top-0 right-0 text-xs text-gray-500 transform translate-x-4 -translate-y-4">Ganancias</div>
              <div className="absolute w-full h-full">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <polygon 
                    points={`
                      50,${50 - normalizeValue(clubsData[0].sales, maxSales) * 0.4} 
                      ${50 + normalizeValue(clubsData[0].customers, maxCustomers) * 0.3},${50 + normalizeValue(clubsData[0].customers, maxCustomers) * 0.3} 
                      50,${50 + normalizeValue(clubsData[0].inventory, maxInventory) * 0.4} 
                      ${50 - normalizeValue(clubsData[0].employees, maxEmployees) * 0.3},${50 + normalizeValue(clubsData[0].employees, maxEmployees) * 0.3}
                      ${50 + normalizeValue(clubsData[0].profit, maxProfit) * 0.3},${50 - normalizeValue(clubsData[0].profit, maxProfit) * 0.3}
                    `}
                    fill="rgba(59, 130, 246, 0.5)"
                    stroke="#3b82f6"
                    strokeWidth="1"
                  />
                </svg>
              </div>
              <div className="absolute w-full h-full">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <polygon 
                    points={`
                      50,${50 - normalizeValue(clubsData[1].sales, maxSales) * 0.4} 
                      ${50 + normalizeValue(clubsData[1].customers, maxCustomers) * 0.3},${50 + normalizeValue(clubsData[1].customers, maxCustomers) * 0.3} 
                      50,${50 + normalizeValue(clubsData[1].inventory, maxInventory) * 0.4} 
                      ${50 - normalizeValue(clubsData[1].employees, maxEmployees) * 0.3},${50 + normalizeValue(clubsData[1].employees, maxEmployees) * 0.3}
                      ${50 + normalizeValue(clubsData[1].profit, maxProfit) * 0.3},${50 - normalizeValue(clubsData[1].profit, maxProfit) * 0.3}
                    `}
                    fill="rgba(139, 92, 246, 0.5)"
                    stroke="#8b5cf6"
                    strokeWidth="1"
                  />
                </svg>
              </div>
            </div>
          </div>
          <div className="flex justify-center mt-4 space-x-6">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
              <span className="text-xs text-gray-600">{clubsData[0].name}</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-purple-500 rounded mr-2"></div>
              <span className="text-xs text-gray-600">{clubsData[1].name}</span>
            </div>
          </div>
        </div>

        {/* Tabla comparativa */}
        <div className="bg-white border rounded-lg shadow-sm p-4">
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
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Empleados
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
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      {club.employees}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Tabla detallada */}
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
                  Métricas
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
                    <div className="text-sm text-gray-900">${club.sales.toLocaleString()}</div>
                    {club.salesChange !== 0 && (
                      <div className={`text-xs ${club.salesChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {club.salesChange > 0 ? (
                          <TrendingUp className="h-3 w-3 inline mr-1" />
                        ) : (
                          <TrendingDown className="h-3 w-3 inline mr-1" />
                        )}
                        {Math.abs(club.salesChange)}%
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    ${club.expenses.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className={`text-sm ${club.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ${club.profit.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex justify-center space-x-4">
                      <div className="flex flex-col items-center">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span className="text-xs text-gray-500 mt-1">{club.employees}</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <Package className="h-4 w-4 text-gray-400" />
                        <span className="text-xs text-gray-500 mt-1">{club.inventory}</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <DollarSign className="h-4 w-4 text-gray-400" />
                        <span className="text-xs text-gray-500 mt-1">{club.customers}</span>
                      </div>
                    </div>
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
