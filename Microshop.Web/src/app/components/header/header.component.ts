import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { BasketService } from '../../services/basket.service';
import { BasketDialogComponent } from '../basket-dialog/basket-dialog.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatBadgeModule,
    MatDialogModule
  ],
  template: `
    <mat-toolbar color="primary" class="header-toolbar">
      <div class="logo-container">
        <mat-icon class="brand-icon">shopping_bag</mat-icon>
        <span class="title">Microshop</span>
      </div>
      
      <span class="spacer"></span>

      <button mat-icon-button (click)="openBasket()" [matBadge]="itemCount()" matBadgeColor="warn" [matBadgeHidden]="itemCount() === 0">
        <mat-icon>shopping_cart</mat-icon>
      </button>
    </mat-toolbar>
  `,
  styles: [`
    .header-toolbar {
      position: sticky;
      top: 0;
      z-index: 1000;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
      display: flex;
      justify-content: space-between;
      padding: 0 24px;
    }
    .logo-container {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .brand-icon {
      font-size: 28px;
      height: 28px;
      width: 28px;
    }
    .title {
      font-weight: 600;
      font-size: 20px;
      letter-spacing: 0.5px;
    }
    .spacer {
      flex: 1 1 auto;
    }
  `]
})
export class HeaderComponent {
  private basketService = inject(BasketService);
  private dialog = inject(MatDialog);

  itemCount = computed(() => {
    return this.basketService.basket().items.reduce((acc, item) => acc + item.quantity, 0);
  });

  openBasket(): void {
    this.dialog.open(BasketDialogComponent, {
      width: '450px',
      position: { right: '0' },
      height: '100vh',
      panelClass: 'side-sheet-dialog'
    });
  }
}
