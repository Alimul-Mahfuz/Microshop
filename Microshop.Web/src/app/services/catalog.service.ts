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

  getItems(pageIndex = 0, pageSize = 10, brandId?: number, typeId?: number): Observable<PaginatedList<CatalogItem>> {
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

  getBrands(): Observable<CatalogBrand[]> {
    return this.http.get<CatalogBrand[]>(`${this.baseUrl}/brands`);
  }

  getTypes(): Observable<CatalogType[]> {
    return this.http.get<CatalogType[]>(`${this.baseUrl}/types`);
  }
}
