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
  PackageSearch,
} from 'lucide-react';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: PackageSearch, label: 'Mis Productos', href: '/products' },
  { icon: ShoppingCart, label: 'Ventas', href: '/sales' },
  { icon: Package, label: 'Inventario', href: '/inventory' },
  { icon: Users, label: 'Clientes', href: '/customers' },
  { icon: Store, label: 'Clubs', href: '/clubs' },
  { icon: BarChart, label: 'Reportes', href: '/reports' },
  { icon: Settings, label: 'Configuración', href: '/settings' },
];

export default function Sidebar() {
  return (
    <div className="h-screen w-64 bg-white border-r border-gray-200 fixed left-0 top-0">
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto">
          <nav className="px-2 py-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-[#2A5C9A] group"
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.label}
                </a>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-gray-200">
          <button className="flex items-center px-4 py-2 text-sm font-medium text-red-600 rounded-md hover:bg-red-50 w-full">
            <LogOut className="mr-3 h-5 w-5" />
            Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  );
}