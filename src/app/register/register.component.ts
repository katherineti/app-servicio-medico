import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MaterialModule } from '../material/material.module';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { SignUpRegisterAdmin } from '../authentication/models/register-admin.reponse.model';
import { LoginService } from '../services/login.service';
import { SwalService } from '../services/swal.service'; 

@Component({
  selector: 'app-register',
  imports: [CommonModule,RouterModule,MaterialModule,FormsModule,ReactiveFormsModule,],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
  providers: [LoginService, SwalService] 
})
export class RegisterComponent {
  ADMINISTRADOR = 1;
  registerFormGroup!: FormGroup;
  typeError = '';
  conflictDetected: boolean = false;
  hidePassword = true;
  public isLoading = false; 

  private formBuilder = inject(FormBuilder);
  public router = inject(Router);
  public route = inject(ActivatedRoute);
  public loginService = inject(LoginService);
  public swalService = inject(SwalService);

  constructor(){
    this.registerFormGroup = this.formBuilder.group({
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
    });
  }
  get passwordValue(): string {
    return this.registerFormGroup.controls['password'].value || '';
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

  onPasswordChange() {
  }

  async register() {
    if (this.isLoading || this.registerFormGroup.invalid) {
      return;
    }

    this.isLoading = true; 
    localStorage.removeItem('token'); 
    const fullCedula = `${this.registerFormGroup.value.cedulaType}-${this.registerFormGroup.value.cedulaNumber}`;
    const register: SignUpRegisterAdmin = {
      name: this.registerFormGroup.value.name,
      email: this.registerFormGroup.value.email,
      password: this.registerFormGroup.value.password,
      role: this.ADMINISTRADOR,
      cedula: fullCedula,
    };
    try {
      await firstValueFrom(this.loginService.register(register));
      this.swalService.success(); 
      this.router.navigate(['/login']);
    } catch (error: any) {
      this.typeError = ''; 
      this.conflictDetected = false;
        if(error){
          this.swalService.closeload();
          this.swalService.error('Error', error);
        }else{
          this.swalService.error('Error de Registro', 'Ocurrió un error inesperado. Por favor, inténtalo de nuevo.'); 
        }
      console.error('Error durante el registro:', error);
    } finally {
      this.isLoading = false; 
    }
  }
}
