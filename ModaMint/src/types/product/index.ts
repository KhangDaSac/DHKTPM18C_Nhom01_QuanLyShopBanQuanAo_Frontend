// src/types/product.ts
export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  stockStatus: string;
  related: Product[];
}
