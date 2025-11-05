// Con estos cambios, tu frontend ignorará el exp del token y el IdleService será el único encargado de decidir cuándo ha pasado la inactividad de 5 minutos para forzar el cierre de sesión.
import { Injectable, inject } from "@angular/core"
import { Router } from "@angular/router"
import { HttpClient } from "@angular/common/http"
import { interval, Subject, takeUntil, firstValueFrom } from "rxjs"
import { MatSnackBar } from "@angular/material/snack-bar"
// import  { TokenAuth } from "../models/token-auth.model"
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

  // Nuevas propiedades para el período de gracia
  private gracePeriodTimer: any // Para almacenar el ID del setTimeout
  private gracePeriodActive = false // Bandera para evitar múltiples notificaciones de gracia

  private sessionExpiredGracePeriodSubject = new Subject<void>()
  sessionExpiredGracePeriod$ = this.sessionExpiredGracePeriodSubject.asObservable()

  private readonly idleService = inject(IdleService)
  
  constructor( readonly swalService: SwalService) {
      // this.startSessionMonitor();
  }

  // Nuevo método síncrono para obtener el token en texto plano de localStorage
   async getPlainToken(): Promise<string> {
    // return localStorage.getItem("token") || ''
    if (await this.getToken()) {
      if (await this.isAuthenticated()) {
        return localStorage.getItem('token') as string;
      }
    }
    await this.logout();
    return '';
  }

