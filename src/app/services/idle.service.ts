import { Injectable } from '@angular/core';
import { fromEvent, interval, merge, Subject, Subscription } from 'rxjs';
import { debounceTime, switchMap, startWith, takeWhile, tap } from 'rxjs/operators';
@Injectable({
  providedIn: 'root'
})
export class IdleService {
  private readonly IDLE_TIMEOUT_MS = 5 * 60 * 1000; 
  private readonly IDLE_TIMEOUT_SECONDS = this.IDLE_TIMEOUT_MS / 1000;
  public timeRemaining$ = new Subject<number>(); 
  public onTimeout = new Subject<void>();
  private activityEvents$ = merge(
    fromEvent(document, 'mousemove'), 
    fromEvent(document, 'click'),   
    fromEvent(document, 'keypress'), 
    fromEvent(window, 'scroll')      
  );
  private idleSubscription: Subscription | null = null;
  constructor() {
    this.startMonitoring();
  }
  public startMonitoring(): void {
    if (this.idleSubscription) {
      this.idleSubscription.unsubscribe();
    }

    this.idleSubscription = this.activityEvents$.pipe(
      debounceTime(500), 
      startWith(null), 
      
      switchMap(() => {
        return interval(1000).pipe(
          takeWhile(count => count <= this.IDLE_TIMEOUT_SECONDS),
          tap(count => {
            const remaining = this.IDLE_TIMEOUT_SECONDS - count;
            this.timeRemaining$.next(remaining);
            if (remaining <= 0) {
              this.onTimeout.next();
              this.stopMonitoring();
            }
          })
        );
      })
    ).subscribe(); 
  }
  public stopMonitoring(): void {
    if (this.idleSubscription) {
      this.idleSubscription.unsubscribe();
      this.idleSubscription = null;
    }
  }
  public resetTimer(): void {
    this.startMonitoring();
  }
}