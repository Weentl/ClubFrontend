
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  Settings,
  Store,
  LogOut,
  Boxes,
  PieChart,
  DollarSign,
  UserPlus
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
  { icon: UserPlus, label: 'Empleados', href: '/employees' },
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
    <div className="h-full w-64 bg-white border-r border-gray-200">
      <div className="flex flex-col h-full">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">BusinessManager</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
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
                      : 'text-gray-600 hover:bg-gray-50 hover:text-[#2A5C9A]'
                  } group`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-gray-200">
          <button 
            onClick={handleSignOut}
            className="flex items-center px-4 py-2 text-sm font-medium text-red-600 rounded-md hover:bg-red-50 w-full"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  );
}