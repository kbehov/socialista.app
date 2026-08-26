export const PRODUCT_KINDS = ["physical", "digital"] as const;
export type ProductKind = (typeof PRODUCT_KINDS)[number];

export type ProductData = {
  name?: string;
  description?: string;
  image?: string[];
  price?: string | number;
  currency?: string;
  availability?: string;
  sku?: string;
  brand?: string;
  url: string;
};

export type ExtractProductResponse = ProductData;

export type Product = {
  _id: string;
  workspaceId: string;
  projectId?: string;
  name: string;
  images: string[];
  description: string;
  url: string;
  price: number;
  kind: ProductKind;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateProductPayload = {
  workspaceId: string;
  projectId?: string;
  name: string;
  description?: string;
  url?: string;
  price: number;
  images?: string[];
  kind?: ProductKind;
};

export type UpdateProductPayload = {
  name?: string;
  description?: string;
  url?: string;
  price?: number;
  images?: string[];
  kind?: ProductKind;
};

export type GetProductsResponse = {
  products: Product[];
};
