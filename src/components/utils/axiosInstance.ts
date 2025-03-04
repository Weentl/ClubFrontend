// axiosInstance.ts
import axios from 'axios';
import toast from 'react-hot-toast';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Interceptor de peticiones para agregar el token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de respuestas para manejar errores 401
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      toast.error('La sesión ha expirado, introduce tus credenciales nuevamente.');
      // Limpia el storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Redirige al login
      // Nota: No se usa useNavigate aquí ya que los interceptores se definen fuera de un componente.
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
