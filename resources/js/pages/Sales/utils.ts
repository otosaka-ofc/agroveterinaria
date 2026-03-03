import { CartItem } from './types';

export const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-PE', {
        style: 'currency',
        currency: 'PEN',
    }).format(amount);
};

export const getEffectiveUnitPrice = (item: CartItem) => {
    return item.price_per_kg ?? item.unit_price;
};

export const calculateItemSubtotal = (item: CartItem) => {
    return item.quantity * getEffectiveUnitPrice(item);
};

export const getQuantityStep = (item: CartItem) => {
    if (item.isFractionalSale) return 0.5;
    return item.unit === 'kg' || item.unit === 'litro' ? 0.5 : 1;
};
