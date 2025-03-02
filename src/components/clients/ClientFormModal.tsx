// clientformmodal.tsx
import React, { useState } from 'react';
import { X, User, Phone, Mail, Tag } from 'lucide-react';
import { Client, ClientFormData } from '../types/clients';
import axios from 'axios';

interface Props {
  client?: Client;
  onClose: () => void;
  onSave: (client: Client) => void;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Extraer el club actual del localStorage
const mainClubStr = localStorage.getItem('mainClub');
const CLUB_ID = mainClubStr ? JSON.parse(mainClubStr).id : null;

const PREFERENCES = [
  { id: 'supplements', label: 'Suplementos' },
  { id: 'food', label: 'Alimentos' },
  { id: 'snacks', label: 'Snacks' },
];

export default function ClientFormModal({ client, onClose, onSave }: Props) {
  const [formData, setFormData] = useState<ClientFormData>({
    name: client?.name || '',
    phone: client?.phone || '',
    email: client?.email || '',
    type: client?.type || 'occasional',
    preferences: client?.preferences || [],
  });

  const [showAdvanced, setShowAdvanced] = useState(!!client);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (client) {
        // Actualizar cliente existente
        const response = await axios.patch(`${API_BASE_URL}/api/clients/${client.id || client._id}`, formData);
        // Mapear _id a id en caso de ser necesario
        const updatedClient = { ...response.data, id: response.data._id };
        onSave(updatedClient);
      } else {
        // Al crear un cliente nuevo, incluir club_id
        const payload = { ...formData, club_id: CLUB_ID };
        const response = await axios.post(`${API_BASE_URL}/api/clients`, payload);
        // Mapear _id a id para que el cliente tenga la propiedad id definida
        const newClient = { ...response.data, id: response.data._id };
        onSave(newClient);
      }
    } catch (error) {
      console.error('Error saving client:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-medium">
            {client ? 'Editar Cliente' : 'Nuevo Cliente'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Nombre*
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="name"
                required
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Nombre completo"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Teléfono
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="tel"
                id="phone"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="+52 123 456 7890"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                id="email"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="cliente@ejemplo.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          {!showAdvanced && (
            <button
              type="button"
              className="text-sm text-[#6F42C1] hover:text-[#5a32a3] font-medium"
              onClick={() => setShowAdvanced(true)}
            >
              + Mostrar campos adicionales
            </button>
          )}

          {showAdvanced && (
            <>
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                  Tipo de cliente
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Tag className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    id="type"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        type: e.target.value as 'occasional' | 'regular' | 'wholesale',
                      })
                    }
                  >
                    <option value="occasional">Ocasional</option>
                    <option value="regular">Regular</option>
                    <option value="wholesale">Mayorista</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferencias
                </label>
                <div className="space-y-2">
                  {PREFERENCES.map((pref) => (
                    <div key={pref.id} className="flex items-center">
                      <input
                        id={`pref-${pref.id}`}
                        type="checkbox"
                        className="h-4 w-4 text-[#6F42C1] focus:ring-[#6F42C1] border-gray-300 rounded"
                        checked={formData.preferences.includes(pref.id)}
                        onChange={(e) => {
                          const newPreferences = e.target.checked
                            ? [...formData.preferences, pref.id]
                            : formData.preferences.filter((p) => p !== pref.id);
                          setFormData({ ...formData, preferences: newPreferences });
                        }}
                      />
                      <label htmlFor={`pref-${pref.id}`} className="ml-2 block text-sm text-gray-900">
                        {pref.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#28A745] hover:bg-[#218838] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              {client ? 'Actualizar' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
