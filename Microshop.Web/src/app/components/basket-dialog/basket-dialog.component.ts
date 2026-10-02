import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { BasketService } from '../../services/basket.service';
import { CheckoutDialogComponent } from '../checkout-dialog/checkout-dialog.component';

@Component({
  selector: 'app-basket-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatDividerModule,
    MatSnackBarModule
  ],
  template: `
    <div class="basket-container">
      <div class="basket-header">
        <h2 mat-dialog-title>
          <mat-icon color="primary">shopping_cart</mat-icon>
          Your Shopping Cart
        </h2>
        <button mat-icon-button mat-dialog-close>
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <mat-dialog-content class="basket-content">
        <div *ngIf="items().length === 0" class="empty-basket">
          <mat-icon class="empty-icon">remove_shopping_cart</mat-icon>
          <p>Your shopping cart is currently empty.</p>
        </div>

        <mat-list *ngIf="items().length > 0">
          <mat-list-item *ngFor="let item of items()" class="basket-item-row">
            <mat-icon matListItemIcon color="accent">card_giftcard</mat-icon>
            <div matListItemTitle class="item-title">{{ item.productName }}</div>
            <div matListItemLine class="item-details">
              \${{ item.unitPrice | number:'1.2-2' }} x {{ item.quantity }} = <strong>\${{ (item.unitPrice * item.quantity) | number:'1.2-2' }}</strong>
            </div>

            <div class="item-actions">
              <button mat-icon-button (click)="decrease(item.productId, item.quantity)">
                <mat-icon>remove_circle_outline</mat-icon>
              </button>
              <span class="qty">{{ item.quantity }}</span>
              <button mat-icon-button (click)="increase(item.productId, item.quantity)">
                <mat-icon>add_circle_outline</mat-icon>
              </button>
              <button mat-icon-button color="warn" (click)="remove(item.productId)">
                <mat-icon>delete_outline</mat-icon>
              </button>
            </div>
            <mat-divider></mat-divider>
          </mat-list-item>
        </mat-list>
      </mat-dialog-content>

      <mat-divider></mat-divider>

      <div class="basket-footer">
        <div class="total-row">
          <span>Total Price:</span>
          <span class="total-amount">\${{ totalPrice() | number:'1.2-2' }}</span>
        </div>

        <div class="footer-buttons">
          <button mat-stroked-button color="warn" (click)="clear()" [disabled]="items().length === 0">
            Clear
          </button>
          <button mat-raised-button color="primary" (click)="checkout()" [disabled]="items().length === 0">
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .basket-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      padding: 16px;
    }
    .basket-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .basket-header h2 {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0;
    }
    .basket-content {
      flex: 1;
      overflow-y: auto;
      padding: 8px 0;
    }
    .empty-basket {
      text-align: center;
      padding: 48px 16px;
      color: #888;
    }
    .empty-icon {
      font-size: 64px;
      height: 64px;
      width: 64px;
      margin-bottom: 16px;
    }
    .basket-item-row {
      margin-bottom: 12px;
    }
    .item-title {
      font-weight: 500;
    }
    .item-actions {
      display: flex;
      align-items: center;
      gap: 4px;
      margin-top: 4px;
    }
    .qty {
      font-weight: 600;
      min-width: 20px;
      text-align: center;
    }
    .basket-footer {
      padding-top: 16px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      font-size: 18px;
      font-weight: 600;
    }
    .total-amount {
      color: #2e7d32;
    }
    .footer-buttons {
      display: flex;
      justify-content: space-between;
      gap: 8px;
    }
    .footer-buttons button {
      flex: 1;
    }
  `]
})
export class BasketDialogComponent {
  private basketService = inject(BasketService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  private dialogRef = inject(MatDialogRef<BasketDialogComponent>);

  items = computed(() => this.basketService.basket().items);

  totalPrice = computed(() => {
    return this.items().reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  });

  increase(productId: number, currentQty: number): void {
    this.basketService.updateQuantity(productId, currentQty + 1);
  }

  decrease(productId: number, currentQty: number): void {
    this.basketService.updateQuantity(productId, currentQty - 1);
  }

  remove(productId: number): void {
    this.basketService.updateQuantity(productId, 0);
    this.snackBar.open('Item removed from cart', 'Close', { duration: 2000 });
  }

  clear(): void {
    this.basketService.clearBasket();
    this.snackBar.open('Cart cleared', 'Close', { duration: 2000 });
  }

  checkout(): void {
    this.dialogRef.close();
    this.dialog.open(CheckoutDialogComponent, {
      width: '500px'
    });
  }
}
