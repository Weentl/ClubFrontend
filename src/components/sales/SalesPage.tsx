//SalesPage.tsx
import { useState, useEffect } from 'react';
import { Plus, Filter, Download, Calendar, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import SalesList from './SalesList';
import NewSaleModal from './NewSaleModal';
import SalesSummary from './SalesSummary';
import { Sale } from '../types/sales';
import toast from 'react-hot-toast';
import type { Product } from '../types/products';
import type { Client } from '../types/clients';

// Importar librerías para exportar Excel y PDF
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useAuthFetch } from '../utils/authFetch';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Función para parsear la fecha de un input tipo "date" en hora local
function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

// Definir el período por defecto: se intenta cargar de localStorage o se asigna el mes actual completo
function getDefaultPeriod() {
  const saved = localStorage.getItem('salesPeriod');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed.start && parsed.end) return parsed;
    } catch (e) {
      console.error('Error parseando salesPeriod de localStorage', e);
    }
  }
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return {
    start: firstDay.toISOString().split('T')[0],
    end: lastDay.toISOString().split('T')[0]
  };
}

export default function SalesPage() {
  // Extraer club activo, token y usuario desde localStorage
  const storedMainClub = localStorage.getItem('mainClub');
  const activeClub = storedMainClub ? JSON.parse(storedMainClub) : null;
  const token = localStorage.getItem('token');
  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : {};
  const authFetch = useAuthFetch();
  const [showNewSaleModal, setShowNewSaleModal] = useState(false);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'sealed' | 'prepared'>('all');
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>(getDefaultPeriod());
  const [products, setProducts] = useState<Record<string, Product>>({});
  const [clients, setClients] = useState<Record<string, Client>>({});
  
  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const salesPerPage = 7;

  // Persistir el período en localStorage cada vez que cambie
  useEffect(() => {
    localStorage.setItem('salesPeriod', JSON.stringify(dateRange));
  }, [dateRange]);

  useEffect(() => {
    if (!activeClub || !token) {
      toast.error('Club activo o token no disponibles');
      return;
    }
    loadSales();
    loadProducts();
    loadClients();
  }, []);

  const loadSales = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/api/sales?club=${activeClub.id}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Error ${response.status}: ${errorData.message || response.statusText}`);
      }
      const data = await response.json();
      // Ordenar las ventas de más recientes a más antiguas
      const sortedSales = [...data].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setSales(sortedSales);
    } catch (error) {
      console.error('Error loading sales:', error);
      toast.error('Error al cargar las ventas');
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const response = await authFetch(
        `${API_BASE_URL}/api/products?club=${activeClub.id}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response from products endpoint:', errorData);
        throw new Error(`Error ${response.status}: ${errorData.message || response.statusText}`);
      }
      const data = await response.json();
      if (!Array.isArray(data)) {
        throw new Error('El endpoint de productos no devolvió un arreglo');
      }
      const productsMap: Record<string, Product> = {};
      data.forEach((product: Product) => {
        const id = product.id || product._id;
        productsMap[id] = product;
      });
      setProducts(productsMap);
    } catch (error) {
      console.error('Error loading products:', error);
      toast.error('Error al cargar los productos');
    }
  };

  const loadClients = async () => {
    try {
      const response = await authFetch(
        `${API_BASE_URL}/api/clients?club=${activeClub.id}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response from clients endpoint:', errorData);
        throw new Error(`Error ${response.status}: ${errorData.message || response.statusText}`);
      }
      const data = await response.json();
      if (!Array.isArray(data)) {
        throw new Error('El endpoint de clientes no devolvió un arreglo');
      }
      const clientsMap: Record<string, Client> = {};
      data.forEach((client: Client) => {
        const id = client.id || client._id;
        clientsMap[id] = client;
      });
      setClients(clientsMap);
    } catch (error) {
      console.error('Error loading clients:', error);
      toast.error('Error al cargar los clientes');
    }
  };

  const handleSaveSale = () => {
    loadSales();
    setShowNewSaleModal(false);
    toast.success('Venta registrada correctamente');
  };

  const filteredSales = sales.filter(sale => {
    const matchesSearch =
      searchTerm === '' ||
      sale.items.some(item => {
        const productName = products[item.product_id]?.name || '';
        return productName.toLowerCase().includes(searchTerm.toLowerCase());
      });
    const matchesType =
      filterType === 'all' || sale.items.some(item => item.type === filterType);
    const startDate = parseLocalDate(dateRange.start);
    const endDate = parseLocalDate(dateRange.end);
    endDate.setHours(23, 59, 59, 999);
    const saleDate = new Date(sale.created_at);
    return saleDate >= startDate && saleDate <= endDate && matchesSearch && matchesType;
  });

  // Calcular total de ventas en el período
  const totalSales = filteredSales.reduce((sum, sale) => sum + sale.total, 0);

  // Paginación
  const indexOfLastSale = currentPage * salesPerPage;
  const indexOfFirstSale = indexOfLastSale - salesPerPage;
  const currentSales = filteredSales.slice(indexOfFirstSale, indexOfLastSale);
  const totalPages = Math.ceil(filteredSales.length / salesPerPage);

  // Función para cambiar de página
  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  // Función para exportar a Excel con datos de cabecera y ventas
  const exportToExcel = () => {
    const reportDate = new Date().toLocaleString();
    const header = [
      ['Reporte de Ventas'],
      [`Generado por: ${user.fullName || user.name || 'Usuario'}`],
      [`Club: ${activeClub.clubName || activeClub.name || 'Club'}`],
      [`Fecha de creación: ${reportDate}`],
      [`Período: ${dateRange.start} - ${dateRange.end}`],
      [] // fila en blanco
    ];
    const salesData = filteredSales.map(sale => {
      const productsInfo = sale.items
        .map(item => {
          const productName = products[item.product_id]?.name || 'Producto desconocido';
          return `${productName} x${item.quantity}`;
        })
        .join('; ');
      const clientName = sale.client_id
        ? (clients[sale.client_id]?.name || 'Sin cliente')
        : 'Sin cliente';
      return [new Date(sale.created_at).toLocaleDateString(), productsInfo, sale.total.toFixed(2), clientName];
    });
    const tableHeader = [['Fecha', 'Productos', 'Total', 'Cliente']];
    const wsData = [...header, ...tableHeader, ...salesData];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Reporte de Ventas');
    XLSX.writeFile(wb, `reporte_ventas_${dateRange.start}_${dateRange.end}.xlsx`);
  };

  // Función para exportar a PDF con formato de tabla y total de ventas
  const exportToPDF = () => {
    const doc = new jsPDF();
    const reportDate = new Date().toLocaleString();
    doc.setFontSize(16);
    doc.text('Reporte de Ventas', 14, 20);
    doc.setFontSize(10);
    doc.text(`Generado por: ${user.fullName || user.name || 'Usuario'}`, 14, 28);
    doc.text(`Club: ${activeClub.clubName || activeClub.name || 'Club'}`, 14, 34);
    doc.text(`Fecha de creación: ${reportDate}`, 14, 40);
    doc.text(`Período: ${dateRange.start} - ${dateRange.end}`, 14, 46);
    const tableColumn = ['Fecha', 'Productos', 'Total', 'Cliente'];
    const tableRows = filteredSales.map(sale => {
      const productsInfo = sale.items
        .map(item => {
          const productName = products[item.product_id]?.name || 'Producto desconocido';
          return `${productName} x${item.quantity}`;
        })
        .join('; ');
      const clientName = sale.client_id
        ? (clients[sale.client_id]?.name || 'Sin cliente')
        : 'Sin cliente';
      return [
        new Date(sale.created_at).toLocaleDateString(),
        productsInfo,
        sale.total.toFixed(2),
        clientName
      ];
    });
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 52,
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185] }
    });
    doc.text(`Total ventas en período: $${totalSales.toFixed(2)}`, 14, (doc as any).lastAutoTable.finalY + 10);
    doc.save(`reporte_ventas_${dateRange.start}_${dateRange.end}.pdf`);
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 mb-4 md:mb-0">
            Registro de Ventas
          </h1>
          <div className="flex flex-wrap gap-3">
            <div className="relative inline-block">
              <div className="flex items-center border border-gray-300 rounded-md shadow-sm bg-white">
                <div className="px-3 py-2 border-r border-gray-300">
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={e => setDateRange({ ...dateRange, start: e.target.value })}
                  className="block w-32 pl-3 pr-3 py-2 text-sm border-0 focus:outline-none focus:ring-0 rounded-md"
                />
                <span className="px-2 text-gray-500">-</span>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={e => setDateRange({ ...dateRange, end: e.target.value })}
                  className="block w-32 pl-3 pr-3 py-2 text-sm border-0 focus:outline-none focus:ring-0 rounded-md"
                />
              </div>
            </div>
            <div className="relative inline-block">
              <div className="flex items-center border border-gray-300 rounded-md shadow-sm bg-white">
                <div className="px-3 py-2 border-r border-gray-300">
                  <Filter className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  value={filterType}
                  onChange={e =>
                    setFilterType(e.target.value as 'all' | 'sealed' | 'prepared')
                  }
                  className="block w-full pl-3 pr-10 py-2 text-sm border-0 focus:outline-none focus:ring-0 rounded-md"
                >
                  <option value="all">Todos los tipos</option>
                  <option value="sealed">Solo productos sellados</option>
                  <option value="prepared">Solo preparados</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                onClick={exportToExcel}
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar Excel
              </button>
              <button
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                onClick={exportToPDF}
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar PDF
              </button>
            </div>
            <button
              onClick={() => setShowNewSaleModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#2A5C9A] hover:bg-[#1e4474] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="h-5 w-5 mr-2" />
              Nueva Venta
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
              <div className="p-4 border-b border-gray-200">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Buscar por producto..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                  <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </div>
              <SalesList
                sales={currentSales}
                loading={loading}
                products={products}
                clients={clients}
              />
              
              {/* Paginación */}
              {filteredSales.length > 0 && (
                <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Mostrando <span className="font-medium">{indexOfFirstSale + 1}</span> a{' '}
                        <span className="font-medium">
                          {indexOfLastSale > filteredSales.length ? filteredSales.length : indexOfLastSale}
                        </span>{' '}
                        de <span className="font-medium">{filteredSales.length}</span> resultados
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <button
                          onClick={() => paginate(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                        >
                          <span className="sr-only">Anterior</span>
                          <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                        </button>
                        
                        {[...Array(totalPages)].map((_, index) => (
                          <button
                            key={index + 1}
                            onClick={() => paginate(index + 1)}
                            className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${
                              currentPage === index + 1 
                                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600' 
                                : 'text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {index + 1}
                          </button>
                        ))}
                        
                        <button
                          onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                          disabled={currentPage === totalPages}
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                        >
                          <span className="sr-only">Siguiente</span>
                          <ChevronRight className="h-5 w-5" aria-hidden="true" />
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
              
            </div>
          </div>
          <div className="lg:col-span-1">
            <SalesSummary sales={filteredSales} dateRange={dateRange} />
          </div>
        </div>
        {showNewSaleModal && (
          <NewSaleModal
            onClose={() => setShowNewSaleModal(false)}
            onSave={handleSaveSale}
          />
        )}
      </div>
    </div>
  );
}





