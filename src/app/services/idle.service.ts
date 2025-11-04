import { Injectable } from '@angular/core';
import { fromEvent, interval, merge, Subject, Subscription, timer } from 'rxjs';
import { debounceTime, switchMap, startWith, takeWhile, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class IdleService {
  // 5 minutos * 60 segundos/minuto * 1000 ms/segundo
  private readonly IDLE_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutos
  // Mantenemos el timeout en milisegundos para la lógica principal
  private readonly IDLE_TIMEOUT_SECONDS = this.IDLE_TIMEOUT_MS / 1000; // 300 segundos

  // Subject para emitir el tiempo restante (en segundos)
  public timeRemaining$ = new Subject<number>(); 
  
  // Subject para el cierre de sesión
  public onTimeout = new Subject<void>();// Emitirá cuando se agote el tiempo

  private activityEvents$ = merge(
    fromEvent(document, 'mousemove'), // Movimiento del ratón
    fromEvent(document, 'click'),    // Clics
    fromEvent(document, 'keypress'), // Teclas
    fromEvent(window, 'scroll')      // Scroll
    // Puedes añadir más eventos aquí
  );

  private idleSubscription: Subscription | null = null;

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
      debounceTime(500), 
      startWith(null), 
      
      // 🎯 NUEVA LÓGICA: Combina el reinicio y el cronómetro.
      switchMap(() => {
        // En cada actividad, iniciamos un nuevo cronómetro inverso
        
        // El operador 'interval(1000)' emite un valor cada 1 segundo.
        return interval(1000).pipe(
          // 'takeWhile' detiene el cronómetro cuando el tiempo restante es 0 o menos.
          takeWhile(count => count <= this.IDLE_TIMEOUT_SECONDS),
          
          // 'tap' se usa para calcular y emitir el tiempo restante en cada tic.
          tap(count => {
            const remaining = this.IDLE_TIMEOUT_SECONDS - count;
            this.timeRemaining$.next(remaining);
            
            // Si remaining es 0, significa que el tiempo se agotó (la emisión de onTimeout
            // se puede manejar aquí o en el subscribe principal, esta es la forma más limpia)
            if (remaining <= 0) {
              this.onTimeout.next();
              this.stopMonitoring();
            }
          })
        );
      })
    ).subscribe(); // El subscribe principal ahora solo necesita activarse para mantener el pipe vivo
    
    console.log(`🟢 Monitoreo iniciado. El contador se muestra en el componente.`);
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