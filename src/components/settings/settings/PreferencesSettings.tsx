import React, { useState, useEffect } from 'react';
import { Moon, Sun, Globe, Bell, DollarSign, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

// Mock preferences data - in a real app, this would come from an API
const preferencesData = {
  darkMode: false,
  language: 'es',
  notifications: {
    lowStock: true,
    paymentReminders: true,
    salesReports: false
  },
  notificationHours: {
    start: '08:00',
    end: '20:00'
  },
  currency: 'MXN',
  businessHours: {
    start: '08:00',
    end: '18:00'
  }
};

export default function PreferencesSettings() {
  const [preferences, setPreferences] = useState(preferencesData);
  
  // Check for system dark mode preference on mount
  useEffect(() => {
    const isDarkMode = localStorage.getItem('darkMode') === 'true' || 
      (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    setPreferences(prev => ({ ...prev, darkMode: isDarkMode }));
    
    // Apply dark mode if needed
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);
  
  const handleToggleDarkMode = () => {
    const newDarkMode = !preferences.darkMode;
    setPreferences(prev => ({ ...prev, darkMode: newDarkMode }));
    
    // Apply dark mode to the document
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Save preference
    localStorage.setItem('darkMode', newDarkMode.toString());
    
    toast.success(`Modo ${newDarkMode ? 'oscuro' : 'claro'} activado`);
  };
  
  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPreferences(prev => ({ ...prev, language: e.target.value }));
    // In a real app, this would update the language in the app
    toast.success(`Idioma cambiado a ${e.target.value === 'es' ? 'Español' : 'English'}`);
  };
  
  const handleNotificationChange = (key: keyof typeof preferences.notifications) => {
    setPreferences(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: !prev.notifications[key]
      }
    }));
  };
  
  const handleTimeChange = (type: 'notificationHours' | 'businessHours', field: 'start' | 'end', value: string) => {
    setPreferences(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: value
      }
    }));
  };
  
  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPreferences(prev => ({ ...prev, currency: e.target.value }));
  };
  
  const handleSavePreferences = () => {
    // In a real app, this would call an API to update the preferences
    // API: PATCH /api/preferences → { ...preferences }
    toast.success('Preferencias guardadas correctamente');
  };
  
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Preferencias de la Aplicación</h2>
      
      {/* Appearance */}
      <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-sm p-6 mb-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Apariencia</h3>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {preferences.darkMode ? (
              <Moon className="h-5 w-5 text-gray-700 dark:text-gray-300 mr-2" />
            ) : (
              <Sun className="h-5 w-5 text-yellow-500 mr-2" />
            )}
            <span className="text-gray-900 dark:text-gray-100">Modo oscuro</span>
          </div>
          
          <button
            type="button"
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              preferences.darkMode ? 'bg-[#2A5C9A]' : 'bg-gray-200 dark:bg-gray-700'
            }`}
            role="switch"
            aria-checked={preferences.darkMode}
            onClick={handleToggleDarkMode}
          >
            <span className="sr-only">Activar modo oscuro</span>
            <span
              className={`pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                preferences.darkMode ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <Globe className="h-5 w-5 text-gray-400 dark:text-gray-500 mr-2" />
            <label htmlFor="language" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Idioma
            </label>
          </div>
          
          <select
            id="language"
            value={preferences.language}
            onChange={handleLanguageChange}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option value="es">Español</option>
            <option value="en">English</option>
          </select>
        </div>
      </div>
      
      {/* Notifications */}
      <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-sm p-6 mb-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Notificaciones</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Bell className="h-5 w-5 text-gray-400 dark:text-gray-500 mr-2" />
              <span className="text-gray-900 dark:text-gray-100">Alertas de stock bajo</span>
            </div>
            
            <button
              type="button"
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                preferences.notifications.lowStock ? 'bg-[#2A5C9A]' : 'bg-gray-200 dark:bg-gray-700'
              }`}
              role="switch"
              aria-checked={preferences.notifications.lowStock}
              onClick={() => handleNotificationChange('lowStock')}
            >
              <span className="sr-only">Activar alertas de stock bajo</span>
              <span
                className={`pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  preferences.notifications.lowStock ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Bell className="h-5 w-5 text-gray-400 dark:text-gray-500 mr-2" />
              <span className="text-gray-900 dark:text-gray-100">Recordatorios de pago</span>
            </div>
            
            <button
              type="button"
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                preferences.notifications.paymentReminders ? 'bg-[#2A5C9A]' : 'bg-gray-200 dark:bg-gray-700'
              }`}
              role="switch"
              aria-checked={preferences.notifications.paymentReminders}
              onClick={() => handleNotificationChange('paymentReminders')}
            >
              <span className="sr-only">Activar recordatorios de pago</span>
              <span
                className={`pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  preferences.notifications.paymentReminders ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Bell className="h-5 w-5 text-gray-400 dark:text-gray-500 mr-2" />
              <span className="text-gray-900 dark:text-gray-100">Reportes de ventas</span>
            </div>
            
            <button
              type="button"
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                preferences.notifications.salesReports ? 'bg-[#2A5C9A]' : 'bg-gray-200 dark:bg-gray-700'
              }`}
              role="switch"
              aria-checked={preferences.notifications.salesReports}
              onClick={() => handleNotificationChange('salesReports')}
            >
              <span className="sr-only">Activar reportes de ventas</span>
              <span
                className={`pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  preferences.notifications.salesReports ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center mb-2">
            <Clock className="h-5 w-5 text-gray-400 dark:text-gray-500 mr-2" />
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Horario de notificaciones
            </label>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="time"
              value={preferences.notificationHours.start}
              onChange={(e) => handleTimeChange('notificationHours', 'start', e.target.value)}
              className="block w-32 pl-3 pr-3 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            />
            <span className="text-gray-700 dark:text-gray-300">a</span>
            <input
              type="time"
              value={preferences.notificationHours.end}
              onChange={(e) => handleTimeChange('notificationHours', 'end', e.target.value)}
              className="block w-32 pl-3 pr-3 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            />
          </div>
        </div>
      </div>
      
      {/* Business Settings */}
      <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-sm p-6 mb-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Opciones de Negocio</h3>
        
        <div className="space-y-4">
          <div>
            <div className="flex items-center mb-2">
              <DollarSign className="h-5 w-5 text-gray-400 dark:text-gray-500 mr-2" />
              <label htmlFor="currency" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Moneda predeterminada
              </label>
            </div>
            
            <select
              id="currency"
              value={preferences.currency}
              onChange={handleCurrencyChange}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="MXN">Peso Mexicano (MXN)</option>
              <option value="USD">Dólar Estadounidense (USD)</option>
              <option value="EUR">Euro (EUR)</option>
            </select>
          </div>
          
          <div>
            <div className="flex items-center mb-2">
              <Clock className="h-5 w-5 text-gray-400 dark:text-gray-500 mr-2" />
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Horario comercial
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="time"
                value={preferences.businessHours.start}
                onChange={(e) => handleTimeChange('businessHours', 'start', e.target.value)}
                className="block w-32 pl-3 pr-3 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              />
              <span className="text-gray-700 dark:text-gray-300">a</span>
              <input
                type="time"
                value={preferences.businessHours.end}
                onChange={(e) => handleTimeChange('businessHours', 'end', e.target.value)}
                className="block w-32 pl-3 pr-3 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              />
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end">
        <button
          onClick={handleSavePreferences}
          className="px-4 py-2 bg-[#2A5C9A] text-white rounded-md hover:bg-[#1e4474] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800"
        >
          Guardar Preferencias
        </button>
      </div>
    </div>
  );
}