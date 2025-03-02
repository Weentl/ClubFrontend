
import { Clock } from 'lucide-react';

interface FutureProjectionsReportProps {
  period: 'weekly' | 'monthly' | 'yearly';
}

export default function FutureProjectionsReport({ period }: FutureProjectionsReportProps) {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Proyecciones Futuras</h2>
        <span className="text-sm text-gray-500">
          {period === 'weekly' ? 'Semana 20, 2024' : period === 'monthly' ? 'Mayo 2024' : '2024'}
        </span>
      </div>

      {/* Contenido blur con mensaje de próximamente */}
      <div className="relative bg-white border rounded-lg shadow-sm p-8 mb-8 min-h-[420px] flex flex-col items-center justify-center overflow-hidden">
        {/* Fondo blur de lo que vendría siendo la gráfica */}
        <div className="absolute inset-0 opacity-10 blur-md">
          <div className="h-80 w-full">
            <div className="h-64 w-full border-b border-gray-200"></div>
            <div className="h-4 w-full"></div>
            <div className="flex justify-center mt-4 space-x-6">
              <div className="w-20 h-3 bg-blue-500 rounded"></div>
              <div className="w-20 h-3 bg-red-500 rounded"></div>
              <div className="w-20 h-3 bg-green-500 rounded"></div>
            </div>
          </div>
        </div>

        {/* Mensaje de próximamente */}
        <div className="z-10 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 mb-4">
            <Clock className="h-8 w-8 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Próximamente
          </h3>
          <p className="text-gray-600 max-w-md mx-auto mb-6">
            Estamos trabajando en esta característica de Proyecciones Futuras para ayudarte a planificar tus finanzas.
            Estará disponible próximamente.
          </p>
          <div className="inline-flex items-center px-4 py-2 bg-blue-50 border border-blue-100 rounded-md text-sm text-blue-700">
            Notificarme cuando esté disponible
          </div>
        </div>
      </div>

      {/* Card de metas también deshabilitada */}
      <div className="bg-white border rounded-lg shadow-sm p-4 opacity-50 blur-sm relative">
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-md text-sm font-medium">
            Próximamente
          </span>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Metas vs. Real</h3>
        <div className="space-y-6">
          {[1, 2, 3].map((_, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-3"></div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                <div className="h-2.5 rounded-full bg-gray-300" style={{ width: '60%' }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
