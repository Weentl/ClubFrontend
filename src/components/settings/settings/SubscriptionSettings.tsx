import { useState } from 'react';


// Datos simulados de suscripción


export default function SubscriptionSettings() {
  const [showCancelModal] = useState(false);

  // Cálculos de días restantes y porcentaje de progreso


  // Contenido original de la página
  const content = (
    <>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Gestión de Suscripción</h2>
      
      {/* Aviso de "Próximamente" interno */}
      <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 mb-6">
        <p className="text-yellow-800 dark:text-yellow-200 font-medium">Próximamente</p>
        <p className="text-yellow-700 dark:text-yellow-300 text-sm mt-1">
          Estamos trabajando en nuevas opciones de suscripción y características premium. ¡Mantente atento!
        </p>
      </div>
      
      {/* Tarjeta de estado de suscripción */}
      <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-sm p-6 mb-6">
        {/* ... resto del contenido original ... */}
      </div>
      
      {/* Resto del contenido (Beneficios, Método de Pago, etc.) */}
      {/* ... */}
    </>
  );

  return (
    <div className="relative">
      <div className="filter blur-sm pointer-events-none">
        {content}
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-white bg-opacity-80 dark:bg-gray-800 dark:bg-opacity-80">
        <h2 className="text-2xl font-bold text-gray-900">Próximamente</h2>
        <p className="mt-2 text-gray-600">Esta función estará disponible en una próxima versión beta.</p>
      </div>
      {showCancelModal && (
        // Modal de cancelación (puedes dejarlo intacto si lo necesitas)
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75 flex items-center justify-center z-50">
          {/* ... contenido del modal ... */}
        </div>
      )}
    </div>
  );
}
