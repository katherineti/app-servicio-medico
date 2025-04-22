import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../../environment';
import { Observable } from 'rxjs';
import { LoginResponse, SigInLogin } from '../authentication/models/login.response.model';
import { Admin, SignUpRegisterAdmin } from '../authentication/models/register-admin.reponse.model';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private urlEndPoint = API_URL + 'auth';
  
  constructor(private http: HttpClient) {
  }

  login(body: SigInLogin): Observable<LoginResponse> {

    return this.http.post(
      this.urlEndPoint + '/signin',
      body
    ) as Observable<LoginResponse>;
  }

  register(body : SignUpRegisterAdmin): Observable<Admin>{
    return this.http.post(
        this.urlEndPoint + '/signup',
        body
    ) as Observable<Admin>;
}

}