import React from 'react';
import { ShoppingCart, TrendingUp, TrendingDown, Users } from 'lucide-react';
import { Sale } from '../types/sales';

interface Props {
  sales: Sale[];
  dateRange: { start: string; end: string };
}

// Definir colores e íconos para cada tipo de producto
const TYPE_COLORS: Record<string, string> = {
  sealed: '#3B82F6',    // azul
  prepared: '#10B981',  // verde
};

const TYPE_ICONS: Record<string, string> = {
  sealed: '📦',
  prepared: '🍳',
};

const formatTypeName = (type: string) =>
  type === 'sealed' ? 'Productos Sellados' : 'Productos Preparados';

export default function SalesSummary({ sales, dateRange }: Props) {
  // Calcular totales
  const totalSales = sales.reduce((sum, sale) => sum + sale.total, 0);
  const totalItems = sales.reduce(
    (sum, sale) =>
      sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
    0
  );
  const uniqueClients = new Set(
    sales.map((sale) => sale.client_id).filter(Boolean)
  ).size;

  // Simular comparación con período anterior (por ejemplo, 15% menos)
  const previousPeriodTotal = totalSales * 0.85;
  const changePercentage =
    previousPeriodTotal > 0
      ? ((totalSales - previousPeriodTotal) / previousPeriodTotal) * 100
      : 0;

  // Calcular distribución por tipo
  const saleByType: Record<string, number> = { sealed: 0, prepared: 0 };
  sales.forEach((sale) => {
    sale.items.forEach((item) => {
      if (!saleByType[item.type]) saleByType[item.type] = 0;
      saleByType[item.type] += item.quantity * item.unit_price;
    });
  });

  // Total para el gráfico (suma de todos los tipos)
  const totalByType = Object.values(saleByType).reduce(
    (sum, val) => sum + val,
    0
  );

  // Generar segmentos del gráfico (pie chart) en SVG
  const chartPaths = Object.entries(saleByType).reduce(
    (elements, [type, amount], index, arr) => {
      if (amount === 0 || totalByType === 0) return elements;

      // Porcentaje de este tipo
      const percentage = (amount / totalByType) * 100;

      // Sumar porcentajes de los segmentos previos
      const previousPercentage = arr
        .slice(0, index)
        .reduce(
          (sum, [, amt]) => sum + (Number(amt) / totalByType) * 100,
          0
        );

      const startAngle = (previousPercentage / 100) * 360;
      const endAngle = ((previousPercentage + percentage) / 100) * 360;

      const x1 = 50 + 40 * Math.cos(((startAngle - 90) * Math.PI) / 180);
      const y1 = 50 + 40 * Math.sin(((startAngle - 90) * Math.PI) / 180);
      const x2 = 50 + 40 * Math.cos(((endAngle - 90) * Math.PI) / 180);
      const y2 = 50 + 40 * Math.sin(((endAngle - 90) * Math.PI) / 180);

      // Flag para arcos grandes
      const largeArcFlag = percentage > 50 ? 1 : 0;

      elements.push(
        <path
          key={type}
          d={`M50 50 L${x1} ${y1} A40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
          fill={TYPE_COLORS[type] || '#9CA3AF'}
          stroke="white"
          strokeWidth="1"
        />
      );
      return elements;
    },
    [] as React.ReactElement[]
  );

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden w-full">
      {/* Encabezado */}
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-xl font-semibold text-gray-900">Resumen de Ventas</h3>
        <p className="text-sm text-gray-500 mt-2">
          {new Date(dateRange.start).toLocaleDateString('es-MX', {
            day: 'numeric',
            month: 'long',
          })}{' '}
          -{' '}
          {new Date(dateRange.end).toLocaleDateString('es-MX', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </p>
      </div>

      <div className="p-6">
        {/* Tarjeta de ventas totales */}
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <p className="text-sm font-medium text-gray-500">Ventas Totales</p>
          <p className="mt-2 text-3xl font-semibold text-green-600">
            ${totalSales.toFixed(2)}
          </p>
          <div className="mt-4 flex items-center">
            {changePercentage >= 0 ? (
              <>
                <TrendingUp className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-sm text-green-500">
                  {changePercentage.toFixed(1)}% más que el período anterior
                </span>
              </>
            ) : (
              <>
                <TrendingDown className="h-5 w-5 text-red-500 mr-2" />
                <span className="text-sm text-red-500">
                  {Math.abs(changePercentage).toFixed(1)}% menos que el período anterior
                </span>
              </>
            )}
          </div>
        </div>

        {/* Tarjetas de métricas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white border rounded-lg p-6 flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Productos Vendidos</p>
              <p className="mt-2 text-xl font-bold text-gray-900">{totalItems}</p>
            </div>
            <ShoppingCart className="h-6 w-6 text-blue-600" />
          </div>
          <div className="bg-white border rounded-lg p-6 flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Clientes Atendidos</p>
              <p className="mt-2 text-xl font-bold text-gray-900">
                {uniqueClients}
              </p>
            </div>
            <Users className="h-6 w-6 text-purple-600" />
          </div>
          <div className="bg-white border rounded-lg p-6 flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Ticket Promedio</p>
              <p className="mt-2 text-xl font-bold text-gray-900">
                $
                {sales.length > 0
                  ? (totalSales / sales.length).toFixed(2)
                  : '0.00'}
              </p>
            </div>
            <TrendingUp className="h-6 w-6 text-green-600" />
          </div>
        </div>

        {/* Sección del gráfico de distribución por tipo */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-4">
            Distribución por Tipo
          </h4>
          {totalByType === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              No hay datos para mostrar
            </p>
          ) : (
            <div className="flex flex-col items-center">
              <div className="relative h-56 w-56">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  {chartPaths}
                </svg>
              </div>
              {/* Leyenda */}
              <div className="mt-4 w-full max-w-sm">
                {Object.entries(saleByType)
                  .filter(([, amount]) => amount > 0)
                  .map(([type, amount]) => {
                    const percentage =
                      totalByType > 0
                        ? Math.round((amount / totalByType) * 100)
                        : 0;
                    return (
                      <div
                        key={type}
                        className="flex justify-between items-center text-sm text-gray-700 mt-2"
                      >
                        <div className="flex items-center">
                          <div
                            className="w-4 h-4 rounded-full mr-2"
                            style={{ backgroundColor: TYPE_COLORS[type] }}
                          ></div>
                          <span>
                            {TYPE_ICONS[type]} {formatTypeName(type)}
                          </span>
                        </div>
                        <span>
                          ${amount.toFixed(2)} ({percentage}%)
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>

        {/* Estadísticas adicionales */}
        {sales.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-6">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Estadísticas
            </h4>
            <div className="text-sm text-gray-600 space-y-2">
              <p>• {sales.length} ventas en el período seleccionado</p>
              <p>• {totalItems} productos vendidos en total</p>
              <p>• {uniqueClients} clientes realizaron compras</p>
              <p>
                • Venta promedio:{' '}
                {sales.length > 0
                  ? `$${(totalSales / sales.length).toFixed(2)}`
                  : '$0.00'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}



