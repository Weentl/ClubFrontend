export interface Club {
    clubName: string;
    id: string;
    name: string;
    address: string;
    phone?: string;
    schedule?: string;
    logo_url?: string;
    is_active: boolean;
    created_at: string;
    employee_count: number;
    monthly_sales: number;
    inventory_count: number;
    sync_inventory?: boolean;
    sales_goal?: number;
  }
  
  export interface ClubFormData {
    name: string;
    address: string;
    phone?: string;
    schedule?: string;
    logo?: File;
    sync_inventory?: boolean;
    sales_goal?: number;
  }
  
  export interface Employee {
    id: string;
    name: string;
    email: string;
    role: 'owner' | 'manager' | 'employee';
    last_access?: string;
    permissions: string[];
    club_id: string;
  }
  
  export interface EmployeeFormData {
    name: string;
    email: string;
    role: 'owner' | 'manager' | 'employee';
    permissions: string[];
  }