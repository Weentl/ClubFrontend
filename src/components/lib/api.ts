const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

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
    const response = await fetch(`${API_BASE_URL}/api/clubs?user=${userId}`);
    if (!response.ok) {
      throw new Error("Error al obtener los clubs");
    }
    return response.json();
  },
  createClub: async (clubData: any) => {
    clubData.user = api.getUserId();
    const response = await fetch(`${API_BASE_URL}/api/clubs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(clubData)
    });
    if (!response.ok) {
      throw new Error("Error al crear el club");
    }
    return response.json();
  },
  updateClub: async (id: string, clubData: any) => {
    const response = await fetch(`${API_BASE_URL}/api/clubs/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(clubData)
    });
    if (!response.ok) {
      throw new Error("Error al actualizar el club");
    }
    return response.json();
  },
  deleteClub: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/api/clubs/${id}`, {
      method: "DELETE"
    });
    if (!response.ok) {
      throw new Error("Error al eliminar el club");
    }
    return response.json();
  },
  // Métodos para empleados
  getEmployees: async (clubId: string) => {
    const response = await fetch(`${API_BASE_URL}/api/employees/${clubId}`);
    if (!response.ok) throw new Error("Error al obtener empleados");
    return response.json();
  },
  createEmployee: async (clubId: string, employeeData: any) => {
    // Incluir el clubId en el body en lugar de en la URL
    employeeData.club = clubId;
    const response = await fetch(`${API_BASE_URL}/api/employees`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(employeeData)
    });
    if (!response.ok) throw new Error("Error al crear empleado");
    return response.json();
  },
  updateEmployee: async (employeeId: string, employeeData: any) => {
    const response = await fetch(`${API_BASE_URL}/api/employees/${employeeId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(employeeData)
    });
    if (!response.ok) throw new Error("Error al actualizar empleado");
    return response.json();
  },
  deleteEmployee: async (employeeId: string) => {
    const response = await fetch(`${API_BASE_URL}/api/employees/${employeeId}`, {
      method: "DELETE"
    });
    if (!response.ok) throw new Error("Error al eliminar empleado");
    return response.json();
  },
  
};

  
  