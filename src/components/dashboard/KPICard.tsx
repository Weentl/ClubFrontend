import { DivideIcon as LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  /** Valor actual numérico para el KPI */
  value: number;
  /** Valor anterior para calcular el porcentaje de cambio */
  previousValue?: number;
  icon: typeof LucideIcon;
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple';
}

export default function KPICard({
  title,
  value,
  previousValue,
  icon: Icon,
  color = 'blue'
}: KPICardProps) {
  // Calcular el porcentaje de cambio si se provee previousValue y es distinto de 0
  let trend: { value: number; isPositive: boolean } | null = null;
  if (previousValue !== undefined && previousValue !== 0) {
    const calculatedTrend = ((value - previousValue) / previousValue) * 100;
    trend = {
      value: Math.abs(calculatedTrend),
      isPositive: calculatedTrend >= 0,
    };
  }

  // Mapeo de clases para cada color, evitando interpolación dinámica en Tailwind
  const colorClasses = {
    blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
    green: { bg: 'bg-green-100', text: 'text-green-600' },
    red: { bg: 'bg-red-100', text: 'text-red-600' },
    yellow: { bg: 'bg-yellow-100', text: 'text-yellow-600' },
    purple: { bg: 'bg-purple-100', text: 'text-purple-600' },
  };

  const currentColor = colorClasses[color] || colorClasses.blue;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="mt-2 text-3xl font-semibold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${currentColor.bg}`}>
          <Icon className={`h-6 w-6 ${currentColor.text}`} />
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center">
          <div className={`inline-flex items-center text-sm ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {trend.isPositive ? '↑' : '↓'} {trend.value}%
          </div>
          <span className="text-sm text-gray-500 ml-2">vs. período anterior</span>
        </div>
      )}
    </div>
  );
}

