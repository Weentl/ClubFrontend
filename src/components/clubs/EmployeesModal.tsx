import { useState, useEffect } from 'react';
import { X, UserPlus, Edit2, Trash2, Mail, User, Shield } from 'lucide-react';
import { Club, Employee, EmployeeFormData } from '../types/clubs';
import { api } from '../lib/api';
import toast from 'react-hot-toast';

interface Props {
  club: Club;
  onClose: () => void;
}

const PERMISSIONS = [
  { id: 'sales', label: 'Ventas', icon: '🛒' },
  { id: 'inventory', label: 'Inventario', icon: '📦' },
  { id: 'reports', label: 'Reportes', icon: '📊' },
  { id: 'employees', label: 'Empleados', icon: '👥' },
  { id: 'settings', label: 'Configuración', icon: '⚙️' },
];

export default function EmployeesModal({ club, onClose }: Props) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState<EmployeeFormData>({
    name: '',
    email: '',
    role: 'employee',
    permissions: ['sales'],
  });

  useEffect(() => {
    loadEmployees();
  }, [club.id]);

  const loadEmployees = async () => {
    try {
      const data = await api.getEmployees(club.id);
      setEmployees(data);
    } catch (error) {
      console.error('Error loading employees:', error);
      toast.error('Error al cargar los empleados');
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmployee = async () => {
    try {
      const newEmployee = await api.createEmployee(club.id, formData);
      setEmployees([...employees, newEmployee]);
      setShowAddForm(false);
      resetForm();
      toast.success('Empleado añadido exitosamente');
    } catch (error) {
      console.error('Error adding employee:', error);
      toast.error('Error al añadir el empleado');
    }
  };

  const handleUpdateEmployee = async () => {
    if (!selectedEmployee) return;
    
    try {
      const updatedEmployee = await api.updateEmployee(selectedEmployee.id, formData);
      setEmployees(
        employees.map((emp) =>
          emp.id === updatedEmployee.id ? updatedEmployee : emp
        )
      );
      setShowEditForm(false);
      setSelectedEmployee(null);
      resetForm();
      toast.success('Empleado actualizado exitosamente');
    } catch (error) {
      console.error('Error updating employee:', error);
      toast.error('Error al actualizar el empleado');
    }
  };

  const handleDeleteEmployee = async (employeeId: string) => {
    try {
      await api.deleteEmployee(employeeId);
      setEmployees(employees.filter((emp) => emp.id !== employeeId));
      toast.success('Empleado eliminado exitosamente');
    } catch (error) {
      console.error('Error deleting employee:', error);
      toast.error('No se puede eliminar al dueño del club');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      role: 'employee',
      permissions: ['sales'],
    });
  };

  const editEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setFormData({
      name: employee.name,
      email: employee.email,
      role: employee.role,
      permissions: employee.permissions,
    });
    setShowEditForm(true);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Nunca';
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRoleName = (role: string) => {
    switch (role) {
      case 'owner': return 'Dueño';
      case 'manager': return 'Gerente';
      case 'employee': return 'Empleado';
      default: return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-purple-100 text-purple-800';
      case 'manager': return 'bg-blue-100 text-blue-800';
      case 'employee': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-medium">
            Empleados: {club.name}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#2A5C9A]"></div>
              <p className="mt-2 text-gray-500">Cargando empleados...</p>
            </div>
          ) : (
            <>
              {employees.length === 0 && !showAddForm ? (
                <div className="text-center py-8">
                  <User className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No hay empleados</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Añade tu primer empleado para comenzar 🧑‍💼
                  </p>
                  <div className="mt-6">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(true)}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#2A5C9A] hover:bg-[#1e4474] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <UserPlus className="h-5 w-5 mr-2" />
                      Añadir Empleado
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {!showAddForm && !showEditForm && (
                    <div className="mb-4 flex justify-between items-center">
                      <h4 className="text-lg font-medium">Lista de Empleados</h4>
                      <button
                        onClick={() => setShowAddForm(true)}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#28A745] hover:bg-[#218838] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        <UserPlus className="h-4 w-4 mr-1" />
                        Añadir
                      </button>
                    </div>
                  )}

                  {showAddForm && (
                    <div className="bg-gray-50 p-4 rounded-lg mb-6">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-lg font-medium">Añadir Nuevo Empleado</h4>
                        <button
                          onClick={() => {
                            setShowAddForm(false);
                            resetForm();
                          }}
                          className="text-gray-400 hover:text-gray-500"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Nombre*
                          </label>
                          <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <User className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                              type="text"
                              required
                              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              placeholder="Nombre completo"
                              value={formData.name}
                              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Email*
                          </label>
                          <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Mail className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                              type="email"
                              required
                              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              placeholder="correo@ejemplo.com"
                              value={formData.email}
                              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Rol
                          </label>
                          <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Shield className="h-5 w-5 text-gray-400" />
                            </div>
                            <select
                              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              value={formData.role}
                              onChange={(e) => setFormData({ ...formData, role: e.target.value as 'owner' | 'manager' | 'employee' })}
                            >
                              <option value="employee">Empleado</option>
                              <option value="manager">Gerente</option>
                              <option value="owner">Dueño</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Permisos
                          </label>
                          <div className="space-y-2">
                            {PERMISSIONS.map((perm) => (
                              <div key={perm.id} className="flex items-center">
                                <input
                                  id={`perm-${perm.id}`}
                                  type="checkbox"
                                  className="h-4 w-4 text-[#2A5C9A] focus:ring-[#2A5C9A] border-gray-300 rounded"
                                  checked={formData.permissions.includes(perm.id)}
                                  onChange={(e) => {
                                    const newPermissions = e.target.checked
                                      ? [...formData.permissions, perm.id]
                                      : formData.permissions.filter((p) => p !== perm.id);
                                    setFormData({ ...formData, permissions: newPermissions });
                                  }}
                                />
                                <label htmlFor={`perm-${perm.id}`} className="ml-2 block text-sm text-gray-900">
                                  {perm.icon} {perm.label}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="flex justify-end pt-2">
                          <button
                            type="button"
                            onClick={handleAddEmployee}
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#2A5C9A] hover:bg-[#1e4474] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            Guardar Empleado
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {showEditForm && selectedEmployee && (
                    <div className="bg-gray-50 p-4 rounded-lg mb-6">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-lg font-medium">Editar Empleado</h4>
                        <button
                          onClick={() => {
                            setShowEditForm(false);
                            setSelectedEmployee(null);
                            resetForm();
                          }}
                          className="text-gray-400 hover:text-gray-500"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Nombre*
                          </label>
                          <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <User className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                              type="text"
                              required
                              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              placeholder="Nombre completo"
                              value={formData.name}
                              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Email*
                          </label>
                          <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Mail className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                              type="email"
                              required
                              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              placeholder="correo@ejemplo.com"
                              value={formData.email}
                              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Rol
                          </label>
                          <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Shield className="h-5 w-5 text-gray-400" />
                            </div>
                            <select
                              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              value={formData.role}
                              onChange={(e) => setFormData({ ...formData, role: e.target.value as 'owner' | 'manager' | 'employee' })}
                              disabled={selectedEmployee.role === 'owner'}
                            >
                              <option value="employee">Empleado</option>
                              <option value="manager">Gerente</option>
                              <option value="owner">Dueño</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Permisos
                          </label>
                          <div className="space-y-2">
                            {PERMISSIONS.map((perm) => (
                              <div key={perm.id} className="flex items-center">
                                <input
                                  id={`edit-perm-${perm.id}`}
                                  type="checkbox"
                                  className="h-4 w-4 text-[#2A5C9A] focus:ring-[#2A5C9A] border-gray-300 rounded"
                                  checked={formData.permissions.includes(perm.id)}
                                  onChange={(e) => {
                                    const newPermissions = e.target.checked
                                      ? [...formData.permissions, perm.id]
                                      : formData.permissions.filter((p) => p !== perm.id);
                                    setFormData({ ...formData, permissions: newPermissions });
                                  }}
                                  disabled={selectedEmployee.role === 'owner' && ['sales', 'inventory', 'reports', 'employees', 'settings'].includes(perm.id)}
                                />
                                <label htmlFor={`edit-perm-${perm.id}`} className="ml-2 block text-sm text-gray-900">
                                  {perm.icon} {perm.label}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="flex justify-end pt-2">
                          <button
                            type="button"
                            onClick={handleUpdateEmployee}
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#2A5C9A] hover:bg-[#1e4474] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            Actualizar Empleado
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {!showAddForm && !showEditForm && employees.length > 0 && (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Nombre
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Rol
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Permisos
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Último Acceso
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Acciones
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {employees.map((employee) => (
                            <tr key={employee.id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                    <User className="h-6 w-6 text-gray-500" />
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">
                                      {employee.name}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {employee.email}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleColor(employee.role)}`}>
                                  {getRoleName(employee.role)}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex flex-wrap gap-1">
                                  {employee.permissions.map((perm) => {
                                    const permission = PERMISSIONS.find(p => p.id === perm);
                                    return permission ? (
                                      <span 
                                        key={perm} 
                                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                                        title={permission.label}
                                      >
                                        {permission.icon}
                                      </span>
                                    ) : null;
                                  })}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(employee.last_access)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button
                                  onClick={() => editEmployee(employee)}
                                  className="text-blue-600 hover:text-blue-900 mr-4"
                                  title="Editar empleado"
                                >
                                  <Edit2 className="h-5 w-5" />
                                </button>
                                {employee.role !== 'owner' && (
                                  <button
                                    onClick={() => handleDeleteEmployee(employee.id)}
                                    className="text-red-600 hover:text-red-900"
                                    title="Eliminar empleado"
                                  >
                                    <Trash2 className="h-5 w-5" />
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
