import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { CustomerBasket, BasketItem } from '../models/basket.model';
import { CatalogItem } from '../models/catalog.model';

@Injectable({
  providedIn: 'root'
})
export class BasketService {
  private http = inject(HttpClient);
  private baseUrl = '/api/v1/basket';
  
  // Buyer ID stored in local storage for session persistence
  private buyerId = this.getOrCreateBuyerId();

  // Signals for reactive state management
  basket = signal<CustomerBasket>({ buyerId: this.buyerId, items: [] });

  constructor() {
    this.loadBasket();
  }

  private getOrCreateBuyerId(): string {
    let id = localStorage.getItem('microshop_buyer_id');
    if (!id) {
      id = 'buyer_' + Math.random().toString(36).substring(2, 9);
      localStorage.setItem('microshop_buyer_id', id);
    }
    return id;
  }

  loadBasket(): void {
    this.http.get<CustomerBasket>(`${this.baseUrl}/${this.buyerId}`).subscribe({
      next: (b) => this.basket.set(b || { buyerId: this.buyerId, items: [] }),
      error: () => this.basket.set({ buyerId: this.buyerId, items: [] })
    });
  }

  addItemToBasket(item: CatalogItem, quantity = 1): void {
    const currentBasket = this.basket();
    const existingItemIndex = currentBasket.items.findIndex(i => i.productId === item.id);
    let updatedItems = [...currentBasket.items];

    if (existingItemIndex > -1) {
      updatedItems[existingItemIndex].quantity += quantity;
    } else {
      const newItem: BasketItem = {
        id: 'item_' + Math.random().toString(36).substring(2, 9),
        productId: item.id,
        productName: item.name,
        unitPrice: item.price,
        oldUnitPrice: item.price,
        quantity: quantity,
        pictureUrl: item.pictureFileName
      };
      updatedItems.push(newItem);
    }

    const updatedBasket: CustomerBasket = { buyerId: this.buyerId, items: updatedItems };
    this.http.post<CustomerBasket>(this.baseUrl, updatedBasket).subscribe(b => {
      if (b) this.basket.set(b);
    });
  }

  updateQuantity(productId: number, quantity: number): void {
    const currentBasket = this.basket();
    let updatedItems: BasketItem[];

    if (quantity <= 0) {
      updatedItems = currentBasket.items.filter(i => i.productId !== productId);
    } else {
      updatedItems = currentBasket.items.map(i => i.productId === productId ? { ...i, quantity } : i);
    }

    const updatedBasket: CustomerBasket = { buyerId: this.buyerId, items: updatedItems };
    this.http.post<CustomerBasket>(this.baseUrl, updatedBasket).subscribe(b => {
      if (b) this.basket.set(b);
    });
  }

  clearBasket(): void {
    this.http.delete(`${this.baseUrl}/${this.buyerId}`).subscribe(() => {
      this.basket.set({ buyerId: this.buyerId, items: [] });
    });
  }
}
