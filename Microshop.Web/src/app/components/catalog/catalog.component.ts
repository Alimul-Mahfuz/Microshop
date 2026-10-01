import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CatalogService } from '../../services/catalog.service';
import { BasketService } from '../../services/basket.service';
import { CatalogBrand, CatalogItem, CatalogType } from '../../models/catalog.model';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatSelectModule,
    MatFormFieldModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  template: `
    <div class="catalog-container">
      <!-- Filter Bar -->
      <mat-card class="filter-card">
        <mat-card-content class="filter-content">
          <mat-form-field appearance="outline" class="filter-field">
            <mat-label>Brand</mat-label>
            <mat-select (selectionChange)="onBrandChange($event.value)">
              <mat-option [value]="null">All Brands</mat-option>
              <mat-option *ngFor="let brand of brands" [value]="brand.id">
                {{ brand.brand }}
              </mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" class="filter-field">
            <mat-label>Category</mat-label>
            <mat-select (selectionChange)="onTypeChange($event.value)">
              <mat-option [value]="null">All Categories</mat-option>
              <mat-option *ngFor="let type of types" [value]="type.id">
                {{ type.type }}
              </mat-option>
            </mat-select>
          </mat-form-field>
        </mat-card-content>
      </mat-card>

      <!-- Loading State -->
      <div *ngIf="loading" class="spinner-container">
        <mat-progress-spinner mode="indeterminate" diameter="50"></mat-progress-spinner>
      </div>

      <!-- Product Grid -->
      <div *ngIf="!loading" class="product-grid">
        <mat-card *ngFor="let item of items" class="product-card">
          <div class="product-image-container">
            <mat-icon class="product-placeholder">storefront</mat-icon>
          </div>
          <mat-card-header>
            <mat-card-title class="item-title">{{ item.name }}</mat-card-title>
            <mat-card-subtitle class="item-subtitle">
              {{ item.catalogBrand?.brand }} | {{ item.catalogType?.type }}
            </mat-card-subtitle>
          </mat-card-header>

          <mat-card-content class="item-body">
            <p class="description">{{ item.description }}</p>
            <div class="price-row">
              <span class="price">\${{ item.price | number:'1.2-2' }}</span>
              <mat-chip [color]="item.availableStock > 0 ? 'accent' : 'warn'" selected class="stock-chip">
                {{ item.availableStock > 0 ? 'In Stock (' + item.availableStock + ')' : 'Out of Stock' }}
              </mat-chip>
            </div>
          </mat-card-content>

          <mat-card-actions class="card-actions">
            <button mat-raised-button color="primary" (click)="addToCart(item)" [disabled]="item.availableStock <= 0" class="add-btn">
              <mat-icon>add_shopping_cart</mat-icon>
              Add to Cart
            </button>
          </mat-card-actions>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .catalog-container {
      max-width: 1200px;
      margin: 24px auto;
      padding: 0 16px;
    }
    .filter-card {
      margin-bottom: 24px;
    }
    .filter-content {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
      padding: 16px;
    }
    .filter-field {
      flex: 1;
      min-width: 200px;
    }
    .spinner-container {
      display: flex;
      justify-content: center;
      padding: 48px;
    }
    .product-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 24px;
    }
    .product-card {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      height: 100%;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .product-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 16px rgba(0,0,0,0.12);
    }
    .product-image-container {
      height: 160px;
      background: #e3f2fd;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px 4px 0 0;
    }
    .product-placeholder {
      font-size: 64px;
      height: 64px;
      width: 64px;
      color: #1976d2;
    }
    .item-title {
      font-size: 16px;
      font-weight: 600;
      margin-top: 8px;
    }
    .item-subtitle {
      font-size: 13px;
      color: #666;
    }
    .item-body {
      padding-top: 8px;
      flex: 1;
    }
    .description {
      font-size: 13px;
      color: #555;
      min-height: 38px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .price-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 12px;
    }
    .price {
      font-size: 20px;
      font-weight: 700;
      color: #2e7d32;
    }
    .stock-chip {
      font-size: 11px;
    }
    .card-actions {
      padding: 16px;
    }
    .add-btn {
      width: 100%;
      display: flex;
      gap: 8px;
      align-items: center;
      justify-content: center;
    }
  `]
})
export class CatalogComponent implements OnInit {
  private catalogService = inject(CatalogService);
  private basketService = inject(BasketService);
  private snackBar = inject(MatSnackBar);

  items: CatalogItem[] = [];
  brands: CatalogBrand[] = [];
  types: CatalogType[] = [];

  selectedBrandId?: number;
  selectedTypeId?: number;
  loading = true;

  ngOnInit(): void {
    this.loadFilterData();
    this.loadItems();
  }

  loadFilterData(): void {
    this.catalogService.getBrands().subscribe(b => this.brands = b);
    this.catalogService.getTypes().subscribe(t => this.types = t);
  }

  loadItems(): void {
    this.loading = true;
    this.catalogService.getItems(0, 20, this.selectedBrandId, this.selectedTypeId).subscribe({
      next: (res) => {
        this.items = res.data;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  onBrandChange(brandId: number | null): void {
    this.selectedBrandId = brandId ?? undefined;
    this.loadItems();
  }

  onTypeChange(typeId: number | null): void {
    this.selectedTypeId = typeId ?? undefined;
    this.loadItems();
  }

  addToCart(item: CatalogItem): void {
    this.basketService.addItemToBasket(item, 1);
    this.snackBar.open(`Added "${item.name}" to cart!`, 'View Cart', {
      duration: 3000
    });
  }
}
