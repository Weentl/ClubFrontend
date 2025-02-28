import React from 'react';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  Settings,
  Store,
  BarChart,
  LogOut,
  Boxes,
  PieChart,
  DollarSign
} from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: ShoppingCart, label: 'Ventas', href: '/sales' },
  { icon: DollarSign, label: 'Gastos', href: '/expenses' },
  { icon: Package, label: 'Productos', href: '/products' },
  { icon: Boxes, label: 'Inventario', href: '/inventory' },
  { icon: Users, label: 'Clientes', href: '/customers' },
  { icon: Store, label: 'Clubs', href: '/clubs' },
  { icon: PieChart, label: 'Reportes', href: '/reports' },
  { icon: Settings, label: 'Configuración', href: '/settings' },
];

export default function Sidebar() {
  const location = useLocation();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="h-screen w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 fixed left-0 top-0">
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-xl font-bold text-[#2A5C9A] dark:text-blue-400">BusinessManager</h1>
          </div>
          <nav className="px-2 py-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                    isActive
                      ? 'bg-[#2A5C9A] text-white'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-[#2A5C9A] dark:hover:text-blue-400'
                  } group`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button 
            onClick={handleSignOut}
            className="flex items-center px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 w-full"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  );
}