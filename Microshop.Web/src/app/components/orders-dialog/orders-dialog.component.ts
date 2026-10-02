import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { OrderService } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';
import { Order, OrderStatus } from '../../models/order.model';

@Component({
  selector: 'app-orders-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule,
    MatProgressSpinnerModule
  ],
  template: `
    <h2 mat-dialog-title class="dialog-title">
      <mat-icon color="primary">receipt_long</mat-icon>
      My Order History
    </h2>

    <mat-dialog-content class="dialog-body">
      <div *ngIf="loading" class="spinner-container">
        <mat-progress-spinner mode="indeterminate" diameter="40"></mat-progress-spinner>
      </div>

      <div *ngIf="!loading && orders.length === 0" class="empty-orders">
        <mat-icon class="empty-icon">inventory_2</mat-icon>
        <p>No orders placed yet.</p>
      </div>

      <div *ngIf="!loading && orders.length > 0" class="orders-list">
        <div *ngFor="let order of orders" class="order-card">
          <div class="order-header">
            <div>
              <strong>Order #{{ order.id }}</strong>
              <span class="order-date">{{ order.orderDate | date:'mediumDate' }}</span>
            </div>
            <mat-chip [color]="getStatusColor(order.status)" selected class="status-chip">
              {{ getStatusText(order.status) }}
            </mat-chip>
          </div>

          <div class="order-buyer">
            <span>Customer: {{ order.buyerName }}</span> | 
            <span>Address: {{ order.shippingAddress }}</span>
          </div>

          <div class="order-items">
            <div *ngFor="let item of order.orderItems" class="item-row">
              <span>{{ item.productName }} x {{ item.units }}</span>
              <span>\${{ (item.unitPrice * item.units) | number:'1.2-2' }}</span>
            </div>
          </div>

          <mat-divider></mat-divider>

          <div class="order-footer">
            <div class="total-amount">
              Total: <strong>\${{ order.totalPrice | number:'1.2-2' }}</strong>
            </div>
            <button mat-stroked-button color="warn" *ngIf="order.status !== 5" (click)="cancelOrder(order)">
              Cancel Order
            </button>
          </div>
        </div>
      </div>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="dialogRef.close()">Close</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-title {
      display: flex;
      align-items: center;
      gap: 10px;
      font-weight: 600;
    }
    .dialog-body {
      min-width: 480px;
      max-height: 500px;
    }
    .spinner-container {
      display: flex;
      justify-content: center;
      padding: 36px;
    }
    .empty-orders {
      text-align: center;
      padding: 36px 0;
      color: #777;
    }
    .empty-icon {
      font-size: 48px;
      height: 48px;
      width: 48px;
    }
    .orders-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .order-card {
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 16px;
      background: #fafafa;
    }
    .order-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
    .order-date {
      color: #666;
      font-size: 12px;
      margin-left: 8px;
    }
    .order-buyer {
      font-size: 13px;
      color: #555;
      margin-bottom: 12px;
    }
    .order-items {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-bottom: 12px;
    }
    .item-row {
      display: flex;
      justify-content: space-between;
      font-size: 13px;
    }
    .order-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 12px;
    }
    .total-amount {
      font-size: 15px;
    }
  `]
})
export class OrdersDialogComponent implements OnInit {
  private orderService = inject(OrderService);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  public dialogRef = inject(MatDialogRef<OrdersDialogComponent>);

  orders: Order[] = [];
  loading = true;

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;
    const currentUser = this.authService.currentUser();
    const buyerId = currentUser?.email;

    const request$ = buyerId
      ? this.orderService.getOrdersByBuyer(buyerId)
      : this.orderService.getAllOrders();

    request$.subscribe({
      next: (res) => {
        this.orders = res;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  cancelOrder(order: Order): void {
    if (confirm(`Cancel Order #${order.id}?`)) {
      this.orderService.cancelOrder(order.id).subscribe({
        next: () => {
          this.snackBar.open(`Order #${order.id} cancelled.`, 'Close', { duration: 3000 });
          this.loadOrders();
        }
      });
    }
  }

  getStatusColor(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.Submitted: return 'primary';
      case OrderStatus.Paid: return 'accent';
      case OrderStatus.Shipped: return 'accent';
      case OrderStatus.Cancelled: return 'warn';
      default: return 'primary';
    }
  }

  getStatusText(status: OrderStatus): string {
    return OrderStatus[status] || 'Unknown';
  }
}
