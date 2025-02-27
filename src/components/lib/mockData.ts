import { Product } from '../types/products';
import { Sale } from '../types/sales';
import { InventoryItem, InventoryMovement } from '../types/inventory';
import { Client } from '../types/clients';
import { Club, Employee } from '../types/clubs';

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Proteína Whey',
    category: 'Suplementos',
    type: 'sealed',
    description: 'Proteína de suero de leche',
    purchase_price: 800,
    sale_price: 1200,
  },
  {
    id: '2',
    name: 'BCAA',
    category: 'Suplementos',
    type: 'sealed',
    description: 'Aminoácidos ramificados',
    purchase_price: 400,
    sale_price: 600,
  },
  {
    id: '3',
    name: 'Batido de Proteína',
    category: 'Preparados',
    type: 'prepared',
    description: 'Batido preparado con proteína y frutas',
    purchase_price: 50,
    sale_price: 120,
  },
  {
    id: '4',
    name: 'Waffle Proteico',
    category: 'Preparados',
    type: 'prepared',
    description: 'Waffle alto en proteína',
    purchase_price: 40,
    sale_price: 90,
  },
];

export const mockInventory: InventoryItem[] = [
  { id: '1', product_id: '1', quantity: 15, last_updated: new Date().toISOString() },
  { id: '2', product_id: '2', quantity: 3, last_updated: new Date().toISOString() },
];

export const mockInventoryMovements: InventoryMovement[] = [
  {
    id: '1',
    inventory_id: '1',
    type: 'purchase',
    quantity: 20,
    notes: 'Compra inicial',
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    purchase_price: 800,
    sale_price: 1200,
    update_catalog_price: true,
    _id: undefined
  },
  {
    id: '2',
    inventory_id: '1',
    type: 'use_in_prepared',
    quantity: -5,
    notes: 'Uso en batidos',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    _id: undefined,
    update_catalog_price: false
  },
];

export const mockClients: Client[] = [
  {
    id: '1',
    name: 'Ana Pérez',
    phone: '+52 123 456 7890',
    email: 'ana@ejemplo.com',
    type: 'regular',
    total_spent: 2500,
    last_purchase: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    preferences: ['supplements', 'snacks'],
    created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    _id: ''
  },
  {
    id: '2',
    name: 'Luis Rodríguez',
    phone: '+52 987 654 3210',
    email: 'luis@ejemplo.com',
    type: 'occasional',
    total_spent: 800,
    last_purchase: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    preferences: ['food'],
    created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    _id: ''
  },
  {
    id: '3',
    name: 'María González',
    phone: '+52 555 123 4567',
    email: 'maria@ejemplo.com',
    type: 'wholesale',
    total_spent: 12000,
    last_purchase: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    preferences: ['supplements', 'food', 'snacks'],
    created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    _id: ''
  },
  {
    id: '4',
    name: 'Carlos Sánchez',
    phone: '+52 333 222 1111',
    type: 'occasional',
    total_spent: 350,
    preferences: ['supplements'],
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    _id: ''
  },
  {
    id: '5',
    name: 'Sofía Martínez',
    email: 'sofia@ejemplo.com',
    type: 'regular',
    total_spent: 4200,
    last_purchase: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    preferences: ['food', 'snacks'],
    created_at: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000).toISOString(),
    _id: ''
  },
];

export const mockSales: Sale[] = [
  {
    id: '1',
    items: [
      {
        id: '1',
        product_id: '1',
        quantity: 1,
        unit_price: 1200,
        type: 'sealed',
      },
      {
        id: '2',
        product_id: '3',
        quantity: 2,
        unit_price: 120,
        type: 'prepared',
      },
    ],
    total: 1440,
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    status: 'completed',
    client_id: '1',
    _id: ''
  },
  {
    id: '2',
    items: [
      {
        id: '3',
        product_id: '4',
        quantity: 3,
        unit_price: 90,
        type: 'prepared',
      },
    ],
    total: 270,
    created_at: new Date().toISOString(),
    status: 'pending_inventory_adjustment',
    client_id: '2',
    _id: ''
  },
];

