import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Donacion } from '../../../interfaces/donacion';
import { DonacionService } from '../../../service/donacion-service';
import { NotificationService } from '../../../service/notification-service';
import { ConfirmService } from '../../../service/confirm-service';

@Component({
  imports: [RouterLink, CommonModule],
  selector: 'app-donacion-details',
  styleUrl: './donacion-details.css',
  templateUrl: './donacion-details.html',
})
export class DonacionDetails implements OnInit{
  donacion?: Donacion;
  id?: string;

  private notifications = inject(NotificationService);
  private confirmDialog = inject(ConfirmService);

  constructor(
    private donacionService: DonacionService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.params['id'];

    if (this.id) {
      this.donacionService.obtenerDonacionPorId(this.id).subscribe({
        next: (donacionEncontrada) => {
          this.donacion = donacionEncontrada;
          this.cdr.detectChanges();
        },
        error: (e) => {
          console.log(e);
          this.notifications.error('No se pudieron cargar los detalles de la donación.');
        }
      });
    }
  }

  async deleteDonacion() {
    const confirmado = await this.confirmDialog.ask({
      title: 'Eliminar donación',
      message: 'Se va a eliminar esta donación y sus datos asociados. Esta acción no se puede deshacer.',
      confirmLabel: 'Sí, eliminar'
    });

    if (!confirmado) return;

    this.donacionService.eliminarDonacion(this.id!).subscribe({
      next: () => {
        this.router.navigate(['/donaciones']);
      },
      error: (e) => {
        console.log(e);
      }
    });
  }

  confirmar() {
    if (!this.id) return;
    this.donacionService.confirmarDonacion(this.id).subscribe({
      next: (donacionActualizada) => {
        this.donacion = donacionActualizada;
        this.cdr.detectChanges();
      },
      error: (e) => {
        console.log(e);
      }
    });
  }
}
