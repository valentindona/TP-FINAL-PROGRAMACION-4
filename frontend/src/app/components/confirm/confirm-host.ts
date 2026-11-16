import { Component, ElementRef, effect, inject, viewChild } from '@angular/core';
import { ConfirmService } from '../../service/confirm-service';

@Component({
  selector: 'app-confirm-host',
  styleUrl: './confirm-host.css',
  templateUrl: './confirm-host.html',
})
export class ConfirmHost {
  readonly confirm = inject(ConfirmService);

  private cancelButton = viewChild<ElementRef<HTMLButtonElement>>('cancelButton');
  private previousFocus: HTMLElement | null = null;

  constructor() {
    effect(() => {
      const request = this.confirm.request();

      if (request) {
        const active = document.activeElement;
        this.previousFocus = active instanceof HTMLElement ? active : null;
        document.body.style.overflow = 'hidden';

        // Esperamos al render del diálogo antes de mover el foco.
        setTimeout(() => this.cancelButton()?.nativeElement.focus(), 0);
        return;
      }

      document.body.style.overflow = '';
      this.previousFocus?.focus?.();
      this.previousFocus = null;
    });
  }

  onBackdrop(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.confirm.cancel();
    }
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.confirm.cancel();
      return;
    }

    if (event.key !== 'Tab') return;

    const container = event.currentTarget as HTMLElement;
    const focusable = Array.from(container.querySelectorAll<HTMLElement>('button:not([disabled])'));
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;

    if (event.shiftKey && (active === first || !container.contains(active))) {
      event.preventDefault();
      last.focus();
      return;
    }

    if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }
}
