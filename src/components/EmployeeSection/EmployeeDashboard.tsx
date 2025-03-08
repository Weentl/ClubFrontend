import { useState, useEffect } from 'react';
import EmployeeChangePassword from './EmployeeChangePassword';

interface Employee {
  id: string;
  fullName: string;
  email: string;
  role: string;
  isFirstLogin: boolean;
  userType: string;
  // Otras propiedades que necesites...
}

export default function EmployeeDashboard() {
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null);

  useEffect(() => {
    // Obtenemos la información del empleado del localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedEmployee: Employee = JSON.parse(storedUser);
        setCurrentEmployee(parsedEmployee);
      } catch (error) {
        console.error("Error al parsear el empleado del localStorage", error);
      }
    } else {
      console.warn("No se encontró la información del empleado en localStorage");
    }
  }, []);

  const handlePasswordChanged = () => {
    // Una vez cambiada la contraseña, actualizamos isFirstLogin a false
    if (currentEmployee) {
      setCurrentEmployee({
        ...currentEmployee,
        isFirstLogin: false,
      });
    }
  };

  // Mientras se carga el empleado, mostramos un mensaje de carga
  if (!currentEmployee) {
    return <div>Cargando información del empleado...</div>;
  }

  if (currentEmployee.isFirstLogin) {
    return (
      <div className="p-4">
        <EmployeeChangePassword
          employeeId={currentEmployee.id}
          onPasswordChanged={handlePasswordChanged}
        />
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Dashboard de Empleado</h1>
      <p className="text-gray-700">
        Bienvenido, {currentEmployee.fullName}. Aquí va el dashboard y sitio del empleado.
      </p>
    </div>
  );
}

