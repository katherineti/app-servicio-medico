import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { MaterialModule } from '../material/material.module';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { LoginResponse, SigInLogin } from '../authentication/models/login.response.model';
import { firstValueFrom } from 'rxjs';
import { SwalService } from '../services/swal.service';
import { LoginService } from '../services/login.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [CommonModule,RouterModule, MaterialModule, FormsModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  providers: [LoginService, SwalService]
})
export class LoginComponent {
  public loginFormGroup: FormGroup;
  
  private formBuilder = inject(FormBuilder);
  public router = inject(Router);
  public swalService = inject(SwalService);
  public loginService = inject(LoginService);

  constructor(){
    this.loginFormGroup = this.formBuilder.group({
      email: [
        '', 
      [
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

  // Validador personalizado para la contraseña
  passwordValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    
    if (!value) {
      return null;
    }

    const errors: ValidationErrors = {};

    // Verificar mayúscula
    if (!/[A-Z]/.test(value)) {
      errors['invalidPassword'] = true;
    }

    // Verificar número
    if (!/[0-9]/.test(value)) {
      errors['invalidPassword'] = true;
    }

    // Verificar carácter especial (. * - % /)
    if (!/[.*\-\%\/]/.test(value)) {
      errors['invalidPassword'] = true;
    }

    // Verificar que no tenga letras iguales consecutivas
    for (let i = 0; i < value.length - 1; i++) {
      const currentChar = value[i].toLowerCase();
      const nextChar = value[i + 1].toLowerCase();
      
      // Solo verificar si ambos caracteres son letras
      if (/[a-z]/.test(currentChar) && /[a-z]/.test(nextChar)) {
        if (currentChar === nextChar) {
          errors['invalidPassword'] = true;
          break;
        }
      }
    }

    return Object.keys(errors).length ? errors : null;
  }

  async login() {
    localStorage.removeItem('token');
    let login: SigInLogin = {
      password: this.loginFormGroup.value.password,
      email: this.loginFormGroup.value.email,
    };

    try {
      let item: LoginResponse = await firstValueFrom(
        this.loginService.login(login)
      );

      localStorage.setItem('token', item.token);
      await this.router.navigate(['/']);

    } catch (e: any) {
      this.swalService.warningEdit('Verifique', e);
    }
  }
}