import { Component, inject, Signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '../material/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-login',
  imports: [RouterModule, MaterialModule, FormsModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  private _authService = inject(AuthService);
  isLogged!: Signal<boolean | undefined>;
  constructor(){
    this.session()
  }

  session(){
    this._authService.login();
    this.isLogged = toSignal(this._authService.isAuth$);
    console.log("this.isLogged()", this.isLogged())
  }

}