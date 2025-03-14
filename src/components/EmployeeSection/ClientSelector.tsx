// clientselector.tsx
import { useState, useEffect, useRef } from 'react';
import { Search, Plus, X } from 'lucide-react';
import { Client } from '../types/clients';
import ClientFormModal from '../clients/ClientFormModal';
import axiosInstance from '../utils/axiosInstance';



interface Props {
  onSelectClient: (client: Client | null) => void;
  selectedClient: Client | null;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const storedClub = localStorage.getItem('mainClub');
const CLUB_ID = storedClub ? JSON.parse(storedClub) : null;

export default function ClientSelector({ onSelectClient, selectedClient }: Props) {
  const [searchTerm, setSearchTerm] = useState('');
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    loadClients();

    // Cerrar dropdown al hacer click afuera
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = clients.filter(client =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (client.phone && client.phone.includes(searchTerm))
      );
      setFilteredClients(filtered);
    } else {
      setFilteredClients(clients.slice(0, 5));
    }
  }, [searchTerm, clients]);

  const loadClients = async () => {
    try {
      const response = await axiosInstance.get(`${API_BASE_URL}/api/clients`, {
        params: { club_id: CLUB_ID },
      });
      const data = response.data.map((client: any) => ({
        ...client,
        id: client._id || client.id,
      }));
      setClients(data);
      setFilteredClients(response.data.slice(0, 5));
    } catch (error) {
      console.error('Error loading clients:', error);
    }
  };

  const handleAddClient = (newClient: Client) => {
    setClients([...clients, newClient]);
    onSelectClient(newClient);
    setShowAddModal(false);
    setSearchTerm('');
  };

  const handleSelectClient = (client: Client) => {
    onSelectClient(client);
    setShowDropdown(false);
    setSearchTerm('');
  };

  const getClientTypeIcon = (type: string) => {
    switch (type) {
      case 'occasional': return '🔵';
      case 'regular': return '🟢';
      case 'wholesale': return '🟣';
      default: return '⚪';
    }
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>

      {selectedClient ? (
        <div className="flex items-center justify-between p-2 border border-gray-300 rounded-md bg-gray-50">
          <div className="flex items-center">
            <span className="mr-2">{getClientTypeIcon(selectedClient.type)}</span>
            <div>
              <div className="font-medium">{selectedClient.name}</div>
              <div className="text-sm text-gray-500">
                {selectedClient.phone && <span className="mr-2">📞 {selectedClient.phone}</span>}
                <span>💰 Total: ${selectedClient.total_spent.toFixed(2)}</span>
              </div>
            </div>
          </div>
          <button onClick={() => onSelectClient(null)} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>
      ) : (
        <div className="relative" ref={dropdownRef}>
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar cliente por nombre o teléfono..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>

          {showDropdown && (
            <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md max-h-60 overflow-auto">
              <ul className="py-1">
                {filteredClients.map((client) => (
                  <li
                    key={client.id}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleSelectClient(client)}
                  >
                    <div className="flex items-center">
                      <span className="mr-2">{getClientTypeIcon(client.type)}</span>
                      <div>
                        <div className="font-medium">{client.name}</div>
                        {client.phone && (
                          <div className="text-sm text-gray-500">{client.phone}</div>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
                {filteredClients.length === 0 && (
                  <li className="px-4 py-2 text-gray-500">No se encontraron clientes</li>
                )}
                <li className="border-t">
                  <button
                    className="w-full px-4 py-2 text-left text-[#28A745] hover:bg-gray-100 flex items-center"
                    onClick={() => {
                      setShowAddModal(true);
                      setShowDropdown(false);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Nuevo Cliente
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      )}

      {showAddModal && (
        <ClientFormModal
          onClose={() => setShowAddModal(false)}
          onSave={handleAddClient}
        />
      )}
    </div>
  );
}

