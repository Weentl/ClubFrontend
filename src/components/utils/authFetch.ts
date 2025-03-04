// hooks/useAuthFetch.ts
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import toast from 'react-hot-toast';

export function useAuthFetch() {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  async function authFetch(url: string, options: RequestInit = {}) {
    const token = localStorage.getItem('token');
    options.headers = {
      ...(options.headers || {}),
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
    };

    const response = await fetch(url, options);

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

