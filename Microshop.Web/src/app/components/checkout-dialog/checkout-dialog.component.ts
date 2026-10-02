import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BasketService } from '../../services/basket.service';
import { OrderService } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';
import { CreateOrderRequest } from '../../models/order.model';

@Component({
  selector: 'app-checkout-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule
  ],
  template: `
    <h2 mat-dialog-title class="dialog-title">
      <mat-icon color="primary">shopping_bag</mat-icon>
      Complete Your Order
    </h2>

    <mat-dialog-content>
      <!-- Order Summary -->
      <div class="order-summary">
        <h3>Order Items ({{ basket().items.length }})</h3>
        <div *ngFor="let item of basket().items" class="summary-item">
          <span>{{ item.productName }} (x{{ item.quantity }})</span>
          <strong>\${{ (item.unitPrice * item.quantity) | number:'1.2-2' }}</strong>
        </div>
        <mat-divider></mat-divider>
        <div class="total-row">
          <span>Total Amount:</span>
          <span class="total-price">\${{ totalAmount() | number:'1.2-2' }}</span>
        </div>
      </div>

      <!-- Shipping Address Form -->
      <form [formGroup]="form" class="checkout-form">
        <h3>Shipping Information</h3>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Full Name</mat-label>
          <input matInput formControlName="buyerName" />
          <mat-error *ngIf="form.get('buyerName')?.hasError('required')">Name is required</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Shipping Address</mat-label>
          <input matInput formControlName="shippingAddress" placeholder="123 Main St, Tech City, NY 10001" />
          <mat-error *ngIf="form.get('shippingAddress')?.hasError('required')">Shipping address is required</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Payment Method (Mock)</mat-label>
          <input matInput formControlName="paymentMethod" readonly />
        </mat-form-field>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="dialogRef.close()">Cancel</button>
      <button mat-raised-button color="primary" [disabled]="form.invalid || loading" (click)="placeOrder()">
        <mat-icon>check_circle</mat-icon>
        Place Order (\${{ totalAmount() | number:'1.2-2' }})
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-title {
      display: flex;
      align-items: center;
      gap: 10px;
      font-weight: 600;
    }
    .order-summary {
      background: #f8f9fa;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 20px;
    }
    .order-summary h3 {
      margin-top: 0;
      font-size: 15px;
      color: #333;
    }
    .summary-item {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      font-size: 14px;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      font-size: 16px;
      font-weight: 700;
      margin-top: 12px;
    }
    .total-price {
      color: #2e7d32;
    }
    .checkout-form {
      display: flex;
      flex-direction: column;
      gap: 10px;
      min-width: 380px;
    }
    .checkout-form h3 {
      margin: 8px 0 4px 0;
      font-size: 15px;
    }
    .full-width {
      width: 100%;
    }
  `]
})
export class CheckoutDialogComponent {
  private fb = inject(FormBuilder);
  private basketService = inject(BasketService);
  private orderService = inject(OrderService);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  public dialogRef = inject(MatDialogRef<CheckoutDialogComponent>);

  basket = this.basketService.basket;
  user = this.authService.currentUser;

  form: FormGroup = this.fb.group({
    buyerName: [this.user() ? `${this.user()?.firstName} ${this.user()?.lastName}` : 'John Doe', Validators.required],
    shippingAddress: ['742 Evergreen Terrace, Springfield', Validators.required],
    paymentMethod: ['Credit Card / Demo Pay']
  });

  loading = false;

  totalAmount(): number {
    return this.basket().items.reduce((acc, i) => acc + (i.unitPrice * i.quantity), 0);
  }

  placeOrder(): void {
    if (this.form.invalid) return;
    this.loading = true;

    const request: CreateOrderRequest = {
      buyerId: this.user()?.email || 'guest@microshop.com',
      buyerName: this.form.value.buyerName,
      shippingAddress: this.form.value.shippingAddress,
      items: this.basket().items.map(i => ({
        productId: i.productId,
        productName: i.productName,
        unitPrice: i.unitPrice,
        units: i.quantity,
        pictureUrl: i.pictureUrl || ''
      }))
    };

    this.orderService.createOrder(request).subscribe({
      next: (order) => {
        this.loading = false;
        this.basketService.clearBasket();
        this.snackBar.open(`Order #${order.id} placed successfully!`, 'Close', { duration: 5000 });
        this.dialogRef.close(true);
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Failed to place order. Please try again.', 'Close', { duration: 3000 });
      }
    });
  }
}
