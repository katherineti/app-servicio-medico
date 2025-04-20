import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { AuthGuardService } from './auth-guard.service';
import { inject } from '@angular/core';
import { delay, tap } from 'rxjs';

export const GuardCanActivate: CanActivateFn = (route:ActivatedRouteSnapshot, state:RouterStateSnapshot) => {
  const authGuardService = inject(AuthGuardService);
  const router = inject(Router);
  const errorMessage = 'No puedes acceder a la ruta: ' + state.url + ' si no inicias sesión';

  return authGuardService.isAuth$.pipe(
    delay(500),
    tap( (isAuth:boolean) => {
      if(!isAuth){
        authGuardService.updateErrorMessage(errorMessage);
        return router.navigate(["/login"])
      }
      return isAuth;
    })
  )
};