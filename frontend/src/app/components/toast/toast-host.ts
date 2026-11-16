import { Component, inject } from '@angular/core';
import { NotificationService } from '../../service/notification-service';

@Component({
  selector: 'app-toast-host',
  styleUrl: './toast-host.css',
  templateUrl: './toast-host.html',
})
export class ToastHost {
  readonly notifications = inject(NotificationService);

  duration(tone: 'success' | 'error' | 'info'): string {
    return `${this.notifications.duration(tone)}ms`;
  }
}
