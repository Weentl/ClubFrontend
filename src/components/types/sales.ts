// Sales.ts
export interface SaleItem {
    extras: boolean;
    id: string;
    product_id: string;
    quantity: number;
    unit_price: number;
    type: 'sealed' | 'prepared';
    custom_price?: boolean;
  }
  
  export interface Sale {
    created_by_name: any;
    created_by: any;
    _id: string;
    id: string;
    items: SaleItem[];
    total: number;
    created_at: string;
    status: 'completed' | 'pending_inventory_adjustment';
    client_id?: string; // ID del cliente asociado a la venta
  }