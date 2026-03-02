import { Button, Card, CardBody, CardHeader, Divider } from '@heroui/react';
import { Product } from '../types';
import { formatCurrency } from '../utils';

interface SaleTypeModalProps {
    product: Product;
    onSelectNormal: () => void;
    onSelectFractional: () => void;
    onClose: () => void;
}

export function SaleTypeModal({
    product,
    onSelectNormal,
    onSelectFractional,
    onClose,
}: SaleTypeModalProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center rounded-lg bg-black/50">
            <Card className="mx-4 w-full max-w-md border-none shadow-2xl dark:bg-[#18181b]">
                <CardHeader className="px-6 pt-6 pb-4">
                    <div>
                        <h3 className="text-default-700 dark:text-default-200 text-lg font-bold">
                            {product.name}
                        </h3>
                        <p className="text-default-500 mt-1 text-sm">
                            Selecciona cómo deseas vender este producto
                        </p>
                    </div>
                </CardHeader>
                <CardBody className="gap-4">
                    {/* Opción: Venta Normal */}
                    <button
                        onClick={onSelectNormal}
                        className="border-default-300/40 hover:bg-default-100 dark:hover:bg-default-100/10 rounded-xl border-2 p-4 text-left transition-colors"
                    >
                        <div className="flex items-start gap-3">
                            <div className="flex-1">
                                <p className="text-default-700 dark:text-default-200 font-semibold">
                                    Venta Normal
                                </p>
                                <p className="text-default-500 mt-1 text-xs">
                                    Vende el producto completo por{' '}
                                    {product.unit} a{' '}
                                    {formatCurrency(product.sale_price)} c/u
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-primary">
                                    {formatCurrency(product.sale_price)}
                                </p>
                            </div>
                        </div>
                    </button>

                    {/* Opción: Venta Fraccionada */}
                    {product.allow_fractional_sale &&
                        product.price_per_kg &&
                        product.kg_per_unit && (
                            <>
                                <Divider className="my-2" />
                                <button
                                    onClick={onSelectFractional}
                                    className="border-success-300 bg-success-50 dark:bg-success-50/10 hover:bg-success-100 dark:hover:bg-success-100/20 rounded-xl border-2 p-4 text-left transition-colors"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="flex-1">
                                            <p className="text-success-700 dark:text-success-300 font-semibold">
                                                Venta Fraccionada
                                            </p>
                                            <p className="text-success-600 dark:text-success-400 mt-1 text-xs">
                                                Ingresa la cantidad en kg que
                                                deseas vender a{' '}
                                                {formatCurrency(
                                                    product.price_per_kg,
                                                )}
                                                /kg
                                                <br />
                                                (Disponible:{' '}
                                                {(
                                                    product.stock *
                                                    product.kg_per_unit
                                                ).toFixed(1)}{' '}
                                                kg)
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-success font-bold">
                                                {formatCurrency(
                                                    product.price_per_kg,
                                                )}
                                                /kg
                                            </p>
                                        </div>
                                    </div>
                                </button>
                            </>
                        )}

                    {/* Botón de cierre */}
                    <Button
                        variant="flat"
                        className="mt-2 w-full"
                        onPress={onClose}
                    >
                        Cancelar
                    </Button>
                </CardBody>
            </Card>
        </div>
    );
}
