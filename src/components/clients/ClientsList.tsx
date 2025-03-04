// clientlist.tsx
import  { useState, useEffect } from 'react';
import { Search, Plus, Eye, Edit2, Phone } from 'lucide-react';
import { Client } from '../types/clients';
import ClientFormModal from './ClientFormModal';
import ClientHistoryModal from './ClientHistoryModal';
import axiosInstance from '../utils/axiosInstance';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
// Extraer club actual del localStorage
const mainClubStr = localStorage.getItem('mainClub');
const CLUB_ID = mainClubStr ? JSON.parse(mainClubStr).id : null;

export default function ClientsList() {
  
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'frequent' | 'spending'>('frequent');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const response = await axiosInstance.get(`${API_BASE_URL}/api/clients`, {
        params: { club_id: CLUB_ID },
      });
      setClients(response.data);
    } catch (error) {
      console.error('Error loading clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddClient = (newClient: Client) => {
    setClients([...clients, newClient]);
    setShowAddModal(false);
  };

  const handleUpdateClient = (updatedClient: Client) => {
    setClients(
      clients.map((client) =>
        client.id === updatedClient.id ? updatedClient : client
      )
    );
    setShowEditModal(false);
    setSelectedClient(null);
  };

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client.phone && client.phone.includes(searchTerm))
  );

  const sortedClients = [...filteredClients].sort((a, b) => {
    if (sortBy === 'spending') {
      return b.total_spent - a.total_spent;
    } else {
      // Ordenar por última compra
      if (!a.last_purchase) return 1;
      if (!b.last_purchase) return -1;
      return new Date(b.last_purchase).getTime() - new Date(a.last_purchase).getTime();
    }
  });

  const getClientTypeIcon = (type: string) => {
    switch (type) {
      case 'occasional':
        return '🔵';
      case 'regular':
        return '🟢';
      case 'wholesale':
        return '🟣';
      default:
        return '⚪';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Nunca';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) return <p className="py-6 text-center">Cargando clientes...</p>;

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Mis Clientes</h1>
        </div>

        <div className="mt-6 bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <div className="flex flex-wrap gap-4 items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="Buscar por nombre o teléfono..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
              <div className="flex gap-4">
                <select
                  className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={sortBy}
                  onChange={(e) =>
                    setSortBy(e.target.value as 'frequent' | 'spending')
                  }
                >
                  <option value="frequent">Más frecuentes</option>
                  <option value="spending">Mayor gasto</option>
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Teléfono
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Compras
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Última Visita
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedClients.map((client) => (
                  <tr key={client.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-gray-900">
                          {client.name}{' '}
                          <span title={`Cliente ${client.type}`}>
                            {getClientTypeIcon(client.type)}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500">
                        {client.phone ? (
                          <>
                            <Phone className="h-4 w-4 mr-1" />
                            {client.phone}
                          </>
                        ) : (
                          <span className="text-gray-400">No registrado</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        ${client.total_spent.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {formatDate(client.last_purchase)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => {
                          setSelectedClient(client);
                          setShowHistoryModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                        title="Ver historial"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedClient(client);
                          setShowEditModal(true);
                        }}
                        className="text-gray-600 hover:text-gray-900"
                        title="Editar cliente"
                      >
                        <Edit2 className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Botón flotante para agregar cliente */}
      <button
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-8 right-8 bg-[#28A745] hover:bg-[#218838] text-white rounded-full p-4 shadow-lg"
        title="Añadir cliente"
      >
        <Plus className="h-6 w-6" />
      </button>

      {/* Modales */}
      {showAddModal && (
        <ClientFormModal
          onClose={() => setShowAddModal(false)}
          onSave={handleAddClient}
        />
      )}

      {showEditModal && selectedClient && (
        <ClientFormModal
          client={selectedClient}
          onClose={() => {
            setShowEditModal(false);
            setSelectedClient(null);
          }}
          onSave={handleUpdateClient}
        />
      )}

      {showHistoryModal && selectedClient && (
        <ClientHistoryModal
          client={selectedClient}
          onClose={() => {
            setShowHistoryModal(false);
            setSelectedClient(null);
          }}
        />
      )}
    </div>
  );
}

