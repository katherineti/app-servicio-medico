import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { RolesType } from '../interfaces/roles-type.interface';

@Injectable({
  providedIn: 'root'
})

export class AuthGuardService {
  private _isAuthSource$ = new BehaviorSubject<boolean>(false);
  private _errorMessageSource$ = new BehaviorSubject<string>('La ruta no exiaste');

  isAuth$ = this._isAuthSource$.asObservable();
  errorMessage$ = this._errorMessageSource$.asObservable();

  rol: RolesType = 'Admin';

  login() {
    this._isAuthSource$.next(true);
  }

  logout() {
    this._isAuthSource$.next(false);
  }

  updateErrorMessage(errorMessage:string){
    this._errorMessageSource$.next(errorMessage);
  }
}