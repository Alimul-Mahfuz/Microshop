export enum OrderStatus {
  Submitted = 0,
  AwaitingValidation = 1,
  StockConfirmed = 2,
  Paid = 3,
  Shipped = 4,
  Cancelled = 5
}

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  productName: string;
  unitPrice: number;
  units: number;
  pictureUrl: string;
}

export interface Order {
  id: number;
  orderDate: string;
  buyerId: string;
  buyerName: string;
  shippingAddress: string;
  status: OrderStatus;
  totalPrice: number;
  orderItems: OrderItem[];
}

export interface CreateOrderItemDto {
  productId: number;
  productName: string;
  unitPrice: number;
  units: number;
  pictureUrl: string;
}

export interface CreateOrderRequest {
  buyerId: string;
  buyerName: string;
  shippingAddress: string;
  items: CreateOrderItemDto[];
}
