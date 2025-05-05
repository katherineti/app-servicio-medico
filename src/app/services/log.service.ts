import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../../environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LogService {
  private urlEndPoint = API_URL + 'logs';
  
  constructor(private http: HttpClient) {}

  createLog(action: string): Observable<any> {
    let body = {action: action};
    
    return this.http.post(
      this.urlEndPoint,
      body
    ) as Observable<any>;
  }

}