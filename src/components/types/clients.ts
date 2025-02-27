export interface Client {
    _id: string;
    id: string;
    name: string;
    phone?: string;
    email?: string;
    type: 'occasional' | 'regular' | 'wholesale';
    total_spent: number;
    last_purchase?: string;
    preferences: string[];
    created_at: string;
  }
  
  export interface ClientFormData {
    name: string;
    phone?: string;
    email?: string;
    type: 'occasional' | 'regular' | 'wholesale';
    preferences: string[];
  }