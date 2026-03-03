import { useState } from 'react';
import { CartItem, Product } from '../types';
import { calculateItemSubtotal, getEffectiveUnitPrice } from '../utils';

export function useCart() {
    const [cart, setCart] = useState<CartItem[]>([]);

    const addToCart = (product: Product, isFractionalSale: boolean) => {
        const existingItem = cart.find(
            (item) => item.product_id === product.id,
        );

        // Para venta fraccionada la cantidad se maneja en kg; para normal en unidades.
        const increment = isFractionalSale
            ? 0.5
            : product.unit === 'kg' || product.unit === 'litro'
              ? 0.5
              : 1;

        const unitPrice = isFractionalSale
            ? product.price_per_kg!
            : product.sale_price;

        // Stock disponible en la misma unidad que se usará en el carrito:
        //   fraccionada → kg disponibles; normal → unidades disponibles.
        const availableStock = isFractionalSale
            ? product.stock * (product.kg_per_unit ?? 1)
            : product.stock;

        if (existingItem) {
            if (existingItem.quantity + increment > existingItem.stock) {
                alert('No hay suficiente stock');
                return;
            }
            setCart((prev) =>
                prev.map((item) =>
                    item.product_id === product.id
                        ? { ...item, quantity: item.quantity + increment }
                        : item,
                ),
            );
        } else {
            if (product.stock <= 0) {
                alert('Producto sin stock');
                return;
            }
            const newItem: CartItem = {
                product_id: product.id,
                name: product.name,
                quantity: increment,
                unit_price: unitPrice,
                stock: availableStock,
                unit: product.unit,
                isFractionalSale,
                price_per_kg: product.price_per_kg,
                kg_per_unit: product.kg_per_unit,
            };
            setCart((prev) => [...prev, newItem]);
        }
    };

    const updateQuantity = (productId: number, quantity: number) => {
        const item = cart.find((i) => i.product_id === productId);
        if (!item) return;

        if (quantity <= 0) {
            removeFromCart(productId);
            return;
        }

        if (quantity > item.stock) {
            alert('No hay suficiente stock');
            return;
        }

        setCart((prev) =>
            prev.map((i) =>
                i.product_id === productId ? { ...i, quantity } : i,
            ),
        );
    };

    const removeFromCart = (productId: number) => {
        setCart((prev) => prev.filter((item) => item.product_id !== productId));
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
