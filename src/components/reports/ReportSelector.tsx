//ReportSelector.tsx
import React from 'react';
import { 
  TrendingUp, 
  ShoppingCart, 
  DollarSign, 
  CreditCard, 
  BarChart2, 
  Package, 
  Store, 
  Clipboard, 
  List, 
  LineChart 
} from 'lucide-react';

type ReportType = 
  | 'net-profit' 
  | 'sales' 
  | 'expenses' 
  | 'cash-flow' 
  | 'product-margin'
  | 'inventory-movement'
  | 'club-performance'
  | 'executive-summary'
  | 'transaction-history'
  | 'future-projections';

interface ReportOption {
  id: ReportType;
  name: string;
  description: string;
  icon: React.ReactNode;
}

interface ReportSelectorProps {
  selectedReport: ReportType;
  onSelectReport: (report: ReportType) => void;
}

export default function ReportSelector({ selectedReport, onSelectReport }: ReportSelectorProps) {
  const reportOptions: ReportOption[] = [
    {
      id: 'executive-summary',
      name: 'Resumen Ejecutivo',
      description: 'Visión general del negocio',
      icon: <Clipboard />
    },
    {
      id: 'net-profit',
      name: 'Ganancias Netas',
      description: 'Ventas menos gastos',
      icon: <TrendingUp />
    },
    {
      id: 'sales',
      name: 'Ventas',
      description: 'Análisis de ventas por producto',
      icon: <ShoppingCart />
    },
    {
      id: 'expenses',
      name: 'Gastos',
      description: 'Desglose de gastos por categoría',
      icon: <DollarSign />
    },
    {
      id: 'cash-flow',
      name: 'Flujo de Caja',
      description: 'Entradas y salidas de efectivo',
      icon: <CreditCard />
    },
    {
      id: 'product-margin',
      name: 'Margen por Producto',
      description: 'Rentabilidad de cada producto',
      icon: <BarChart2 />
    },
    {
      id: 'inventory-movement',
      name: 'Movimientos de Inventario',
      description: 'Entradas y salidas de stock',
      icon: <Package />
    },
    {
      id: 'club-performance',
      name: 'Desempeño por Club',
      description: 'Comparativa entre sucursales',
      icon: <Store />
    },
    {
      id: 'transaction-history',
      name: 'Historial de Movimientos',
      description: 'Registro de transacciones',
      icon: <List />
    },
    {
      id: 'future-projections',
      name: 'Proyecciones Futuras',
      description: 'Estimaciones basadas en datos',
      icon: <LineChart />
    }
  ];

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-4 py-5 border-b border-gray-200">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Tipos de Reportes
        </h3>
      </div>
      <div className="divide-y divide-gray-200">
        {reportOptions.map((option) => (
          <button
            key={option.id}
            className={`w-full px-4 py-4 flex items-start hover:bg-gray-50 focus:outline-none ${
              selectedReport === option.id ? 'bg-blue-50' : ''
            }`}
            onClick={() => onSelectReport(option.id)}
          >
            <div className={`flex-shrink-0 h-6 w-6 text-${selectedReport === option.id ? 'blue' : 'gray'}-600`}>
              {option.icon}
            </div>
            <div className="ml-3 text-left">
              <p className={`text-sm font-medium ${
                selectedReport === option.id ? 'text-blue-600' : 'text-gray-900'
              }`}>
                {option.name}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                {option.description}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}