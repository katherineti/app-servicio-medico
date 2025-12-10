import { Injectable, inject } from "@angular/core"
import { Router } from "@angular/router"
import { HttpClient } from "@angular/common/http"
import { Subject} from "rxjs"
import { MatSnackBar } from "@angular/material/snack-bar"
import { TokenService } from "./Token.service"
import { TokenAuth } from "../authentication/models/token-auth.model"
import { SwalService } from "./swal.service"
import { IdleService } from "./idle.service"

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private readonly tokenService = inject(TokenService)
  private readonly http = inject(HttpClient)
  private readonly router = inject(Router)
  private readonly snackBar = inject(MatSnackBar)
  private destroy$ = new Subject<void>()
  private sessionAboutToExpireSubject = new Subject<void>()
  sessionAboutToExpire$ = this.sessionAboutToExpireSubject.asObservable()
  private gracePeriodTimer: any 
  private gracePeriodActive = false 
  private sessionExpiredGracePeriodSubject = new Subject<void>()
  sessionExpiredGracePeriod$ = this.sessionExpiredGracePeriodSubject.asObservable()
  private readonly idleService = inject(IdleService)
  
  constructor( readonly swalService: SwalService) {}

   async getPlainToken(): Promise<string> {
    if (await this.getToken()) {
      if (await this.isAuthenticated()) {
        return localStorage.getItem('token') as string;
      }
    }
    await this.logout();
    return '';
  }

   async isAuthenticated() {
    const token = await this.getToken();
    if (token) {
      const tokenIsExpirated = this.tokenIsExpirated(token);
      if (tokenIsExpirated) {
        this.clearLocalSession();
        this.swalService.expiredSession();
      }
      console.log("tokenIsExpirated ",  tokenIsExpirated)
      return !tokenIsExpirated;
    }
    return false;
  }
  clearLocalSession() {
    localStorage.removeItem('token');
  }
  async logout(): Promise<void> {
    localStorage.removeItem("token")
    this.destroy$.next()
    this.destroy$.complete()
    this.destroy$ = new Subject<void>()
    this.clearGracePeriod()
    this.idleService.stopMonitoring() 
    await this.router.navigateByUrl("/login")
  }
  private jwt_decode(token: string): any | null {
    try {
      const base64Url = token.split(".")[1]
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
      const jsonPayload = decodeURIComponent(
        window
          .atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join(""),
      )
      return JSON.parse(jsonPayload)
    } catch (error) {
      console.error("Error al decodificar el token JWT:", error)
      return null
    }
  }

  private async getDecodedToken(): Promise<TokenAuth | null> {
    const token = await this.getPlainToken() 
    if (!token) {
      return null
    }
    try {
      return this.jwt_decode(token) as TokenAuth
    } catch (error) {
      console.error("Error decoding token:", error)
      return null
    }
  }

  private getTokenExpiration(decodedToken: TokenAuth): Date | null {
    if (decodedToken && decodedToken.exp) {
      return new Date(decodedToken.exp * 1000)
    }
    return null
  }

  private async isTokenAboutToExpire(minutesBefore: number): Promise<boolean> {
    const decodedToken = await this.getDecodedToken()
    if (!decodedToken) {
      return false
    }
    const expirationDate = this.getTokenExpiration(decodedToken)
    if (!expirationDate) {
      return false
    }
    const now = new Date()
    const warningTime = new Date(expirationDate.getTime() - minutesBefore * 60 * 1000)
    return now >= warningTime && now < expirationDate
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
  private clearGracePeriod(): void {
    if (this.gracePeriodTimer) {
      clearTimeout(this.gracePeriodTimer)
      this.gracePeriodTimer = null
    }
    this.gracePeriodActive = false
  }

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
    this.clearGracePeriod() 
  }

  async getRol(): Promise<string> {
    const decodedToken = await this.getDecodedToken()
    return decodedToken?.role || ""
  }
  getTokenInfo(token: string|null): TokenAuth {
    if (token) {
      return this.jwt_decode(token)
    } else {
      return null as any
    }
  }
  async getToken(): Promise<TokenAuth> {
    if (localStorage.getItem('token')) {
      return this.jwt_decode(localStorage.getItem('token') as string);
    } else {
      await this.logout();
      return null as any;
    }
  }


public isLoggedIn(): boolean {
  const token = localStorage.getItem('token');
  
  if (token && token.length > 0) {
      return true;
  }
  
  this.clearLocalSession();
  return false;
}
}