import { Component, Inject, inject } from '@angular/core';
import { MaterialModule } from '../material/material.module';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { SwalService } from '../services/swal.service';
import { UsersService } from '../users/services/users.service';
import { IRole } from '../rol/interfaces/roles.interface';

@Component({
  selector: 'app-user-create',
  imports: [CommonModule,MaterialModule,FormsModule,ReactiveFormsModule],
  templateUrl: './user-create.component.html',
  styleUrl: './user-create.component.scss'
})
export class UserCreateComponent {
  userFormGroup!: FormGroup;
  imageField?: File;
  imgBase64?: any;
  disableButton: boolean = false;
  listRolesActives!: {id:number,name:string}[];

  private formBuilder = inject(FormBuilder);
  private swalService = inject(SwalService);
  private usersService = inject(UsersService);

  constructor( 
    public dialogRef: MatDialogRef<UserCreateComponent>,
    ){
    this.buildAddUserForm();
    this.getRolesActives();
  }

  buildAddUserForm() {
    this.userFormGroup = this.formBuilder.group({
      name: [
        '',
        [
          Validators.required,
          Validators.minLength(0),
          Validators.maxLength(50),
          // Validators.pattern(/^[a-zA-ZÀ-ÿ\s]+$/)
        ],
      ],
      email: [
        '', 
      [
        Validators.required, 
        Validators.email,
        Validators.minLength(0), 
        Validators.maxLength(50),
      ]],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(0),
          Validators.maxLength(30),
          Validators.pattern(/^[a-zA-Z0-9]*$/),
        ],
      ],

      role: [""],
    });

  }

  cancel() {
    this.closeDialog();
  }

  closeDialog(): void | null {
    this.dialogRef.close({ event: 'Cancel' });
  }

  saveUser() {
    if (this.userFormGroup) {
      return this.createUser();
    }
  }

  private createUser() {
    this.swalService.loading();
    this.disableButton = true;

    if (this.userFormGroup.invalid) {
      this.swalService.closeload();
      this.disableButton = false;
      return;
    }
    const { ...params } = this.userFormGroup.value;
    this.usersService
      .createUser({
        ...params,
      })
      .subscribe({
        error: (msj) => {
          this.swalService.closeload();
          this.disableButton = false;
          this.swalService.error('Error', msj);
        },
        complete: () => {
          this.swalService.closeload();
          this.swalService.success();
          this.closeDialog();
          this.disableButton = false;
        },
      });
  }

  getRolesActives() {
    this.usersService.getRolesActives().subscribe((data: any) => {
      this.listRolesActives = data;
      console.log("LISTA DE ROLES ACTIVOS",data)
    });
  }
}