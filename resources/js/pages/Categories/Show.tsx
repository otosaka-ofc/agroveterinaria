import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
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
    ArrowLeft,
    Calendar,
    CheckCircle,
    DollarSign,
    Edit2,
    Package,
    Plus,
    ShoppingCart,
    Trash2,
    X,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';

interface Category {
    id: number;
    name: string;
    description: string | null;
    is_active: boolean;
    products_count: number;
    created_at: string;
}

interface Product {
    id: number;
    sku: string;
    name: string;
    description: string | null;
    category: { name: string };
    purchase_price: number;
    sale_price: number;
    price_per_kg: number | null;
    stock: number;
    min_stock: number;
    unit: string;
    kg_per_unit: number | null;
    allow_fractional_sale: boolean;
    expiration_date: string | null;
    image: string | null;
    is_active: boolean;
}

interface Props {
    category: Category;
    products: {
        data: Product[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

export default function CategoryShow({ category, products }: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        sku: '',
        name: '',
        description: '',
        category_id: category.id.toString(),
        purchase_price: '',
        sale_price: '',
        price_per_kg: '',
        stock: '0',
        min_stock: '0',
        unit: 'unidad',
        kg_per_unit: '',
        allow_fractional_sale: false,
        expiration_date: '',
        is_active: true,
        stay_on_category: true,
    });

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Categorías',
            href: '/categories',
        },
        {
            title: category.name,
            href: `/categories/${category.id}`,
        },
    ];

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN',
        }).format(amount);
    };

    const openModal = (product?: Product) => {
        if (product) {
            console.log('Product data:', product); // Debug
            setEditingProduct(product);
            setData({
                sku: product.sku,
                name: product.name,
                description: product.description || '',
                category_id: category.id.toString(),
                purchase_price: product.purchase_price.toString(),
                sale_price: product.sale_price.toString(),
                price_per_kg: product.price_per_kg?.toString() || '',
                stock: product.stock.toString(),
                min_stock: product.min_stock.toString(),
                unit: product.unit,
                kg_per_unit: product.kg_per_unit?.toString() || '',
                allow_fractional_sale: product.allow_fractional_sale,
                expiration_date: product.expiration_date || '',
                is_active: product.is_active,
                stay_on_category: true,
            });
        } else {
            setEditingProduct(null);
            reset();
            setData('category_id', category.id.toString());
            setData('stay_on_category', true);
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingProduct(null);
        reset();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const onSuccess = () => {
            closeModal();
        };

        if (editingProduct) {
            put(`/products/${editingProduct.id}`, {
                preserveState: true,
                preserveScroll: true,
                onSuccess,
            });
        } else {
            post('/products', {
                preserveState: true,
                preserveScroll: true,
                onSuccess,
            });
        }
    };

    const handleDelete = (productId: number) => {
        if (confirm('¿Estás seguro de eliminar este producto?')) {
            router.delete(`/products/${productId}`, {
                preserveScroll: true,
            });
        }
    };

    const handlePageChange = (page: number) => {
        router.get(
            `/categories/${category.id}`,
            { page },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    // Calcular estadísticas
    const totalProducts = products.total;
    const activeProducts = products.data.filter((p) => p.is_active).length;
    const lowStockProducts = products.data.filter(
        (p) => p.stock <= p.min_stock,
    ).length;
    const totalInventoryValue = products.data.reduce(
        (sum, p) => sum + p.stock * p.purchase_price,
        0,
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${category.name} - Categorías`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <div className="mb-2 flex items-center gap-3">
                            <Button
                                isIconOnly
                                variant="flat"
                                onPress={() => router.visit('/categories')}
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                            <h1 className="text-2xl font-bold">
                                {category.name}
                            </h1>
                            <Chip
                                color={
                                    category.is_active ? 'success' : 'danger'
                                }
                                variant="flat"
                            >
                                {category.is_active ? 'Activa' : 'Inactiva'}
                            </Chip>
                        </div>
                        {category.description && (
                            <p className="text-default-500 ml-14">
                                {category.description}
                            </p>
                        )}
                    </div>
                </div>

                {/* Estadísticas */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {/* Total Productos */}
                    <Card className="rounded-3xl border-none bg-gradient-to-br from-blue-500 to-blue-600 shadow-2xl">
                        <CardBody className="p-6">
                            <div className="flex items-start justify-between">
                                <div className="text-white">
                                    <p className="mb-2 text-sm font-medium opacity-90">
                                        Total Productos
                                    </p>
                                    <h2 className="text-4xl font-bold">
                                        {totalProducts}
                                    </h2>
                                    <p className="mt-3 text-sm font-medium">
                                        productos registrados
                                    </p>
                                </div>
                                <div className="rounded-2xl bg-white/20 p-4">
                                    <Package className="h-10 w-10 text-white" />
                                </div>
                            </div>
                        </CardBody>
                    </Card>

                    {/* Productos Activos */}
                    <Card className="rounded-3xl border-none bg-gradient-to-br from-green-500 to-green-600 shadow-2xl">
                        <CardBody className="p-6">
                            <div className="flex items-start justify-between">
                                <div className="text-white">
                                    <p className="mb-2 text-sm font-medium opacity-90">
                                        Productos Activos
                                    </p>
                                    <h2 className="text-4xl font-bold">
                                        {activeProducts}
                                    </h2>
                                    <p className="mt-3 text-sm font-medium">
                                        disponibles para venta
                                    </p>
                                </div>
                                <div className="rounded-2xl bg-white/20 p-4">
                                    <ShoppingCart className="h-10 w-10 text-white" />
                                </div>
                            </div>
                        </CardBody>
                    </Card>

                    {/* Stock Bajo */}
                    <Card className="rounded-3xl border-none bg-gradient-to-br from-orange-500 to-orange-600 shadow-2xl">
                        <CardBody className="p-6">
                            <div className="flex items-start justify-between">
                                <div className="text-white">
                                    <p className="mb-2 text-sm font-medium opacity-90">
                                        Stock Bajo
                                    </p>
                                    <h2 className="text-4xl font-bold">
                                        {lowStockProducts}
                                    </h2>
                                    <p className="mt-3 text-sm font-medium">
                                        productos con alerta
                                    </p>
                                </div>
                                <div className="rounded-2xl bg-white/20 p-4">
                                    <AlertTriangle className="h-10 w-10 text-white" />
                                </div>
                            </div>
                        </CardBody>
                    </Card>

                    {/* Valor del Inventario */}
                    <Card className="rounded-3xl border-none bg-gradient-to-br from-purple-500 to-purple-600 shadow-2xl">
                        <CardBody className="p-6">
                            <div className="flex items-start justify-between">
                                <div className="text-white">
                                    <p className="mb-2 text-sm font-medium opacity-90">
                                        Valor Inventario
                                    </p>
                                    <h2 className="text-2xl font-bold">
                                        {formatCurrency(totalInventoryValue)}
                                    </h2>
                                    <p className="mt-3 text-sm font-medium">
                                        inversión total
                                    </p>
                                </div>
                                <div className="rounded-2xl bg-white/20 p-4">
                                    <DollarSign className="h-10 w-10 text-white" />
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </div>

                {/* Tabla de Productos */}
                <Card className="rounded-3xl border-none shadow-2xl dark:bg-[#18181b]">
                    <CardHeader className="px-6 pt-6 pb-4">
                        <div className="flex w-full items-center justify-between">
                            <h2 className="text-xl font-bold">
                                Productos de la Categoría
                            </h2>
                            <Button
                                color="primary"
                                startContent={<Plus className="h-5 w-5" />}
                                onPress={() => openModal()}
                                size="lg"
                                className="rounded-2xl font-semibold shadow-lg"
                            >
                                Nuevo Producto
                            </Button>
                        </div>
                    </CardHeader>
                    <CardBody className="px-6 pb-6">
                        <Table
                            aria-label="Tabla de productos de la categoría"
                            classNames={{
                                wrapper: 'rounded-2xl shadow-none',
                                th: 'bg-default-100 text-default-700 font-bold',
                                td: 'py-4',
                            }}
                        >
                            <TableHeader>
                                <TableColumn>SKU</TableColumn>
                                <TableColumn>PRODUCTO</TableColumn>
                                <TableColumn>PRECIO COMPRA</TableColumn>
                                <TableColumn>PRECIO VENTA</TableColumn>
                                <TableColumn>STOCK</TableColumn>
                                <TableColumn>MARGEN</TableColumn>
                                <TableColumn>ESTADO</TableColumn>
                                <TableColumn>ACCIONES</TableColumn>
                            </TableHeader>
                            <TableBody
                                emptyContent={
                                    <div className="text-default-400 py-12 text-center">
                                        <p className="text-sm">
                                            No hay productos en esta categoría
                                        </p>
                                    </div>
                                }
                            >
                                {products.data.map((product) => {
                                    const margin =
                                        ((product.sale_price -
                                            product.purchase_price) /
                                            product.purchase_price) *
                                        100;
                                    const isLowStock =
                                        product.stock <= product.min_stock;

                                    return (
                                        <TableRow key={product.id}>
                                            <TableCell>
                                                <span className="font-mono text-sm">
                                                    {product.sku}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <p className="font-semibold">
                                                        {product.name}
                                                    </p>
                                                    {product.expiration_date && (
                                                        <p className="text-default-500 flex items-center gap-1 text-xs">
                                                            <Calendar className="h-3 w-3" />
                                                            Vence:{' '}
                                                            {new Date(
                                                                product.expiration_date,
                                                            ).toLocaleDateString(
                                                                'es-PE',
                                                            )}
                                                        </p>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {formatCurrency(
                                                    product.purchase_price,
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <span className="font-semibold text-primary">
                                                    {formatCurrency(
                                                        product.sale_price,
                                                    )}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <p
                                                        className={
                                                            isLowStock
                                                                ? 'text-danger font-bold'
                                                                : ''
                                                        }
                                                    >
                                                        {product.stock}{' '}
                                                        {product.unit}
                                                    </p>
                                                    {isLowStock && (
                                                        <p className="text-danger text-xs">
                                                            ⚠️ Stock mínimo:{' '}
                                                            {product.min_stock}
                                                        </p>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    color={
                                                        margin >= 30
                                                            ? 'success'
                                                            : margin >= 15
                                                              ? 'warning'
                                                              : 'danger'
                                                    }
                                                    variant="flat"
                                                    size="sm"
                                                >
                                                    {margin.toFixed(1)}%
                                                </Chip>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    color={
                                                        product.is_active
                                                            ? 'success'
                                                            : 'danger'
                                                    }
                                                    variant="flat"
                                                    size="sm"
                                                    className={`rounded-lg ${product.is_active ? 'text-green-600' : 'text-red-600'}`}
                                                    startContent={
                                                        product.is_active ? (
                                                            <CheckCircle className="h-4 w-4" />
                                                        ) : (
                                                            <XCircle className="h-4 w-4" />
                                                        )
                                                    }
                                                >
                                                    {product.is_active
                                                        ? 'Activo'
                                                        : 'Inactivo'}
                                                </Chip>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        isIconOnly
                                                        size="sm"
                                                        variant="flat"
                                                        onPress={() =>
                                                            openModal(product)
                                                        }
                                                        className="rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:hover:bg-blue-900/50"
                                                    >
                                                        <Edit2 className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        isIconOnly
                                                        size="sm"
                                                        variant="flat"
                                                        onPress={() =>
                                                            handleDelete(
                                                                product.id,
                                                            )
                                                        }
                                                        className="rounded-lg bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-950/50 dark:text-red-400 dark:hover:bg-red-900/50"
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

                        {products.last_page > 1 && (
                            <div className="mt-4 flex justify-center">
                                <Pagination
                                    total={products.last_page}
                                    page={products.current_page}
                                    onChange={handlePageChange}
                                    showControls
                                />
                            </div>
                        )}
                    </CardBody>
                </Card>
            </div>

            {/* Modal CRUD Producto */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={closeModal}
                    />

                    {/* Modal Content */}
                    <div className="border-divider relative z-10 max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl border bg-white shadow-2xl dark:bg-[#09090b]">
                        <form onSubmit={handleSubmit} className="flex flex-col">
                            {/* Header */}
                            <div className="border-divider sticky top-0 z-10 flex items-center justify-between border-b bg-white bg-gradient-to-r from-primary/5 to-secondary/5 p-6 dark:bg-[#09090b]">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-xl bg-primary p-2.5">
                                        <Package className="h-6 w-6 text-primary-foreground" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold">
                                            {editingProduct
                                                ? 'Editar Producto'
                                                : 'Nuevo Producto'}
                                        </h2>
                                        <p className="text-default-500 mt-1 text-sm">
                                            Categoría: {category.name}
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
                                {/* Información Básica */}
                                <div className="space-y-4">
                                    <h3 className="flex items-center gap-2 text-lg font-semibold">
                                        <div className="h-1 w-1 rounded-full bg-primary" />
                                        Información Básica
                                    </h3>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <label className="text-default-700 dark:text-default-300 block text-sm font-semibold">
                                                SKU / Código{' '}
                                                <span className="text-danger">
                                                    *
                                                </span>
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="Ej: ALI-001"
                                                value={data.sku}
                                                onChange={(e) =>
                                                    setData(
                                                        'sku',
                                                        e.target.value,
                                                    )
                                                }
                                                required
                                                className="border-default-300/40 dark:border-default-600/40 hover:border-default-400/60 dark:hover:border-default-500/60 placeholder:text-default-400 w-full rounded-xl border-2 bg-transparent px-4 py-3 text-foreground transition-all duration-200 outline-none focus:border-primary/70 dark:focus:border-primary/70"
                                            />
                                            {errors.sku && (
                                                <p className="text-danger text-xs">
                                                    {errors.sku}
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-default-700 dark:text-default-300 block text-sm font-semibold">
                                                Unidad de Medida{' '}
                                                <span className="text-danger">
                                                    *
                                                </span>
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="Ej: unidad, kg, litro..."
                                                value={data.unit}
                                                onChange={(e) =>
                                                    setData(
                                                        'unit',
                                                        e.target.value,
                                                    )
                                                }
                                                required
                                                className="border-default-300/40 dark:border-default-600/40 hover:border-default-400/60 dark:hover:border-default-500/60 placeholder:text-default-400 w-full rounded-xl border-2 bg-transparent px-4 py-3 text-foreground transition-all duration-200 outline-none focus:border-primary/70 dark:focus:border-primary/70"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-default-700 dark:text-default-300 block text-sm font-semibold">
                                            Nombre del Producto{' '}
                                            <span className="text-danger">
                                                *
                                            </span>
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Ej: Alimento para Ganado 50kg"
                                            value={data.name}
                                            onChange={(e) =>
                                                setData('name', e.target.value)
                                            }
                                            required
                                            className="border-default-300/40 dark:border-default-600/40 hover:border-default-400/60 dark:hover:border-default-500/60 placeholder:text-default-400 w-full rounded-xl border-2 bg-transparent px-4 py-3 text-foreground transition-all duration-200 outline-none focus:border-primary/70 dark:focus:border-primary/70"
                                        />
                                        {errors.name && (
                                            <p className="text-danger text-xs">
                                                {errors.name}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Separador */}
                                <div className="border-divider border-t" />

                                {/* Precios */}
                                <div className="space-y-4">
                                    <h3 className="flex items-center gap-2 text-lg font-semibold">
                                        <div className="bg-success h-1 w-1 rounded-full" />
                                        Precios
                                    </h3>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <label className="text-default-700 dark:text-default-300 block text-sm font-semibold">
                                                Precio de Compra{' '}
                                                <span className="text-danger">
                                                    *
                                                </span>
                                            </label>
                                            <div className="relative">
                                                <span className="text-default-500 absolute top-1/2 left-4 -translate-y-1/2">
                                                    S/
                                                </span>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    placeholder="0.00"
                                                    value={data.purchase_price}
                                                    onChange={(e) =>
                                                        setData(
                                                            'purchase_price',
                                                            e.target.value,
                                                        )
                                                    }
                                                    required
                                                    className="border-default-300/40 dark:border-default-600/40 hover:border-default-400/60 dark:hover:border-default-500/60 placeholder:text-default-400 w-full rounded-xl border-2 bg-transparent py-3 pr-4 pl-12 text-foreground transition-all duration-200 outline-none focus:border-primary/70 dark:focus:border-primary/70"
                                                />
                                            </div>
                                            {errors.purchase_price && (
                                                <p className="text-danger text-xs">
                                                    {errors.purchase_price}
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-default-700 dark:text-default-300 block text-sm font-semibold">
                                                Precio de Venta{' '}
                                                <span className="text-danger">
                                                    *
                                                </span>
                                            </label>
                                            <div className="relative">
                                                <span className="text-default-500 absolute top-1/2 left-4 -translate-y-1/2">
                                                    S/
                                                </span>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    placeholder="0.00"
                                                    value={data.sale_price}
                                                    onChange={(e) =>
                                                        setData(
                                                            'sale_price',
                                                            e.target.value,
                                                        )
                                                    }
                                                    required
                                                    className="border-default-300/40 dark:border-default-600/40 hover:border-default-400/60 dark:hover:border-default-500/60 placeholder:text-default-400 w-full rounded-xl border-2 bg-transparent py-3 pr-4 pl-12 text-foreground transition-all duration-200 outline-none focus:border-primary/70 dark:focus:border-primary/70"
                                                />
                                            </div>
                                            {errors.sale_price && (
                                                <p className="text-danger text-xs">
                                                    {errors.sale_price}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Separador */}
                                <div className="border-divider border-t" />

                                {/* Inventario */}
                                <div className="space-y-4">
                                    <h3 className="flex items-center gap-2 text-lg font-semibold">
                                        <div className="bg-warning h-1 w-1 rounded-full" />
                                        Inventario
                                    </h3>
                                    <div className="grid gap-4 md:grid-cols-3">
                                        <div className="space-y-2">
                                            <label className="text-default-700 dark:text-default-300 block text-sm font-semibold">
                                                Stock Inicial{' '}
                                                <span className="text-danger">
                                                    *
                                                </span>
                                            </label>
                                            <input
                                                type="number"
                                                placeholder="0"
                                                value={data.stock}
                                                onChange={(e) =>
                                                    setData(
                                                        'stock',
                                                        e.target.value,
                                                    )
                                                }
                                                required
                                                className="border-default-300/40 dark:border-default-600/40 hover:border-default-400/60 dark:hover:border-default-500/60 placeholder:text-default-400 w-full rounded-xl border-2 bg-transparent px-4 py-3 text-foreground transition-all duration-200 outline-none focus:border-primary/70 dark:focus:border-primary/70"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-default-700 dark:text-default-300 block text-sm font-semibold">
                                                Stock Mínimo{' '}
                                                <span className="text-danger">
                                                    *
                                                </span>
                                            </label>
                                            <input
                                                type="number"
                                                placeholder="0"
                                                value={data.min_stock}
                                                onChange={(e) =>
                                                    setData(
                                                        'min_stock',
                                                        e.target.value,
                                                    )
                                                }
                                                required
                                                className="border-default-300/40 dark:border-default-600/40 hover:border-default-400/60 dark:hover:border-default-500/60 placeholder:text-default-400 w-full rounded-xl border-2 bg-transparent px-4 py-3 text-foreground transition-all duration-200 outline-none focus:border-primary/70 dark:focus:border-primary/70"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-default-700 dark:text-default-300 block text-sm font-semibold">
                                                Fecha de Vencimiento
                                            </label>
                                            <input
                                                type="date"
                                                value={data.expiration_date}
                                                onChange={(e) =>
                                                    setData(
                                                        'expiration_date',
                                                        e.target.value,
                                                    )
                                                }
                                                className="border-default-300/40 dark:border-default-600/40 hover:border-default-400/60 dark:hover:border-default-500/60 w-full rounded-xl border-2 bg-transparent px-4 py-3 text-foreground transition-all duration-200 outline-none focus:border-primary/70 dark:focus:border-primary/70"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Separador */}
                                <div className="border-divider border-t" />

                                {/* Venta Fraccionada */}
                                <div className="space-y-4">
                                    <h3 className="flex items-center gap-2 text-lg font-semibold">
                                        <div className="h-1 w-1 rounded-full bg-secondary" />
                                        Venta Fraccionada
                                    </h3>
                                    <div className="grid gap-4 md:grid-cols-3">
                                        <div className="space-y-2">
                                            <label className="text-default-700 dark:text-default-300 block text-sm font-semibold">
                                                Kilogramos por{' '}
                                                {data.unit || 'unidad'}
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                placeholder="Ej: 9 para bolsa de 9kg"
                                                value={data.kg_per_unit}
                                                onChange={(e) =>
                                                    setData(
                                                        'kg_per_unit',
                                                        e.target.value,
                                                    )
                                                }
                                                className="border-default-300/40 dark:border-default-600/40 hover:border-default-400/60 dark:hover:border-default-500/60 placeholder:text-default-400 w-full rounded-xl border-2 bg-transparent px-4 py-3 text-foreground transition-all duration-200 outline-none focus:border-primary/70 dark:focus:border-primary/70"
                                            />
                                            {errors.kg_per_unit && (
                                                <p className="text-danger text-xs">
                                                    {errors.kg_per_unit}
                                                </p>
                                            )}
                                            <p className="text-default-400 text-xs">
                                                Opcional - Para productos que se
                                                pueden vender por peso
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-default-700 dark:text-default-300 block text-sm font-semibold">
                                                Precio por kilogramo
                                            </label>
                                            <div className="relative">
                                                <span className="text-default-500 absolute top-1/2 left-4 -translate-y-1/2">
                                                    S/
                                                </span>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    placeholder="0.00"
                                                    value={data.price_per_kg}
                                                    onChange={(e) =>
                                                        setData(
                                                            'price_per_kg',
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="border-default-300/40 dark:border-default-600/40 hover:border-default-400/60 dark:hover:border-default-500/60 placeholder:text-default-400 w-full rounded-xl border-2 bg-transparent py-3 pr-4 pl-12 text-foreground transition-all duration-200 outline-none focus:border-primary/70 dark:focus:border-primary/70"
                                                />
                                            </div>
                                            {errors.price_per_kg && (
                                                <p className="text-danger text-xs">
                                                    {errors.price_per_kg}
                                                </p>
                                            )}
                                            <p className="text-default-400 text-xs">
                                                Precio al vender por kilo
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-default-700 dark:text-default-300 block text-sm font-semibold">
                                                Permitir venta fraccionada
                                            </label>
                                            <div className="bg-default-100 border-default-300/40 dark:border-default-600/40 flex items-center gap-3 rounded-xl border-2 p-4">
                                                <input
                                                    type="checkbox"
                                                    checked={
                                                        data.allow_fractional_sale
                                                    }
                                                    onChange={(e) =>
                                                        setData(
                                                            'allow_fractional_sale',
                                                            e.target.checked,
                                                        )
                                                    }
                                                    className="h-5 w-5 rounded"
                                                />
                                                <div>
                                                    <p className="text-default-700 dark:text-default-300 text-sm font-medium">
                                                        Vender por kilos
                                                    </p>
                                                    <p className="text-default-500 text-xs">
                                                        Permite vender
                                                        cantidades fraccionadas
                                                        en kilos
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {data.kg_per_unit && data.stock && (
                                        <div className="rounded-xl border border-secondary/20 bg-secondary/10 p-4">
                                            <p className="text-secondary-700 dark:text-secondary-300 text-sm">
                                                <span className="font-semibold">
                                                    Disponible:
                                                </span>{' '}
                                                {data.stock} {data.unit}s ={' '}
                                                {(
                                                    parseFloat(data.stock) *
                                                    parseFloat(data.kg_per_unit)
                                                ).toFixed(2)}{' '}
                                                kg
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Separador */}
                                <div className="border-divider border-t" />

                                {/* Estado */}
                                <div className="space-y-4">
                                    <h3 className="flex items-center gap-2 text-lg font-semibold">
                                        <div className="bg-success h-1 w-1 rounded-full" />
                                        Estado del Producto
                                    </h3>
                                    <div className="bg-default-100 flex items-center gap-3 rounded-xl p-4">
                                        <input
                                            type="checkbox"
                                            checked={data.is_active}
                                            onChange={(e) =>
                                                setData(
                                                    'is_active',
                                                    e.target.checked,
                                                )
                                            }
                                            className="h-5 w-5 rounded"
                                        />
                                        <div className="flex items-center gap-2">
                                            {data.is_active ? (
                                                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                                            ) : (
                                                <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                                            )}
                                            <div>
                                                <p
                                                    className={`text-sm font-medium ${data.is_active ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
                                                >
                                                    Producto{' '}
                                                    {data.is_active
                                                        ? 'Activo'
                                                        : 'Inactivo'}
                                                </p>
                                                <p className="text-default-500 text-xs">
                                                    {data.is_active
                                                        ? 'Este producto estará visible y disponible para ventas'
                                                        : 'Este producto estará oculto y no se podrá vender'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
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
                                    {editingProduct
                                        ? 'Actualizar Producto'
                                        : 'Crear Producto'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
