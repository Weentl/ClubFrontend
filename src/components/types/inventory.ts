import { Key } from "react";

export interface InventoryItem {
    id: string;
    product_id: string;
    quantity: number;
    last_updated: string;
  }
  
  export interface InventoryMovement {
    _id: Key | null | undefined;
    id: string;
    inventory_id: string;
    type: 'use_in_prepared' | 'gift' | 'damaged' | 'restock' | 'purchase' | 'other';
    quantity: number;
    notes?: string;
    created_at: string;
    purchase_price?: number;
    sale_price?: number;
    update_catalog_price: boolean;
  }
  
  export interface InventoryAdjustmentData {
    quantity: number;
    type: InventoryMovement['type'];
    notes?: string;
    purchase_price?: number;
    sale_price?: number;
    update_catalog_price: boolean;
  }