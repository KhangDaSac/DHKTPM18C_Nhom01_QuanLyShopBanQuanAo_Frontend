export interface Product {
    id: number;
    name: string;
    brandId: number;
    brandName?: string;
    categoryId: number;
    categoryName?: string;
    description: string;
    active: boolean;
    createAt?: string;
    updateAt?: string;
    productVariants?: ProductVariant[];
    productImages?: ProductImage[];
}

export interface ProductVariant {
    id: number;
    productId: number;
    size?: string;
    color?: string;
    price: number;
    createAt?: string;
}

export interface ProductImage {
    id: number;
    productId: number;
    imageUrl: string;
    isPrimary?: boolean;
}

export interface ProductRequest {
    name: string;
    brandId: number;
    categoryId: number;
    description: string;
    active?: boolean;
}

export interface Category {
    id: number;
    name: string;
    parentId?: number;
    parentName?: string;
}

export interface Brand {
    id: number;
    name: string;
    logoUrl?: string;
}