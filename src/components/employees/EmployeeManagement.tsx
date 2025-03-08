import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  BarChart2,
  User,
  Edit2,
  Trash2,
} from 'lucide-react';
import NewEmployeeModal from './NewEmployeeModal';
import EmployeePerformanceModal from './EmployeePerformanceModal';
import toast from 'react-hot-toast';
import { useAuthFetch } from '../utils/authFetch';

interface Employee {
  id: string;
  code: string;
  name: string;
  email: string;
  phone?: string;
  role: 'cashier' | 'manager' | 'warehouse' | 'custom';
  permissions: string[];
  photo_url?: string;
  last_login?: string;
  status: 'active' | 'inactive';
  created_at: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function EmployeeManagement() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewModal, setShowNewModal] = useState(false);
  const [showPerformanceModal, setShowPerformanceModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  const authFetch = useAuthFetch();

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      // Obtener el club actual desde localStorage
      const mainClub = JSON.parse(localStorage.getItem('mainClub') || '{}');
      if (!mainClub._id) {
        toast.error('No se encontró el club actual');
        return;
      }
      // API: GET /api/employees/:clubId
      const response = await authFetch(`${API_BASE_URL}/api/employees/${mainClub._id}`);
      const data = await response.json();
      // Se asume que la respuesta es un array o contiene la propiedad "employees"
      setEmployees(Array.isArray(data) ? data : data.employees || []);
    } catch (error) {
      console.error('Error loading employees:', error);
      toast.error('Error al cargar los empleados');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEmployee = async (employeeId: string) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este empleado?')) return;
    try {
      await authFetch(`${API_BASE_URL}/api/employees/${employeeId}`, { method: 'DELETE' });
      setEmployees(employees.filter(emp => emp.id !== employeeId));
      toast.success('Empleado eliminado correctamente');
    } catch (error) {
      console.error('Error deleting employee:', error);
      toast.error('Error al eliminar el empleado');
    }
  };

  const filteredEmployees = employees.filter(employee => {
    const searchLower = searchTerm.toLowerCase();
    return (
      employee.name.toLowerCase().includes(searchLower) ||
      employee.email.toLowerCase().includes(searchLower) ||
      employee.code.toLowerCase().includes(searchLower)
    ) && (filterRole === 'all' || employee.role === filterRole);
  });

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'cashier': return 'Cajero';
      case 'manager': return 'Gerente';
      case 'warehouse': return 'Almacenista';
      case 'custom': return 'Personalizado';
      default: return role;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'cashier': return 'bg-blue-100 text-blue-800';
      case 'manager': return 'bg-purple-100 text-purple-800';
      case 'warehouse': return 'bg-green-100 text-green-800';
      case 'custom': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const openNewModal = () => {
    console.log('Opening New Employee Modal');
    setSelectedEmployee(null);
    setShowNewModal(true);
  };

  const closeNewModal = () => {
    console.log('Closing New Employee Modal');
    setShowNewModal(false);
    setSelectedEmployee(null);
  };

  const saveEmployee = () => {
    console.log('Employee saved, reloading employees');
    loadEmployees();
    closeNewModal();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-4 md:mb-0">Gestión de Empleados</h1>
        <button
          onClick={openNewModal}
          className="inline-flex items-center px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white bg-[#2A5C9A] hover:bg-[#1e4474] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-5 w-5 mr-2" /> Nuevo Empleado
        </button>
      </div>

      <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:w-1/2 mb-4 md:mb-0">
          <Search className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar..."
            className="pl-10 pr-3 py-2 border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="border rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todos los roles</option>
            <option value="cashier">Cajeros</option>
            <option value="manager">Gerentes</option>
            <option value="warehouse">Almacenistas</option>
            <option value="custom">Personalizados</option>
          </select>
        </div>
      </div>

      {employees.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <User className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No tienes empleados registrados</h3>
          <p className="mt-1 text-sm text-gray-500">Agrega tu primer empleado para gestionar tu negocio.</p>
          <button
            onClick={openNewModal}
            className="mt-6 inline-flex items-center px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white bg-[#2A5C9A] hover:bg-[#1e4474] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-5 w-5 mr-2" /> Agregar Empleado
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Empleado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contacto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Último Acceso</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEmployees.map(emp => (
                <tr key={emp.id}>
                  <td className="px-6 py-4 whitespace-nowrap flex items-center">
                    {emp.photo_url ? (
                      <img src={emp.photo_url} alt={emp.name} className="h-10 w-10 rounded-full" />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <User className="h-6 w-6 text-gray-500" />
                      </div>
                    )}
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{emp.name}</div>
                      <div className="text-sm text-gray-500">{emp.code}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{emp.email}</div>
                    {emp.phone && <div className="text-sm text-gray-500">{emp.phone}</div>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeColor(emp.role)}`}>
                      {getRoleLabel(emp.role)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {emp.last_login ? new Date(emp.last_login).toLocaleString() : 'Nunca'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => {
                        setSelectedEmployee(emp);
                        setShowPerformanceModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                      title="Ver desempeño"
                    >
                      <BarChart2 className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedEmployee(emp);
                        setShowNewModal(true);
                      }}
                      className="text-gray-600 hover:text-gray-900 mr-4"
                      title="Editar empleado"
                    >
                      <Edit2 className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteEmployee(emp.id)}
                      className="text-red-600 hover:text-red-900"
                      title="Eliminar empleado"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <NewEmployeeModal
        employee={selectedEmployee}
        onClose={closeNewModal}
        onSave={saveEmployee}
        isOpen={showNewModal}
      />
      {showPerformanceModal && selectedEmployee && (
        <EmployeePerformanceModal
          employee={selectedEmployee}
          onClose={() => {
            setShowPerformanceModal(false);
            setSelectedEmployee(null);
          }}
        />
      )}
    </div>
  );
}


