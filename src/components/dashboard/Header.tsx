//Header.tsx
import { Bell, User, ChevronDown } from 'lucide-react';

interface HeaderProps {
  userName: string;
  userImage?: string;
}

export default function Header({ userName, userImage }: HeaderProps) {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-900">BusinessManager</h1>
          </div>

          <div className="flex items-center space-x-4">
            <button
              type="button"
              className="p-2 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <span className="sr-only">Ver notificaciones</span>
              <Bell className="h-6 w-6" />
            </button>

            <div className="relative inline-block text-left">
              <div>
                <button
                  type="button"
                  className="flex items-center space-x-3 rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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
                  <span className="text-gray-700">{userName}</span>
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </button>
              </div>
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