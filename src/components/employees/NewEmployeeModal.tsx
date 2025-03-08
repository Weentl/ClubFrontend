import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X, Upload, Eye, EyeOff } from 'lucide-react';
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
  status: 'active' | 'inactive';
}

interface Props {
  employee?: Employee | null;
  onClose: () => void;
  onSave: () => void;
  isOpen: boolean;
}

const PERMISSIONS = [
  { id: 'sales', label: 'Acceso a ventas', description: 'Puede realizar y gestionar ventas' },
  { id: 'inventory', label: 'Modificar inventario', description: 'Puede ajustar y gestionar el inventario' },
  { id: 'reports', label: 'Ver reportes financieros', description: 'Acceso a reportes y análisis' },
  { id: 'employees', label: 'Gestionar empleados', description: 'Puede administrar otros empleados' },
];

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function NewEmployeeModal({ employee, onClose, onSave, isOpen }: Props) {
  if (!isOpen) return null;

  const [formData, setFormData] = useState({
    name: employee?.name || '',
    email: employee?.email || '',
    phone: employee?.phone || '',
    role: employee?.role || 'cashier',
    permissions: employee?.permissions || ['sales'],
    photo: null as File | null,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [tempCredentials, setTempCredentials] = useState<{ code: string; password: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(employee?.photo_url || null);
  const authFetch = useAuthFetch();

  // Evitar scroll en el body mientras el modal está abierto
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'auto'; };
  }, []);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, photo: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null) {
          if (key === 'permissions') {
            data.append(key, JSON.stringify(value));
          } else if (value instanceof File) {
            data.append(key, value);
          } else if (Array.isArray(value)) {
            data.append(key, JSON.stringify(value));
          } else {
            data.append(key, value);
          }
        }
      });
      const mainClub = JSON.parse(localStorage.getItem('mainClub') || '{}');
      if (!mainClub._id) {
        toast.error('No se encontró el club actual');
        return;
      }
      data.append('club', mainClub._id);
      const endpoint = employee
        ? `${API_BASE_URL}/api/employees/${employee.id}`
        : `${API_BASE_URL}/api/employees`;
      const method = employee ? 'PUT' : 'POST';
      const response = await authFetch(endpoint, { method, body: data });
      const result = await response.json();
      if (response.ok) {
        if (!employee) {
          setTempCredentials({ code: result.user_code, password: result.temp_password });
        } else {
          toast.success('Empleado actualizado correctamente');
          onSave();
        }
      } else {
        throw new Error(result.message || 'Error al guardar el empleado');
      }
    } catch (error) {
      console.error('Error saving employee:', error);
      toast.error('Error al guardar el empleado');
    }
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 my-8">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-medium">{employee ? 'Editar Empleado' : 'Nuevo Empleado'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500" type="button">
            <X className="h-6 w-6" />
          </button>
        </div>
        {tempCredentials ? (
          <div className="p-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <h4 className="text-green-800 font-medium mb-2">¡Empleado creado exitosamente!</h4>
              <p className="text-sm text-green-700 mb-4">
                Comparte estas credenciales con el empleado para que pueda iniciar sesión:
              </p>
              <div className="space-y-2">
                <div className="bg-white p-3 rounded border border-green-200">
                  <p className="text-sm font-medium text-gray-700">Código de usuario:</p>
                  <p className="text-lg font-mono">{tempCredentials.code}</p>
                </div>
                <div className="bg-white p-3 rounded border border-green-200">
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-sm font-medium text-gray-700">Contraseña temporal:</p>
                    <button onClick={() => setShowPassword(!showPassword)} className="text-gray-500 hover:text-gray-700" type="button">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="text-lg font-mono">{showPassword ? tempCredentials.password : '••••••••'}</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-4">
                Nota: Por seguridad, el empleado deberá cambiar su contraseña en el primer inicio de sesión.
              </p>
            </div>
            <div className="flex justify-end">
              <button onClick={onClose} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200" type="button">
                Cerrar
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6">
            <div className="mb-6 flex justify-center">
              <div onClick={() => fileInputRef.current?.click()} className="relative cursor-pointer group">
                {photoPreview ? (
                  <img src={photoPreview} alt="Preview" className="h-32 w-32 rounded-full object-cover border-4 border-gray-200" />
                ) : (
                  <div className="h-32 w-32 rounded-full bg-gray-200 flex items-center justify-center border-4 border-gray-200">
                    <Upload className="h-8 w-8 text-gray-400" />
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-white text-sm">Cambiar foto</span>
                </div>
              </div>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoChange} />
            </div>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nombre completo*</label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Correo electrónico*</label>
                <input
                  type="email"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                <input
                  type="tel"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Rol*</label>
                <select
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  value={formData.role}
                  onChange={(e) => {
                    const newRole = e.target.value as typeof formData.role;
                    setFormData({ ...formData, role: newRole, permissions: newRole === 'custom' ? [] : ['sales'] });
                  }}
                >
                  <option value="cashier">Cajero</option>
                  <option value="manager">Gerente</option>
                  <option value="warehouse">Almacenista</option>
                  <option value="custom">Personalizado</option>
                </select>
              </div>
              {formData.role === 'custom' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Permisos</label>
                  <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                    {PERMISSIONS.map((permission) => (
                      <div key={permission.id} className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            type="checkbox"
                            checked={formData.permissions.includes(permission.id)}
                            onChange={(e) => {
                              const newPermissions = e.target.checked
                                ? [...formData.permissions, permission.id]
                                : formData.permissions.filter(p => p !== permission.id);
                              setFormData({ ...formData, permissions: newPermissions });
                            }}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                        </div>
                        <div className="ml-3">
                          <label className="text-sm font-medium text-gray-700">{permission.label}</label>
                          <p className="text-xs text-gray-500">{permission.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#2A5C9A] hover:bg-[#1e4474]"
              >
                {employee ? 'Actualizar' : 'Crear Empleado'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>,
    document.body
  );
}

