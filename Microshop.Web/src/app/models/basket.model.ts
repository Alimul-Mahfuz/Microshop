export interface BasketItem {
  id: string;
  productId: number;
  productName: string;
  unitPrice: number;
  oldUnitPrice: number;
  quantity: number;
  pictureUrl?: string;
}

export interface CustomerBasket {
  buyerId: string;
  items: BasketItem[];
}
