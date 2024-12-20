export interface Sale {
  id: string;
  date: string;
  total: number;
  commission: number;
  commissionPaid: boolean;
  products: {
    id: string;
    name: string;
    quantity: number;
    price: number;
  }[];
}

export interface Discount {
  id: string;
  date: string;
  amount: number;
  reason: string;
  status: 'active' | 'applied' | 'cancelled';
  cancellationReason?: string;
}

export interface Staff {
  id: string;
  code: string;
  name: string;
  phone: string;
  commissionRate: number;
  sales: Sale[];
  discounts: Discount[];
}