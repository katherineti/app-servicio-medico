import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TokenService } from '../../services/Token.service';
import { ProvidersAll } from '../interfaces/providers.interface';

@Injectable({
  providedIn: 'root',
})

export class ProvidersService {
  
  private readonly tokenService = inject(TokenService);
  private readonly http = inject(HttpClient);
  controller='providers';

  get(): Observable<ProvidersAll> {
    return this.http.get<ProvidersAll>(
      `${this.tokenService.endPoint}${this.controller}`
    );
  }

  create(dto: any) {
    console.log("dto create" , dto)
    return this.http.post<any>(
      `${this.tokenService.endPoint}${this.controller}/create`,
      dto
    );
  }
  
}