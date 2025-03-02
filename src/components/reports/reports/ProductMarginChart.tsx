import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList } from 'recharts';
import { ChevronDown, ChevronUp } from 'lucide-react';

const ProductMarginChart = ({ productsData }) => {
  const [showAll, setShowAll] = useState(false);
  
  // Ordenar por ganancia total (de mayor a menor)
  const sortedData = [...productsData].sort((a, b) => b.totalProfit - a.totalProfit);
  
  // Mostrar solo los 10 principales o todos dependiendo del estado
  const displayData = showAll ? sortedData : sortedData.slice(0, 10);
  
  // Formatear los datos para mejor visualización
  const chartData = displayData.map(product => ({
    name: product.name.length > 18 ? product.name.substring(0, 18) + '...' : product.name,
    fullName: product.name,
    marginPercentage: parseFloat(product.marginPercentage.toFixed(1)),
    totalProfit: product.totalProfit,
    type: product.type
  }));

  // Formateador personalizado para los tooltips
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-gray-200 shadow-md rounded-md">
          <p className="font-bold">{data.fullName}</p>
          <p className="text-sm text-gray-700">
            <span className="font-medium">Tipo:</span> {data.type === 'sealed' ? 'Sellado' : 'Preparado'}
          </p>
          <p className="text-sm text-blue-600">
            <span className="font-medium">Margen:</span> {data.marginPercentage}%
          </p>
          <p className="text-sm text-orange-600">
            <span className="font-medium">Ganancia:</span> ${data.totalProfit.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white border rounded-lg shadow-sm p-4 mb-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Análisis de Productos</h3>
        <button 
          onClick={() => setShowAll(!showAll)} 
          className="flex items-center text-sm text-blue-600 hover:text-blue-800"
        >
          {showAll ? 'Mostrar Top 10' : 'Ver Todos'} 
          {showAll ? <ChevronUp className="ml-1 h-4 w-4" /> : <ChevronDown className="ml-1 h-4 w-4" />}
        </button>
      </div>
      
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
          barSize={30}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis 
            dataKey="name" 
            angle={-45} 
            textAnchor="end" 
            tick={{ fontSize: 12 }} 
            height={80}
          />
          <YAxis 
            yAxisId="left" 
            orientation="left" 
            stroke="#1E40AF" 
            label={{ value: 'Margen %', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }} 
          />
          <YAxis 
            yAxisId="right" 
            orientation="right" 
            stroke="#F97316" 
            label={{ value: 'Ganancia (MXN)', angle: -90, position: 'insideRight', style: { textAnchor: 'middle' } }} 
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar 
            yAxisId="left" 
            dataKey="marginPercentage" 
            fill="#93C5FD" 
            name="Margen %" 
            radius={[4, 4, 0, 0]}
          >
            <LabelList dataKey="marginPercentage" position="top" formatter={(value) => `${value}%`} />
          </Bar>
          <Bar 
            yAxisId="right" 
            dataKey="totalProfit" 
            fill="#FDBA74" 
            name="Ganancia Total" 
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ProductMarginChart;