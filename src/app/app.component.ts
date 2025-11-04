import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgxSonnerToaster, toast } from 'ngx-sonner';
// import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NgxSonnerToaster],
  templateUrl: './app.component.html',
})
export class AppComponent {
  title = 'app';
   // private authService = inject(AuthService) // Inyecta AuthService
  ngOnInit() {
/*     // Suscribirse al evento de sesión a punto de expirar (advertencia previa)
    this.authService.sessionAboutToExpire$.subscribe(() => {console.log("sessionAboutToExpire$")
      toast.warning("Tu sesión expirará pronto.", {
        description: 'Presiona "Extender" para extender el tiempo de sesión.',
        // duration: 10000, // La notificación durará 10 segundos
        duration: 60 * 1000, // La notificación durará 10 segundos
        action: {
          label: "Extender",
          onClick: () => this.authService.extendSession(),
        },
        id: "session-warning-toast", // ID para poder descartarla si es necesario
      })
    })

    // Suscribirse al evento de sesión expirada (período de gracia)
    this.authService.sessionExpiredGracePeriod$.subscribe(() => {
      // Descartar cualquier advertencia previa si aún está activa
      toast.dismiss("session-warning-toast")

      toast.error("Tu sesión ha expirado.", {
        description: 'Tienes 1 minuto para presionar "Extender" o se cerrará la sesión.',
        duration: 60 * 1000, // La notificación durará el período de gracia (1 minuto)
        action: {
          label: "Extender",
          onClick: () => this.authService.extendSession(),
        },
        id: "session-expired-toast", // ID para poder descartarla
        onDismiss: () => {
          console.log("Notificación de sesión expirada cerrada.")
        },
        onAutoClose: () => {
          console.log("Notificación de sesión expirada se cerró automáticamente (sesión forzada a cerrar).")
        },
      })
    }) */
  }
}