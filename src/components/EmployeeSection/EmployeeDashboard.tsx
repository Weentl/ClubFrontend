// src/components/EmployeeDashboard.tsx
import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useAuth } from '../auth/AuthContext';
import EmployeeHeader from './EmployeeHeader';
import { Employee } from '../types/employee';
import {
  ShoppingCart,
  DollarSign,
  Package,
  Users,
  TrendingUp,
  Clock,
  AlertTriangle,
  Settings,
  ChevronRight,
  Plus,
  HelpCircle
} from 'lucide-react';
import NewSaleModal from './NewSaleModalEmployee';
import ClientFormModal from './ClientFormModalEmployee';
import ExpenseFormModal from './ExpenseFormModal';
import { Sale } from '../types/sales';
import { Client } from '../types/clients';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAuthFetch } from '../utils/authFetch';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function formatLocalDate(dateStr: string): string {
  const dateStrLocalTime = dateStr.endsWith('Z') ? dateStr.slice(0, -1) : dateStr;
  const date = new Date(dateStrLocalTime);
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: true,
  };
  return date.toLocaleString(undefined, options);
}

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const authFetch = useAuthFetch();

  // Estados para ventas mensuales y paginación
  const [allSales, setAllSales] = useState<Sale[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(allSales.length / itemsPerPage);
  const [employeeSales, setEmployeeSales] = useState<Sale[]>([]);

  // Otros estados
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showNewSaleModal, setShowNewSaleModal] = useState<boolean>(false);
  const [showNewClientModal, setShowNewClientModal] = useState<boolean>(false);
  const [showExpenseModal, setShowExpenseModal] = useState<boolean>(false);
  const [showProfileMenu, setShowProfileMenu] = useState<boolean>(false);
  const [showEditProfile, setShowEditProfile] = useState<boolean>(false);
  const [recentClients, setRecentClients] = useState<Client[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<any[]>([]);
  const [clubName, setClubName] = useState<string>('No asignado');
  const [showTooltip, setShowTooltip] = useState<string | null>(null);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  // Estado para formulario de perfil (campos controlados)
  const [profileFormData, setProfileFormData] = useState({
    fullName: '',
    email: '',
    phone: ''
  });

  // Función para obtener el club desde localStorage (se espera que sea un string con el id)
  const getMainClub = (): string | null => {
    const storedClub = localStorage.getItem('mainClub');
    return storedClub ? JSON.parse(storedClub) : null;
  };

  useEffect(() => {
    loadEmployeeData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Cargar productos bajos cuando ya se obtuvo el empleado
  useEffect(() => {
    if (showEditProfile && employee) {
      setProfileFormData({
        fullName: employee.fullName || '',
        email: employee.email || '',
        phone: employee.phone || ''
      });
    }
  }, [showEditProfile, employee]);

  // Función para cargar la información del empleado, club, ventas y clientes
  const loadEmployeeData = async () => {
    try {
      if (!user) throw new Error('User is not authenticated');

      // Cargar datos actualizados del empleado
      const userRes = await authFetch(`${API_BASE_URL}/api/employees/${user.id}`);
      if (!userRes.ok) throw new Error('Error fetching user data');
      const fetchedUser: Employee = await userRes.json();
      setEmployee(fetchedUser);

      // Obtener información del club asociado al empleado
      const clubRes = await authFetch(`${API_BASE_URL}/api/employees/club/${user.id}`);
      if (clubRes.ok) {
        const clubData = await clubRes.json();
        setClubName(clubData.name);
      } else {
        console.error('Error fetching club:', clubRes.statusText);
      }

      const clubId = getMainClub();
      if (!clubId) throw new Error('Club id not found in storage');

      // Obtener todas las ventas filtradas por club
      const salesRes = await authFetch(`${API_BASE_URL}/api/sales?club=${clubId}`);
      if (salesRes.ok) {
        const salesData: Sale[] = await salesRes.json();
        // Filtrar las ventas del mes actual
        const now = new Date();
        const monthlySales = salesData.filter(sale => {
          const saleDate = new Date(sale.created_at);
          return saleDate.getMonth() === now.getMonth() && saleDate.getFullYear() === now.getFullYear();
        });
        setAllSales(monthlySales);
        setCurrentPage(1);
        setEmployeeSales(monthlySales.slice(0, itemsPerPage));
      } else {
        console.error('Error fetching sales');
      }

      // Obtener clientes asociados al club
      const clientsRes = await authFetch(`${API_BASE_URL}/api/clients?club_id=${clubId}`);
      if (clientsRes.ok) {
        const clientsData: Client[] = await clientsRes.json();
        setRecentClients(clientsData.slice(0, 3));
      } else {
        console.error('Error fetching clients');
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      toast.error('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  // Función para cargar productos con stock bajo
  const loadLowStockProducts = async () => {
    try {
      const clubId = getMainClub();
      if (!clubId) return;
      const productsRes = await authFetch(`${API_BASE_URL}/api/products?club=${clubId}`);
      const productsData = productsRes.ok ? await productsRes.json() : [];
      const inventoryRes = await authFetch(`${API_BASE_URL}/api/inventory?club=${clubId}`);
      const inventoryData = inventoryRes.ok ? await inventoryRes.json() : [];
      const lowStock = productsData
        .map((product: any) => {
          const stock = inventoryData.find((i: any) => i.product_id === product.id)?.quantity || 0;
          return { ...product, stock, isLow: stock < 5 };
        })
        .filter((product: any) => product.isLow)
        .slice(0, 3);
      setLowStockProducts(lowStock);
    } catch (error) {
      console.error('Error loading low stock products:', error);
    }
  };

  // Paginación de ventas
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      const start = (nextPage - 1) * itemsPerPage;
      setEmployeeSales(allSales.slice(start, start + itemsPerPage));
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      const prevPage = currentPage - 1;
      setCurrentPage(prevPage);
      const start = (prevPage - 1) * itemsPerPage;
      setEmployeeSales(allSales.slice(start, start + itemsPerPage));
    }
  };

  // Handlers para abrir modales y navegación
  const handleNewSale = () => setShowNewSaleModal(true);
  const handleNewClient = () => setShowNewClientModal(true);
  const handleNewExpense = () => setShowExpenseModal(true);
  const handleViewAllSales = () => navigate('/sales');
  const handleProfileClick = () => setShowProfileMenu(!showProfileMenu);
  const handleEditProfile = () => {
    setShowEditProfile(true);
    setShowProfileMenu(false);
  };

  // Formulario de edición de perfil con campos controlados
  const handleProfileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setProfileFormData({ ...profileFormData, [e.target.name]: e.target.value });
  };

  const handleUpdateProfile = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isUpdatingProfile) return; // Evita llamadas repetidas
    // Opcional: si no hubo cambios, puedes abortar
    if (employee &&
        profileFormData.fullName === employee.fullName &&
        profileFormData.email === employee.email &&
        profileFormData.phone === employee.phone) {
      setShowEditProfile(false);
      return;
    }
    setIsUpdatingProfile(true);
    try {
      if (!user) throw new Error('User is not authenticated');
      const updateRes = await authFetch(`${API_BASE_URL}/api/employees/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileFormData)
      });
      if (!updateRes.ok) throw new Error('Error updating profile');
      const updatedUser: Employee = await updateRes.json();
      setEmployee(updatedUser);
      setShowEditProfile(false);
      toast.success('Perfil actualizado correctamente');
    } catch (error) {
      console.error(error);
      toast.error('Error al actualizar el perfil');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Mostrar tooltip de ayuda
  const showHelp = (id: string) => {
    setShowTooltip(id);
    setTimeout(() => setShowTooltip(null), 5000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2A5C9A] mx-auto mb-4"></div>
        <p className="text-gray-600 text-center">Cargando tu información...</p>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-6 rounded-lg shadow-md max-w-sm w-full text-center">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Usuario no encontrado</h2>
          <p className="text-gray-600 mb-4">No se pudo encontrar tu información. Contacta al administrador.</p>
          <button onClick={() => window.location.reload()} className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors">
            Intentar nuevamente
          </button>
        </div>
      </div>
    );
  }

  // Calcular KPIs usando todas las ventas mensuales
  const totalSales = allSales.reduce((sum, sale) => sum + sale.total, 0);
  const averageTicket = allSales.length > 0 ? totalSales / allSales.length : 0;
  const clientsServed = new Set(allSales.map(sale => sale.client_id)).size;

  return (
    <div className="min-h-screen bg-gray-50">
      <EmployeeHeader employee={employee} onProfileClick={handleProfileClick} />

      {/* Menú de Perfil */}
      {showProfileMenu && (
        <div className="fixed right-4 top-16 w-64 bg-white rounded-lg shadow-lg z-50 p-4">
          <p className="font-medium text-gray-900">{employee.fullName}</p>
          <p className="text-sm text-gray-500">{employee.email}</p>
          <p className="text-xs text-gray-500 mt-1">Club: {clubName}</p>
          <button onClick={handleEditProfile} className="mt-3 w-full flex items-center text-sm text-gray-700 hover:bg-gray-100 p-2 rounded">
            <Settings className="h-4 w-4 mr-2" /> Editar Perfil
          </button>
        </div>
      )}

      {/* Modal de Edición de Perfil */}
      {showEditProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Editar Perfil</h3>
            <form onSubmit={handleUpdateProfile}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nombre</label>
                  <input
                    type="text"
                    name="fullName"
                    value={profileFormData.fullName}
                    onChange={handleProfileChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={profileFormData.email}
                    onChange={handleProfileChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                  <input
                    type="tel"
                    name="phone"
                    value={profileFormData.phone}
                    onChange={handleProfileChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowEditProfile(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingProfile}
                  className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Banner de Bienvenida */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-700 text-white p-6 rounded-xl shadow-lg mb-8">
          <h1 className="text-2xl font-bold">¡Bienvenido, {user?.fullName?.split(' ')[0] || 'Usuario'}!</h1>
          <p className="mt-1 text-sm opacity-90">Club: {clubName} • {new Date().toLocaleDateString()}</p>
        </div>

        {/* Acciones Rápidas */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Acciones Rápidas</h2>
            <button onClick={() => showHelp('acciones')} className="flex items-center text-sm text-blue-600 hover:text-blue-800">
              <HelpCircle className="h-5 w-5 mr-1" /> Ayuda
            </button>
          </div>
          {showTooltip === 'acciones' && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
              Usa estos botones para registrar una venta, agregar un cliente o registrar un gasto.
            </div>
          )}
          <div className="grid grid-cols-3 gap-4">
            <button onClick={handleNewSale} className="flex flex-col items-center justify-center p-4 bg-white rounded-xl shadow hover:bg-blue-50 border border-gray-200">
              <ShoppingCart className="h-8 w-8 text-blue-600 mb-2" />
              <span className="text-sm font-medium">Nueva Venta</span>
            </button>
            <button onClick={handleNewClient} className="flex flex-col items-center justify-center p-4 bg-white rounded-xl shadow hover:bg-green-50 border border-gray-200">
              <Users className="h-8 w-8 text-green-600 mb-2" />
              <span className="text-sm font-medium">Nuevo Cliente</span>
            </button>
            <button onClick={handleNewExpense} className="flex flex-col items-center justify-center p-4 bg-white rounded-xl shadow hover:bg-red-50 border border-gray-200">
              <DollarSign className="h-8 w-8 text-red-600 mb-2" />
              <span className="text-sm font-medium">Nuevo Gasto</span>
            </button>
          </div>
        </section>

        {/* Resumen del Día - KPIs */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Resumen del Día</h2>
            <button onClick={() => showHelp('resumen')} className="flex items-center text-sm text-blue-600 hover:text-blue-800">
              <HelpCircle className="h-5 w-5 mr-1" /> Ayuda
            </button>
          </div>
          {showTooltip === 'resumen' && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
              Estas cifras se basan en todas tus ventas del mes actual.
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center p-4 bg-white rounded-xl shadow border border-gray-200">
              <div className="p-3 bg-blue-100 rounded-full mr-4">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Ventas Totales</p>
                <p className="text-xl font-bold text-gray-800">${totalSales.toFixed(0)}</p>
              </div>
            </div>
            <div className="flex items-center p-4 bg-white rounded-xl shadow border border-gray-200">
              <div className="p-3 bg-green-100 rounded-full mr-4">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Ticket Promedio</p>
                <p className="text-xl font-bold text-gray-800">${averageTicket.toFixed(0)}</p>
              </div>
            </div>
            <div className="flex items-center p-4 bg-white rounded-xl shadow border border-gray-200">
              <div className="p-3 bg-purple-100 rounded-full mr-4">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Clientes Atendidos</p>
                <p className="text-xl font-bold text-gray-800">{clientsServed}</p>
              </div>
            </div>
            <div className="flex items-center p-4 bg-white rounded-xl shadow border border-gray-200">
              <div className="p-3 bg-yellow-100 rounded-full mr-4">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Horas Trabajadas</p>
                <p className="text-xl font-bold text-gray-800">6.5 hrs</p>
              </div>
            </div>
          </div>
        </section>

        {/* Ventas Recientes con Paginación */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Ventas Recientes</h2>
            <div className="flex items-center space-x-3">
              <button onClick={() => showHelp('ventas')} className="flex items-center text-sm text-blue-600 hover:text-blue-800">
                <HelpCircle className="h-5 w-5 mr-1" /> Ayuda
              </button>
              <button onClick={handleViewAllSales} className="flex items-center text-sm text-blue-600 hover:text-blue-800">
                Ver todas <ChevronRight className="h-5 w-5 ml-1" />
              </button>
            </div>
          </div>
          {showTooltip === 'ventas' && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
              Revisa tus ventas recientes. Usa la paginación para ver más registros.
            </div>
          )}
          <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
            {employeeSales.length > 0 ? (
              <div className="divide-y">
                {employeeSales.map((sale) => {
                  const saleId = sale.id || sale._id;
                  return (
                    <div key={saleId} className="p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-gray-800">Venta #{saleId.toString().slice(0, 8)}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatLocalDate(sale.created_at)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-800">${sale.total.toFixed(0)}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {sale.items ? sale.items.length : 0} {sale.items && sale.items.length !== 1 ? 'productos' : 'producto'}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 text-center text-gray-500">
                <Package className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                <p>No hay ventas recientes</p>
                <button onClick={handleNewSale} className="mt-3 text-blue-600 hover:text-blue-800 text-sm">
                  Registrar una venta
                </button>
              </div>
            )}
            {totalPages > 1 && (
              <div className="flex justify-between items-center p-4 bg-gray-50 border-t border-gray-200">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className="px-3 py-1 bg-white border border-gray-300 rounded text-sm font-medium text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                <span className="text-sm text-gray-600">
                  Página {currentPage} de {totalPages}
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 bg-white border border-gray-300 rounded text-sm font-medium text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Alertas de Stock */}
        {lowStockProducts.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Alertas de Stock</h2>
              <button onClick={() => showHelp('stock')} className="flex items-center text-sm text-blue-600 hover:text-blue-800">
                <HelpCircle className="h-5 w-5 mr-1" /> Ayuda
              </button>
            </div>
            {showTooltip === 'stock' && (
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                Informa a tu supervisor para reabastecer estos productos.
              </div>
            )}
            <div className="bg-white rounded-xl shadow border border-gray-200">
              <div className="p-4 bg-red-50 border-b border-gray-200 flex items-center">
                <AlertTriangle className="h-6 w-6 text-red-500 mr-3" />
                <p className="text-red-800 font-semibold">Productos con stock bajo</p>
              </div>
              <div className="divide-y">
                {lowStockProducts.map((product: any) => (
                  <div key={product.id} className="p-4 flex justify-between items-center">
                    <p className="font-medium text-gray-800">{product.name}</p>
                    <p className="text-sm text-red-600">
                      {product.stock} {product.stock !== 1 ? 'unidades' : 'unidad'} restantes
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Clientes Recientes */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Clientes Recientes</h2>
            <div className="flex items-center space-x-3">
              <button onClick={() => showHelp('clientes')} className="flex items-center text-sm text-blue-600 hover:text-blue-800">
                <HelpCircle className="h-5 w-5 mr-1" /> Ayuda
              </button>
              <button onClick={handleNewClient} className="flex items-center text-sm text-green-600 hover:text-green-800">
                <Plus className="h-5 w-5 mr-1" /> Nuevo
              </button>
            </div>
          </div>
          {showTooltip === 'clientes' && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
              Agrega nuevos clientes y revisa los más recientes.
            </div>
          )}
          <div className="bg-white rounded-xl shadow border border-gray-200">
            {recentClients.length > 0 ? (
              <div className="divide-y">
                {recentClients.map((client) => (
                  <div key={client.id} className="p-4 flex items-center">
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold">
                      {client.name.charAt(0)}
                    </div>
                    <div className="ml-4">
                      <p className="font-medium text-gray-800">{client.name}</p>
                      <p className="text-sm text-gray-500">
                        {client.email || client.phone || 'Sin contacto'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500">No hay clientes recientes</div>
            )}
          </div>
        </section>
      </main>

      {/* Modales */}
      {showNewSaleModal && (
        <NewSaleModal
          onClose={() => setShowNewSaleModal(false)}
          onSave={() => {
            setShowNewSaleModal(false);
            loadEmployeeData();
          }}
          employee={employee}
        />
      )}
      {showNewClientModal && (
        <ClientFormModal
          onClose={() => setShowNewClientModal(false)}
          onSave={(client: Client) => {
            setShowNewClientModal(false);
            setRecentClients([client, ...recentClients.slice(0, 2)]);
            toast.success('Cliente registrado correctamente');
          }}
          employee={employee}
        />
      )}
      {showExpenseModal && (
        <ExpenseFormModal
          onClose={() => setShowExpenseModal(false)}
          onSave={() => {
            setShowExpenseModal(false);
            toast.success('Gasto registrado correctamente');
          }}
          employee={employee}
        />
      )}
    </div>
  );
}





