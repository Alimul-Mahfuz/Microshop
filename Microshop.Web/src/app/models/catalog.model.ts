export interface CatalogBrand {
  id: number;
  brand: string;
}

export interface CatalogType {
  id: number;
  type: string;
}

export interface CatalogItem {
  id: number;
  name: string;
  description: string;
  price: number;
  pictureFileName: string;
  catalogTypeId: number;
  catalogType?: CatalogType;
  catalogBrandId: number;
  catalogBrand?: CatalogBrand;
  availableStock: number;
  restockThreshold: number;
  maxStockThreshold: number;
  onReorder: boolean;
}

export interface PaginatedList<T> {
  pageIndex: number;
  pageSize: number;
  count: number;
  data: T[];
}
