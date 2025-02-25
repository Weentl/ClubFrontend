export interface SaleItem {
    id: string;
    product_id: string;
    quantity: number;
    unit_price: number;
    type: 'sealed' | 'prepared';
    custom_price?: boolean;
  }
  
  export interface Sale {
    id: string;
    items: SaleItem[];
    total: number;
    created_at: string;
    status: 'completed' | 'pending_inventory_adjustment';
  }