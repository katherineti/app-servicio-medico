import { Component, inject } from "@angular/core"
import { Router, RouterModule } from "@angular/router"
import { MaterialModule } from "../material/material.module"
import {
  type AbstractControl,
  FormBuilder,
  type FormGroup,
  FormsModule,
  ReactiveFormsModule,
  type ValidationErrors,
  Validators,
} from "@angular/forms"
import type { LoginResponse, SigInLogin } from "../authentication/models/login.response.model"
import { firstValueFrom } from "rxjs"
import { SwalService } from "../services/swal.service"
import { LoginService } from "../services/login.service"
import { CommonModule } from "@angular/common"
import { ModalLinksComponent } from '../modal-links/modal-links.component';

@Component({
  selector: "app-login",
  imports: [CommonModule, RouterModule, MaterialModule, FormsModule, ReactiveFormsModule, ModalLinksComponent],
  templateUrl: "./login.component.html",
  styleUrl: "./login.component.scss",
  providers: [LoginService, SwalService],
  
})
export class LoginComponent {
  public loginFormGroup: FormGroup
  public isLoading = false // ✅ Agregada la propiedad isLoading

  private formBuilder = inject(FormBuilder)
  public router = inject(Router)
  public swalService = inject(SwalService)
  public loginService = inject(LoginService)

  constructor() {
    this.loginFormGroup = this.formBuilder.group({
      email: ["", [Validators.required, Validators.email, Validators.maxLength(50)]],
      password: ["", [Validators.required, Validators.minLength(10), Validators.maxLength(16), this.passwordValidator]],
    })
  }

  // Validador personalizado para la contraseña
  passwordValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value

    if (!value) {
      return null
    }

    const errors: ValidationErrors = {}

    // Verificar mayúscula
    if (!/[A-Z]/.test(value)) {
      errors["invalidPassword"] = true
    }

    // Verificar número
    if (!/[0-9]/.test(value)) {
      errors["invalidPassword"] = true
    }

    // Verificar carácter especial (. * - % /)
    if (!/[.*\-%/]/.test(value)) {
      errors["invalidPassword"] = true
    }

    // Verificar que no tenga letras iguales consecutivas
    for (let i = 0; i < value.length - 1; i++) {
      const currentChar = value[i].toLowerCase()
      const nextChar = value[i + 1].toLowerCase()

      // Solo verificar si ambos caracteres son letras
      if (/[a-z]/.test(currentChar) && /[a-z]/.test(nextChar)) {
        if (currentChar === nextChar) {
          errors["invalidPassword"] = true
          break
        }
      }
    }

    return Object.keys(errors).length ? errors : null
  }

  async login() {
    // ✅ Prevenir múltiples clicks si ya está cargando
    if (this.isLoading || this.loginFormGroup.invalid) {
      return
    }

    this.isLoading = true // ✅ Activar estado de carga
    localStorage.removeItem("token")

    const login: SigInLogin = {
      password: this.loginFormGroup.value.password,
      email: this.loginFormGroup.value.email,
    }

    try {
      const item: LoginResponse = await firstValueFrom(this.loginService.login(login))

      localStorage.setItem("token", item.token)

      // ✅ Pequeña pausa para mostrar el estado de éxito
      await new Promise((resolve) => setTimeout(resolve, 500))

      await this.router.navigate(["/"])
    } catch (e: any) {
      this.swalService.warningEdit("Verifique", e)
    } finally {
      this.isLoading = false // ✅ Desactivar estado de carga
    }
  }

  isModalOpen = false;

  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }
}