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

import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import ExcelJS from 'exceljs';

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

const reportNameMap: { [key in ReportType]: string } = {
  'net-profit': 'Utilidad Neta',
  'sales': 'Ventas',
  'expenses': 'Gastos',
  'cash-flow': 'Flujo de Caja',
  'product-margin': 'Margen de Producto',
  'inventory-movement': 'Movimiento de Inventario',
  'club-performance': 'Rendimiento del Club',
  'executive-summary': 'Resumen Ejecutivo',
  'transaction-history': 'Historial de Transacciones',
  'future-projections': 'Proyecciones Futuras'
};

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState<ReportType>('executive-summary');
  const [period, setPeriod] = useState<PeriodType>('monthly');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefreshData = () => {
    setIsRefreshing(true);
    // Simula la actualización de datos
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  // Exporta el contenedor completo (cabecera + contenido) en PDF
  const exportToPDF = () => {
    const container = document.getElementById('export-container');
    if (!container) return;
  
    // Clonar el contenedor y agregar padding inferior extra
    const clone = container.cloneNode(true) as HTMLElement;
    clone.style.paddingBottom = '50px'; // Aumenta este valor según lo que necesites
    // Posicionar el clon fuera de la vista
    clone.style.position = 'absolute';
    clone.style.top = '-10000px';
    document.body.appendChild(clone);
  
    // Esperar un poco para que se renderice completamente el canvas de la gráfica
    setTimeout(() => {
      html2canvas(clone, { 
        scale: 2, 
        useCORS: true,
        scrollY: -window.scrollY // Ajuste para que no se recorte por el scroll
      }).then(canvas => {
        document.body.removeChild(clone);
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('landscape', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        
        // Calcular escala para ajustar la imagen a la página
        const scale = Math.min(pdfWidth / canvas.width, pdfHeight / canvas.height);
        const imgWidth = canvas.width * scale;
        const imgHeight = canvas.height * scale;
        const marginX = (pdfWidth - imgWidth) / 2;
        const marginY = (pdfHeight - imgHeight) / 2;
        
        pdf.addImage(imgData, 'PNG', marginX, marginY, imgWidth, imgHeight);
        pdf.save(`${selectedReport}_${period}.pdf`);
      });
    }, 500);
  };
  // Exporta el contenedor completo en Excel incrustando la imagen del reporte
  const exportToExcel = async () => {
    const container = document.getElementById('export-container');
    if (!container) return;

    const canvas = await html2canvas(container, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Reporte');

    // Agregamos la imagen a la hoja, con posición y tamaño acorde a la imagen capturada
    const imageId = workbook.addImage({
      base64: imgData,
      extension: 'png'
    });

    worksheet.addImage(imageId, {
      tl: { col: 0, row: 0 },
      ext: { width: canvas.width, height: canvas.height }
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const downloadUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `${selectedReport}_${period}.xlsx`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(downloadUrl);
  };

  const handleExport = (format: 'pdf' | 'excel') => {
    if (format === 'pdf') {
      exportToPDF();
    } else {
      exportToExcel();
    }
  };

  const renderReportContent = () => {
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
            {/* Selector de Período */}
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
            {/* Botón Filtros (placeholder) */}
            <button 
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              onClick={() => {}}
            >
              <Filter className="h-4 w-4 mr-2" /> Filtros
            </button>
            {/* Botones de Exportar */}
            <button 
              onClick={() => handleExport('pdf')}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Download className="h-4 w-4 mr-2" /> Exportar PDF
            </button>
            <button 
              onClick={() => handleExport('excel')}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Download className="h-4 w-4 mr-2" /> Exportar Excel
            </button>
            <button 
              className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#2A5C9A] hover:bg-[#1e4474] ${isRefreshing ? 'opacity-75' : ''}`}
              onClick={handleRefreshData}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} /> {isRefreshing ? 'Actualizando...' : 'Actualizar'}
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
            {/* Agregamos un padding inferior extra para evitar que las gráficas se recorten */}
            <div
              id="export-container"
              className="bg-white shadow rounded-lg p-4"
              style={{ paddingBottom: '50px' }}
            >
              <div className="mb-4 border-b pb-2">
                <h2 className="text-xl font-bold">{reportNameMap[selectedReport]}</h2>
                <p className="text-sm text-gray-600">
                  Periodo: {period === 'weekly' ? 'Semanal' : period === 'monthly' ? 'Mensual' : 'Anual'}
                </p>
              </div>
              {renderReportContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


