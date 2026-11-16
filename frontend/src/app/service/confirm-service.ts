import { Service, signal } from '@angular/core';

export interface ConfirmOptions {
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    tone?: 'danger' | 'default';
}

export interface ConfirmRequest {
    id: number;
    title: string;
    message: string;
    confirmLabel: string;
    cancelLabel: string;
    tone: 'danger' | 'default';
}

@Service()
export class ConfirmService {
    private pending: ((value: boolean) => void) | null = null;
    private seq = 0;
    private _request = signal<ConfirmRequest | null>(null);

    readonly request = this._request.asReadonly();

    ask(options: ConfirmOptions): Promise<boolean> {
        this.resolvePending(false);

        return new Promise<boolean>(resolve => {
            this.pending = resolve;
            this._request.set({
                id: ++this.seq,
                title: options.title,
                message: options.message,
                confirmLabel: options.confirmLabel ?? 'Eliminar',
                cancelLabel: options.cancelLabel ?? 'Cancelar',
                tone: options.tone ?? 'danger'
            });
        });
    }

    accept(): void {
        this.resolvePending(true);
    }

    cancel(): void {
        this.resolvePending(false);
    }

    private resolvePending(value: boolean): void {
        const resolver = this.pending;
        this.pending = null;
        this._request.set(null);
        resolver?.(value);
    }
}
