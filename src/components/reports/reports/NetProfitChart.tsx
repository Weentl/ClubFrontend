
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Info } from 'lucide-react';

const NetProfitChart = ({ monthlySummary }) => {
  // Función para formatear números como moneda
  const formatCurrency = (value) => {
    return `$${value.toLocaleString()}`;
  };
  
  // Función para formatear nombres de meses en español
  const formatMonth = (monthLabel) => {
    // Si el formato es "mes XX", convertirlo a nombre de mes en español
    if (monthLabel && monthLabel.startsWith('mes ')) {
      const monthNum = parseInt(monthLabel.substring(4), 10);
      const monthNames = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
      ];
      // Asegurar que el índice esté dentro del rango de 1-12
      if (monthNum >= 1 && monthNum <= 12) {
        return monthNames[monthNum - 1];
      }
    }
    return monthLabel;
  };
  
  // Personalización del tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      // Formatear el nombre del mes para el tooltip
      const formattedLabel = formatMonth(label);
      
      return (
        <div className="bg-white p-4 border rounded shadow-md">
          <p className="text-sm font-medium mb-2">{`Mes: ${formattedLabel}`}</p>
          <div className="space-y-1">
            <p className="text-sm text-green-600">{`Ventas: ${formatCurrency(payload[0].value)}`}</p>
            <p className="text-sm text-red-600">{`Gastos: ${formatCurrency(payload[1].value)}`}</p>
            <p className="text-sm font-medium text-blue-600">{`Ganancia: ${formatCurrency(payload[2].value)}`}</p>
          </div>
        </div>
      );
    }
    return null;
  };
  
  return (
    <div className="bg-white border rounded-lg shadow-sm p-4 mb-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">Ventas vs Gastos vs Ganancias</h3>
        <button className="text-gray-400 hover:text-gray-500">
          <Info className="h-5 w-5" />
        </button>
      </div>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={monthlySummary}
            margin={{ top: 10, right: 30, left: 20, bottom: 30 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis 
              dataKey="month" 
              // Aplicar el formateador directamente en tickFormatter
              tickFormatter={formatMonth}
              tick={{ fill: '#6B7280', fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: '#E5E7EB' }}
            />
            <YAxis 
              tickFormatter={(value) => `$${Math.abs(value / 1000)}k`}
              tick={{ fill: '#6B7280', fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: '#E5E7EB' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="bottom"
              wrapperStyle={{ paddingTop: '10px' }}
            />
            <ReferenceLine y={0} stroke="#888" strokeWidth={1} />
            <Bar 
              dataKey="sales" 
              name="Ventas" 
              fill="#10B981" 
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
            <Bar 
              dataKey="expenses" 
              name="Gastos" 
              fill="#EF4444" 
              radius={[4, 4, 0, 0]} 
              maxBarSize={40}
            />
            <Bar 
              dataKey="profit" 
              name="Ganancia" 
              fill="#3B82F6" 
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-center mt-2">
        <div className="text-xs text-gray-500 max-w-lg text-center">
          Este gráfico muestra la relación entre ventas, gastos y ganancias para cada mes. 
          La ganancia neta es la diferencia entre las ventas y los gastos.
        </div>
      </div>
    </div>
  );
};

export default NetProfitChart;