import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { toast } from 'ngx-sonner';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {

  return next(req).pipe(
    catchError( (error: HttpErrorResponse) => {
      if(error.status === 400){
        toast.error('Bad request');
      } else if(error.status === 500){
        toast.error('Internal error');
      }
      return throwError(() => error.error.message );
    } )
  );
};