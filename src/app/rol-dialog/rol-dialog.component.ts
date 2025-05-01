import { CommonModule } from '@angular/common';
import { Component, Inject, inject } from '@angular/core';
import { MaterialModule } from '../material/material.module';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { SwalService } from '../services/swal.service';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { BreakpointObserver } from '@angular/cdk/layout';
import { FeatherIconsModule } from '../feathericons/feathericons.module';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RolesService } from '../rol/services/roles.service';
import { toast } from 'ngx-sonner';

export interface Element {
  id: number;
  role:string; //rol seleccionado Administrador
  module:string; //cada uno de los modulos del sistema/menus en el sistema. Ej:Dashboard
  permission:string;
  gestionarUsuarios:boolean;
  gestionarRoles:boolean;
  gestionarConfig:boolean;
  registroEntradaInsumos: boolean;
  registroSalidaInsumos: boolean;
  disponibilidadInsumos: boolean;
  consultarRegistros: boolean;
  generarReporte: boolean;
}

//Modal editar rol: Que antes de entrar en el dialog, ya este preseleccionada la data del rol del usuario en sesion. Solo se deben recibir los registros de un rol
  
@Component({
  selector: 'app-rol-dialog',
  templateUrl: './rol-dialog.component.html',
  styleUrl: './rol-dialog.component.scss',
  imports: [CommonModule, MaterialModule, FeatherIconsModule,FormsModule, ReactiveFormsModule],
})

export class RolDialogComponent {

  roleFormGroup!: FormGroup;
  disableButton: boolean = false;
  selectedRole!: any;
  modeEdit:boolean | undefined;
  
  readonly dialogRef = inject(MatDialogRef<RolDialogComponent>);
  private formBuilder = inject(FormBuilder);
  private swalService = inject(SwalService);
  private rolesService = inject(RolesService);

  private snackBar = inject(MatSnackBar);
  
  constructor(
    @Inject(MAT_DIALOG_DATA) 
         public data: any,
  ){
    this.buildAddUserForm();
  }

  async ngOnInit() {

    this.selectedRole = this.data;
    this.modeEdit = this.data.actionEdit; 

    if (this.data) {
      this.setForm();
    }
  }

  get checkPropId() {
    if (this.selectedRole?.id !== null && this.selectedRole?.id !== undefined) {
      return true;
    }
    console.log("falta id")
    return false;
  }

  buildAddUserForm() {
    this.roleFormGroup = this.formBuilder.group({
      role: [
        '',
        [
          Validators.required,
          Validators.minLength(0),
          Validators.maxLength(40),
        ],
      ],
      description: [
        '',
        [
          Validators.maxLength(50),
        ],
      ],
    });
  }

  setForm() {
    if(!this.modeEdit){
      this.roleFormGroup.controls['role'].disable();
      this.roleFormGroup.controls['description'].disable();
    }

    this.roleFormGroup.patchValue({
      id: this.selectedRole?.id,
      role: this.selectedRole?.name,
      description: this.selectedRole?.description,
      });

  }

  cancel() {
    this.closeDialog();
  }

  closeDialog(): void | null {
    this.dialogRef.close({ event: 'Cancel' });
  }

  save() {
    if (this.roleFormGroup || this.checkPropId) {
      return this.edit();
    }
  }

  private edit() {
    this.swalService.loading();
    this.disableButton = true;

    if (this.roleFormGroup.invalid) {
      this.swalService.closeload();
      this.disableButton = false;
      toast.error("Por favor, completa el formulario correctamente.");
      return;
    }
    const { role, description } = this.roleFormGroup.value;
    const id = this.selectedRole.id;

    this.rolesService
      .update(id, {
        name:role,
        description
      })
      .subscribe({
        error: (msj) => {
          this.disableButton = false;
          this.swalService.closeload();
          this.swalService.error('Error', msj);
        },
        complete: () => {
          this.disableButton = false;
          this.swalService.closeload();
          this.swalService.success();
          this.closeDialog();
        },
      });
  }

  openSnackBar(message: string, action: string | undefined) {
    let durationInSeconds = 5;
    this.snackBar.open(message, action, {
      duration: durationInSeconds * 1000,
    });
  }
}