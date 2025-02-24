// src/components/auth/PasswordReset.tsx
import React, { useState } from 'react';
import { Mail, Key } from 'lucide-react';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';

type Step = 'request' | 'code' | 'success';

export default function PasswordReset() {
  const [step, setStep] = useState<Step>('request');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const { requestPasswordReset, resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await requestPasswordReset(email);
      setStep('code');
    } catch (error) {
      // Error se maneja en AuthContext
    }
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await resetPassword(email, code, newPassword);
      setStep('success');
    } catch (error) {
      // Error se maneja en AuthContext
    }
  };

  const renderStep = () => {
    switch (step) {
      case 'request':
        return (
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Correo electrónico
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="tu@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#2A5C9A] hover:bg-[#1e4474] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Enviar código de recuperación
              </button>
            </div>
          </form>
        );

      case 'code':
        return (
          <form className="space-y-6" onSubmit={handleCodeSubmit}>
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                Código de verificación
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Key className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="code"
                  name="code"
                  type="text"
                  required
                  maxLength={6}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="123456"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                Nueva contraseña
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Key className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  required
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#2A5C9A] hover:bg-[#1e4474] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Actualizar contraseña
              </button>
            </div>
          </form>
        );

      case 'success':
        return (
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Contraseña actualizada</h3>
            <p className="mt-1 text-sm text-gray-500">
              Tu contraseña ha sido actualizada correctamente.
            </p>
            <div className="mt-6">
              <a
                href="/login"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#2A5C9A] hover:bg-[#1e4474] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Ir al inicio de sesión
              </a>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Recuperar contraseña
        </h2>
        <div className="mt-2 flex justify-center">
          <div className="flex items-center space-x-2">
            {['request', 'code', 'success'].map((s, index) => (
              <React.Fragment key={s}>
                <div
                  className={`h-2 w-2 rounded-full ${
                    step === s ? 'bg-[#2A5C9A]' : 'bg-gray-300'
                  }`}
                />
                {index < 2 && <div className="h-0.5 w-4 bg-gray-300" />}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {renderStep()}
        </div>
      </div>
    </div>
  );
}
