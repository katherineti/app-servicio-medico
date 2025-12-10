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
@Component({
  selector: "app-login",
  imports: [
    CommonModule, RouterModule, MaterialModule, FormsModule, ReactiveFormsModule, 
  ],
  templateUrl: "./login.component.html",
  styleUrl: "./login.component.scss",
  providers: [LoginService, SwalService]
})
export class LoginComponent {
  public loginFormGroup: FormGroup
  public hidePassword = true;
  public isLoading = false;
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
  passwordValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value
    if (!value) {
      return null
    }
    const errors: ValidationErrors = {}
    if (!/[A-Z]/.test(value)) {
      errors["invalidPassword"] = true
    }
    if (!/[0-9]/.test(value)) {
      errors["invalidPassword"] = true
    }
    if (!/[.*\-%/]/.test(value)) {
      errors["invalidPassword"] = true
    }
    for (let i = 0; i < value.length - 1; i++) {
      const currentChar = value[i].toLowerCase()
      const nextChar = value[i + 1].toLowerCase()
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
    if (this.isLoading || this.loginFormGroup.invalid) {
      return
    }
    this.isLoading = true;
    localStorage.removeItem("token")
    const login: SigInLogin = {
      password: this.loginFormGroup.value.password,
      email: this.loginFormGroup.value.email,
    }
    try {
      const item: LoginResponse = await firstValueFrom(this.loginService.login(login))
      localStorage.setItem("token", item.token)
      await new Promise((resolve) => setTimeout(resolve, 500))
      await this.router.navigate(["/"])
    } catch (e: any) {
      this.swalService.warningEdit("Verifique", e)
    } finally {
      this.isLoading = false;
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