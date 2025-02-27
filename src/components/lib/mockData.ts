//mockData.ts
import { Product } from '../types/products';
import { Sale } from '../types/sales';
import { InventoryItem, InventoryMovement } from '../types/inventory';
import { Client } from '../types/clients';

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
  },
  {
    id: '4',
    name: 'Carlos Sánchez',
    phone: '+52 333 222 1111',
    type: 'occasional',
    total_spent: 350,
    preferences: ['supplements'],
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
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
    client_id: '1', // Ana Pérez
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
    client_id: '2', // Luis Rodríguez
  },
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
  }
};