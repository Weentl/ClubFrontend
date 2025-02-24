import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  icon: typeof LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: string;
}

export default function KPICard({ title, value, icon: Icon, trend, color = 'blue' }: KPICardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="mt-2 text-3xl font-semibold text-gray-900">{value}</p>
        </div>
        <div
          className={`p-3 rounded-full bg-${color}-100`}
        >
          <Icon className={`h-6 w-6 text-${color}-600`} />
        </div>
      </div>
      {trend && (
        <div className="mt-4">
          <div
            className={`inline-flex items-center text-sm ${
              trend.isPositive ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
          </div>
          <span className="text-sm text-gray-500 ml-2">vs. mes anterior</span>
        </div>
      )}
    </div>
  );
}