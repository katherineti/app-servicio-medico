import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TokenService } from '../../services/Token.service';
import { IGetAllProducts } from '../interfaces/medical-supplies.interface';
import { IProductExpiredPagination } from '../interfaces/medical-supplies-expired.interface';

@Injectable({
  providedIn: 'root',
})

export class MedicalSuppliesExpiredService {
  
  private readonly tokenService = inject(TokenService);
  private readonly http = inject(HttpClient);
  controller='medical-supplies-expired';
  getProducts(params: IGetAllProducts): Observable<IProductExpiredPagination> {
    return this.http.post<IProductExpiredPagination>(
      `${this.tokenService.endPoint}${this.controller}/getAll`,
      params
    );
  }
  
}