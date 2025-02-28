import React, { useState } from 'react';
import { CreditCard, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

// Mock subscription data - in a real app, this would come from an API
const subscriptionData = {
  plan: 'Básico',
  status: 'active',
  startDate: '2024-05-15',
  endDate: '2024-06-15',
  features: [
    'Hasta 3 Clubs',
    '5 empleados registrados',
    'Soporte prioritario',
    'Reportes básicos'
  ],
  price: 29.99
};

export default function SubscriptionSettings() {
  const [showCancelModal, setShowCancelModal] = useState(false);
  
  // Calculate days remaining
  const today = new Date();
  const endDate = new Date(subscriptionData.endDate);
  const totalDays = 30; // Assuming monthly subscription
  const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
  const progressPercentage = Math.round((daysRemaining / totalDays) * 100);
  
  const handleUpgrade = () => {
    // In a real app, this would navigate to a pricing page or open a modal
    toast.success('Redirigiendo a la página de planes...');
  };
  
  const handleCancelSubscription = () => {
    // In a real app, this would call an API to cancel the subscription
    // API: POST /api/subscription/cancel
    toast.success('Suscripción cancelada correctamente');
    setShowCancelModal(false);
  };
  
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Gestión de Suscripción</h2>
      
      {/* Coming Soon Notice */}
      <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 mb-6">
        <p className="text-yellow-800 dark:text-yellow-200 font-medium">Próximamente</p>
        <p className="text-yellow-700 dark:text-yellow-300 text-sm mt-1">
          Estamos trabajando en nuevas opciones de suscripción y características premium. ¡Mantente atento!
        </p>
      </div>
      
      {/* Subscription Status Card */}
      <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-sm p-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Plan Actual:</h3>
              <span className={`ml-2 px-2.5 py-0.5 rounded-full text-sm font-medium ${
                subscriptionData.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
              }`}>
                {subscriptionData.plan}
              </span>
            </div>
            
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              ${subscriptionData.price}/mes
            </p>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={handleUpgrade}
              className="px-4 py-2 bg-[#28A745] text-white rounded-md hover:bg-[#218838] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-gray-800"
            >
              Actualizar Plan
            </button>
            
            <button
              onClick={() => setShowCancelModal(true)}
              className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-gray-800"
            >
              Cancelar Suscripción
            </button>
          </div>
        </div>
        
        <div className="mt-6">
          <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-1">
            <span>Días restantes: {daysRemaining}/{totalDays}</span>
            <span>{progressPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
            <div 
              className="bg-[#2A5C9A] h-2.5 rounded-full" 
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
        
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Fecha de registro</p>
            <p className="font-medium text-gray-900 dark:text-gray-100">{new Date(subscriptionData.startDate).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Próximo pago</p>
            <p className="font-medium text-gray-900 dark:text-gray-100">{new Date(subscriptionData.endDate).toLocaleDateString()}</p>
          </div>
        </div>
      </div>
      
      {/* Plan Features */}
      <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-sm p-6 mb-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Beneficios Incluidos</h3>
        
        <ul className="space-y-2">
          {subscriptionData.features.map((feature, index) => (
            <li key={index} className="flex items-center">
              <span className="text-[#28A745] mr-2">✓</span>
              <span className="text-gray-700 dark:text-gray-300">{feature}</span>
            </li>
          ))}
        </ul>
        
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <a 
            href="#" 
            className="text-[#2A5C9A] hover:text-[#1e4474] dark:text-blue-400 dark:hover:text-blue-300 font-medium"
            onClick={(e) => {
              e.preventDefault();
              handleUpgrade();
            }}
          >
            Ver todos los planes disponibles →
          </a>
        </div>
      </div>
      
      {/* Payment Method */}
      <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Método de Pago</h3>
        
        <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <CreditCard className="h-8 w-8 text-gray-400 dark:text-gray-500 mr-4" />
          <div>
            <p className="font-medium text-gray-900 dark:text-gray-100">Visa terminada en 1234</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Expira: 12/2025</p>
          </div>
        </div>
        
        <div className="mt-4">
          <button
            className="text-[#2A5C9A] hover:text-[#1e4474] dark:text-blue-400 dark:hover:text-blue-300 font-medium"
            onClick={() => toast.success('Abriendo formulario de pago...')}
          >
            Actualizar método de pago
          </button>
        </div>
      </div>
      
      {/* Cancel Subscription Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center text-red-600 dark:text-red-500 mb-4">
              <AlertTriangle className="h-6 w-6 mr-2" />
              <h3 className="text-lg font-medium">Cancelar Suscripción</h3>
            </div>
            
            <p className="mb-4 text-gray-700 dark:text-gray-300">
              ¿Estás seguro de que deseas cancelar tu suscripción? Perderás acceso a todas las funciones premium el {new Date(subscriptionData.endDate).toLocaleDateString()}.
            </p>
            
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-md p-4 mb-4">
              <p className="text-sm text-red-600 dark:text-red-400">
                Esta acción no se puede deshacer. Tu cuenta pasará al plan gratuito con funcionalidades limitadas.
              </p>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800"
              >
                Volver
              </button>
              
              <button
                onClick={handleCancelSubscription}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-gray-800"
              >
                Confirmar Cancelación
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}