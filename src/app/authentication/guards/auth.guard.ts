import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService, private readonly router: Router) {}

  async canActivate(): Promise<boolean> {

    const isAuth = await this.authService.isAuthenticated();
    console.log("isAuth ?" , isAuth)
    if (!isAuth) {
      await this.router.navigateByUrl('/login');
    }
    return isAuth;
  }
}