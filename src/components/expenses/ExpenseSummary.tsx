import React from 'react';
import { DollarSign, TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import { Expense } from '../types/expenses';

interface Props {
  expenses: Expense[];
  dateRange: { start: string; end: string };
}

export default function ExpenseSummary({ expenses, dateRange }: Props) {
  // Calculate total expenses for the current period
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  
  // Group expenses by category
  const expensesByCategory: Record<string, number> = {};
  expenses.forEach(expense => {
    if (!expensesByCategory[expense.category]) {
      expensesByCategory[expense.category] = 0;
    }
    expensesByCategory[expense.category] += expense.amount;
  });
  
  // Sort categories by amount (descending)
  const sortedCategories = Object.entries(expensesByCategory)
    .sort(([, a], [, b]) => b - a)
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: (amount / totalExpenses) * 100
    }));
  
  // Find most frequent expense category
  const mostFrequentCategory = sortedCategories.length > 0 ? sortedCategories[0].category : 'N/A';
  const mostFrequentAmount = sortedCategories.length > 0 ? sortedCategories[0].amount : 0;
  
  // Mock comparison with previous period (in a real app, this would come from the API)
  const previousPeriodTotal = totalExpenses * 0.9; // Simulating 10% less in previous period
  const changePercentage = ((totalExpenses - previousPeriodTotal) / previousPeriodTotal) * 100;
  
  // Category colors for the chart
  const CATEGORY_COLORS: Record<string, string> = {
    inventory: 'bg-blue-500',
    services: 'bg-yellow-500',
    payroll: 'bg-purple-500',
    logistics: 'bg-green-500',
    other: 'bg-gray-500',
  };
  
  // Category icons
  const CATEGORY_ICONS: Record<string, string> = {
    inventory: '📦',
    services: '💡',
    payroll: '🧑‍💼',
    logistics: '🚚',
    other: '❔',
  };
  
  // Format category name
  const formatCategoryName = (category: string) => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  };
  
  // Format date range for display
  const formatDateRange = () => {
    const start = new Date(dateRange.start);
    const end = new Date(dateRange.end);
    
    return `${start.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })}`;
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
        {/* Total expenses card */}
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
        
        {/* Pie chart */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Distribución por Categoría</h4>
          
          {expenses.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              No hay datos para mostrar
            </p>
          ) : (
            <>
              {/* Visual pie chart representation */}
              <div className="relative h-48 w-48 mx-auto mb-4">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  {sortedCategories.reduce((elements, { category, percentage }, index, array) => {
                    const previousTotal = array
                      .slice(0, index)
                      .reduce((sum, item) => sum + item.percentage, 0);
                    
                    const startAngle = (previousTotal / 100) * 360;
                    const endAngle = ((previousTotal + percentage) / 100) * 360;
                    
                    // Calculate path for pie slice
                    const x1 = 50 + 40 * Math.cos((startAngle - 90) * (Math.PI / 180));
                    const y1 = 50 + 40 * Math.sin((startAngle - 90) * (Math.PI / 180));
                    const x2 = 50 + 40 * Math.cos((endAngle - 90) * (Math.PI / 180));
                    const y2 = 50 + 40 * Math.sin((endAngle - 90) * (Math.PI / 180));
                    
                    // Determine if the arc should be drawn as a large arc
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
              
              {/* Legend */}
              <div className="space-y-2">
                {sortedCategories.map(({ category, amount, percentage }) => (
                  <div key={category} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 ${CATEGORY_COLORS[category] || 'bg-gray-500'} rounded-full mr-2`}></div>
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
        
        {/* Most frequent expense */}
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