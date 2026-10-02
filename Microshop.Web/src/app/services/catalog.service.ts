import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CatalogBrand, CatalogItem, CatalogType, PaginatedList } from '../models/catalog.model';

@Injectable({
  providedIn: 'root'
})
export class CatalogService {
  private http = inject(HttpClient);
  private baseUrl = '/api/v1/catalog';

  getItems(pageIndex = 0, pageSize = 20, brandId?: number, typeId?: number): Observable<PaginatedList<CatalogItem>> {
    let params = new HttpParams()
      .set('pageIndex', pageIndex.toString())
      .set('pageSize', pageSize.toString());

    if (brandId) {
      params = params.set('brandId', brandId.toString());
    }
    if (typeId) {
      params = params.set('typeId', typeId.toString());
    }

    return this.http.get<PaginatedList<CatalogItem>>(`${this.baseUrl}/items`, { params });
  }

  getItemById(id: number): Observable<CatalogItem> {
    return this.http.get<CatalogItem>(`${this.baseUrl}/items/${id}`);
  }

  getBrands(): Observable<CatalogBrand[]> {
    return this.http.get<CatalogBrand[]>(`${this.baseUrl}/brands`);
  }

  getTypes(): Observable<CatalogType[]> {
    return this.http.get<CatalogType[]>(`${this.baseUrl}/types`);
  }

  createItem(item: Partial<CatalogItem>): Observable<CatalogItem> {
    return this.http.post<CatalogItem>(`${this.baseUrl}/items`, item);
  }

  updateItem(id: number, item: Partial<CatalogItem>): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/items/${id}`, item);
  }

  deleteItem(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/items/${id}`);
  }
}
