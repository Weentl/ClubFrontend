import React, { useEffect, useRef, useState } from 'react';
import { User, Mail, Phone, Upload } from 'lucide-react';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function AccountSettings() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: ''
  });
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Extraer el objeto "user" del localStorage y obtener su id
  const storedUser = localStorage.getItem('user');
  const userId = storedUser ? JSON.parse(storedUser).id : null;

  useEffect(() => {
    if (!userId) {
      toast.error('No se encontró el ID del usuario');
      return;
    }
    async function fetchUser() {
      try {
        const res = await fetch(`${API_BASE_URL}/api/users/${userId}`);
        if (res.ok) {
          const data = await res.json();
          setFormData({
            fullName: data.fullName || '',
            email: data.email || '',
            phone: data.phone || ''
          });
          setProfileImage(data.profileImage || null);
        } else {
          toast.error('Error al cargar la información de la cuenta');
        }
      } catch (error) {
        toast.error('Error en la conexión con el servidor');
      }
    }
    fetchUser();
  }, [userId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Generar vista previa
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);

      if (!userId) {
        toast.error('No se encontró el ID del usuario');
        return;
      }
      const imageFormData = new FormData();
      imageFormData.append('logo', file);

      try {
        const res = await fetch(`${API_BASE_URL}/api/users/${userId}/logo`, {
          method: 'POST',
          body: imageFormData
        });
        const data = await res.json();
        if (data.profileImage) {
          setProfileImage(data.profileImage);
          toast.success('Imagen de perfil actualizada correctamente');
        } else {
          toast.error('Error al actualizar la imagen de perfil');
        }
      } catch (error) {
        toast.error('Error en la conexión con el servidor');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      toast.error('No se encontró el ID del usuario');
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        toast.success('Información actualizada correctamente');
      } else {
        toast.error('Error al actualizar la información');
      }
    } catch (error) {
      toast.error('Error en la conexión con el servidor');
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Configuración de Cuenta</h2>
      <form onSubmit={handleSubmit}>
        {/* Imagen de Perfil */}
        <div className="mb-6 flex flex-col items-center">
          <div
            className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden cursor-pointer border-2 border-dashed border-gray-300 hover:border-[#2A5C9A]"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files?.[0];
              if (file && file.type.startsWith('image/')) {
                handleImageChange(e as any);
              }
            }}
          >
            {profileImage ? (
              <img src={profileImage} alt="Imagen de Perfil" className="w-full h-full object-cover" />
            ) : (
              <Upload className="h-8 w-8 text-gray-400" />
            )}
          </div>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleImageChange}
          />
          <p className="mt-2 text-sm text-gray-500">
            Haz clic o arrastra una imagen para cambiar tu foto de perfil
          </p>
        </div>

        {/* Información de la Cuenta */}
        <div className="bg-white border rounded-lg shadow-sm p-6 mb-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                Nombre Completo
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Tu nombre completo"
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
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <span className="mr-1">!</span> Verificación de correo no habilitada
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
    </div>
  );
}

