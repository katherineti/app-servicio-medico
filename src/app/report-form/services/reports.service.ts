import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TokenService } from '../../services/Token.service';

@Injectable({
  providedIn: 'root',
})

export class ReportsService {
  
  private readonly tokenService = inject(TokenService);
  private readonly http = inject(HttpClient);

  create(dto: any) {
    console.log("dto create" , dto)
    return this.http.post<any>(
      `${this.tokenService.endPoint}auditor-reports`,
      dto
    );
  }
 
  update(id: number, dto: any) {
    return this.http.put<any>(
      `${this.tokenService.endPoint}auditor-reports/${id}`,
      dto
    );
  }

}