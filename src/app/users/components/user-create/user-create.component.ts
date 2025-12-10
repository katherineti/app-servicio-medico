import { Component, inject } from '@angular/core';
import { MaterialModule } from '../../../material/material.module';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { SwalService } from '../../../services/swal.service';
import { UsersService } from '../../services/users.service';
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
  hidePassword = true;
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
      name: ['', [
        Validators.required, 
        Validators.maxLength(50),
      ]],
      cedulaType: ['V', [Validators.required]], 
      cedulaNumber: ['', [
        Validators.required,
        Validators.maxLength(10),
        Validators.pattern(/^[0-9]+$/) 
      ]],
      email: ['', [
        Validators.required, 
        Validators.email, 
        Validators.maxLength(50),
      ]],
      password: ['', [
        Validators.required, 
        Validators.minLength(10),
        Validators.maxLength(16), 
        this.passwordValidator 
      ]],
      role: ["", [Validators.required]],
    });

  }
  get passwordValue(): string {
    return this.userFormGroup.controls['password'].value || '';
  }
  get hasMinLength(): boolean {
    const value = this.passwordValue;
    return value.length >= 10 && value.length <= 16;
  }
  get hasUppercase(): boolean {
    return /[A-Z]/.test(this.passwordValue);
  }
  get hasNumber(): boolean {
    return /[0-9]/.test(this.passwordValue);
  }
  get hasSpecialChar(): boolean {
    return /[.*\-%\/]/.test(this.passwordValue);
  }
  get hasNoConsecutiveLetters(): boolean {
    const value = this.passwordValue;
    for (let i = 0; i < value.length - 1; i++) {
      const currentChar = value[i].toLowerCase();
      const nextChar = value[i + 1].toLowerCase();
      if (/[a-z]/.test(currentChar) && /[a-z]/.test(nextChar)) {
        if (currentChar === nextChar) {
          return false;
        }
      }
    }
    return true;
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
    const fullCedula = `${this.userFormGroup.value.cedulaType}-${this.userFormGroup.value.cedulaNumber}`;
    this.usersService
      .createUser({
        ...params,
        cedula: fullCedula
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
    });
  }
  passwordValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) {
      return null; 
    }

    const errors: ValidationErrors = {};
    if (!/[A-Z]/.test(value)) {
      errors['invalidPassword'] = true;
    }
    if (!/[0-9]/.test(value)) {
      errors['invalidPassword'] = true;
    }
    if (!/[.*\-%\/]/.test(value)) {
      errors['invalidPassword'] = true;
    }
    for (let i = 0; i < value.length - 1; i++) {
      const currentChar = value[i].toLowerCase();
      const nextChar = value[i + 1].toLowerCase();
      if (/[a-z]/.test(currentChar) && /[a-z]/.test(nextChar)) {
        if (currentChar === nextChar) {
          errors['invalidPassword'] = true;
          break;
        }
      }
    }
    return Object.keys(errors).length ? errors : null;
  }
}