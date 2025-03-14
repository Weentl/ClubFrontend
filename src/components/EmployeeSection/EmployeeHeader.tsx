// src/components/EmployeeHeader.tsx
import React, { useState, useEffect } from 'react';
import { Bell, LogOut } from 'lucide-react';
import { Employee } from '../types/employee';
import { useAuth } from '../auth/AuthContext';
import { useAuthFetch } from '../utils/authFetch';

interface Props {
  employee: Employee;
  onProfileClick: () => void;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function EmployeeHeader({ employee, onProfileClick }: Props) {
  const { signOut } = useAuth();
  const authFetch = useAuthFetch();
  const [club, setClub] = useState<{ name: string } | null>(null);

  // Recupera el usuario almacenado en localStorage y parsea su fullName
  const storedUser = localStorage.getItem('user');
  let localName = '';
  if (storedUser) {
    try {
      const parsedUser = JSON.parse(storedUser);
      localName = parsedUser.fullName || '';
    } catch (error) {
      console.error("Error parseando el usuario del localStorage:", error);
    }
  }

  // Si la propiedad fullName de employee no existe, usamos la recuperada del localStorage
  const displayName = employee.fullName || localName || 'Usuario sin nombre';

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'inactive':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  useEffect(() => {
    async function fetchClub() {
      if (!employee?.id) return;
      console.log('Fetching club for employee:', employee.id);
      
      try {
        // Usamos el endpoint para obtener el club asociado al empleado
        const res = await authFetch(`${API_BASE_URL}/api/employees/club/${employee.id}`);
        if (res.ok) {
          const clubData = await res.json();
          setClub(clubData);
        } else {
          console.error("Error fetching club:", res.statusText);
        }
      } catch (error) {
        console.error('Error fetching club', error);
      }
    }
    fetchClub();
  }, [employee?.id, authFetch]);

  if (!employee) {
    return (
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>Cargando información del empleado...</div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div 
              className="flex-shrink-0 cursor-pointer"
              onClick={onProfileClick}
            >
              <div className="h-10 w-10 rounded-full bg-[#2A5C9A] flex items-center justify-center text-white font-semibold">
                {displayName.charAt(0).toUpperCase()}
              </div>
            </div>
            <div className="ml-4">
              <h1 
                className="text-lg font-semibold text-gray-900 cursor-pointer hover:text-[#2A5C9A]"
                onClick={onProfileClick}
              >
                {displayName}
              </h1>
              <div className="flex items-center">
                <div className={`h-2 w-2 rounded-full ${getStatusColor(employee.is_active ? 'active' : 'inactive')} mr-2`}></div>
                <p className="text-sm text-gray-500">
                  {employee.role ? `${employee.role.charAt(0).toUpperCase()}${employee.role.slice(1)}` : 'Sin rol'}
                  {club && (
                    <span className="ml-2 text-[#2A5C9A]">• {club.name}</span>
                  )}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button className="p-2 rounded-full text-gray-400 hover:text-gray-500 hover:bg-gray-100">
              <Bell className="h-6 w-6" />
            </button>
            <button 
              onClick={() => signOut()}
              className="flex items-center px-4 py-2 text-sm font-medium text-red-600 rounded-md hover:bg-red-50"
            >
              <LogOut className="h-5 w-5 mr-2" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
