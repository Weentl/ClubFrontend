// src/components/auth/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';

interface User {
  id: string;
  fullName: string;
  email: string;
  businessType: string;
  isFirstLogin: boolean; // Add isFirstLogin to the User interface
}

interface MainClub {
  id: string;
  clubName: string;
  address: string;
}

interface AuthContextType {
  user: User | null;
  mainClub: MainClub | null; // Nuevo campo
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (data: {
    fullName: string;
    email: string;
    password: string;
    businessType: string;
    acceptedTerms: boolean;
  }) => Promise<void>;
  signOut: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<any>;
  resetPassword: (
    email: string,
    code: string,
    newPassword: string
  ) => Promise<any>;
  updateAuthUser: (userData: Partial<User>) => void;
}

// Usamos import.meta.env para obtener la URL base en Vite
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [mainClub, setMainClub] = useState<MainClub | null>(null); // Nuevo estado
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    const mainClubStr = localStorage.getItem('mainClub'); // Obtener del localStorage
    if (token && userStr) {
      setUser(JSON.parse(userStr));
    }
    if (mainClubStr) {
      setMainClub(JSON.parse(mainClubStr));
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Error al iniciar sesión.');
      }
      const data = await res.json();
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      if (data.mainClub) {
        localStorage.setItem('mainClub', JSON.stringify(data.mainClub));
        setMainClub(data.mainClub);
      }

      setUser(data.user);
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    }
  };

  const signUp = async (userData: {
    fullName: string;
    email: string;
    password: string;
    businessType: string;
    acceptedTerms: boolean;
  }) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Error al registrar usuario.');
      }
      toast.success('Usuario registrado correctamente. Por favor, inicia sesión.');
      const data = await res.json();
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('mainClub'); // Eliminar club principal
    setUser(null);
    setMainClub(null);
  };

  const requestPasswordReset = async (email: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/request-reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Error al solicitar reseteo.');
      }
      const data = await res.json();
      toast.success('Código de reseteo enviado. Revisa tu email.');
      return data;
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    }
  };

  const resetPassword = async (
    email: string,
    code: string,
    newPassword: string
  ) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, newPassword }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Error al resetear la contraseña.');
      }
      const data = await res.json();
      toast.success('Contraseña actualizada correctamente.');
      return data;
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    }
  };
  const updateAuthUser = (userData: Partial<User>) => {
    setUser(currentUser => {
      const updatedUser = { ...currentUser, ...userData } as User;
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
    });
  };
  const value = {
    user,
    mainClub, // Agregar al contexto
    loading,
    signIn,
    signUp,
    signOut,
    requestPasswordReset,
    resetPassword,
    updateAuthUser, // Include updateAuthUser in the value
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
}