// Mock data for clubs
export const mockClubs: Club[] = [
  {
    id: '1',
    name: 'ProteHouse Central',
    address: 'Av. Insurgentes Sur 1234, CDMX',
    phone: '+52 55 1234 5678',
    schedule: 'Lun-Vie: 7am-10pm, Sáb-Dom: 8am-8pm',
    logo_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
    is_active: true,
    created_at: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
    employee_count: 5,
    monthly_sales: 45000,
    inventory_count: 120,
    sync_inventory: true,
    sales_goal: 50000
  },
  {
    id: '2',
    name: 'ProteHouse Polanco',
    address: 'Calle Masaryk 123, Polanco, CDMX',
    phone: '+52 55 9876 5432',
    schedule: 'Lun-Dom: 6am-11pm',
    is_active: true,
    created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    employee_count: 3,
    monthly_sales: 32000,
    inventory_count: 85,
    sync_inventory: true,
    sales_goal: 40000
  },
  {
    id: '3',
    name: 'ProteHouse Condesa',
    address: 'Av. Tamaulipas 456, Condesa, CDMX',
    is_active: false,
    created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    employee_count: 0,
    monthly_sales: 0,
    inventory_count: 0
  }
];

// Mock data for employees
export const mockEmployees: Employee[] = [
  {
    id: '1',
    name: 'Juan Pérez',
    email: 'juan@protehouse.com',
    role: 'owner',
    last_access: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    permissions: ['sales', 'inventory', 'reports', 'employees', 'settings'],
    club_id: '1'
  },
  {
    id: '2',
    name: 'Ana López',
    email: 'ana.lopez@protehouse.com',
    role: 'manager',
    last_access: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    permissions: ['sales', 'inventory', 'reports'],
    club_id: '1'
  },
  {
    id: '3',
    name: 'Carlos Ramírez',
    email: 'carlos@protehouse.com',
    role: 'employee',
    last_access: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    permissions: ['sales'],
    club_id: '1'
  },
  {
    id: '4',
    name: 'María Sánchez',
    email: 'maria@protehouse.com',
    role: 'employee',
    last_access: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    permissions: ['sales', 'inventory'],
    club_id: '1'
  },
  {
    id: '5',
    name: 'Roberto Díaz',
    email: 'roberto@protehouse.com',
    role: 'manager',
    last_access: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    permissions: ['sales', 'inventory', 'reports'],
    club_id: '2'
  },
  {
    id: '6',
    name: 'Laura Gómez',
    email: 'laura@protehouse.com',
    role: 'employee',
    last_access: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    permissions: ['sales'],
    club_id: '2'
  },
  {
    id: '7',
    name: 'Pedro Martínez',
    email: 'pedro@protehouse.com',
    role: 'employee',
    last_access: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    permissions: ['sales', 'inventory'],
    club_id: '2'
  }
];

