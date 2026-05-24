import { useState } from 'react';
import { CartItem, Product } from '../types';
import { calculateItemSubtotal, getEffectiveUnitPrice } from '../utils';

export function useCart() {
    const [cart, setCart] = useState<CartItem[]>([]);

    const addToCart = (
        product: Product,
        isFractionalSale: boolean,
        breed?: string,
    ) => {
        const cartKey = product.is_service
            ? `${product.id}:${breed ?? 'criollo'}`
            : String(product.id);

        const existingItem = cart.find((item) => item.cart_key === cartKey);

        const increment = isFractionalSale
            ? 0.5
            : product.unit === 'kg' || product.unit === 'litro'
              ? 0.5
              : 1;

        const pricePerKg = isFractionalSale ? product.price_per_kg : undefined;
        const unitPrice = isFractionalSale
            ? pricePerKg!
            : product.sale_price;

        const availableStock = product.is_service
            ? Number.POSITIVE_INFINITY
            : isFractionalSale
              ? product.stock * (product.kg_per_unit ?? 1)
              : product.stock;

        if (existingItem) {
            if (!product.is_service && existingItem.quantity + increment > existingItem.stock) {
                alert('No hay suficiente stock');
                return;
            }
            setCart((prev) =>
                prev.map((item) =>
                    item.cart_key === cartKey
                        ? { ...item, quantity: item.quantity + increment }
                        : item,
                ),
            );
        } else {
            if (!product.is_service && product.stock <= 0) {
                alert('Producto sin stock');
                return;
            }
            const newItem: CartItem = {
                cart_key: cartKey,
                product_id: product.id,
                name: product.name,
                quantity: increment,
                unit_price: unitPrice,
                stock: availableStock,
                unit: product.unit,
                isFractionalSale,
                isService: product.is_service,
                breed: breed,
                price_per_kg: pricePerKg,
                kg_per_unit: product.kg_per_unit,
            };
            setCart((prev) => [...prev, newItem]);
        }
    };

    const updateQuantity = (cartKey: string, quantity: number) => {
        const item = cart.find((i) => i.cart_key === cartKey);
        if (!item) return;

        if (quantity <= 0) {
            removeFromCart(cartKey);
            return;
        }

        if (!item.isService && quantity > item.stock) {
            alert('No hay suficiente stock');
            return;
        }

        setCart((prev) =>
            prev.map((i) =>
                i.cart_key === cartKey ? { ...i, quantity } : i,
            ),
        );
    };

    const removeFromCart = (cartKey: string) => {
        setCart((prev) => prev.filter((item) => item.cart_key !== cartKey));
    };

    const clearCart = () => {
        setCart([]);
    };

    const calculateTotal = () => {
        return cart.reduce((sum, item) => sum + calculateItemSubtotal(item), 0);
    };

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    return {
        cart,
        totalItems,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        calculateTotal,
        getEffectiveUnitPrice,
    };
}
