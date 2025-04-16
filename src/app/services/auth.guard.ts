import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './auth.service';
import { inject } from '@angular/core';
import { delay, tap } from 'rxjs';

export const GuardCanActivate: CanActivateFn = (route:ActivatedRouteSnapshot, state:RouterStateSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const errorMessage = 'No puedes acceder a la ruta: ' + state.url + ' si no inicias sesión';

  return authService.isAuth$.pipe(
    delay(500),
    tap( (isAuth:boolean) => {
      if(!isAuth){
        authService.updateErrorMessage(errorMessage);
        return router.navigate(["/login"])
      }
      return isAuth;
    })
  )
};