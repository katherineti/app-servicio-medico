import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MaterialModule } from '../material/material.module';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
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
  // ADMINISTRADOR: string = "admin";
  ADMINISTRADOR = 1;
  registerFormGroup!: FormGroup;
  typeError = '';
  conflictDetected: boolean = false;

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
        // Validators.pattern(/^[a-zA-ZÀ-ÿ\s]+$/)
      ]],
      email: ['', [
        Validators.required, 
        Validators.email,
        Validators.minLength(0), 
        Validators.maxLength(50),
      ]],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(0),
          Validators.maxLength(30),
          Validators.pattern(/^[a-zA-Z0-9]*$/),
        ],
      ],
    });
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