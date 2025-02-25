import { useState } from 'react';
import { Plus } from 'lucide-react';
import SalesList from './SalesList';
import NewSaleModal from './NewSaleModal';

export default function SalesPage() {
  const [showNewSaleModal, setShowNewSaleModal] = useState(false);

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Registro de Ventas</h1>
          <button
            onClick={() => setShowNewSaleModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#2A5C9A] hover:bg-[#1e4474] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-5 w-5 mr-2" />
            Nueva Venta
          </button>
        </div>

        <div className="mt-6">
          <SalesList />
        </div>

        {showNewSaleModal && (
          <NewSaleModal onClose={() => setShowNewSaleModal(false)} />
        )}
      </div>
    </div>
  );
}

