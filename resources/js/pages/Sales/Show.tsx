import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import {
    Card,
    CardBody,
    CardHeader,
    Button,
    Chip,
    Divider,
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
} from '@heroui/react';
import { ArrowLeft, Calendar, User, CreditCard, Package } from 'lucide-react';

interface Sale {
    id: number;
    sale_number: string;
    user: { name: string };
    subtotal: number;
    tax: number;
    total: number;
    payment_method: string;
    payment_reference: string | null;
    status: string;
    notes: string | null;
    created_at: string;
    details: Array<{
        id: number;
        product: {
            name: string;
            sku: string;
            category: { name: string };
        };
        quantity: number;
        unit_price: number;
        subtotal: number;
    }>;
}

interface Props {
    sale: Sale;
}

export default function SalesShow({ sale }: Props) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN',
        }).format(amount);
    };

    const getPaymentMethodLabel = (method: string) => {
        return method === 'efectivo' ? '💵 Efectivo' : '📱 Yape';
    };

    return (
        <AppLayout>
            <Head title={`Venta ${sale.sale_number}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-6 overflow-auto">
                <div className="flex items-center justify-between">
                    <div>
                        <Button
                            variant="flat"
                            startContent={<ArrowLeft className="h-4 w-4" />}
                            onPress={() => router.get('/sales')}
                            className="mb-2"
                        >
                            Volver
                        </Button>
                        <h1 className="text-2xl font-bold">
                            Venta #{sale.sale_number}
                        </h1>
                        <p className="text-default-500">
                            Detalle de la venta
                        </p>
                    </div>
                    <Chip
                        size="lg"
                        color={
                            sale.status === 'completed' ? 'success' : 'danger'
                        }
                    >
                        {sale.status === 'completed'
                            ? 'Completada'
                            : 'Cancelada'}
                    </Chip>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Información de la Venta */}
                    <div className="space-y-4 lg:col-span-2">
                        {/* Productos */}
                        <Card>
                            <CardHeader>
                                <h3 className="flex items-center gap-2 text-lg font-semibold">
                                    <Package className="h-5 w-5" />
                                    Productos
                                </h3>
                            </CardHeader>
                            <CardBody>
                                <Table
                                    removeWrapper
                                    aria-label="Detalle de productos"
                                >
                                    <TableHeader>
                                        <TableColumn>PRODUCTO</TableColumn>
                                        <TableColumn>CANTIDAD</TableColumn>
                                        <TableColumn>P. UNIT</TableColumn>
                                        <TableColumn>SUBTOTAL</TableColumn>
                                    </TableHeader>
                                    <TableBody>
                                        {sale.details.map((detail) => (
                                            <TableRow key={detail.id}>
                                                <TableCell>
                                                    <div>
                                                        <p className="font-semibold">
                                                            {detail.product.name}
                                                        </p>
                                                        <p className="text-xs text-default-500">
                                                            SKU:{' '}
                                                            {detail.product.sku}{' '}
                                                            |{' '}
                                                            {
                                                                detail.product
                                                                    .category
                                                                    .name
                                                            }
                                                        </p>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {detail.quantity}
                                                </TableCell>
                                                <TableCell>
                                                    {formatCurrency(
                                                        detail.unit_price
                                                    )}
                                                </TableCell>
                                                <TableCell className="font-semibold">
                                                    {formatCurrency(
                                                        detail.subtotal
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>

                                <Divider className="my-4" />

                                <div className="space-y-2">
                                    <div className="flex justify-between text-lg">
                                        <span>Subtotal:</span>
                                        <span className="font-semibold">
                                            {formatCurrency(sale.subtotal)}
                                        </span>
                                    </div>
                                    {sale.tax > 0 && (
                                        <div className="flex justify-between text-sm text-default-500">
                                            <span>IGV:</span>
                                            <span>
                                                {formatCurrency(sale.tax)}
                                            </span>
                                        </div>
                                    )}
                                    <Divider />
                                    <div className="flex justify-between text-2xl">
                                        <span className="font-bold">Total:</span>
                                        <span className="font-bold text-primary">
                                            {formatCurrency(sale.total)}
                                        </span>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>

                        {/* Notas */}
                        {sale.notes && (
                            <Card>
                                <CardHeader>
                                    <h3 className="text-lg font-semibold">
                                        Notas
                                    </h3>
                                </CardHeader>
                                <CardBody>
                                    <p className="text-default-600">
                                        {sale.notes}
                                    </p>
                                </CardBody>
                            </Card>
                        )}
                    </div>

                    {/* Información Adicional */}
                    <div className="space-y-4">
                        {/* Vendedor */}
                        <Card>
                            <CardHeader>
                                <h3 className="flex items-center gap-2 text-lg font-semibold">
                                    <User className="h-5 w-5" />
                                    Vendedor
                                </h3>
                            </CardHeader>
                            <CardBody>
                                <div className="space-y-2">
                                    <p className="font-semibold">
                                        {sale.user.name}
                                    </p>
                                </div>
                            </CardBody>
                        </Card>

                        {/* Método de Pago */}
                        <Card>
                            <CardHeader>
                                <h3 className="flex items-center gap-2 text-lg font-semibold">
                                    <CreditCard className="h-5 w-5" />
                                    Pago
                                </h3>
                            </CardHeader>
                            <CardBody>
                                <div className="space-y-2">
                                    <div>
                                        <p className="text-sm text-default-500">
                                            Método
                                        </p>
                                        <p className="font-semibold">
                                            {getPaymentMethodLabel(
                                                sale.payment_method
                                            )}
                                        </p>
                                    </div>
                                    {sale.payment_reference && (
                                        <div>
                                            <p className="text-sm text-default-500">
                                                N° Operación
                                            </p>
                                            <p className="font-mono text-sm">
                                                {sale.payment_reference}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </CardBody>
                        </Card>

                        {/* Información de Venta */}
                        <Card>
                            <CardHeader>
                                <h3 className="flex items-center gap-2 text-lg font-semibold">
                                    <Calendar className="h-5 w-5" />
                                    Información
                                </h3>
                            </CardHeader>
                            <CardBody>
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-sm text-default-500">
                                            Vendedor
                                        </p>
                                        <p className="font-semibold">
                                            {sale.user.name}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-default-500">
                                            Fecha y Hora
                                        </p>
                                        <p className="font-semibold">
                                            {new Date(
                                                sale.created_at
                                            ).toLocaleDateString('es-PE', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                            })}
                                        </p>
                                        <p className="text-sm text-default-500">
                                            {new Date(
                                                sale.created_at
                                            ).toLocaleTimeString('es-PE')}
                                        </p>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
