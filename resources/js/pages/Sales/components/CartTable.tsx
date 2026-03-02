import {
    Button,
    Input,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow,
} from '@heroui/react';
import { ShoppingCart, Trash2 } from 'lucide-react';
import { CartItem } from '../types';
import {
    calculateItemSubtotal,
    formatCurrency,
    getQuantityStep,
} from '../utils';

interface CartTableProps {
    cart: CartItem[];
    onUpdateQuantity: (productId: number, quantity: number) => void;
    onRemove: (productId: number) => void;
}

export function CartTable({
    cart,
    onUpdateQuantity,
    onRemove,
}: CartTableProps) {
    if (cart.length === 0) {
        return (
            <div className="text-default-400 py-12 text-center">
                <ShoppingCart className="mx-auto mb-2 h-12 w-12" />
                <p>No hay productos en el carrito</p>
                <p className="text-sm">
                    Busca y agrega productos para comenzar
                </p>
            </div>
        );
    }

    return (
        <Table
            aria-label="Carrito de compras"
            classNames={{
                wrapper: 'rounded-2xl shadow-none',
                th: 'bg-default-100 text-default-700 font-bold',
                td: 'py-4',
            }}
        >
            <TableHeader>
                <TableColumn>PRODUCTO</TableColumn>
                <TableColumn>PRECIO</TableColumn>
                <TableColumn>CANTIDAD</TableColumn>
                <TableColumn>SUBTOTAL</TableColumn>
                <TableColumn>ACCION</TableColumn>
            </TableHeader>
            <TableBody>
                {cart.map((item) => (
                    <TableRow key={item.product_id}>
                        <TableCell>
                            <div>
                                <p className="font-semibold">{item.name}</p>
                                {item.isFractionalSale && (
                                    <p className="text-success text-xs">
                                        Venta por kg
                                    </p>
                                )}
                            </div>
                        </TableCell>
                        <TableCell>
                            <div>
                                <p className="font-semibold">
                                    {formatCurrency(
                                        item.price_per_kg ?? item.unit_price,
                                    )}
                                </p>
                                <p className="text-default-500 text-xs">
                                    {item.price_per_kg
                                        ? '/kg'
                                        : `/${item.unit}`}
                                </p>
                            </div>
                        </TableCell>
                        <TableCell>
                            <div className="flex items-center gap-2">
                                <Input
                                    type="number"
                                    min={getQuantityStep(item)}
                                    step={getQuantityStep(item)}
                                    max={item.stock}
                                    value={item.quantity.toString()}
                                    onChange={(e) =>
                                        onUpdateQuantity(
                                            item.product_id,
                                            parseFloat(e.target.value),
                                        )
                                    }
                                    className="w-24"
                                    size="sm"
                                />
                                <span className="text-default-500 text-xs whitespace-nowrap">
                                    {item.isFractionalSale
                                        ? `kg (disp: ${item.stock} kg)`
                                        : item.unit}
                                </span>
                            </div>
                        </TableCell>
                        <TableCell className="font-semibold">
                            {formatCurrency(calculateItemSubtotal(item))}
                        </TableCell>
                        <TableCell>
                            <Button
                                isIconOnly
                                size="sm"
                                color="danger"
                                variant="flat"
                                onPress={() => onRemove(item.product_id)}
                            >
                                <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
