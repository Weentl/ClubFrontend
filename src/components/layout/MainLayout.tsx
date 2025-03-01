
import { Outlet } from 'react-router-dom';
import Sidebar from '../global/Sidebar';

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar />
      <div className="lg:pl-64 pt-16 lg:pt-0">
        <Outlet />
      </div>
    </div>
  );
}