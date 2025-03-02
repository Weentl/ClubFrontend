// src/components/onboarding/OnboardingFlow.tsx
import { useState } from 'react';
import { Target, ArrowRight, ArrowLeft, Plus, Trash } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

interface Club {
  clubName: string;
  address: string;
}

interface MainClub {
  clubName: string;
  address: string;
}

interface OnboardingData {
  productTypes: string[];
  mainClub: MainClub;
  initialGoal: string;
  clubs: Club[];
}

const PRODUCT_TYPES = [
  { id: 'supplements', label: 'Suplementos' },
  { id: 'food', label: 'Alimentos' },
  { id: 'drinks', label: 'Bebidas' },
  { id: 'snacks', label: 'Snacks' },
];

const INITIAL_GOALS = [
  { id: 'sales_100', label: 'Vender 100 unidades/mes' },
  { id: 'sales_1000', label: 'Vender $1,000/mes' },
  { id: 'customers_50', label: 'Conseguir 50 clientes nuevos' },
  { id: 'growth_20', label: 'Crecer 20% en 3 meses' },
];

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function OnboardingFlow() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<OnboardingData>({
    productTypes: [],
    mainClub: { clubName: '', address: '' },
    initialGoal: '',
    clubs: [],
  });

  const navigate = useNavigate();
  const { updateAuthUser } = useAuth();
  const token = localStorage.getItem('token');

  // Estado para agregar un club adicional
  const [clubInput, setClubInput] = useState<Club>({ clubName: '', address: '' });

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
    else handleSubmit();
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/auth/onboarding`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Error al enviar onboarding.');
      }

      toast.success('Onboarding completado exitosamente.');
      updateAuthUser({ isFirstLogin: false });
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleSkip = () => {
    toast('Onboarding saltado');
    navigate('/dashboard');
  };

  const addClub = () => {
    if (clubInput.clubName.trim() === '') {
      toast.error('El nombre del club es requerido.');
      return;
    }
    setData({ ...data, clubs: [...data.clubs, clubInput] });
    setClubInput({ clubName: '', address: '' });
  };

  const removeClub = (index: number) => {
    const newClubs = data.clubs.filter((_, i) => i !== index);
    setData({ ...data, clubs: newClubs });
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Tipo de Productos
              </label>
              <div className="grid grid-cols-2 gap-4">
                {PRODUCT_TYPES.map((type) => (
                  <div key={type.id} className="relative flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id={type.id}
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        checked={data.productTypes.includes(type.id)}
                        onChange={(e) => {
                          const newTypes = e.target.checked
                            ? [...data.productTypes, type.id]
                            : data.productTypes.filter((t) => t !== type.id);
                          setData({ ...data, productTypes: newTypes });
                        }}
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor={type.id} className="font-medium text-gray-700">
                        {type.label}
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label htmlFor="mainClubName" className="block text-sm font-medium text-gray-700">
                Nombre del Club Principal
              </label>
              <input
                type="text"
                id="mainClubName"
                placeholder="Ej: Club Central"
                value={data.mainClub.clubName}
                onChange={(e) =>
                  setData({ ...data, mainClub: { ...data.mainClub, clubName: e.target.value } })
                }
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
              />
            </div>
            <div>
              <label htmlFor="mainClubAddress" className="block text-sm font-medium text-gray-700">
                Dirección del Club Principal
              </label>
              <input
                type="text"
                id="mainClubAddress"
                placeholder="Calle, Número, Ciudad"
                value={data.mainClub.address}
                onChange={(e) =>
                  setData({ ...data, mainClub: { ...data.mainClub, address: e.target.value } })
                }
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
              />
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <div>
              <label htmlFor="initialGoal" className="block text-sm font-medium text-gray-700">
                Meta Inicial
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Target className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  id="initialGoal"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={data.initialGoal}
                  onChange={(e) => setData({ ...data, initialGoal: e.target.value })}
                >
                  <option value="">Selecciona una meta</option>
                  {INITIAL_GOALS.map((goal) => (
                    <option key={goal.id} value={goal.id}>
                      {goal.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Agrega tus clubes adicionales (Opcional)
              </label>
              <div className="mt-2 space-y-4">
                {data.clubs.map((club, index) => (
                  <div key={index} className="flex items-center justify-between border p-2 rounded">
                    <div>
                      <p className="font-medium">{club.clubName}</p>
                      <p className="text-sm text-gray-500">{club.address}</p>
                    </div>
                    <button onClick={() => removeClub(index)} type="button" className="text-red-500">
                      <Trash size={16} />
                    </button>
                  </div>
                ))}
                <div className="flex flex-col space-y-2">
                  <input
                    type="text"
                    placeholder="Nombre del club"
                    className="p-2 border rounded"
                    value={clubInput.clubName}
                    onChange={(e) => setClubInput({ ...clubInput, clubName: e.target.value })}
                  />
                  <input
                    type="text"
                    placeholder="Dirección"
                    className="p-2 border rounded"
                    value={clubInput.address}
                    onChange={(e) => setClubInput({ ...clubInput, address: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={addClub}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="mr-2" />
                    Agregar Club
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-extrabold text-gray-900">
          Configura tu Negocio
        </h2>
        <div className="mt-2 flex justify-center">
          <div className="w-full max-w-xs bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-[#2A5C9A] h-2.5 rounded-full"
              style={{ width: `${(step / 4) * 100}%` }}
            ></div>
          </div>
        </div>
        <p className="mt-2 text-center text-sm text-gray-600">
          Paso {step} de 4
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {renderStep()}

          <div className="mt-6 flex justify-between">
            <button
              type="button"
              onClick={handleBack}
              className={`inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                step === 1 ? 'invisible' : ''
              }`}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Anterior
            </button>

            <div className="flex space-x-3">
              {step === 1 && (
                <button
                  type="button"
                  onClick={handleSkip}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Saltar
                </button>
              )}
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#2A5C9A] hover:bg-[#1e4474] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {step === 4 ? '¡Empezar!' : 'Siguiente'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


