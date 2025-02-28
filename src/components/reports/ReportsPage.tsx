// ReportsPage.tsx
import { useState } from 'react';
import { Calendar, Filter, Download, RefreshCw } from 'lucide-react';
import ReportSelector from './ReportSelector';
import NetProfitReport from './reports/NetProfitReport';
import SalesReport from './reports/SalesReport';
import ExpensesReport from './reports/ExpensesReport';
import CashFlowReport from './reports/CashFlowReport';
import ProductMarginReport from './reports/ProductMarginReport';
import InventoryMovementReport from './reports/InventoryMovementReport';
import ClubPerformanceReport from './reports/ClubPerformanceReport';
import ExecutiveSummaryReport from './reports/ExecutiveSummaryReport';
import TransactionHistoryReport from './reports/TransactionHistoryReport';
import FutureProjectionsReport from './reports/FutureProjectionsReport';

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

type PeriodType = 'weekly' | 'monthly' | 'yearly';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState<ReportType>('executive-summary');
  const [period, setPeriod] = useState<PeriodType>('monthly');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefreshData = () => {
    setIsRefreshing(true);
    // Simula la actualización de datos. Puedes implementar lógica para refrescar cada componente.
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  const handleExport = () => {
    const url = `${API_BASE_URL}/api/reports/export?type=${selectedReport}&period=${period}`;
    window.open(url, '_blank');
  };

  const renderReport = () => {
    switch (selectedReport) {
      case 'net-profit':
        return <NetProfitReport period={period} />;
      case 'sales':
        return <SalesReport period={period} />;
      case 'expenses':
        return <ExpensesReport period={period} />;
      case 'cash-flow':
        return <CashFlowReport period={period} />;
      case 'product-margin':
        return <ProductMarginReport period={period} />;
      case 'inventory-movement':
        return <InventoryMovementReport period={period} />;
      case 'club-performance':
        return <ClubPerformanceReport period={period} />;
      case 'executive-summary':
        return <ExecutiveSummaryReport period={period} />;
      case 'transaction-history':
        return <TransactionHistoryReport period={period} />;
      case 'future-projections':
        return <FutureProjectionsReport period={period} />;
      default:
        return <ExecutiveSummaryReport period={period} />;
    }
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 mb-4 md:mb-0">Reportes Financieros</h1>
          
          <div className="flex flex-wrap gap-3">
            <div className="relative inline-block">
              <div className="flex items-center border border-gray-300 rounded-md shadow-sm bg-white">
                <div className="px-3 py-2 border-r border-gray-300">
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value as PeriodType)}
                  className="block w-full pl-3 pr-10 py-2 text-base border-0 focus:outline-none focus:ring-0 sm:text-sm rounded-md"
                >
                  <option value="weekly">Semanal</option>
                  <option value="monthly">Mensual</option>
                  <option value="yearly">Anual</option>
                </select>
              </div>
            </div>
            
            <button 
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              onClick={() => {}}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </button>
            
            <button 
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              onClick={handleExport}
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </button>
            
            <button 
              className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#2A5C9A] hover:bg-[#1e4474] ${isRefreshing ? 'opacity-75' : ''}`}
              onClick={handleRefreshData}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Actualizando...' : 'Actualizar'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1">
            <ReportSelector 
              selectedReport={selectedReport} 
              onSelectReport={setSelectedReport} 
            />
          </div>
          
          <div className="md:col-span-3">
            <div className="bg-white shadow rounded-lg">
              {renderReport()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
