import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Empresa } from '../../../models/empresa';
import { EmpresaService } from '../../../services/empresas/empresa';
import { NotificationService } from '../../../service/notification-service';

@Component({
  imports: [ReactiveFormsModule, RouterLink],
  selector: 'app-empresa-form',
  styleUrl: './empresa-form.css',
  templateUrl: './empresa-form.html',
})
export class EmpresaForm implements OnInit{

  formulario!: FormGroup;
  id ?: string;

  private notifications = inject(NotificationService);

  constructor(
    private fb : FormBuilder,
    private empresaService : EmpresaService, 
    private route : ActivatedRoute,
    private router : Router
  ){}

  ngOnInit(): void {
    this.formulario = this.fb.group({
      razon_social : ['', [Validators.required]],
      cuit : ['',[Validators.required, Validators.minLength(11), Validators.maxLength(11), Validators.pattern('^[0-9]+$')]],
      telefono: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(11), Validators.pattern('^[0-9]+$')]],
      email: ['', [Validators.required, Validators.email]],
      direccion: ['', [Validators.required]]
    })

    this.id= this.route.snapshot.params['id'];


    if(this.id){
      //modo edicion
      this.empresaService.obtenerEmpresaPorId(this.id).subscribe({
        next : (empresaEncontrada) => this.formulario.patchValue(empresaEncontrada),
        error : (e) => {
          console.log(e);
          this.notifications.error('No se pudieron cargar los datos de la empresa.')
        }
      })
    }
  }

  onSubmit(): void{
    if(this.formulario.invalid){
      this.formulario.markAllAsTouched();
      this.notifications.error('Revisá los datos: hay campos vacíos o con formato inválido.')
      return;
    }

    const dataForm : Empresa = {...this.formulario.value};

    if(this.id){
      this.empresaService.editarEmpresa( {...dataForm, id : this.id} ).subscribe({
        next : () => {
          this.router.navigate(['/empresas', this.id])
        }, 
        error : (e) => {
          console.log(e);
        }
      })
    }else{

      this.empresaService.crearEmpresa(dataForm).subscribe({
        next : (data) =>{
          this.router.navigate(['/empresas', data.id])
        },
        error :(e) =>{
          console.log(e);
        }
      })

    }
  }
}
