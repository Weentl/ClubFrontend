import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Include auth token in all requests
axios.interceptors.request.use(config => {
  const token = localStorage.getItem('token'); // Changed from 'authToken' to 'token'
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const api = {
  // Clientes
  getClients: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/clients`);
      return response.data;
    } catch (error) {
      console.error('Error fetching clients:', error);
      throw error;
    }
  },
  getClient: async (id: string) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/clients/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching client ${id}:`, error);
      throw error;
    }
  },
  createClient: async (clientData: any) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/clients`, clientData);
      return response.data;
    } catch (error) {
      console.error('Error creating client:', error);
      throw error;
    }
  },
  updateClient: async (id: string, clientData: any) => {
    try {
      const response = await axios.patch(`${API_BASE_URL}/api/clients/${id}`, clientData);
      return response.data;
    } catch (error) {
      console.error(`Error updating client ${id}:`, error);
      throw error;
    }
  },
  getClientSales: async (clientId: string) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/clients/${clientId}/sales`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching sales for client ${clientId}:`, error);
      throw error;
    }
  },

  // Producto: obtiene los datos de un producto para extraer el nombre.
  getProductName: async (productId: string) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/products/${productId}`);
      return response.data.name;
    } catch (error) {
      console.error('Error fetching product name:', error);
      return 'Producto desconocido';
    }
  },
};