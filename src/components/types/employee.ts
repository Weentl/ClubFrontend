export interface Employee {
  phone: string;
  fullName: any;
  is_active: any;
  club: any;
  id: string;
  name: string;
  email: string;
  role: string;
  permissions: string[];
  status: 'active' | 'inactive';
  club_id: string;
  last_access: string;
  created_at: string;
}