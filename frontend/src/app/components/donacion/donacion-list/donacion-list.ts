import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Donacion } from '../../../interfaces/donacion';
import { DonacionService } from '../../../service/donacion-service';
import { NotificationService } from '../../../service/notification-service';
import { ConfirmService } from '../../../service/confirm-service';

@Component({
  imports: [RouterLink, FormsModule, CommonModule],
  selector: 'app-donacion-list',
  styleUrl: './donacion-list.css',
  templateUrl: './donacion-list.html',
})
export class DonacionList implements OnInit{
  donaciones = signal<Donacion[]>([]);
  filtroDonacion = '';

  private notifications = inject(NotificationService);
  private confirmDialog = inject(ConfirmService);

  constructor(private donacionService: DonacionService) {}

  ngOnInit(): void {
    this.cargarDonaciones();
  }

  cargarDonaciones() {
    this.donacionService.obtenerDonaciones().subscribe({
      next: (data) => {
        this.donaciones.set(data);
      },
      error: (e) => {
        console.log(e);
        this.notifications.error('No se pudieron cargar las donaciones.');
      }
    });
  }

  async eliminarDonacion(id: number) {
    const confirmado = await this.confirmDialog.ask({
      title: 'Eliminar donación',
      message: `Se va a eliminar la donación N° ${id}. Esta acción no se puede deshacer.`,
      confirmLabel: 'Sí, eliminar'
    });

    if (!confirmado) return;

    this.donacionService.eliminarDonacion(id).subscribe({
      next: () => {
        this.cargarDonaciones();
      },
      error: (e) => {
        console.log(e);
      }
    });
  }

  confirmar(id: number) {
    this.donacionService.confirmarDonacion(id).subscribe({
      next: () => {
        this.cargarDonaciones();
      },
      error: (e) => {
        console.log(e);
      }
    });
  }

  get donacionesFiltradas() {
    const lista = this.donaciones();
    const filtro = this.filtroDonacion.toLowerCase().trim();

    if (!filtro) {
      return lista;
    } else {
      return lista.filter(donacion => {
        const idCoincide = donacion.id?.toString().toLowerCase().includes(filtro);
        const estadoCoincide = String(donacion.estado || '').toLowerCase().includes(filtro);
        const remitoCoincide = donacion.nroRemitoProveedor?.toString().toLowerCase().includes(filtro);
        const observacionesCoincide = donacion.observaciones?.toLowerCase().includes(filtro);
        const donanteCoincide = donacion.nombreDonante?.toLowerCase().includes(filtro);

        return idCoincide || estadoCoincide || remitoCoincide || observacionesCoincide || donanteCoincide;
      });
    }
  }
}
