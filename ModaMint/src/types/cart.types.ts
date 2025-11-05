// src/types/cart.types.ts
export interface CartItemDto {
    id?: number;
    itemId?: number;
    variantId?: number;
    productId?: number;
    productName?: string;
    image?: string;
    imageUrl?: string;
    unitPrice?: number;
    price?: number;
    quantity?: number;
    totalPrice?: number;
    color?: string;
    size?: string;
}

export interface CartDto {
    id?: number;
    cartId?: number;
    customerId?: string;
    items?: CartItemDto[];
    subtotal?: number;
    shipping?: number;
    total?: number;
    totalPrice?: number;
}