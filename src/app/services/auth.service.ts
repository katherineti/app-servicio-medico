import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TokenAuth } from '../authentication/models/token-auth.model';
import { Router } from '@angular/router';
import { SwalService } from './swal.service';
import { API_URL } from '../../../environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  constructor(
    private readonly router: Router,
    private readonly swalService: SwalService
  ) { }

  async headerToken(): Promise<HttpHeaders> {
    return new HttpHeaders().set(
      'Authorization',
      'Bearer ' + (await this.getPlainToken())
    );
  }

  saveToken(token: string) {
    localStorage.setItem('token', token);
  }

  clearToken() {
    localStorage.removeItem('token');
  }

  async logout() {
    this.clearToken();

    await this.router.navigateByUrl('/login');
  }

  async getPlainToken(): Promise<string> {
    if (await this.getToken()) {
      if (await this.isAuthenticated()) {
        return localStorage.getItem('token') as string;
      }
    }
    await this.logout();
    return '';
  }

  async getToken(): Promise<TokenAuth> {
    if (localStorage.getItem('token')) {
      return this.jwt_decode(localStorage.getItem('token') as string);
    } else {
      await this.logout();
      return null as any;
    }
  }

  getTokenInfo(token: string): TokenAuth {
    if (token) {
      return this.jwt_decode(token);
    } else {
      return null as any;
    }
  }

  async isAuthenticated() {
    const token = await this.getToken();
    if (token) {
      const tokenIsExpirated = this.tokenIsExpirated(token);
      if (tokenIsExpirated) {
        this.clearToken();
        this.swalService.expiredSession();
      }
      return !tokenIsExpirated;
    }
    return false;
  }

  tokenIsExpirated(token: TokenAuth): boolean {
    if (!token) {
      return false;
    }
    if (!token.exp) {
      return false;
    }
    return Number(new Date()) > token.exp * 100000;
  }

  async hasRole(roles: string[]) {
    const token = await this.getToken();
    const inter = roles.filter((e) => token.role.includes(e));
    if (inter.length > 0) {
      return true;
    } else {
      return false;
    }
  }

  getUserInfo(): Observable<TokenAuth> {
    return new Observable((observer) => {
      const token = localStorage.getItem('token');
      if (token) {
        const decodedToken: TokenAuth = this.jwt_decode(token);
        observer.next(decodedToken);
        observer.complete();
      } else {
        observer.error('Token not found');
      }
    });
  }

  async getRol(): Promise<string> {
    const token = await this.getToken();
    if (!token.role) {
      return 'SIN ROL';
    }
    return token.role;
  }

  isAdmin(): boolean | null {
    let isAdmin = null;

    this.getUserInfo().subscribe({
      next: (userInfo: TokenAuth) => {
        try {
          if (userInfo.role === 'admin') {
            isAdmin = true;
          } else {
            isAdmin = false;
          }
        } catch (error) {
          console.error(error);
        }
      },
      error: (error) => {
        console.error('Error al obtener la información:', error);
      },
    });
    return isAdmin;
  }


  jwt_decode(token: string): any | null {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
  
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error al decodificar el token JWT:', error);
      return null;
    }
  }
}