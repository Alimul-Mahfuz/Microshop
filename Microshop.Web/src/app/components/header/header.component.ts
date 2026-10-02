import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { BasketService } from '../../services/basket.service';
import { AuthService } from '../../services/auth.service';
import { BasketDialogComponent } from '../basket-dialog/basket-dialog.component';
import { AuthDialogComponent } from '../auth-dialog/auth-dialog.component';
import { OrdersDialogComponent } from '../orders-dialog/orders-dialog.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatBadgeModule,
    MatMenuModule,
    MatChipsModule,
    MatDialogModule
  ],
  template: `
    <mat-toolbar class="fluent-header">
      <div class="logo-container">
        <mat-icon class="brand-icon">storefront</mat-icon>
        <span class="title">Microshop</span>
        <span class="fluent-badge">Fluent E-Commerce</span>
      </div>

      <span class="spacer"></span>

      <div class="nav-actions">
        <!-- Orders Button -->
        <button mat-button (click)="openOrders()" class="nav-btn">
          <mat-icon>receipt_long</mat-icon>
          <span class="nav-label">Orders</span>
        </button>

        <!-- User Profile / Auth Button -->
        <ng-container *ngIf="user(); else loginBtn">
          <button mat-button [matMenuTriggerFor]="userMenu" class="nav-btn profile-btn">
            <mat-icon>account_circle</mat-icon>
            <span class="nav-label">{{ user()?.firstName || 'Account' }}</span>
            <span *ngIf="isSuperAdmin()" class="role-badge superadmin">SuperAdmin</span>
            <mat-icon>arrow_drop_down</mat-icon>
          </button>
          <mat-menu #userMenu="matMenu">
            <div class="user-menu-header">
              <strong>{{ user()?.firstName }} {{ user()?.lastName }}</strong>
              <small>{{ user()?.email }}</small>
              <div *ngIf="user()?.roles?.length" class="role-pills">
                <span *ngFor="let role of user()?.roles" class="role-pill">{{ role }}</span>
              </div>
            </div>
            <button mat-menu-item (click)="openOrders()">
              <mat-icon>inventory</mat-icon>
              My Orders
            </button>
            <button mat-menu-item (click)="logout()">
              <mat-icon>logout</mat-icon>
              Sign Out
            </button>
          </mat-menu>
        </ng-container>

        <ng-template #loginBtn>
          <button mat-raised-button class="fluent-login-btn" (click)="openAuth()">
            <mat-icon>login</mat-icon>
            Sign In / Register
          </button>
        </ng-template>

        <!-- Shopping Cart Trigger -->
        <button mat-icon-button (click)="openBasket()" [matBadge]="itemCount()" matBadgeColor="warn" [matBadgeHidden]="itemCount() === 0" title="Shopping Cart">
          <mat-icon>shopping_cart</mat-icon>
        </button>
      </div>
    </mat-toolbar>
  `,
  styles: [`
    .fluent-header {
      position: sticky;
      top: 0;
      z-index: 1000;
      box-shadow: 0 2px 8px rgba(0,0,0,0.12);
      display: flex;
      justify-content: space-between;
      padding: 0 24px;
      background: linear-gradient(90deg, #0078d4 0%, #106ebe 100%);
      color: white;
      height: 60px;
    }
    .logo-container {
      display: flex;
      align-items: center;
      gap: 10px;
      cursor: pointer;
    }
    .brand-icon {
      font-size: 28px;
      height: 28px;
      width: 28px;
    }
    .title {
      font-weight: 700;
      font-size: 20px;
      letter-spacing: 0.3px;
    }
    .fluent-badge {
      font-size: 11px;
      background: rgba(255,255,255,0.22);
      padding: 3px 10px;
      border-radius: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .spacer {
      flex: 1 1 auto;
    }
    .nav-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .nav-btn {
      color: white;
      font-weight: 500;
    }
    .nav-label {
      margin-left: 4px;
    }
    .fluent-login-btn {
      background-color: #ffffff;
      color: #0078d4;
      font-weight: 600;
      border-radius: 4px;
    }
    .fluent-login-btn:hover {
      background-color: #f3f2f1;
    }
    .role-badge {
      font-size: 10px;
      padding: 2px 6px;
      border-radius: 10px;
      margin-left: 6px;
      font-weight: 700;
    }
    .role-badge.superadmin {
      background: #107c41;
      color: white;
    }
    .user-menu-header {
      padding: 12px 16px;
      display: flex;
      flex-direction: column;
      border-bottom: 1px solid #edebe9;
    }
    .user-menu-header small {
      color: #605e5c;
    }
    .role-pills {
      display: flex;
      gap: 4px;
      margin-top: 6px;
    }
    .role-pill {
      font-size: 10px;
      background: #0078d4;
      color: white;
      padding: 2px 6px;
      border-radius: 8px;
    }
  `]
})
export class HeaderComponent {
  private basketService = inject(BasketService);
  public authService = inject(AuthService);
  private dialog = inject(MatDialog);

  user = this.authService.currentUser;

  itemCount = computed(() => {
    return this.basketService.basket().items.reduce((acc, item) => acc + item.quantity, 0);
  });

  isSuperAdmin(): boolean {
    const roles = this.user()?.roles || [];
    return roles.includes('SuperAdmin');
  }

  openBasket(): void {
    this.dialog.open(BasketDialogComponent, {
      width: '450px',
      position: { right: '0' },
      height: '100vh',
      panelClass: 'side-sheet-dialog'
    });
  }

  openAuth(): void {
    this.dialog.open(AuthDialogComponent, {
      width: '440px'
    });
  }

  openOrders(): void {
    this.dialog.open(OrdersDialogComponent, {
      width: '550px'
    });
  }

  logout(): void {
    this.authService.logout();
  }
}
