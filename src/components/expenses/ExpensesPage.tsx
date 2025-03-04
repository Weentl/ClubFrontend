import { useState, useEffect } from 'react';
import { Plus, Filter, Download, Calendar } from 'lucide-react';
import ExpensesList from './ExpensesList';
import ExpenseFormModal from './ExpenseFormModal';
import ExpenseSummary from './ExpenseSummary';
import { Expense } from '../types/expenses';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';
import ExcelJS from 'exceljs';
import { useAuthFetch } from '../utils/authFetch';

// Definir API_BASE_URL localmente
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**  
 * Convierte una cadena "YYYY-MM-DD" a un objeto Date interpretado en horario local  
 */
function parseLocalDate(dateStr: string): Date {
  const parts = dateStr.split('-').map(Number);
  return new Date(parts[0], parts[1] - 1, parts[2]);
}

/**  
 * Devuelve una cadena en formato "YYYY-MM-DD" usando la fecha local  
 */
function getLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function ExpensesPage() {
  const authFetch = useAuthFetch();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [filterCategory, setFilterCategory] = useState('all');
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: getLocalDateString(new Date(new Date().getFullYear(), new Date().getMonth(), 1)),
    end: getLocalDateString(new Date())
  });
  const [showExportOptions, setShowExportOptions] = useState(false);

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    try {
      setLoading(true);
      // Obtener el club activo desde localStorage
      const mainClubStr = localStorage.getItem('mainClub');
      if (!mainClubStr) throw new Error('Club no encontrado');
      const mainClub = JSON.parse(mainClubStr);
      const clubId = mainClub.id;
      
      const response = await authFetch(`${API_BASE_URL}/api/expenses?club=${clubId}`);
      if (!response.ok) throw new Error('Error fetching expenses');
      const data = await response.json();
      setExpenses(data);
    } catch (error) {
      console.error('Error loading expenses:', error);
      toast.error('Error al cargar los gastos');
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = (newExpense: Expense) => {
    setExpenses([...expenses, newExpense]);
    setShowAddModal(false);
    toast.success('Gasto registrado correctamente');
  };

  const handleUpdateExpense = (updatedExpense: Expense) => {
    const id = updatedExpense.id || updatedExpense._id;
    setExpenses(
      expenses.map((expense) =>
        (expense.id || expense._id) === id ? updatedExpense : expense
      )
    );
    setSelectedExpense(null);
    toast.success('Gasto actualizado correctamente');
  };

  const handleDeleteExpense = async (expenseId: string) => {
    try {
      const response = await authFetch(`${API_BASE_URL}/api/expenses/${expenseId}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Error deleting expense');
      setExpenses(expenses.filter((expense) => (expense.id || expense._id) !== expenseId));
      toast.success('Gasto eliminado correctamente');
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast.error('Error al eliminar el gasto');
    }
  };

  const filteredExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date); // Suponemos que en la BD ya se guardó correctamente
    const startDate = parseLocalDate(dateRange.start);
    const endDate = parseLocalDate(dateRange.end);
    endDate.setHours(23, 59, 59);
    const matchesCategory = filterCategory === 'all' || expense.category === filterCategory;
    const matchesDate = expenseDate >= startDate && expenseDate <= endDate;
    return matchesCategory && matchesDate;
  });

  // Exportar a CSV
  const exportCSV = () => {
    const csvContent = [
      ['Fecha', 'Categoría', 'Descripción', 'Monto', 'Proveedor'].join(','),
      ...filteredExpenses.map(expense => [
        new Date(expense.date).toLocaleDateString(),
        expense.category,
        expense.description,
        expense.amount.toFixed(2),
        expense.supplier || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `gastos_${dateRange.start}_${dateRange.end}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Reporte CSV exportado correctamente');
  };

  // Exportar a PDF: primero la tabla y luego la gráfica al final
  const exportPDF = async () => {
    const doc = new jsPDF();

    // Extraer información del club y usuario
    const mainClubStr = localStorage.getItem('mainClub');
    const userStr = localStorage.getItem('user');
    let clubName = 'Club no definido';
    let userName = 'Usuario';
    if (mainClubStr) {
      try {
        const mainClub = JSON.parse(mainClubStr);
        clubName = mainClub.name || clubName;
      } catch (e) {}
    }
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        userName = user.fullName || userName;
      } catch (e) {}
    }
    const todayStr = getLocalDateString(new Date());

    // Encabezado con fechas locales correctas
    doc.setFontSize(18);
    doc.text("Reporte de Gastos", 14, 16);
    doc.setFontSize(10);
    doc.text(`Club: ${clubName}`, 14, 24);
    doc.text(`Usuario: ${userName}`, 14, 30);
    doc.text(`Fecha de exportación: ${todayStr}`, 14, 36);
    doc.text(
      `Período: ${new Date(dateRange.start).toLocaleDateString()} - ${new Date(dateRange.end).toLocaleDateString()}`,
      14,
      42
    );

    // Generar la tabla de datos con autoTable y obtener el finalY de la tabla
    const headers = [["Fecha", "Categoría", "Descripción", "Monto", "Proveedor"]];
    const data = filteredExpenses.map(expense => [
      new Date(expense.date).toLocaleDateString(),
      expense.category,
      expense.description,
      expense.amount.toFixed(2),
      expense.supplier || ""
    ]);

    const table = autoTable(doc, {
      head: headers,
      body: data,
      startY: 48,
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185] }
    });

    // Insertar la gráfica AL FINAL del reporte (debajo de la tabla)
    try {
      const chartElement = document.getElementById("expense-chart");
      if (chartElement) {
        // Capturar con scale 2 para mayor resolución
        const canvas = await html2canvas(chartElement, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        const imgProps = doc.getImageProperties(imgData);
        const pdfWidth = doc.internal.pageSize.getWidth() - 28; // márgenes
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        // Colocar la imagen 10 unidades debajo de la tabla
        doc.addPage();
        doc.addImage(imgData, 'PNG', 14, 20, pdfWidth, pdfHeight);
      }
    } catch (err) {
      console.error("Error capturando la gráfica", err);
    }

    doc.save(`gastos_${dateRange.start}_${dateRange.end}.pdf`);
    toast.success('Reporte PDF exportado correctamente');
  };

  // Exportar a Excel con ExcelJS, incluyendo la gráfica al final
  const exportExcel = async () => {
    const mainClubStr = localStorage.getItem('mainClub');
    const userStr = localStorage.getItem('user');
    let clubName = 'Club no definido';
    let userName = 'Usuario';
    if (mainClubStr) {
      try {
        const mainClub = JSON.parse(mainClubStr);
        clubName = mainClub.name || clubName;
      } catch (e) {}
    }
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        userName = user.fullName || userName;
      } catch (e) {}
    }
    const exportDate = getLocalDateString(new Date());

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Gastos');

    // Encabezado con información adicional
    worksheet.mergeCells('A1:E1');
    worksheet.getCell('A1').value = `Club: ${clubName}`;
    worksheet.getCell('A1').font = { bold: true, size: 12 };

    worksheet.mergeCells('A2:E2');
    worksheet.getCell('A2').value = `Usuario: ${userName}`;
    worksheet.getCell('A2').font = { bold: true, size: 12 };

    worksheet.mergeCells('A3:E3');
    worksheet.getCell('A3').value = `Fecha de exportación: ${exportDate}`;
    worksheet.getCell('A3').font = { bold: true, size: 12 };

    worksheet.mergeCells('A4:E4');
    worksheet.getCell('A4').value = `Período: ${new Date(dateRange.start).toLocaleDateString()} - ${new Date(dateRange.end).toLocaleDateString()}`;
    worksheet.getCell('A4').font = { bold: true, size: 12 };

    worksheet.addRow([]);

    // Cabecera de la tabla
    const headerRow = worksheet.addRow(['Fecha', 'Categoría', 'Descripción', 'Monto', 'Proveedor']);
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF2980B9' }
      };
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });

    // Agregar los datos
    filteredExpenses.forEach(expense => {
      worksheet.addRow([
        new Date(expense.date).toLocaleDateString(),
        expense.category,
        expense.description,
        expense.amount.toFixed(2),
        expense.supplier || ''
      ]);
    });

    // Ajuste de anchos de columnas
    worksheet.columns = [
      { key: 'col1', width: 15 },
      { key: 'col2', width: 15 },
      { key: 'col3', width: 40 },
      { key: 'col4', width: 15 },
      { key: 'col5', width: 20 },
    ];

    // Capturar la gráfica y colocarla al final de la tabla
    const chartElement = document.getElementById("expense-chart");
    if (chartElement) {
      try {
        const canvas = await html2canvas(chartElement, { scale: 2 });
        const imgDataUrl = canvas.toDataURL('image/png');
        const imageId = workbook.addImage({
          base64: imgDataUrl,
          extension: 'png'
        });
        worksheet.addImage(imageId, {
          tl: { col: 0, row: headerRow.number + filteredExpenses.length + 3 },
          ext: { width: 300, height: 200 }
        });
      } catch (err) {
        console.error("Error capturando la gráfica para Excel", err);
      }
    }

    // Generar y descargar el archivo Excel
    workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `gastos_${dateRange.start}_${dateRange.end}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Reporte Excel exportado correctamente');
    }).catch((err) => {
      console.error("Error generando el archivo Excel", err);
      toast.error('Error al exportar el reporte Excel');
    });
  };

  function exportXML() {
    throw new Error('Function not implemented.');
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 mb-4 md:mb-0">Gestión de Gastos</h1>
          <div className="flex flex-wrap gap-3">
            <div className="relative inline-block">
              <div className="flex items-center border border-gray-300 rounded-md shadow-sm bg-white">
                <div className="px-3 py-2 border-r border-gray-300">
                  <Filter className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 text-base border-0 focus:outline-none focus:ring-0 sm:text-sm rounded-md"
                >
                  <option value="all">Todas las categorías</option>
                  <option value="inventory">📦 Inventario</option>
                  <option value="services">💡 Servicios</option>
                  <option value="payroll">🧑‍💼 Nómina</option>
                  <option value="logistics">🚚 Logística</option>
                  <option value="other">❔ Otros</option>
                </select>
              </div>
            </div>
            <div className="relative inline-block">
              <div className="flex items-center border border-gray-300 rounded-md shadow-sm bg-white">
                <div className="px-3 py-2 border-r border-gray-300">
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  className="block w-32 pl-3 pr-3 py-2 text-sm border-0 focus:outline-none focus:ring-0 rounded-md"
                />
                <span className="px-2 text-gray-500">-</span>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  className="block w-32 pl-3 pr-3 py-2 text-sm border-0 focus:outline-none focus:ring-0 rounded-md"
                />
              </div>
            </div>
            {/* Botón de exportación con menú de opciones */}
            <div className="relative inline-block">
              <button
                onClick={() => setShowExportOptions(!showExportOptions)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </button>
              {showExportOptions && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                  <button
                    onClick={() => { exportCSV(); setShowExportOptions(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    CSV
                  </button>
                  <button
                    onClick={() => { exportPDF(); setShowExportOptions(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    PDF
                  </button>
                  <button
                    onClick={() => { exportExcel(); setShowExportOptions(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Excel
                  </button>
                  <button
                    onClick={() => { exportXML(); setShowExportOptions(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    XML
                  </button>
                </div>
              )}
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#28A745] hover:bg-[#218838]"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Gasto
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ExpensesList
              expenses={filteredExpenses}
              loading={loading}
              onEdit={setSelectedExpense}
              onDelete={handleDeleteExpense}
            />
          </div>
          <div className="lg:col-span-1">
            <ExpenseSummary expenses={filteredExpenses} dateRange={dateRange} />
          </div>
        </div>
      </div>

      {showAddModal && (
        <ExpenseFormModal
          onClose={() => setShowAddModal(false)}
          onSave={handleAddExpense}
        />
      )}

      {selectedExpense && (
        <ExpenseFormModal
          expense={selectedExpense}
          onClose={() => setSelectedExpense(null)}
          onSave={handleUpdateExpense}
        />
      )}
    </div>
  );
}







