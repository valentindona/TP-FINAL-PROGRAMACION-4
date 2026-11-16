import { HttpErrorResponse, HttpEvent, HttpEventType, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { tap } from 'rxjs';
import { NotificationService } from '../service/notification-service';

interface ActionCopy {
    match: RegExp;
    noun: string;
    created: string;
    updated: string;
    deleted: string;
}

const ACTIONS: ActionCopy[] = [
    {
        match: /\/api\/donantes(\/|$|\?)/,
        noun: 'la empresa',
        created: 'Empresa creada correctamente',
        updated: 'Empresa actualizada correctamente',
        deleted: 'Empresa eliminada correctamente'
    },
    {
        match: /\/api\/instituciones(\/|$|\?)/,
        noun: 'la institución',
        created: 'Institución creada correctamente',
        updated: 'Institución actualizada correctamente',
        deleted: 'Institución eliminada correctamente'
    },
    {
        match: /\/api\/donaciones(\/|$|\?)/,
        noun: 'la donación',
        created: 'Donación registrada correctamente',
        updated: 'Donación actualizada correctamente',
        deleted: 'Donación eliminada correctamente'
    },
    {
        match: /\/api\/itemdonacion(\/|$|\?)/,
        noun: 'el ítem de donación',
        created: 'Ítem de donación creado correctamente',
        updated: 'Ítem de donación actualizado correctamente',
        deleted: 'Ítem de donación eliminado correctamente'
    },
    {
        match: /\/api\/productos(\/|$|\?)/,
        noun: 'el producto',
        created: 'Producto creado correctamente',
        updated: 'Producto actualizado correctamente',
        deleted: 'Producto eliminado correctamente'
    },
    {
        match: /\/api\/remitos(\/|$|\?)/,
        noun: 'el remito',
        created: 'Remito creado correctamente',
        updated: 'Remito actualizado correctamente',
        deleted: 'Remito eliminado correctamente'
    },
    {
        match: /\/api\/facturas(\/|$|\?)/,
        noun: 'la factura',
        created: 'Factura generada correctamente',
        updated: 'Factura actualizada correctamente',
        deleted: 'Factura eliminada correctamente'
    }
];

const MUTATING_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];

const VERBS: Record<string, string> = {
    POST: 'crear',
    PUT: 'actualizar',
    PATCH: 'actualizar',
    DELETE: 'eliminar'
};

function copyFor(url: string): ActionCopy | undefined {
    return ACTIONS.find(action => action.match.test(url));
}

function successMessage(url: string, method: string, copy: ActionCopy): string {
    if (url.includes('/confirmar')) return 'Donación confirmada correctamente';
    if (url.includes('/generar/')) return 'Factura generada correctamente';
    if (method === 'POST') return copy.created;
    if (method === 'DELETE') return copy.deleted;
    return copy.updated;
}

function backendMessage(error: HttpErrorResponse): string | null {
    const body = error.error;

    if (typeof body === 'string') {
        const text = body.trim();
        return text && text.length <= 220 ? text : null;
    }

    if (body && typeof body === 'object') {
        for (const key of ['mensaje', 'message', 'detail']) {
            const value = (body as Record<string, unknown>)[key];
            if (typeof value === 'string' && value.trim() && value.length <= 220) {
                return value.trim();
            }
        }
    }

    return null;
}

function failureMessage(error: HttpErrorResponse, method: string, copy: ActionCopy): string {
    if (error.status === 0) {
        return 'No se pudo conectar con el servidor. Verificá que el backend esté en línea.';
    }

    if (error.status === 401) {
        return 'Tu sesión venció. Volvé a iniciar sesión para continuar.';
    }

    if (error.status === 403) {
        return 'No tenés permisos para realizar esta acción.';
    }

    const detail = backendMessage(error);
    if (detail) return detail;

    return `No se pudo ${VERBS[method] ?? 'completar'} ${copy.noun}. Revisá los datos e intentá de nuevo.`;
}

export const notificationInterceptor: HttpInterceptorFn = (req, next) => {
    const notifications = inject(NotificationService);
    const method = req.method.toUpperCase();
    const copy = copyFor(req.url);

    if (!copy || !MUTATING_METHODS.includes(method)) {
        return next(req);
    }

    return next(req).pipe(
        tap({
            next: (event: HttpEvent<unknown>) => {
                // La cadena de interceptores recibe todos los eventos HTTP
                // (Sent, Response...). Solo notificamos cuando llega la respuesta.
                if (event.type === HttpEventType.Response) {
                    notifications.success(successMessage(req.url, method, copy));
                }
            },
            error: (error: HttpErrorResponse) => notifications.error(failureMessage(error, method, copy))
        })
    );
};
