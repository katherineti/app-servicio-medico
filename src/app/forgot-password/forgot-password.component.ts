import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { MaterialModule } from '../material/material.module';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { SwalService } from '../services/swal.service';
import { PasswordRecoveryService } from './password-recovery.service';
import { ForgotPasswordDto } from './forgot-password.dto';
// import { PasswordRecoveryService } from '../../core/services/password-recovery.service';
// import { SwalService } from '../../services/swal.service';
// import type { ForgotPasswordDto } from '../../shared/models/forgot-password.dto';

@Component({
  selector: 'app-forgot-password',
  imports: [CommonModule, RouterModule, MaterialModule, FormsModule, ReactiveFormsModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss',
  providers: [PasswordRecoveryService, SwalService]
})
 export class ForgotPasswordComponent {
   forgotPasswordFormGroup: FormGroup;
   isLoading = false;
   emailSent = false; // Track if email was sent successfully
   sentEmail = ''; // Store sent email for display

   private formBuilder = inject(FormBuilder);
   router = inject(Router);
   swalService = inject(SwalService);
   passwordRecoveryService = inject(PasswordRecoveryService);

  constructor() {
    this.forgotPasswordFormGroup = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email, Validators.maxLength(50)]],
    });
  }

  async sendRecoveryEmail() {
    if (this.isLoading || this.forgotPasswordFormGroup.invalid) {
      return;
    }

    this.isLoading = true;

    const dto: ForgotPasswordDto = {
      email: this.forgotPasswordFormGroup.value.email,
    };

    try {
      const response = await firstValueFrom(
        this.passwordRecoveryService.forgotPassword(dto)
      );

      if (response.ok) {
        this.emailSent = true;
        this.sentEmail = dto.email;
        this.swalService.successEdit('Éxito', 'Hemos enviado un enlace de restablecimiento a tu correo.');
      }
    } catch (error: any) {
      this.swalService.error('Error', error || 'No se pudo enviar el correo. Intenta de nuevo.');
    } finally {
      this.isLoading = false;
    }
  }

  backToLogin() {
    this.router.navigate(['/login']);
  }

  resendEmail() {
    this.emailSent = false;
    this.forgotPasswordFormGroup.reset();
  }
}
