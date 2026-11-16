import { Service, signal } from '@angular/core';

export type ToastTone = 'success' | 'error' | 'info';

export interface ToastMessage {
    id: number;
    tone: ToastTone;
    message: string;
    leaving: boolean;
}

const DEFAULT_DURATION: Record<ToastTone, number> = {
    success: 4200,
    info: 5200,
    error: 7200
};

const MAX_VISIBLE = 4;
const LEAVE_DURATION = 180;

@Service()
export class NotificationService {
    private seq = 0;
    private timers = new Map<number, ReturnType<typeof setTimeout>>();
    private _toasts = signal<ToastMessage[]>([]);

    readonly toasts = this._toasts.asReadonly();

    success(message: string): void {
        this.push('success', message);
    }

    error(message: string): void {
        this.push('error', message);
    }

    info(message: string): void {
        this.push('info', message);
    }

    dismiss(id: number): void {
        const timer = this.timers.get(id);
        if (timer) {
            clearTimeout(timer);
            this.timers.delete(id);
        }

        const exists = this._toasts().some(toast => toast.id === id && !toast.leaving);
        if (!exists) return;

        this._toasts.update(list => list.map(toast =>
            toast.id === id ? { ...toast, leaving: true } : toast
        ));

        setTimeout(() => {
            this._toasts.update(list => list.filter(toast => toast.id !== id));
        }, LEAVE_DURATION);
    }

    duration(tone: ToastTone): number {
        return DEFAULT_DURATION[tone];
    }

    private push(tone: ToastTone, message: string): void {
        const id = ++this.seq;
        const toast: ToastMessage = { id, tone, message, leaving: false };

        this._toasts.update(list => [...list, toast].slice(-MAX_VISIBLE));
        this.timers.set(id, setTimeout(() => this.dismiss(id), DEFAULT_DURATION[tone]));
    }
}
