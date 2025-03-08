import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuthFetch } from '../utils/authFetch';
import { useAuth } from '../auth/AuthContext';

interface Props {
  employeeId?: string;
  onPasswordChanged: () => void;
}
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
export default function EmployeeChangePassword({ employeeId, onPasswordChanged }: Props) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const authFetch = useAuthFetch();
  const { user } = useAuth();
  
  // Si no se pasa employeeId, se usa el id del usuario autenticado
  const effectiveEmployeeId = employeeId || user?.id;

  if (!effectiveEmployeeId) {
    console.error('No se encontró employeeId.');
    return <div>Error: No se encontró el empleado.</div>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }
    setLoading(true);
    try {
      // Llamada al endpoint para actualizar la contraseña y marcar que ya no es el primer login
      const response = await authFetch(`${API_BASE_URL}/api/employees/${effectiveEmployeeId}/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword }),
      });
      if (!response.ok) {
        throw new Error('Error al cambiar la contraseña');
      }
      toast.success('Contraseña cambiada correctamente');
      onPasswordChanged();
    } catch (error: any) {
      toast.error(error.message || 'Error al cambiar la contraseña');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow rounded">
      <h2 className="text-2xl font-semibold mb-4">Cambiar contraseña</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Nueva contraseña</label>
          <input
            type="password"
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Confirmar contraseña</label>
          <input
            type="password"
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
        >
          {loading ? 'Cambiando...' : 'Cambiar contraseña'}
        </button>
      </form>
    </div>
  );
}

