import AppLayout from '@/layouts/app-layout';
import {
    Button,
    Card,
    CardBody,
    CardHeader,
    Chip,
    Pagination,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow,
} from '@heroui/react';
import { Head, router, useForm } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowDown,
    ArrowUp,
    Edit2,
    Filter,
    Package2,
    Plus,
    Search,
    Trash2,
    X,
} from 'lucide-react';
import { useMemo, useState } from 'react';

interface ProductOption {
    id: number;
    name: string;
    sku: string;
    stock: number;
    min_stock: number;
}

interface Movement {
    id: number;
    product_id: number;
    type: 'entry' | 'exit' | 'adjustment';
    quantity: number;
    previous_stock: number;
    new_stock: number;
    reason: string | null;
    sale_id: number | null;
    created_at: string;
    product: {
        name: string;
        sku: string;
        stock: number;
        min_stock: number;
    };
    user: {
        name: string;
    } | null;
}

interface Paginated<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface Props {
    movements: Paginated<Movement>;
    products: ProductOption[];
    filters: {
        type?: string;
        product_id?: string;
        from?: string;
        to?: string;
        search?: string;
        low_stock?: boolean | string | number;
    };
    summary: {
        entries: number;
        exits: number;
        adjustments: number;
    };
}

const typeLabels: Record<string, string> = {
    entry: 'Entrada',
    exit: 'Salida',
    adjustment: 'Ajuste',
};

const typeColors: Record<string, 'success' | 'danger' | 'warning'> = {
    entry: 'success',
    exit: 'danger',
    adjustment: 'warning',
};

type ModalMode = 'create' | 'edit' | null;

const inputClass =
    'w-full px-4 py-3 rounded-xl border-2 border-default-300/40 dark:border-default-600/40 hover:border-default-400/60 dark:hover:border-default-500/60 focus:border-primary/70 dark:focus:border-primary/70 bg-transparent transition-all duration-200 outline-none text-foreground placeholder:text-default-400';

