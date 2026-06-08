import { Button, Card, CardBody, CardHeader, Divider } from '@heroui/react';
import { Product } from '../types';

interface ServiceBreedModalProps {
    product: Product;
    breeds: string[];
    onSelectBreed: (breed: string) => void;
    onClose: () => void;
}

export function ServiceBreedModal({
    product,
    breeds,
    onSelectBreed,
    onClose,
}: ServiceBreedModalProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center rounded-lg bg-black/50">
            <Card className="mx-4 w-full max-w-md border-none rounded-2xl shadow-2xl bg-white dark:bg-[#18181b]">
                <CardHeader className="px-6 pt-6 pb-4">
                    <div>
                        <h3 className="text-default-700 dark:text-default-200 text-lg font-bold">
                            {product.name}
                        </h3>
                        <p className="text-default-500 mt-1 text-sm">
                            Selecciona la raza para este servicio
                        </p>
                    </div>
                </CardHeader>
                <CardBody className="gap-4">
                    {breeds.map((breed) => (
                        <button
                            key={breed}
                            type="button"
                            onClick={() => onSelectBreed(breed)}
                            className="border-default-300/40 hover:bg-default-100 dark:hover:bg-default-100/10 rounded-xl border-2 p-4 text-left transition-colors w-full"
                        >
                            <div className="flex items-center justify-between gap-3">
                                <span className="text-default-700 dark:text-default-200 font-medium">
                                    {breed}
                                </span>
                                <span className="text-default-500 text-xs">
                                    Seleccionar
                                </span>
                            </div>
                        </button>
                    ))}

                    <Divider className="my-2" />

                    <Button variant="flat" className="w-full" onPress={onClose}>
                        Cancelar
                    </Button>
                </CardBody>
            </Card>
        </div>
    );
}
