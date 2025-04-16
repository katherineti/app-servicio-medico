import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MaterialModule } from '../material/material.module';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

export interface SignUp{
  name: string;
  email: string;
  username: string;
  password: string;
  role: string;
  isActive:boolean;
  // fatherLastName: string;
}
@Component({
  selector: 'app-register',
  imports: [CommonModule,RouterModule,MaterialModule,FormsModule,ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  ADMINISTRADOR: string = "ADMIN";
  registerFormGroup!: FormGroup;
  typeError = '';
  conflictDetected: boolean = false;

  private formBuilder = inject(FormBuilder);
  public router = inject(Router)
  public route = inject(ActivatedRoute)
  
  constructor(){
    this.registerFormGroup = this.formBuilder.group({
      name: ['', [
        Validators.required, 
        Validators.minLength(0), 
        Validators.maxLength(30),
        Validators.pattern(/^[a-zA-ZÀ-ÿ\s]+$/)
      ]],
      email: ['', [
        Validators.required, 
        Validators.email,
        Validators.minLength(3), 
        Validators.maxLength(50),
      ]],
      username: ['', [
        Validators.required, 
        Validators.minLength(0), 
        Validators.maxLength(30),
        Validators.pattern(/^[a-zA-ZÀ-ÿ\s]+$/)
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
    let register: SignUp = {
      name: this.registerFormGroup.value.name,
      email: this.registerFormGroup.value.email,
      username: this.registerFormGroup.value.username,
      password: this.registerFormGroup.value.password,
      role: this.ADMINISTRADOR,
      isActive: true
    };
    console.log("registro:",register)

    if(!this.registerFormGroup.invalid){

      try {
        // await firstValueFrom(this.registerService.register(register));
        this.router.navigate(['./dashboard']);
      } catch (error: any) {
        
        if (error.status === 400) {
          this.typeError = 'campos';
        } else if (error.status === 409) {
          this.typeError = 'conflicto';
          this.conflictDetected = true;
        } else {
          this.typeError = 'server';
        }
      }
    }
  }
}