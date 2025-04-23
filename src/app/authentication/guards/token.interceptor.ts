import { HttpInterceptorFn } from '@angular/common/http';

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token') as string;

  if(token != null){
    const newRequest = req.clone({
      headers: req.headers.append('Authorization', `Bearer ${token}`)
    })
    return next(newRequest);

  }else{
    return next(req);
  }
};