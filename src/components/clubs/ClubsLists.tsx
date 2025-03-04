import { useState, useEffect } from 'react';
import { Search, Plus, MapPin, Users, Package, DollarSign, Edit, Trash2, UserPlus } from 'lucide-react';
import { Club } from '../types/clubs';
import { api } from '../lib/api'; // Asegúrate de usar el api actualizado
import ClubFormModal from './ClubFormModal';
import EmployeesModal from './EmployeesModal';
import toast from 'react-hot-toast';


export default function ClubsList() {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'sales'>('recent');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showEmployeesModal, setShowEmployeesModal] = useState(false);
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);

  useEffect(() => {
    loadClubs();
  }, []);

  const loadClubs = async () => {
    try {
      const data = await api.getClubs();
      setClubs(data);
    } catch (error) {
      console.error('Error loading clubs:', error);
      toast.error('Error al cargar los clubs');
    } finally {
      setLoading(false);
    }
  };

  const handleAddClub = (newClub: Club) => {
    setClubs([...clubs, newClub]);
    setShowAddModal(false);
    toast.success('Club creado exitosamente');
  };

  const handleUpdateClub = (updatedClub: Club) => {
    setClubs(clubs.map((club) => club.id === updatedClub.id ? updatedClub : club));
    setShowEditModal(false);
    setSelectedClub(null);
    toast.success('Club actualizado exitosamente');
  };

  const handleDeleteClub = async (clubId: string) => {
    try {
      await api.deleteClub(clubId);
      setClubs(clubs.filter((club) => club.id !== clubId));
      toast.success('Club eliminado exitosamente');
    } catch (error) {
      console.error('Error deleting club:', error);
      toast.error('No se puede eliminar un club con empleados');
    }
  };

  const handleToggleActive = async (club: Club) => {
    try {
      const updatedClub = await api.updateClub(club.id, { is_active: !club.is_active });
      setClubs(clubs.map((c) => c.id === updatedClub.id ? updatedClub : c));
      toast.success(`Club ${updatedClub.is_active ? 'activado' : 'desactivado'} exitosamente`);
    } catch (error) {
      console.error('Error toggling club status:', error);
      toast.error('Error al cambiar el estado del club');
    }
  };

  // Se usa fallback para club.name o club.clubName
  const filteredClubs = clubs.filter((club) => {
    const clubName = (club.name || club.clubName || '').toLowerCase();
    const clubAddress = (club.address || '').toLowerCase();
    return (
      clubName.includes(searchTerm.toLowerCase()) ||
      clubAddress.includes(searchTerm.toLowerCase())
    );
  });

  const sortedClubs = [...filteredClubs].sort((a, b) => {
    if (sortBy === 'sales') {
      return b.monthly_sales - a.monthly_sales;
    } else {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  return (
    <div>
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Buscar por nombre o dirección..."
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
                onChange={(e) => setSortBy(e.target.value as 'recent' | 'sales')}
              >
                <option value="recent">Más recientes</option>
                <option value="sales">Mayor venta</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#2A5C9A]"></div>
            <p className="mt-2 text-gray-500">Cargando clubs...</p>
          </div>
        ) : sortedClubs.length === 0 ? (
          <div className="p-8 text-center">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <MapPin className="h-12 w-12" />
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay clubs</h3>
            <p className="mt-1 text-sm text-gray-500">
              Comienza creando tu primer club.
            </p>
            <div className="mt-6">
              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#2A5C9A] hover:bg-[#1e4474] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="h-5 w-5 mr-2" />
                Nuevo Club
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {sortedClubs.map((club) => (
              <div
                key={club.id}
                className="bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center">
                      {club.logo_url ? (
                        <img
                          src={club.logo_url}
                          alt={club.name || club.clubName}
                          className="h-12 w-12 rounded-full object-cover mr-3"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-full bg-[#2A5C9A] flex items-center justify-center text-white mr-3">
                          {(club.name || club.clubName || '').charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 flex items-center">
                          {club.name || club.clubName}
                          <span
                            className={`ml-2 inline-block h-3 w-3 rounded-full ${
                              club.is_active ? 'bg-green-500' : 'bg-red-500'
                            }`}
                            title={club.is_active ? 'Activo' : 'Inactivo'}
                          ></span>
                        </h3>
                        <p className="text-sm text-gray-500 flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {club.address}
                        </p>
                      </div>
                    </div>
                    <div>
                      <button
                        onClick={() => handleToggleActive(club)}
                        className={`text-xs font-medium px-2 py-1 rounded ${
                          club.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {club.is_active ? '🟢 Activo' : '🔴 Inactivo'}
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2">
                    <div className="bg-gray-50 p-2 rounded">
                      <div className="flex items-center text-sm text-gray-500">
                        <Users className="h-4 w-4 mr-1" />
                        <span>{club.employee_count}</span>
                      </div>
                      <p className="text-xs text-gray-500">Empleados</p>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <div className="flex items-center text-sm text-gray-500">
                        <DollarSign className="h-4 w-4 mr-1" />
                        <span>${club.monthly_sales.toLocaleString()}</span>
                      </div>
                      <p className="text-xs text-gray-500">Ventas</p>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <div className="flex items-center text-sm text-gray-500">
                        <Package className="h-4 w-4 mr-1" />
                        <span>{club.inventory_count}</span>
                      </div>
                      <p className="text-xs text-gray-500">Productos</p>
                    </div>
                  </div>

                  {club.schedule && (
                    <p className="mt-3 text-xs text-gray-500">
                      <span className="font-medium">Horario:</span> {club.schedule}
                    </p>
                  )}

                  <div className="mt-4 flex justify-between">
                    <button
                      onClick={() => {
                        setSelectedClub(club);
                        setShowEditModal(true);
                      }}
                      className="text-[#2A5C9A] hover:text-[#1e4474] text-sm flex items-center"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </button>
                    <button
                      onClick={() => {
                        setSelectedClub(club);
                        setShowEmployeesModal(true);
                      }}
                      className="text-[#6F42C1] hover:text-[#5a32a3] text-sm flex items-center"
                    >
                      <UserPlus className="h-4 w-4 mr-1" />
                      Empleados
                    </button>
                    {club.employee_count === 0 && (
                      <button
                        onClick={() => handleDeleteClub(club.id)}
                        className="text-red-600 hover:text-red-800 text-sm flex items-center"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Eliminar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Add Button */}
      <button
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-8 right-8 bg-[#2A5C9A] hover:bg-[#1e4474] text-white rounded-full p-4 shadow-lg"
        title="Añadir club"
      >
        <Plus className="h-6 w-6" />
      </button>

      {/* Modals */}
      {showAddModal && (
        <ClubFormModal
          onClose={() => setShowAddModal(false)}
          onSave={handleAddClub}
        />
      )}

      {showEditModal && selectedClub && (
        <ClubFormModal
          club={selectedClub}
          onClose={() => {
            setShowEditModal(false);
            setSelectedClub(null);
          }}
          onSave={handleUpdateClub}
        />
      )}

      {showEmployeesModal && selectedClub && (
        <EmployeesModal
          club={selectedClub}
          onClose={() => {
            setShowEmployeesModal(false);
            setSelectedClub(null);
          }}
        />
      )}
    </div>
  );
}

