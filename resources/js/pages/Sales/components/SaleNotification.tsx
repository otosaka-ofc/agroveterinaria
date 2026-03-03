import { AlertTriangle, CheckCircle, X } from 'lucide-react';

interface SaleNotificationProps {
    type: 'success' | 'error';
    message: string;
    onClose: () => void;
}

export function SaleNotification({ type, message, onClose }: SaleNotificationProps) {
    return (
        <div
            className={`flex items-start gap-3 rounded-2xl border px-4 py-3 shadow ${
                type === 'success'
                    ? 'border-success-200 bg-success-50 text-success-700'
                    : 'border-danger-200 bg-danger-50 text-danger-700'
            }`}
        >
            {type === 'success' ? (
                <CheckCircle className="mt-0.5 h-5 w-5" />
            ) : (
                <AlertTriangle className="mt-0.5 h-5 w-5" />
            )}
            <div className="flex-1 text-sm font-medium">{message}</div>
            <button
                type="button"
                onClick={onClose}
                className="text-inherit hover:opacity-70"
                aria-label="Cerrar alerta"
            >
                <X className="h-4 w-4" />
            </button>
        </div>
    );
}
