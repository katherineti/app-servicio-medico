import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_URL } from '../../../environment';
@Injectable({
  providedIn: 'root',
})
export class TokenService {
  endPoint = API_URL;
  headerToken(): HttpHeaders {
    return new HttpHeaders().set('Authorization', 'Bearer ');
  }
}