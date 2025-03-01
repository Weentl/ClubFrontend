// Header.tsx
import { useState, useRef, useEffect } from 'react';
import { Bell, User, ChevronDown, Settings, LogOut, UserCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

interface HeaderProps {
  userName: string;
  userImage?: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'info' | 'warning' | 'success';
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Header({ userName, userImage }: HeaderProps) {
  // Se asume que el contexto de autenticación ahora provee también información del usuario (por ejemplo, email)
  const { user, signOut } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  
  const unreadCount = notifications.filter(n => !n.read).length;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notification => ({ ...notification, read: true })));
  };

  // Conectar con la API de inventario para obtener productos con stock bajo
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        // Se asume que el club seleccionado se guarda en localStorage (desde el Dashboard)
        const storedClub = localStorage.getItem('mainClub');
        if (!storedClub) return;
        const club = JSON.parse(storedClub);
        if (!club?._id) return;
  
        const response = await fetch(`${API_BASE_URL}/api/inventory/low-stock?club=${club._id}`);
        if (!response.ok) {
          throw new Error('Error fetching low stock products');
        }
        const data = await response.json();
        // Se asume que data es un arreglo de productos con stock bajo (al menos: _id, name, quantity)
        const lowStockNotifications = data.map((item: any) => ({
          id: item._id,
          title: 'Stock bajo',
          message: `${item.product_id?.name || 'Producto'} está por agotarse (${item.quantity} unidades restantes)`,
          time: 'Ahora', // Puedes formatear la hora según se requiera
          read: false,
          type: 'warning'
        }));
        setNotifications(lowStockNotifications);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();
  }, []); // Si el club cambia, se podría agregar como dependencia

  // Cerrar menús al hacer click fuera de ellos
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'warning': return '⚠️';
      case 'success': return '✅';
      case 'info': return 'ℹ️';
      default: return '📌';
    }
  };

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-900">BusinessManager</h1>
          </div>

          <div className="flex items-center space-x-4">
            {/* Dropdown de notificaciones */}
            <div className="relative" ref={notificationsRef}>
              <button
                type="button"
                className="p-2 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 relative"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <span className="sr-only">Ver notificaciones</span>
                <Bell className="h-6 w-6" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 block h-5 w-5 rounded-full bg-red-500 text-white text-xs font-medium flex items-center justify-center transform translate-x-1 -translate-y-1">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                  <div className="py-2 px-4 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="text-sm font-medium text-gray-900">Notificaciones</h3>
                    {unreadCount > 0 && (
                      <button 
                        className="text-xs text-blue-600 hover:text-blue-800"
                        onClick={markAllAsRead}
                      >
                        Marcar todas como leídas
                      </button>
                    )}
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length > 0 ? (
                      <div className="py-2">
                        {notifications.map((notification) => (
                          <div 
                            key={notification.id} 
                            className={`px-4 py-3 hover:bg-gray-50 ${notification.read ? '' : 'bg-blue-50'}`}
                            onClick={() => markAsRead(notification.id)}
                          >
                            <div className="flex items-start">
                              <div className="flex-shrink-0 mr-3">
                                <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                                <p className="text-sm text-gray-500">{notification.message}</p>
                                <p className="text-xs text-gray-400 mt-1">Hace {notification.time}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-4 px-4 text-center text-sm text-gray-500">
                        No hay notificaciones
                      </div>
                    )}
                  </div>
                  <div className="py-2 px-4 border-t border-gray-200 text-center">
                    <Link to="/notifications" className="text-xs text-blue-600 hover:text-blue-800">
                      Ver todas las notificaciones
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Dropdown del usuario */}
            <div className="relative inline-block text-left" ref={userMenuRef}>
              <div>
                <button
                  type="button"
                  className="flex items-center space-x-3 rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                >
                  <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                    {userImage ? (
                      <img
                        src={userImage}
                        alt={userName}
                        className="h-8 w-8 rounded-full"
                      />
                    ) : (
                      <User className="h-5 w-5 text-gray-500" />
                    )}
                  </div>
                  <span className="text-gray-700 hidden md:block">{userName}</span>
                  <ChevronDown className="h-4 w-4 text-gray-500 hidden md:block" />
                </button>
              </div>

              {showUserMenu && (
                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                  <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="user-menu">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-900">{userName}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email || 'usuario@ejemplo.com'}</p>
                    </div>
                    <Link
                      to="/settings"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      role="menuitem"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Settings className="mr-3 h-4 w-4 text-gray-500" />
                      Configuración
                    </Link>
                    <Link
                      to="/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      role="menuitem"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <UserCircle className="mr-3 h-4 w-4 text-gray-500" />
                      Mi Perfil
                    </Link>
                    <button
                      className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      role="menuitem"
                      onClick={handleSignOut}
                    >
                      <LogOut className="mr-3 h-4 w-4 text-red-500" />
                      Cerrar Sesión
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4">
          <h2 className="text-xl text-gray-700">
            {getGreeting()}, {userName}
          </h2>
        </div>
      </div>
    </header>
  );
}
