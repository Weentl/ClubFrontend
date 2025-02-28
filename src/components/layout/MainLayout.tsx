
import { Outlet } from 'react-router-dom';
import Sidebar from '../global/Sidebar';

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar />
      <div className="pl-64">
        <Outlet />
      </div>
    </div>
  );
}