// Mock API functions
export const api = {
  // Products
  getProducts: () => Promise.resolve(mockProducts),
  
  // Inventory
  getInventory: () => Promise.resolve(mockInventory),
  getInventoryMovements: (inventoryId: string) => 
    Promise.resolve(mockInventoryMovements.filter(m => m.inventory_id === inventoryId)),
  adjustInventory: (inventoryId: string, adjustment: any) => {
    console.log('Adjusting inventory:', { inventoryId, adjustment });
    return Promise.resolve({ success: true });
  },
  
  // Sales
  getSales: () => Promise.resolve(mockSales),
  createSale: (sale: Omit<Sale, 'id' | 'created_at'>) => {
    // CONEXIÓN API: POST /api/sales → { items, total, status, client_id }
    const newSale = {
      ...sale,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    };
    console.log('Creating sale:', newSale);
    return Promise.resolve(newSale);
  },
  
  // Clients
  getClients: () => Promise.resolve(mockClients),
  getClient: (id: string) => Promise.resolve(mockClients.find(c => c.id === id)),
  createClient: (clientData: any) => {
    // CONEXIÓN API: POST /api/clients → { name, phone, email, type, preferences }
    const newClient = {
      ...clientData,
      id: crypto.randomUUID(),
      total_spent: 0,
      created_at: new Date().toISOString(),
    };
    console.log('Creating client:', newClient);
    return Promise.resolve(newClient);
  },
  updateClient: (id: string, clientData: any) => {
    // CONEXIÓN API: PATCH /api/clients/:id → { ...clientData }
    const client = mockClients.find(c => c.id === id);
    if (!client) {
      return Promise.reject(new Error('Client not found'));
    }
    const updatedClient = { ...client, ...clientData };
    console.log('Updating client:', updatedClient);
    return Promise.resolve(updatedClient);
  },
  getClientSales: (clientId: string) => {
    // CONEXIÓN API: GET /api/clients/:id/sales → Lista de ventas del cliente
    // In a real app, this would filter sales by client_id
    return Promise.resolve(mockSales.filter(sale => sale.client_id === clientId));
  },
  getProductName: (productId: string) => {
    const product = mockProducts.find(p => p.id === productId);
    return product ? product.name : 'Producto desconocido';
  },
  
  // Clubs
  getClubs: () => {
    // CONEXIÓN API: GET /api/clubs → Lista de Clubs del usuario
    return Promise.resolve(mockClubs);
  },
  getClub: (id: string) => {
    // CONEXIÓN API: GET /api/clubs/:id → Detalles del Club
    return Promise.resolve(mockClubs.find(c => c.id === id));
  },
  createClub: (clubData: any) => {
    // CONEXIÓN API: POST /api/clubs → { name, address, phone, schedule }
    const newClub = {
      ...clubData,
      id: crypto.randomUUID(),
      is_active: true,
      created_at: new Date().toISOString(),
      employee_count: 0,
      monthly_sales: 0,
      inventory_count: 0
    };
    console.log('Creating club:', newClub);
    return Promise.resolve(newClub);
  },
  updateClub: (id: string, clubData: any) => {
    // CONEXIÓN API: PATCH /api/clubs/:id → { ...clubData }
    const club = mockClubs.find(c => c.id === id);
    if (!club) {
      return Promise.reject(new Error('Club not found'));
    }
    const updatedClub = { ...club, ...clubData };
    console.log('Updating club:', updatedClub);
    return Promise.resolve(updatedClub);
  },
  deleteClub: (id: string) => {
    // CONEXIÓN API: DELETE /api/clubs/:id
    // Verificar que no tenga empleados antes de eliminar
    const club = mockClubs.find(c => c.id === id);
    if (!club) {
      return Promise.reject(new Error('Club not found'));
    }
    if (club.employee_count > 0) {
      return Promise.reject(new Error('Cannot delete club with employees'));
    }
    console.log('Deleting club:', id);
    return Promise.resolve({ success: true });
  },
  
  // Employees
  getEmployees: (clubId: string) => {
    // CONEXIÓN API: GET /api/clubs/:id/employees → Lista de empleados del Club
    return Promise.resolve(mockEmployees.filter(e => e.club_id === clubId));
  },
  createEmployee: (clubId: string, employeeData: any) => {
    // CONEXIÓN API: POST /api/clubs/:id/employees → { name, email, role }
    const newEmployee = {
      ...employeeData,
      id: crypto.randomUUID(),
      club_id: clubId,
      last_access: null
    };
    console.log('Creating employee:', newEmployee);
    return Promise.resolve(newEmployee);
  },
  updateEmployee: (id: string, employeeData: any) => {
    // CONEXIÓN API: PATCH /api/employees/:id → { permissions: ["sales", "inventory"] }
    const employee = mockEmployees.find(e => e.id === id);
    if (!employee) {
      return Promise.reject(new Error('Employee not found'));
    }
    const updatedEmployee = { ...employee, ...employeeData };
    console.log('Updating employee:', updatedEmployee);
    return Promise.resolve(updatedEmployee);
  },
  deleteEmployee: (id: string) => {
    // CONEXIÓN API: DELETE /api/employees/:id
    // Verificar que no sea el dueño antes de eliminar
    const employee = mockEmployees.find(e => e.id === id);
    if (!employee) {
      return Promise.reject(new Error('Employee not found'));
    }
    if (employee.role === 'owner') {
      return Promise.reject(new Error('Cannot delete owner'));
    }
    console.log('Deleting employee:', id);
    return Promise.resolve({ success: true });
  }
};