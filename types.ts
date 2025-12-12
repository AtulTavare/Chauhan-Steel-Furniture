export interface Product {
  id: string;
  name: string;
  category: string;
  image: string;
  basePurchasePrice?: number;
  baseSellingPrice?: number;
}

export interface Variation {
  id: string;
  productId: string;
  name: string; // e.g., "32mm", "Large"
  sku?: string;
  purchasePrice: number;
  sellingPrice: number;
  stock: number;
  image?: string;
  color?: string; // Hex code or name
}

export interface CartItem {
  productId: string;
  variationId: string;
  productName: string;
  variationName: string;
  quantity: number;
  rate: number;
  total: number;
}

export interface Bill {
  id: string;
  customerName: string;
  contactNo?: string; // Added Contact Number
  date: string; // ISO String
  items: CartItem[];
  totalAmount: number;
  discount: number;
  finalAmount: number;
  amountReceived: number;
  amountPending: number;
  paymentMode: 'Cash' | 'Online' | 'Cheque' | 'Credit';
  type: 'SALE';
}

export interface Purchase {
  id: string;
  supplierName: string;
  date: string;
  items: CartItem[];
  totalAmount: number;
  amountPaid: number;
  amountPending: number;
  paymentMode: 'Cash' | 'Online' | 'Cheque' | 'Credit';
  type: 'PURCHASE';
}

export type Transaction = Bill | Purchase;

export type ViewState = 
  | 'INVENTORY' 
  | 'PRODUCT_DETAIL' 
  | 'NEW_BILL' 
  | 'STORE_PURCHASE' 
  | 'REPORTS' 
  | 'HISTORY'
  | 'CUSTOMERS' 
  | 'SUPPLIERS'
  | 'BILL_RECEIPT';