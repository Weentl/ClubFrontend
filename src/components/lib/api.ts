const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

function getAuthHeaders(additionalHeaders = {}) {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...additionalHeaders,
  };
}

export const api = {
  getUserId: (): string => {
    const userJson = localStorage.getItem('user');
    if (!userJson) {
      throw new Error('No se encontró el usuario en localStorage');
    }
    const user = JSON.parse(userJson);
    return user.id;
  },

  getClubs: async () => {
    const userId = api.getUserId();
    const response = await fetch(`${API_BASE_URL}/api/clubs?user=${userId}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error("Error al obtener los clubs");
    }
    return response.json();
  },

  createClub: async (clubData: any) => {
    clubData.user = api.getUserId();
    const response = await fetch(`${API_BASE_URL}/api/clubs`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(clubData),
    });
    if (!response.ok) {
      throw new Error("Error al crear el club");
    }
    return response.json();
  },

  updateClub: async (id: string, clubData: any) => {
    const response = await fetch(`${API_BASE_URL}/api/clubs/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(clubData),
    });
    if (!response.ok) {
      throw new Error("Error al actualizar el club");
    }
    return response.json();
  },

  deleteClub: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/api/clubs/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error("Error al eliminar el club");
    }
    return response.json();
  },

  // Métodos para empleados
  getEmployees: async (clubId: string) => {
    const response = await fetch(`${API_BASE_URL}/api/employees/${clubId}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Error al obtener empleados");
    return response.json();
  },

  createEmployee: async (clubId: string, employeeData: any) => {
    employeeData.club = clubId;
    const response = await fetch(`${API_BASE_URL}/api/employees`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(employeeData),
    });
    if (!response.ok) throw new Error("Error al crear empleado");
    return response.json();
  },

  updateEmployee: async (employeeId: string, employeeData: any) => {
    const response = await fetch(`${API_BASE_URL}/api/employees/${employeeId}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(employeeData),
    });
    if (!response.ok) throw new Error("Error al actualizar empleado");
    return response.json();
  },

  deleteEmployee: async (employeeId: string) => {
    const response = await fetch(`${API_BASE_URL}/api/employees/${employeeId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Error al eliminar empleado");
    return response.json();
  },
};


  
  