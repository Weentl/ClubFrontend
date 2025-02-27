// ClubFormModal.tsx
import React, { useState, useRef } from 'react';
import { X, MapPin, Phone, Clock, Upload, DollarSign, BarChart } from 'lucide-react';
import { Club, ClubFormData } from '../types/clubs';
import { api } from '../lib/api';

interface Props {
  club?: Club;
  onClose: () => void;
  onSave: (club: Club) => void;
}

export default function ClubFormModal({ club, onClose, onSave }: Props) {
  const [formData, setFormData] = useState<ClubFormData>({
    name: club?.name || '',
    address: club?.address || '',
    phone: club?.phone || '',
    schedule: club?.schedule || '',
    sync_inventory: club?.sync_inventory || false,
    sales_goal: club?.sales_goal || 0,
  });

  const [imagePreview, setImagePreview] = useState<string | null>(club?.logo_url || null);
  const [showAdvanced, setShowAdvanced] = useState(!!club?.sync_inventory || !!club?.sales_goal);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, logo: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setFormData({ ...formData, logo: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Preparar datos: si se seleccionó un logo, asignar imagePreview a logo_url
      const dataToSend: any = { ...formData };
      if (dataToSend.logo) {
        dataToSend.logo_url = imagePreview;
        delete dataToSend.logo;
      }
      if (club) {
        // Actualizar club existente
        const updatedClub = await api.updateClub(club.id, dataToSend);
        onSave(updatedClub);
      } else {
        // Crear nuevo club
        const newClub = await api.createClub(dataToSend);
        onSave(newClub);
      }
    } catch (error) {
      console.error('Error saving club:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-medium">
            {club ? 'Editar Club' : 'Nuevo Club'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="flex justify-center mb-4">
            <div
              className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden cursor-pointer border-2 border-dashed border-gray-300 hover:border-[#2A5C9A]"
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Logo preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <Upload className="h-8 w-8 text-gray-400" />
              )}
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageChange}
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Nombre del Club*
            </label>
            <input
              type="text"
              id="name"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Ej: ProteHouse Central"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>

          <div>
            <label
              htmlFor="address"
              className="block text-sm font-medium text-gray-700"
            >
              Dirección*
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="address"
                required
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Calle, Número, Ciudad"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700"
            >
              Teléfono
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="tel"
                id="phone"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="+52 123 456 7890"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="schedule"
              className="block text-sm font-medium text-gray-700"
            >
              Horario de atención
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Clock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="schedule"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Lun-Vie: 7am-10pm, Sáb-Dom: 8am-8pm"
                value={formData.schedule}
                onChange={(e) =>
                  setFormData({ ...formData, schedule: e.target.value })
                }
              />
            </div>
          </div>

          {!showAdvanced && (
            <button
              type="button"
              className="text-sm text-[#6F42C1] hover:text-[#5a32a3] font-medium"
              onClick={() => setShowAdvanced(true)}
            >
              + Mostrar configuración avanzada
            </button>
          )}

          {showAdvanced && (
            <>
              <div className="border-t pt-4 mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  Configuración avanzada
                </h4>
                
                <div className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    id="syncInventory"
                    checked={formData.sync_inventory}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        sync_inventory: e.target.checked,
                      })
                    }
                    className="h-4 w-4 text-[#2A5C9A] focus:ring-[#2A5C9A] border-gray-300 rounded"
                  />
                  <label
                    htmlFor="syncInventory"
                    className="ml-2 block text-sm text-gray-900"
                  >
                    Sincronizar inventario entre Clubs
                  </label>
                </div>

                <div>
                  <label
                    htmlFor="salesGoal"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Meta de ventas mensual
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <BarChart className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      id="salesGoal"
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="50000"
                      value={formData.sales_goal || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          sales_goal: parseInt(e.target.value) || 0,
                        })
                      }
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <DollarSign className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#28A745] hover:bg-[#218838] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              {club ? 'Actualizar' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
