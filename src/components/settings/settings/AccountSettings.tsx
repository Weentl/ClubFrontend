import React, { useRef, useState } from 'react';
import { User, Mail, Phone, Upload } from 'lucide-react';
import toast from 'react-hot-toast';

// Mock user data - in a real app, this would come from an API
const userData = {
  businessName: 'ProteHouse Nutrition',
  email: 'contacto@protehouse.com',
  phone: '+52 55 1234 5678',
  logoUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80'
};

export default function AccountSettings() {
  const [formData, setFormData] = useState({
    businessName: userData.businessName,
    email: userData.email,
    phone: userData.phone
  });
  
  const [logoPreview, setLogoPreview] = useState<string | null>(userData.logoUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, this would upload the file to a server
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would call an API to update the user data
    // API: PATCH /api/account → { businessName, email, phone }
    toast.success('Información actualizada correctamente');
  };
  
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Información de la Cuenta</h2>
      
      <form onSubmit={handleSubmit}>
        {/* Business Logo */}
        <div className="mb-6 flex flex-col items-center">
          <div 
            className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden cursor-pointer border-2 border-dashed border-gray-300 hover:border-[#2A5C9A]"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files?.[0];
              if (file && file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onloadend = () => {
                  setLogoPreview(reader.result as string);
                };
                reader.readAsDataURL(file);
              }
            }}
          >
            {logoPreview ? (
              <img
                src={logoPreview}
                alt="Logo preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <Upload className="h-8 w-8 text-gray-400" />
            )}
          </div>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleLogoChange}
          />
          <p className="mt-2 text-sm text-gray-500">
            Haz clic o arrastra una imagen para cambiar el logo
          </p>
        </div>
        
        {/* Business Information */}
        <div className="bg-white border rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Información Básica</h3>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-1">
                Nombre
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="businessName"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Nombre de tu negocio"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Correo Electrónico
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="tu@ejemplo.com"
                />
              </div>
              <p className="mt-1 text-sm text-green-600 flex items-center">
                <span className="mr-1">✓</span> Correo verificado
              </p>
            </div>
            
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono (opcional)
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="+52 123 456 7890"
                />
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-[#2A5C9A] text-white rounded-md hover:bg-[#1e4474] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Guardar Cambios
            </button>
          </div>
        </div>
      </form>
      
      {/* Billing Information */}
      <div className="bg-white border rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Datos de Facturación</h3>
        
        <div className="p-4 bg-gray-50 rounded-lg mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-white p-2 rounded-md border border-gray-200 mr-3">
                <svg className="h-6 w-6" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                  <path d="M32 5.333H0V26.667H32V5.333Z" fill="#2A5C9A"/>
                  <path d="M12.8 20H9.6V12H12.8V20Z" fill="#FFFFFF"/>
                  <path d="M11.2 10.667C10.223 10.667 9.6 10.044 9.6 9.067C9.6 8.089 10.223 7.467 11.2 7.467C12.177 7.467 12.8 8.089 12.8 9.067C12.8 10.044 12.177 10.667 11.2 10.667Z" fill="#FFFFFF"/>
                  <path d="M22.4 20H19.2V16C19.2 14.667 19.2 13.333 17.6 13.333C16 13.333 16 14.667 16 16V20H12.8V12H16V13.333C16.533 12.444 17.6 12 18.667 12C20.8 12 22.4 13.333 22.4 16V20Z" fill="#FFFFFF"/>
                </svg>
              </div>
              <div>
                <p className="font-medium">Tarjeta Visa</p>
                <p className="text-sm text-gray-500">•••• •••• •••• 1234</p>
              </div>
            </div>
            <div>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                Activa
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500">Dirección de facturación</p>
            <p className="font-medium">Av. Insurgentes Sur 1234, CDMX</p>
          </div>
          
          <button
            className="text-[#2A5C9A] hover:text-[#1e4474] font-medium"
            onClick={() => toast.success('Abriendo formulario de facturación...')}
          >
            Actualizar
          </button>
        </div>
      </div>
    </div>
  );
}