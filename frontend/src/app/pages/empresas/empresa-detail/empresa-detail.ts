import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Empresa } from '../../../models/empresa';
import { EmpresaService } from '../../../services/empresas/empresa';
import { NotificationService } from '../../../service/notification-service';
import { ConfirmService } from '../../../service/confirm-service';

@Component({
  imports: [RouterLink],
  selector: 'app-empresa-detail',
  styleUrl: './empresa-detail.css',
  templateUrl: './empresa-detail.html',
})
export class EmpresaDetail implements OnInit {
  
  empresa ?: Empresa;
  id ?: string

  private notifications = inject(NotificationService);
  private confirmDialog = inject(ConfirmService);

  constructor(
    private empresaService : EmpresaService,
    private route : ActivatedRoute,
    private router : Router,
    private cdr : ChangeDetectorRef
  ){}

  ngOnInit(): void {
    
    this.id= this.route.snapshot.params['id'];

    if(this.id){
      this.empresaService.obtenerEmpresaPorId(this.id).subscribe({
        next : (empresaEncontrada) =>{
          this.empresa = empresaEncontrada;
          this.cdr.detectChanges()
        },
        error : (e) => {
          console.log(e);
          this.notifications.error('No se pudieron cargar los detalles de la empresa.')
        }
      })
    }
  }


  async deleteEmpresa(){
    const confirmado = await this.confirmDialog.ask({
      title: 'Eliminar empresa',
      message: 'Se va a eliminar esta empresa del sistema. Esta acción no se puede deshacer.',
      confirmLabel: 'Sí, eliminar'
    });

    if (!confirmado) return;

    this.empresaService.eliminarEmpresa(this.id!).subscribe({
      next : () => {
        this.router.navigate(['/empresas']);
      },
      error : (e) => {
        console.log(e);
      }
    })
  }

}

