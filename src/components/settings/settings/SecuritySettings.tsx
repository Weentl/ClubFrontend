import { useState } from 'react';
import { Shield, Key, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

// Datos simulados de seguridad
const securityData = {
  twoFactorEnabled: false,
  lastPasswordChange: '2024-04-15T10:30:00Z',
  accessLogs: [
    { id: '1', ip: '187.190.154.123', device: 'Chrome en Windows', date: '2024-05-20T14:30:00Z' },
    { id: '2', ip: '187.190.154.123', device: 'App iOS', date: '2024-05-18T09:15:00Z' },
    { id: '3', ip: '200.68.128.45', device: 'Firefox en MacOS', date: '2024-05-15T18:45:00Z' },
  ]
};

export default function SecuritySettings() {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(securityData.twoFactorEnabled);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const handleToggleTwoFactor = () => {
    setTwoFactorEnabled(!twoFactorEnabled);
    toast.success(`Verificación en dos pasos ${!twoFactorEnabled ? 'activada' : 'desactivada'}`);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }
    if (passwordData.newPassword.length < 8) {
      toast.error('La contraseña debe tener al menos 8 caracteres');
      return;
    }
    toast.success('Contraseña actualizada correctamente');
    setShowPasswordModal(false);
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const content = (
    <>
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Seguridad</h2>
      <div className="bg-white border rounded-lg shadow-sm p-6 mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Autenticación</h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Shield className="h-5 w-5 text-gray-400 mr-2" />
            <div>
              <p className="font-medium">Verificación en dos pasos</p>
              <p className="text-sm text-gray-500">Añade una capa extra de seguridad a tu cuenta</p>
            </div>
          </div>
          <button
            type="button"
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${twoFactorEnabled ? 'bg-[#28A745]' : 'bg-gray-200'}`}
            role="switch"
            aria-checked={twoFactorEnabled}
            onClick={handleToggleTwoFactor}
          >
            <span className="sr-only">Activar verificación en dos pasos</span>
            <span className={`pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${twoFactorEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
        </div>
        {twoFactorEnabled && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-700">
              La verificación en dos pasos está activada. Recibirás un código por SMS cada vez que inicies sesión desde un nuevo dispositivo.
            </p>
          </div>
        )}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Key className="h-5 w-5 text-gray-400 mr-2" />
              <div>
                <p className="font-medium">Contraseña</p>
                <p className="text-sm text-gray-500">Última actualización: {formatDate(securityData.lastPasswordChange)}</p>
              </div>
            </div>
            <button
              onClick={() => setShowPasswordModal(true)}
              className="px-3 py-1.5 bg-[#2A5C9A] text-white text-sm rounded-md hover:bg-[#1e4474] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cambiar Contraseña
            </button>
          </div>
        </div>
      </div>
      <div className="bg-white border rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Historial de Acceso</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dispositivo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dirección IP</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {securityData.accessLogs.map((log) => (
                <tr key={log.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(log.date)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.device}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 text-right">
          <button className="text-[#2A5C9A] hover:text-[#1e4474] text-sm font-medium" onClick={() => toast.success('Cargando historial completo...')}>
            Ver historial completo
          </button>
        </div>
      </div>
      {showPasswordModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Cambiar Contraseña</h3>
            <form onSubmit={handlePasswordSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Contraseña Actual
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      id="currentPassword"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      required
                      className="block w-full pr-10 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Nueva Contraseña
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      id="newPassword"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      required
                      minLength={8}
                      className="block w-full pr-10 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    La contraseña debe tener al menos 8 caracteres
                  </p>
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirmar Contraseña
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    required
                    className="block w-full py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#2A5C9A] text-white rounded-md hover:bg-[#1e4474] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Actualizar Contraseña
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
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
