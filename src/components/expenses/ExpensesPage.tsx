import React, { useState, useEffect } from 'react';
import { Plus, Filter, Download, Calendar } from 'lucide-react';
import ExpensesList from './ExpensesList';
import ExpenseFormModal from './ExpenseFormModal';
import ExpenseSummary from './ExpenseSummary';
import { Expense } from '../types/expenses';
import { api } from '../lib/mockData';
import toast from 'react-hot-toast';

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [filterCategory, setFilterCategory] = useState('all');
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    try {
      setLoading(true);
      const data = await api.getExpenses();
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
    setExpenses(
      expenses.map((expense) =>
        expense.id === updatedExpense.id ? updatedExpense : expense
      )
    );
    setSelectedExpense(null);
    toast.success('Gasto actualizado correctamente');
  };

  const handleDeleteExpense = async (expenseId: string) => {
    try {
      await api.deleteExpense(expenseId);
      setExpenses(expenses.filter((expense) => expense.id !== expenseId));
      toast.success('Gasto eliminado correctamente');
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast.error('Error al eliminar el gasto');
    }
  };

  const filteredExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);
    endDate.setHours(23, 59, 59); // Include the entire end day
    
    const matchesCategory = filterCategory === 'all' || expense.category === filterCategory;
    const matchesDate = expenseDate >= startDate && expenseDate <= endDate;
    
    return matchesCategory && matchesDate;
  });

  const exportExpenses = () => {
    // In a real app, this would generate a CSV or PDF
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
    
    toast.success('Reporte exportado correctamente');
  };

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
            
            <button 
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              onClick={exportExpenses}
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </button>
            
            <button 
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#28A745] hover:bg-[#218838]"
              onClick={() => setShowAddModal(true)}
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