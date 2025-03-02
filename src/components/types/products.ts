//Product.ts
export interface Product {
    _id: string;
    id: string;
    name: string;
    category: string;
    type: 'prepared' | 'sealed';
    description: string;
    purchase_price: number;
    sale_price: number;
    image_url?: string;
  }