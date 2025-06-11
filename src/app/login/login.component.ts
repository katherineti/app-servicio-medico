import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { MaterialModule } from '../material/material.module';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
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
          Validators.maxLength(30),
          Validators.pattern(/^[a-zA-Z0-9]*$/),
        ],
      ],
    });;
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