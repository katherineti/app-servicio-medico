import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
// import { TokenAuth } from '../models/token-auth.model';
// import jwt_decode from 'jwt-decode';
import { Router } from '@angular/router';
import { SwalService } from '../../services/swal.service';
import { API_URL } from '../../../../environment';
import { Observable } from 'rxjs';
import { TokenAuth } from '../models/token-auth.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  endPoint = API_URL + 'auth';

  private readonly http= inject(HttpClient)
  private readonly router= inject(Router)
  private readonly swalService= inject(SwalService)

  register(body : any): Observable<any>{
    return this.http.post(
        this.endPoint + '/signup',
        body
    ) as Observable<any>;
}

  signin(email: string, pass: string) {
    return this.http.post<{ token: string }>(this.endPoint + '/signin', {
      email: email,
      password: pass,
    });
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

  // async getPlainToken(): Promise<string> {
  //   if (await this.getToken()) {
  //     if (await this.isAuthenticated()) {
  //       return localStorage.getItem('token') as string;
  //     }
  //   }
  //   await this.logout();
  //   return '';
  // }

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

  async getRol(): Promise<string> {
    const token = await this.getToken();
    if (!token.role) {
      return 'SIN ROL';
    }
    return token.role;
  }

  async isAuthenticated() {
    const token = await this.getToken();
    if (token) {
      // const tokenIsExpirated = this.tokenIsExpirated(token);
      const tokenIsExpirated = false;
      if (tokenIsExpirated) {
        this.clearToken();
        this.swalService.expiredSession();
      }
      return !tokenIsExpirated;
    }
    return false;
  }
/*
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
    const inter = roles.filter((e) => token.roles.includes(e));
    if (inter.length > 0) {
      return true;
    } else {
      return false;
    }
  }
  */
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