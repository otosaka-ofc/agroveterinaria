import { Button, Card, CardBody, Divider } from '@heroui/react';
import { router } from '@inertiajs/react';
import { ShoppingCart } from 'lucide-react';
import { CartItem } from '../types';
import { formatCurrency } from '../utils';

interface OrderSummaryProps {
    cart: CartItem[];
    total: number;
    processing: boolean;
}

export function OrderSummary({ cart, total, processing }: OrderSummaryProps) {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <>
            <Card className="rounded-3xl border-2 border-primary shadow-2xl dark:bg-[#18181b]">
                <CardBody>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-default-500">Items</span>
                            <span className="font-semibold">{totalItems}</span>
                        </div>
                        <Divider />
                        <div className="flex items-center justify-between">
                            <span className="text-lg font-bold">Total</span>
                            <span className="text-2xl font-bold text-primary">
                                {formatCurrency(total)}
                            </span>
                        </div>
                    </div>
                </CardBody>
            </Card>

            <div className="space-y-2">
                <Button
                    color="success"
                    size="lg"
                    className="w-full rounded-2xl bg-green-600 font-semibold text-white shadow-lg hover:bg-green-700"
                    type="submit"
                    isLoading={processing}
                    isDisabled={cart.length === 0}
                >
                    <ShoppingCart className="h-5 w-5" />
                    Procesar Venta
                </Button>
                <Button
                    variant="flat"
                    size="lg"
                    className="w-full rounded-2xl font-medium"
                    onPress={() => router.get('/sales')}
                >
                    Cancelar
                </Button>
            </div>
        </>
    );
}
