import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CatalogService } from '../../services/catalog.service';
import { BasketService } from '../../services/basket.service';
import { AuthService } from '../../services/auth.service';
import { CatalogBrand, CatalogItem, CatalogType } from '../../models/catalog.model';
import { CatalogItemDialogComponent } from '../catalog-item-dialog/catalog-item-dialog.component';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule
  ],
  template: `
    <div class="store-container">
      <!-- HERO BANNER -->
      <div class="hero-banner">
        <div class="hero-content">
          <h1>Welcome to Microshop</h1>
          <p>Discover high-performance developer gear & cloud tools powered by .NET Aspire & Microservices.</p>
        </div>
      </div>

      <!-- FILTER & SEARCH BAR -->
      <mat-card class="filter-card">
        <mat-card-content class="filter-content">
          <mat-form-field appearance="outline" class="search-field">
            <mat-label>Search Products</mat-label>
            <input matInput [(ngModel)]="searchQuery" (input)="onSearchChange()" placeholder="e.g. Backpack, Mug..." />
            <mat-icon matSuffix>search</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline" class="filter-field">
            <mat-label>Brand</mat-label>
            <mat-select [(ngModel)]="selectedBrandId" (selectionChange)="loadItems()">
              <mat-option [value]="undefined">All Brands</mat-option>
              <mat-option *ngFor="let brand of brands" [value]="brand.id">
                {{ brand.brand }}
              </mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" class="filter-field">
            <mat-label>Category</mat-label>
            <mat-select [(ngModel)]="selectedTypeId" (selectionChange)="loadItems()">
              <mat-option [value]="undefined">All Categories</mat-option>
              <mat-option *ngFor="let type of types" [value]="type.id">
                {{ type.type }}
              </mat-option>
            </mat-select>
          </mat-form-field>

          <button mat-raised-button color="accent" (click)="openCreateDialog()" class="add-product-btn">
            <mat-icon>add_box</mat-icon>
            Add Product
          </button>
        </mat-card-content>
      </mat-card>

      <!-- LOADING SPINNER -->
      <div *ngIf="loading" class="spinner-container">
        <mat-progress-spinner mode="indeterminate" diameter="50"></mat-progress-spinner>
      </div>

      <!-- EMPTY STATE -->
      <div *ngIf="!loading && filteredItems.length === 0" class="empty-state">
        <mat-icon class="empty-icon">search_off</mat-icon>
        <h3>No products found</h3>
        <p>Try adjusting your search query or filters.</p>
      </div>

      <!-- PRODUCT GRID -->
      <div *ngIf="!loading && filteredItems.length > 0" class="product-grid">
        <mat-card *ngFor="let item of filteredItems" class="product-card">
          <div class="product-image-container">
            <mat-icon class="product-placeholder">inventory_2</mat-icon>
            <div class="admin-actions">
              <button mat-mini-fab color="basic" (click)="openEditDialog(item)" title="Edit Product">
                <mat-icon>edit</mat-icon>
              </button>
              <button mat-mini-fab color="warn" (click)="deleteItem(item)" title="Delete Product">
                <mat-icon>delete</mat-icon>
              </button>
            </div>
          </div>

          <mat-card-header>
            <mat-card-title class="item-title">{{ item.name }}</mat-card-title>
            <mat-card-subtitle class="item-subtitle">
              {{ item.catalogBrand?.brand || 'Brand' }} &bull; {{ item.catalogType?.type || 'Category' }}
            </mat-card-subtitle>
          </mat-card-header>

          <mat-card-content class="item-body">
            <p class="description">{{ item.description }}</p>
            <div class="price-row">
              <span class="price">\${{ item.price | number:'1.2-2' }}</span>
              <mat-chip [color]="item.availableStock > 0 ? 'primary' : 'warn'" selected class="stock-chip">
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
    .store-container {
      max-width: 1240px;
      margin: 0 auto;
      padding: 0 16px 40px 16px;
    }
    .hero-banner {
      background: linear-gradient(135deg, #0d47a1 0%, #1565c0 50%, #1976d2 100%);
      color: white;
      padding: 40px 32px;
      border-radius: 12px;
      margin: 24px 0;
      box-shadow: 0 6px 20px rgba(13, 71, 161, 0.25);
    }
    .hero-content h1 {
      font-size: 32px;
      font-weight: 700;
      margin: 0 0 8px 0;
    }
    .hero-content p {
      font-size: 16px;
      opacity: 0.9;
      margin: 0;
      max-width: 600px;
    }
    .filter-card {
      margin-bottom: 28px;
      border-radius: 10px;
    }
    .filter-content {
      display: flex;
      gap: 16px;
      align-items: center;
      flex-wrap: wrap;
      padding: 16px;
    }
    .search-field {
      flex: 2;
      min-width: 240px;
    }
    .filter-field {
      flex: 1;
      min-width: 180px;
    }
    .add-product-btn {
      height: 54px;
      margin-bottom: 22px;
      display: flex;
      align-items: center;
      gap: 6px;
      font-weight: 600;
    }
    .spinner-container {
      display: flex;
      justify-content: center;
      padding: 60px;
    }
    .empty-state {
      text-align: center;
      padding: 60px 0;
      color: #777;
    }
    .empty-icon {
      font-size: 56px;
      height: 56px;
      width: 56px;
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
      border-radius: 10px;
      overflow: hidden;
      transition: transform 0.25s ease, box-shadow 0.25s ease;
    }
    .product-card:hover {
      transform: translateY(-6px);
      box-shadow: 0 12px 24px rgba(0,0,0,0.15);
    }
    .product-image-container {
      height: 170px;
      background: linear-gradient(180deg, #f0f4f8 0%, #d9e2ec 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }
    .admin-actions {
      position: absolute;
      top: 8px;
      right: 8px;
      display: flex;
      gap: 6px;
    }
    .product-placeholder {
      font-size: 64px;
      height: 64px;
      width: 64px;
      color: #102a43;
    }
    .item-title {
      font-size: 17px;
      font-weight: 600;
      margin-top: 8px;
      line-height: 1.3;
    }
    .item-subtitle {
      font-size: 13px;
      color: #627d98;
    }
    .item-body {
      padding-top: 8px;
      flex: 1;
    }
    .description {
      font-size: 13px;
      color: #486581;
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
      margin-top: 14px;
    }
    .price {
      font-size: 22px;
      font-weight: 700;
      color: #1b5e20;
    }
    .stock-chip {
      font-size: 11px;
      font-weight: 500;
    }
    .card-actions {
      padding: 16px;
    }
    .add-btn {
      width: 100%;
      height: 44px;
      display: flex;
      gap: 8px;
      align-items: center;
      justify-content: center;
      font-weight: 600;
    }
  `]
})
export class CatalogComponent implements OnInit {
  private catalogService = inject(CatalogService);
  private basketService = inject(BasketService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  items: CatalogItem[] = [];
  filteredItems: CatalogItem[] = [];
  brands: CatalogBrand[] = [];
  types: CatalogType[] = [];

  searchQuery = '';
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
    this.catalogService.getItems(0, 50, this.selectedBrandId, this.selectedTypeId).subscribe({
      next: (res) => {
        this.items = res.data;
        this.applySearchFilter();
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  onSearchChange(): void {
    this.applySearchFilter();
  }

  private applySearchFilter(): void {
    if (!this.searchQuery.trim()) {
      this.filteredItems = [...this.items];
    } else {
      const q = this.searchQuery.toLowerCase();
      this.filteredItems = this.items.filter(i =>
        i.name.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q)
      );
    }
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(CatalogItemDialogComponent, {
      width: '500px',
      data: { brands: this.brands, types: this.types }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.catalogService.createItem(result).subscribe({
          next: () => {
            this.snackBar.open('Product created successfully!', 'Close', { duration: 3000 });
            this.loadItems();
          }
        });
      }
    });
  }

  openEditDialog(item: CatalogItem): void {
    const dialogRef = this.dialog.open(CatalogItemDialogComponent, {
      width: '500px',
      data: { item, brands: this.brands, types: this.types }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.catalogService.updateItem(item.id, result).subscribe({
          next: () => {
            this.snackBar.open('Product updated successfully!', 'Close', { duration: 3000 });
            this.loadItems();
          }
        });
      }
    });
  }

  deleteItem(item: CatalogItem): void {
    if (confirm(`Are you sure you want to delete "${item.name}"?`)) {
      this.catalogService.deleteItem(item.id).subscribe({
        next: () => {
          this.snackBar.open('Product deleted successfully!', 'Close', { duration: 3000 });
          this.loadItems();
        }
      });
    }
  }

  addToCart(item: CatalogItem): void {
    this.basketService.addItemToBasket(item, 1);
    this.snackBar.open(`Added "${item.name}" to cart!`, 'View Cart', {
      duration: 3000
    });
  }
}
