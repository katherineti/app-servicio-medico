import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { toast } from 'ngx-sonner';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  const authService = inject(AuthService)

  return next(req).pipe( 
    catchError((error: HttpErrorResponse) => {

    if(error.status === 401){
      authService.logout().catch((error) => {
        toast.error(error);
      });
    }else{
      console.error(error.error.message);
    }
    return throwError(()=>error)
  }) 
 );
};