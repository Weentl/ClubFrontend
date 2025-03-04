import { useState, useEffect } from 'react';
import moment from 'moment-timezone';
import 'moment/locale/es'; // Configuramos moment en español
import { Search, Filter, DollarSign, Package, Coffee } from 'lucide-react';
import ClubSelector from './ClubSelector';
import ProductMarginChart from './ProductMarginChart';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface ProductData {
  id: string;
  name: string;
  type: 'sealed' | 'prepared';
  cost: number;
  price: number;
  margin: number;
  marginPercentage: number;
  sales: number;
  totalProfit: number;
}

interface ProductMarginReportData {
  productsData: ProductData[];
  avgMarginPercentage: number;
  totalProfit: number;
  mostProfitableProduct: ProductData;
  highestProfitProduct: ProductData;
}

interface ProductMarginReportProps {
  period: 'weekly' | 'monthly' | 'yearly';
}

export default function ProductMarginReport({ period }: ProductMarginReportProps) {
  const [data, setData] = useState<ProductMarginReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState<'margin' | 'sales' | 'profit'>('margin');
  const [clubId, setClubId] = useState<string | null>('global');

  // Estado para la fecha actual y cálculo de rango según período
  const mexicoTz = "America/Mexico_City";
  const [currentDate, setCurrentDate] = useState(() => moment.tz(mexicoTz));

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

  const periodLabel =
    period === 'weekly'
      ? `${startDate.format('DD/MM/YYYY')} - ${endDate.format('DD/MM/YYYY')}`
      : period === 'monthly'
      ? `${startDate.format('DD/MM/YYYY')} - ${endDate.format('DD/MM/YYYY')}`
      : currentDate.format('YYYY');

  // Función para recibir el club seleccionado
  const handleClubChange = (selectedClub: string | null) => {
    setClubId(selectedClub);
  };

  useEffect(() => {
    setLoading(true);
    const clubParam = clubId ? `&club=${clubId}` : '';
    fetch(`${API_BASE_URL}/api/reports?type=product-margin&period=${period}${clubParam}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then(res => res.json())
      .then((fetchedData: ProductMarginReportData) => {
        setData(fetchedData);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching product margin data:', err);
        setLoading(false);
      });
  }, [period, clubId]);

  if (loading) return <p>Cargando datos...</p>;
  if (!data) return <p>Error al cargar datos.</p>;

  const filteredProducts = data.productsData
    .filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (filterType === 'all' || product.type === filterType)
    )
    .sort((a, b) => {
      if (sortBy === 'margin') return b.marginPercentage - a.marginPercentage;
      if (sortBy === 'sales') return b.sales - a.sales;
      return b.totalProfit - a.totalProfit;
    });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Margen de Ganancia por Producto</h2>
          <span className="text-sm text-gray-500">{periodLabel}</span>
        </div>
        <ClubSelector onClubChange={handleClubChange} />
      </div>

      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border rounded-lg shadow-sm p-4">
          <p className="text-sm font-medium text-gray-500">Margen Promedio</p>
          <p className="mt-1 text-2xl font-semibold text-blue-600">{data.avgMarginPercentage.toFixed(1)}%</p>
        </div>
        <div className="bg-white border rounded-lg shadow-sm p-4">
          <p className="text-sm font-medium text-gray-500">Producto Más Rentable</p>
          <p className="mt-1 text-lg font-semibold text-gray-900">{data.mostProfitableProduct.name}</p>
          <p className="text-sm text-gray-500">Margen: {data.mostProfitableProduct.marginPercentage}%</p>
        </div>
        <div className="bg-white border rounded-lg shadow-sm p-4">
          <p className="text-sm font-medium text-gray-500">Mayor Ganancia Total</p>
          <p className="mt-1 text-lg font-semibold text-gray-900">{data.highestProfitProduct.name}</p>
          <p className="text-sm text-gray-500">${data.highestProfitProduct.totalProfit.toLocaleString()}</p>
        </div>
      </div>

      {/* Añadimos el nuevo componente de gráfica aquí */}
      <ProductMarginChart productsData={data.productsData} />

      {/* Filtros */}
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar producto..."
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
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-sm border-0 focus:outline-none focus:ring-0 rounded-md"
            >
              <option value="all">Todos los tipos</option>
              <option value="sealed">Sellados</option>
              <option value="prepared">Preparados</option>
            </select>
          </div>
        </div>
        <div className="relative inline-block">
          <div className="flex items-center border border-gray-300 rounded-md shadow-sm bg-white">
            <div className="px-3 py-2 border-r border-gray-300">
              <DollarSign className="h-4 w-4 text-gray-400" />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'margin' | 'sales' | 'profit')}
              className="block w-full pl-3 pr-10 py-2 text-sm border-0 focus:outline-none focus:ring-0 rounded-md"
            >
              <option value="margin">Ordenar por % Margen</option>
              <option value="sales">Ordenar por Ventas</option>
              <option value="profit">Ordenar por Ganancia Total</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Producto
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Costo
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Precio Venta
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Margen
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ventas
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ganancia Total
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredProducts.map((product, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {product.type === 'sealed' ? (
                      <Package className="h-5 w-5 text-gray-400 mr-2" />
                    ) : (
                      <Coffee className="h-5 w-5 text-gray-400 mr-2" />
                    )}
                    <span className="text-sm font-medium text-gray-900">
                      {product.name}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                  ${product.cost.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                  ${product.price.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="text-sm text-gray-900">${product.margin.toFixed(2)}</div>
                  <div className="text-xs text-gray-500">{product.marginPercentage}%</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                  {product.sales} unidades
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                  ${product.totalProfit.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-50">
            <tr>
              <td colSpan={5} className="px-6 py-3 text-right text-sm font-medium text-gray-900">
                Ganancia Total
              </td>
              <td className="px-6 py-3 text-right text-sm font-medium text-gray-900">
                ${filteredProducts.reduce((sum, product) => sum + product.totalProfit, 0).toLocaleString()}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}


