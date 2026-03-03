import { Search } from 'lucide-react';
import { Product } from '../types';
import { formatCurrency } from '../utils';

interface ProductSearchDropdownProps {
    products: Product[];
    searchQuery: string;
    showDropdown: boolean;
    onSearchChange: (query: string) => void;
    onFocus: () => void;
    onSelectProduct: (productId: string) => void;
}

export function ProductSearchDropdown({
    products,
    searchQuery,
    showDropdown,
    onSearchChange,
    onFocus,
    onSelectProduct,
}: ProductSearchDropdownProps) {
    const filtered = products.filter(
        (product) =>
            product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.sku.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    return (
        <div className="relative mb-4 flex flex-col gap-2">
            <label className="text-default-700 dark:text-default-200 text-sm font-semibold">
                Buscar producto
            </label>
            <div className="relative">
                <Search className="text-default-400 pointer-events-none absolute top-1/2 left-3 z-10 h-4 w-4 -translate-y-1/2" />
                <input
                    type="text"
                    placeholder="Busca por nombre o SKU"
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    onFocus={onFocus}
                    className="border-default-300/40 text-default-700 dark:text-default-200 placeholder:text-default-400 w-full rounded-xl border-2 bg-white py-3 pr-3 pl-10 transition-colors focus:border-primary/70 focus:outline-none dark:bg-[#18181b]"
                />
            </div>

            {showDropdown && searchQuery && (
                <div className="border-default-300/40 absolute top-full right-0 left-0 z-50 mt-2 max-h-60 overflow-y-auto rounded-xl border-2 bg-white shadow-2xl dark:bg-[#18181b]">
                    {filtered.length === 0 ? (
                        <div className="text-default-500 px-4 py-3 text-center">
                            No se encontraron productos
                        </div>
                    ) : (
                        filtered.slice(0, 10).map((product) => (
                            <button
                                key={product.id}
                                type="button"
                                onClick={() => onSelectProduct(product.id.toString())}
                                className="hover:bg-default-100 dark:hover:bg-default-50/10 border-default-200 dark:border-default-100 w-full border-b px-4 py-3 text-left transition-colors last:border-0"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-default-700 dark:text-default-200 font-semibold">
                                            {product.name}
                                        </p>
                                        <p className="text-default-500 text-xs">
                                            SKU: {product.sku} | Stock: {product.stock}
                                            {product.allow_fractional_sale && product.price_per_kg && (
                                                <span className="text-success ml-2 font-medium">
                                                    | Venta fraccionada disponible
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-primary">
                                            {formatCurrency(product.sale_price)}
                                        </p>
                                        {product.allow_fractional_sale && product.price_per_kg && (
                                            <p className="text-success text-xs">
                                                {formatCurrency(product.price_per_kg)}/kg
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