export default function InventoryIndex({
    movements,
    products,
    filters,
    summary,
}: Props) {
    const [modalMode, setModalMode] = useState<ModalMode>(null);
    const [editingMovement, setEditingMovement] = useState<Movement | null>(
        null,
    );

    const [filterState, setFilterState] = useState({
        type: filters.type || '',
        product_id: filters.product_id || '',
        from: filters.from || '',
        to: filters.to || '',
        search: filters.search || '',
        low_stock: Boolean(filters.low_stock),
    });

    const { data, setData, post, put, processing, reset, errors } = useForm({
        product_id: '',
        type: 'entry' as 'entry' | 'exit' | 'adjustment',
        quantity: 1 as number,
        reason: '',
    });

    const selectedProduct = useMemo(
        () => products.find((p) => p.id === Number(data.product_id)),
        [products, data.product_id],
    );

    const isEditing = modalMode === 'edit';
    const isOpen = modalMode !== null;

    // ── Handlers de modal ───────────────────────────────────────────────────

    const openCreate = () => {
        reset();
        setEditingMovement(null);
        setModalMode('create');
    };

    const openEdit = (movement: Movement) => {
        setData({
            product_id: movement.product_id.toString(),
            type: movement.type,
            quantity: Number(movement.quantity),
            reason: movement.reason || '',
        });
        setEditingMovement(movement);
        setModalMode('edit');
    };

    const closeModal = () => {
        setModalMode(null);
        setEditingMovement(null);
        reset();
    };

    // ── Submit ───────────────────────────────────────────────────────────────

    const submitMovement = () => {
        if (isEditing && editingMovement) {
            put(`/inventory/movements/${editingMovement.id}`, {
                onSuccess: closeModal,
            });
        } else {
            post('/inventory/movements', {
                onSuccess: () => {
                    reset();
                    closeModal();
                },
            });
        }
    };

    // ── Filtros ──────────────────────────────────────────────────────────────

    const handleFilter = () => {
        router.get('/inventory', filterState, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleResetFilters = () => {
        setFilterState({
            type: '',
            product_id: '',
            from: '',
            to: '',
            search: '',
            low_stock: false,
        });
        router.get(
            '/inventory',
            {},
            { preserveState: true, preserveScroll: true },
        );
    };

    // ── Resumen ──────────────────────────────────────────────────────────────

    const lowStock = selectedProduct
        ? selectedProduct.stock <= selectedProduct.min_stock
        : false;
    const netMovement = summary.entries - summary.exits + summary.adjustments;
    const netColorClass =
        netMovement > 0
            ? 'text-success'
            : netMovement < 0
              ? 'text-danger'
              : 'text-default-700';

    // ────────────────────────────────────────────────────────────────────────

    return (
        <AppLayout>
            <Head title="Inventario" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold">Inventario</h1>
                        <p className="text-default-500">
                            Movimientos de stock y ajustes
                        </p>
                    </div>
                    <Button
                        color="primary"
                        startContent={<Plus className="h-5 w-5" />}
                        className="rounded-2xl font-semibold"
                        size="lg"
                        onPress={openCreate}
                    >
                        Nuevo movimiento
                    </Button>
                </div>

                {/* Filtros */}
                <Card className="rounded-3xl border-none shadow-2xl dark:bg-[#18181b]">
                    <CardHeader className="flex items-center justify-between px-6 pt-6 pb-2">
                        <div className="flex items-center gap-2">
                            <Filter className="text-default-500 h-5 w-5" />
                            <h3 className="text-lg font-semibold">Filtros</h3>
                        </div>
                        <Button
                            variant="light"
                            onPress={handleResetFilters}
                            size="sm"
                            className="rounded-xl"
                        >
                            Limpiar
                        </Button>
                    </CardHeader>
                    <CardBody className="px-6 pb-6">
                        <div className="grid gap-4 md:grid-cols-4">
                            <div className="flex flex-col gap-2 md:col-span-3">
                                <label className="text-default-700 dark:text-default-200 text-sm font-semibold">
                                    Buscar
                                </label>
                                <div className="relative">
                                    <Search className="text-default-400 absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        placeholder="Nombre o SKU"
                                        value={filterState.search}
                                        onChange={(e) =>
                                            setFilterState((prev) => ({
                                                ...prev,
                                                search: e.target.value,
                                            }))
                                        }
                                        className="border-default-300/40 text-default-700 dark:text-default-200 placeholder:text-default-400 w-full rounded-xl border-2 bg-white px-10 py-3 transition-colors focus:border-primary/70 focus:outline-none dark:bg-[#18181b]"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-2 md:col-span-1">
                                <label className="text-default-700 dark:text-default-200 text-sm font-semibold">
                                    Stock
                                </label>
                                <label className="border-default-300/40 text-default-700 dark:text-default-200 flex cursor-pointer items-center gap-3 rounded-xl border-2 bg-white px-3 py-3 transition-colors hover:border-primary/50 dark:bg-[#18181b]">
                                    <input
                                        type="checkbox"
                                        checked={filterState.low_stock}
                                        onChange={(e) =>
                                            setFilterState((prev) => ({
                                                ...prev,
                                                low_stock: e.target.checked,
                                            }))
                                        }
                                        className="border-default-300 h-4 w-4 cursor-pointer rounded border-2 text-primary focus:ring-2 focus:ring-primary/20"
                                    />
                                    <span className="text-sm">
                                        Solo bajo stock
                                    </span>
                                </label>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-default-700 dark:text-default-200 text-sm font-semibold">
                                    Tipo
                                </label>
                                <select
                                    value={filterState.type}
                                    onChange={(e) =>
                                        setFilterState((prev) => ({
                                            ...prev,
                                            type: e.target.value,
                                        }))
                                    }
                                    className="border-default-300/40 text-default-700 dark:text-default-200 [&>option]:dark:text-default-200 rounded-xl border-2 bg-white px-3 py-3 transition-colors focus:border-primary/70 focus:outline-none dark:bg-[#18181b] [&>option]:dark:bg-[#18181b]"
                                >
                                    <option value="">Todos</option>
                                    <option value="entry">Entrada</option>
                                    <option value="exit">Salida</option>
                                    <option value="adjustment">Ajuste</option>
                                </select>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-default-700 dark:text-default-200 text-sm font-semibold">
                                    Producto
                                </label>
                                <select
                                    value={filterState.product_id}
                                    onChange={(e) =>
                                        setFilterState((prev) => ({
                                            ...prev,
                                            product_id: e.target.value,
                                        }))
                                    }
                                    className="border-default-300/40 text-default-700 dark:text-default-200 [&>option]:dark:text-default-200 rounded-xl border-2 bg-white px-3 py-3 transition-colors focus:border-primary/70 focus:outline-none dark:bg-[#18181b] [&>option]:dark:bg-[#18181b]"
                                >
                                    <option value="">Todos</option>
                                    {products.map((product) => (
                                        <option
                                            key={product.id}
                                            value={product.id.toString()}
                                        >
                                            {product.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-default-700 dark:text-default-200 text-sm font-semibold">
                                    Desde
                                </label>
                                <input
                                    type="date"
                                    value={filterState.from}
                                    onChange={(e) =>
                                        setFilterState((prev) => ({
                                            ...prev,
                                            from: e.target.value,
                                        }))
                                    }
                                    className="border-default-300/40 text-default-700 dark:text-default-200 rounded-xl border-2 bg-white px-3 py-3 transition-colors focus:border-primary/70 focus:outline-none dark:bg-[#18181b]"
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-default-700 dark:text-default-200 text-sm font-semibold">
                                    Hasta
                                </label>
                                <input
                                    type="date"
                                    value={filterState.to}
                                    onChange={(e) =>
                                        setFilterState((prev) => ({
                                            ...prev,
                                            to: e.target.value,
                                        }))
                                    }
                                    className="border-default-300/40 text-default-700 dark:text-default-200 rounded-xl border-2 bg-white px-3 py-3 transition-colors focus:border-primary/70 focus:outline-none dark:bg-[#18181b]"
                                />
                            </div>
                        </div>
                        <div className="mt-4 flex justify-end">
                            <Button
                                color="primary"
                                className="rounded-2xl"
                                onPress={handleFilter}
                            >
                                Aplicar filtros
                            </Button>
                        </div>
                    </CardBody>
                </Card>

                {/* Resumen */}
                <div className="grid gap-6 md:grid-cols-4">
                    <Card className="overflow-visible rounded-3xl border-none shadow-2xl dark:bg-[#18181b]">
                        <CardBody className="p-6">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-default-500 mb-2 text-sm font-medium">
                                        Entradas
                                    </p>
                                    <h2 className="text-success text-4xl font-bold">
                                        {summary.entries}
                                    </h2>
                                    <p className="text-default-400 mt-2 text-xs">
                                        Unidades ingresadas
                                    </p>
                                </div>
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-500/10">
                                    <ArrowDown className="h-7 w-7 text-green-500" />
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                    <Card className="overflow-visible rounded-3xl border-none shadow-2xl dark:bg-[#18181b]">
                        <CardBody className="p-6">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-default-500 mb-2 text-sm font-medium">
                                        Salidas
                                    </p>
                                    <h2 className="text-danger text-4xl font-bold">
                                        {summary.exits}
                                    </h2>
                                    <p className="text-default-400 mt-2 text-xs">
                                        Unidades retiradas
                                    </p>
                                </div>
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10">
                                    <ArrowUp className="h-7 w-7 text-red-500" />
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                    <Card className="overflow-visible rounded-3xl border-none shadow-2xl dark:bg-[#18181b]">
                        <CardBody className="p-6">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-default-500 mb-2 text-sm font-medium">
                                        Ajustes
                                    </p>
                                    <h2 className="text-warning text-4xl font-bold">
                                        {summary.adjustments}
                                    </h2>
                                    <p className="text-default-400 mt-2 text-xs">
                                        Unidades ajustadas
                                    </p>
                                </div>
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-500/10">
                                    <AlertTriangle className="h-7 w-7 text-yellow-500" />
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                    <Card className="overflow-visible rounded-3xl border-none shadow-2xl dark:bg-[#18181b]">
                        <CardBody className="p-6">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-default-500 mb-2 text-sm font-medium">
                                        Movimiento neto
                                    </p>
                                    <h2
                                        className={`text-4xl font-bold ${netColorClass}`}
                                    >
                                        {netMovement > 0
                                            ? `+${netMovement}`
                                            : netMovement}
                                    </h2>
                                    <p className="text-default-400 mt-2 text-xs">
                                        Entradas - salidas + ajustes
                                    </p>
                                </div>
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10">
                                    <Package2 className="h-7 w-7 text-blue-500" />
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </div>

                {/* Tabla de movimientos */}
                <Card className="rounded-3xl border-none shadow-2xl dark:bg-[#18181b]">
                    <CardHeader className="px-6 pt-6 pb-2">
                        <h3 className="text-lg font-semibold">
                            Movimientos recientes
                        </h3>
                    </CardHeader>
                    <CardBody className="px-2 pb-4">
                        <Table
                            removeWrapper
                            aria-label="Tabla de movimientos de inventario"
                            classNames={{
                                th: 'bg-default-100 text-default-700 font-semibold uppercase text-xs',
                                td: 'py-3',
                            }}
                        >
                            <TableHeader>
                                <TableColumn>Fecha</TableColumn>
                                <TableColumn>Producto</TableColumn>
                                <TableColumn>Tipo</TableColumn>
                                <TableColumn>Cantidad</TableColumn>
                                <TableColumn>Stock previo</TableColumn>
                                <TableColumn>Stock nuevo</TableColumn>
                                <TableColumn>Motivo</TableColumn>
                                <TableColumn>Usuario</TableColumn>
                                <TableColumn>Acciones</TableColumn>
                            </TableHeader>
                            <TableBody emptyContent="Sin movimientos">
                                {movements.data.map((movement) => {
                                    const isLow =
                                        movement.new_stock <=
                                        movement.product.min_stock;
                                    const isEntry = movement.type === 'entry';
                                    const isExit = movement.type === 'exit';
                                    const isSaleMovement =
                                        movement.sale_id !== null;
                                    const confirmMsg = isSaleMovement
                                        ? `¿Eliminar este movimiento de venta?\n\nSe revertirán ${movement.quantity} unidades en el stock de "${movement.product.name}".`
                                        : `¿Eliminar este movimiento?\n\nSe revertirán ${movement.quantity} unidades en el stock de "${movement.product.name}".`;

                                    return (
                                        <TableRow key={movement.id}>
                                            <TableCell>
                                                {new Date(
                                                    movement.created_at,
                                                ).toLocaleString()}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-semibold">
                                                        {movement.product.name}
                                                    </span>
                                                    <span className="text-default-500 text-xs">
                                                        SKU:{' '}
                                                        {movement.product.sku}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    color={
                                                        typeColors[
                                                            movement.type
                                                        ]
                                                    }
                                                    variant="flat"
                                                    className="capitalize"
                                                    startContent={
                                                        isEntry ? (
                                                            <ArrowDown className="h-4 w-4 text-green-600" />
                                                        ) : isExit ? (
                                                            <ArrowUp className="h-4 w-4 text-red-600" />
                                                        ) : (
                                                            <AlertTriangle className="h-4 w-4 text-yellow-600" />
                                                        )
                                                    }
                                                >
                                                    {typeLabels[movement.type]}
                                                </Chip>
                                            </TableCell>
                                            <TableCell>
                                                <span
                                                    className={
                                                        isEntry
                                                            ? 'text-success font-semibold'
                                                            : isExit
                                                              ? 'text-danger font-semibold'
                                                              : 'font-semibold'
                                                    }
                                                >
                                                    {movement.quantity}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                {movement.previous_stock}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <span
                                                        className={
                                                            isLow
                                                                ? 'text-danger font-semibold'
                                                                : 'font-semibold'
                                                        }
                                                    >
                                                        {movement.new_stock}
                                                    </span>
                                                    {isLow && (
                                                        <Chip
                                                            size="sm"
                                                            color="danger"
                                                            variant="flat"
                                                            className="rounded-xl"
                                                        >
                                                            Bajo stock
                                                        </Chip>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-default-500 text-sm">
                                                    {movement.reason || '—'}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                {movement.user?.name || '—'}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    {!isSaleMovement && (
                                                        <Button
                                                            isIconOnly
                                                            size="sm"
                                                            variant="flat"
                                                            onPress={() =>
                                                                openEdit(
                                                                    movement,
                                                                )
                                                            }
                                                            className="rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:hover:bg-blue-900/50"
                                                            aria-label="Editar movimiento"
                                                        >
                                                            <Edit2 className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                    <Button
                                                        isIconOnly
                                                        size="sm"
                                                        variant="flat"
                                                        onPress={() => {
                                                            if (
                                                                confirm(
                                                                    confirmMsg,
                                                                )
                                                            ) {
                                                                router.delete(
                                                                    `/inventory/movements/${movement.id}`,
                                                                    {
                                                                        preserveScroll: true,
                                                                    },
                                                                );
                                                            }
                                                        }}
                                                        className="rounded-lg bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-950/50 dark:text-red-400 dark:hover:bg-red-900/50"
                                                        aria-label="Eliminar movimiento"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>

                        {movements.last_page > 1 && (
                            <div className="mt-4 flex justify-center">
                                <Pagination
                                    total={movements.last_page}
                                    page={movements.current_page}
                                    onChange={(page) =>
                                        router.get(
                                            '/inventory',
                                            { ...filterState, page },
                                            {
                                                preserveState: true,
                                                preserveScroll: true,
                                            },
                                        )
                                    }
                                />
                            </div>
                        )}
                    </CardBody>
                </Card>
            </div>

            {/* ── Modal crear / editar ─────────────────────────────────────────── */}
            {isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={closeModal}
                    />

                    {/* Modal Content */}
                    <div className="border-divider relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border bg-white shadow-2xl dark:bg-[#09090b]">
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                submitMovement();
                            }}
                            className="flex flex-col"
                        >
                            {/* Header */}
                            <div className="border-divider sticky top-0 z-10 flex items-center justify-between border-b bg-white bg-gradient-to-r from-primary/10 to-secondary/10 p-6 dark:bg-[#09090b]">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-xl bg-primary p-2.5">
                                        <Package2 className="h-6 w-6 text-primary-foreground" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold">
                                            {isEditing
                                                ? 'Editar movimiento'
                                                : 'Nuevo movimiento'}
                                        </h2>
                                        <p className="text-default-500 mt-1 text-sm">
                                            {isEditing
                                                ? 'El stock del producto será recalculado automáticamente'
                                                : 'Registra entradas, salidas o ajustes de inventario'}
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    isIconOnly
                                    variant="light"
                                    onPress={closeModal}
                                    className="rounded-full"
                                    size="lg"
                                    type="button"
                                >
                                    <X className="h-6 w-6" />
                                </Button>
                            </div>

                            {/* Body */}
                            <div className="space-y-6 bg-white p-8 dark:bg-[#09090b]">
                                {/* Info del producto seleccionado (crear) o del movimiento (editar) */}
                                {isEditing && editingMovement ? (
                                    <div className="bg-default-100 dark:bg-default-50/5 border-default-200/50 dark:border-default-100/10 space-y-1 rounded-xl border p-4">
                                        <p className="text-default-500 text-xs font-medium tracking-wider uppercase">
                                            Producto
                                        </p>
                                        <p className="text-lg font-semibold">
                                            {editingMovement.product.name}
                                        </p>
                                        <p className="text-default-500 text-xs">
                                            SKU: {editingMovement.product.sku} ·
                                            Stock actual:{' '}
                                            <span className="font-semibold text-foreground">
                                                {editingMovement.product.stock}
                                            </span>
                                        </p>
                                    </div>
                                ) : (
                                    selectedProduct && (
                                        <div className="bg-default-100 dark:bg-default-50/5 border-default-200/50 dark:border-default-100/10 rounded-xl border p-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex flex-col">
                                                    <span className="text-default-500 text-xs font-medium tracking-wider uppercase">
                                                        Stock actual
                                                    </span>
                                                    <span className="mt-1 text-3xl font-bold">
                                                        {selectedProduct.stock}
                                                    </span>
                                                </div>
                                                {lowStock && (
                                                    <Chip
                                                        size="sm"
                                                        color="danger"
                                                        variant="flat"
                                                        startContent={
                                                            <AlertTriangle className="h-3 w-3" />
                                                        }
                                                        className="font-semibold"
                                                    >
                                                        Bajo stock
                                                    </Chip>
                                                )}
                                            </div>
                                        </div>
                                    )
                                )}

                                <div className="grid gap-6 md:grid-cols-2">
                                    {/* Selector de producto — solo al crear */}
                                    {!isEditing && (
                                        <div className="space-y-2 md:col-span-2">
                                            <label className="text-default-700 dark:text-default-300 block text-sm font-semibold">
                                                Producto{' '}
                                                <span className="text-danger">
                                                    *
                                                </span>
                                            </label>
                                            <select
                                                value={data.product_id}
                                                onChange={(e) =>
                                                    setData(
                                                        'product_id',
                                                        e.target.value,
                                                    )
                                                }
                                                required
                                                className={
                                                    inputClass +
                                                    ' bg-white dark:bg-[#09090b] [&>option]:bg-white [&>option]:text-foreground [&>option]:dark:bg-[#09090b]'
                                                }
                                            >
                                                <option value="">
                                                    Selecciona un producto
                                                </option>
                                                {products.map((product) => (
                                                    <option
                                                        key={product.id}
                                                        value={product.id}
                                                    >
                                                        {product.name} — SKU:{' '}
                                                        {product.sku}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.product_id && (
                                                <p className="text-danger text-xs">
                                                    {errors.product_id}
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {/* Tipo de movimiento */}
                                    <div className="space-y-2">
                                        <label className="text-default-700 dark:text-default-300 block text-sm font-semibold">
                                            Tipo de movimiento{' '}
                                            <span className="text-danger">
                                                *
                                            </span>
                                        </label>
                                        <select
                                            value={data.type}
                                            onChange={(e) =>
                                                setData(
                                                    'type',
                                                    e.target.value as
                                                        | 'entry'
                                                        | 'exit'
                                                        | 'adjustment',
                                                )
                                            }
                                            required
                                            className={
                                                inputClass +
                                                ' bg-white dark:bg-[#09090b] [&>option]:bg-white [&>option]:text-foreground [&>option]:dark:bg-[#09090b]'
                                            }
                                        >
                                            <option value="entry">
                                                Entrada
                                            </option>
                                            <option value="exit">Salida</option>
                                            <option value="adjustment">
                                                Ajuste (delta)
                                            </option>
                                        </select>
                                        {errors.type && (
                                            <p className="text-danger text-xs">
                                                {errors.type}
                                            </p>
                                        )}
                                    </div>

                                    {/* Cantidad */}
                                    <div className="space-y-2">
                                        <label className="text-default-700 dark:text-default-300 block text-sm font-semibold">
                                            Cantidad{' '}
                                            <span className="text-danger">
                                                *
                                            </span>
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            placeholder="Ingresa la cantidad"
                                            value={data.quantity}
                                            onChange={(e) =>
                                                setData(
                                                    'quantity',
                                                    Number(e.target.value),
                                                )
                                            }
                                            required
                                            className={inputClass}
                                        />
                                        {errors.quantity && (
                                            <p className="text-danger text-xs">
                                                {errors.quantity}
                                            </p>
                                        )}
                                        <p className="text-default-400 text-xs">
                                            {data.type === 'entry' &&
                                                'Unidades que se agregarán al stock'}
                                            {data.type === 'exit' &&
                                                'Unidades que se restarán del stock'}
                                            {data.type === 'adjustment' &&
                                                'Valor positivo o negativo para ajustar el stock'}
                                        </p>
                                    </div>
                                </div>

                                {/* Motivo */}
                                <div className="space-y-2">
                                    <label className="text-default-700 dark:text-default-300 block text-sm font-semibold">
                                        Motivo (opcional)
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Ej: Compra a proveedor, corrección de inventario..."
                                        value={data.reason}
                                        onChange={(e) =>
                                            setData('reason', e.target.value)
                                        }
                                        className={inputClass}
                                    />
                                    {errors.reason && (
                                        <p className="text-danger text-xs">
                                            {errors.reason}
                                        </p>
                                    )}
                                </div>

                                {/* Aviso edición */}
                                {isEditing && (
                                    <div className="border-warning-200 bg-warning-50 dark:bg-warning-50/10 text-warning-700 dark:text-warning-400 flex items-start gap-2 rounded-xl border px-4 py-3">
                                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                                        <p className="text-xs">
                                            Al guardar, el stock del producto se
                                            recalculará automáticamente
                                            deshaciendo el efecto anterior y
                                            aplicando el nuevo.
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="border-divider bg-default-50 sticky bottom-0 flex items-center justify-end gap-3 border-t p-6 dark:bg-[#18181b]">
                                <Button
                                    variant="flat"
                                    onPress={closeModal}
                                    isDisabled={processing}
                                    size="lg"
                                    type="button"
                                    className="rounded-xl font-medium"
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    color="primary"
                                    type="submit"
                                    isLoading={processing}
                                    size="lg"
                                    className="rounded-xl px-8 font-semibold"
                                >
                                    {isEditing
                                        ? 'Actualizar movimiento'
                                        : 'Guardar movimiento'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
