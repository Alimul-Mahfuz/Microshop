import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CatalogBrand, CatalogItem, CatalogType } from '../../models/catalog.model';

export interface CatalogItemDialogData {
  item?: CatalogItem;
  brands: CatalogBrand[];
  types: CatalogType[];
}

@Component({
  selector: 'app-catalog-item-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>{{ data.item ? 'edit' : 'add_box' }}</mat-icon>
      {{ data.item ? 'Edit Product' : 'Add New Product' }}
    </h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="item-form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Product Name</mat-label>
          <input matInput formControlName="name" placeholder="e.g. Wireless Mouse" />
          <mat-error *ngIf="form.get('name')?.hasError('required')">Name is required</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Description</mat-label>
          <textarea matInput formControlName="description" rows="3" placeholder="Product details..."></textarea>
          <mat-error *ngIf="form.get('description')?.hasError('required')">Description is required</mat-error>
        </mat-form-field>

        <div class="form-row">
          <mat-form-field appearance="outline" class="half-width">
            <mat-label>Price ($)</mat-label>
            <input matInput type="number" formControlName="price" min="0" step="0.01" />
            <mat-error *ngIf="form.get('price')?.hasError('required')">Price is required</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="half-width">
            <mat-label>Stock Quantity</mat-label>
            <input matInput type="number" formControlName="availableStock" min="0" />
            <mat-error *ngIf="form.get('availableStock')?.hasError('required')">Stock is required</mat-error>
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field appearance="outline" class="half-width">
            <mat-label>Brand</mat-label>
            <mat-select formControlName="catalogBrandId">
              <mat-option *ngFor="let brand of data.brands" [value]="brand.id">
                {{ brand.brand }}
              </mat-option>
            </mat-select>
            <mat-error *ngIf="form.get('catalogBrandId')?.hasError('required')">Brand is required</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="half-width">
            <mat-label>Category / Type</mat-label>
            <mat-select formControlName="catalogTypeId">
              <mat-option *ngFor="let type of data.types" [value]="type.id">
                {{ type.type }}
              </mat-option>
            </mat-select>
            <mat-error *ngIf="form.get('catalogTypeId')?.hasError('required')">Category is required</mat-error>
          </mat-form-field>
        </div>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-raised-button color="primary" [disabled]="form.invalid" (click)="onSave()">
        {{ data.item ? 'Update' : 'Create' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .item-form {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding-top: 12px;
      min-width: 400px;
    }
    .full-width {
      width: 100%;
    }
    .form-row {
      display: flex;
      gap: 16px;
    }
    .half-width {
      flex: 1;
    }
    h2 {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  `]
})
export class CatalogItemDialogComponent implements OnInit {
  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<CatalogItemDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: CatalogItemDialogData
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      name: [this.data.item?.name || '', Validators.required],
      description: [this.data.item?.description || '', Validators.required],
      price: [this.data.item?.price ?? 9.99, [Validators.required, Validators.min(0)]],
      availableStock: [this.data.item?.availableStock ?? 100, [Validators.required, Validators.min(0)]],
      catalogBrandId: [this.data.item?.catalogBrandId || (this.data.brands[0]?.id ?? 1), Validators.required],
      catalogTypeId: [this.data.item?.catalogTypeId || (this.data.types[0]?.id ?? 1), Validators.required],
      pictureFileName: [this.data.item?.pictureFileName || 'placeholder.png']
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }
}
