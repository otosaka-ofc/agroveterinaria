import AppLayout from '@/layouts/app-layout';
import {
    Button,
    Card,
    CardBody,
    CardHeader,
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
    AlertCircle,
    ArrowRight,
    CheckCircle,
    Edit2,
    Package,
    Plus,
    Trash2,
    X,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';

interface Category {
    id: number;
    name: string;
}

interface Product {
    id: number;
    sku: string;
    name: string;
    description: string | null;
    category: Category;
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
    is_stored: boolean;
}

interface Props {
    products: {
        data: Product[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    categories: Category[];
    filters: {
        search?: string;
        category_id?: number;
        low_stock?: boolean;
    };
}

export default function ProductsIndex({
    products,
    categories,
    filters,
}: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [categoryFilter, setCategoryFilter] = useState(
        filters.category_id?.toString() || '',
    );
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isMoveProductModalOpen, setIsMoveProductModalOpen] = useState(false);
    const [productToMove, setProductToMove] = useState<any>(null);

    const { data, setData, processing, errors, reset } = useForm({
        sku: '',
        name: '',
        description: '',
        category_id: '',
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
    });

    console.log(products);

    const products_ = products.data.filter(
        (product) => product.is_stored === true,
    );

    const openModal = (product?: Product) => {
        if (product) {
            setEditingProduct(product);
            setData({
                sku: product.sku,
                name: product.name,
                description: product.description || '',
                category_id: product.category.id.toString(),
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
            });
        } else {
            setEditingProduct(null);
            reset();
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingProduct(null);
        reset();
    };

    const transferProduct = (id: number, isStored: boolean) => {
        console.log(id);
        router.patch(
            `/store/${id}/toggle-stored`,
            { is_stored: isStored },
            {
                onSuccess: () => {
                    closeModal();
                },
                onError: (e) => {
                    console.log(e);
                },
            },
        );
        setProductToMove(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const url = editingProduct ? `/store/${editingProduct.id}` : '/store';

        const method = editingProduct ? 'put' : 'post';

        router[method](
            url,
            { ...data, is_stored: true },
            {
                onSuccess: () => {
                    closeModal();
                },
                onError: (e) => {
                    console.log(e);
                },
            },
        );
    };

    const handleDelete = (id: number) => {
        if (confirm('¿Estás seguro de eliminar este producto?')) {
            router.delete(`/store/${id}`);
        }
    };

    const handleSearch = () => {
        router.get(
            '/store',
            { search, category_id: categoryFilter },
            { preserveState: true },
        );
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN',
        }).format(amount);
    };

    return (
        <AppLayout>
            <Head title="Productos" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Productos</h1>
                        <p className="text-default-500">
                            Gestiona el inventario de productos
                        </p>
                    </div>
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

                <Card className="rounded-3xl border-none shadow-2xl dark:bg-[#18181b]">
                    <CardHeader className="px-6 pt-6 pb-4">
                        <div className="grid w-full gap-4 md:grid-cols-3">
                            <div className="flex flex-col gap-2 md:col-span-2">
                                <span className="text-default-700 dark:text-default-200 text-sm font-semibold">
                                    Buscar producto
                                </span>
                                <input
                                    type="text"
                                    placeholder="Nombre o SKU"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) =>
                                        e.key === 'Enter' && handleSearch()
                                    }
                                    className="border-default-300/40 dark:border-default-600/40 hover:border-default-400/60 dark:hover:border-default-500/60 placeholder:text-default-400 w-full rounded-xl border-2 bg-transparent px-4 py-3 text-foreground transition-all duration-200 outline-none focus:border-primary/70 dark:focus:border-primary/70"
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <span className="text-default-700 dark:text-default-200 text-sm font-semibold">
                                    Categoría
                                </span>
                                <select
                                    value={categoryFilter}
                                    onChange={(e) =>
                                        setCategoryFilter(e.target.value)
                                    }
                                    className="border-default-300/40 dark:border-default-600/40 hover:border-default-400/60 dark:hover:border-default-500/60 w-full rounded-xl border-2 bg-white px-4 py-3 text-foreground transition-all duration-200 outline-none focus:border-primary/70 dark:bg-[#09090b] dark:focus:border-primary/70 [&>option]:my-1 [&>option]:rounded-lg [&>option]:bg-white [&>option]:px-2 [&>option]:text-foreground [&>option]:dark:bg-[#09090b]"
                                >
                                    <option value="">
                                        Todas las categorías
                                    </option>
                                    {categories.map((category) => (
                                        <option
                                            key={category.id}
                                            value={category.id.toString()}
                                        >
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                                <Button
                                    color="primary"
                                    onPress={handleSearch}
                                    size="lg"
                                    className="w-full rounded-2xl px-8 font-semibold"
                                >
                                    Buscar
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardBody className="pt-2">
                        <Table
                            aria-label="Tabla de productos"
                            className="min-w-full"
                            classNames={{
                                wrapper: 'rounded-2xl shadow-none',
                                th: 'bg-default-100 text-default-700 font-bold',
                                td: 'py-4',
                            }}
                        >
                            <TableHeader>
                                <TableColumn>PRODUCTO</TableColumn>
                                <TableColumn>CATEGORÍA</TableColumn>
                                <TableColumn>STOCK</TableColumn>
                                <TableColumn>PRECIO</TableColumn>
                                <TableColumn>ESTADO</TableColumn>
                                <TableColumn>ACCIONES</TableColumn>
                            </TableHeader>
                            <TableBody>
                                {products_.map((product) => (
                                    <TableRow key={product.id}>
                                        <TableCell>
                                            <div>
                                                <p className="font-semibold">
                                                    {product.name}
                                                </p>
                                                <p className="text-default-500 text-xs">
                                                    SKU: {product.sku}
                                                </p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {product.category.name}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                {product.stock <=
                                                product.min_stock ? (
                                                    <AlertCircle className="text-warning h-4 w-4" />
                                                ) : null}
                                                <span
                                                    className={
                                                        product.stock <=
                                                        product.min_stock
                                                            ? 'text-warning font-semibold'
                                                            : ''
                                                    }
                                                >
                                                    {product.stock}{' '}
                                                    {product.unit}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {formatCurrency(product.sale_price)}
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                size="sm"
                                                variant="flat"
                                                color={
                                                    product.is_active
                                                        ? 'success'
                                                        : 'danger'
                                                }
                                                isDisabled
                                                className={`inline-flex cursor-default items-center gap-2 rounded-lg font-semibold ${product.is_active ? 'text-green-600' : 'text-red-600'}`}
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
                                            </Button>
                                        </TableCell>
                                        <TableCell className="">
                                            <div className="flex gap-1">
                                                <Button
                                                    isIconOnly
                                                    size="sm"
                                                    variant="flat"
                                                    className="rounded-full bg-emerald-400 text-white"
                                                    onPress={() =>
                                                        openModal(product)
                                                    }
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    isIconOnly
                                                    size="sm"
                                                    color="danger"
                                                    variant="flat"
                                                    className="rounded-full bg-red-400"
                                                    onPress={() =>
                                                        handleDelete(product.id)
                                                    }
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>

                                                <Button
                                                    size="sm"
                                                    onClick={() => {
                                                        setProductToMove(
                                                            product,
                                                        );
                                                        setIsMoveProductModalOpen(
                                                            true,
                                                        );
                                                    }}
                                                    className="rounded-2xl bg-blue-500 text-white"
                                                >
                                                    <ArrowRight />
                                                    Mover para venta
                                                </Button>
                                                {isMoveProductModalOpen && (
                                                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                                                        {/* Backdrop */}
                                                        <div
                                                            className="absolute inset-0 bg-black/10 backdrop-blur-sm"
                                                            onClick={() =>
                                                                setIsMoveProductModalOpen(
                                                                    false,
                                                                )
                                                            }
                                                        />

                                                        {/* Modal Content */}
                                                        <div className="border-divider relative z-10 max-h-[90vh] overflow-y-auto rounded-3xl border bg-white shadow-2xl dark:bg-[#09090b]">
                                                            <form className="flex flex-col">
                                                                <div className="border-divider sticky top-0 z-10 flex items-center justify-between border-b bg-white bg-gradient-to-r from-primary/10 to-secondary/10 p-6 dark:bg-[#09090b]">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="rounded-xl bg-primary p-2.5">
                                                                            <Package className="h-6 w-6 text-primary-foreground" />
                                                                        </div>
                                                                        <div>
                                                                            <h2 className="text-2xl font-bold">
                                                                                Mover
                                                                                Producto
                                                                            </h2>
                                                                        </div>
                                                                    </div>
                                                                    <Button
                                                                        isIconOnly
                                                                        variant="light"
                                                                        onPress={() => {
                                                                            setProductToMove(
                                                                                null,
                                                                            );
                                                                            setIsMoveProductModalOpen(
                                                                                false,
                                                                            );
                                                                        }}
                                                                        className="rounded-full"
                                                                        size="lg"
                                                                    >
                                                                        <X className="h-6 w-6" />
                                                                    </Button>
                                                                </div>

                                                                {/* Body */}
                                                                <div className="space-y-8 bg-white p-8 dark:bg-[#09090b]">
                                                                    <p>
                                                                        ¿Esta
                                                                        seguro
                                                                        de mover
                                                                        este
                                                                        producto?
                                                                    </p>
                                                                    <p>
                                                                        El
                                                                        producto
                                                                        pasara a
                                                                        estar
                                                                        disponible
                                                                        en la
                                                                        seccion
                                                                        de
                                                                        ventas y
                                                                        productos.
                                                                    </p>
                                                                </div>

                                                                {/* Footer */}
                                                                <div className="border-divider bg-default-50 sticky bottom-0 flex items-center justify-end gap-3 border-t p-6 dark:bg-[#18181b]">
                                                                    <Button
                                                                        variant="flat"
                                                                        onPress={() => {
                                                                            setProductToMove(
                                                                                null,
                                                                            );
                                                                            setIsMoveProductModalOpen(
                                                                                false,
                                                                            );
                                                                        }}
                                                                        size="lg"
                                                                        className="rounded-xl font-medium"
                                                                    >
                                                                        Cancelar
                                                                    </Button>
                                                                    <Button
                                                                        color="primary"
                                                                        type="submit"
                                                                        size="lg"
                                                                        onPress={() =>
                                                                            transferProduct(
                                                                                productToMove.id,
                                                                                productToMove.is_stored,
                                                                            )
                                                                        }
                                                                        className="rounded-xl px-8 font-semibold"
                                                                    >
                                                                        Mover
                                                                        Producto
                                                                        para
                                                                        venta
                                                                    </Button>
                                                                </div>
                                                            </form>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>

                        {products.last_page > 1 && (
                            <div className="mt-4 flex justify-center">
                                <Pagination
                                    total={products.last_page}
                                    page={products.current_page}
                                    onChange={(page) =>
                                        router.get('/products', { page })
                                    }
                                />
                            </div>
                        )}
                    </CardBody>
                </Card>
            </div>

            {/* Modal Overlay Personalizado */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={closeModal}
                    />

                    {/* Modal Content */}
                    <div className="border-divider relative z-10 max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-3xl border bg-white shadow-2xl dark:bg-[#09090b]">
                        <form onSubmit={handleSubmit} className="flex flex-col">
                            {/* Header */}
                            <div className="border-divider sticky top-0 z-10 flex items-center justify-between border-b bg-white bg-gradient-to-r from-primary/10 to-secondary/10 p-6 dark:bg-[#09090b]">
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
                                            {editingProduct
                                                ? 'Modifica la información del producto'
                                                : 'Completa los datos del nuevo producto'}
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    isIconOnly
                                    variant="light"
                                    onPress={closeModal}
                                    className="rounded-full"
                                    size="lg"
                                >
                                    <X className="h-6 w-6" />
                                </Button>
                            </div>

                            {/* Body */}
                            <div className="space-y-8 bg-white p-8 dark:bg-[#09090b]">
                                {/* Información Básica */}
                                <div className="space-y-6">
                                    <h3 className="flex items-center gap-2 text-lg font-semibold">
                                        <div className="h-1 w-1 rounded-full bg-primary" />
                                        Información Básica
                                    </h3>

                                    <div className="grid gap-6 md:grid-cols-2">
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
                                                autoFocus
                                                className="border-default-300/40 dark:border-default-600/40 hover:border-default-400/60 dark:hover:border-default-500/60 placeholder:text-default-400 w-full rounded-xl border-2 bg-transparent px-4 py-3 text-foreground transition-all duration-200 outline-none focus:border-primary/70 dark:focus:border-primary/70"
                                            />
                                            {errors.sku && (
                                                <p className="text-danger text-xs">
                                                    {errors.sku}
                                                </p>
                                            )}
                                            <p className="text-default-400 text-xs">
                                                Código único del producto
                                            </p>
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
                                            <p className="text-default-400 text-xs">
                                                Cómo se mide este producto
                                            </p>
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

                                    <div className="space-y-2">
                                        <label className="text-default-700 dark:text-default-300 block text-sm font-semibold">
                                            Descripción
                                        </label>
                                        <textarea
                                            placeholder="Describe el producto..."
                                            value={data.description}
                                            onChange={(e) =>
                                                setData(
                                                    'description',
                                                    e.target.value,
                                                )
                                            }
                                            rows={3}
                                            className="border-default-300/40 dark:border-default-600/40 hover:border-default-400/60 dark:hover:border-default-500/60 placeholder:text-default-400 w-full resize-none rounded-xl border-2 bg-transparent px-4 py-3 text-foreground transition-all duration-200 outline-none focus:border-primary/70 dark:focus:border-primary/70"
                                        />
                                        <p className="text-default-400 text-xs">
                                            Opcional - Información adicional
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-default-700 dark:text-default-300 block text-sm font-semibold">
                                            Categoría{' '}
                                            <span className="text-danger">
                                                *
                                            </span>
                                        </label>
                                        <select
                                            value={data.category_id}
                                            onChange={(e) =>
                                                setData(
                                                    'category_id',
                                                    e.target.value,
                                                )
                                            }
                                            required
                                            className="border-default-300/40 dark:border-default-600/40 hover:border-default-400/60 dark:hover:border-default-500/60 w-full rounded-xl border-2 bg-white px-4 py-3 text-foreground transition-all duration-200 outline-none focus:border-primary/70 dark:bg-[#09090b] dark:focus:border-primary/70 [&>option]:my-1 [&>option]:rounded-lg [&>option]:bg-white [&>option]:px-2 [&>option]:text-foreground [&>option]:dark:bg-[#09090b]"
                                        >
                                            <option value="">
                                                Selecciona una categoría
                                            </option>
                                            {categories.map((cat) => (
                                                <option
                                                    key={cat.id}
                                                    value={cat.id}
                                                >
                                                    {cat.name}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.category_id && (
                                            <p className="text-danger text-xs">
                                                {errors.category_id}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Separador */}
                                <div className="border-divider border-t" />

                                {/* Precios */}
                                <div className="space-y-6">
                                    <h3 className="flex items-center gap-2 text-lg font-semibold">
                                        <div className="bg-success h-1 w-1 rounded-full" />
                                        Precios
                                    </h3>
                                    <div className="grid gap-6 md:grid-cols-2">
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
                                            <p className="text-default-400 text-xs">
                                                Costo unitario
                                            </p>
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
                                            <p className="text-default-400 text-xs">
                                                Precio al que vendes
                                            </p>
                                        </div>
                                    </div>
                                    {(() => {
                                        const cost = parseFloat(
                                            data.purchase_price || '',
                                        );
                                        const price = parseFloat(
                                            data.sale_price || '',
                                        );
                                        const isValid =
                                            Number.isFinite(cost) &&
                                            Number.isFinite(price) &&
                                            cost > 0 &&
                                            price >= 0;
                                        if (!isValid || price < cost)
                                            return null;
                                        const diff = price - cost;
                                        const pct = (diff / cost) * 100;
                                        return (
                                            <div className="bg-success/10 border-success/20 rounded-xl border p-4">
                                                <p className="text-success-700 dark:text-success-300 text-sm">
                                                    <span className="font-semibold">
                                                        Margen:
                                                    </span>{' '}
                                                    S/ {diff.toFixed(2)} (
                                                    {pct.toFixed(1)}%)
                                                </p>
                                            </div>
                                        );
                                    })()}
                                </div>

                                {/* Separador */}
                                <div className="border-divider border-t" />

                                {/* Inventario */}
                                <div className="space-y-6">
                                    <h3 className="flex items-center gap-2 text-lg font-semibold">
                                        <div className="bg-warning h-1 w-1 rounded-full" />
                                        Control de Inventario
                                    </h3>
                                    <div className="grid gap-6 md:grid-cols-3">
                                        <div className="space-y-2">
                                            <label className="text-default-700 dark:text-default-300 block text-sm font-semibold">
                                                Stock Actual{' '}
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
                                            <p className="text-default-400 text-xs">
                                                Alerta de bajo stock
                                            </p>
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
                                            <p className="text-default-400 text-xs">
                                                Opcional
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Separador */}
                                <div className="border-divider border-t" />

                                {/* Venta Fraccionada */}
                                <div className="space-y-6">
                                    <h3 className="flex items-center gap-2 text-lg font-semibold">
                                        <div className="h-1 w-1 rounded-full bg-secondary" />
                                        Venta Fraccionada
                                    </h3>
                                    <div className="grid gap-6 md:grid-cols-3">
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
