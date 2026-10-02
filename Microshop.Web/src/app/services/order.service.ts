import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateOrderRequest, Order } from '../models/order.model';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private http = inject(HttpClient);
  private baseUrl = '/api/v1/orders';

  getAllOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(this.baseUrl);
  }

  getOrdersByBuyer(buyerId: string): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.baseUrl}/by-buyer/${buyerId}`);
  }

  getOrderById(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.baseUrl}/${id}`);
  }

  createOrder(request: CreateOrderRequest): Observable<Order> {
    return this.http.post<Order>(this.baseUrl, request);
  }

  cancelOrder(id: number): Observable<Order> {
    return this.http.put<Order>(`${this.baseUrl}/${id}/cancel`, {});
  }
}
