export interface Expense {
  id: string;
  amount: number;
  category: string;
  date: string;
  description: string;
  supplier?: string;
  is_recurring: boolean;
  receipt_url?: string;
  created_at: string;
}

export interface ExpenseFormData {
  amount: number;
  category: string;
  date: string;
  description: string;
  supplier?: string;
  is_recurring: boolean;
  receipt_url?: string;
}