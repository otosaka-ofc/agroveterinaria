import { Card, CardBody, CardHeader, Select, SelectItem } from '@heroui/react';
import { CreditCard } from 'lucide-react';

interface PaymentPanelProps {
    paymentMethod: string;
    paymentReference: string;
    notes: string;
    onPaymentMethodChange: (value: string) => void;
    onPaymentReferenceChange: (value: string) => void;
    onNotesChange: (value: string) => void;
}

export function PaymentPanel({
    paymentMethod,
    paymentReference,
    notes,
    onPaymentMethodChange,
    onPaymentReferenceChange,
    onNotesChange,
}: PaymentPanelProps) {
    return (
        <Card className="rounded-3xl border-none shadow-2xl dark:bg-[#18181b]">
            <CardHeader className="px-6 pt-6 pb-4">
                <h3 className="flex items-center gap-2 text-lg font-semibold">
                    <CreditCard className="h-5 w-5" />
                    Pago
                </h3>
            </CardHeader>
            <CardBody>
                <div className="space-y-4">
                    <div className="flex flex-col gap-2">
                        <span className="text-default-700 dark:text-default-200 text-sm font-semibold">
                            Método de Pago
                        </span>
                        <Select
                            aria-label="Método de Pago"
                            selectedKeys={[paymentMethod]}
                            onChange={(e) => onPaymentMethodChange(e.target.value)}
                            isRequired
                            size="lg"
                            classNames={{
                                trigger:
                                    'min-h-[52px] px-4 bg-white dark:bg-[#18181b] border border-default-200 dark:border-default-100 rounded-2xl',
                                listbox: 'bg-white dark:bg-[#09090b]',
                            }}
                        >
                            <SelectItem key="efectivo">💵 Efectivo</SelectItem>
                            <SelectItem key="yape">📱 Yape</SelectItem>
                        </Select>
                    </div>

                    {paymentMethod === 'yape' && (
                        <div className="flex flex-col gap-2">
                            <label className="text-default-700 dark:text-default-200 text-sm font-semibold">
                                Número de Operación
                            </label>
                            <input
                                type="text"
                                placeholder="123456789"
                                value={paymentReference}
                                onChange={(e) => onPaymentReferenceChange(e.target.value)}
                                className="border-default-300/40 text-default-700 dark:text-default-200 placeholder:text-default-400 rounded-xl border-2 bg-white px-3 py-3 transition-colors focus:border-primary/70 focus:outline-none dark:bg-[#18181b]"
                            />
                        </div>
                    )}

                    <div className="flex flex-col gap-2">
                        <label className="text-default-700 dark:text-default-200 text-sm font-semibold">
                            Notas (Opcional)
                        </label>
                        <input
                            type="text"
                            placeholder="Observaciones"
                            value={notes}
                            onChange={(e) => onNotesChange(e.target.value)}
                            className="border-default-300/40 text-default-700 dark:text-default-200 placeholder:text-default-400 rounded-xl border-2 bg-white px-3 py-3 transition-colors focus:border-primary/70 focus:outline-none dark:bg-[#18181b]"
                        />
                    </div>
                </div>
            </CardBody>
        </Card>
    );
}
