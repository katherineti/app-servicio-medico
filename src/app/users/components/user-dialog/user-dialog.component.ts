import { Component, Inject, inject, OnInit } from '@angular/core';
import { MaterialModule } from '../../../material/material.module';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SwalService } from '../../../services/swal.service';
import { UsersService } from '../../services/users.service';
import { IUser } from '../../interfaces/users.interface';

@Component({
  selector: 'app-user-dialog',
  imports: [CommonModule,MaterialModule,FormsModule,ReactiveFormsModule],
  templateUrl: './user-dialog.component.html',
  styleUrl: './user-dialog.component.scss',
  providers: [UsersService]
})

export class UserDialogComponent implements OnInit {
  readonly dialogRef = inject(MatDialogRef<UserDialogComponent>);
  userFormGroup!: FormGroup;
  imageField?: File;
  imgBase64?: any;
  selectedUser!: IUser;
  disableButton: boolean = false;
  typeError = '';
  edit:boolean | undefined;
  listRolesActives!: {id:number,name:string}[];

  private formBuilder = inject(FormBuilder);
  private swalService = inject(SwalService);
  private usersService = inject(UsersService);

  constructor( 
    @Inject(MAT_DIALOG_DATA) public data: IUser){
    this.buildEditUserForm();
    this.getRolesActives();
  }

  async ngOnInit() {

    this.selectedUser = this.data;
    this.edit = this.data.actionEdit;
    if (this.data) {
      this.setForm();
    }
  }

  get checkPropId() {
    if (this.selectedUser?.id !== null && this.selectedUser?.id !== undefined) {
      return true;
    }
    console.log("Falta id")
    return false;
  }

  buildEditUserForm() {
    this.userFormGroup = this.formBuilder.group({
      name: ['', [
        Validators.required, 
        Validators.maxLength(50),
      ]],
      // Nuevo control para el tipo de cédula (V o E)
      cedulaType: ['V', [Validators.required]], // Valor por defecto 'V'
      // Control para el número de cédula, solo números
      cedulaNumber: ['', [
        Validators.required,
        Validators.maxLength(10),
        Validators.pattern(/^[0-9]+$/) // Solo números
      ]],
      email: ['', [
        Validators.required, 
        Validators.email, 
        Validators.maxLength(50),
      ]],
      isActive: [
        '',
        [
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(20),
        ],
      ],
      role: ['', [Validators.required]],
    });
  }

  setForm() {
    console.log("this.selectedUser " , this.selectedUser) 
    if(!this.edit){
      this.userFormGroup.controls['name'].disable();
      this.userFormGroup.controls['isActive'].disable();
      this.userFormGroup.controls['role'].disable();
    }
    
    this.userFormGroup.controls['email'].disable();
    this.userFormGroup.controls['cedulaType'].disable();
    this.userFormGroup.controls['cedulaNumber'].disable();

/*  this.userFormGroup.patchValue({
      name: this.selectedUser?.name,
      email: this.selectedUser?.email,
      isActive: this.selectedUser?.isActivate,
      role: this.selectedUser?.roleId,
    }); */

    const cedulaValue = this.selectedUser?.cedula; //cedula: "V-0002020"

    // Comprueba si cedulaValue existe y es una cadena con un guion
    if (cedulaValue && cedulaValue.includes('-')) {
      const parts = cedulaValue.split('-');
      this.userFormGroup.patchValue({
        name: this.selectedUser?.name,
        email: this.selectedUser?.email,
        isActive: this.selectedUser?.isActivate,
        role: this.selectedUser?.roleId,
        cedulaType: parts[0],
        cedulaNumber: parts[1],
      });
    } else {
      // Manejar el caso donde no existe cédula o está en un formato inesperado
      this.userFormGroup.patchValue({
        name: this.selectedUser?.name,
        email: this.selectedUser?.email,
        isActive: this.selectedUser?.isActivate,
        role: this.selectedUser?.roleId,
        cedulaType: 'V', 
        cedulaNumber: this.selectedUser?.cedula || null, // Or null, or ""
      });
    }

  }

  cancel() {
    this.closeDialog();
  }

  closeDialog(): void | null {
    this.dialogRef.close({ event: 'Cancel' });
  }

  saveUser() {
    if (this.checkPropId) {
      return this.updateUser();
    }
  }

  private updateUser() {
    this.swalService.loading();
    this.disableButton = true;
    if (this.userFormGroup.invalid) {
      this.swalService.closeload();
      this.disableButton = false;
      return;
    }
    const { name, role, isActive } = this.userFormGroup.value;
    const id = this.selectedUser.id;

    this.usersService
      .updateUser(
        id, 
        {
          name, 
          role,
          isActivate: isActive,
        })
      .subscribe({
        next: () => {
          this.swalService.closeload();
          this.swalService.success();
          this.disableButton = false;
          this.closeDialog();
        },
        error: (error) => {
          console.log("Error ", error)
          this.swalService.closeload();
          this.disableButton = false;
          this.swalService.error('Error', error);
        },
      });
  }

  getRolesActives() {
    this.usersService.getRolesActives().subscribe((data: any) => {
      this.listRolesActives = data;
    });
  }

}