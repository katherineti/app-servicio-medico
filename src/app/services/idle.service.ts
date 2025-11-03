import { Injectable } from '@angular/core';
import { fromEvent, merge, Subject, Subscription, timer } from 'rxjs';
import { debounceTime, switchMap, startWith } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class IdleService {
  // 5 minutos * 60 segundos/minuto * 1000 ms/segundo
  private readonly IDLE_TIMEOUT_MS = 5 * 60 * 1000; 

  private activityEvents$ = merge(
    fromEvent(document, 'mousemove'), // Movimiento del ratón
    fromEvent(document, 'click'),    // Clics
    fromEvent(document, 'keypress'), // Teclas
    fromEvent(window, 'scroll')      // Scroll
    // Puedes añadir más eventos aquí
  );

  private idleSubscription: Subscription | null = null;
  public onTimeout = new Subject<void>(); // Emitirá cuando se agote el tiempo

  constructor() {
    this.startMonitoring();
  }

  /**
   * Inicia el monitoreo de la actividad del usuario.
   */
  public startMonitoring(): void {
    if (this.idleSubscription) {
      this.idleSubscription.unsubscribe();
    }

    this.idleSubscription = this.activityEvents$.pipe(
      // Evita un 'reset' inmediato si hay muchos eventos seguidos.
      debounceTime(500), 
      // Emite un valor inicial para que el temporizador comience inmediatamente al inicio.
      startWith(null), 
      // Reinicia el temporizador de 5 minutos cada vez que hay actividad.
      // Si el temporizador finaliza, el 'subscribe' se ejecuta.
      switchMap(() => timer(this.IDLE_TIMEOUT_MS))
    ).subscribe(() => {
      // El temporizador terminó sin actividad: ¡El usuario está inactivo!
      this.onTimeout.next(); 
      this.stopMonitoring(); // Detenemos el monitoreo hasta que se reinicie la sesión
    });
  }

  /**
   * Detiene el monitoreo (útil después del logout).
   */
  public stopMonitoring(): void {
    if (this.idleSubscription) {
      this.idleSubscription.unsubscribe();
      this.idleSubscription = null;
    }
  }

  /**
   * Se puede llamar si el usuario interactúa con un diálogo de '¿Sigues ahí?'.
   */
  public resetTimer(): void {
    this.startMonitoring();
  }
}