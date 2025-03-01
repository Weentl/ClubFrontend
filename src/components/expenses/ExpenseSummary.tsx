// ExpenseSummary.tsx
import React from 'react';
import { DollarSign, TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import { Expense } from '../types/expenses';

// Función auxiliar para convertir una cadena "YYYY-MM-DD" o ISO a Date local
function parseLocalDate(dateStr: string): Date {
  const pureDate = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
  const parts = pureDate.split('-').map(Number);
  return new Date(parts[0], parts[1] - 1, parts[2]);
}

interface Props {
  expenses: Expense[];
  dateRange: { start: string; end: string };
}

export default function ExpenseSummary({ expenses, dateRange }: Props) {
  // Calcular el gasto total en el período actual
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  // Agrupar gastos por categoría
  const expensesByCategory: Record<string, number> = {};
  expenses.forEach(expense => {
    if (!expensesByCategory[expense.category]) {
      expensesByCategory[expense.category] = 0;
    }
    expensesByCategory[expense.category] += expense.amount;
  });

  // Ordenar categorías por monto (descendente)
  const sortedCategories = Object.entries(expensesByCategory)
    .sort(([, a], [, b]) => b - a)
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: totalExpenses ? (amount / totalExpenses) * 100 : 0
    }));

  const mostFrequentCategory = sortedCategories.length > 0 ? sortedCategories[0].category : 'N/A';
  const mostFrequentAmount = sortedCategories.length > 0 ? sortedCategories[0].amount : 0;

  // Comparación simulada con el período anterior (10% menos)
  const previousPeriodTotal = totalExpenses * 0.9;
  const changePercentage = previousPeriodTotal ? ((totalExpenses - previousPeriodTotal) / previousPeriodTotal) * 100 : 0;

  // Colores e íconos por categoría (valores hexadecimales)
  const CATEGORY_COLORS: Record<string, string> = {
    inventory: '#3B82F6',  
    services: '#F59E0B',   
    payroll: '#8B5CF6',    
    logistics: '#22C55E',  
    other: '#6B7280',      
  };

  const CATEGORY_ICONS: Record<string, string> = {
    inventory: '📦',
    services: '💡',
    payroll: '🧑‍💼',
    logistics: '🚚',
    other: '❔',
  };

  const formatCategoryName = (category: string) =>
    category.charAt(0).toUpperCase() + category.slice(1);

  // Usar parseLocalDate para evitar desfases al formatear el rango de fechas
  const formatDateRange = () => {
    const start = parseLocalDate(dateRange.start);
    const end = parseLocalDate(dateRange.end);
    return `${start.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })} - ${end.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}`;
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Resumen de Gastos</h3>
        <p className="text-sm text-gray-500 mt-1">
          <Calendar className="h-4 w-4 inline mr-1" />
          {formatDateRange()}
        </p>
      </div>
      <div className="p-4">
        {/* Tarjeta de gasto total */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p className="text-sm font-medium text-gray-500">Gasto Total</p>
          <p className="mt-1 text-3xl font-semibold text-red-600">${totalExpenses.toFixed(2)}</p>
          <div className="mt-2 flex items-center">
            {changePercentage > 0 ? (
              <>
                <TrendingUp className="h-4 w-4 text-red-500 mr-1" />
                <span className="text-sm text-red-500">
                  {changePercentage.toFixed(1)}% más que el período anterior
                </span>
              </>
            ) : (
              <>
                <TrendingDown className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-500">
                  {Math.abs(changePercentage).toFixed(1)}% menos que el período anterior
                </span>
              </>
            )}
          </div>
        </div>
        {/* Gráfica de pastel con id para captura */}
        <div className="mb-6" id="expense-chart">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Distribución por Categoría</h4>
          {expenses.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              No hay datos para mostrar
            </p>
          ) : (
            <>
              <div className="relative h-48 w-48 mx-auto mb-4">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  {sortedCategories.reduce((elements, { category, percentage }, index, array) => {
                    const previousTotal = array.slice(0, index).reduce((sum, item) => sum + item.percentage, 0);
                    const startAngle = (previousTotal / 100) * 360;
                    const endAngle = ((previousTotal + percentage) / 100) * 360;
                    const x1 = 50 + 40 * Math.cos((startAngle - 90) * (Math.PI / 180));
                    const y1 = 50 + 40 * Math.sin((startAngle - 90) * (Math.PI / 180));
                    const x2 = 50 + 40 * Math.cos((endAngle - 90) * (Math.PI / 180));
                    const y2 = 50 + 40 * Math.sin((endAngle - 90) * (Math.PI / 180));
                    const largeArcFlag = percentage > 50 ? 1 : 0;
                    elements.push(
                      <path
                        key={category}
                        d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                        fill={CATEGORY_COLORS[category] || '#9CA3AF'}
                        stroke="white"
                        strokeWidth="1"
                      />
                    );
                    return elements;
                  }, [] as React.ReactElement[])}
                </svg>
              </div>
              {/* Leyenda */}
              <div className="space-y-2">
                {sortedCategories.map(({ category, amount, percentage }) => (
                  <div key={category} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: CATEGORY_COLORS[category] || '#9CA3AF' }}></div>
                      <span className="text-sm text-gray-700">
                        {CATEGORY_ICONS[category]} {formatCategoryName(category)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-900">
                      ${amount.toFixed(2)} ({percentage.toFixed(1)}%)
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
        {/* Gasto Frecuente */}
        {expenses.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Gasto Frecuente</h4>
            <div className="flex items-center">
              <DollarSign className="h-5 w-5 text-gray-400 mr-2" />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {CATEGORY_ICONS[mostFrequentCategory]} {formatCategoryName(mostFrequentCategory)}
                </p>
                <p className="text-xs text-gray-500">
                  ${mostFrequentAmount.toFixed(2)} ({(sortedCategories[0]?.percentage || 0).toFixed(1)}% del total)
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


