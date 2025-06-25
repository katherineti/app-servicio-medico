import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MaterialModule } from '../material/material.module';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { SignUpRegisterAdmin } from '../authentication/models/register-admin.reponse.model';
import { LoginService } from '../services/login.service';
import { SwalService } from '../services/swal.service'; // Asegúrate de importar SwalService si lo usas para notificaciones

@Component({
  selector: 'app-register',
  imports: [CommonModule,RouterModule,MaterialModule,FormsModule,ReactiveFormsModule,],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
  providers: [LoginService, SwalService] // Añade SwalService a providers si lo importaste
})
export class RegisterComponent {
  ADMINISTRADOR = 1;
  registerFormGroup!: FormGroup;
  typeError = '';
  conflictDetected: boolean = false;
  hidePassword = true; // Nueva propiedad para controlar la visibilidad de la contraseña
  public isLoading = false; // ✅ Agregada la propiedad isLoading

  private formBuilder = inject(FormBuilder);
  public router = inject(Router);
  public route = inject(ActivatedRoute);
  public loginService = inject(LoginService);
  public swalService = inject(SwalService); // ✅ Inyecta SwalService

  constructor(){
    this.registerFormGroup = this.formBuilder.group({
      name: ['', [
        Validators.required, 
        Validators.minLength(0), // Puedes quitar minLength(0) si no es necesario
        Validators.maxLength(50),
      ]],
      email: ['', [
        Validators.required, 
        Validators.email, 
        Validators.maxLength(50),
      ]],
      password: ['', [
        Validators.required, 
        Validators.minLength(10), // Mínimo 10 caracteres
        Validators.maxLength(16), // Máximo 16 caracteres
        this.passwordValidator // Validador personalizado para la contraseña
      ]],
    });
  }

  // Getter para acceder al valor de la contraseña
  get passwordValue(): string {
    return this.registerFormGroup.controls['password'].value || '';
  }

  // Propiedades para los requisitos de la contraseña (para la UI)
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

  // Validador personalizado para la contraseña
  passwordValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) {
      return null; // No validar si el campo está vacío, Validators.required ya lo maneja
    }

    const errors: ValidationErrors = {};

    // Mínimo 10 caracteres (ya cubierto por Validators.minLength)
    // Máximo 16 caracteres (ya cubierto por Validators.maxLength)

    // Al menos una mayúscula
    if (!/[A-Z]/.test(value)) {
      errors['invalidPassword'] = true;
    }

    // Al menos un número
    if (!/[0-9]/.test(value)) {
      errors['invalidPassword'] = true;
    }

    // Al menos uno de estos caracteres: . * - % /
    if (!/[.*\-%\/]/.test(value)) {
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

  onPasswordChange() {
    // Este método se llama cada vez que la contraseña cambia, actualizando los getters
    // No es necesario añadir lógica aquí a menos que quieras hacer algo adicional
  }

  async register() {
    // ✅ Prevenir múltiples clicks si ya está cargando o el formulario es inválido
    if (this.isLoading || this.registerFormGroup.invalid) {
      return;
    }

    this.isLoading = true; // ✅ Activar estado de carga al iniciar el registro
    localStorage.removeItem('token'); 

    const register: SignUpRegisterAdmin = {
      name: this.registerFormGroup.value.name,
      email: this.registerFormGroup.value.email,
      password: this.registerFormGroup.value.password,
      role: this.ADMINISTRADOR
    };

    try {
      await firstValueFrom(this.loginService.register(register));
      // this.swalService.success('Registro exitoso', 'Tu cuenta ha sido creada con éxito. Ahora puedes iniciar sesión.'); // ✅ Notificación de éxito
      this.swalService.success(); // ✅ Notificación de éxito
      this.router.navigate(['/login']);
    } catch (error: any) {
      this.typeError = ''; // Resetear el tipo de error
      this.conflictDetected = false; // Resetear la detección de conflicto

      if (error.status === 409) { // Código de estado para conflicto (ej. usuario/email existente)
        this.typeError = 'conflicto';
        this.conflictDetected = true;
        this.swalService.error('Error de Registro', 'Nombre de usuario o correo electrónico ya existe.'); // Notificación de error específico
      } else {
        this.swalService.error('Error de Registro', 'Ocurrió un error inesperado. Por favor, inténtalo de nuevo.'); // Notificación de error general
      }
      console.error('Error durante el registro:', error);
    } finally {
      this.isLoading = false; // ✅ Desactivar estado de carga al finalizar (éxito o error)
    }
  }
}