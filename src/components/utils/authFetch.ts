// utils/useAuthFetch.ts
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import toast from 'react-hot-toast';

export function useAuthFetch() {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  async function authFetch(url: string, options: RequestInit = {}) {
    const token = localStorage.getItem('token');
    console.log('Token:', token);
    
    // Clonar headers existentes o crear nuevo objeto
    const headers = new Headers(options.headers || {});
    
    // Solo agregar Content-Type si no es FormData
    if (!(options.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
      console.log('Headers:', headers);
    }
    
    // Agregar Authorization si existe el token
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
      console.log('Headers:', headers);
    }



    const response = await fetch(url, {
      ...options,
      headers
    });

    if (response.status === 401) {
      toast.error('La sesión ha expirado, introduce tus credenciales nuevamente.');
      await signOut();
      navigate('/login');
      return Promise.reject(new Error('Sesión expirada'));
    }
    return response;
  }

  return authFetch;
}