/*   async isAuthenticated(): Promise<boolean> {
    const token = this.getPlainToken() // Usa el nuevo método síncrono
    if (!token) {
      return false
    }

    const decodedToken = this.getDecodedToken()
    if (!decodedToken) {
      // Token malformado o no decodificable, forzar logout
      await this.logout()
      return false
    }

    // Si el token ya expiró Y NO estamos en el período de gracia, forzar logout
    if (this.isTokenExpired(decodedToken) && !this.gracePeriodActive) {
      await this.logout()
      console.log("ha expirado la sesion")
      return false
    }

    // Si el token no ha expirado o estamos en el período de gracia, se considera autenticado
    return true
  } */
   async isAuthenticated() {
    const token = await this.getToken();
    if (token) {
      const tokenIsExpirated = this.tokenIsExpirated(token);
      // console.log("tokenIsExpirated? ", tokenIsExpirated)
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
    
    // 🛑 Detener el monitoreo al cerrar sesión
    this.idleService.stopMonitoring() 
    
    await this.router.navigateByUrl("/login")
  }

  // Tu método personalizado para decodificar el token
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

  // Modifica este método para usar tu jwt_decode personalizado y el nuevo getPlainToken
  private async getDecodedToken(): Promise<TokenAuth | null> {
    const token = await this.getPlainToken() // Usa el nuevo método síncrono
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

  // Verifica si el token está a punto de expirar (antes de la expiración real)
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

  // Limpia el temporizador y la bandera del período de gracia
  private clearGracePeriod(): void {
    if (this.gracePeriodTimer) {
      clearTimeout(this.gracePeriodTimer)
      this.gracePeriodTimer = null
    }
    this.gracePeriodActive = false
  }

/*   private startSessionMonitor(): void {
    this.destroy$.next()
    this.destroy$ = new Subject<void>()

    interval(30 * 1000) // Revisa cada 30 segundos
      .pipe(takeUntil(this.destroy$))
      .subscribe(async () => {
        const token = this.getPlainToken()
        if (!token) {
          this.destroy$.next()
          this.clearGracePeriod()
          return
        }

        const decodedToken = await this.getDecodedToken()
        if (!decodedToken) {
          await this.logout()
          return
        }

        const tokenIsExpired = this.tokenIsExpirated(decodedToken)

        if (tokenIsExpired) {
          // console.log("tokenIsExpired")
          if (!this.gracePeriodActive) {
            // El token ha expirado, inicia el período de gracia
            this.gracePeriodActive = true
            this.sessionExpiredGracePeriodSubject.next() // Notifica al AppComponent para mostrar el toast "ha expirado, extender ahora"

            this.gracePeriodTimer = setTimeout(async () => {
              // Si el período de gracia termina y no se extendió, forzar logout
              if (this.gracePeriodActive) {
                // Vuelve a verificar por si se extendió justo antes de este timeout
                await this.logout()
              }
              this.clearGracePeriod()
            }, 60 * 1000) // Período de gracia de 1 minuto
          }
        } else {
          // El token no ha expirado
          this.clearGracePeriod() // Limpia cualquier período de gracia si el token se volvió válido (ej. después de una extensión)

          if (await this.isTokenAboutToExpire(1)) {
            // 2 minutos antes de la expiración real, muestra la advertencia "expirará pronto"
            this.sessionAboutToExpireSubject.next()
          }
        }
      })
  } */

/*   async extendSession(): Promise<void> {
    console.log("Extendiendo sesión...")
    const loadingToast = this.snackBar.open("Extendiendo sesión...", "", {
      duration: undefined,
      horizontalPosition: "center",
      verticalPosition: "bottom",
    })

    try {
      const response = await firstValueFrom(
        this.http.post<{ token: string }>(`${this.tokenService.endPoint}auth/refresh-token`, {}),
      )
      console.log(`${this.tokenService.endPoint}auth/refresh-token` + '  ->token recibido:', response, response.token);
      console.log('payload nuevo:', this.jwt_decode(response.token) )
      localStorage.setItem("token", response.token)
      loadingToast.dismiss()
      this.snackBar.open("Sesión extendida correctamente", "Cerrar", {
        duration: 3000,
/*         horizontalPosition: "end",
        verticalPosition: "top", * /
        horizontalPosition: "center",
        verticalPosition: "bottom",
      })
      this.clearGracePeriod() // Limpia el período de gracia si la extensión es exitosa
      // this.startSessionMonitor() // Reinicia el monitoreo con el nuevo token
    } catch (error: any) {
      loadingToast.dismiss()
      this.snackBar.open(`Error al extender la sesión: ${error.message || "Error desconocido"}`, "Cerrar", {
        duration: 5000,
        horizontalPosition: "end",
        verticalPosition: "top",
        panelClass: ["error-snackbar"],
      })
      console.error("Error extending session:", error)
      await this.logout() // Si falla la extensión, cierra la sesión
    }
  } */

  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
    this.clearGracePeriod() // Asegura que se limpie al destruir el servicio
  }

  async getRol(): Promise<string> {
    const decodedToken = await this.getDecodedToken()
    return decodedToken?.role || ""
  }

  // Este método ahora es una utilidad para decodificar un token dado, no para obtener el token de la sesión actual.
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

/**
 * Verifica si el usuario tiene un token almacenado.
 * ¡La validez de la sesión por tiempo ahora es responsabilidad del IdleService!
 * @returns true si el token existe.
 *  Solo comprueba la existencia del token, ignora el campo 'exp'
 */
public isLoggedIn(): boolean {
  // Simplemente verifica la existencia del token.
  // La decodificación y el check de expiración (exp) ya NO son necesarios aquí.
  const token = localStorage.getItem('token');
  
  if (token && token.length > 0) {
      // Si el token existe, se asume que la sesión es válida hasta que el IdleService lo mate.
      return true;
  }
  
  // Si no hay token, se asume que no está logueado y limpiamos por si acaso.
  this.clearLocalSession();
  return false;
}

  
/** se usaba cuando en el backend se manejaba la expiracion del token. Pero debido a que se deshabilito entonces se utiliza el metodo de arriba
   * Verifica si el usuario tiene un token y si este no ha expirado.
   * @returns true si el token es válido y no ha expirado.
   */
/*   public isLoggedIn(): boolean {
    // const token =  this.getToken();
    const token = localStorage.getItem('token');

    if (!token) {
      return false; // El token no existe
    }

    try {
      // 1. Decodificar el token para obtener sus datos (claims)
      const decodedToken: { exp: number } = this.jwt_decode(token);
      
      // 2. Obtener el tiempo de expiración (exp) y el tiempo actual
      const expirationTime = decodedToken.exp * 1000; // El 'exp' está en segundos, lo convertimos a milisegundos
      const currentTime = new Date().getTime();

      // 3. Comparar: si el tiempo actual es menor que el tiempo de expiración, el token es válido.
      return expirationTime > currentTime;

    } catch (error) {
      // Manejar el caso de un token mal formado o corrupto
      console.error('Error al decodificar el token:', error);
      this.clearLocalSession(); // Limpiar el token malo
      return false;
    }
  } */

}