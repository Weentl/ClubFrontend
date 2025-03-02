import { useState } from 'react';
import { Link2, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';

// Datos simulados de integraciones
const integrationsData = [
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Procesamiento de pagos',
    icon: 'https://cdn.worldvectorlogo.com/logos/stripe-4.svg',
    connected: true,
    lastSync: '2024-05-15T10:30:00Z'
  },
  {
    id: 'mailchimp',
    name: 'Mailchimp',
    description: 'Marketing por email',
    icon: 'https://cdn.worldvectorlogo.com/logos/mailchimp-freddie-icon-1.svg',
    connected: false
  },
  {
    id: 'google',
    name: 'Google Analytics',
    description: 'Análisis de tráfico web',
    icon: 'https://cdn.worldvectorlogo.com/logos/google-analytics-4.svg',
    connected: true,
    lastSync: '2024-05-10T14:45:00Z'
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp Business',
    description: 'Comunicación con clientes',
    icon: 'https://cdn.worldvectorlogo.com/logos/whatsapp-business.svg',
    connected: false
  }
];

export default function IntegrationsSettings() {
  const [integrations, setIntegrations] = useState(integrationsData);

  const handleConnect = (id: string) => {
    toast.success(`Conectando con ${integrations.find(i => i.id === id)?.name}...`);
    setTimeout(() => {
      setIntegrations(prev =>
        prev.map(integration =>
          integration.id === id
            ? { ...integration, connected: true, lastSync: new Date().toISOString() }
            : integration
        )
      );
      toast.success(`Conexión con ${integrations.find(i => i.id === id)?.name} establecida`);
    }, 1500);
  };

  const handleDisconnect = (id: string) => {
    setIntegrations(prev =>
      prev.map(integration =>
        integration.id === id
          ? { ...integration, connected: false, lastSync: undefined }
          : integration
      )
    );
    toast.success(`Desconectado de ${integrations.find(i => i.id === id)?.name}`);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Nunca';
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const content = (
    <>
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Integraciones</h2>
      <div className="bg-white border rounded-lg shadow-sm p-6 mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Servicios Conectados</h3>
        <div className="space-y-6">
          {integrations.map((integration) => (
            <div key={integration.id} className="flex items-start justify-between border-b border-gray-200 pb-6 last:border-0 last:pb-0">
              <div className="flex items-start">
                <img 
                  src={integration.icon} 
                  alt={integration.name} 
                  className="h-10 w-10 mr-4"
                />
                <div>
                  <h4 className="text-base font-medium text-gray-900">{integration.name}</h4>
                  <p className="text-sm text-gray-500">{integration.description}</p>
                  {integration.connected && integration.lastSync && (
                    <p className="text-xs text-gray-500 mt-1">
                      Última sincronización: {formatDate(integration.lastSync)}
                    </p>
                  )}
                </div>
              </div>
              <div>
                {integration.connected ? (
                  <div className="flex flex-col items-end">
                    <span className="flex items-center text-green-600 text-sm mb-2">
                      <Check className="h-4 w-4 mr-1" />
                      Conectado
                    </span>
                    <button
                      onClick={() => handleDisconnect(integration.id)}
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      Desconectar
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleConnect(integration.id)}
                    className="px-3 py-1.5 bg-[#2A5C9A] text-white text-sm rounded-md hover:bg-[#1e4474] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Conectar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="bg-white border rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">API y Webhooks</h3>
        {/* Resto del contenido de API y Webhooks */}
      </div>
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
    </div>
  );
}
