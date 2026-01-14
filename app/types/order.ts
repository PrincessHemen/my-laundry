export type OrderStatus = 'PAID' | 'IN_PROGRESS' | 'FAILED';

export type ClothingItemType =
  | 'shirt'
  | 'trouser'
  | 'tshirt'
  | 'dress'
  | 'suit'
  | 'jacket'
  | 'bedsheet'
  | 'towel'
  | 'curtains';

export interface ClothingItem {
  type: ClothingItemType;
  quantity: number;
  pricePerUnit: number;
}

export interface Order {
  id: string;
  userId: string;
  customerEmail: string;
  pickupAddress: string;
  dropoffAddress: string;
  pickupDate: string;
  dropoffDate: string;
  createdAt: string;
  updatedAt?: string;
  items: ClothingItem[];
  totalAmount: number;
  status: OrderStatus;
  paymentReference?: string;
}
