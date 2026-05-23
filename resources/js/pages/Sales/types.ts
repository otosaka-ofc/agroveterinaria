export interface Product {
    id: number;
    name: string;
    sku: string;
    sale_price: number;
    stock: number;
    unit: string;
    category: {
        name: string;
    };
    price_per_kg?: number;
    kg_per_unit?: number;
    allow_fractional_sale: boolean;
    is_service: boolean;
}

export interface CartItem {
    cart_key: string;
    product_id: number;
    name: string;
    quantity: number;
    unit_price: number;
    stock: number;
    unit: string;
    isFractionalSale: boolean;
    isService: boolean;
    breed?: string;
    price_per_kg?: number;
    kg_per_unit?: number;
}
