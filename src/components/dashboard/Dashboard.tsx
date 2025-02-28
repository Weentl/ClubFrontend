// dashboard.tsx
import { useState, useEffect, useMemo } from 'react';
import {
  ShoppingCart,
  AlertTriangle,
  DollarSign,
  Store,
  ChevronDown,
  Building2,
} from 'lucide-react';
import Header from './Header';
import KPICard from './KPICard';

interface Club {
  _id: string;
  clubName: string;
  address: string;
  isMain?: boolean;
}

interface User {
  id: string;
  fullName: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Dashboard() {
  const [showClubSelector, setShowClubSelector] = useState(false);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
  const [kpiData, setKpiData] = useState<any[]>([]);

  // Se obtiene la información del usuario del localStorage.
  const user: User | null = useMemo(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  }, []);

  useEffect(() => {
    const storedClub = localStorage.getItem('mainClub');
    if (storedClub) {
      setSelectedClub(JSON.parse(storedClub));
    }
  }, []);

  useEffect(() => {
    if (user && user.id) {
      fetchClubs(user.id);
    } else {
      console.error('No se encontró el usuario en localStorage.');
    }
  }, [user?.id]);

  // Cuando se carguen los clubs, se selecciona el club principal (o el primero)
  useEffect(() => {
    if (clubs.length > 0) {
      const main = clubs.find((c) => c.isMain) || clubs[0];
      setSelectedClub(main);
    }
  }, [clubs]);

  // Al cambiar el club seleccionado, se guarda en localStorage y se actualizan los KPIs
  useEffect(() => {
    if (selectedClub?._id) {
      localStorage.setItem(
        'mainClub',
        JSON.stringify({
          id: selectedClub._id,
          name: selectedClub.clubName,
          location: selectedClub.address,
        })
      );
      fetchKPIs(selectedClub._id);
    }
  }, [selectedClub?._id]);

  const fetchClubs = async (userId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/clubs?user=${userId}`);
      if (!response.ok) {
        throw new Error('Error al obtener los clubs');
      }
      const data = await response.json();
      setClubs(data);
    } catch (error) {
      console.error('Error fetching clubs:', error);
    }
  };

  const fetchKPIs = async (clubId: string) => {
    try {
      // Obtener la zona horaria del cliente
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const response = await fetch(`${API_BASE_URL}/api/dashboard/kpis?club=${clubId}&timezone=${timezone}&user=${user?.id}`);
      if (!response.ok) {
        throw new Error('No hay suficientes datos');
      }
      const data = await response.json();
      const kpis = [
        {
          title: 'Ventas Hoy',
          value: `$${data.ventasHoy.toFixed(2)}`,
          icon: ShoppingCart,
          trend: { value: 12, isPositive: true },
          color: 'blue',
        },
        {
          title: 'Productos Bajos en Stock',
          value: data.productosBajosStock,
          icon: AlertTriangle,
          color: 'yellow',
        },
        {
          title: 'Ganancias Mensuales',
          value: `$${data.gananciasMensuales.toFixed(2)}`,
          icon: DollarSign,
          trend: { value: 8, isPositive: true },
          color: 'green',
        },
        {
          title: 'Clubs Activos',
          value: data.clubsActivos,
          icon: Store,
          color: 'purple',
        },
      ];
      setKpiData(kpis);
    } catch (error) {
      console.error('Error fetching KPIs:', error);
      const fallbackKPIs = [
        {
          title: 'Ventas Hoy',
          value: 'No hay suficientes datos',
          icon: ShoppingCart,
          color: 'blue',
        },
        {
          title: 'Productos Bajos en Stock',
          value: 'No hay suficientes datos',
          icon: AlertTriangle,
          color: 'yellow',
        },
        {
          title: 'Ganancias Mensuales',
          value: 'No hay suficientes datos',
          icon: DollarSign,
          color: 'green',
        },
        {
          title: 'Clubs Activos',
          value: 'No hay suficientes datos',
          icon: Store,
          color: 'purple',
        },
      ];
      setKpiData(fallbackKPIs);
    }
  };

  const handleClubChange = (club: Club) => {
    setSelectedClub(club);
    setShowClubSelector(false);
  };

  return (
    <div>
      <Header userName={user ? user.fullName : 'Usuario'} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Club Selector */}
        <div className="mb-8">
          <div className="flex items-center justify-between bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center space-x-3">
              <Building2 className="h-6 w-6 text-[#2A5C9A]" />
              <div>
                <p className="text-sm text-gray-500">Club Actual</p>
                <h2 className="text-xl font-semibold text-gray-900">
                  {selectedClub ? selectedClub.clubName : ''}
                </h2>
                <p className="text-sm text-gray-500">
                  {selectedClub ? selectedClub.address : ''}
                </p>
              </div>
            </div>
            <div className="relative">
              <button
                onClick={() => setShowClubSelector(!showClubSelector)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2A5C9A]"
              >
                Cambiar Club
                <ChevronDown className="ml-2 h-4 w-4" />
              </button>

              {showClubSelector && (
                <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                  <div className="py-1" role="menu">
                    {clubs.map((club) => (
                      <button
                        key={club._id}
                        onClick={() => handleClubChange(club)}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                        role="menuitem"
                      >
                        <div className="font-medium">{club.clubName}</div>
                        <div className="text-xs text-gray-500">{club.address}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* KPIs Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {kpiData.length > 0 ? (
            kpiData.map((kpi, index) => (
              <KPICard
                key={index}
                title={kpi.title}
                value={kpi.value}
                icon={kpi.icon}
                trend={kpi.trend}
                color={kpi.color}
              />
            ))
          ) : (
            <p>Cargando KPIs...</p>
          )}
        </div>

        {/* Otros componentes del dashboard */}
      </main>
    </div>
  );
}




