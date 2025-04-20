import { Component, inject, Signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '../material/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthGuardService } from '../services/auth-guard.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-login',
  imports: [RouterModule, MaterialModule, FormsModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  private authGuardService = inject(AuthGuardService);
  isLogged!: Signal<boolean | undefined>;
  constructor(){
    this.session()
  }

  session(){
    this.authGuardService.login();
    this.isLogged = toSignal(this.authGuardService.isAuth$);
    console.log("this.isLogged()", this.isLogged())
  }

}