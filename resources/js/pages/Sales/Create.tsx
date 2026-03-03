import AppLayout from '@/layouts/app-layout';
import { Card, CardBody, CardHeader } from '@heroui/react';
import { Head, router, useForm } from '@inertiajs/react';
import { ShoppingCart } from 'lucide-react';
import { useState } from 'react';

import { CartTable } from './components/CartTable';
import { OrderSummary } from './components/OrderSummary';
import { PaymentPanel } from './components/PaymentPanel';
import { ProductSearchDropdown } from './components/ProductSearchDropdown';
import { SaleNotification } from './components/SaleNotification';
import { SaleTypeModal } from './components/SaleTypeModal';
import { useCart } from './hooks/useCart';
import { Product } from './types';
import { getEffectiveUnitPrice } from './utils';

interface Props {
    products: Product[];
}

export default function SalesCreate({ products }: Props) {
    const [searchQuery, setSearchQuery] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [notification, setNotification] = useState<{
        type: 'success' | 'error';
        message: string;
    } | null>(null);
    const [productModalOpen, setProductModalOpen] = useState<Product | null>(
        null,
    );

    const {
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        calculateTotal,
    } = useCart();

    const { data, setData, processing } = useForm({
        payment_method: 'efectivo',
        payment_reference: '',
        notes: '',
    });

    const handleSelectProduct = (productId: string) => {
        const product = products.find((p) => p.id.toString() === productId);
        if (!product) return;

        setSearchQuery('');
        setShowDropdown(false);

        if (
            product.allow_fractional_sale &&
            product.price_per_kg &&
            product.kg_per_unit
        ) {
            setProductModalOpen(product);
        } else {
            addToCart(product, false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (cart.length === 0) {
            setNotification({
                type: 'error',
                message: 'Debe agregar al menos un producto.',
            });
            return;
        }

        const items = cart.map((item) => ({
            product_id: item.product_id,
            quantity: item.quantity,
            unit_price: getEffectiveUnitPrice(item),
            is_fractional_sale: item.isFractionalSale || false,
            price_per_kg: item.price_per_kg,
        }));

        let wasSuccess = false;
        let hadError = false;

        router.post(
            '/sales',
            {
                payment_method: data.payment_method,
                payment_reference: data.payment_reference,
                notes: data.notes,
                items,
            },
            {
                preserveScroll: true,
                onStart: () => {
                    setNotification(null);
                },
                onSuccess: () => {
                    clearCart();
                    setNotification({
                        type: 'success',
                        message: 'Venta registrada exitosamente.',
                    });
                    wasSuccess = true;
                },
                onError: (errs) => {
                    const firstError = Object.values(errs)[0] as
                        | string
                        | undefined;
                    setNotification({
                        type: 'error',
                        message: firstError || 'No se pudo procesar la venta.',
                    });
                    hadError = true;
                },
                onFinish: () => {
                    if (!wasSuccess && !hadError) {
                        setNotification({
                            type: 'error',
                            message:
                                'No se pudo procesar la venta. Revisa conexión o intenta de nuevo.',
                        });
                    }
                },
            },
        );
    };

    return (
        <AppLayout>
            <Head title="Nueva Venta - POS" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Encabezado */}
                <div className="flex items-center gap-2">
                    <ShoppingCart className="h-8 w-8 text-primary" />
                    <div>
                        <h1 className="text-2xl font-bold">Punto de Venta</h1>
                        <p className="text-default-500">
                            Registra una nueva venta
                        </p>
                    </div>
                </div>

                {/* Notificación */}
                {notification && (
                    <SaleNotification
                        type={notification.type}
                        message={notification.message}
                        onClose={() => setNotification(null)}
                    />
                )}

                <form onSubmit={handleSubmit}>
                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Panel izquierdo: búsqueda + carrito */}
                        <div className="lg:col-span-2">
                            <Card className="rounded-3xl border-none shadow-2xl dark:bg-[#18181b]">
                                <CardHeader className="px-6 pt-6 pb-4">
                                    <h3 className="text-lg font-semibold">
                                        Productos
                                    </h3>
                                </CardHeader>
                                <CardBody>
                                    <ProductSearchDropdown
                                        products={products}
                                        searchQuery={searchQuery}
                                        showDropdown={showDropdown}
                                        onSearchChange={(q) => {
                                            setSearchQuery(q);
                                            setShowDropdown(true);
                                        }}
                                        onFocus={() => setShowDropdown(true)}
                                        onSelectProduct={handleSelectProduct}
                                    />
                                    <CartTable
                                        cart={cart}
                                        onUpdateQuantity={updateQuantity}
                                        onRemove={removeFromCart}
                                    />
                                </CardBody>
                            </Card>
                        </div>

                        {/* Panel derecho: pago + resumen */}
                        <div className="space-y-4">
                            <PaymentPanel
                                paymentMethod={data.payment_method}
                                paymentReference={data.payment_reference}
                                notes={data.notes}
                                onPaymentMethodChange={(v) =>
                                    setData('payment_method', v)
                                }
                                onPaymentReferenceChange={(v) =>
                                    setData('payment_reference', v)
                                }
                                onNotesChange={(v) => setData('notes', v)}
                            />
                            <OrderSummary
                                cart={cart}
                                total={calculateTotal()}
                                processing={processing}
                            />
                        </div>
                    </div>
                </form>

                {/* Modal tipo de venta */}
                {productModalOpen && (
                    <SaleTypeModal
                        product={productModalOpen}
                        onSelectNormal={() => {
                            addToCart(productModalOpen, false);
                            setProductModalOpen(null);
                        }}
                        onSelectFractional={() => {
                            addToCart(productModalOpen, true);
                            setProductModalOpen(null);
                        }}
                        onClose={() => setProductModalOpen(null)}
                    />
                )}
            </div>
        </AppLayout>
    );
}
