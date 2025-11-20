import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MaterialModule } from '../material/material.module';
import {
  AbstractControl, 
  FormBuilder, 
  FormGroup, 
  FormsModule, 
  ReactiveFormsModule, 
  ValidationErrors, 
  Validators 
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { SwalService } from '../services/swal.service';
import { PasswordRecoveryService } from '../forgot-password/password-recovery.service';
import { ResetPasswordDto } from '../forgot-password/reset-password.dto';

@Component({
  selector: 'app-reset-password',
  imports: [CommonModule, RouterModule, MaterialModule, FormsModule, ReactiveFormsModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss',
  providers: [PasswordRecoveryService, SwalService]
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordFormGroup: FormGroup;
  isLoading = false;
  hideNewPassword = true;
  hideConfirmPassword = true;
  token = '';
  resetSuccess = false;

  private formBuilder = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  router = inject(Router);
  swalService = inject(SwalService);
  passwordRecoveryService = inject(PasswordRecoveryService);

  constructor() {
    this.resetPasswordFormGroup = this.formBuilder.group({
      newPassword: ['', [
        Validators.required, 
        Validators.minLength(10), 
        Validators.maxLength(16), 
        this.passwordValidator
      ]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordsMatchValidator });
  }

  ngOnInit() {
    // Obtener token de la URL query params
    this.route.queryParams.subscribe(params => {
      this.token = params['token'] || '';
      
      if (!this.token) {
        this.swalService.error('Error', 'Token de restablecimiento no válido.');
        this.router.navigate(['/login']);
      }
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
      errors['noUpperCase'] = true;
    }

    // Verificar número
    if (!/[0-9]/.test(value)) {
      errors['noNumber'] = true;
    }

    // Verificar carácter especial (. * - % /)
    if (!/[.*\-%/]/.test(value)) {
      errors['noSpecialChar'] = true;
    }

    // Verificar que no tenga letras iguales consecutivas
    for (let i = 0; i < value.length - 1; i++) {
      const currentChar = value[i].toLowerCase();
      const nextChar = value[i + 1].toLowerCase();

      if (/[a-z]/.test(currentChar) && /[a-z]/.test(nextChar)) {
        if (currentChar === nextChar) {
          errors['consecutiveLetters'] = true;
          break;
        }
      }
    }

    return Object.keys(errors).length ? errors : null;
  }

  // Validador para verificar que las contraseñas coincidan
  passwordsMatchValidator(group: AbstractControl): ValidationErrors | null {
    const newPassword = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    
    return newPassword === confirmPassword ? null : { passwordsMismatch: true };
  }

  // Métodos para verificar requisitos individuales
  get hasUpperCase(): boolean {
    const value = this.resetPasswordFormGroup.get('newPassword')?.value || '';
    return /[A-Z]/.test(value);
  }

  get hasNumber(): boolean {
    const value = this.resetPasswordFormGroup.get('newPassword')?.value || '';
    return /[0-9]/.test(value);
  }

  get hasSpecialChar(): boolean {
    const value = this.resetPasswordFormGroup.get('newPassword')?.value || '';
    return /[.*\-%/]/.test(value);
  }

  get hasNoConsecutive(): boolean {
    const value = this.resetPasswordFormGroup.get('newPassword')?.value || '';
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

  get hasValidLength(): boolean {
    const value = this.resetPasswordFormGroup.get('newPassword')?.value || '';
    return value.length >= 10 && value.length <= 16;
  }

  get passwordsMatch(): boolean {
    const newPassword = this.resetPasswordFormGroup.get('newPassword')?.value;
    const confirmPassword = this.resetPasswordFormGroup.get('confirmPassword')?.value;
    return newPassword === confirmPassword && confirmPassword.length > 0;
  }

  async resetPassword() {
    if (this.isLoading || this.resetPasswordFormGroup.invalid) {
      return;
    }

    this.isLoading = true;

    const dto: ResetPasswordDto = {
      token: this.token,
      newPassword: this.resetPasswordFormGroup.value.newPassword,
      confirmPassword: this.resetPasswordFormGroup.value.confirmPassword,
    };

    try {
      const response = await firstValueFrom(
        this.passwordRecoveryService.resetPassword(dto)
      );

      if (response.ok) {
        this.resetSuccess = true;
        this.swalService.successEdit('Éxito', 'Tu contraseña ha sido restablecida correctamente.');
        
        // Redirigir al login después de 2 segundos
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      }
    } catch (error: any) {
      this.swalService.error('Error', error?.message || 'No se pudo restablecer la contraseña. El token puede haber expirado.');
    } finally {
      this.isLoading = false;
    }
  }

  backToLogin() {
    this.router.navigate(['/login']);
  }
}
