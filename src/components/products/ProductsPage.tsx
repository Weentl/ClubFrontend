import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import ProductList from './ProductList';
import ProductForm from './ProductForm';
import Sidebar from '../global/Sidebar';

export default function ProductsPage() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar />
      {/* Usamos md:pl-64 para dejar espacio al sidebar en pantallas grandes */}
      <div className="md:pl-64">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <h1 className="text-2xl font-semibold text-gray-900 mb-4 sm:mb-0">
              Mis Productos
            </h1>
            <button
              onClick={() => setShowForm(!showForm)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#2A5C9A] hover:bg-[#1e4474] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="h-5 w-5 mr-2" />
              Agregar Producto
            </button>
          </div>

          <div className="mt-6">
            {showForm ? (
              <div className="bg-white shadow sm:rounded-lg p-6">
                <ProductForm />
              </div>
            ) : (
              <ProductList />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
