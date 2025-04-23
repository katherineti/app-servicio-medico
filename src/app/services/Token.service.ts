import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_URL } from '../../../environment';

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  endPoint = API_URL;

  // Conexiones
  headerToken(): HttpHeaders {
    return new HttpHeaders().set('Authorization', 'Bearer ');
  }

}