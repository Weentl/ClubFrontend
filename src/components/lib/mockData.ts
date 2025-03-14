// src/lib/api.js
import axios, { AxiosRequestConfig } from 'axios';

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
});

export const api = {
  // Empleado: obtener y actualizar datos
  getEmployee: (id: any, config: AxiosRequestConfig<any> | undefined) => apiClient.get(`/employees/${id}`, config),
  updateEmployee: (id: any, data: any, config: AxiosRequestConfig<any> | undefined) => apiClient.put(`/employees/${id}`, data, config),

  // Ventas: listado y creación
  getSales: (params: any, config: AxiosRequestConfig<any> | undefined) => apiClient.get('/sales', { params, ...config }),
  postSale: (data: any, config: AxiosRequestConfig<any> | undefined) => apiClient.post('/sales', data, config),

  // Clientes: listado y creación
  getClients: (params: any, config: AxiosRequestConfig<any> | undefined) => apiClient.get('/clients', { params, ...config }),
  postClient: (data: any, config: AxiosRequestConfig<any> | undefined) => apiClient.post('/clients', data, config),

  // Club: obtener información del club
  getClub: (id: any, config: AxiosRequestConfig<any> | undefined) => apiClient.get(`/clubs/${id}`, config),

  // Productos e Inventario (si cuentas con estos endpoints)
  getProducts: (params: any, config: AxiosRequestConfig<any> | undefined) => apiClient.get('/products', { params, ...config }),
  getInventory: (params: any, config: AxiosRequestConfig<any> | undefined) => apiClient.get('/inventory', { params, ...config }),
};
