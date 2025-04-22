import { CommonModule } from '@angular/common';
import { Component, Inject, inject } from '@angular/core';
import { MaterialModule } from '../material/material.module';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { SwalService } from '../services/swal.service';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { BreakpointObserver } from '@angular/cdk/layout';
import { FeatherIconsModule } from '../feathericons/feathericons.module';
import { MatSnackBar } from '@angular/material/snack-bar';

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

  current_user_role = 'Administrador';
  ROL_ADMIN = 'Administrador';
  ROL_ALMACEN = 'Almacen';
  ROL_MEDICO = 'Medico';
  ROL_AUDITOR = 'Auditor';
  PERMISSION_GESTIONAR= 'Gestionar';
  PERMISSION_REGISTRAR= 'Registrar';
  PERMISSION_CONSULTAR= 'Consultar';
  PERMISSION_GENERAR= 'Generar';
  checked = false;
  imagenDeFondo = 'https://images.rawpixel.com/image_800/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIyLTA2L3JtMzQ3LXBvcnBsYS0wMS1lXzEta2ttZDF2eTQuanBn.jpg';

  ROLES_DATA:Element[]=[];

  private swalService = inject(SwalService);
  private readonly formBuilder = inject(FormBuilder);

  rolFormGroup!: FormGroup;
  displayedColumns:any
  dataSource:any

  private snackBar = inject(MatSnackBar);
  
  constructor(breakpointObserver: BreakpointObserver, public dialog: MatDialog, public dialogRef: MatDialogRef<RolDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {

    this.getdata();

    this.rolFormGroup = this.formBuilder.group({
      roles: this.formBuilder.array(
        this.ROLES_DATA.map(item=>this.createFormGroup(item))
      )
    });
    console.log("form",this.rolFormGroup)

    this.displayedColumns = [ '#', 'module'];
    this.dataSource = new MatTableDataSource((this.rolFormGroup.get('roles') as FormArray)?.controls);

    if(this.ROLES_DATA[0].role === this.ROL_ADMIN){
        this.displayedColumns =  [ '#', 'module', 'Gestionar Usuarios', 'Gestionar Roles', 'Gestionar Configuración'];
    }
    else if(this.ROLES_DATA[0].role == this.ROL_ALMACEN){
    this.displayedColumns = [ '#', 'module', 'Entradas de insumos','Salidas de insumos'];

    } 
    else if(this.ROLES_DATA[0].role == this.ROL_MEDICO){
    this.displayedColumns = [ '#', 'module', 'Consultar'];
    } 
    else if(this.ROLES_DATA[0].role == this.ROL_AUDITOR){
    this.displayedColumns = [ '#', 'module', 'Consultar', 'Generar'];
    } 
  }

  getdata(){

    if(this.data.rol=="Administrador"){

     return this.ROLES_DATA= [
        {
          id: 1,
          role: 'Administrador',
          module: 'Usuarios', 
          permission: 'Gestionar', 
          gestionarUsuarios: true,
          gestionarRoles: false,
          gestionarConfig: false, 
          registroEntradaInsumos: false, 
          registroSalidaInsumos: false,
          disponibilidadInsumos: false ,
          consultarRegistros: false,
          generarReporte:false
        },
        {
          id: 2,
          role: 'Administrador',
          module: 'Roles', 
          permission: 'Gestionar', 
          gestionarUsuarios: false,
          gestionarRoles: true,
          gestionarConfig: false, 
          registroEntradaInsumos: false, 
          registroSalidaInsumos: false,
          disponibilidadInsumos: false ,
          consultarRegistros: false,
          generarReporte:false

        },
        {
          id: 3,
          role: 'Administrador',
          module: 'Configuración', 
          permission: 'Gestionar', 
          gestionarUsuarios: false,
          gestionarRoles: false,
          gestionarConfig: true, 
          registroEntradaInsumos: false, 
          registroSalidaInsumos: false,
          disponibilidadInsumos: false ,
          consultarRegistros: false,
          generarReporte:false
        },
      ];

    }else if (this.data.rol=="Almacen"){
      return this.ROLES_DATA = [
        {
          id: 1,
          role: 'Almacen',
          module: 'Entradas de insumos', 
          permission: 'Registrar', 
          gestionarUsuarios: false,
          gestionarRoles: false,
          gestionarConfig: false, 
          registroEntradaInsumos: true, 
          registroSalidaInsumos: false,
          disponibilidadInsumos: false ,
          consultarRegistros: false,
          generarReporte:false
        },
        {
          id: 2,
          role: 'Almacen',
          module: 'Salidas de insumos', 
          permission: 'Registrar', 
          gestionarUsuarios: false,
          gestionarRoles: false,
          gestionarConfig: false, 
          registroEntradaInsumos: false, 
          registroSalidaInsumos: true,
          disponibilidadInsumos: false ,
          consultarRegistros: false,
          generarReporte:false
        }
      ];
    }else if (this.data.rol=="Medico"){
      return this.ROLES_DATA = [
        {
          id: 1,
          role: 'Medico',
          module: 'Disponibilidad de insumos', 
          permission: 'Consultar', 
          gestionarUsuarios: false,
          gestionarRoles: false,
          gestionarConfig: false, 
          registroEntradaInsumos: false, 
          registroSalidaInsumos: false,
          disponibilidadInsumos:true,
          consultarRegistros: false,
          generarReporte:false
        }
      ];
    }else if (this.data.rol=="Auditor"){
      return this.ROLES_DATA = [
        {
          id: 1,
          role: 'Auditor',
          module: 'Registros', 
          permission: 'Consultar', 
          gestionarUsuarios: false,
          gestionarRoles: false,
          gestionarConfig: false, 
          registroEntradaInsumos: false, 
          registroSalidaInsumos: false,
          disponibilidadInsumos: false ,
          consultarRegistros: true,
          generarReporte:false
        },
         {
          id: 2,
          role: 'Auditor',
          module: 'Reportes', 
          permission: 'Generar', 
          gestionarUsuarios: false,
          gestionarRoles: false,
          gestionarConfig: false, 
          registroEntradaInsumos: false, 
          registroSalidaInsumos: false,
          disponibilidadInsumos: false ,
          consultarRegistros: false,
          generarReporte:true
        }, 
      ];
    }else{
      return this.ROLES_DATA = [];
    }
  }

  createFormGroup(item:any){
    return this.formBuilder.group({
      id: item.id,
      role: item.role,
      module:  new FormControl({ value: item.module, disabled: true }), 
      gestionarUsuarios: item.gestionarUsuarios,
      gestionarRoles: item.gestionarRoles,
      gestionarConfig: item.gestionarConfig,
      registroEntradaInsumos: item.registroEntradaInsumos,
      registroSalidaInsumos: item.registroSalidaInsumos,
      disponibilidadInsumos: item.disponibilidadInsumos,
      consultarRegistros:item.consultarRegistros,
      generarReporte:item.generarReporte,
    })
  }

  get rolesFormArray(){
    return this.rolFormGroup.controls['roles'];
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  closeDialog(): void | null {
    this.dialogRef.close({ event: 'Cancel' });
  }

  save(){
    if(this.data){
      console.log(
        this.rolesFormArray.value
      );
    }
    this.openSnackBar("Guardado",undefined)
  }

  openSnackBar(message: string, action: string | undefined) {
    let durationInSeconds = 5;
    this.snackBar.open(message, action, {
      duration: durationInSeconds * 1000,
    });
  }
}