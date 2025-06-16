import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MaterialModule } from '../material/material.module';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { SignUpRegisterAdmin } from '../authentication/models/register-admin.reponse.model';
import { LoginService } from '../services/login.service';

@Component({
  selector: 'app-register',
  imports: [CommonModule,RouterModule,MaterialModule,FormsModule,ReactiveFormsModule,],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
  providers: [LoginService]
})
export class RegisterComponent {
  ADMINISTRADOR = 1;
  registerFormGroup!: FormGroup;
  typeError = '';
  conflictDetected: boolean = false;
  hidePassword = true; // Nueva propiedad para controlar la visibilidad de la contraseña

  private formBuilder = inject(FormBuilder);
  public router = inject(Router);
  public route = inject(ActivatedRoute);
  public loginService = inject(LoginService);
  
  constructor(){
    this.registerFormGroup = this.formBuilder.group({
      name: ['', [
        Validators.required, 
        Validators.minLength(0), 
        Validators.maxLength(50),
      ]],
      email: ['', [
        Validators.required, 
        Validators.email,
        Validators.maxLength(50),
      ]],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(16),
          this.passwordValidator
        ],
      ],
    });
  }

  // Método para alternar la visibilidad de la contraseña
  togglePasswordVisibility() {
    this.hidePassword = !this.hidePassword;
  }

  // Validador personalizado para la contraseña
  passwordValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    
    if (!value) {
      return null;
    }

    const errors: ValidationErrors = {};

    // Verificar mayúscula
    if (!/[A-Z]/.test(value)) {
      errors['noUppercase'] = true;
    }

    // Verificar número
    if (!/[0-9]/.test(value)) {
      errors['noNumber'] = true;
    }

    // Verificar carácter especial (. * - % /)
    if (!/[.*\-\%\/]/.test(value)) {
      errors['noSpecialChar'] = true;
    }

    // Verificar que no tenga letras iguales consecutivas
    for (let i = 0; i < value.length - 1; i++) {
      const currentChar = value[i].toLowerCase();
      const nextChar = value[i + 1].toLowerCase();
      
      // Solo verificar si ambos caracteres son letras
      if (/[a-z]/.test(currentChar) && /[a-z]/.test(nextChar)) {
        if (currentChar === nextChar) {
          errors['consecutiveLetters'] = true;
          break;
        }
      }
    }

    return Object.keys(errors).length ? errors : null;
  }

  // Métodos para verificar cada validación individualmente
  get passwordValue(): string {
    return this.registerFormGroup.get('password')?.value || '';
  }

  get hasMinLength(): boolean {
    return this.passwordValue.length >= 10;
  }

  get hasMaxLength(): boolean {
    return this.passwordValue.length <= 16;
  }

  get hasUppercase(): boolean {
    return /[A-Z]/.test(this.passwordValue);
  }

  get hasNumber(): boolean {
    return /[0-9]/.test(this.passwordValue);
  }

  get hasSpecialChar(): boolean {
    return /[.*\-\%\/]/.test(this.passwordValue);
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

  async register() {
    localStorage.removeItem('token'); 

    let register: SignUpRegisterAdmin = {
      name: this.registerFormGroup.value.name,
      email: this.registerFormGroup.value.email,
      password: this.registerFormGroup.value.password,
      role: this.ADMINISTRADOR
    };

    try {
      await firstValueFrom(this.loginService.register(register));
      this.router.navigate(['./login']);
    } catch (error: any) {
      if (error.status === 400) {
        this.typeError = 'campos';
      } else if (error.status === 409) {
        this.typeError = 'conflicto';
        this.conflictDetected = true;
      } else {
        this.typeError = 'server';
        console.log("Error: " , error);
      }
    }
  }
}