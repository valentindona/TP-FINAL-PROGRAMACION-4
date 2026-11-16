import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { InstitucionService } from '../../../services/instituciones/institucion-service';
import { Institucion } from '../../../models/institucion';
import { AuthService } from '../../../service/auth-service';
import { NotificationService } from '../../../service/notification-service';
import { ConfirmService } from '../../../service/confirm-service';

@Component({
  imports: [RouterLink, CommonModule, FormsModule],
  selector: 'app-institucion-list',
  styleUrl: './institucion-list.css',
  templateUrl: './institucion-list.html',
})
export class InstitucionList implements OnInit{
  

  auth = inject(AuthService);
  instituciones = signal<Institucion[]>([]);
  readonly puedeCrear = this.auth.hasRole('USER_INSTITUCIONAL');
  readonly puedeEditar = this.auth.hasAnyRole(['USER_INSTITUCIONAL', 'USER_TESORERIA']);
  readonly puedeEliminar = this.auth.hasRole('USER_INSTITUCIONAL');
  readonly puedeVerAuditoria = this.auth.hasAuthority('AUDITORIA_INSTITUCION_VER');

  ////para la barra de navegacion
  filtroInstitucion = ''

  private notifications = inject(NotificationService);
  private confirmDialog = inject(ConfirmService);

  constructor(
    private iService : InstitucionService
  ){}

  ngOnInit(): void {
    this.cargarInstituciones();
  }

  cargarInstituciones(){
    this.iService.obtenerInstituciones().subscribe({
      next : (data) => {
        this.instituciones.set(data);
      },
      error : (e) => {
        console.log(e);
        this.notifications.error('No se pudieron cargar las instituciones.')
      }
    })
  }

  async eliminarInstitucion( id : string){
    const confirmado = await this.confirmDialog.ask({
      title: 'Eliminar institución',
      message: `Se va a eliminar la institución con ID ${id}. Esta acción no se puede deshacer.`,
      confirmLabel: 'Sí, eliminar'
    });

    if (confirmado) {
      this.iService.eliminarInstitucion(id).subscribe({
        next : () => {
          this.cargarInstituciones();
        },
        error : (e) => {
          console.log(e);
        }
      })
    }
  }

/*   get institucionesFiltradasXnombre(){
    const lista= this.instituciones();

    if(this.filtradoNombre){
      return lista.filter(e => e.nombre.toLocaleLowerCase().includes(this.filtradoNombre.toLocaleLowerCase()))
    }else{
      return lista;
    }
  } */

    get institucionesFiltradas() {
      const lista = this.instituciones();
      const filtro = this.filtroInstitucion.toLowerCase().trim();

      if (!filtro) {
        return lista;
      } else {
        return lista.filter(institucion => {
        const idCoincide = institucion.id?.toString().toLowerCase().includes(filtro);
        const nombreCoincide = institucion.nombre?.toLowerCase().includes(filtro);
        const tipoCoincide = String(institucion.tipo || '').toLowerCase().includes(filtro);        const direccionCoincide = institucion.direccion?.toLowerCase().includes(filtro);
        const emailCoincide = institucion.email?.toLowerCase().includes(filtro);
        const telefonoCoincide = institucion.telefono?.toLowerCase().includes(filtro);

        return idCoincide || nombreCoincide || tipoCoincide || direccionCoincide || emailCoincide || telefonoCoincide; });
      }
    }
}
